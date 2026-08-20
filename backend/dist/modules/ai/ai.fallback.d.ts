import { ParseInteractionResponseDto, GenerateSequenceResponseDto, GenerateEmailResponseDto } from './dto';
export declare class AiFallbackService {
    static fallbackParseInteraction(text: string, referenceDate: string): ParseInteractionResponseDto & {
        sequence1?: any;
        sequence2?: any;
    };
    static fallbackSequenceVariations(contactName: string, company: string): GenerateSequenceResponseDto & {
        isFallback?: boolean;
        generationEngine?: string;
    };
    static generateFallbackDraft(recipientName: string, company: string, purpose?: string, contactId?: string): GenerateEmailResponseDto & {
        generationEngine?: string;
    };
    static fallbackPostReplySequence(replyText: string, contactName?: string): {
        sentiment: string;
        suggestedNextStep: string;
        sequence1: {
            step: number;
            name: string;
            recommendedDelayDays: number;
            subject: string;
            body: string;
        };
        sequence2: {
            step: number;
            name: string;
            recommendedDelayDays: number;
            subject: string;
            body: string;
        };
        isFallback: boolean;
        model: string;
        generationEngine: string;
    };
    private static calculateDefaultFollowUpDate;
}
