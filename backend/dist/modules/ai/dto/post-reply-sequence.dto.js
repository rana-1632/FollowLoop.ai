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
exports.PostReplySequenceDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class PostReplySequenceDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { replyText: { required: true, type: () => String }, contactId: { required: false, type: () => String }, tone: { required: false, type: () => String } };
    }
}
exports.PostReplySequenceDto = PostReplySequenceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Hi! Yes, we reviewed the venue walkthrough quote and would like to confirm our booking.',
        description: 'Text content of the incoming email reply received from the prospect',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PostReplySequenceDto.prototype, "replyText", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'contact-uuid-1234',
        description: 'Target contact ID in PostgreSQL CRM',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PostReplySequenceDto.prototype, "contactId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Consultative, warm, decisive',
        description: 'Desired tone of voice for post-reply follow-up draft',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PostReplySequenceDto.prototype, "tone", void 0);
//# sourceMappingURL=post-reply-sequence.dto.js.map