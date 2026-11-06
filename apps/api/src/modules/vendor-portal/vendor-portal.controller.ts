import { Controller, Get, Post, Patch, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { VendorPortalService } from './vendor-portal.service';
import { RegisterVendorDto } from './dto/register-vendor.dto';
import { EvaluateVendorDto } from './dto/evaluate-vendor.dto';
import { CreateRfqDto } from './dto/create-rfq.dto';
import { SubmitBidDto } from './dto/submit-bid.dto';

@ApiTags('Vendor Portal & E-Procurement')
@Controller('vendor-portal')
export class VendorPortalController {
  constructor(private readonly vendorPortalService: VendorPortalService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Ringkasan KPI rekanan, tier rating, lelang e-RFQ, dan verifikasi legalitas' })
  getSummary() {
    return this.vendorPortalService.getSummary();
  }

  @Get('vendors')
  @ApiOperation({ summary: 'Direktori rekanan, supplier & subkontraktor dengan filter tier dan kategori' })
  @ApiQuery({ name: 'tier', required: false, enum: ['ALL', 'GOLD', 'SILVER', 'BRONZE', 'BLACKLISTED'] })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'legalStatus', required: false, enum: ['ALL', 'VERIFIED', 'PENDING', 'REJECTED', 'EXPIRED'] })
  @ApiQuery({ name: 'search', required: false })
  getVendors(
    @Query('tier') tier?: string,
    @Query('category') category?: string,
    @Query('legalStatus') legalStatus?: string,
    @Query('search') search?: string,
  ) {
    return this.vendorPortalService.getVendors(tier, category, legalStatus, search);
  }

  @Get('vendors/:id')
  @ApiOperation({ summary: 'Detail profil rekanan, riwayat evaluasi VPE, dan bids' })
  @ApiParam({ name: 'id', description: 'ID atau kode vendor (e.g. VND-001 atau VND-2026-001)' })
  getVendorById(@Param('id') id: string) {
    return this.vendorPortalService.getVendorById(id);
  }

  @Post('vendors')
  @ApiOperation({ summary: 'Pendaftaran mandiri rekanan baru (Self-service Prequalification)' })
  registerVendor(@Body() dto: RegisterVendorDto) {
    return this.vendorPortalService.registerVendor(dto);
  }

  @Patch('vendors/:id/verify-legal')
  @ApiOperation({ summary: 'Verifikasi & persetujuan dokumen legalitas OSS & LPJK rekanan' })
  @ApiParam({ name: 'id', description: 'ID atau kode vendor' })
  verifyLegalStatus(
    @Param('id') id: string,
    @Body() body: { isApproved: boolean; notes?: string },
  ) {
    return this.vendorPortalService.verifyLegalStatus(id, body.isApproved, body.notes);
  }

  @Patch('vendors/:id/sanction')
  @ApiOperation({ summary: 'Pemberian sanksi blacklist / pencabutan sanksi pembekuan rekanan' })
  @ApiParam({ name: 'id', description: 'ID atau kode vendor' })
  sanctionVendor(
    @Param('id') id: string,
    @Body() body: { action: 'BLACKLIST' | 'UNFREEZE'; reason: string },
  ) {
    return this.vendorPortalService.sanctionVendor(id, body.action, body.reason);
  }

  @Get('evaluations')
  @ApiOperation({ summary: 'Riwayat evaluasi kinerja berkala (Vendor Performance Evaluation / VPE)' })
  @ApiQuery({ name: 'vendorId', required: false })
  @ApiQuery({ name: 'projectId', required: false })
  getEvaluations(
    @Query('vendorId') vendorId?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.vendorPortalService.getEvaluations(vendorId, projectId);
  }

  @Post('evaluations')
  @ApiOperation({ summary: 'Input scoring evaluasi VPE berbasis 4 pilar: Mutu, Waktu, K3, Komersial' })
  evaluateVendor(@Body() dto: EvaluateVendorDto) {
    return this.vendorPortalService.evaluateVendor(dto);
  }

  @Get('rfq')
  @ApiOperation({ summary: 'Daftar paket pengadaan lelang digital e-RFQ' })
  @ApiQuery({ name: 'status', required: false, enum: ['ALL', 'OPEN', 'UNDER_EVALUATION', 'AWARDED', 'CANCELLED'] })
  @ApiQuery({ name: 'projectId', required: false })
  getRfqs(
    @Query('status') status?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.vendorPortalService.getRfqs(status, projectId);
  }

  @Post('rfq')
  @ApiOperation({ summary: 'Pembuatan dan publikasi paket pengadaan digital e-RFQ baru' })
  createRfq(@Body() dto: CreateRfqDto) {
    return this.vendorPortalService.createRfq(dto);
  }

  @Post('rfq/:id/bids')
  @ApiOperation({ summary: 'Pemasukan penawaran harga tersandi (*sealed bid*) oleh rekanan' })
  @ApiParam({ name: 'id', description: 'ID atau nomor RFQ' })
  submitBid(
    @Param('id') id: string,
    @Body() dto: SubmitBidDto,
  ) {
    return this.vendorPortalService.submitBid(id, dto);
  }

  @Get('rfq/:id/bids')
  @ApiOperation({ summary: 'Daftar penawaran masuk pada paket e-RFQ' })
  @ApiParam({ name: 'id', description: 'ID atau nomor RFQ' })
  getBidsByRfq(@Param('id') id: string) {
    return this.vendorPortalService.getBidsByRfq(id);
  }
}

