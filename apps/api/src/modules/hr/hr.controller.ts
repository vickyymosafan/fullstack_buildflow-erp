import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HRService } from './hr.service';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@ApiTags('HR & Field Workforce Operations')
@Controller('hr')
export class HRController {
  constructor(private readonly hrService: HRService) {}

  @Get('employees')
  @ApiOperation({ summary: 'Direktori Karyawan, Site Engineers & Mandor Lapangan' })
  async getEmployees() {
    const data = await this.hrService.getEmployees();
    return { success: true, data, count: data.length };
  }

  @Get('timesheets')
  @ApiOperation({ summary: 'Daftar Presensi Harian & Jam Kerja Tenaga Kerja Konstruksi' })
  async getTimesheets(@Query('limit') limit?: number) {
    const data = await this.hrService.getTimesheets(limit ? Number(limit) : 50);
    return { success: true, data, count: data.length };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Ringkasan KPI Tenaga Kerja: Headcount, Jam Kerja & Estimasi Beban Upah' })
  async getSummary() {
    const data = await this.hrService.getSummary();
    return { success: true, data };
  }

  @Post('timesheets')
  @ApiOperation({ summary: 'Input Presensi Harian & Jam Kerja / Lembur Tenaga Kerja Proyek' })
  async createTimesheet(@Body() dto: CreateTimesheetDto) {
    const data = await this.hrService.createTimesheet(dto);
    return {
      success: true,
      data,
      message: 'Presensi harian tenaga kerja berhasil dicatat dan diverifikasi',
    };
  }

  @Post('employees')
  @ApiOperation({ summary: 'Registrasi Pegawai atau Mandor Baru' })
  async createEmployee(@Body() dto: CreateEmployeeDto) {
    const data = await this.hrService.createEmployee(dto);
    return {
      success: true,
      data,
      message: 'Pegawai / Mandor baru berhasil didaftarkan',
    };
  }
}

