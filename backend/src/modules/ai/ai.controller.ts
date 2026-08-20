import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import {
  GenerateEmailDto,
  GenerateEmailResponseDto,
  ParseInteractionDto,
  ParseInteractionResponseDto,
  GenerateSequenceDto,
  GenerateSequenceResponseDto,
  PostReplySequenceDto,
} from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('AI Email Generation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('parse-interaction')
  @ApiOperation({
    summary: 'Parse natural-language interaction text into CRM metadata and initial follow-up draft',
    description:
      'Analyzes unstructured text (e.g. "I emailed HR about an internship on August 8") to extract contact name, company, channel, interaction summary, smart suggested follow-up date, and a personalized initial draft.',
  })
  @ApiResponse({
    status: 200,
    description: 'Extracted contactName, company, channel, contextSummary, suggestedDate, and initialDraft',
    type: ParseInteractionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation error on input text' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Missing or invalid JWT token' })
  async parseInteraction(@Body() dto: ParseInteractionDto): Promise<ParseInteractionResponseDto> {
    return this.aiService.parseInteraction(dto);
  }

  @Post('generate-sequence')
  @ApiOperation({
    summary: 'Generate 2-step follow-up sequence variations (Sequence 1 & Sequence 2) for silent or non-responsive leads',
    description:
      'Creates a multi-step re-engagement sequence. Sequence 1 (Gentle Bump) and Sequence 2 (Value-Add / Soft Break-Up) when a contact has ignored a previous message.',
  })
  @ApiResponse({
    status: 200,
    description: 'Multi-step follow-up sequence variations generated successfully',
    type: GenerateSequenceResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Missing or invalid JWT token' })
  async generateFollowUpSequence(
    @GetUser('id') userId: string,
    @Body() dto: GenerateSequenceDto,
  ): Promise<GenerateSequenceResponseDto> {
    return this.aiService.generateFollowUpSequence(userId, dto);
  }

  @Post('post-reply-sequence')
  @ApiOperation({
    summary: 'Analyze customer reply sentiment and generate post-reply continuation sequence',
    description:
      'Analyzes incoming email reply text, identifies customer sentiment, and generates tailored post-reply follow-up steps.',
  })
  @ApiResponse({ status: 200, description: 'Post-reply continuation sequence generated' })
  async generatePostReplySequence(
    @GetUser('id') userId: string,
    @Body() dto: PostReplySequenceDto,
  ) {
    return this.aiService.generatePostReplySequence(userId, dto);
  }

  @Post('generate-email')
  @ApiOperation({
    summary: 'Generate custom AI follow-up email draft using gpt-4o-mini',
    description: 'Generates a tailored email subject line and body draft for a specific contact and purpose.',
  })
  @ApiResponse({
    status: 200,
    description: 'Generated email subject line and body content returned',
    type: GenerateEmailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async generateEmailDraft(
    @GetUser('id') userId: string,
    @Body() dto: GenerateEmailDto,
  ): Promise<GenerateEmailResponseDto> {
    return this.aiService.generateEmailDraft(userId, dto);
  }

  @Post('tasks/:taskId/generate')
  @ApiOperation({
    summary: 'Generate AI email draft and automatically attach to a FollowUpTask',
    description: 'Generates follow-up subject and body content and updates the specified FollowUpTask record.',
  })
  @ApiResponse({ status: 200, description: 'Task updated with generated subject and draft' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async generateAndSaveForTask(
    @GetUser('id') userId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.aiService.generateAndSaveForTask(userId, taskId);
  }
}
