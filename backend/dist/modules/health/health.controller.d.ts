export declare class HealthController {
    getHealth(): {
        status: string;
        service: string;
        timestamp: string;
        uptime: number;
    };
    debugSentry(): void;
}
