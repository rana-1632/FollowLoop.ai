import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
export interface EmailDiagnosticsResult {
    timestamp: string;
    transport: string;
    activeAccount: {
        email: string;
        provider: string;
        isVerified: boolean;
        isDefault: boolean;
    };
    oauthStatus: {
        tokenPresent: boolean;
        tokenValid: boolean;
        expiresInSeconds: number;
        profileFetchable: boolean;
    };
    connectivity: {
        providerApiReachable: boolean;
        latencyMs: number;
    };
    status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
    details: string;
    diagnosticsExecutionTimeMs: number;
}
export declare class DiagnosticsService {
    private readonly configService;
    private readonly prisma;
    private readonly logger;
    constructor(configService: ConfigService, prisma: PrismaService);
    checkEmailTransportHealth(userId?: string): Promise<EmailDiagnosticsResult>;
}
