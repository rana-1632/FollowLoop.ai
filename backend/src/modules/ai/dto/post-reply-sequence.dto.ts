import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PostReplySequenceDto {
  @ApiProperty({
    example: 'Hi! Yes, we reviewed the venue walkthrough quote and would like to confirm our booking.',
    description: 'Text content of the incoming email reply received from the prospect',
  })
  @IsString()
  replyText: string;

  @ApiPropertyOptional({
    example: 'contact-uuid-1234',
    description: 'Target contact ID in PostgreSQL CRM',
  })
  @IsString()
  @IsOptional()
  contactId?: string;

  @ApiPropertyOptional({
    example: 'Consultative, warm, decisive',
    description: 'Desired tone of voice for post-reply follow-up draft',
  })
  @IsString()
  @IsOptional()
  tone?: string;
}
