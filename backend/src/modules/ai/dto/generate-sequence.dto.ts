import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Channel } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class GenerateSequenceDto {
  @ApiPropertyOptional({
    example: 'contact-uuid-1234',
    description: 'Target contact ID to retrieve stored pipeline context and background notes',
  })
  @IsString()
  @IsOptional()
  contactId?: string;

  @ApiPropertyOptional({
    example: 'Hi Alex, sending over our SaaS product demo proposal for review.',
    description: 'Content or context of the previous message that went unanswered',
  })
  @IsString()
  @IsOptional()
  previousMessage?: string;

  @ApiPropertyOptional({
    enum: ['EMAIL', 'LINKEDIN', 'WHATSAPP'],
    default: 'EMAIL',
    description: 'Communication channel for follow-up sequence variations',
  })
  @IsEnum(Channel)
  @IsOptional()
  channel?: Channel;

  @ApiPropertyOptional({
    example: 'Polite, value-oriented, professional persistence',
    description: 'Desired tone or style for the sequence variations',
  })
  @IsString()
  @IsOptional()
  tone?: string;

  @ApiPropertyOptional({
    example: 5,
    description: 'Number of days elapsed since the initial unanswered outreach',
  })
  @IsNumber()
  @IsOptional()
  ignoredDays?: number;
}

export class SequenceVariationStepDto {
  @ApiProperty({ example: 1, description: 'Step sequence index (1 for gentle bump, 2 for value-add/break-up)' })
  step: number;

  @ApiProperty({ example: 'Gentle Bump', description: 'Descriptive title for sequence strategy' })
  name: string;

  @ApiProperty({ example: 3, description: 'Recommended delay in days after previous step' })
  recommendedDelayDays: number;

  @ApiProperty({ example: 'Re: Quick check-in on proposal', description: 'Generated subject line' })
  subject: string;

  @ApiProperty({ example: 'Hi Alex,\n\nJust bumping this up to see if you had a chance to review...', description: 'Generated message body content' })
  body: string;
}

export class GenerateSequenceResponseDto {
  @ApiProperty({ type: SequenceVariationStepDto, description: 'Sequence 1: Gentle check-in / polite bump (3-5 days after silence)' })
  sequence1: SequenceVariationStepDto;

  @ApiProperty({ type: SequenceVariationStepDto, description: 'Sequence 2: Value-add & final call-to-action / soft break-up (7-10 days after silence)' })
  sequence2: SequenceVariationStepDto;

  @ApiProperty({ example: 'gpt-4o-mini', description: 'AI model used for generation' })
  model: string;

  @ApiPropertyOptional({ example: false, description: 'Indicates whether fallback template was used' })
  isFallback?: boolean;

  @ApiPropertyOptional({ example: 'LLM_AI', enum: ['LLM_AI', 'FALLBACK_RULE_ENGINE'], description: 'Engine used for generation' })
  generationEngine?: 'LLM_AI' | 'FALLBACK_RULE_ENGINE';
}
