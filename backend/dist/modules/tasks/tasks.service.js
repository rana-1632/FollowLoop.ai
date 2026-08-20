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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let TasksService = class TasksService {
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
        const contact = await this.prisma.contact.findFirst({
            where: { id: dto.contactId, userId: cleanUserId },
        });
        if (!contact) {
            throw new common_1.NotFoundException(`Contact with ID "${dto.contactId}" not found`);
        }
        return this.prisma.followUpTask.create({
            data: {
                userId: cleanUserId,
                contactId: dto.contactId,
                title: dto.title || `Follow up with ${contact.name}`,
                suggestedDate: new Date(dto.suggestedDate),
                aiGeneratedContent: dto.aiGeneratedContent,
                subjectLine: dto.subjectLine,
                status: dto.status || client_1.TaskStatus.PENDING,
            },
            include: { contact: true },
        });
    }
    async findAll(userId, status, overdue) {
        const cleanUserId = this.validateUserId(userId);
        const where = {
            OR: [{ userId: cleanUserId }, { contact: { userId: cleanUserId } }],
        };
        if (status) {
            where.status = status;
        }
        if (overdue) {
            where.suggestedDate = { lte: new Date() };
            where.status = client_1.TaskStatus.PENDING;
        }
        return this.prisma.followUpTask.findMany({
            where,
            orderBy: { suggestedDate: 'asc' },
            include: { contact: true },
        });
    }
    async ensureTaskOwnership(userId, taskId) {
        const task = await this.prisma.followUpTask.findFirst({
            where: {
                id: taskId,
                OR: [{ userId }, { contact: { userId } }],
            },
            select: { id: true },
        });
        if (!task) {
            throw new common_1.NotFoundException(`Follow-up task with ID "${taskId}" was not found`);
        }
        return task;
    }
    async findOne(userId, id) {
        const cleanUserId = this.validateUserId(userId);
        const task = await this.prisma.followUpTask.findFirst({
            where: {
                id,
                OR: [{ userId: cleanUserId }, { contact: { userId: cleanUserId } }],
            },
            include: { contact: true },
        });
        if (!task) {
            throw new common_1.NotFoundException(`Follow-up task with ID "${id}" was not found`);
        }
        return task;
    }
    async update(userId, id, dto) {
        const cleanUserId = this.validateUserId(userId);
        await this.ensureTaskOwnership(cleanUserId, id);
        const data = { ...dto };
        if (dto.suggestedDate) {
            data.suggestedDate = new Date(dto.suggestedDate);
        }
        return this.prisma.followUpTask.update({
            where: { id },
            data,
            include: { contact: true },
        });
    }
    async remove(userId, id) {
        const cleanUserId = this.validateUserId(userId);
        await this.ensureTaskOwnership(cleanUserId, id);
        return this.prisma.followUpTask.delete({
            where: { id },
        });
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map