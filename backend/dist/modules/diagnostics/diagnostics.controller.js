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
exports.DiagnosticsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const diagnostics_service_1 = require("./diagnostics.service");
let DiagnosticsController = class DiagnosticsController {
    constructor(diagnosticsService) {
        this.diagnosticsService = diagnosticsService;
    }
    async checkEmailHealth(req) {
        const userId = req.user?.id || req.user?.userId;
        return this.diagnosticsService.checkEmailTransportHealth(userId);
    }
};
exports.DiagnosticsController = DiagnosticsController;
__decorate([
    (0, common_1.Get)('email-check'),
    (0, swagger_1.ApiOperation)({
        summary: 'Email Transport Diagnostics & Health Verification Endpoint',
        description: 'Programmatically checks the health of the active email transport layer (Google OAuth, Outlook OAuth, Resend, or SMTP), verifies token validity, and tests provider API network connectivity latency.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns real-time transport health, OAuth token status, and network latency diagnostics',
    }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DiagnosticsController.prototype, "checkEmailHealth", null);
exports.DiagnosticsController = DiagnosticsController = __decorate([
    (0, swagger_1.ApiTags)('Diagnostics & Verification'),
    (0, common_1.Controller)('diagnostics'),
    __metadata("design:paramtypes", [diagnostics_service_1.DiagnosticsService])
], DiagnosticsController);
//# sourceMappingURL=diagnostics.controller.js.map