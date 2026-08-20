import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { PrismaModule } from './common/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { AiModule } from './modules/ai/ai.module';
import { EmailModule } from './modules/email/email.module';
import { CronModule } from './modules/cron/cron.module';
import { SequencesModule } from './modules/sequences/sequences.module';
import { DiagnosticsModule } from './modules/diagnostics/diagnostics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    HealthModule,
    AuthModule,
    ContactsModule,
    TasksModule,
    AiModule,
    EmailModule,
    CronModule,
    SequencesModule,
    DiagnosticsModule,
  ],
})
export class AppModule {}
