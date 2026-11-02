import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HseService } from './hse.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { CreatePtwDto } from './dto/create-ptw.dto';
import { UpdatePtwStatusDto } from './dto/update-ptw-status.dto';
import { CreateTbmDto } from './dto/create-tbm.dto';
import { CreateHseInspectionDto } from './dto/create-hse-inspection.dto';

@ApiTags('HSE & K3 Konstruksi')
@Controller('hse')
export class HseController {
  constructor(private readonly hseService: HseService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Mendapatkan ringkasan statistik HSE (LTIFR, Severity Rate, Safe Man-Hours, APD)' })
  async getSummary(@Query('projectCode') projectCode?: string) {
    return this.hseService.getSummary(projectCode);
  }

  @Get('incidents')
  @ApiOperation({ summary: 'Mendapatkan daftar insiden dan near-miss keselamatan kerja' })
  async getIncidents(@Query('projectCode') projectCode?: string) {
    return this.hseService.getIncidents(projectCode);
  }

  @Post('incidents')
  @ApiOperation({ summary: 'Mencatat pelaporan insiden, first aid, atau near-miss baru' })
  async createIncident(@Body() dto: CreateIncidentDto) {
    return this.hseService.createIncident(dto);
  }

  @Get('ptw')
  @ApiOperation({ summary: 'Mendapatkan daftar Digital Permit to Work (PTW) risiko tinggi' })
  async getPtwList(@Query('projectCode') projectCode?: string) {
    return this.hseService.getPtwList(projectCode);
  }

  @Post('ptw')
  @ApiOperation({ summary: 'Mengajukan Permit to Work (PTW) baru untuk pekerjaan berbahaya' })
  async createPtw(@Body() dto: CreatePtwDto) {
    return this.hseService.createPtw(dto);
  }

  @Patch('ptw/:id/status')
  @ApiOperation({ summary: 'Memperbarui status persetujuan PTW (Approved / Rejected / Closed)' })
  async updatePtwStatus(@Param('id') id: string, @Body() dto: UpdatePtwStatusDto) {
    return this.hseService.updatePtwStatus(id, dto);
  }

  @Get('tbm')
  @ApiOperation({ summary: 'Mendapatkan daftar Toolbox Meeting (TBM) & Safety Induction harian' })
  async getTbmList(@Query('projectCode') projectCode?: string) {
    return this.hseService.getTbmList(projectCode);
  }

  @Post('tbm')
  @ApiOperation({ summary: 'Mencatat sesi Toolbox Meeting (TBM) harian mandor dan pekerja' })
  async createTbm(@Body() dto: CreateTbmDto) {
    return this.hseService.createTbm(dto);
  }

  @Get('inspections')
  @ApiOperation({ summary: 'Mendapatkan data audit kepatuhan APD & observasi bahaya (Unsafe Act / Condition)' })
  async getInspections(@Query('projectCode') projectCode?: string) {
    return this.hseService.getInspections(projectCode);
  }

  @Post('inspections')
  @ApiOperation({ summary: 'Mencatat audit inspeksi APD dan temuan bahaya lapangan' })
  async createHseInspection(@Body() dto: CreateHseInspectionDto) {
    return this.hseService.createHseInspection(dto);
  }
}

