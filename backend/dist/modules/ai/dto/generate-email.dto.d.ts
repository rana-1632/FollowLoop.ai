export declare class GenerateEmailDto {
    contactId: string;
    purpose?: string;
    tone?: string;
    customContext?: string;
}
export declare class GenerateEmailResponseDto {
    subject: string;
    body: string;
    model: string;
    contactId?: string;
    isFallback?: boolean;
    generationEngine?: 'LLM_AI' | 'FALLBACK_RULE_ENGINE';
}
