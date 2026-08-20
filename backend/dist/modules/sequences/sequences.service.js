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
exports.SequencesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let SequencesService = class SequencesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    validateUserId(userId) {
        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            throw new common_1.UnauthorizedException('Authentication required. Missing or invalid user identity.');
        }
        return userId.trim();
    }
    async getSequenceLeads(userId, sequenceId = 'default') {
        const cleanUserId = this.validateUserId(userId);
        const contacts = await this.prisma.contact.findMany({
            where: { userId: cleanUserId },
            include: {
                tasks: {
                    orderBy: { suggestedDate: 'asc' },
                },
                emailLogs: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
        return contacts.map((contact) => {
            const totalSteps = contact.tasks.length;
            const sentSteps = contact.tasks.filter((t) => t.status === client_1.TaskStatus.SENT).length;
            const cancelledSteps = contact.tasks.filter((t) => t.status === client_1.TaskStatus.CANCELLED).length;
            const processedSteps = sentSteps + cancelledSteps;
            const pendingTasks = contact.tasks.filter((t) => t.status === client_1.TaskStatus.PENDING);
            const nextTask = pendingTasks[0] || null;
            let effectiveStatus = 'ACTIVE';
            const stageLower = (contact.currentStage || '').toLowerCase();
            if (stageLower.includes('stop') ||
                stageLower.includes('stalled') ||
                stageLower.includes('opted')) {
                effectiveStatus = 'STOPPED';
            }
            else if (stageLower.includes('reply') || stageLower.includes('replied')) {
                effectiveStatus = 'REPLIED';
            }
            else if (totalSteps > 0 && processedSteps === totalSteps) {
                effectiveStatus = 'COMPLETED';
            }
            else if (pendingTasks.length === 0 && totalSteps === 0) {
                effectiveStatus = 'PENDING';
            }
            let completionNotice = 'All steps completed';
            if (cancelledSteps > 0 && pendingTasks.length === 0) {
                completionNotice = `Sequence concluded (${cancelledSteps} cancelled)`;
            }
            return {
                id: contact.id,
                name: contact.name,
                company: contact.company || 'Independent',
                email: contact.email || '',
                channel: contact.channel || 'EMAIL',
                stage: contact.currentStage,
                status: effectiveStatus,
                currentStep: totalSteps > 0 ? Math.min(processedSteps, totalSteps) : 0,
                totalSteps: totalSteps || 1,
                nextScheduledDate: nextTask ? nextTask.suggestedDate : null,
                nextStepTitle: nextTask ? nextTask.subjectLine || nextTask.title || 'Follow-up Step' : completionNotice,
                tasks: contact.tasks.map((t) => ({
                    id: t.id,
                    title: t.title || t.subjectLine || 'Follow-up Step',
                    subject: t.subjectLine,
                    suggestedDate: t.suggestedDate,
                    status: t.status,
                })),
                emailLogs: contact.emailLogs,
                createdAt: contact.createdAt,
                updatedAt: contact.updatedAt,
            };
        });
    }
    async stopLeadFollowUps(userId, leadId) {
        const cleanUserId = this.validateUserId(userId);
        const contact = await this.prisma.contact.findFirst({
            where: { id: leadId, userId: cleanUserId },
        });
        if (!contact) {
            throw new common_1.NotFoundException(`Lead with ID "${leadId}" was not found.`);
        }
        await this.prisma.followUpTask.updateMany({
            where: { contactId: leadId, status: client_1.TaskStatus.PENDING },
            data: { status: client_1.TaskStatus.CANCELLED },
        });
        const updated = await this.prisma.contact.update({
            where: { id: leadId },
            data: { currentStage: 'STOPPED' },
            include: {
                tasks: true,
            },
        });
        return {
            success: true,
            message: `Automated follow-ups terminated for lead ${contact.name} (${contact.email}).`,
            contact: updated,
        };
    }
    async resumeLeadFollowUps(userId, leadId) {
        const cleanUserId = this.validateUserId(userId);
        const contact = await this.prisma.contact.findFirst({
            where: { id: leadId, userId: cleanUserId },
        });
        if (!contact) {
            throw new common_1.NotFoundException(`Lead with ID "${leadId}" was not found.`);
        }
        await this.prisma.followUpTask.updateMany({
            where: { contactId: leadId, status: client_1.TaskStatus.CANCELLED },
            data: { status: client_1.TaskStatus.PENDING },
        });
        const updated = await this.prisma.contact.update({
            where: { id: leadId },
            data: { currentStage: 'In Sequence' },
            include: {
                tasks: true,
            },
        });
        return {
            success: true,
            message: `Automated follow-ups resumed for lead ${contact.name} (${contact.email}).`,
            contact: updated,
        };
    }
};
exports.SequencesService = SequencesService;
exports.SequencesService = SequencesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SequencesService);
//# sourceMappingURL=sequences.service.js.map