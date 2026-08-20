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
exports.CreateContactDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class CreateContactDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String }, email: { required: false, type: () => String }, company: { required: false, type: () => String }, channel: { required: false, type: () => Object }, lastInteractionDate: { required: false, type: () => String }, currentStage: { required: false, type: () => String }, phone: { required: false, type: () => String }, position: { required: false, type: () => String }, notes: { required: false, type: () => String }, status: { required: false, type: () => String }, nextStep: { required: false, type: () => String }, score: { required: false, type: () => Number } };
    }
}
exports.CreateContactDto = CreateContactDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Sarah Jenkins', description: 'Full contact name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateContactDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'sarah.j@acmecorp.io', description: 'Contact email address' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateContactDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Acme Corp', description: 'Contact organization / company' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateContactDto.prototype, "company", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.Channel, default: client_1.Channel.EMAIL, description: 'Communication channel (EMAIL, LINKEDIN, WHATSAPP)' }),
    (0, class_validator_1.IsEnum)(client_1.Channel),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateContactDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-08-10T14:30:00Z', description: 'Last interaction date' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateContactDto.prototype, "lastInteractionDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'PROSPECT', description: 'Current pipeline stage (e.g. LEAD, PROSPECT, PITCHED, WON, LOST)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateContactDto.prototype, "currentStage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+1-555-019-2831', description: 'Contact phone number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateContactDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'VP of Engineering', description: 'Position or job title' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateContactDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Interested in AI follow-up workflows.', description: 'Notes or conversation summary' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateContactDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'New Lead', description: 'Pipeline status label' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateContactDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Follow-up #1 scheduled', description: 'Next step summary' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateContactDto.prototype, "nextStep", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 85, description: 'Lead score' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateContactDto.prototype, "score", void 0);
//# sourceMappingURL=create-contact.dto.js.map