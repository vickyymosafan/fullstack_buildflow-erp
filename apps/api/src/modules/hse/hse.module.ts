import { Module } from '@nestjs/common';
import { HseController } from './hse.controller';
import { HseService } from './hse.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HseController],
  providers: [HseService],
  exports: [HseService],
})
export class HseModule {}

