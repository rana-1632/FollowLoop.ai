import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { CronController } from './cron.controller';
import { AiModule } from '../ai/ai.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [AiModule, EmailModule],
  controllers: [CronController],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}
