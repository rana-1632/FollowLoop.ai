import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'contact-uuid-1234', description: 'Associated contact ID' })
  @IsString()
  @IsNotEmpty()
  contactId: string;

  @ApiProperty({ example: '2026-08-20T10:00:00Z', description: 'Suggested follow-up date' })
  @IsDateString()
  @IsNotEmpty()
  suggestedDate: string;

  @ApiPropertyOptional({ example: 'Check in regarding technical proposal feedback', description: 'Task title / topic' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Draft content prepared by AI...', description: 'AI generated email content' })
  @IsString()
  @IsOptional()
  aiGeneratedContent?: string;

  @ApiPropertyOptional({ example: 'Following up on our recent meeting', description: 'Subject line' })
  @IsString()
  @IsOptional()
  subjectLine?: string;

  @ApiPropertyOptional({ enum: TaskStatus, default: TaskStatus.PENDING, description: 'Task execution status' })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;
}
