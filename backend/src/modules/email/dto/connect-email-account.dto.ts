import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { EmailProvider } from '@prisma/client';

export class ConnectEmailAccountDto {
  @ApiProperty({ example: 'user@company.com', description: 'Sender email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: 'Mohsin Ali', description: 'Display name for outbound messages' })
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiPropertyOptional({ example: 'RESEND', enum: EmailProvider, description: 'Email provider type' })
  @IsEnum(EmailProvider)
  @IsOptional()
  provider?: EmailProvider;

  @ApiPropertyOptional({ example: 'smtp.mailtrap.io', description: 'SMTP Host (required if provider is SMTP)' })
  @IsString()
  @IsOptional()
  smtpHost?: string;

  @ApiPropertyOptional({ example: 587, description: 'SMTP Port' })
  @IsInt()
  @Min(1)
  @Max(65535)
  @IsOptional()
  smtpPort?: number;

  @ApiPropertyOptional({ example: 'smtp_username', description: 'SMTP Username' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({ example: 'secret_password', description: 'SMTP Password or API token' })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ example: true, description: 'Flag account as primary default sender' })
  @IsOptional()
  isDefault?: boolean;
}
