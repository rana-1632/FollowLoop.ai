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
exports.InboundWebhookDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class InboundWebhookDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { from: { required: true, type: () => String }, to: { required: true, type: () => String }, subject: { required: true, type: () => String }, text: { required: false, type: () => String }, html: { required: false, type: () => String }, messageId: { required: false, type: () => String } };
    }
}
exports.InboundWebhookDto = InboundWebhookDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'sarah@company.com', description: 'Sender email address of incoming reply' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InboundWebhookDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@followloop.ai', description: 'Recipient email address (user or domain inbound address)' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InboundWebhookDto.prototype, "to", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Re: Venue Booking Quotation', description: 'Subject line of incoming reply' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InboundWebhookDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Hi! Yes, we would love to schedule the walkthrough next Tuesday.', description: 'Body text of incoming reply' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], InboundWebhookDto.prototype, "text", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '<p>Hi! Yes...</p>', description: 'HTML body of incoming reply' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], InboundWebhookDto.prototype, "html", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'msg_123456789', description: 'Message ID header from email provider' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], InboundWebhookDto.prototype, "messageId", void 0);
//# sourceMappingURL=inbound-webhook.dto.js.map