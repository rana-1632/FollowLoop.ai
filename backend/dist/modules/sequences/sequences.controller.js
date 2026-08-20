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
exports.SequencesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sequences_service_1 = require("./sequences.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../../common/decorators/get-user.decorator");
let SequencesController = class SequencesController {
    constructor(sequencesService) {
        this.sequencesService = sequencesService;
    }
    async getSequenceLeads(userId, sequenceId) {
        return this.sequencesService.getSequenceLeads(userId, sequenceId);
    }
    async getAllLeads(userId) {
        return this.sequencesService.getSequenceLeads(userId, 'all');
    }
    async stopLead(userId, leadId) {
        return this.sequencesService.stopLeadFollowUps(userId, leadId);
    }
    async stopLeadPost(userId, leadId) {
        return this.sequencesService.stopLeadFollowUps(userId, leadId);
    }
    async resumeLead(userId, leadId) {
        return this.sequencesService.resumeLeadFollowUps(userId, leadId);
    }
};
exports.SequencesController = SequencesController;
__decorate([
    (0, common_1.Get)(':id/leads'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all enrolled leads & step progress for a specific sequence' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Enrolled leads list returned' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SequencesController.prototype, "getSequenceLeads", null);
__decorate([
    (0, common_1.Get)('leads'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all leads across all active sequences' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All sequence leads returned' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SequencesController.prototype, "getAllLeads", null);
__decorate([
    (0, common_1.Patch)('leads/:leadId/stop'),
    (0, swagger_1.ApiOperation)({ summary: 'Manually stop automated follow-ups for a specific lead' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lead sequence stopped successfully' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('leadId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SequencesController.prototype, "stopLead", null);
__decorate([
    (0, common_1.Post)('leads/:leadId/stop'),
    (0, swagger_1.ApiOperation)({ summary: 'Manually stop automated follow-ups (POST alias)' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('leadId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SequencesController.prototype, "stopLeadPost", null);
__decorate([
    (0, common_1.Patch)('leads/:leadId/resume'),
    (0, swagger_1.ApiOperation)({ summary: 'Resume automated follow-ups for a lead' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lead sequence resumed successfully' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('leadId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SequencesController.prototype, "resumeLead", null);
exports.SequencesController = SequencesController = __decorate([
    (0, swagger_1.ApiTags)('Sequences & Automation'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('sequences'),
    __metadata("design:paramtypes", [sequences_service_1.SequencesService])
], SequencesController);
//# sourceMappingURL=sequences.controller.js.map