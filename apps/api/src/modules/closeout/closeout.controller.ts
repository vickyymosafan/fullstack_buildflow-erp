import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CloseoutService } from './closeout.service';
import { CreateFinalAccountDto } from './dto/create-final-account.dto';
import { CreateAsBuiltDocDto } from './dto/create-as-built-doc.dto';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@ApiTags('Closeout')
@Controller('closeout')
export class CloseoutController {
  constructor(private readonly closeoutService: CloseoutService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Dapatkan ringkasan metrik closeout, as-built, dan audit trail' })
  getSummary() {
    return this.closeoutService.getSummary();
  }

  @Get('final-accounts')
  @ApiOperation({ summary: 'Daftar perhitungan final account settlement proyek' })
  getFinalAccounts(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.closeoutService.getFinalAccounts(status, search);
  }

  @Post('final-accounts')
  @ApiOperation({ summary: 'Buat rekonsiliasi final account settlement baru' })
  createFinalAccount(@Body() dto: CreateFinalAccountDto) {
    return this.closeoutService.createFinalAccount(dto);
  }

  @Patch('final-accounts/:id/approve')
  @ApiOperation({ summary: 'Persetujuan berjenjang Final Account (QS, MK, Owner/PPK)' })
  approveFinalAccount(
    @Param('id') id: string,
    @Body() body: { role: 'QUANTITY_SURVEYOR' | 'MK_CONSULTANT' | 'OWNER_PPK'; signerName: string },
  ) {
    return this.closeoutService.approveFinalAccount(id, body.role, body.signerName);
  }

  @Get('as-built-documents')
  @ApiOperation({ summary: 'Daftar pengarsipan gambar As-Built & Manual O&M' })
  getAsBuiltDocs(
    @Query('discipline') discipline?: string,
    @Query('search') search?: string,
  ) {
    return this.closeoutService.getAsBuiltDocs(discipline, search);
  }

  @Post('as-built-documents')
  @ApiOperation({ summary: 'Unggah / daftarkan dokumen gambar As-Built baru' })
  createAsBuiltDoc(@Body() dto: CreateAsBuiltDocDto) {
    return this.closeoutService.createAsBuiltDoc(dto);
  }

  @Patch('as-built-documents/:id/verify')
  @ApiOperation({ summary: 'Verifikasi kesesuaian gambar As-Built oleh Konsultan MK' })
  verifyAsBuiltDoc(
    @Param('id') id: string,
    @Body() body: { verifierName: string },
  ) {
    return this.closeoutService.verifyAsBuiltDoc(id, body.verifierName);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Daftar riwayat jejak audit (audit trail) kepatuhan sistem' })
  getAuditLogs(
    @Query('action') action?: string,
    @Query('module') module?: string,
    @Query('search') search?: string,
  ) {
    return this.closeoutService.getAuditLogs(action, module, search);
  }

  @Post('audit-logs')
  @ApiOperation({ summary: 'Catat entri jejak audit baru' })
  createAuditLog(@Body() dto: CreateAuditLogDto) {
    return this.closeoutService.createAuditLog(dto);
  }

  @Get('audit-logs/export')
  @ApiOperation({ summary: 'Ekspor berkas rekapitulasi audit trail resmi untuk auditor BPK/BPKP' })
  exportAuditLogs() {
    return this.closeoutService.exportAuditLogs();
  }
}
