import { Module } from '@nestjs/common';
import { IotGatewayController } from './iot-gateway.controller';
import { IotGatewayService } from './iot-gateway.service';

@Module({
  controllers: [IotGatewayController],
  providers: [IotGatewayService],
  exports: [IotGatewayService],
})
export class IotGatewayModule {}
