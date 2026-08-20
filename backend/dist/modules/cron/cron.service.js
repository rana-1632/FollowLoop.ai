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
var CronService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const Sentry = require("@sentry/nestjs");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
const email_service_1 = require("../email/email.service");
const client_1 = require("@prisma/client");
let CronService = CronService_1 = class CronService {
    constructor(prisma, aiService, emailService) {
        this.prisma = prisma;
        this.aiService = aiService;
        this.emailService = emailService;
        this.logger = new common_1.Logger(CronService_1.name);
    }
    async handleDailyFollowUpCron() {
        this.logger.log('[CRON] Scheduled follow-up task runner initiated.');
        return this.processOverdueFollowUps();
    }
    async processOverdueFollowUps() {
        this.logger.log('Starting scan for due and overdue follow-up tasks...');
        const now = new Date();
        try {
            const pendingTasks = await this.prisma.followUpTask.findMany({
                where: {
                    suggestedDate: { lte: now },
                    status: client_1.TaskStatus.PENDING,
                },
                include: {
                    contact: {
                        include: {
                            user: true,
                        },
                    },
                    user: true,
                },
                orderBy: { suggestedDate: 'asc' },
                take: 50,
            });
            this.logger.log(`Found ${pendingTasks.length} pending follow-up tasks due for processing.`);
            const results = [];
            const processedLeadIds = new Set();
            for (const task of pendingTasks) {
                if (processedLeadIds.has(task.contactId)) {
                    this.logger.log(`[IDEMPOTENCY LOCK] Lead ${task.contact.email} has a step already in-flight in this batch. Deferring task ${task.id} to next run.`);
                    continue;
                }
                if (CronService_1.activeTaskLocks.has(task.id)) {
                    this.logger.warn(`[WORKER LOCK] Task ${task.id} is currently locked and processing by another thread. Skipping.`);
                    continue;
                }
                const existingSentLog = await this.prisma.emailLog.findFirst({
                    where: {
                        taskId: task.id,
                        status: client_1.EmailStatus.SENT,
                    },
                });
                if (existingSentLog) {
                    this.logger.warn(`[IDEMPOTENCY KEY HIT] Task ${task.id} was already dispatched successfully (EmailLog ID: ${existingSentLog.id}). Marking task SENT.`);
                    await this.prisma.followUpTask.update({
                        where: { id: task.id },
                        data: { status: client_1.TaskStatus.SENT },
                    });
                    continue;
                }
                const ownerUserId = task.userId || task.contact.userId;
                const stageLower = (task.contact.currentStage || '').toLowerCase();
                if (stageLower.includes('stop') ||
                    stageLower.includes('stalled') ||
                    stageLower.includes('reply') ||
                    stageLower.includes('replied') ||
                    stageLower.includes('opted') ||
                    stageLower.includes('cancel')) {
                    this.logger.log(`[CRON] Bypassing dispatch for task ${task.id} (Lead: ${task.contact.email}) because lead stage is "${task.contact.currentStage}". Cancelling task.`);
                    await this.prisma.followUpTask
                        .update({
                        where: { id: task.id },
                        data: { status: client_1.TaskStatus.CANCELLED },
                    })
                        .catch(() => null);
                    results.push({
                        taskId: task.id,
                        contactId: task.contactId,
                        contactName: task.contact.name,
                        recipientEmail: task.contact.email,
                        status: 'CANCELLED_BYPASSED',
                        reason: `Lead is ${task.contact.currentStage}`,
                    });
                    continue;
                }
                const lockClaim = await this.prisma.followUpTask.updateMany({
                    where: {
                        id: task.id,
                        status: client_1.TaskStatus.PENDING,
                    },
                    data: {
                        status: client_1.TaskStatus.SENT,
                    },
                });
                if (lockClaim.count === 0) {
                    this.logger.warn(`[ATOMIC CLAIM FAILED] Task ${task.id} was claimed by another server process. Skipping.`);
                    continue;
                }
                CronService_1.activeTaskLocks.add(task.id);
                processedLeadIds.add(task.contactId);
                try {
                    let subject = task.subjectLine;
                    let body = task.aiGeneratedContent;
                    if (!subject || !body) {
                        this.logger.log(`Generating AI draft for task ${task.id}...`);
                        const aiResult = await this.aiService.generateAndSaveForTask(ownerUserId, task.id);
                        subject = aiResult.generatedDraft.subject;
                        body = aiResult.generatedDraft.body;
                    }
                    const dispatchResult = await this.emailService.sendEmail(ownerUserId, {
                        contactId: task.contactId,
                        taskId: task.id,
                        subject,
                        bodyContent: body,
                    });
                    if (!dispatchResult.success) {
                        const newRetryCount = (task.retryCount || 0) + 1;
                        await this.prisma.followUpTask.update({
                            where: { id: task.id },
                            data: {
                                status: newRetryCount >= 3 ? client_1.TaskStatus.CANCELLED : client_1.TaskStatus.PENDING,
                                retryCount: newRetryCount,
                            },
                        });
                    }
                    results.push({
                        taskId: task.id,
                        contactId: task.contactId,
                        contactName: task.contact.name,
                        recipientEmail: task.contact.email,
                        status: dispatchResult.success ? 'SENT' : 'FAILED',
                        error: dispatchResult.error,
                        subject,
                    });
                }
                catch (taskErr) {
                    this.logger.error(`Error processing follow-up task ${task.id}:`, taskErr.stack || taskErr.message);
                    if (process.env.SENTRY_DSN) {
                        Sentry.captureException(taskErr);
                    }
                    const newRetryCount = (task.retryCount || 0) + 1;
                    await this.prisma.followUpTask
                        .update({
                        where: { id: task.id },
                        data: {
                            retryCount: newRetryCount,
                            status: newRetryCount >= 3 ? client_1.TaskStatus.CANCELLED : client_1.TaskStatus.PENDING,
                        },
                    })
                        .catch(() => null);
                    results.push({
                        taskId: task.id,
                        contactId: task.contactId,
                        contactName: task.contact.name,
                        recipientEmail: task.contact.email,
                        status: 'FAILED',
                        error: taskErr.message,
                    });
                }
                finally {
                    CronService_1.activeTaskLocks.delete(task.id);
                }
            }
            return {
                success: true,
                processedCount: results.length,
                timestamp: new Date().toISOString(),
                details: results,
            };
        }
        catch (err) {
            this.logger.error('Critical failure in processOverdueFollowUps cron runner:', err.stack || err.message);
            if (process.env.SENTRY_DSN) {
                Sentry.captureException(err);
            }
            return {
                success: false,
                error: err.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
};
exports.CronService = CronService;
CronService.activeTaskLocks = new Set();
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CronService.prototype, "handleDailyFollowUpCron", null);
exports.CronService = CronService = CronService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService,
        email_service_1.EmailService])
], CronService);
//# sourceMappingURL=cron.service.js.map