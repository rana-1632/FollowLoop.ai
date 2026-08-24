import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsObject } from 'class-validator';

export class InboundWebhookDataDto {
  @ApiPropertyOptional({ example: '4ef9a417-02e9-4d39-ad75-9611e0fcc33c', description: 'Resend Email ID' })
  @IsString()
  @IsOptional()
  email_id?: string;

  @ApiPropertyOptional({ example: ['Sarah Connor <sarah@company.com>'] })
  @IsOptional()
  from?: string | string[];

  @ApiPropertyOptional({ example: ['inbound@fleniiielda.resend.app'] })
  @IsOptional()
  to?: string | string[];

  @ApiPropertyOptional({ example: 'Re: Venue Booking Quotation' })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiPropertyOptional({ example: 'Hi! Yes, walkthrough next Tuesday.' })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiPropertyOptional({ example: '<p>Hi! Yes...</p>' })
  @IsString()
  @IsOptional()
  html?: string;
}

export class InboundWebhookDto {
  @ApiPropertyOptional({ example: 'email.received', description: 'Resend webhook event type' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ example: '4ef9a417-02e9-4d39-ad75-9611e0fcc33c', description: 'Direct email ID parameter' })
  @IsString()
  @IsOptional()
  email_id?: string;

  @ApiPropertyOptional({ description: 'Resend webhook event data object containing email_id, sender, subject, etc.' })
  @IsObject()
  @IsOptional()
  data?: InboundWebhookDataDto;

  @ApiPropertyOptional({ example: 'sarah@company.com', description: 'Sender email address of incoming reply' })
  @IsOptional()
  from?: string | string[];

  @ApiPropertyOptional({ example: 'inbound@fleniiielda.resend.app', description: 'Recipient email address' })
  @IsOptional()
  to?: string | string[];

  @ApiPropertyOptional({ example: 'Re: Venue Booking Quotation', description: 'Subject line of incoming reply' })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiPropertyOptional({ example: 'Hi! Yes, walkthrough next Tuesday.', description: 'Body text of incoming reply' })
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
