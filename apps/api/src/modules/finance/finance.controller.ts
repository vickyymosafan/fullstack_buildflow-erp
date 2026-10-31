import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { PostReceiptJournalDto } from './dto/post-receipt-journal.dto';

@ApiTags('Finance & Construction Accounting')
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('accounts')
  @ApiOperation({ summary: 'Daftar Bagan Akun Standar Konstruksi (Chart of Accounts)' })
  async getAccounts() {
    const data = await this.financeService.getAccounts();
    return { success: true, data, count: data.length };
  }

  @Get('journals')
  @ApiOperation({ summary: 'Buku Besar Umum Jurnal Berpasangan (Double-Entry General Ledger)' })
  async getJournals(@Query('limit') limit?: number) {
    const data = await this.financeService.getJournals(limit ? Number(limit) : 30);
    return { success: true, data, count: data.length };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Ringkasan Posisi Keuangan, Neraca Saldo (Trial Balance), dan Laba Rugi' })
  async getSummary() {
    const data = await this.financeService.getSummary();
    return { success: true, data };
  }

  @Post('journals')
  @ApiOperation({ summary: 'Pencatatan Jurnal Manual dengan Validasi Integritas Debit = Kredit' })
  async createJournal(@Body() dto: CreateJournalDto) {
    const data = await this.financeService.createJournal(dto);
    return {
      success: true,
      data,
      message: 'Jurnal berpasangan berhasil diposting ke Buku Besar Umum secara seimbang',
    };
  }

  @Post('post-receipt-journal')
  @ApiOperation({ summary: 'Auto-jurnal penerimaan barang (Persediaan Debit, Utang Usaha Kredit)' })
  async postReceiptJournal(@Body() dto: PostReceiptJournalDto) {
    const data = await this.financeService.postGoodsReceiptJournal(dto);
    return {
      success: true,
      data,
      message: 'Auto-jurnal penerimaan barang berhasil dibukukan ke Utang Usaha (AP) dan Persediaan',
    };
  }
}

