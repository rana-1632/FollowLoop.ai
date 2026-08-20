export declare class ParseInteractionDto {
    text: string;
    referenceDate?: string;
    senderName?: string;
}
export declare class ParsedInitialDraftDto {
    subject: string;
    body: string;
}
export declare class ParseInteractionResponseDto {
    contactName: string;
    company: string | null;
    email?: string | null;
    channel: 'EMAIL' | 'LINKEDIN' | 'WHATSAPP';
    contextSummary: string;
    suggestedDate: string;
    initialDraft: ParsedInitialDraftDto;
    isFallback?: boolean;
    model?: string;
    generationEngine?: 'LLM_AI' | 'FALLBACK_RULE_ENGINE';
}
