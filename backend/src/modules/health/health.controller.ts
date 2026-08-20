import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import * as Sentry from '@sentry/nestjs';

@ApiTags('Health & Monitoring')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'API Health check ping' })
  @ApiResponse({ status: 200, description: 'Returns system operational health status' })
  getHealth() {
    return {
      status: 'ok',
      service: 'FollowLoop.ai Backend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('debug-sentry')
  @ApiOperation({
    summary: 'Trigger a controlled test error to verify real-time Sentry exception reporting',
    description:
      'Intentionally throws a controlled test InternalServerErrorException to verify real-time Sentry error capture.',
  })
  @ApiResponse({
    status: 500,
    description: 'Controlled test error generated and reported to Sentry dashboard',
  })
  debugSentry() {
    const testError = new Error('FollowLoop.ai Sentry Real-Time Error Audit Verification Test');
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(testError);
    }
    throw new InternalServerErrorException(
      'FollowLoop.ai Controlled Sentry Audit Test Exception',
    );
  }
}
