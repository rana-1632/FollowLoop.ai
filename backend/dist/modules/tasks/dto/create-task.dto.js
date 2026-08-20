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
exports.CreateTaskDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class CreateTaskDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { contactId: { required: true, type: () => String }, suggestedDate: { required: true, type: () => String }, title: { required: false, type: () => String }, aiGeneratedContent: { required: false, type: () => String }, subjectLine: { required: false, type: () => String }, status: { required: false, type: () => Object } };
    }
}
exports.CreateTaskDto = CreateTaskDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'contact-uuid-1234', description: 'Associated contact ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "contactId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-20T10:00:00Z', description: 'Suggested follow-up date' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "suggestedDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Check in regarding technical proposal feedback', description: 'Task title / topic' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Draft content prepared by AI...', description: 'AI generated email content' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "aiGeneratedContent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Following up on our recent meeting', description: 'Subject line' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "subjectLine", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.TaskStatus, default: client_1.TaskStatus.PENDING, description: 'Task execution status' }),
    (0, class_validator_1.IsEnum)(client_1.TaskStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "status", void 0);
//# sourceMappingURL=create-task.dto.js.map