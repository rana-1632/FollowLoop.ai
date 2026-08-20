import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiPropertyOptional({ example: 1, description: 'Retry count for automated dispatch attempts' })
  @IsInt()
  @Min(0)
  @IsOptional()
  retryCount?: number;
}

