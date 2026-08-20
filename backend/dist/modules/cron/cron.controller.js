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
exports.CronController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cron_service_1 = require("./cron.service");
let CronController = class CronController {
    constructor(cronService) {
        this.cronService = cronService;
    }
    async processOverdueFollowUps() {
        return this.cronService.processOverdueFollowUps();
    }
    async triggerManual() {
        return this.cronService.processOverdueFollowUps();
    }
};
exports.CronController = CronController;
__decorate([
    (0, common_1.Post)('process-overdue-followups'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger autonomous scan to auto-generate AI email drafts and dispatch due follow-ups' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Batch process completed successfully' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CronController.prototype, "processOverdueFollowUps", null);
__decorate([
    (0, common_1.Post)('trigger-manual'),
    (0, swagger_1.ApiOperation)({ summary: 'Manual trigger endpoint for on-demand execution of automated follow-up batch processing' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Manual follow-up trigger completed' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CronController.prototype, "triggerManual", null);
exports.CronController = CronController = __decorate([
    (0, swagger_1.ApiTags)('Autonomous Cron & Triggers'),
    (0, common_1.Controller)('cron'),
    __metadata("design:paramtypes", [cron_service_1.CronService])
], CronController);
//# sourceMappingURL=cron.controller.js.map