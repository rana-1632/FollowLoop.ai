import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DiagnosticsService } from './diagnostics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Diagnostics & Verification')
@Controller('diagnostics')
export class DiagnosticsController {
  constructor(private readonly diagnosticsService: DiagnosticsService) {}

  @Get('email-check')
  @ApiOperation({
    summary: 'Email Transport Diagnostics & Health Verification Endpoint',
    description:
      'Programmatically checks the health of the active email transport layer (Google OAuth, Outlook OAuth, Resend, or SMTP), verifies token validity, and tests provider API network connectivity latency.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns real-time transport health, OAuth token status, and network latency diagnostics',
  })
  async checkEmailHealth(@Request() req: any) {
    const userId = req.user?.id || req.user?.userId;
    return this.diagnosticsService.checkEmailTransportHealth(userId);
  }
}
