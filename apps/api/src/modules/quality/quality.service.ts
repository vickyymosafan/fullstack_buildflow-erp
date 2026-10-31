import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { CreateNCRDto } from './dto/create-ncr.dto';

@Injectable()
export class QualityService {
  constructor(private readonly prisma: PrismaService) {}

  async getInspections(category?: string, status?: string, limit: number = 50) {
    const where: any = {};
    if (category && category !== 'ALL') {
      where.category = category;
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const items = await this.prisma.inspection.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            projectCode: true,
            name: true,
          },
        },
      },
      orderBy: { inspectedAt: 'desc' },
      take: limit,
    });

    return items.map((i) => ({
      id: i.id,
      projectCode: i.project.projectCode,
      projectName: i.project.name,
      title: i.title,
      category: i.category,
      status: i.status,
      severity: i.severity,
      location: i.location || 'Area Proyek Umum',
      inspectorName: i.inspectorName,
      score: i.score ?? 100,
      notes: i.notes,
      ncrNumber: i.ncrNumber,
      actionPlan: i.actionPlan,
      inspectedAt: i.inspectedAt,
    }));
  }

  async getSummary() {
    const totalInspections = await this.prisma.inspection.count();
    const passedCount = await this.prisma.inspection.count({
      where: { status: 'PASSED' },
    });
    const activeNcrs = await this.prisma.inspection.count({
      where: { status: 'NCR_ISSUED' },
    });
    const criticalCount = await this.prisma.inspection.count({
      where: {
        severity: { in: ['HIGH', 'CRITICAL'] },
        status: { not: 'PASSED' },
      },
    });

    const passRate =
      totalInspections > 0
        ? Math.round((passedCount / totalInspections) * 100)
        : 100;

    return {
      totalInspections,
      passedCount,
      activeNcrs,
      criticalCount,
      passRate,
      zeroAccidentDays: 185,
      safeManHours: 42560,
      ppeComplianceRate: 98.4,
    };
  }

  async createInspection(dto: CreateInspectionDto) {
    const project = await this.prisma.project.findFirst({
      where: { projectCode: dto.projectCode },
    });

    if (!project) {
      throw new NotFoundException(`Proyek dengan kode ${dto.projectCode} tidak ditemukan`);
    }

    return this.prisma.inspection.create({
      data: {
        projectId: project.id,
        title: dto.title,
        category: dto.category,
        status: dto.status || 'PASSED',
        severity: dto.severity || 'LOW',
        location: dto.location,
        inspectorName: dto.inspectorName,
        score: dto.score ?? 100,
        notes: dto.notes,
        ncrNumber: dto.ncrNumber,
        actionPlan: dto.actionPlan,
      },
    });
  }

  async createNCR(dto: CreateNCRDto) {
    const project = await this.prisma.project.findFirst({
      where: { projectCode: dto.projectCode },
    });

    if (!project) {
      throw new NotFoundException(`Proyek dengan kode ${dto.projectCode} tidak ditemukan`);
    }

    const ncrCount = await this.prisma.inspection.count({
      where: { ncrNumber: { not: null } },
    });

    const ncrNumber = `NCR-2026-${String(ncrCount + 1).padStart(3, '0')}`;

    return this.prisma.inspection.create({
      data: {
        projectId: project.id,
        title: dto.title,
        category: 'QUALITY_QC',
        status: 'NCR_ISSUED',
        severity: dto.severity,
        location: dto.location,
        inspectorName: dto.inspectorName,
        score: 60.0,
        notes: dto.notes,
        ncrNumber,
        actionPlan: dto.actionPlan,
      },
    });
  }
}

