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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const email_service_1 = require("./email.service");
const send_email_dto_1 = require("./dto/send-email.dto");
const connect_email_account_dto_1 = require("./dto/connect-email-account.dto");
const inbound_webhook_dto_1 = require("./dto/inbound-webhook.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../../common/decorators/get-user.decorator");
let EmailController = class EmailController {
    constructor(emailService) {
        this.emailService = emailService;
    }
    async sendEmail(userId, dto) {
        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            throw new common_1.UnauthorizedException('Authentication required. Missing or invalid user identity.');
        }
        return this.emailService.sendEmail(userId, dto);
    }
    async getEmailLogs(userId) {
        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            throw new common_1.UnauthorizedException('Authentication required. Missing or invalid user identity.');
        }
        return this.emailService.getEmailLogs(userId);
    }
    async deleteEmailLog(userId, logId) {
        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            throw new common_1.UnauthorizedException('Authentication required.');
        }
        return this.emailService.deleteEmailLog(userId, logId);
    }
    async bulkDeleteEmailLogs(userId, body) {
        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            throw new common_1.UnauthorizedException('Authentication required.');
        }
        return this.emailService.bulkDeleteEmailLogs(userId, body?.logIds);
    }
    async connectEmailAccount(userId, dto) {
        return this.emailService.connectEmailAccount(userId, dto);
    }
    getGoogleAuthUrl(userId) {
        return this.emailService.getGoogleAuthUrl(userId);
    }
    async handleGoogleOAuthCallback(code, stateUserId, res) {
        const redirectUrl = await this.emailService.handleGoogleOAuthCallback(code, stateUserId);
        return res.redirect(redirectUrl);
    }
    getOutlookAuthUrl(userId) {
        return this.emailService.getOutlookAuthUrl(userId);
    }
    async handleOutlookOAuthCallback(code, stateUserId, res) {
        const redirectUrl = await this.emailService.handleOutlookOAuthCallback(code, stateUserId);
        return res.redirect(redirectUrl);
    }
    async getUserEmailAccounts(userId) {
        return this.emailService.getUserEmailAccounts(userId);
    }
    async setDefaultEmailAccount(userId, accountId) {
        return this.emailService.setDefaultEmailAccount(userId, accountId);
    }
    async deleteEmailAccount(userId, accountId) {
        return this.emailService.deleteEmailAccount(userId, accountId);
    }
    async handleInboundWebhook(dto) {
        return this.emailService.handleInboundWebhook(dto);
    }
};
exports.EmailController = EmailController;
__decorate([
    (0, common_1.Post)('send'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Dispatch email via Resend/SMTP and record audit log in EmailLog' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Email dispatched and logged successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Target contact not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, send_email_dto_1.SendEmailDto]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "sendEmail", null);
__decorate([
    (0, common_1.Get)('logs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve complete email dispatch audit logs for current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of email audit logs returned' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "getEmailLogs", null);
__decorate([
    (0, common_1.Delete)('logs/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Delete individual email audit log entry' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "deleteEmailLog", null);
__decorate([
    (0, common_1.Post)('logs/bulk-delete'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk delete selected or all email audit log entries' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "bulkDeleteEmailLogs", null);
__decorate([
    (0, common_1.Post)('accounts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Link user sending email account (SMTP, Resend custom identity, OAuth)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Sending email account connected successfully' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, connect_email_account_dto_1.ConnectEmailAccountDto]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "connectEmailAccount", null);
__decorate([
    (0, common_1.Get)('oauth/google/url'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get Google OAuth 2.0 Consent Authorization URL' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmailController.prototype, "getGoogleAuthUrl", null);
__decorate([
    (0, common_1.Get)('oauth/google/callback'),
    (0, swagger_1.ApiOperation)({ summary: 'Google OAuth 2.0 Authorization Callback Handler' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Query)('state')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "handleGoogleOAuthCallback", null);
__decorate([
    (0, common_1.Get)('oauth/outlook/url'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get Microsoft Outlook OAuth 2.0 Authorization URL' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmailController.prototype, "getOutlookAuthUrl", null);
__decorate([
    (0, common_1.Get)('oauth/outlook/callback'),
    (0, swagger_1.ApiOperation)({ summary: 'Microsoft Outlook OAuth 2.0 Authorization Callback Handler' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Query)('state')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "handleOutlookOAuthCallback", null);
__decorate([
    (0, common_1.Get)('accounts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'List linked sending email accounts for current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of user email accounts returned' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "getUserEmailAccounts", null);
__decorate([
    (0, common_1.Patch)('accounts/:id/default'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Set connected email account as default sender' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "setDefaultEmailAccount", null);
__decorate([
    (0, common_1.Delete)('accounts/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Remove connected sending email account' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "deleteEmailAccount", null);
__decorate([
    (0, common_1.Post)('webhook/inbound'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Public Inbound Email Webhook (Tracks incoming replies & transitions stage to REPLIED)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Inbound email webhook processed successfully' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK, type: Object }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inbound_webhook_dto_1.InboundWebhookDto]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "handleInboundWebhook", null);
exports.EmailController = EmailController = __decorate([
    (0, swagger_1.ApiTags)('Email Dispatch, Connected Accounts & Inbound Webhooks'),
    (0, common_1.Controller)('emails'),
    __metadata("design:paramtypes", [email_service_1.EmailService])
], EmailController);
//# sourceMappingURL=email.controller.js.map