import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class SequencesService {
  constructor(private readonly prisma: PrismaService) {}

  private validateUserId(userId: string): string {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new UnauthorizedException('Authentication required. Missing or invalid user identity.');
    }
    return userId.trim();
  }

  /**
   * Get all leads enrolled in sequences for the user with step progress, status, and scheduled dates
   */
  async getSequenceLeads(userId: string, sequenceId: string = 'default') {
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
      const sentSteps = contact.tasks.filter((t) => t.status === TaskStatus.SENT).length;
      const cancelledSteps = contact.tasks.filter((t) => t.status === TaskStatus.CANCELLED).length;
      const processedSteps = sentSteps + cancelledSteps;
      const pendingTasks = contact.tasks.filter((t) => t.status === TaskStatus.PENDING);
      const nextTask = pendingTasks[0] || null;

      let effectiveStatus: 'ACTIVE' | 'PENDING' | 'REPLIED' | 'STOPPED' | 'COMPLETED' = 'ACTIVE';
      const stageLower = (contact.currentStage || '').toLowerCase();
      
      if (
        stageLower.includes('stop') ||
        stageLower.includes('stalled') ||
        stageLower.includes('opted')
      ) {
        effectiveStatus = 'STOPPED';
      } else if (stageLower.includes('reply') || stageLower.includes('replied')) {
        effectiveStatus = 'REPLIED';
      } else if (totalSteps > 0 && processedSteps === totalSteps) {
        effectiveStatus = 'COMPLETED';
      } else if (pendingTasks.length === 0 && totalSteps === 0) {
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

  /**
   * Terminate follow-up sequence for a specific lead
   */
  async stopLeadFollowUps(userId: string, leadId: string) {
    const cleanUserId = this.validateUserId(userId);

    const contact = await this.prisma.contact.findFirst({
      where: { id: leadId, userId: cleanUserId },
    });

    if (!contact) {
      throw new NotFoundException(`Lead with ID "${leadId}" was not found.`);
    }

    // 1. Cancel all pending tasks for this lead
    await this.prisma.followUpTask.updateMany({
      where: { contactId: leadId, status: TaskStatus.PENDING },
      data: { status: TaskStatus.CANCELLED },
    });

    // 2. Update contact stage to 'STOPPED'
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

  /**
   * Resume follow-up sequence for a specific lead
   */
  async resumeLeadFollowUps(userId: string, leadId: string) {
    const cleanUserId = this.validateUserId(userId);

    const contact = await this.prisma.contact.findFirst({
      where: { id: leadId, userId: cleanUserId },
    });

    if (!contact) {
      throw new NotFoundException(`Lead with ID "${leadId}" was not found.`);
    }

    // 1. Re-activate CANCELLED tasks back to PENDING
    await this.prisma.followUpTask.updateMany({
      where: { contactId: leadId, status: TaskStatus.CANCELLED },
      data: { status: TaskStatus.PENDING },
    });

    // 2. Update contact stage to 'In Sequence'
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
}
