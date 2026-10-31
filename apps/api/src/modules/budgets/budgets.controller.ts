import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';

@ApiTags('Cost Estimation & Budget (RAB / RAP)')
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Dapatkan rincian anggaran RAB yang disetujui per proyek' })
  @ApiResponse({ status: 200, description: 'Rincian RAB berhasil diambil' })
  async getBudget(@Param('projectId') projectId: string) {
    const data = await this.budgetsService.getBudgetByProject(projectId);
    return {
      success: true,
      data,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Get('variance/:projectId')
  @ApiOperation({ summary: 'Kalkulasi deviasi realisasi biaya vs RAB baseline per kategori biaya' })
  @ApiResponse({ status: 200, description: 'Analisis variansi biaya konstruksi berhasil dikalkulasi' })
  async getVariance(@Param('projectId') projectId: string) {
    const data = await this.budgetsService.getBudgetVariance(projectId);
    return {
      success: true,
      data,
      meta: { timestamp: new Date().toISOString() },
    };
  }
}

