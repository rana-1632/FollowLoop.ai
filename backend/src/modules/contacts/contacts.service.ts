import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

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
          take: 10,
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
}
