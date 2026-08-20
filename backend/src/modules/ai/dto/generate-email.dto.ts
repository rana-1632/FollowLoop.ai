import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GenerateEmailDto {
  @ApiProperty({ example: 'contact-uuid-1234', description: 'Target contact ID' })
  @IsString()
  @IsNotEmpty()
  contactId: string;

  @ApiPropertyOptional({
    example: 'Friendly check-in after proposal sent 5 days ago.',
    description: 'Goal or purpose of follow-up email',
  })
  @IsString()
  @IsOptional()
  purpose?: string;

  @ApiPropertyOptional({
    example: 'Professional, consultative, warm',
    description: 'Desired email tone (e.g. Professional, Casual, Urgent, Warm)',
  })
  @IsString()
  @IsOptional()
  tone?: string;

  @ApiPropertyOptional({
    example: 'Special offer valid until Friday.',
    description: 'Additional custom context or highlights to mention',
  })
  @IsString()
  @IsOptional()
  customContext?: string;
}

export class GenerateEmailResponseDto {
  @ApiProperty({
    example: 'Re: Quick check-in regarding product demo',
    description: 'Generated subject line for the follow-up email',
  })
  subject: string;

  @ApiProperty({
    example: 'Hi Alex,\n\nI hope you are having a productive week...',
    description: 'Generated body text for the follow-up email',
  })
  body: string;

  @ApiProperty({ example: 'gpt-4o-mini', description: 'AI model used for draft generation' })
  model: string;

  @ApiPropertyOptional({ example: 'contact-uuid-1234', description: 'Target contact ID if applicable' })
  contactId?: string;

  @ApiPropertyOptional({ example: true, description: 'Indicates whether fallback template was used' })
  isFallback?: boolean;

  @ApiPropertyOptional({ example: 'LLM_AI', enum: ['LLM_AI', 'FALLBACK_RULE_ENGINE'], description: 'Engine used for generation' })
  generationEngine?: 'LLM_AI' | 'FALLBACK_RULE_ENGINE';
}

