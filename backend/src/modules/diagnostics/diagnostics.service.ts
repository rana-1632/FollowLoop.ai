import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { decryptData } from '../../common/utils/crypto.util';

export interface EmailDiagnosticsResult {
  timestamp: string;
  transport: string;
  activeAccount: {
    email: string;
    provider: string;
    isVerified: boolean;
    isDefault: boolean;
  };
  oauthStatus: {
    tokenPresent: boolean;
    tokenValid: boolean;
    expiresInSeconds: number;
    profileFetchable: boolean;
  };
  connectivity: {
    providerApiReachable: boolean;
    latencyMs: number;
  };
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  details: string;
  diagnosticsExecutionTimeMs: number;
}

@Injectable()
export class DiagnosticsService {
  private readonly logger = new Logger(DiagnosticsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Diagnostic Verification routine checking the health of the active email transport layer.
   */
  async checkEmailTransportHealth(userId?: string): Promise<EmailDiagnosticsResult> {
    const startTime = Date.now();
    let targetUserId = userId;

    if (!targetUserId) {
      const firstUser = await this.prisma.user.findFirst({ select: { id: true } });
      targetUserId = firstUser?.id;
    }

    let defaultAccount = null;
    if (targetUserId) {
      defaultAccount = await this.prisma.emailAccount.findFirst({
        where: { userId: targetUserId, isDefault: true },
      });
      if (!defaultAccount) {
        defaultAccount = await this.prisma.emailAccount.findFirst({
          where: { userId: targetUserId },
        });
      }
    }

    const provider = defaultAccount?.provider || 'RESEND';
    const email = defaultAccount?.email || process.env.EMAIL_FROM || 'onboarding@resend.dev';

    let oauthStatus = {
      tokenPresent: false,
      tokenValid: false,
      expiresInSeconds: 0,
      profileFetchable: false,
    };

    let connectivity = {
      providerApiReachable: false,
      latencyMs: 0,
    };

    let status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' = 'HEALTHY';
    let details = '';

    if (provider === 'GMAIL_OAUTH' && defaultAccount?.encryptedPassword) {
      try {
        const decrypted = JSON.parse(decryptData(defaultAccount.encryptedPassword));
        oauthStatus.tokenPresent = true;
        const now = Date.now();
        const expiresAt = decrypted.expiresAt || 0;

        if (expiresAt > now) {
          oauthStatus.tokenValid = true;
          oauthStatus.expiresInSeconds = Math.floor((expiresAt - now) / 1000);
        }

        if (decrypted.accessToken) {
          const pingStart = Date.now();
          const googleRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${decrypted.accessToken}` },
          });
          connectivity.latencyMs = Date.now() - pingStart;

          if (googleRes.ok) {
            oauthStatus.profileFetchable = true;
            connectivity.providerApiReachable = true;
            status = 'HEALTHY';
            details = 'Google OAuth token active and Gmail API responding efficiently.';
          } else {
            status = 'DEGRADED';
            details = `Google API returned HTTP ${googleRes.status}. Token refresh may be required.`;
          }
        }
      } catch (err: any) {
        status = 'UNHEALTHY';
        details = `Failed to validate Google OAuth credentials: ${err.message}`;
      }
    } else if (provider === 'OUTLOOK_OAUTH' && defaultAccount?.encryptedPassword) {
      try {
        const decrypted = JSON.parse(decryptData(defaultAccount.encryptedPassword));
        oauthStatus.tokenPresent = true;
        const now = Date.now();
        const expiresAt = decrypted.expiresAt || 0;

        if (expiresAt > now) {
          oauthStatus.tokenValid = true;
          oauthStatus.expiresInSeconds = Math.floor((expiresAt - now) / 1000);
        }

        if (decrypted.accessToken) {
          const pingStart = Date.now();
          const msRes = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: { Authorization: `Bearer ${decrypted.accessToken}` },
          });
          connectivity.latencyMs = Date.now() - pingStart;

          if (msRes.ok) {
            oauthStatus.profileFetchable = true;
            connectivity.providerApiReachable = true;
            status = 'HEALTHY';
            details = 'Microsoft Outlook OAuth token active and Microsoft Graph API responding.';
          } else {
            status = 'DEGRADED';
            details = `Microsoft Graph API returned HTTP ${msRes.status}.`;
          }
        }
      } catch (err: any) {
        status = 'UNHEALTHY';
        details = `Failed to validate Outlook OAuth credentials: ${err.message}`;
      }
    } else {
      // RESEND / SMTP Transport Diagnostic Ping
      const resendApiKey = this.configService.get<string>('resend.apiKey') || process.env.RESEND_API_KEY;
      const isConfigured = Boolean(resendApiKey && !resendApiKey.includes('placeholder') && resendApiKey.trim() !== '');

      const pingStart = Date.now();
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'GET',
          headers: { Authorization: `Bearer ${resendApiKey || 'test'}` },
        });
        connectivity.latencyMs = Date.now() - pingStart;
        connectivity.providerApiReachable = true;

        if (isConfigured) {
          status = 'HEALTHY';
          details = 'Resend API transport active and network reachable.';
        } else {
          status = 'DEGRADED';
          details = 'RESEND_API_KEY unconfigured or placeholder. Simulated local delivery mode active.';
        }
      } catch (err: any) {
        connectivity.latencyMs = Date.now() - pingStart;
        connectivity.providerApiReachable = false;
        status = isConfigured ? 'UNHEALTHY' : 'DEGRADED';
        details = `Provider API network connectivity check failed: ${err.message}`;
      }
    }

    return {
      timestamp: new Date().toISOString(),
      transport: provider,
      activeAccount: {
        email,
        provider,
        isVerified: defaultAccount?.isVerified ?? true,
        isDefault: defaultAccount?.isDefault ?? true,
      },
      oauthStatus,
      connectivity,
      status,
      details,
      diagnosticsExecutionTimeMs: Date.now() - startTime,
    };
  }
}
