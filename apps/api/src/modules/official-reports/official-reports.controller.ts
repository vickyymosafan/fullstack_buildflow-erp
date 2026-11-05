import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { OfficialReportsService } from './official-reports.service';
import { CreateOfficialReportDto } from './dto/create-official-report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { CreateBastBapDto } from './dto/create-bast-bap.dto';

@ApiTags('Official Construction Reporting & Kurva S EVM (PUPR Standards)')
@Controller('official-reports')
export class OfficialReportsController {
  constructor(private readonly officialReportsService: OfficialReportsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Mendapatkan ringkasan KPI proyek, analisis EVM, dan metrik deviasi biaya/jadwal' })
  @ApiQuery({ name: 'projectCode', required: false })
  async getSummary(@Query('projectCode') projectCode?: string) {
    return this.officialReportsService.getSummary(projectCode);
  }

  @Get('kurva-s')
  @ApiOperation({ summary: 'Mendapatkan data titik Kurva S mingguan (Planned vs Actual vs Actual Cost)' })
  @ApiQuery({ name: 'projectCode', required: false })
  async getKurvaSData(@Query('projectCode') projectCode?: string) {
    return this.officialReportsService.getKurvaSData(projectCode);
  }

  @Get('bast-bap')
  @ApiOperation({ summary: 'Mendapatkan daftar Berita Acara Pembayaran (BAP) dan Serah Terima (BAST-1 PHO, BAST-2 FHO)' })
  @ApiQuery({ name: 'projectCode', required: false })
  @ApiQuery({ name: 'docType', required: false })
  @ApiQuery({ name: 'status', required: false })
  async getBastBap(
    @Query('projectCode') projectCode?: string,
    @Query('docType') docType?: string,
    @Query('status') status?: string,
  ) {
    return this.officialReportsService.getBastBap(projectCode, docType, status);
  }

  @Post('bast-bap')
  @ApiOperation({ summary: 'Menerbitkan dokumen Berita Acara Pembayaran (BAP) atau Serah Terima Fisik (BAST)' })
  async createBastBap(@Body() dto: CreateBastBapDto) {
    return this.officialReportsService.createBastBap(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Mendapatkan daftar Laporan Resmi Berkala (Harian, Mingguan, Bulanan)' })
  @ApiQuery({ name: 'projectCode', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'status', required: false })
  async getReports(
    @Query('projectCode') projectCode?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.officialReportsService.getReports(projectCode, type, status);
  }

  @Get('print-preview')
  @ApiOperation({ summary: 'Mendapatkan struktur tata letak dokumen cetak resmi standar PUPR A4 (proyek aktif)' })
  @ApiQuery({ name: 'projectCode', required: false })
  async getGeneralPrintPreview(@Query('projectCode') projectCode?: string) {
    return this.officialReportsService.getPrintPreview(projectCode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan detail Laporan Berkala resmi' })
  async getReportById(@Param('id') id: string) {
    return this.officialReportsService.getReportById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Mengajukan Laporan Berkala konstruksi baru' })
  async createReport(@Body() dto: CreateOfficialReportDto) {
    return this.officialReportsService.createReport(dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Memperbarui status pengesahan / tanda tangan digital laporan resmi oleh MK atau Owner' })
  async updateReportStatus(
    @Param('id') id: string,
    @Body() dto: UpdateReportStatusDto,
  ) {
    return this.officialReportsService.updateReportStatus(id, dto);
  }

  @Get(':id/print')
  @ApiOperation({ summary: 'Mendapatkan struktur tata letak dokumen cetak resmi standar PUPR A4' })
  async getPrintPreview(@Param('id') id: string) {
    return this.officialReportsService.getPrintPreview(id);
  }
}
