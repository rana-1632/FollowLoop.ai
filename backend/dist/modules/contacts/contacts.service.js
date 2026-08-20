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
exports.ContactsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let ContactsService = class ContactsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    validateUserId(userId) {
        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            throw new common_1.UnauthorizedException('Authentication required. Missing or invalid user identity.');
        }
        return userId.trim();
    }
    async create(userId, dto) {
        const cleanUserId = this.validateUserId(userId);
        const data = {
            ...dto,
            userId: cleanUserId,
            currentStage: dto.currentStage || dto.status || 'New Lead',
        };
        delete data.status;
        delete data.nextStep;
        delete data.score;
        if (dto.lastInteractionDate) {
            data.lastInteractionDate = new Date(dto.lastInteractionDate);
        }
        return this.prisma.contact.create({
            data,
        });
    }
    async findAll(userId, search, channel) {
        const cleanUserId = this.validateUserId(userId);
        const where = { userId: cleanUserId };
        if (channel) {
            where.channel = channel;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { company: { contains: search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.contact.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            take: 100,
            include: {
                _count: {
                    select: { tasks: true, emailLogs: true },
                },
            },
        });
    }
    async findOne(userId, id) {
        const cleanUserId = this.validateUserId(userId);
        const contact = await this.prisma.contact.findFirst({
            where: { id, userId: cleanUserId },
            include: {
                tasks: {
                    orderBy: { suggestedDate: 'asc' },
                },
                emailLogs: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });
        if (!contact) {
            throw new common_1.NotFoundException(`Contact with ID "${id}" was not found`);
        }
        return contact;
    }
    async ensureContactOwnership(userId, contactId) {
        const contact = await this.prisma.contact.findFirst({
            where: { id: contactId, userId },
            select: { id: true, name: true, email: true },
        });
        if (!contact) {
            throw new common_1.NotFoundException(`Contact with ID "${contactId}" was not found`);
        }
        return contact;
    }
    async update(userId, id, dto) {
        const cleanUserId = this.validateUserId(userId);
        await this.ensureContactOwnership(cleanUserId, id);
        const data = { ...dto };
        if (dto.status && !dto.currentStage) {
            data.currentStage = dto.status;
        }
        delete data.status;
        delete data.nextStep;
        delete data.score;
        if (dto.lastInteractionDate) {
            data.lastInteractionDate = new Date(dto.lastInteractionDate);
        }
        return this.prisma.contact.update({
            where: { id },
            data,
        });
    }
    async remove(userId, id) {
        const cleanUserId = this.validateUserId(userId);
        await this.ensureContactOwnership(cleanUserId, id);
        return this.prisma.contact.delete({
            where: { id },
        });
    }
    async updateSequenceStatus(userId, id, action) {
        const cleanUserId = this.validateUserId(userId);
        await this.ensureContactOwnership(cleanUserId, id);
        if (action === 'STOP') {
            await this.prisma.followUpTask.updateMany({
                where: { contactId: id, status: 'PENDING' },
                data: { status: 'CANCELLED' },
            });
            return this.prisma.contact.update({
                where: { id },
                data: { currentStage: 'Stalled' },
            });
        }
        else {
            await this.prisma.followUpTask.updateMany({
                where: { contactId: id, status: 'CANCELLED' },
                data: { status: 'PENDING' },
            });
            return this.prisma.contact.update({
                where: { id },
                data: { currentStage: 'In Sequence' },
            });
        }
    }
};
exports.ContactsService = ContactsService;
exports.ContactsService = ContactsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContactsService);
//# sourceMappingURL=contacts.service.js.map