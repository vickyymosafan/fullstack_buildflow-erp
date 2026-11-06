import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { HandoverService } from './handover.service';
import { CreateHandoverCertificateDto } from './dto/create-handover-certificate.dto';
import { CreatePunchListDto } from './dto/create-punch-list.dto';
import { CreateRetentionReleaseDto } from './dto/create-retention-release.dto';

@ApiTags('Project Handover (PHO / BAST I, FHO / BAST II, DLP & Retention Release)')
@Controller('handover')
export class HandoverController {
  constructor(private readonly handoverService: HandoverService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Mendapatkan ringkasan metrik serah terima proyek, DLP, dan pelepasan retensi' })
  @ApiQuery({ name: 'projectCode', required: false })
  getSummary(@Query('projectCode') projectCode?: string) {
    return this.handoverService.getSummary(projectCode);
  }

  @Get('certificates')
  @ApiOperation({ summary: 'Mendapatkan daftar Berita Acara Serah Terima (PHO BAST I & FHO BAST II)' })
  @ApiQuery({ name: 'projectCode', required: false })
  @ApiQuery({ name: 'type', required: false, enum: ['ALL', 'PHO_BAST_1', 'FHO_BAST_2'] })
  getCertificates(
    @Query('projectCode') projectCode?: string,
    @Query('type') type?: string,
  ) {
    return this.handoverService.getCertificates(projectCode, type);
  }

  @Post('certificates')
  @ApiOperation({ summary: 'Menerbitkan Berita Acara Serah Terima pekerjaan baru (PHO / FHO)' })
  @ApiResponse({ status: 201, description: 'Sertifikat serah terima berhasil diterbitkan' })
  createCertificate(@Body() dto: CreateHandoverCertificateDto) {
    return this.handoverService.createCertificate(dto);
  }

  @Patch('certificates/:id/sign')
  @ApiOperation({ summary: 'Menandatangani Berita Acara Serah Terima (PPHP / Kontraktor / PPK Owner)' })
  signCertificate(
    @Param('id') id: string,
    @Body() body: { signatoryRole: 'PPHP' | 'CONTRACTOR' | 'OWNER_PPK'; notes?: string },
  ) {
    return this.handoverService.signCertificate(id, body.signatoryRole, body.notes);
  }

  @Get('punch-lists')
  @ApiOperation({ summary: 'Mendapatkan daftar cacat mutu perbaikan selama masa pemeliharaan (Punch List DLP)' })
  @ApiQuery({ name: 'certificateId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'severity', required: false })
  getPunchLists(
    @Query('certificateId') certificateId?: string,
    @Query('status') status?: string,
    @Query('severity') severity?: string,
  ) {
    return this.handoverService.getPunchLists(certificateId, status, severity);
  }

  @Post('punch-lists')
  @ApiOperation({ summary: 'Mencatat temuan cacat mutu baru selama masa pemeliharaan' })
  @ApiResponse({ status: 201, description: 'Punch list berhasil dicatat' })
  createPunchList(@Body() dto: CreatePunchListDto) {
    return this.handoverService.createPunchList(dto);
  }

  @Patch('punch-lists/:id/rectify')
  @ApiOperation({ summary: 'Menyatakan perbaikan cacat mutu telah selesai dilakukan oleh kontraktor' })
  rectifyPunchList(
    @Param('id') id: string,
    @Body() body: { afterPhotoUrl?: string; notes?: string },
  ) {
    return this.handoverService.rectifyPunchList(id, body.afterPhotoUrl || '', body.notes);
  }

  @Patch('punch-lists/:id/close')
  @ApiOperation({ summary: 'Menutup dan mengesahkan tuntasnya perbaikan oleh Konsultan Pengawas MK / Owner' })
  closePunchList(
    @Param('id') id: string,
    @Body() body: { verifiedBy?: string; notes?: string },
  ) {
    return this.handoverService.closePunchList(id, body.verifiedBy || '', body.notes);
  }

  @Get('retention-releases')
  @ApiOperation({ summary: 'Mendapatkan daftar pencairan cadangan retensi 5% atau pelepasan jaminan bank' })
  @ApiQuery({ name: 'certificateId', required: false })
  getRetentionReleases(@Query('certificateId') certificateId?: string) {
    return this.handoverService.getRetentionReleases(certificateId);
  }

  @Post('retention-releases')
  @ApiOperation({ summary: 'Mengajukan pencairan retensi kas atau pelepasan bank garansi pemeliharaan' })
  @ApiResponse({ status: 201, description: 'Pengajuan pencairan retensi berhasil dibuat' })
  createRetentionRelease(@Body() dto: CreateRetentionReleaseDto) {
    return this.handoverService.createRetentionRelease(dto);
  }

  @Patch('retention-releases/:id/approve')
  @ApiOperation({ summary: 'Otorisasi persetujuan pelepasan dana retensi (Finance / Owner PPK)' })
  approveRetentionRelease(
    @Param('id') id: string,
    @Body() body: { approverRole: 'FINANCE' | 'OWNER_PPK'; notes?: string },
  ) {
    return this.handoverService.approveRetentionRelease(id, body.approverRole, body.notes);
  }
}
