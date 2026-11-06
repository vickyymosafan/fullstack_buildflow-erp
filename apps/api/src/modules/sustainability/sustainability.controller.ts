import { Controller, Get, Post, Patch, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SustainabilityService } from './sustainability.service';
import { LogEmissionDto } from './dto/log-emission.dto';
import { LogWasteDto } from './dto/log-waste.dto';
import { CreateInitiativeDto } from './dto/create-initiative.dto';

@ApiTags('Sustainability & ESG')
@Controller('sustainability')
export class SustainabilityController {
  constructor(private readonly sustainabilityService: SustainabilityService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Ringkasan KPI Emisi Karbon, Daur Ulang Limbah, dan Rating BGH PUPR Korporat' })
  getSummary() {
    return this.sustainabilityService.getSummary();
  }

  @Get('emissions')
  @ApiOperation({ summary: 'Daftar pencatatan jejak karbon Scope 1, 2, dan 3 proyek' })
  @ApiQuery({ name: 'projectId', required: false })
  @ApiQuery({ name: 'scope', required: false })
  getEmissions(
    @Query('projectId') projectId?: string,
    @Query('scope') scope?: string,
  ) {
    return this.sustainabilityService.getEmissions(projectId, scope);
  }

  @Post('emissions')
  @ApiOperation({ summary: 'Pencatatan aktivitas emisi baru dengan kalkulasi otomatis kg/ton CO2e' })
  logEmission(@Body() dto: LogEmissionDto) {
    return this.sustainabilityService.logEmission(dto);
  }

  @Get('waste')
  @ApiOperation({ summary: 'Daftar neraca limbah konstruksi (CDW) dan tingkat pemilahan' })
  @ApiQuery({ name: 'projectId', required: false })
  @ApiQuery({ name: 'wasteType', required: false })
  getWasteEntries(
    @Query('projectId') projectId?: string,
    @Query('wasteType') wasteType?: string,
  ) {
    return this.sustainabilityService.getWasteEntries(projectId, wasteType);
  }

  @Post('waste')
  @ApiOperation({ summary: 'Pencatatan penanganan dan pengangkutan limbah konstruksi/B3' })
  logWaste(@Body() dto: LogWasteDto) {
    return this.sustainabilityService.logWaste(dto);
  }

  @Get('bgh-ratings')
  @ApiOperation({ summary: 'Penilaian kepatuhan Bangunan Gedung Hijau Permen PUPR No. 9/2021' })
  @ApiQuery({ name: 'projectId', required: false })
  getBghRatings(@Query('projectId') projectId?: string) {
    return this.sustainabilityService.getBghRatings(projectId);
  }

  @Get('initiatives')
  @ApiOperation({ summary: 'Daftar program inisiatif dekarbonisasi dan investasi hijau' })
  @ApiQuery({ name: 'status', required: false })
  getInitiatives(@Query('status') status?: string) {
    return this.sustainabilityService.getInitiatives(status);
  }

  @Post('initiatives')
  @ApiOperation({ summary: 'Pengajuan proposal inisiatif dekarbonisasi proyek baru' })
  createInitiative(@Body() dto: CreateInitiativeDto) {
    return this.sustainabilityService.createInitiative(dto);
  }

  @Patch('initiatives/:id/approve')
  @ApiOperation({ summary: 'Persetujuan eksekutif untuk pelaksanaan program investasi hijau' })
  approveInitiative(@Param('id') id: string) {
    return this.sustainabilityService.approveInitiative(id);
  }
}
