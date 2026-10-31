import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SiteReportsService } from './site-reports.service';
import { CreateSiteReportDto } from './dto/create-site-report.dto';

@ApiTags('Site Operations & Daily Field Reports')
@Controller('site-reports')
export class SiteReportsController {
  constructor(private readonly siteReportsService: SiteReportsService) {}

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Dapatkan riwayat laporan harian lapangan per proyek' })
  @ApiResponse({ status: 200, description: 'Daftar laporan harian berhasil diambil' })
  async getByProject(@Param('projectId') projectId: string) {
    const data = await this.siteReportsService.getByProject(projectId);
    return {
      success: true,
      data,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Post()
  @ApiOperation({ summary: 'Kirim laporan harian lapangan baru (Mendukung sync dari draft offline)' })
  @ApiResponse({ status: 201, description: 'Laporan harian berhasil disimpan' })
  async createReport(@Body() dto: CreateSiteReportDto) {
    const data = await this.siteReportsService.createReport(dto);
    return {
      success: true,
      data,
      message: 'Laporan harian lapangan berhasil disinkronisasi ke server pusat',
      meta: { timestamp: new Date().toISOString() },
    };
  }
}

