import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateSiteReportDto } from './dto/create-site-report.dto';

@Injectable()
export class SiteReportsService {
  constructor(private prisma: PrismaService) {}

  async getByProject(projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        OR: [{ id: projectId }, { projectCode: projectId }],
      },
    });

    if (!project) {
      throw new NotFoundException(`Proyek ${projectId} tidak ditemukan`);
    }

    const reports = await this.prisma.dailyReport.findMany({
      where: { projectId: project.id },
      orderBy: { reportDate: 'desc' },
    });

    return reports.map((r) => ({
      id: r.id,
      projectId: r.projectId,
      reportDate: r.reportDate.toISOString().split('T')[0],
      weather: r.weather,
      workerCount: r.workerCount,
      workSummary: r.workSummary,
      createdAt: r.createdAt,
    }));
  }

  async createReport(dto: CreateSiteReportDto) {
    const project = await this.prisma.project.findFirst({
      where: {
        OR: [{ id: dto.projectId }, { projectCode: dto.projectId }],
      },
    });

    if (!project) {
      throw new NotFoundException(`Proyek ${dto.projectId} tidak ditemukan`);
    }

    const reportDate = new Date(dto.reportDate);

    // Upsert or create
    const report = await this.prisma.dailyReport.upsert({
      where: {
        projectId_reportDate: {
          projectId: project.id,
          reportDate,
        },
      },
      update: {
        weather: dto.weather,
        workerCount: Number(dto.workerCount),
        workSummary: dto.workSummary,
      },
      create: {
        projectId: project.id,
        reportDate,
        weather: dto.weather,
        workerCount: Number(dto.workerCount),
        workSummary: dto.workSummary,
      },
    });

    return {
      id: report.id,
      projectId: project.projectCode,
      reportDate: report.reportDate.toISOString().split('T')[0],
      weather: report.weather,
      workerCount: report.workerCount,
      workSummary: report.workSummary,
      status: 'SUBMITTED',
    };
  }
}

