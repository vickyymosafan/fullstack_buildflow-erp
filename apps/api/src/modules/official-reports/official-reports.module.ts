import { Module } from '@nestjs/common';
import { OfficialReportsController } from './official-reports.controller';
import { OfficialReportsService } from './official-reports.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OfficialReportsController],
  providers: [OfficialReportsService],
  exports: [OfficialReportsService],
})
export class OfficialReportsModule {}
