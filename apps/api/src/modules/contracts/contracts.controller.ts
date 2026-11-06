import { Controller, Get, Post, Patch, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ContractsService, ClauseRiskLevel } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { AnalyzeClauseDto } from './dto/analyze-clause.dto';
import { SimulateLdDto } from './dto/simulate-ld.dto';
import { PredictDisputeDto } from './dto/predict-dispute.dto';
import { CreateAmendmentDto } from './dto/create-amendment.dto';

@ApiTags('AI Legal Contract Clause Analyzer & Construction Dispute Predictor')
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Ringkasan KPI portfolio kontrak, klausul berisiko, prediksi sengketa, dan eksposur LD' })
  getSummary() {
    return this.contractsService.getSummary();
  }

  @Get()
  @ApiOperation({ summary: 'Daftar seluruh kontrak konstruksi aktif dan historis' })
  @ApiQuery({ name: 'type', required: false, enum: ['ALL', 'FIDIC_RED', 'FIDIC_YELLOW', 'FIDIC_SILVER', 'LPSE_PUPR', 'PRIVATE_TURNKEY'] })
  @ApiQuery({ name: 'status', required: false, enum: ['ALL', 'ACTIVE', 'AT_RISK', 'DISPUTED', 'AMENDED', 'COMPLETED'] })
  getContracts(@Query('type') type?: string, @Query('status') status?: string) {
    return this.contractsService.getContracts(type, status);
  }

  @Get('clauses/list')
  @ApiOperation({ summary: 'Daftar klausul kontrak yang telah dianalisis oleh AI Legal' })
  @ApiQuery({ name: 'contractId', required: false })
  @ApiQuery({ name: 'riskLevel', required: false, enum: ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] })
  @ApiQuery({ name: 'category', required: false })
  getClauses(
    @Query('contractId') contractId?: string,
    @Query('riskLevel') riskLevel?: string,
    @Query('category') category?: string,
  ) {
    return this.contractsService.getClauses(contractId, riskLevel, category);
  }

  @Post('clauses/analyze')
  @ApiOperation({ summary: 'Jalankan analisis AI terhadap teks klausul kontrak baru' })
  analyzeClause(@Body() dto: AnalyzeClauseDto) {
    return this.contractsService.analyzeClause(dto);
  }

  @Patch('clauses/:id/risk')
  @ApiOperation({ summary: 'Perbarui tingkat risiko atau catatan legal reviewer pada klausul' })
  @ApiParam({ name: 'id', description: 'ID klausul' })
  updateClauseRisk(
    @Param('id') id: string,
    @Body() body: { riskLevel: ClauseRiskLevel; notes?: string },
  ) {
    return this.contractsService.updateClauseRisk(id, body.riskLevel, body.notes);
  }

  @Post('calculator/simulate-ld')
  @ApiOperation({ summary: 'Simulasi kalkulator denda keterlambatan (Liquidated Damages / LD) & mitigasi EOT' })
  simulateLiquidatedDamages(@Body() dto: SimulateLdDto) {
    return this.contractsService.simulateLiquidatedDamages(dto);
  }

  @Get('disputes/predictions')
  @ApiOperation({ summary: 'Daftar hasil prediksi risiko sengketa proyek & arbitrase BANI' })
  @ApiQuery({ name: 'contractId', required: false })
  getDisputePredictions(@Query('contractId') contractId?: string) {
    return this.contractsService.getDisputePredictions(contractId);
  }

  @Post('disputes/predict')
  @ApiOperation({ summary: 'Hitung indeks probabilitas sengketa komposit berdasarkan SPI, aging MC, dan klaim CCO' })
  predictDispute(@Body() dto: PredictDisputeDto) {
    return this.contractsService.predictDispute(dto);
  }

  @Get('amendments/list')
  @ApiOperation({ summary: 'Daftar riwayat addendum dan amandemen kontrak konstruksi' })
  @ApiQuery({ name: 'contractId', required: false })
  getAmendments(@Query('contractId') contractId?: string) {
    return this.contractsService.getAmendments(contractId);
  }

  @Post('amendments')
  @ApiOperation({ summary: 'Daftarkan addendum kontrak baru beserta penyesuaian biaya dan perpanjangan waktu EOT' })
  createAmendment(@Body() dto: CreateAmendmentDto) {
    return this.contractsService.createAmendment(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail kontrak spesifik beserta riwayat klausul, risiko sengketa, dan addendum' })
  @ApiParam({ name: 'id', description: 'ID atau nomor kontrak' })
  getContractById(@Param('id') id: string) {
    return this.contractsService.getContractById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Pendaftaran kontrak baru ke sistem AI Legal Analyzer' })
  createContract(@Body() dto: CreateContractDto) {
    return this.contractsService.createContract(dto);
  }
}
