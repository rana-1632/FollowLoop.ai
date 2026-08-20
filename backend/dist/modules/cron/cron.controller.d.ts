import { CronService } from './cron.service';
export declare class CronController {
    private readonly cronService;
    constructor(cronService: CronService);
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
    triggerManual(): Promise<{
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
