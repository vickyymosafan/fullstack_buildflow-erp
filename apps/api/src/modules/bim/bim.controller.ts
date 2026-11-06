import { Controller, Get, Post, Patch, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { BimService, BcfTopicStatus } from './bim.service';
import { CreateBimModelDto } from './dto/create-bim-model.dto';
import { CreateBcfTopicDto } from './dto/create-bcf-topic.dto';
import { RunClashCheckDto } from './dto/run-clash-check.dto';
import { Link4dScheduleDto } from './dto/link-4d-schedule.dto';
import { Map5dCostDto } from './dto/map-5d-cost.dto';

@ApiTags('BIM 4D/5D WebGL Viewer & Digital Twin')
@Controller('bim')
export class BimController {
  constructor(private readonly bimService: BimService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Ringkasan KPI model BIM, progres simulasi 4D, nilai 5D, dan isu BCF' })
  getSummary() {
    return this.bimService.getSummary();
  }

  @Get('models')
  @ApiOperation({ summary: 'Daftar model 3D federasi BIM (ARS, STR, MEP, Sipil)' })
  @ApiQuery({ name: 'discipline', required: false, enum: ['ALL', 'ARCHITECTURE', 'STRUCTURE', 'MEP', 'CIVIL_INFRASTRUCTURE'] })
  @ApiQuery({ name: 'projectId', required: false })
  getModels(@Query('discipline') discipline?: string, @Query('projectId') projectId?: string) {
    return this.bimService.getModels(discipline, projectId);
  }

  @Post('models')
  @ApiOperation({ summary: 'Unggah metadata model 3D BIM baru ke repositori' })
  createModel(@Body() dto: CreateBimModelDto) {
    return this.bimService.createModel(dto);
  }

  @Get('models/:id/elements')
  @ApiOperation({ summary: 'Daftar elemen spasial 3D dari model federasi tertentu' })
  @ApiParam({ name: 'id', description: 'ID model BIM (e.g. MOD-001)' })
  getElementsByModel(@Param('id') id: string) {
    return this.bimService.getElementsByModel(id);
  }

  @Get('4d-schedule')
  @ApiOperation({ summary: 'Data simulasi jadwal pekerjaan konstruksi 4D' })
  get4dSchedule() {
    return this.bimService.get4dSchedule();
  }

  @Patch('4d-schedule/link')
  @ApiOperation({ summary: 'Hubungkan elemen 3D BIM ke jadwal WBS milestone 4D' })
  link4dSchedule(@Body() dto: Link4dScheduleDto) {
    return this.bimService.link4dSchedule(dto);
  }

  @Get('5d-cost')
  @ApiOperation({ summary: 'Integrasi volume BOQ dan estimasi biaya 5D elemen model' })
  get5dCostData() {
    return this.bimService.get5dCostData();
  }

  @Patch('5d-cost/map')
  @ApiOperation({ summary: 'Petakan harga satuan RAP dan item BOQ ke elemen 3D BIM' })
  map5dCost(@Body() dto: Map5dCostDto) {
    return this.bimService.map5dCost(dto);
  }

  @Get('bcf/topics')
  @ApiOperation({ summary: 'Daftar tiket isu koordinasi lapangan berstandar BCF' })
  @ApiQuery({ name: 'status', required: false, enum: ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] })
  @ApiQuery({ name: 'priority', required: false, enum: ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  getBcfTopics(@Query('status') status?: string, @Query('priority') priority?: string) {
    return this.bimService.getBcfTopics(status, priority);
  }

  @Post('bcf/topics')
  @ApiOperation({ summary: 'Buat tiket isu koordinasi BCF baru lengkap dengan kamera viewpoint' })
  createBcfTopic(@Body() dto: CreateBcfTopicDto) {
    return this.bimService.createBcfTopic(dto);
  }

  @Patch('bcf/topics/:id/status')
  @ApiOperation({ summary: 'Perbarui status penyelesaian isu koordinasi BCF' })
  @ApiParam({ name: 'id', description: 'ID isu BCF' })
  updateBcfStatus(
    @Param('id') id: string,
    @Body() body: { status: BcfTopicStatus; resolutionNotes?: string },
  ) {
    return this.bimService.updateBcfStatus(id, body.status, body.resolutionNotes);
  }

  @Post('clash/run')
  @ApiOperation({ summary: 'Jalankan analisis tabrakan spasial (Clash Detection Engine)' })
  runClashCheck(@Body() dto: RunClashCheckDto) {
    return this.bimService.runClashCheck(dto);
  }
}

