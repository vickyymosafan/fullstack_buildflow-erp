import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QualityService } from './quality.service';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { CreateNCRDto } from './dto/create-ncr.dto';
import { CreateWIRDto, UpdateWIRStatusDto } from './dto/create-wir.dto';
import { CreatePunchListDto, UpdatePunchStatusDto } from './dto/create-punch-list.dto';
import { CreateMaterialTestDto } from './dto/create-material-test.dto';

@ApiTags('Quality Assurance & Control (QA/QC & Punch List)')
@Controller('quality')
export class QualityController {
  constructor(private readonly qualityService: QualityService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Ringkasan KPI Mutu (QC), WIR, NCR, Punch List & Uji Lab' })
  @ApiResponse({ status: 200, description: 'Metrik mutu berhasil diambil' })
  async getSummary() {
    const data = await this.qualityService.getSummary();
    return { success: true, data };
  }

  @Get('inspections')
  @ApiOperation({ summary: 'Daftar audit inspeksi mutu, checklist QC, dan log temuan' })
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
  @ApiOperation({ summary: 'Pencatatan hasil inspeksi rutin QC' })
  async createInspection(@Body() dto: CreateInspectionDto) {
    const data = await this.qualityService.createInspection(dto);
    return { success: true, data, message: 'Inspeksi berhasil disimpan' };
  }

  // WIR ENDPOINTS
  @Get('wir')
  @ApiOperation({ summary: 'Daftar Work Inspection Request (WIR)' })
  async getWIRList(@Query('projectCode') projectCode?: string) {
    const data = await this.qualityService.getWIRList(projectCode);
    return { success: true, data, count: data.length };
  }

  @Post('wir')
  @ApiOperation({ summary: 'Pengajuan Work Inspection Request (WIR) baru' })
  async createWIR(@Body() dto: CreateWIRDto) {
    const data = await this.qualityService.createWIR(dto);
    return { success: true, data, message: 'WIR berhasil diajukan untuk verifikasi pengawas' };
  }

  @Patch('wir/:id/status')
  @ApiOperation({ summary: 'Persetujuan / Penolakan WIR oleh Pengawas MK' })
  async updateWIRStatus(@Param('id') id: string, @Body() dto: UpdateWIRStatusDto) {
    const data = await this.qualityService.updateWIRStatus(id, dto);
    return { success: true, data, message: `Status WIR berhasil diperbarui menjadi ${dto.status}` };
  }

  // NCR ENDPOINTS
  @Get('ncr')
  @ApiOperation({ summary: 'Daftar Non-Conformance Report (NCR)' })
  async getNCRList(@Query('projectCode') projectCode?: string) {
    const data = await this.qualityService.getNCRList(projectCode);
    return { success: true, data, count: data.length };
  }

  @Post('ncr')
  @ApiOperation({ summary: 'Penerbitan Non-Conformance Report (NCR) resmi' })
  async createNCR(@Body() dto: CreateNCRDto) {
    const data = await this.qualityService.createNCR(dto);
    return {
      success: true,
      data,
      message: `Surat Laporan Ketidaksesuaian (${data.ncrNumber}) berhasil diterbitkan`,
    };
  }

  @Patch('ncr/:id/resolve')
  @ApiOperation({ summary: 'Verifikasi dan penutupan (closeout) NCR' })
  async resolveNCR(
    @Param('id') id: string,
    @Body() body: { notes: string; resolverName: string },
  ) {
    const data = await this.qualityService.resolveNCR(id, body.notes, body.resolverName);
    return { success: true, data, message: 'NCR berhasil diverifikasi selesai dan ditutup' };
  }

  // PUNCH LIST ENDPOINTS
  @Get('punch-list')
  @ApiOperation({ summary: 'Daftar item cacat dan punch list serah terima (BAST)' })
  async getPunchList(@Query('projectCode') projectCode?: string) {
    const data = await this.qualityService.getPunchList(projectCode);
    return { success: true, data, count: data.length };
  }

  @Post('punch-list')
  @ApiOperation({ summary: 'Pencatatan item punch list baru' })
  async createPunchItem(@Body() dto: CreatePunchListDto) {
    const data = await this.qualityService.createPunchItem(dto);
    return { success: true, data, message: 'Item punch list berhasil dicatat' };
  }

  @Patch('punch-list/:id/status')
  @ApiOperation({ summary: 'Pembaruan status rectifikasi punch list' })
  async updatePunchStatus(@Param('id') id: string, @Body() dto: UpdatePunchStatusDto) {
    const data = await this.qualityService.updatePunchStatus(id, dto);
    return { success: true, data, message: `Status punch list berhasil diperbarui menjadi ${dto.status}` };
  }

  // MATERIAL LAB TEST ENDPOINTS
  @Get('material-tests')
  @ApiOperation({ summary: 'Daftar hasil uji mutu material laboratorium (Beton & Baja)' })
  async getMaterialTests(@Query('projectCode') projectCode?: string) {
    const data = await this.qualityService.getMaterialTests(projectCode);
    return { success: true, data, count: data.length };
  }

  @Post('material-tests')
  @ApiOperation({ summary: 'Input data uji mutu material laboratorium' })
  async createMaterialTest(@Body() dto: CreateMaterialTestDto) {
    const data = await this.qualityService.createMaterialTest(dto);
    return {
      success: true,
      data,
      message: `Hasil uji material berhasil disimpan (Status: ${data.status})`,
    };
  }
}
