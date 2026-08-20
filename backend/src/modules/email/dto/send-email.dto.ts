import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendEmailDto {
  @ApiProperty({ example: 'contact-uuid-1234', description: 'Target contact ID' })
  @IsString()
  @IsNotEmpty()
  contactId: string;

  @ApiPropertyOptional({ example: 'task-uuid-5678', description: 'Optional associated follow-up task ID' })
  @IsString()
  @IsOptional()
  taskId?: string;

  @ApiProperty({ example: 'Following up on our SaaStr discussion', description: 'Email subject line' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ example: 'Hi Sarah,\n\nI hope you are doing well...', description: 'Email body text or HTML' })
  @IsString()
  @IsNotEmpty()
  bodyContent: string;
}
