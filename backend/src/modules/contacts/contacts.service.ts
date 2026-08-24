import { Injectable, NotFoundException, UnauthorizedException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async onModuleInit() {
    try {
      // Clean up legacy test logs (wedding hall booking test data & dummy HR department logs)
      await this.prisma.emailLog.deleteMany({
        where: {
          OR: [
            { bodyContent: { contains: 'wedding hall', mode: 'insensitive' } },
            { bodyContent: { contains: 'HR Department', mode: 'insensitive' } },
            { recipient: { contains: 'lead_17', mode: 'insensitive' } },
            { recipient: { contains: 'outreach@followloop.ai', mode: 'insensitive' } },
          ],
        },
      });
    } catch {
      // Ignore if table is empty during boot
    }
  }

  private validateUserId(userId: string): string {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new UnauthorizedException('Authentication required. Missing or invalid user identity.');
    }
    return userId.trim();
  }

  async create(userId: string, dto: CreateContactDto) {
    const cleanUserId = this.validateUserId(userId);
    const data: any = {
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

  async findAll(userId: string, search?: string, channel?: string) {
    const cleanUserId = this.validateUserId(userId);
    const where: any = { userId: cleanUserId };

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

  async findOne(userId: string, id: string) {
    const cleanUserId = this.validateUserId(userId);
    const contact = await this.prisma.contact.findFirst({
      where: { id, userId: cleanUserId },
      include: {
        tasks: {
          orderBy: { suggestedDate: 'asc' },
        },
        emailLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID "${id}" was not found`);
    }

    return contact;
  }

  private async ensureContactOwnership(userId: string, contactId: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id: contactId, userId },
      select: { id: true, name: true, email: true },
    });
    if (!contact) {
      throw new NotFoundException(`Contact with ID "${contactId}" was not found`);
    }
    return contact;
  }

  async update(userId: string, id: string, dto: UpdateContactDto) {
    const cleanUserId = this.validateUserId(userId);
    await this.ensureContactOwnership(cleanUserId, id);

    const data: any = { ...dto };

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

  async remove(userId: string, id: string) {
    const cleanUserId = this.validateUserId(userId);
    await this.ensureContactOwnership(cleanUserId, id);

    return this.prisma.contact.delete({
      where: { id },
    });
  }

  async updateSequenceStatus(userId: string, id: string, action: 'STOP' | 'CONTINUE') {
    const cleanUserId = this.validateUserId(userId);
    await this.ensureContactOwnership(cleanUserId, id);

    if (action === 'STOP') {
      // Cancel all remaining pending follow-up tasks
      await this.prisma.followUpTask.updateMany({
        where: { contactId: id, status: 'PENDING' },
        data: { status: 'CANCELLED' },
      });

      return this.prisma.contact.update({
        where: { id },
        data: { currentStage: 'Stalled' },
      });
    } else {
      // Resume remaining sequence tasks
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

  /**
   * Lead Activity Timeline (Audit Trail)
   * Builds a chronological event history for a lead (creation, emails sent, replies received, sequence tasks, stage changes)
   */
  async getTimeline(userId: string, id: string) {
    const cleanUserId = this.validateUserId(userId);
    const contact = await this.prisma.contact.findFirst({
      where: { id, userId: cleanUserId },
      include: {
        tasks: { orderBy: { createdAt: 'desc' } },
        emailLogs: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID "${id}" was not found`);
    }

    const events: Array<{
      id: string;
      type: 'LEAD_CREATED' | 'SEQUENCE_ENROLLED' | 'EMAIL_DISPATCHED' | 'REPLY_RECEIVED' | 'STAGE_CHANGED' | 'TASK_SCHEDULED';
      title: string;
      description?: string;
      timestamp: Date;
      badgeColor: string;
      meta?: any;
    }> = [];

    // 1. Lead Enrolled / Created
    events.push({
      id: `created_${contact.id}`,
      type: 'LEAD_CREATED',
      title: 'Lead Enrolled in FollowLoop CRM',
      description: `Lead record created for ${contact.name} (${contact.company || 'Independent'})`,
      timestamp: contact.createdAt,
      badgeColor: 'blue',
    });

    // 2. Stage Change Events
    if (contact.currentStage === 'REPLIED' && contact.lastInteractionDate) {
      events.push({
        id: `stage_replied_${contact.id}`,
        type: 'STAGE_CHANGED',
        title: 'Stage Updated: REPLIED',
        description: `Lead replied to sequence. Stage automatically transitioned to REPLIED and remaining tasks paused.`,
        timestamp: contact.lastInteractionDate,
        badgeColor: 'emerald',
      });
    } else if (contact.lastInteractionDate) {
      events.push({
        id: `stage_touch_${contact.id}`,
        type: 'STAGE_CHANGED',
        title: `Pipeline Stage: ${contact.currentStage}`,
        description: `Contact last interacted or updated stage to ${contact.currentStage}`,
        timestamp: contact.lastInteractionDate,
        badgeColor: 'purple',
      });
    }

    // 3. Email Logs (Inbound & Outbound)
    for (const log of contact.emailLogs) {
      if (log.direction === 'INBOUND' || log.status === 'REPLIED') {
        events.push({
          id: `log_${log.id}`,
          type: 'REPLY_RECEIVED',
          title: `Inbound Reply Received: "${log.subject}"`,
          description: log.bodyContent || 'No message text provided',
          timestamp: log.createdAt,
          badgeColor: 'emerald',
          meta: { sender: log.sender, recipient: log.recipient },
        });
      } else {
        events.push({
          id: `log_${log.id}`,
          type: 'EMAIL_DISPATCHED',
          title: `Email Dispatched: "${log.subject}"`,
          description: log.bodyContent || 'Outbound email sent via FollowLoop engine',
          timestamp: log.createdAt,
          badgeColor: 'indigo',
          meta: { sender: log.sender, recipient: log.recipient, status: log.status },
        });
      }
    }

    // 4. Sequence Tasks
    for (const task of contact.tasks) {
      events.push({
        id: `task_${task.id}`,
        type: 'TASK_SCHEDULED',
        title: `Sequence Step ${task.status === 'CANCELLED' ? '(Cancelled)' : '(Scheduled)'}: ${task.title || task.subjectLine || 'Follow-up Email'}`,
        description: task.aiGeneratedContent || task.subjectLine || '',
        timestamp: task.suggestedDate || task.createdAt,
        badgeColor: task.status === 'CANCELLED' ? 'slate' : 'amber',
        meta: { status: task.status, suggestedDate: task.suggestedDate },
      });
    }

    // Sort timeline events chronologically (newest first)
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      contact: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        company: contact.company,
        currentStage: contact.currentStage,
        phone: contact.phone,
      },
      timeline: events,
    };
  }

  /**
   * Unified Conversation View (Unibox / Threading)
   * Fetches all back-and-forth email messages for a lead in chronological order
   */
  async getThread(userId: string, id: string) {
    const cleanUserId = this.validateUserId(userId);
    const contact = await this.prisma.contact.findFirst({
      where: { id, userId: cleanUserId },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID "${id}" was not found`);
    }

    // Retrieve all EmailLog records linked strictly to this contactId
    const logs = await this.prisma.emailLog.findMany({
      where: {
        userId: cleanUserId,
        contactId: id,
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      contact: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        company: contact.company,
        currentStage: contact.currentStage,
      },
      messages: logs.map((l) => ({
        id: l.id,
        direction: l.direction, // "OUTBOUND" | "INBOUND"
        sender: l.sender || 'FollowLoop Engine',
        recipient: l.recipient,
        subject: l.subject,
        bodyContent: l.bodyContent || '',
        status: l.status,
        createdAt: l.createdAt,
      })),
    };
  }

  /**
   * Send Manual Reply directly inside FollowLoop Unibox Thread
   */
  async sendReply(userId: string, id: string, dto: { subject: string; bodyContent: string }) {
    const cleanUserId = this.validateUserId(userId);
    const contact = await this.prisma.contact.findFirst({
      where: { id, userId: cleanUserId },
    });

    if (!contact || !contact.email) {
      throw new NotFoundException(`Valid contact with email was not found for ID "${id}"`);
    }

    if (!dto.bodyContent || dto.bodyContent.trim() === '') {
      throw new BadRequestException('Reply message body cannot be empty.');
    }

    return this.emailService.sendEmail(cleanUserId, {
      contactId: contact.id,
      subject: dto.subject || `Re: Conversation with ${contact.name}`,
      bodyContent: dto.bodyContent,
    });
  }
}
