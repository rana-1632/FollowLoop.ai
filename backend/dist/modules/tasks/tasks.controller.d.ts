import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from '@prisma/client';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(userId: string, dto: CreateTaskDto): Promise<{
        contact: {
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
        };
    } & {
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
    }>;
    findAll(userId: string, status?: TaskStatus, overdue?: string): Promise<({
        contact: {
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
        };
    } & {
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
    })[]>;
    findOne(userId: string, id: string): Promise<{
        contact: {
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
        };
    } & {
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
    }>;
    update(userId: string, id: string, dto: UpdateTaskDto): Promise<{
        contact: {
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
        };
    } & {
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
    }>;
    remove(userId: string, id: string): Promise<{
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
    }>;
}
