import { Channel } from '@prisma/client';
export declare class CreateContactDto {
    name: string;
    email?: string;
    company?: string;
    channel?: Channel;
    lastInteractionDate?: string;
    currentStage?: string;
    phone?: string;
    position?: string;
    notes?: string;
    status?: string;
    nextStep?: string;
    score?: number;
}
