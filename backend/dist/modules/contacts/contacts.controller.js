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
exports.ContactsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const contacts_service_1 = require("./contacts.service");
const create_contact_dto_1 = require("./dto/create-contact.dto");
const update_contact_dto_1 = require("./dto/update-contact.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../../common/decorators/get-user.decorator");
let ContactsController = class ContactsController {
    constructor(contactsService) {
        this.contactsService = contactsService;
    }
    async create(userId, dto) {
        return this.contactsService.create(userId, dto);
    }
    async findAll(userId, search, status) {
        return this.contactsService.findAll(userId, search, status);
    }
    async findOne(userId, id) {
        return this.contactsService.findOne(userId, id);
    }
    async update(userId, id, dto) {
        return this.contactsService.update(userId, id, dto);
    }
    async remove(userId, id) {
        return this.contactsService.remove(userId, id);
    }
    async updateSequenceStatus(userId, id, action) {
        return this.contactsService.updateSequenceStatus(userId, id, action || 'STOP');
    }
};
exports.ContactsController = ContactsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new contact / deal lead' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Contact successfully created' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_contact_dto_1.CreateContactDto]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List contacts for authenticated user' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Filter by name, email, or company' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Filter by pipeline status enum' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of contacts returned' }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get contact detail with associated tasks and email logs' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contact details returned' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Contact not found' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update contact details or pipeline stage' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contact updated successfully' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_contact_dto_1.UpdateContactDto]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete contact' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contact deleted successfully' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/sequence-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Stop or Continue automated follow-up sequence after reply' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sequence status updated' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('action')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "updateSequenceStatus", null);
exports.ContactsController = ContactsController = __decorate([
    (0, swagger_1.ApiTags)('Contacts & Deals'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('contacts'),
    __metadata("design:paramtypes", [contacts_service_1.ContactsService])
], ContactsController);
//# sourceMappingURL=contacts.controller.js.map