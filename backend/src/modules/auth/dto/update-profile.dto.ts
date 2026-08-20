import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Alex Morgan', description: 'Full user display name' })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ example: 'Acme Innovations', description: 'User company name' })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb', description: 'User profile picture or avatar URL' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
