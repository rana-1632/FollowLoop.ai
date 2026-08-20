import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Channel } from '@prisma/client';
import { IsDateString, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateContactDto {
  @ApiProperty({ example: 'Sarah Jenkins', description: 'Full contact name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'sarah.j@acmecorp.io', description: 'Contact email address' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'Acme Corp', description: 'Contact organization / company' })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiPropertyOptional({ enum: Channel, default: Channel.EMAIL, description: 'Communication channel (EMAIL, LINKEDIN, WHATSAPP)' })
  @IsEnum(Channel)
  @IsOptional()
  channel?: Channel;

  @ApiPropertyOptional({ example: '2026-08-10T14:30:00Z', description: 'Last interaction date' })
  @IsDateString()
  @IsOptional()
  lastInteractionDate?: string;

  @ApiPropertyOptional({ example: 'PROSPECT', description: 'Current pipeline stage (e.g. LEAD, PROSPECT, PITCHED, WON, LOST)' })
  @IsString()
  @IsOptional()
  currentStage?: string;

  @ApiPropertyOptional({ example: '+1-555-019-2831', description: 'Contact phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'VP of Engineering', description: 'Position or job title' })
  @IsString()
  @IsOptional()
  position?: string;

  @ApiPropertyOptional({ example: 'Interested in AI follow-up workflows.', description: 'Notes or conversation summary' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: 'New Lead', description: 'Pipeline status label' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 'Follow-up #1 scheduled', description: 'Next step summary' })
  @IsString()
  @IsOptional()
  nextStep?: string;

  @ApiPropertyOptional({ example: 85, description: 'Lead score' })
  @IsOptional()
  score?: number;
}
