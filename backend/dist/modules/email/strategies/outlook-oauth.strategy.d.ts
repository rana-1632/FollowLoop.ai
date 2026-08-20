import { PrismaService } from '../../../common/prisma/prisma.service';
import { EmailDispatchOptions, EmailDispatchResult, EmailTransportStrategy } from './email-transport.strategy';
export declare class OutlookOAuthStrategy implements EmailTransportStrategy {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    send(options: EmailDispatchOptions): Promise<EmailDispatchResult>;
    private refreshOutlookAccessToken;
}
