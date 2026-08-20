import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { TaskStatus } from '@prisma/client';

@ApiTags('Follow-Up Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Schedule a new follow-up task' })
  @ApiResponse({ status: 201, description: 'Follow-up task created' })
  async create(@GetUser('id') userId: string, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List follow-up tasks for current user' })
  @ApiQuery({ name: 'status', enum: TaskStatus, required: false, description: 'Filter by task status' })
  @ApiQuery({ name: 'overdue', type: Boolean, required: false, description: 'Only show overdue pending tasks' })
  @ApiResponse({ status: 200, description: 'List of follow-up tasks' })
  async findAll(
    @GetUser('id') userId: string,
    @Query('status') status?: TaskStatus,
    @Query('overdue') overdue?: string,
  ) {
    const isOverdue = overdue === 'true';
    return this.tasksService.findAll(userId, status, isOverdue);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details for a single task' })
  @ApiResponse({ status: 200, description: 'Task detail returned' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async findOne(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.tasksService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update follow-up task status, draft, or due date' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  async update(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete follow-up task' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  async remove(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.tasksService.remove(userId, id);
  }
}
