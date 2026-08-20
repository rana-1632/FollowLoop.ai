import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InboundWebhookDto {
  @ApiProperty({ example: 'sarah@company.com', description: 'Sender email address of incoming reply' })
  @IsEmail()
  @IsNotEmpty()
  from: string;

  @ApiProperty({ example: 'user@followloop.ai', description: 'Recipient email address (user or domain inbound address)' })
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @ApiProperty({ example: 'Re: Venue Booking Quotation', description: 'Subject line of incoming reply' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiPropertyOptional({ example: 'Hi! Yes, we would love to schedule the walkthrough next Tuesday.', description: 'Body text of incoming reply' })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiPropertyOptional({ example: '<p>Hi! Yes...</p>', description: 'HTML body of incoming reply' })
  @IsString()
  @IsOptional()
  html?: string;

  @ApiPropertyOptional({ example: 'msg_123456789', description: 'Message ID header from email provider' })
  @IsString()
  @IsOptional()
  messageId?: string;
}
