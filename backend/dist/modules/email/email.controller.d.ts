import { Response } from 'express';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';
import { ConnectEmailAccountDto } from './dto/connect-email-account.dto';
import { InboundWebhookDto } from './dto/inbound-webhook.dto';
export declare class EmailController {
    private readonly emailService;
    constructor(emailService: EmailService);
    sendEmail(userId: string, dto: SendEmailDto): Promise<{
        success: boolean;
        emailLog: {
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
        };
        error: string;
    }>;
    getEmailLogs(userId: string): Promise<{
        contact: {
            name: string;
            email: string;
            id: string;
            company: string;
        };
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.EmailStatus;
        sender: string;
        recipient: string;
        subject: string;
        direction: string;
        errorMessage: string;
        task: {
            title: string;
            id: string;
            status: import(".prisma/client").$Enums.TaskStatus;
            suggestedDate: Date;
            subjectLine: string;
        };
    }[]>;
    deleteEmailLog(userId: string, logId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    bulkDeleteEmailLogs(userId: string, body: {
        logIds?: string[];
    }): Promise<{
        success: boolean;
        count: number;
        message: string;
    }>;
    connectEmailAccount(userId: string, dto: ConnectEmailAccountDto): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        displayName: string | null;
        provider: import(".prisma/client").$Enums.EmailProvider;
        smtpHost: string | null;
        smtpPort: number | null;
        username: string | null;
        isDefault: boolean;
        accessToken: string | null;
        encryptedPassword: string | null;
        refreshToken: string | null;
        isVerified: boolean;
    }>;
    getGoogleAuthUrl(userId: string): {
        url: string;
    };
    handleGoogleOAuthCallback(code: string, stateUserId: string, res: Response): Promise<void>;
    getOutlookAuthUrl(userId: string): {
        url: string;
    };
    handleOutlookOAuthCallback(code: string, stateUserId: string, res: Response): Promise<void>;
    getUserEmailAccounts(userId: string): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        displayName: string | null;
        provider: import(".prisma/client").$Enums.EmailProvider;
        smtpHost: string | null;
        smtpPort: number | null;
        username: string | null;
        isDefault: boolean;
        accessToken: string | null;
        encryptedPassword: string | null;
        refreshToken: string | null;
        isVerified: boolean;
    }[]>;
    setDefaultEmailAccount(userId: string, accountId: string): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        displayName: string | null;
        provider: import(".prisma/client").$Enums.EmailProvider;
        smtpHost: string | null;
        smtpPort: number | null;
        username: string | null;
        isDefault: boolean;
        accessToken: string | null;
        encryptedPassword: string | null;
        refreshToken: string | null;
        isVerified: boolean;
    }>;
    deleteEmailAccount(userId: string, accountId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    handleInboundWebhook(dto: InboundWebhookDto): Promise<{
        matched: boolean;
        contactId: string;
        contactName: string;
        userEmail: string;
        stage: string;
        tasksCancelled: number;
        emailLogId: string;
        message?: undefined;
    } | {
        matched: boolean;
        message: string;
        contactId?: undefined;
        contactName?: undefined;
        userEmail?: undefined;
        stage?: undefined;
        tasksCancelled?: undefined;
        emailLogId?: undefined;
    }>;
}
