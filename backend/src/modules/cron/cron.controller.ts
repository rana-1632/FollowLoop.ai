import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CronService } from './cron.service';

@ApiTags('Autonomous Cron & Triggers')
@Controller('cron')
export class CronController {
  constructor(private readonly cronService: CronService) {}

  @Post('process-overdue-followups')
  @ApiOperation({ summary: 'Trigger autonomous scan to auto-generate AI email drafts and dispatch due follow-ups' })
  @ApiResponse({ status: 200, description: 'Batch process completed successfully' })
  async processOverdueFollowUps() {
    return this.cronService.processOverdueFollowUps();
  }

  @Post('trigger-manual')
  @ApiOperation({ summary: 'Manual trigger endpoint for on-demand execution of automated follow-up batch processing' })
  @ApiResponse({ status: 200, description: 'Manual follow-up trigger completed' })
  async triggerManual() {
    return this.cronService.processOverdueFollowUps();
  }
}
