"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DiagnosticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const crypto_util_1 = require("../../common/utils/crypto.util");
let DiagnosticsService = DiagnosticsService_1 = class DiagnosticsService {
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(DiagnosticsService_1.name);
    }
    async checkEmailTransportHealth(userId) {
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
        let status = 'HEALTHY';
        let details = '';
        if (provider === 'GMAIL_OAUTH' && defaultAccount?.encryptedPassword) {
            try {
                const decrypted = JSON.parse((0, crypto_util_1.decryptData)(defaultAccount.encryptedPassword));
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
                    }
                    else {
                        status = 'DEGRADED';
                        details = `Google API returned HTTP ${googleRes.status}. Token refresh may be required.`;
                    }
                }
            }
            catch (err) {
                status = 'UNHEALTHY';
                details = `Failed to validate Google OAuth credentials: ${err.message}`;
            }
        }
        else if (provider === 'OUTLOOK_OAUTH' && defaultAccount?.encryptedPassword) {
            try {
                const decrypted = JSON.parse((0, crypto_util_1.decryptData)(defaultAccount.encryptedPassword));
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
                    }
                    else {
                        status = 'DEGRADED';
                        details = `Microsoft Graph API returned HTTP ${msRes.status}.`;
                    }
                }
            }
            catch (err) {
                status = 'UNHEALTHY';
                details = `Failed to validate Outlook OAuth credentials: ${err.message}`;
            }
        }
        else {
            const resendApiKey = this.configService.get('resend.apiKey') || process.env.RESEND_API_KEY;
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
                }
                else {
                    status = 'DEGRADED';
                    details = 'RESEND_API_KEY unconfigured or placeholder. Simulated local delivery mode active.';
                }
            }
            catch (err) {
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
};
exports.DiagnosticsService = DiagnosticsService;
exports.DiagnosticsService = DiagnosticsService = DiagnosticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], DiagnosticsService);
//# sourceMappingURL=diagnostics.service.js.map