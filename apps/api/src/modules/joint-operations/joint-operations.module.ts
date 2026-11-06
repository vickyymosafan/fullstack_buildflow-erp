import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { JointOperationsController } from './joint-operations.controller';
import { JointOperationsService } from './joint-operations.service';

@Module({
  imports: [PrismaModule],
  controllers: [JointOperationsController],
  providers: [JointOperationsService],
  exports: [JointOperationsService],
})
export class JointOperationsModule {}

