export interface EmailDispatchOptions {
    senderEmail: string;
    senderName?: string;
    recipientEmail: string;
    recipientName?: string;
    subject: string;
    bodyContent: string;
    emailAccount?: any;
}
export interface EmailDispatchResult {
    success: boolean;
    messageId?: string;
    error?: string;
}
export interface EmailTransportStrategy {
    send(options: EmailDispatchOptions): Promise<EmailDispatchResult>;
}
