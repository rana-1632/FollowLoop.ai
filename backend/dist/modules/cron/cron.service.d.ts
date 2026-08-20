import { PrismaService } from '../../common/prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { EmailService } from '../email/email.service';
export declare class CronService {
    private readonly prisma;
    private readonly aiService;
    private readonly emailService;
    private readonly logger;
    private static readonly activeTaskLocks;
    constructor(prisma: PrismaService, aiService: AiService, emailService: EmailService);
    handleDailyFollowUpCron(): Promise<{
        success: boolean;
        processedCount: number;
        timestamp: string;
        details: any[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        timestamp: string;
        processedCount?: undefined;
        details?: undefined;
    }>;
    processOverdueFollowUps(): Promise<{
        success: boolean;
        processedCount: number;
        timestamp: string;
        details: any[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        timestamp: string;
        processedCount?: undefined;
        details?: undefined;
    }>;
}
