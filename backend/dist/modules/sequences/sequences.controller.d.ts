import { SequencesService } from './sequences.service';
export declare class SequencesController {
    private readonly sequencesService;
    constructor(sequencesService: SequencesService);
    getSequenceLeads(userId: string, sequenceId: string): Promise<{
        id: string;
        name: string;
        company: string;
        email: string;
        channel: import(".prisma/client").$Enums.Channel;
        stage: string;
        status: "PENDING" | "REPLIED" | "ACTIVE" | "STOPPED" | "COMPLETED";
        currentStep: number;
        totalSteps: number;
        nextScheduledDate: Date;
        nextStepTitle: string;
        tasks: {
            id: string;
            title: string;
            subject: string;
            suggestedDate: Date;
            status: import(".prisma/client").$Enums.TaskStatus;
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
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getAllLeads(userId: string): Promise<{
        id: string;
        name: string;
        company: string;
        email: string;
        channel: import(".prisma/client").$Enums.Channel;
        stage: string;
        status: "PENDING" | "REPLIED" | "ACTIVE" | "STOPPED" | "COMPLETED";
        currentStep: number;
        totalSteps: number;
        nextScheduledDate: Date;
        nextStepTitle: string;
        tasks: {
            id: string;
            title: string;
            subject: string;
            suggestedDate: Date;
            status: import(".prisma/client").$Enums.TaskStatus;
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
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    stopLead(userId: string, leadId: string): Promise<{
        success: boolean;
        message: string;
        contact: {
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
        };
    }>;
    stopLeadPost(userId: string, leadId: string): Promise<{
        success: boolean;
        message: string;
        contact: {
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
        };
    }>;
    resumeLead(userId: string, leadId: string): Promise<{
        success: boolean;
        message: string;
        contact: {
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
        };
    }>;
}
