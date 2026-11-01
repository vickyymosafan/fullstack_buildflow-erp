import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('Executive Analytics & Earned Value Management (EVM)')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('executive-summary')
  @ApiOperation({ summary: 'Ringkasan Portofolio Eksekutif & Health Matrix Proyek' })
  @ApiResponse({ status: 200, description: 'Ringkasan portofolio eksekutif berhasil diambil' })
  async getExecutiveSummary() {
    const data = await this.analyticsService.getExecutiveSummary();
    return { success: true, data };
  }

  @Get('evm/:projectCode')
  @ApiOperation({ summary: 'Kalkulasi Earned Value Management (PV, EV, AC, CPI, SPI, EAC)' })
  @ApiResponse({ status: 200, description: 'Metrik EVM proyek berhasil dihitung' })
  async getProjectEVM(@Param('projectCode') projectCode: string) {
    const data = await this.analyticsService.getProjectEVM(projectCode);
    return { success: true, data };
  }

  @Get('s-curve/:projectCode')
  @ApiOperation({ summary: 'Data Time-Series Kurva-S Proyek (Planned vs Earned vs Actual)' })
  @ApiResponse({ status: 200, description: 'Data kurva-S proyek berhasil diambil' })
  async getSCurve(@Param('projectCode') projectCode: string) {
    const data = await this.analyticsService.getSCurve(projectCode);
    return { success: true, data };
  }
}

