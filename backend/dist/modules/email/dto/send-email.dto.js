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
exports.SendEmailDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class SendEmailDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { contactId: { required: true, type: () => String }, taskId: { required: false, type: () => String }, subject: { required: true, type: () => String }, bodyContent: { required: true, type: () => String } };
    }
}
exports.SendEmailDto = SendEmailDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'contact-uuid-1234', description: 'Target contact ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendEmailDto.prototype, "contactId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'task-uuid-5678', description: 'Optional associated follow-up task ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendEmailDto.prototype, "taskId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Following up on our SaaStr discussion', description: 'Email subject line' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendEmailDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hi Sarah,\n\nI hope you are doing well...', description: 'Email body text or HTML' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendEmailDto.prototype, "bodyContent", void 0);
//# sourceMappingURL=send-email.dto.js.map