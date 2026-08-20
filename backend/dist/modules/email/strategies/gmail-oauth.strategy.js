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
var GmailOAuthStrategy_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GmailOAuthStrategy = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma.service");
const crypto_util_1 = require("../../../common/utils/crypto.util");
let GmailOAuthStrategy = GmailOAuthStrategy_1 = class GmailOAuthStrategy {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GmailOAuthStrategy_1.name);
    }
    async send(options) {
        try {
            if (!options.emailAccount || !options.emailAccount.encryptedPassword) {
                return {
                    success: false,
                    error: '[ERR_GMAIL_OAUTH_NO_CREDENTIALS] Connected Gmail OAuth account is missing encrypted credentials.',
                };
            }
            const rawDecrypted = (0, crypto_util_1.decryptData)(options.emailAccount.encryptedPassword);
            let authPayload;
            try {
                authPayload = JSON.parse(rawDecrypted);
            }
            catch {
                return {
                    success: false,
                    error: '[ERR_GMAIL_OAUTH_INVALID_TOKEN_JSON] Failed to parse decrypted OAuth auth credentials.',
                };
            }
            let accessToken = authPayload.accessToken;
            const refreshToken = authPayload.refreshToken;
            const expiresAt = authPayload.expiresAt || 0;
            if (!accessToken || Date.now() >= expiresAt - 60000) {
                if (!refreshToken) {
                    return {
                        success: false,
                        error: '[ERR_GMAIL_OAUTH_EXPIRED_NO_REFRESH] Gmail access token expired and no refresh token available.',
                    };
                }
                this.logger.log(`Refreshing expired Google OAuth access token for account "${options.emailAccount.email}"...`);
                const refreshed = await this.refreshGoogleAccessToken(options.emailAccount.id, refreshToken, authPayload);
                if (!refreshed.success || !refreshed.accessToken) {
                    return {
                        success: false,
                        error: `[ERR_GMAIL_TOKEN_REFRESH_FAILED] ${refreshed.error || 'Failed to refresh Google OAuth access token'}`,
                    };
                }
                accessToken = refreshed.accessToken;
            }
            const utf8Subject = `=?utf-8?B?${Buffer.from(options.subject).toString('base64')}?=`;
            const senderHeader = options.senderName
                ? `${options.senderName} <${options.senderEmail}>`
                : options.senderEmail;
            const recipientHeader = options.recipientName
                ? `${options.recipientName} <${options.recipientEmail}>`
                : options.recipientEmail;
            const htmlBody = `<div style="font-family: sans-serif; font-size: 15px; color: #333; line-height: 1.6;">${options.bodyContent.replace(/\n/g, '<br/>')}</div>`;
            const mimeLines = [
                `From: ${senderHeader}`,
                `To: ${recipientHeader}`,
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
                return {
                    success: false,
                    error: `[ERR_GMAIL_API_REJECTED_${response.status}] ${errorDetail}`,
                };
            }
            this.logger.log(`[GMAIL_API_SUCCESS] Google Message ID: ${responseData.id}`);
            return {
                success: true,
                messageId: responseData.id,
            };
        }
        catch (err) {
            this.logger.error(`[GMAIL_API_EXCEPTION] ${err?.message || err}`, err?.stack || '');
            return {
                success: false,
                error: `[ERR_GMAIL_DISPATCH_EXCEPTION] ${err?.message || 'Network error executing Gmail REST API call'}`,
            };
        }
    }
    async refreshGoogleAccessToken(accountId, refreshToken, existingPayload) {
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
            const encryptedPassword = (0, crypto_util_1.encryptData)(JSON.stringify(updatedPayload));
            await this.prisma.emailAccount.update({
                where: { id: accountId },
                data: { encryptedPassword },
            });
            return {
                success: true,
                accessToken: data.access_token,
            };
        }
        catch (err) {
            return {
                success: false,
                error: err?.message || 'Exception during Google OAuth token refresh',
            };
        }
    }
};
exports.GmailOAuthStrategy = GmailOAuthStrategy;
exports.GmailOAuthStrategy = GmailOAuthStrategy = GmailOAuthStrategy_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GmailOAuthStrategy);
//# sourceMappingURL=gmail-oauth.strategy.js.map