import { AiService } from './ai.service';
import { GenerateEmailDto, GenerateEmailResponseDto, ParseInteractionDto, ParseInteractionResponseDto, GenerateSequenceDto, GenerateSequenceResponseDto, PostReplySequenceDto } from './dto';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    parseInteraction(dto: ParseInteractionDto): Promise<ParseInteractionResponseDto>;
    generateFollowUpSequence(userId: string, dto: GenerateSequenceDto): Promise<GenerateSequenceResponseDto>;
    generatePostReplySequence(userId: string, dto: PostReplySequenceDto): Promise<any>;
    generateEmailDraft(userId: string, dto: GenerateEmailDto): Promise<GenerateEmailResponseDto>;
    generateAndSaveForTask(userId: string, taskId: string): Promise<{
        task: {
            contact: {
                name: string;
                email: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                company: string | null;
                channel: import(".prisma/client").$Enums.Channel;
                lastInteractionDate: Date | null;
                currentStage: string;
                phone: string | null;
                position: string | null;
                notes: string | null;
                userId: string;
            };
        } & {
            title: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.TaskStatus;
            userId: string | null;
            suggestedDate: Date;
            contactId: string;
            aiGeneratedContent: string | null;
            subjectLine: string | null;
            retryCount: number;
        };
        generatedDraft: GenerateEmailResponseDto;
    }>;
}
