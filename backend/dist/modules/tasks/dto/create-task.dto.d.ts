import { TaskStatus } from '@prisma/client';
export declare class CreateTaskDto {
    contactId: string;
    suggestedDate: string;
    title?: string;
    aiGeneratedContent?: string;
    subjectLine?: string;
    status?: TaskStatus;
}
