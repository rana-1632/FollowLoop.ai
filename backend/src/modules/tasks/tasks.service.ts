import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  private validateUserId(userId: string): string {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new UnauthorizedException('Authentication required. Missing or invalid user identity.');
    }
    return userId.trim();
  }

  async create(userId: string, dto: CreateTaskDto) {
    const cleanUserId = this.validateUserId(userId);
    const contact = await this.prisma.contact.findFirst({
      where: { id: dto.contactId, userId: cleanUserId },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID "${dto.contactId}" not found`);
    }

    return this.prisma.followUpTask.create({
      data: {
        userId: cleanUserId,
        contactId: dto.contactId,
        title: dto.title || `Follow up with ${contact.name}`,
        suggestedDate: new Date(dto.suggestedDate),
        aiGeneratedContent: dto.aiGeneratedContent,
        subjectLine: dto.subjectLine,
        status: dto.status || TaskStatus.PENDING,
      },
      include: { contact: true },
    });
  }

  async findAll(userId: string, status?: TaskStatus, overdue?: boolean) {
    const cleanUserId = this.validateUserId(userId);
    const where: any = {
      OR: [{ userId: cleanUserId }, { contact: { userId: cleanUserId } }],
    };

    if (status) {
      where.status = status;
    }

    if (overdue) {
      where.suggestedDate = { lte: new Date() };
      where.status = TaskStatus.PENDING;
    }

    return this.prisma.followUpTask.findMany({
      where,
      orderBy: { suggestedDate: 'asc' },
      include: { contact: true },
    });
  }

  private async ensureTaskOwnership(userId: string, taskId: string) {
    const task = await this.prisma.followUpTask.findFirst({
      where: {
        id: taskId,
        OR: [{ userId }, { contact: { userId } }],
      },
      select: { id: true },
    });

    if (!task) {
      throw new NotFoundException(`Follow-up task with ID "${taskId}" was not found`);
    }

    return task;
  }

  async findOne(userId: string, id: string) {
    const cleanUserId = this.validateUserId(userId);
    const task = await this.prisma.followUpTask.findFirst({
      where: {
        id,
        OR: [{ userId: cleanUserId }, { contact: { userId: cleanUserId } }],
      },
      include: { contact: true },
    });

    if (!task) {
      throw new NotFoundException(`Follow-up task with ID "${id}" was not found`);
    }

    return task;
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    const cleanUserId = this.validateUserId(userId);
    await this.ensureTaskOwnership(cleanUserId, id);

    const data: any = { ...dto };
    if (dto.suggestedDate) {
      data.suggestedDate = new Date(dto.suggestedDate);
    }

    return this.prisma.followUpTask.update({
      where: { id },
      data,
      include: { contact: true },
    });
  }

  async remove(userId: string, id: string) {
    const cleanUserId = this.validateUserId(userId);
    await this.ensureTaskOwnership(cleanUserId, id);

    return this.prisma.followUpTask.delete({
      where: { id },
    });
  }
}
