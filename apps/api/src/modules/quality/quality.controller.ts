import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QualityService } from './quality.service';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { CreateNCRDto } from './dto/create-ncr.dto';

@ApiTags('Quality & Safety (K3 / HSE & QC)')
@Controller('quality')
export class QualityController {
  constructor(private readonly qualityService: QualityService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Ringkasan KPI Mutu (QC) & Statistik K3 / Zero Accident' })
  @ApiResponse({ status: 200, description: 'Metrik mutu dan statistik keselamatan berhasil diambil' })
  async getSummary() {
    const data = await this.qualityService.getSummary();
    return { success: true, data };
  }

  @Get('inspections')
  @ApiOperation({ summary: 'Daftar audit inspeksi mutu, checklist K3, dan log temuan lapangan' })
  @ApiResponse({ status: 200, description: 'Daftar inspeksi berhasil diambil' })
  async getInspections(
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
  ) {
    const data = await this.qualityService.getInspections(
      category,
      status,
      limit ? Number(limit) : 50,
    );
    return { success: true, data, count: data.length };
  }

  @Post('inspections')
  @ApiOperation({ summary: 'Pencatatan hasil inspeksi rutin QC / checklist harian K3' })
  @ApiResponse({ status: 201, description: 'Inspeksi berhasil dicatat' })
  async createInspection(@Body() dto: CreateInspectionDto) {
    const data = await this.qualityService.createInspection(dto);
    return { success: true, data, message: 'Inspeksi berhasil disimpan' };
  }

  @Post('ncr')
  @ApiOperation({ summary: 'Penerbitan Non-Conformance Report (NCR) atas ketidaksesuaian kritis lapangan' })
  @ApiResponse({ status: 201, description: 'NCR resmi berhasil diterbitkan' })
  async createNCR(@Body() dto: CreateNCRDto) {
    const data = await this.qualityService.createNCR(dto);
    return {
      success: true,
      data,
      message: `Surat Laporan Ketidaksesuaian (${data.ncrNumber}) berhasil diterbitkan dan masuk antrean tindak lanjut`,
    };
  }
}

