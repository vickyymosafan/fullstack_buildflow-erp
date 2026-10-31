import { Module } from '@nestjs/common';
import { SiteReportsService } from './site-reports.service';
import { SiteReportsController } from './site-reports.controller';

@Module({
  controllers: [SiteReportsController],
  providers: [SiteReportsService],
  exports: [SiteReportsService],
})
export class SiteReportsModule {}

