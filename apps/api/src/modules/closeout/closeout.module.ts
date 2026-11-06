import { Module } from '@nestjs/common';
import { CloseoutService } from './closeout.service';
import { CloseoutController } from './closeout.controller';

@Module({
  controllers: [CloseoutController],
  providers: [CloseoutService],
  exports: [CloseoutService],
})
export class CloseoutModule {}

