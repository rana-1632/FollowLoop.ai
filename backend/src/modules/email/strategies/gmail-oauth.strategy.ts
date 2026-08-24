import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { decryptData, encryptData } from '../../../common/utils/crypto.util';
import {
  EmailDispatchOptions,
  EmailDispatchResult,
  EmailTransportStrategy,
} from './email-transport.strategy';

@Injectable()
export class GmailOAuthStrategy implements EmailTransportStrategy {
  private readonly logger = new Logger(GmailOAuthStrategy.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Dispatches outbound email natively via Google Gmail REST API
   */
  async send(options: EmailDispatchOptions): Promise<EmailDispatchResult> {
    try {
      if (!options.emailAccount || !options.emailAccount.encryptedPassword) {
        return {
          success: false,
          error: '[ERR_GMAIL_OAUTH_NO_CREDENTIALS] Connected Gmail OAuth account is missing encrypted credentials.',
        };
      }

      // 1. Decrypt OAuth token payload from database
      const rawDecrypted = decryptData(options.emailAccount.encryptedPassword);
      let authPayload: { accessToken?: string; refreshToken?: string; expiresAt?: number };

      try {
        authPayload = JSON.parse(rawDecrypted);
      } catch {
        return {
          success: false,
          error: '[ERR_GMAIL_OAUTH_INVALID_TOKEN_JSON] Failed to parse decrypted OAuth auth credentials.',
        };
      }

      let accessToken = authPayload.accessToken;
      const refreshToken = authPayload.refreshToken;
      const expiresAt = authPayload.expiresAt || 0;

      // 2. Check token expiration (refresh if expired or within 60s of expiring)
      if (!accessToken || Date.now() >= expiresAt - 60000) {
        if (!refreshToken) {
          return {
            success: false,
            error: '[ERR_GMAIL_OAUTH_EXPIRED_NO_REFRESH] Gmail access token expired and no refresh token available.',
          };
        }

        this.logger.log(`Refreshing expired Google OAuth access token for account "${options.emailAccount.email}"...`);
        const refreshed = await this.refreshGoogleAccessToken(
          options.emailAccount.id,
          refreshToken,
          authPayload,
        );

        if (!refreshed.success || !refreshed.accessToken) {
          return {
            success: false,
            error: `[ERR_GMAIL_TOKEN_REFRESH_FAILED] ${refreshed.error || 'Failed to refresh Google OAuth access token'}`,
          };
        }

        accessToken = refreshed.accessToken;
      }

      // 3. Format email into RFC 2822 MIME message
      const utf8Subject = `=?utf-8?B?${Buffer.from(options.subject).toString('base64')}?=`;
      const senderHeader = options.senderName
        ? `${options.senderName} <${options.senderEmail}>`
        : options.senderEmail;
      const recipientHeader = options.recipientName
        ? `${options.recipientName} <${options.recipientEmail}>`
        : options.recipientEmail;

      const htmlBody = `<div style="font-family: sans-serif; font-size: 15px; color: #333; line-height: 1.6;">${options.bodyContent.replace(
        /\n/g,
        '<br/>',
      )}</div>`;

      const inboundEmail = process.env.RESEND_INBOUND_EMAIL || 'inbound@fleniiielda.resend.app';
      const replyToHeader = `Reply-To: ${inboundEmail}, ${options.senderEmail}`;

      const mimeLines = [
        `From: ${senderHeader}`,
        `To: ${recipientHeader}`,
        replyToHeader,
        `Subject: ${utf8Subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        '',
        htmlBody,
      ];

      const rawMime = mimeLines.join('\r\n');
      const base64UrlEncoded = Buffer.from(rawMime)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      // 4. Execute POST request to Google Gmail REST API
      this.logger.log(`Dispatching email via Gmail API for "${options.senderEmail}" -> "${options.recipientEmail}"`);
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: base64UrlEncoded,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorDetail = responseData?.error?.message || JSON.stringify(responseData);
        this.logger.error(`[GMAIL_API_REJECTED] Code: ${response.status} | Details: ${errorDetail}`);
        
        const friendlyError = response.status === 403
          ? `[ERR_GMAIL_INSUFFICIENT_SCOPES] Google Account missing "Send emails on your behalf" permission. Re-connect Google Gmail in Settings and check all permission boxes.`
          : `[ERR_GMAIL_API_REJECTED_${response.status}] ${errorDetail}`;

        return {
          success: false,
          error: friendlyError,
        };
      }

      this.logger.log(`[GMAIL_API_SUCCESS] Google Message ID: ${responseData.id}`);
      return {
        success: true,
        messageId: responseData.id,
      };
    } catch (err: any) {
      this.logger.error(`[GMAIL_API_EXCEPTION] ${err?.message || err}`, err?.stack || '');
      return {
        success: false,
        error: `[ERR_GMAIL_DISPATCH_EXCEPTION] ${err?.message || 'Network error executing Gmail REST API call'}`,
      };
    }
  }

  /**
   * Refreshes an expired Google OAuth access token using the stored refresh token
   */
  private async refreshGoogleAccessToken(
    accountId: string,
    refreshToken: string,
    existingPayload: any,
  ): Promise<{ success: boolean; accessToken?: string; error?: string }> {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID || '';
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

      const bodyParams = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      });

      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParams.toString(),
      });

      const data = await res.json();

      if (!res.ok || !data.access_token) {
        return {
          success: false,
          error: data.error_description || data.error || 'Failed to exchange refresh token',
        };
      }

      const updatedPayload = {
        ...existingPayload,
        accessToken: data.access_token,
        expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
      };

      const encryptedPassword = encryptData(JSON.stringify(updatedPayload));

      // Persist refreshed credentials to PostgreSQL
      await this.prisma.emailAccount.update({
        where: { id: accountId },
        data: { encryptedPassword },
      });

      return {
        success: true,
        accessToken: data.access_token,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Exception during Google OAuth token refresh',
      };
    }
  }
}
