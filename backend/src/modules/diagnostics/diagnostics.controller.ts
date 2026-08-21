import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DiagnosticsService } from './diagnostics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Diagnostics & Verification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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
  async checkEmailHealth(@GetUser('id') userId: string) {
    return this.diagnosticsService.checkEmailTransportHealth(userId);
  }
}
