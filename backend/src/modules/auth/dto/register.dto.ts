import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'alex@example.com', description: 'User account email address' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecurePassword123!', description: 'Password (minimum 6 characters)' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'Alex Mercer', description: 'Full name of user' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ example: 'Acme Agency LLC', description: 'Optional company name' })
  @IsString()
  @IsOptional()
  companyName?: string;
}
