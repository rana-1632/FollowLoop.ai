import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { GmailOAuthStrategy } from './strategies/gmail-oauth.strategy';
import { OutlookOAuthStrategy } from './strategies/outlook-oauth.strategy';

@Module({
  controllers: [EmailController],
  providers: [EmailService, GmailOAuthStrategy, OutlookOAuthStrategy],
  exports: [EmailService, GmailOAuthStrategy, OutlookOAuthStrategy],
})
export class EmailModule {}
