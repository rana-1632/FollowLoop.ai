import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SequencesService } from './sequences.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Sequences & Automation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sequences')
export class SequencesController {
  constructor(private readonly sequencesService: SequencesService) {}

  @Get(':id/leads')
  @ApiOperation({ summary: 'Get all enrolled leads & step progress for a specific sequence' })
  @ApiResponse({ status: 200, description: 'Enrolled leads list returned' })
  async getSequenceLeads(
    @GetUser('id') userId: string,
    @Param('id') sequenceId: string,
  ) {
    return this.sequencesService.getSequenceLeads(userId, sequenceId);
  }

  @Get('leads')
  @ApiOperation({ summary: 'Get all leads across all active sequences' })
  @ApiResponse({ status: 200, description: 'All sequence leads returned' })
  async getAllLeads(@GetUser('id') userId: string) {
    return this.sequencesService.getSequenceLeads(userId, 'all');
  }

  @Patch('leads/:leadId/stop')
  @ApiOperation({ summary: 'Manually stop automated follow-ups for a specific lead' })
  @ApiResponse({ status: 200, description: 'Lead sequence stopped successfully' })
  async stopLead(
    @GetUser('id') userId: string,
    @Param('leadId') leadId: string,
  ) {
    return this.sequencesService.stopLeadFollowUps(userId, leadId);
  }

  @Post('leads/:leadId/stop')
  @ApiOperation({ summary: 'Manually stop automated follow-ups (POST alias)' })
  async stopLeadPost(
    @GetUser('id') userId: string,
    @Param('leadId') leadId: string,
  ) {
    return this.sequencesService.stopLeadFollowUps(userId, leadId);
  }

  @Patch('leads/:leadId/resume')
  @ApiOperation({ summary: 'Resume automated follow-ups for a lead' })
  @ApiResponse({ status: 200, description: 'Lead sequence resumed successfully' })
  async resumeLead(
    @GetUser('id') userId: string,
    @Param('leadId') leadId: string,
  ) {
    return this.sequencesService.resumeLeadFollowUps(userId, leadId);
  }
}
