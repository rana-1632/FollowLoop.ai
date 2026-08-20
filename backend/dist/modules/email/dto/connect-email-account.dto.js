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
exports.ConnectEmailAccountDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class ConnectEmailAccountDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { email: { required: true, type: () => String }, displayName: { required: false, type: () => String }, provider: { required: false, type: () => Object }, smtpHost: { required: false, type: () => String }, smtpPort: { required: false, type: () => Number, minimum: 1, maximum: 65535 }, username: { required: false, type: () => String }, password: { required: false, type: () => String }, isDefault: { required: false, type: () => Boolean } };
    }
}
exports.ConnectEmailAccountDto = ConnectEmailAccountDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@company.com', description: 'Sender email address' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConnectEmailAccountDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Mohsin Ali', description: 'Display name for outbound messages' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ConnectEmailAccountDto.prototype, "displayName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'RESEND', enum: client_1.EmailProvider, description: 'Email provider type' }),
    (0, class_validator_1.IsEnum)(client_1.EmailProvider),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ConnectEmailAccountDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'smtp.mailtrap.io', description: 'SMTP Host (required if provider is SMTP)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ConnectEmailAccountDto.prototype, "smtpHost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 587, description: 'SMTP Port' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(65535),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ConnectEmailAccountDto.prototype, "smtpPort", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'smtp_username', description: 'SMTP Username' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ConnectEmailAccountDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'secret_password', description: 'SMTP Password or API token' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ConnectEmailAccountDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, description: 'Flag account as primary default sender' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ConnectEmailAccountDto.prototype, "isDefault", void 0);
//# sourceMappingURL=connect-email-account.dto.js.map