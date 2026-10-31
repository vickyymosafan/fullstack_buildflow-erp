import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface ProjectEntity {
  id: string;
  projectCode: string;
  name: string;
  client: string;
  contractValue: number;
  budgetBaseline: number;
  actualCost: number;
  progress: number;
  status: string;
}

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<ProjectEntity[]> {
    const projects = await this.prisma.project.findMany({
      include: {
        branch: true,
        client: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map((p) => ({
      id: p.id,
      projectCode: p.projectCode,
      name: p.name,
      client: p.client?.name || 'Kementerian PUPR / PT Kereta Cepat',
      contractValue: Number(p.contractValue),
      budgetBaseline: Number(p.contractValue) * 0.88,
      actualCost: Number(p.contractValue) * 0.55,
      progress: p.status === 'COMPLETED' ? 100 : 68,
      status: p.status,
    }));
  }

  async findOne(id: string): Promise<ProjectEntity | null> {
    const project = await this.prisma.project.findFirst({
      where: {
        OR: [{ id }, { projectCode: id }],
      },
      include: {
        branch: true,
        client: true,
      },
    });

    if (!project) return null;

    return {
      id: project.id,
      projectCode: project.projectCode,
      name: project.name,
      client: project.client?.name || 'Kementerian PUPR / PT Kereta Cepat',
      contractValue: Number(project.contractValue),
      budgetBaseline: Number(project.contractValue) * 0.88,
      actualCost: Number(project.contractValue) * 0.55,
      progress: project.status === 'COMPLETED' ? 100 : 68,
      status: project.status,
    };
  }

  async getExecutiveKPIs() {
    const projects = await this.prisma.project.findMany();
    const activeProjects = projects.filter((p) => p.status === 'ACTIVE');
    const totalContractValue = activeProjects.reduce((sum, p) => sum + Number(p.contractValue), 0);

    return {
      activeProjectsCount: activeProjects.length,
      totalContractValue,
      budgetUtilizationPercentage: 68,
      outstandingReceivables: 12500000000,
      period: 'Oktober 2026',
    };
  }
}
