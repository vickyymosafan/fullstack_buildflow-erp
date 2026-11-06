import { Module } from '@nestjs/common';
import { ExecutiveBiService } from './executive-bi.service';
import { ExecutiveBiController } from './executive-bi.controller';

@Module({
  controllers: [ExecutiveBiController],
  providers: [ExecutiveBiService],
  exports: [ExecutiveBiService],
})
export class ExecutiveBiModule {}

