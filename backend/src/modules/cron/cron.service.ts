import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as Sentry from '@sentry/nestjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { EmailService } from '../email/email.service';
import { TaskStatus, EmailStatus } from '@prisma/client';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);
  private static readonly activeTaskLocks = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Automated Cron Job scheduled to run every 5 minutes for dynamic dispatching.
   * Scans for PENDING follow-up tasks due on or before now, generates AI email drafts if needed,
   * dispatches emails via Resend, updates task status, and records audit logs.
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyFollowUpCron() {
    this.logger.log('[CRON] Scheduled follow-up task runner initiated.');
    return this.processOverdueFollowUps();
  }

  /**
   * Process all pending follow-up tasks due today or overdue with strict idempotency and concurrency locks.
   */
  async processOverdueFollowUps() {
    this.logger.log('Starting scan for due and overdue follow-up tasks...');
    const now = new Date();

    try {
      const pendingTasks = await this.prisma.followUpTask.findMany({
        where: {
          suggestedDate: { lte: now },
          status: TaskStatus.PENDING,
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
        take: 50, // Batch size cap for free-tier performance
      });

      this.logger.log(`Found ${pendingTasks.length} pending follow-up tasks due for processing.`);

      const results = [];
      const processedLeadIds = new Set<string>();

      for (const task of pendingTasks) {
        // 1. Per-lead concurrency guard: Only allow 1 step per lead in a single cron run to enforce sequential delivery
        if (processedLeadIds.has(task.contactId)) {
          this.logger.log(
            `[IDEMPOTENCY LOCK] Lead ${task.contact.email} has a step already in-flight in this batch. Deferring task ${task.id} to next run.`,
          );
          continue;
        }

        // 2. In-memory worker concurrency lock
        if (CronService.activeTaskLocks.has(task.id)) {
          this.logger.warn(
            `[WORKER LOCK] Task ${task.id} is currently locked and processing by another thread. Skipping.`,
          );
          continue;
        }

        // 3. Database Idempotency Lock Check (ensure no duplicate SENT EmailLog exists for this task)
        const existingSentLog = await this.prisma.emailLog.findFirst({
          where: {
            taskId: task.id,
            status: EmailStatus.SENT,
          },
        });

        if (existingSentLog) {
          this.logger.warn(
            `[IDEMPOTENCY KEY HIT] Task ${task.id} was already dispatched successfully (EmailLog ID: ${existingSentLog.id}). Marking task SENT.`,
          );
          await this.prisma.followUpTask.update({
            where: { id: task.id },
            data: { status: TaskStatus.SENT },
          });
          continue;
        }

        const ownerUserId = task.userId || task.contact.userId;
        const stageLower = (task.contact.currentStage || '').toLowerCase();

        // 4. Guardrail: Immediately bypass sending emails if lead is STOPPED, REPLIED, or PAUSED
        if (
          stageLower.includes('stop') ||
          stageLower.includes('stalled') ||
          stageLower.includes('reply') ||
          stageLower.includes('replied') ||
          stageLower.includes('opted') ||
          stageLower.includes('cancel')
        ) {
          this.logger.log(
            `[CRON] Bypassing dispatch for task ${task.id} (Lead: ${task.contact.email}) because lead stage is "${task.contact.currentStage}". Cancelling task.`,
          );

          await this.prisma.followUpTask
            .update({
              where: { id: task.id },
              data: { status: TaskStatus.CANCELLED },
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

        // 5. Acquire Atomic Status Lock in DB to prevent race conditions across server instances
        const lockClaim = await this.prisma.followUpTask.updateMany({
          where: {
            id: task.id,
            status: TaskStatus.PENDING,
          },
          data: {
            status: TaskStatus.SENT, // Claim task atomically
          },
        });

        if (lockClaim.count === 0) {
          this.logger.warn(`[ATOMIC CLAIM FAILED] Task ${task.id} was claimed by another server process. Skipping.`);
          continue;
        }

        // Lock locally
        CronService.activeTaskLocks.add(task.id);
        processedLeadIds.add(task.contactId);

        try {
          // Step 1: Ensure AI email draft exists for the task
          let subject = task.subjectLine;
          let body = task.aiGeneratedContent;

          if (!subject || !body) {
            this.logger.log(`Generating AI draft for task ${task.id}...`);
            const aiResult = await this.aiService.generateAndSaveForTask(ownerUserId, task.id);
            subject = aiResult.generatedDraft.subject;
            body = aiResult.generatedDraft.body;
          }

          // Step 2: Dispatch email via EmailService
          const dispatchResult = await this.emailService.sendEmail(ownerUserId, {
            contactId: task.contactId,
            taskId: task.id,
            subject,
            bodyContent: body,
          });

          if (!dispatchResult.success) {
            // Revert status if dispatch failed
            const newRetryCount = (task.retryCount || 0) + 1;
            await this.prisma.followUpTask.update({
              where: { id: task.id },
              data: {
                status: newRetryCount >= 3 ? TaskStatus.CANCELLED : TaskStatus.PENDING,
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
        } catch (taskErr: any) {
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
                status: newRetryCount >= 3 ? TaskStatus.CANCELLED : TaskStatus.PENDING,
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
        } finally {
          CronService.activeTaskLocks.delete(task.id);
        }
      }

      return {
        success: true,
        processedCount: results.length,
        timestamp: new Date().toISOString(),
        details: results,
      };
    } catch (err: any) {
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
}
