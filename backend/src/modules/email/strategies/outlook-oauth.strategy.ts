import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { decryptData, encryptData } from '../../../common/utils/crypto.util';
import {
  EmailDispatchOptions,
  EmailDispatchResult,
  EmailTransportStrategy,
} from './email-transport.strategy';

@Injectable()
export class OutlookOAuthStrategy implements EmailTransportStrategy {
  private readonly logger = new Logger(OutlookOAuthStrategy.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Dispatches outbound email natively via Microsoft Graph REST API
   */
  async send(options: EmailDispatchOptions): Promise<EmailDispatchResult> {
    try {
      if (!options.emailAccount || !options.emailAccount.encryptedPassword) {
        return {
          success: false,
          error: '[ERR_OUTLOOK_OAUTH_NO_CREDENTIALS] Connected Outlook OAuth account is missing encrypted credentials.',
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
          error: '[ERR_OUTLOOK_OAUTH_INVALID_TOKEN_JSON] Failed to parse decrypted Outlook OAuth credentials.',
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
            error: '[ERR_OUTLOOK_OAUTH_EXPIRED_NO_REFRESH] Outlook access token expired and no refresh token available.',
          };
        }

        this.logger.log(`Refreshing expired Microsoft Outlook OAuth access token for account "${options.emailAccount.email}"...`);
        const refreshed = await this.refreshOutlookAccessToken(
          options.emailAccount.id,
          refreshToken,
          authPayload,
        );

        if (!refreshed.success || !refreshed.accessToken) {
          return {
            success: false,
            error: `[ERR_OUTLOOK_TOKEN_REFRESH_FAILED] ${refreshed.error || 'Failed to refresh Outlook OAuth access token'}`,
          };
        }

        accessToken = refreshed.accessToken;
      }

      // 3. Construct Microsoft Graph sendMail payload
      const htmlBody = `<div style="font-family: sans-serif; font-size: 15px; color: #333; line-height: 1.6;">${options.bodyContent.replace(
        /\n/g,
        '<br/>',
      )}</div>`;

      const graphPayload = {
        message: {
          subject: options.subject,
          body: {
            contentType: 'HTML',
            content: htmlBody,
          },
          toRecipients: [
            {
              emailAddress: {
                address: options.recipientEmail,
                name: options.recipientName || options.recipientEmail,
              },
            },
          ],
        },
        saveToSentItems: 'true',
      };

      // 4. Execute POST request to Microsoft Graph API
      this.logger.log(`Dispatching email via Microsoft Graph API for "${options.senderEmail}" -> "${options.recipientEmail}"`);
      const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(graphPayload),
      });

      if (!response.ok) {
        const responseData = await response.json().catch(() => ({}));
        const errorDetail = responseData?.error?.message || JSON.stringify(responseData);
        this.logger.error(`[OUTLOOK_API_REJECTED] Code: ${response.status} | Details: ${errorDetail}`);
        return {
          success: false,
          error: `[ERR_OUTLOOK_API_REJECTED_${response.status}] ${errorDetail}`,
        };
      }

      this.logger.log(`[OUTLOOK_API_SUCCESS] Email dispatched via Microsoft Graph for ${options.recipientEmail}`);
      return {
        success: true,
        messageId: `outlook_graph_${Date.now()}`,
      };
    } catch (err: any) {
      this.logger.error(`[OUTLOOK_API_EXCEPTION] ${err?.message || err}`, err?.stack || '');
      return {
        success: false,
        error: `[ERR_OUTLOOK_DISPATCH_EXCEPTION] ${err?.message || 'Network error executing Microsoft Graph API call'}`,
      };
    }
  }

  /**
   * Refreshes an expired Microsoft OAuth access token using the stored refresh token
   */
  private async refreshOutlookAccessToken(
    accountId: string,
    refreshToken: string,
    existingPayload: any,
  ): Promise<{ success: boolean; accessToken?: string; error?: string }> {
    try {
      const clientId = process.env.AZURE_CLIENT_ID || process.env.OUTLOOK_CLIENT_ID || '';
      const clientSecret = process.env.AZURE_CLIENT_SECRET || process.env.OUTLOOK_CLIENT_SECRET || '';

      const bodyParams = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        scope: 'https://graph.microsoft.com/Mail.Send offline_access User.Read',
      });

      const res = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
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
          error: data.error_description || data.error || 'Failed to exchange Outlook refresh token',
        };
      }

      const updatedPayload = {
        ...existingPayload,
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
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
        error: err?.message || 'Exception during Microsoft OAuth token refresh',
      };
    }
  }
}
