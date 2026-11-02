import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { CreateEquipmentLogDto } from './dto/create-equipment-log.dto';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateEquipmentStatusDto } from './dto/update-equipment-status.dto';

@ApiTags('Heavy Equipment & Fleet Management')
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Mendapatkan ringkasan KPI armada alat berat & fleet' })
  @ApiQuery({ name: 'projectCode', required: false })
  async getSummary(@Query('projectCode') projectCode?: string) {
    return this.equipmentService.getSummary(projectCode);
  }

  @Get('fleet')
  @ApiOperation({ summary: 'Mendapatkan daftar master alat berat & armada proyek' })
  @ApiQuery({ name: 'projectCode', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getFleet(
    @Query('projectCode') projectCode?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.equipmentService.getFleet(projectCode, category, status, search);
  }

  @Get('fleet/:id')
  @ApiOperation({ summary: 'Mendapatkan detail alat berat berdasarkan ID' })
  async getEquipmentById(@Param('id') id: string) {
    return this.equipmentService.getEquipmentById(id);
  }

  @Post('fleet')
  @ApiOperation({ summary: 'Mendaftarkan unit alat berat baru' })
  async createEquipment(@Body() dto: CreateEquipmentDto) {
    return this.equipmentService.createEquipment(dto);
  }

  @Patch('fleet/:id/status')
  @ApiOperation({ summary: 'Memperbarui status operasional unit alat berat' })
  async updateEquipmentStatus(
    @Param('id') id: string,
    @Body() dto: UpdateEquipmentStatusDto,
  ) {
    return this.equipmentService.updateEquipmentStatus(id, dto);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Mendapatkan daftar log harian jam kerja (HM) & solar' })
  @ApiQuery({ name: 'projectCode', required: false })
  @ApiQuery({ name: 'equipmentCode', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getLogs(
    @Query('projectCode') projectCode?: string,
    @Query('equipmentCode') equipmentCode?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.equipmentService.getLogs(projectCode, equipmentCode, startDate, endDate);
  }

  @Post('logs')
  @ApiOperation({ summary: 'Mencatat log harian jam kerja dan bahan bakar' })
  async createLog(@Body() dto: CreateEquipmentLogDto) {
    return this.equipmentService.createLog(dto);
  }

  @Get('maintenance')
  @ApiOperation({ summary: 'Mendapatkan jadwal dan riwayat pemeliharaan berkala' })
  @ApiQuery({ name: 'projectCode', required: false })
  @ApiQuery({ name: 'equipmentCode', required: false })
  @ApiQuery({ name: 'status', required: false })
  async getMaintenance(
    @Query('projectCode') projectCode?: string,
    @Query('equipmentCode') equipmentCode?: string,
    @Query('status') status?: string,
  ) {
    return this.equipmentService.getMaintenance(projectCode, equipmentCode, status);
  }

  @Post('maintenance')
  @ApiOperation({ summary: 'Membuat jadwal atau tiket pemeliharaan baru' })
  async createMaintenance(@Body() dto: CreateMaintenanceDto) {
    return this.equipmentService.createMaintenance(dto);
  }

  @Get('compliance')
  @ApiOperation({ summary: 'Mendapatkan status sertifikasi K3 SILO dan SIO armada' })
  @ApiQuery({ name: 'projectCode', required: false })
  async getCompliance(@Query('projectCode') projectCode?: string) {
    return this.equipmentService.getCompliance(projectCode);
  }
}
