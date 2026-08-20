import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';
import { ConnectEmailAccountDto } from './dto/connect-email-account.dto';
import { InboundWebhookDto } from './dto/inbound-webhook.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Email Dispatch, Connected Accounts & Inbound Webhooks')
@Controller('emails')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Dispatch email via Resend/SMTP and record audit log in EmailLog' })
  @ApiResponse({ status: 201, description: 'Email dispatched and logged successfully' })
  @ApiResponse({ status: 404, description: 'Target contact not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendEmail(@GetUser('id') userId: string, @Body() dto: SendEmailDto) {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new UnauthorizedException('Authentication required. Missing or invalid user identity.');
    }
    return this.emailService.sendEmail(userId, dto);
  }

  @Get('logs')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Retrieve complete email dispatch audit logs for current user' })
  @ApiResponse({ status: 200, description: 'List of email audit logs returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getEmailLogs(@GetUser('id') userId: string) {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new UnauthorizedException('Authentication required. Missing or invalid user identity.');
    }
    return this.emailService.getEmailLogs(userId);
  }

  @Delete('logs/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete individual email audit log entry' })
  async deleteEmailLog(@GetUser('id') userId: string, @Param('id') logId: string) {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new UnauthorizedException('Authentication required.');
    }
    return this.emailService.deleteEmailLog(userId, logId);
  }

  @Post('logs/bulk-delete')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Bulk delete selected or all email audit log entries' })
  async bulkDeleteEmailLogs(
    @GetUser('id') userId: string,
    @Body() body: { logIds?: string[] },
  ) {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new UnauthorizedException('Authentication required.');
    }
    return this.emailService.bulkDeleteEmailLogs(userId, body?.logIds);
  }

  @Post('accounts')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Link user sending email account (SMTP, Resend custom identity, OAuth)' })
  @ApiResponse({ status: 201, description: 'Sending email account connected successfully' })
  async connectEmailAccount(
    @GetUser('id') userId: string,
    @Body() dto: ConnectEmailAccountDto,
  ) {
    return this.emailService.connectEmailAccount(userId, dto);
  }

  @Get('oauth/google/url')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get Google OAuth 2.0 Consent Authorization URL' })
  getGoogleAuthUrl(@GetUser('id') userId: string) {
    return this.emailService.getGoogleAuthUrl(userId);
  }

  @Get('oauth/google/callback')
  @ApiOperation({ summary: 'Google OAuth 2.0 Authorization Callback Handler' })
  async handleGoogleOAuthCallback(
    @Query('code') code: string,
    @Query('state') stateUserId: string,
    @Res() res: Response,
  ) {
    const redirectUrl = await this.emailService.handleGoogleOAuthCallback(code, stateUserId);
    return res.redirect(redirectUrl);
  }

  @Get('oauth/outlook/url')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get Microsoft Outlook OAuth 2.0 Authorization URL' })
  getOutlookAuthUrl(@GetUser('id') userId: string) {
    return this.emailService.getOutlookAuthUrl(userId);
  }

  @Get('oauth/outlook/callback')
  @ApiOperation({ summary: 'Microsoft Outlook OAuth 2.0 Authorization Callback Handler' })
  async handleOutlookOAuthCallback(
    @Query('code') code: string,
    @Query('state') stateUserId: string,
    @Res() res: Response,
  ) {
    const redirectUrl = await this.emailService.handleOutlookOAuthCallback(code, stateUserId);
    return res.redirect(redirectUrl);
  }

  @Get('accounts')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List linked sending email accounts for current user' })
  @ApiResponse({ status: 200, description: 'List of user email accounts returned' })
  async getUserEmailAccounts(@GetUser('id') userId: string) {
    return this.emailService.getUserEmailAccounts(userId);
  }

  @Patch('accounts/:id/default')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Set connected email account as default sender' })
  async setDefaultEmailAccount(
    @GetUser('id') userId: string,
    @Param('id') accountId: string,
  ) {
    return this.emailService.setDefaultEmailAccount(userId, accountId);
  }

  @Delete('accounts/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove connected sending email account' })
  async deleteEmailAccount(
    @GetUser('id') userId: string,
    @Param('id') accountId: string,
  ) {
    return this.emailService.deleteEmailAccount(userId, accountId);
  }

  @Post('webhook/inbound')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Public Inbound Email Webhook (Tracks incoming replies & transitions stage to REPLIED)' })
  @ApiResponse({ status: 200, description: 'Inbound email webhook processed successfully' })
  async handleInboundWebhook(@Body() dto: InboundWebhookDto) {
    return this.emailService.handleInboundWebhook(dto);
  }
}
