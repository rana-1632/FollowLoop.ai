import { EmailProvider } from '@prisma/client';
export declare class ConnectEmailAccountDto {
    email: string;
    displayName?: string;
    provider?: EmailProvider;
    smtpHost?: string;
    smtpPort?: number;
    username?: string;
    password?: string;
    isDefault?: boolean;
}
