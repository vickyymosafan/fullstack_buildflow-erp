import { Module } from '@nestjs/common';
import { PrecastPrestressController } from './precast-prestress.controller';
import { PrecastPrestressService } from './precast-prestress.service';

@Module({
  controllers: [PrecastPrestressController],
  providers: [PrecastPrestressService],
  exports: [PrecastPrestressService],
})
export class PrecastPrestressModule {}
