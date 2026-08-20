import { Channel } from '@prisma/client';
export declare class GenerateSequenceDto {
    contactId?: string;
    previousMessage?: string;
    channel?: Channel;
    tone?: string;
    ignoredDays?: number;
}
export declare class SequenceVariationStepDto {
    step: number;
    name: string;
    recommendedDelayDays: number;
    subject: string;
    body: string;
}
export declare class GenerateSequenceResponseDto {
    sequence1: SequenceVariationStepDto;
    sequence2: SequenceVariationStepDto;
    model: string;
    isFallback?: boolean;
    generationEngine?: 'LLM_AI' | 'FALLBACK_RULE_ENGINE';
}
