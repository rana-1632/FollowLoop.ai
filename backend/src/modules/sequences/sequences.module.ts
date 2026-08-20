import { Module } from '@nestjs/common';
import { SequencesService } from './sequences.service';
import { SequencesController } from './sequences.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SequencesController],
  providers: [SequencesService],
  exports: [SequencesService],
})
export class SequencesModule {}
