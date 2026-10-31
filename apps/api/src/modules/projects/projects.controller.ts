import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';

@ApiTags('Projects & Executive Overview')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Dapatkan seluruh daftar proyek aktif' })
  @ApiResponse({ status: 200, description: 'Daftar proyek berhasil diambil' })
  getAllProjects() {
    return {
      success: true,
      data: this.projectsService.findAll(),
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Get('overview/kpis')
  @ApiOperation({ summary: 'Dapatkan metrik KPI eksekutif portofolio proyek' })
  getKPIs() {
    return {
      success: true,
      data: this.projectsService.getExecutiveKPIs(),
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Dapatkan detail proyek beserta status anggaran' })
  getProjectById(@Param('id') id: string) {
    const project = this.projectsService.findOne(id);
    if (!project) {
      return { success: false, error: { message: 'Proyek tidak ditemukan' } };
    }
    return {
      success: true,
      data: project,
      meta: { timestamp: new Date().toISOString() },
    };
  }
}

