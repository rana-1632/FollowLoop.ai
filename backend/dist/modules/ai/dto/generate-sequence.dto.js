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
exports.GenerateSequenceResponseDto = exports.SequenceVariationStepDto = exports.GenerateSequenceDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class GenerateSequenceDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { contactId: { required: false, type: () => String }, previousMessage: { required: false, type: () => String }, channel: { required: false, type: () => Object }, tone: { required: false, type: () => String }, ignoredDays: { required: false, type: () => Number } };
    }
}
exports.GenerateSequenceDto = GenerateSequenceDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'contact-uuid-1234',
        description: 'Target contact ID to retrieve stored pipeline context and background notes',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateSequenceDto.prototype, "contactId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Hi Alex, sending over our SaaS product demo proposal for review.',
        description: 'Content or context of the previous message that went unanswered',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateSequenceDto.prototype, "previousMessage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: ['EMAIL', 'LINKEDIN', 'WHATSAPP'],
        default: 'EMAIL',
        description: 'Communication channel for follow-up sequence variations',
    }),
    (0, class_validator_1.IsEnum)(client_1.Channel),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateSequenceDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Polite, value-oriented, professional persistence',
        description: 'Desired tone or style for the sequence variations',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateSequenceDto.prototype, "tone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 5,
        description: 'Number of days elapsed since the initial unanswered outreach',
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GenerateSequenceDto.prototype, "ignoredDays", void 0);
class SequenceVariationStepDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { step: { required: true, type: () => Number }, name: { required: true, type: () => String }, recommendedDelayDays: { required: true, type: () => Number }, subject: { required: true, type: () => String }, body: { required: true, type: () => String } };
    }
}
exports.SequenceVariationStepDto = SequenceVariationStepDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Step sequence index (1 for gentle bump, 2 for value-add/break-up)' }),
    __metadata("design:type", Number)
], SequenceVariationStepDto.prototype, "step", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Gentle Bump', description: 'Descriptive title for sequence strategy' }),
    __metadata("design:type", String)
], SequenceVariationStepDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3, description: 'Recommended delay in days after previous step' }),
    __metadata("design:type", Number)
], SequenceVariationStepDto.prototype, "recommendedDelayDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Re: Quick check-in on proposal', description: 'Generated subject line' }),
    __metadata("design:type", String)
], SequenceVariationStepDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hi Alex,\n\nJust bumping this up to see if you had a chance to review...', description: 'Generated message body content' }),
    __metadata("design:type", String)
], SequenceVariationStepDto.prototype, "body", void 0);
class GenerateSequenceResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { sequence1: { required: true, type: () => require("./generate-sequence.dto").SequenceVariationStepDto }, sequence2: { required: true, type: () => require("./generate-sequence.dto").SequenceVariationStepDto }, model: { required: true, type: () => String }, isFallback: { required: false, type: () => Boolean }, generationEngine: { required: false, type: () => Object } };
    }
}
exports.GenerateSequenceResponseDto = GenerateSequenceResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: SequenceVariationStepDto, description: 'Sequence 1: Gentle check-in / polite bump (3-5 days after silence)' }),
    __metadata("design:type", SequenceVariationStepDto)
], GenerateSequenceResponseDto.prototype, "sequence1", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: SequenceVariationStepDto, description: 'Sequence 2: Value-add & final call-to-action / soft break-up (7-10 days after silence)' }),
    __metadata("design:type", SequenceVariationStepDto)
], GenerateSequenceResponseDto.prototype, "sequence2", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'gpt-4o-mini', description: 'AI model used for generation' }),
    __metadata("design:type", String)
], GenerateSequenceResponseDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false, description: 'Indicates whether fallback template was used' }),
    __metadata("design:type", Boolean)
], GenerateSequenceResponseDto.prototype, "isFallback", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'LLM_AI', enum: ['LLM_AI', 'FALLBACK_RULE_ENGINE'], description: 'Engine used for generation' }),
    __metadata("design:type", String)
], GenerateSequenceResponseDto.prototype, "generationEngine", void 0);
//# sourceMappingURL=generate-sequence.dto.js.map