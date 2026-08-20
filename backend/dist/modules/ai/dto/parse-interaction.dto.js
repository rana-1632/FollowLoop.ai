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
exports.ParseInteractionResponseDto = exports.ParsedInitialDraftDto = exports.ParseInteractionDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class ParseInteractionDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { text: { required: true, type: () => String }, referenceDate: { required: false, type: () => String }, senderName: { required: false, type: () => String } };
    }
}
exports.ParseInteractionDto = ParseInteractionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'I emailed HR at Acme Corp about an internship position on August 8',
        description: 'Raw natural-language interaction text or notes to analyze and parse',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ParseInteractionDto.prototype, "text", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2026-08-12',
        description: 'Optional ISO reference date for relative date extraction (defaults to current date if omitted)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ParseInteractionDto.prototype, "referenceDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Mohsin Ali',
        description: 'Optional sender name for email sign-offs (defaults to current user name if omitted)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ParseInteractionDto.prototype, "senderName", void 0);
class ParsedInitialDraftDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { subject: { required: true, type: () => String }, body: { required: true, type: () => String } };
    }
}
exports.ParsedInitialDraftDto = ParsedInitialDraftDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Following up on Internship Application', description: 'Suggested subject line for follow-up draft' }),
    __metadata("design:type", String)
], ParsedInitialDraftDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hi HR Team,\n\nI hope you are doing well...', description: 'Suggested email or message body draft' }),
    __metadata("design:type", String)
], ParsedInitialDraftDto.prototype, "body", void 0);
class ParseInteractionResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { contactName: { required: true, type: () => String }, company: { required: true, type: () => String, nullable: true }, email: { required: false, type: () => String, nullable: true }, channel: { required: true, type: () => Object }, contextSummary: { required: true, type: () => String }, suggestedDate: { required: true, type: () => String }, initialDraft: { required: true, type: () => require("./parse-interaction.dto").ParsedInitialDraftDto }, isFallback: { required: false, type: () => Boolean }, model: { required: false, type: () => String }, generationEngine: { required: false, type: () => Object } };
    }
}
exports.ParseInteractionResponseDto = ParseInteractionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'HR Department', description: 'Extracted contact or person name' }),
    __metadata("design:type", String)
], ParseInteractionResponseDto.prototype, "contactName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Acme Corp', nullable: true, description: 'Extracted company name' }),
    __metadata("design:type", String)
], ParseInteractionResponseDto.prototype, "company", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ahmed@grandluxe.com', nullable: true, description: 'Extracted email address if present' }),
    __metadata("design:type", String)
], ParseInteractionResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EMAIL', enum: ['EMAIL', 'LINKEDIN', 'WHATSAPP'], description: 'Extracted communication channel' }),
    __metadata("design:type", String)
], ParseInteractionResponseDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Emailed HR regarding an internship opportunity on August 8.', description: 'Structured concise summary of interaction' }),
    __metadata("design:type", String)
], ParseInteractionResponseDto.prototype, "contextSummary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-13', description: 'Recommended smart follow-up date (YYYY-MM-DD format)' }),
    __metadata("design:type", String)
], ParseInteractionResponseDto.prototype, "suggestedDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ParsedInitialDraftDto, description: 'Personalized initial follow-up draft' }),
    __metadata("design:type", ParsedInitialDraftDto)
], ParseInteractionResponseDto.prototype, "initialDraft", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false, description: 'Indicates whether deterministic rule-based fallback was used' }),
    __metadata("design:type", Boolean)
], ParseInteractionResponseDto.prototype, "isFallback", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'llama-3.3-70b-versatile', description: 'AI model identifier or fallback-template' }),
    __metadata("design:type", String)
], ParseInteractionResponseDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'LLM_AI', enum: ['LLM_AI', 'FALLBACK_RULE_ENGINE'], description: 'Engine used for sequence generation' }),
    __metadata("design:type", String)
], ParseInteractionResponseDto.prototype, "generationEngine", void 0);
//# sourceMappingURL=parse-interaction.dto.js.map