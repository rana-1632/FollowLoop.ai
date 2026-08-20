import { Module } from '@nestjs/common';
import { DiagnosticsController } from './diagnostics.controller';
import { DiagnosticsService } from './diagnostics.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DiagnosticsController],
  providers: [DiagnosticsService],
  exports: [DiagnosticsService],
})
export class DiagnosticsModule {}
