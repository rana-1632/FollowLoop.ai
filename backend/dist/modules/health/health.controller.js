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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const Sentry = require("@sentry/nestjs");
let HealthController = class HealthController {
    getHealth() {
        return {
            status: 'ok',
            service: 'FollowLoop.ai Backend',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    }
    debugSentry() {
        const testError = new Error('FollowLoop.ai Sentry Real-Time Error Audit Verification Test');
        if (process.env.SENTRY_DSN) {
            Sentry.captureException(testError);
        }
        throw new common_1.InternalServerErrorException('FollowLoop.ai Controlled Sentry Audit Test Exception');
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'API Health check ping' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns system operational health status' }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('debug-sentry'),
    (0, swagger_1.ApiOperation)({
        summary: 'Trigger a controlled test error to verify real-time Sentry exception reporting',
        description: 'Intentionally throws a controlled test InternalServerErrorException to verify real-time Sentry error capture.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Controlled test error generated and reported to Sentry dashboard',
    }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "debugSentry", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('Health & Monitoring'),
    (0, common_1.Controller)('health')
], HealthController);
//# sourceMappingURL=health.controller.js.map