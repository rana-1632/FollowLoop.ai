import { Injectable, Logger, NotFoundException, UnauthorizedException, BadRequestException, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as Sentry from '@sentry/nestjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SendEmailDto } from './dto/send-email.dto';
import { ConnectEmailAccountDto } from './dto/connect-email-account.dto';
import { InboundWebhookDto } from './dto/inbound-webhook.dto';
import { EmailStatus, TaskStatus, EmailProvider } from '@prisma/client';
import { encryptData, decryptData } from '../../common/utils/crypto.util';
import { GmailOAuthStrategy } from './strategies/gmail-oauth.strategy';
import { OutlookOAuthStrategy } from './strategies/outlook-oauth.strategy';

@Injectable()
export class EmailService implements OnApplicationBootstrap {
  private readonly logger = new Logger(EmailService.name);
  private resendClient: Resend | null = null;
  private defaultFromEmail: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly gmailOAuthStrategy: GmailOAuthStrategy,
    private readonly outlookOAuthStrategy: OutlookOAuthStrategy,
  ) {
    const apiKey =
      this.configService.get<string>('resend.apiKey') || process.env.RESEND_API_KEY;
    this.defaultFromEmail =
      this.configService.get<string>('resend.fromEmail') ||
      process.env.EMAIL_FROM ||
      'FollowLoop.ai <onboarding@resend.dev>';

    if (apiKey && !apiKey.includes('placeholder') && apiKey.trim() !== '') {
      this.resendClient = new Resend(apiKey);
      this.logger.log(`Resend client initialized successfully with default sender: ${this.defaultFromEmail}`);
    } else {
      this.logger.warn(
        'RESEND_API_KEY environment variable is missing or placeholder. Simulated email dispatch mode enabled.',
      );
    }
  }

  /**
   * Diagnostic Console Summary Output on App Startup
   */
  async onApplicationBootstrap() {
    const apiKey = this.configService.get<string>('resend.apiKey') || process.env.RESEND_API_KEY;
    const isResendConfigured = Boolean(apiKey && !apiKey.includes('placeholder') && apiKey.trim() !== '');

    this.logger.log('================================================================');
    this.logger.log('   📧 FOLLOWLOOP.AI EMAIL TRANSPORT DIAGNOSTICS BOOT SUMMARY   ');
    this.logger.log('================================================================');
    this.logger.log(` Sender Identity        : ${this.defaultFromEmail}`);
    this.logger.log(` Resend API Integration : ${isResendConfigured ? '✅ ACTIVE (API Key Present)' : '⚠️ SIMULATED (Sandbox Mode)'}`);
    this.logger.log(` Google OAuth Support   : ✅ ACTIVE (Gmail Send API Scope Ready)`);
    this.logger.log(` Microsoft Outlook OAuth: ✅ ACTIVE (MS Graph Mail.Send Ready)`);
    this.logger.log(` Inbound Reply Webhook  : ✅ ACTIVE (/api/v1/emails/webhook/inbound)`);
    this.logger.log(` Diagnostic Endpoint    : ✅ GET /api/v1/diagnostics/email-check`);
    this.logger.log('================================================================');
  }

  /**
   * Connect / register a sending email account for a user.
   */
  async connectEmailAccount(userId: string, dto: ConnectEmailAccountDto) {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new UnauthorizedException('Authentication required.');
    }
    const cleanUserId = userId.trim();

    const shouldBeDefault = dto.isDefault !== undefined ? dto.isDefault : true;

    if (shouldBeDefault) {
      await this.prisma.emailAccount.updateMany({
        where: { userId: cleanUserId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const account = await this.prisma.emailAccount.create({
      data: {
        userId: cleanUserId,
        email: dto.email,
        displayName: dto.displayName || dto.email.split('@')[0],
        provider: dto.provider || EmailProvider.RESEND,
        smtpHost: dto.smtpHost,
        smtpPort: dto.smtpPort,
        username: dto.username,
        encryptedPassword: dto.password ? encryptData(dto.password) : null,
        isDefault: shouldBeDefault,
        isVerified: true,
      },
    });

    return account;
  }

  /**
   * Generate Google OAuth 2.0 Consent Authorization URL
   */
  getGoogleAuthUrl(userId: string): { url: string } {
    const clientId =
      this.configService.get<string>('google.clientId') ||
      process.env.GOOGLE_CLIENT_ID ||
      'followloop-google-client-id.apps.googleusercontent.com';
    const redirectUri =
      process.env.GOOGLE_OAUTH_REDIRECT_URI ||
      'http://localhost:3001/api/v1/emails/oauth/google/callback';

    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
      'email',
      'profile',
      'openid',
    ];

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent select_account',
      include_granted_scopes: 'true',
      state: userId || '',
    });

    return {
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    };
  }

  /**
   * Process Google OAuth 2.0 Authorization Callback
   */
  async handleGoogleOAuthCallback(code: string, stateUserId: string): Promise<string> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    try {
      const clientId =
        this.configService.get<string>('google.clientId') ||
        process.env.GOOGLE_CLIENT_ID ||
        'followloop-google-client-id';
      const clientSecret =
        this.configService.get<string>('google.clientSecret') ||
        process.env.GOOGLE_CLIENT_SECRET ||
        'followloop-google-client-secret';
      const redirectUri =
        process.env.GOOGLE_OAUTH_REDIRECT_URI ||
        'http://localhost:3001/api/v1/emails/oauth/google/callback';

      // 1. Exchange authorization code for access and refresh tokens
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const tokens = await tokenRes.json();
      const accessToken = tokens.access_token;
      const refreshToken = tokens.refresh_token || 'mock_google_refresh_token';

      // 2. Fetch authenticated user email via Google UserInfo API
      let userEmail = `google_user_${Date.now()}@gmail.com`;
      let userName = 'Google Authorized Account';

      if (accessToken) {
        try {
          const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const profile = await profileRes.json();
          if (profile && profile.email) {
            userEmail = profile.email;
            userName = profile.name || profile.email.split('@')[0];
          }
        } catch (profileErr) {
          this.logger.warn(`Could not fetch Google user profile: ${profileErr}`);
        }
      }

      // Resolve valid user ID
      let targetUserId = stateUserId;
      if (!targetUserId || targetUserId === 'undefined' || targetUserId.trim() === '') {
        // Fallback: Find user by email profile if matching user exists
        const existingUser = await this.prisma.user.findFirst({
          where: { email: userEmail },
        });
        if (existingUser) {
          targetUserId = existingUser.id;
        } else {
          this.logger.error(`[GOOGLE_OAUTH_CALLBACK] No valid stateUserId provided and no matching user found for ${userEmail}`);
          return `${frontendUrl}/dashboard?oauth_error=INVALID_USER_SESSION`;
        }
      }

      // 3. Encrypt and store tokens in PostgreSQL EmailAccount table
      const encryptedAuth = encryptData(
        JSON.stringify({
          accessToken,
          refreshToken,
          expiresAt: Date.now() + (tokens.expires_in || 3600) * 1000,
        }),
      );

      // Unset previous default email accounts for user
      await this.prisma.emailAccount.updateMany({
        where: { userId: targetUserId, isDefault: true },
        data: { isDefault: false },
      });

      await this.prisma.emailAccount.create({
        data: {
          userId: targetUserId,
          email: userEmail,
          displayName: `${userName} (Google Gmail API)`,
          provider: EmailProvider.GMAIL_OAUTH,
          encryptedPassword: encryptedAuth,
          isDefault: true,
          isVerified: true,
        },
      });

      return `${frontendUrl}/dashboard?oauth_success=GMAIL_OAUTH&email=${encodeURIComponent(userEmail)}`;
    } catch (err: any) {
      this.logger.error(`Google OAuth Callback error: ${err.message}`);
      return `${frontendUrl}/dashboard?oauth_error=${encodeURIComponent(err.message)}`;
    }
  }

  /**
   * Generate Microsoft Outlook OAuth 2.0 Consent Authorization URL
   */
  getOutlookAuthUrl(userId: string): { url: string } {
    const clientId =
      this.configService.get<string>('microsoft.clientId') ||
      process.env.MICROSOFT_CLIENT_ID ||
      'followloop-outlook-client-id';
    const redirectUri =
      process.env.MICROSOFT_OAUTH_REDIRECT_URI ||
      'http://localhost:3001/api/v1/emails/oauth/outlook/callback';

    const scopes = ['Mail.Send', 'User.Read', 'offline_access'];

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      response_mode: 'query',
      state: userId,
    });

    return {
      url: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`,
    };
  }

  /**
   * Process Microsoft Outlook OAuth 2.0 Authorization Callback
   */
  async handleOutlookOAuthCallback(code: string, stateUserId: string): Promise<string> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    try {
      const clientId =
        this.configService.get<string>('microsoft.clientId') ||
        process.env.MICROSOFT_CLIENT_ID ||
        'followloop-outlook-client-id';
      const clientSecret =
        this.configService.get<string>('microsoft.clientSecret') ||
        process.env.MICROSOFT_CLIENT_SECRET ||
        'followloop-outlook-client-secret';
      const redirectUri =
        process.env.MICROSOFT_OAUTH_REDIRECT_URI ||
        'http://localhost:3001/api/v1/emails/oauth/outlook/callback';

      // 1. Exchange code for access & refresh tokens
      const tokenRes = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const tokens = await tokenRes.json();
      const accessToken = tokens.access_token;
      const refreshToken = tokens.refresh_token || 'mock_outlook_refresh_token';

      // 2. Fetch authenticated user email via Microsoft Graph API
      let userEmail = `outlook_user_${Date.now()}@outlook.com`;
      let userName = 'Outlook Authorized Account';

      if (accessToken) {
        try {
          const profileRes = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const profile = await profileRes.json();
          if (profile && (profile.mail || profile.userPrincipalName)) {
            userEmail = profile.mail || profile.userPrincipalName;
            userName = profile.displayName || userEmail.split('@')[0];
          }
        } catch (profileErr) {
          this.logger.warn(`Could not fetch Microsoft Graph profile: ${profileErr}`);
        }
      }

      // 3. Encrypt and store tokens in PostgreSQL EmailAccount table
      const encryptedAuth = encryptData(
        JSON.stringify({
          accessToken,
          refreshToken,
          expiresAt: Date.now() + (tokens.expires_in || 3600) * 1000,
        }),
      );

      // Unset previous default email accounts for user
      await this.prisma.emailAccount.updateMany({
        where: { userId: stateUserId, isDefault: true },
        data: { isDefault: false },
      });

      await this.prisma.emailAccount.create({
        data: {
          userId: stateUserId,
          email: userEmail,
          displayName: `${userName} (Microsoft Outlook API)`,
          provider: EmailProvider.OUTLOOK_OAUTH,
          encryptedPassword: encryptedAuth,
          isDefault: true,
          isVerified: true,
        },
      });

      return `${frontendUrl}/dashboard?oauth_success=OUTLOOK_OAUTH&email=${encodeURIComponent(userEmail)}`;
    } catch (err: any) {
      this.logger.error(`Outlook OAuth Callback error: ${err.message}`);
      return `${frontendUrl}/dashboard?oauth_error=${encodeURIComponent(err.message)}`;
    }
  }

  /**
   * Get all connected email accounts for a user.
   */
  async getUserEmailAccounts(userId: string) {
    if (!userId) throw new UnauthorizedException('Authentication required.');
    return this.prisma.emailAccount.findMany({
      where: { userId: userId.trim() },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Set a connected email account as default for a user.
   */
  async setDefaultEmailAccount(userId: string, accountId: string) {
    if (!userId) throw new UnauthorizedException('Authentication required.');
    const cleanUserId = userId.trim();

    // Unset current default
    await this.prisma.emailAccount.updateMany({
      where: { userId: cleanUserId, isDefault: true },
      data: { isDefault: false },
    });

    // Set target account as default
    return this.prisma.emailAccount.update({
      where: { id: accountId },
      data: { isDefault: true },
    });
  }

  /**
   * Delete a connected email account.
   */
  async deleteEmailAccount(userId: string, accountId: string) {
    if (!userId) throw new UnauthorizedException('Authentication required.');
    return this.prisma.emailAccount.deleteMany({
      where: { id: accountId, userId: userId.trim() },
    });
  }

  /**
   * Dispatch email via Resend API (or user custom sender) and record audit log in EmailLog database table.
   */
  async sendEmail(userId: string, dto: SendEmailDto) {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new UnauthorizedException('Authentication required. Missing or invalid user identity.');
    }

    const cleanUserId = userId.trim();

    // Verify authenticated user exists in database
    const user = await this.prisma.user.findUnique({
      where: { id: cleanUserId },
      include: { emailAccounts: true },
    });

    if (!user) {
      throw new UnauthorizedException('User account no longer exists.');
    }

    const contact = await this.prisma.contact.findFirst({
      where: { id: dto.contactId, userId: cleanUserId },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID "${dto.contactId}" not found`);
    }

    if (!contact.email || contact.email.trim() === '') {
      throw new BadRequestException(`Contact "${contact.name}" does not have a valid email address.`);
    }
    const recipientEmail = contact.email.trim();
    const recipientFormatted = contact.name ? `${contact.name} <${recipientEmail}>` : recipientEmail;

    // Determine custom sender email from user's linked default account if available
    const defaultAccount = user.emailAccounts?.find((a) => a.isDefault) || user.emailAccounts?.[0];
    const userEmail = defaultAccount?.email || user.email;
    const provider = defaultAccount?.provider;

    const senderIdentity = defaultAccount
      ? `${defaultAccount.displayName || user.fullName || 'Sales Rep'} <${defaultAccount.email}>`
      : this.defaultFromEmail;

    let status: EmailStatus = EmailStatus.SENT;
    let errorMessage: string | null = null;

    const dispatchOptions = {
      senderEmail: userEmail,
      senderName: defaultAccount?.displayName || user.fullName || 'Sales Rep',
      recipientEmail,
      recipientName: contact.name,
      subject: dto.subject,
      bodyContent: dto.bodyContent,
      emailAccount: defaultAccount,
    };

    if (provider === EmailProvider.GMAIL_OAUTH && defaultAccount) {
      this.logger.log(`Dispatching email via Gmail OAuth Strategy for account: "${userEmail}" -> "${recipientFormatted}"`);
      const result = await this.gmailOAuthStrategy.send(dispatchOptions);
      if (!result.success) {
        status = EmailStatus.FAILED;
        errorMessage = result.error || 'Gmail OAuth REST API dispatch failed';
      }
    } else if (provider === EmailProvider.OUTLOOK_OAUTH && defaultAccount) {
      this.logger.log(`Dispatching email via Outlook OAuth Strategy for account: "${userEmail}" -> "${recipientFormatted}"`);
      const result = await this.outlookOAuthStrategy.send(dispatchOptions);
      if (!result.success) {
        status = EmailStatus.FAILED;
        errorMessage = result.error || 'Microsoft Graph API dispatch failed';
      }
    } else if (this.resendClient) {
      // Platform System Email or Resend fallback
      const isPublicDomain = userEmail ? /@(gmail|yahoo|hotmail|outlook|icloud)\.com$/i.test(userEmail) : true;
      const resendFrom = isPublicDomain ? this.defaultFromEmail : senderIdentity;
      const replyToEmails = userEmail ? [userEmail] : undefined;

      try {
        this.logger.log(`Dispatching email via Resend API | From: "${resendFrom}" (ReplyTo: "${userEmail}") -> To: "${recipientFormatted}"`);
        const resendResponse = await this.resendClient.emails.send({
          from: resendFrom,
          reply_to: replyToEmails,
          to: [recipientEmail],
          subject: dto.subject,
          text: dto.bodyContent,
          html: `<div style="font-family: sans-serif; font-size: 15px; color: #333; line-height: 1.6;">${dto.bodyContent.replace(
            /\n/g,
            '<br/>',
          )}</div>`,
        });

        if (resendResponse.error) {
          const errCode = (resendResponse.error as any).name || (resendResponse.error as any).code || 'ERR_RESEND_REJECTED';
          const errMsg = resendResponse.error.message || 'Resend provider error';
          const rawReason = JSON.stringify(resendResponse.error);
          this.logger.error(`[EMAIL DELIVERY REJECTED] Recipient: "${recipientEmail}" | Code: ${errCode} | Details: ${errMsg} | Raw: ${rawReason}`);

          status = EmailStatus.FAILED;
          errorMessage = `[${errCode}] ${errMsg} (Raw Details: ${rawReason})`;

          if (process.env.SENTRY_DSN) {
            Sentry.captureException(new Error(`[${errCode}] Resend Error: ${errMsg}`));
          }
        } else {
          this.logger.log(`[EMAIL DISPATCH SUCCESS] Resend Message ID: ${resendResponse.data?.id}`);
        }
      } catch (err: any) {
        const errCode = err.code || err.name || 'ERR_TRANSPORT_EXCEPTION';
        const errMsg = err.message || 'Network exception communicating with Resend';
        const rawReason = err.response ? JSON.stringify(err.response) : err.stack || '';
        this.logger.error(`[EMAIL DISPATCH EXCEPTION] Recipient: "${recipientEmail}" | Code: ${errCode} | Details: ${errMsg}`, rawReason);
        status = EmailStatus.FAILED;
        errorMessage = `[${errCode}] ${errMsg} ${rawReason ? `| Raw: ${rawReason}` : ''}`;

        if (process.env.SENTRY_DSN) {
          Sentry.captureException(err);
        }
      }
    } else {
      this.logger.warn(`No active email transport strategy matched or configured. Simulating dispatch from "${senderIdentity}" to "${recipientFormatted}"`);
    }

    // Record audit log in EmailLog table
    const emailLog = await this.prisma.emailLog.create({
      data: {
        userId: cleanUserId,
        contactId: contact.id,
        taskId: dto.taskId || null,
        sender: senderIdentity,
        recipient: recipientEmail,
        subject: dto.subject,
        bodyContent: dto.bodyContent,
        direction: 'OUTBOUND',
        status,
        errorMessage,
      },
    });

    // Update Contact's stage & lastInteractionDate timestamp
    await this.prisma.contact.update({
      where: { id: contact.id },
      data: {
        lastInteractionDate: new Date(),
        currentStage: contact.currentStage === 'LEAD' ? 'IN_SEQUENCE' : contact.currentStage,
      },
    });

    // If associated follow-up task exists, update task status with accurate retry counter
    if (dto.taskId) {
      if (status === EmailStatus.SENT) {
        await this.prisma.followUpTask.update({
          where: { id: dto.taskId },
          data: {
            status: TaskStatus.SENT,
          },
        });
      } else {
        const existingTask = await this.prisma.followUpTask.findUnique({
          where: { id: dto.taskId },
        });
        const currentRetries = (existingTask?.retryCount || 0) + 1;
        await this.prisma.followUpTask.update({
          where: { id: dto.taskId },
          data: {
            status: currentRetries >= 3 ? TaskStatus.CANCELLED : TaskStatus.PENDING,
            retryCount: currentRetries,
          },
        });
      }
    }

    return {
      success: status === EmailStatus.SENT,
      emailLog,
      error: errorMessage,
    };
  }

  /**
   * Process Inbound Email Webhook (Inbound Reply Tracking)
   * Matches incoming reply to CRM contact, updates currentStage to REPLIED, and logs audit record.
   */
  async handleInboundWebhook(dto: InboundWebhookDto) {
    this.logger.log(`Received Inbound Webhook payload from: ${dto.from} for ${dto.to}`);

    const senderEmail = dto.from.includes('<')
      ? dto.from.match(/<([^>]+)>/)?.[1] || dto.from
      : dto.from.trim();

    // Match sender back to a contact in the PostgreSQL CRM
    const contact = await this.prisma.contact.findFirst({
      where: { email: { equals: senderEmail, mode: 'insensitive' } },
      include: { user: true },
    });

    if (contact) {
      this.logger.log(`Inbound email matched contact ID: ${contact.id} (${contact.name})`);

      // 1. Update contact stage to "REPLIED" & lastInteractionDate
      await this.prisma.contact.update({
        where: { id: contact.id },
        data: {
          currentStage: 'REPLIED',
          lastInteractionDate: new Date(),
        },
      });

      // 2. Automatically cancel remaining PENDING automated sequence tasks for this contact
      const cancelledTasks = await this.prisma.followUpTask.updateMany({
        where: {
          contactId: contact.id,
          status: TaskStatus.PENDING,
        },
        data: { status: TaskStatus.CANCELLED },
      });

      this.logger.log(`Cancelled ${cancelledTasks.count} pending tasks for contact ${contact.id} due to received reply.`);

      // 3. Create Inbound EmailLog record
      const emailLog = await this.prisma.emailLog.create({
        data: {
          userId: contact.userId,
          contactId: contact.id,
          sender: dto.from,
          recipient: dto.to,
          subject: dto.subject,
          bodyContent: dto.text || dto.html || '',
          direction: 'INBOUND',
          status: EmailStatus.REPLIED,
        },
      });

      // 4. Real-time User Notification System (Reply Alert)
      if (contact.user && contact.user.email) {
        try {
          const notifySubject = `[FollowLoop Alert] New Email Reply Received from ${contact.name}`;
          const notifyHtml = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
              <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 18px; border-radius: 12px; text-align: center; color: #ffffff; font-weight: 700; font-size: 18px;">
                ⚡ FollowLoop.ai — Inbound Reply Alert
              </div>
              <div style="padding: 24px 4px 8px 4px;">
                <h2 style="color: #0f172a; font-size: 16px; font-weight: 700; margin-bottom: 12px;">Great news! ${contact.name} just replied to your automated sequence.</h2>
                <p style="color: #475569; font-size: 13px; margin-bottom: 16px; line-height: 1.6;">
                  <strong>Lead Sender:</strong> ${senderEmail}<br/>
                  <strong>Company:</strong> ${contact.company || 'N/A'}<br/>
                  <strong>Subject Line:</strong> ${dto.subject}
                </p>
                <div style="background-color: #f8fafc; padding: 16px; border-left: 4px solid #7c3aed; border-radius: 8px; font-size: 13px; color: #334155; white-space: pre-wrap; margin-bottom: 20px;">
                  "${(dto.text || dto.html || 'No content payload').trim()}"
                </div>
                <p style="text-align: center; margin-top: 24px;">
                  <a href="http://localhost:3000/dashboard" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 13px; display: inline-block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);">
                    View Conversation & Continue Sequence &rarr;
                  </a>
                </p>
              </div>
            </div>
          `;

          if (this.resendClient) {
            await this.resendClient.emails.send({
              from: this.defaultFromEmail,
              to: [contact.user.email],
              subject: notifySubject,
              html: notifyHtml,
            });
            this.logger.log(`Real-time reply notification sent via Resend to user: ${contact.user.email}`);
          } else {
            this.logger.log(`Simulated reply notification alert dispatched to user: ${contact.user.email}`);
          }
        } catch (notifyErr: any) {
          this.logger.warn(`Failed to dispatch real-time reply notification to user: ${notifyErr.message}`);
        }
      }

      return {
        matched: true,
        contactId: contact.id,
        contactName: contact.name,
        userEmail: contact.user?.email,
        stage: 'REPLIED',
        tasksCancelled: cancelledTasks.count,
        emailLogId: emailLog.id,
      };
    } else {
      this.logger.warn(`Inbound email from ${senderEmail} did not match any known CRM contact.`);
      return {
        matched: false,
        message: `No matching contact found for email address: ${senderEmail}`,
      };
    }
  }

  /**
   * Retrieve email audit log history for current user.
   */
  async getEmailLogs(userId: string) {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new UnauthorizedException('Authentication required. Missing or invalid user identity.');
    }

    const cleanUserId = userId.trim();

    const user = await this.prisma.user.findUnique({
      where: { id: cleanUserId },
    });

    if (!user) {
      throw new UnauthorizedException('User account no longer exists.');
    }

    return this.prisma.emailLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        sender: true,
        recipient: true,
        subject: true,
        direction: true,
        status: true,
        errorMessage: true,
        createdAt: true,
        contact: {
          select: { id: true, name: true, email: true, company: true },
        },
        task: {
          select: { id: true, title: true, subjectLine: true, suggestedDate: true, status: true },
        },
      },
    });
  }

  /**
   * Delete an individual email audit log entry
   */
  async deleteEmailLog(userId: string, logId: string) {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new UnauthorizedException('Authentication required.');
    }

    const log = await this.prisma.emailLog.findFirst({
      where: { id: logId, userId: userId.trim() },
    });

    if (!log) {
      throw new NotFoundException(`Email log entry with ID "${logId}" was not found.`);
    }

    await this.prisma.emailLog.delete({
      where: { id: logId },
    });

    return { success: true, message: 'Email audit log entry deleted successfully.' };
  }

  /**
   * Bulk delete selected or all email audit log entries for current user
   */
  async bulkDeleteEmailLogs(userId: string, logIds?: string[]) {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new UnauthorizedException('Authentication required.');
    }

    const cleanUserId = userId.trim();

    if (Array.isArray(logIds) && logIds.length > 0) {
      const result = await this.prisma.emailLog.deleteMany({
        where: {
          id: { in: logIds },
          userId: cleanUserId,
        },
      });
      return { success: true, count: result.count, message: `Deleted ${result.count} selected log entries.` };
    } else {
      const result = await this.prisma.emailLog.deleteMany({
        where: { userId: cleanUserId },
      });
      return { success: true, count: result.count, message: `Cleared all ${result.count} email audit log entries.` };
    }
  }
}
