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
import { JointOperationsService } from './joint-operations.service';
import { CreateConsortiumDto } from './dto/create-consortium.dto';
import { CreateSharedExpenseDto } from './dto/create-shared-expense.dto';
import { CreateProfitDistributionDto } from './dto/create-profit-distribution.dto';
import { CalculateTaxDto } from './dto/calculate-tax.dto';

@ApiTags('Project Joint Operation (KSO / JO) & Consortium Financials')
@Controller('joint-operations')
export class JointOperationsController {
  constructor(private readonly jointOperationsService: JointOperationsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Mendapatkan ringkasan KPI portofolio KSO, saldo rekening kas bersama, dan total pajak' })
  @ApiQuery({ name: 'projectCode', required: false })
  async getSummary(@Query('projectCode') projectCode?: string) {
    return this.jointOperationsService.getSummary(projectCode);
  }

  @Get('consortiums')
  @ApiOperation({ summary: 'Mendapatkan daftar struktur konsorsium KSO, porsi modal, dan rekening bersama' })
  @ApiQuery({ name: 'projectCode', required: false })
  async getConsortiums(@Query('projectCode') projectCode?: string) {
    return this.jointOperationsService.getConsortiums(projectCode);
  }

  @Post('consortiums')
  @ApiOperation({ summary: 'Mendaftarkan kemitraan konsorsium KSO baru' })
  async createConsortium(@Body() dto: CreateConsortiumDto) {
    return this.jointOperationsService.createConsortium(dto);
  }

  @Get('expenses')
  @ApiOperation({ summary: 'Mendapatkan daftar pengeluaran beban bersama KSO dan status otorisasi dual-signatory' })
  @ApiQuery({ name: 'ksoCode', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'status', required: false })
  async getSharedExpenses(
    @Query('ksoCode') ksoCode?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ) {
    return this.jointOperationsService.getSharedExpenses(ksoCode, category, status);
  }

  @Post('expenses')
  @ApiOperation({ summary: 'Mengajukan pengeluaran beban bersama (direct job cost / overhead) KSO baru' })
  async createSharedExpense(@Body() dto: CreateSharedExpenseDto) {
    return this.jointOperationsService.createSharedExpense(dto);
  }

  @Patch('expenses/:id/approve')
  @ApiOperation({ summary: 'Menyetujui pengeluaran beban bersama oleh penandatangan resmi (Lead atau Partner)' })
  async approveSharedExpense(
    @Param('id') id: string,
    @Body() body: { signatoryRole: 'LEAD' | 'PARTNER'; notes?: string },
  ) {
    return this.jointOperationsService.approveSharedExpense(id, body.signatoryRole, body.notes);
  }

  @Get('distributions')
  @ApiOperation({ summary: 'Mendapatkan daftar jadwal dan realisasi distribusi laba/dividen periodik KSO' })
  @ApiQuery({ name: 'ksoCode', required: false })
  async getProfitDistributions(@Query('ksoCode') ksoCode?: string) {
    return this.jointOperationsService.getProfitDistributions(ksoCode);
  }

  @Post('distributions')
  @ApiOperation({ summary: 'Menerbitkan distribusi laba/dividen periodik KSO berdasarkan porsi ekuitas' })
  async createProfitDistribution(@Body() dto: CreateProfitDistributionDto) {
    return this.jointOperationsService.createProfitDistribution(dto);
  }

  @Get('taxes')
  @ApiOperation({ summary: 'Mendapatkan rekap pemotongan pajak konstruksi (PPh Final 4(2) PP 9/2022 & PPN)' })
  @ApiQuery({ name: 'ksoCode', required: false })
  async getTaxes(@Query('ksoCode') ksoCode?: string) {
    return this.jointOperationsService.getTaxes(ksoCode);
  }

  @Post('taxes/calculate')
  @ApiOperation({ summary: 'Simulasi dan kalkulasi pajak konstruksi otomatis sesuai PP No. 9 Tahun 2022' })
  async calculateTax(@Body() dto: CalculateTaxDto) {
    return this.jointOperationsService.calculateTax(dto);
  }
}

