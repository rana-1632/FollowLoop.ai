import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
export declare class ContactsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private validateUserId;
    create(userId: string, dto: CreateContactDto): Promise<{
        name: string;
        email: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        company: string | null;
        channel: import(".prisma/client").$Enums.Channel;
        lastInteractionDate: Date | null;
        currentStage: string;
        phone: string | null;
        position: string | null;
        notes: string | null;
        userId: string;
    }>;
    findAll(userId: string, search?: string, channel?: string): Promise<({
        _count: {
            tasks: number;
            emailLogs: number;
        };
    } & {
        name: string;
        email: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        company: string | null;
        channel: import(".prisma/client").$Enums.Channel;
        lastInteractionDate: Date | null;
        currentStage: string;
        phone: string | null;
        position: string | null;
        notes: string | null;
        userId: string;
    })[]>;
    findOne(userId: string, id: string): Promise<{
        tasks: {
            title: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.TaskStatus;
            userId: string | null;
            suggestedDate: Date;
            contactId: string;
            aiGeneratedContent: string | null;
            subjectLine: string | null;
            retryCount: number;
        }[];
        emailLogs: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.EmailStatus;
            userId: string;
            contactId: string | null;
            taskId: string | null;
            sender: string | null;
            recipient: string;
            subject: string;
            bodyContent: string | null;
            direction: string;
            errorMessage: string | null;
        }[];
    } & {
        name: string;
        email: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        company: string | null;
        channel: import(".prisma/client").$Enums.Channel;
        lastInteractionDate: Date | null;
        currentStage: string;
        phone: string | null;
        position: string | null;
        notes: string | null;
        userId: string;
    }>;
    private ensureContactOwnership;
    update(userId: string, id: string, dto: UpdateContactDto): Promise<{
        name: string;
        email: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        company: string | null;
        channel: import(".prisma/client").$Enums.Channel;
        lastInteractionDate: Date | null;
        currentStage: string;
        phone: string | null;
        position: string | null;
        notes: string | null;
        userId: string;
    }>;
    remove(userId: string, id: string): Promise<{
        name: string;
        email: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        company: string | null;
        channel: import(".prisma/client").$Enums.Channel;
        lastInteractionDate: Date | null;
        currentStage: string;
        phone: string | null;
        position: string | null;
        notes: string | null;
        userId: string;
    }>;
    updateSequenceStatus(userId: string, id: string, action: 'STOP' | 'CONTINUE'): Promise<{
        name: string;
        email: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        company: string | null;
        channel: import(".prisma/client").$Enums.Channel;
        lastInteractionDate: Date | null;
        currentStage: string;
        phone: string | null;
        position: string | null;
        notes: string | null;
        userId: string;
    }>;
}
