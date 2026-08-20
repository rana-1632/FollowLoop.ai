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
exports.GenerateEmailResponseDto = exports.GenerateEmailDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class GenerateEmailDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { contactId: { required: true, type: () => String }, purpose: { required: false, type: () => String }, tone: { required: false, type: () => String }, customContext: { required: false, type: () => String } };
    }
}
exports.GenerateEmailDto = GenerateEmailDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'contact-uuid-1234', description: 'Target contact ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GenerateEmailDto.prototype, "contactId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Friendly check-in after proposal sent 5 days ago.',
        description: 'Goal or purpose of follow-up email',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateEmailDto.prototype, "purpose", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Professional, consultative, warm',
        description: 'Desired email tone (e.g. Professional, Casual, Urgent, Warm)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateEmailDto.prototype, "tone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Special offer valid until Friday.',
        description: 'Additional custom context or highlights to mention',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateEmailDto.prototype, "customContext", void 0);
class GenerateEmailResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { subject: { required: true, type: () => String }, body: { required: true, type: () => String }, model: { required: true, type: () => String }, contactId: { required: false, type: () => String }, isFallback: { required: false, type: () => Boolean }, generationEngine: { required: false, type: () => Object } };
    }
}
exports.GenerateEmailResponseDto = GenerateEmailResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Re: Quick check-in regarding product demo',
        description: 'Generated subject line for the follow-up email',
    }),
    __metadata("design:type", String)
], GenerateEmailResponseDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Hi Alex,\n\nI hope you are having a productive week...',
        description: 'Generated body text for the follow-up email',
    }),
    __metadata("design:type", String)
], GenerateEmailResponseDto.prototype, "body", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'gpt-4o-mini', description: 'AI model used for draft generation' }),
    __metadata("design:type", String)
], GenerateEmailResponseDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'contact-uuid-1234', description: 'Target contact ID if applicable' }),
    __metadata("design:type", String)
], GenerateEmailResponseDto.prototype, "contactId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, description: 'Indicates whether fallback template was used' }),
    __metadata("design:type", Boolean)
], GenerateEmailResponseDto.prototype, "isFallback", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'LLM_AI', enum: ['LLM_AI', 'FALLBACK_RULE_ENGINE'], description: 'Engine used for generation' }),
    __metadata("design:type", String)
], GenerateEmailResponseDto.prototype, "generationEngine", void 0);
//# sourceMappingURL=generate-email.dto.js.map