import { Module } from '@nestjs/common';
import { BimController } from './bim.controller';
import { BimService } from './bim.service';

@Module({
  controllers: [BimController],
  providers: [BimService],
  exports: [BimService],
})
export class BimModule {}

