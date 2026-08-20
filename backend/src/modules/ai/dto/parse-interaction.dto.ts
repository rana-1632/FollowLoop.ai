import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ParseInteractionDto {
  @ApiProperty({
    example: 'I emailed HR at Acme Corp about an internship position on August 8',
    description: 'Raw natural-language interaction text or notes to analyze and parse',
  })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiPropertyOptional({
    example: '2026-08-12',
    description: 'Optional ISO reference date for relative date extraction (defaults to current date if omitted)',
  })
  @IsString()
  @IsOptional()
  referenceDate?: string;

  @ApiPropertyOptional({
    example: 'Mohsin Ali',
    description: 'Optional sender name for email sign-offs (defaults to current user name if omitted)',
  })
  @IsString()
  @IsOptional()
  senderName?: string;
}

export class ParsedInitialDraftDto {
  @ApiProperty({ example: 'Following up on Internship Application', description: 'Suggested subject line for follow-up draft' })
  subject: string;

  @ApiProperty({ example: 'Hi HR Team,\n\nI hope you are doing well...', description: 'Suggested email or message body draft' })
  body: string;
}

export class ParseInteractionResponseDto {
  @ApiProperty({ example: 'HR Department', description: 'Extracted contact or person name' })
  contactName: string;

  @ApiProperty({ example: 'Acme Corp', nullable: true, description: 'Extracted company name' })
  company: string | null;

  @ApiProperty({ example: 'ahmed@grandluxe.com', nullable: true, description: 'Extracted email address if present' })
  email?: string | null;

  @ApiProperty({ example: 'EMAIL', enum: ['EMAIL', 'LINKEDIN', 'WHATSAPP'], description: 'Extracted communication channel' })
  channel: 'EMAIL' | 'LINKEDIN' | 'WHATSAPP';

  @ApiProperty({ example: 'Emailed HR regarding an internship opportunity on August 8.', description: 'Structured concise summary of interaction' })
  contextSummary: string;

  @ApiProperty({ example: '2026-08-13', description: 'Recommended smart follow-up date (YYYY-MM-DD format)' })
  suggestedDate: string;

  @ApiProperty({ type: ParsedInitialDraftDto, description: 'Personalized initial follow-up draft' })
  initialDraft: ParsedInitialDraftDto;

  @ApiPropertyOptional({ example: false, description: 'Indicates whether deterministic rule-based fallback was used' })
  isFallback?: boolean;

  @ApiPropertyOptional({ example: 'llama-3.3-70b-versatile', description: 'AI model identifier or fallback-template' })
  model?: string;

  @ApiPropertyOptional({ example: 'LLM_AI', enum: ['LLM_AI', 'FALLBACK_RULE_ENGINE'], description: 'Engine used for sequence generation' })
  generationEngine?: 'LLM_AI' | 'FALLBACK_RULE_ENGINE';
}
