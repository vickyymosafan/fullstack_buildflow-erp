import { Controller, Get, Post, Patch, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { TreasuryService } from './treasury.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { CreateBatchDisbursementDto } from './dto/create-batch-disbursement.dto';
import { GenerateVirtualAccountDto } from './dto/generate-virtual-account.dto';
import { SweepCashPoolDto } from './dto/sweep-cash-pool.dto';

@ApiTags('Enterprise Multi-Company Treasury & Banking H2H')
@Controller('treasury')
export class TreasuryController {
  constructor(private readonly treasuryService: TreasuryService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Ringkasan posisi likuiditas kas korporat, rekening escrow KSO, batch disbursement, dan status rekonsiliasi' })
  getSummary() {
    return this.treasuryService.getSummary();
  }

  @Get('accounts')
  @ApiOperation({ summary: 'Daftar rekening bank korporat, escrow KSO, dan operasional proyek terintegrasi H2H' })
  @ApiQuery({ name: 'type', required: false, enum: ['ALL', 'MASTER_HOLDING', 'PROJECT_OPERATIONAL', 'KSO_ESCROW', 'TAX_RESERVE'] })
  @ApiQuery({ name: 'bankName', required: false })
  getBankAccounts(@Query('type') type?: string, @Query('bankName') bankName?: string) {
    return this.treasuryService.getBankAccounts(type, bankName);
  }

  @Post('accounts')
  @ApiOperation({ summary: 'Koneksikan rekening bank korporat baru ke Treasury H2H Gateway' })
  createBankAccount(@Body() dto: CreateBankAccountDto) {
    return this.treasuryService.createBankAccount(dto);
  }

  @Get('disbursements')
  @ApiOperation({ summary: 'Daftar batch disbursement payroll mandor & subkontraktor SPK' })
  @ApiQuery({ name: 'status', required: false, enum: ['ALL', 'DRAFT_MAKER', 'PENDING_CHECKER', 'PENDING_SIGNER', 'EXECUTED_H2H', 'REJECTED'] })
  @ApiQuery({ name: 'bankPartner', required: false })
  getDisbursements(@Query('status') status?: string, @Query('bankPartner') bankPartner?: string) {
    return this.treasuryService.getDisbursements(status, bankPartner);
  }

  @Post('disbursements')
  @ApiOperation({ summary: 'Buat batch disbursement baru oleh Maker' })
  createBatchDisbursement(@Body() dto: CreateBatchDisbursementDto) {
    return this.treasuryService.createBatchDisbursement(dto);
  }

  @Patch('disbursements/:id/authorize')
  @ApiOperation({ summary: 'Otorisasi 3-tier batch disbursement (Checker / Signer / Dual-Signatory KSO)' })
  @ApiParam({ name: 'id', description: 'ID atau nomor batch disbursement' })
  authorizeDisbursement(
    @Param('id') id: string,
    @Body() body: { role: 'CHECKER' | 'SIGNER' | 'KSO_SIGNER'; authorizerName: string; isApproved: boolean },
  ) {
    return this.treasuryService.authorizeDisbursement(id, body.role, body.authorizerName, body.isApproved);
  }

  @Get('virtual-accounts')
  @ApiOperation({ summary: 'Daftar Dynamic Virtual Account (VA) penagihan termin MC dan invoice owner' })
  @ApiQuery({ name: 'status', required: false, enum: ['ALL', 'PENDING_PAYMENT', 'PAID', 'EXPIRED', 'CANCELLED'] })
  @ApiQuery({ name: 'projectId', required: false })
  getVirtualAccounts(@Query('status') status?: string, @Query('projectId') projectId?: string) {
    return this.treasuryService.getVirtualAccounts(status, projectId);
  }

  @Post('virtual-accounts')
  @ApiOperation({ summary: 'Generate dynamic VA baru untuk penagihan termin MC proyek' })
  generateVirtualAccount(@Body() dto: GenerateVirtualAccountDto) {
    return this.treasuryService.generateVirtualAccount(dto);
  }

  @Get('reconciliations')
  @ApiOperation({ summary: 'Riwayat dan status rekonsiliasi mutasi rekening otomatis (MT940 / CAMT.053)' })
  getReconciliations() {
    return this.treasuryService.getReconciliations();
  }

  @Post('reconciliations/upload-mt940')
  @ApiOperation({ summary: 'Upload dan parsing berkas SWIFT MT940 bank statement untuk rekonsiliasi GL' })
  uploadMt940(@Body() body: { statementText: string; bankName: string; accountNumber: string }) {
    return this.treasuryService.uploadMt940(body);
  }

  @Get('cash-pooling')
  @ApiOperation({ summary: 'Posisi likuiditas cash pooling holding dan status target balancing ZBA proyek' })
  getCashPooling() {
    return this.treasuryService.getCashPooling();
  }

  @Post('cash-pooling/sweep')
  @ApiOperation({ summary: 'Eksekusi transfer cash sweeping ZBA atau top-up target balancing' })
  executeSweep(@Body() dto: SweepCashPoolDto) {
    return this.treasuryService.executeSweep(dto);
  }
}
