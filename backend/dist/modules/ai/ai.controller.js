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
exports.AiController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ai_service_1 = require("./ai.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../../common/decorators/get-user.decorator");
let AiController = class AiController {
    constructor(aiService) {
        this.aiService = aiService;
    }
    async parseInteraction(dto) {
        return this.aiService.parseInteraction(dto);
    }
    async generateFollowUpSequence(userId, dto) {
        return this.aiService.generateFollowUpSequence(userId, dto);
    }
    async generatePostReplySequence(userId, dto) {
        return this.aiService.generatePostReplySequence(userId, dto);
    }
    async generateEmailDraft(userId, dto) {
        return this.aiService.generateEmailDraft(userId, dto);
    }
    async generateAndSaveForTask(userId, taskId) {
        return this.aiService.generateAndSaveForTask(userId, taskId);
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('parse-interaction'),
    (0, swagger_1.ApiOperation)({
        summary: 'Parse natural-language interaction text into CRM metadata and initial follow-up draft',
        description: 'Analyzes unstructured text (e.g. "I emailed HR about an internship on August 8") to extract contact name, company, channel, interaction summary, smart suggested follow-up date, and a personalized initial draft.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Extracted contactName, company, channel, contextSummary, suggestedDate, and initialDraft',
        type: dto_1.ParseInteractionResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Validation error on input text' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Missing or invalid JWT token' }),
    openapi.ApiResponse({ status: 201, type: require("./dto/parse-interaction.dto").ParseInteractionResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ParseInteractionDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "parseInteraction", null);
__decorate([
    (0, common_1.Post)('generate-sequence'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate 2-step follow-up sequence variations (Sequence 1 & Sequence 2) for silent or non-responsive leads',
        description: 'Creates a multi-step re-engagement sequence. Sequence 1 (Gentle Bump) and Sequence 2 (Value-Add / Soft Break-Up) when a contact has ignored a previous message.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Multi-step follow-up sequence variations generated successfully',
        type: dto_1.GenerateSequenceResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Missing or invalid JWT token' }),
    openapi.ApiResponse({ status: 201, type: require("./dto/generate-sequence.dto").GenerateSequenceResponseDto }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.GenerateSequenceDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generateFollowUpSequence", null);
__decorate([
    (0, common_1.Post)('post-reply-sequence'),
    (0, swagger_1.ApiOperation)({
        summary: 'Analyze customer reply sentiment and generate post-reply continuation sequence',
        description: 'Analyzes incoming email reply text, identifies customer sentiment, and generates tailored post-reply follow-up steps.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Post-reply continuation sequence generated' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.PostReplySequenceDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generatePostReplySequence", null);
__decorate([
    (0, common_1.Post)('generate-email'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate custom AI follow-up email draft using gpt-4o-mini',
        description: 'Generates a tailored email subject line and body draft for a specific contact and purpose.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Generated email subject line and body content returned',
        type: dto_1.GenerateEmailResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Contact not found' }),
    openapi.ApiResponse({ status: 201, type: require("./dto/generate-email.dto").GenerateEmailResponseDto }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.GenerateEmailDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generateEmailDraft", null);
__decorate([
    (0, common_1.Post)('tasks/:taskId/generate'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate AI email draft and automatically attach to a FollowUpTask',
        description: 'Generates follow-up subject and body content and updates the specified FollowUpTask record.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Task updated with generated subject and draft' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Task not found' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generateAndSaveForTask", null);
exports.AiController = AiController = __decorate([
    (0, swagger_1.ApiTags)('AI Email Generation'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiController);
//# sourceMappingURL=ai.controller.js.map