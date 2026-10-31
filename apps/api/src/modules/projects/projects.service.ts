import { Injectable } from '@nestjs/common';

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
  private projects: ProjectEntity[] = [
    {
      id: 'p1',
      projectCode: 'PRJ-2026-001',
      name: 'Pembangunan Menara 8 Office Tower',
      client: 'PT Sentosa Graha Realty',
      contractValue: 14500000000,
      budgetBaseline: 12800000000,
      actualCost: 8950000000,
      progress: 78,
      status: 'ACTIVE',
    },
    {
      id: 'p2',
      projectCode: 'PRJ-2026-002',
      name: 'Kompleks Residensial Emerald Blok A-D',
      client: 'PT Intiland Harmoni',
      contractValue: 8200000000,
      budgetBaseline: 7100000000,
      actualCost: 4400000000,
      progress: 62,
      status: 'ACTIVE',
    },
    {
      id: 'p3',
      projectCode: 'PRJ-2026-003',
      name: 'Gudang Logistik Cikarang Dry Port',
      client: 'PT Multi Logistik Global',
      contractValue: 5000000000,
      budgetBaseline: 4300000000,
      actualCost: 3520000000,
      progress: 48,
      status: 'ACTIVE',
    },
  ];

  findAll(): ProjectEntity[] {
    return this.projects;
  }

  findOne(id: string): ProjectEntity | undefined {
    return this.projects.find((p) => p.id === id || p.projectCode === id);
  }

  getExecutiveKPIs() {
    return {
      activeProjectsCount: 12,
      totalContractValue: 32000000000,
      budgetUtilizationPercentage: 68,
      outstandingReceivables: 2500000000,
      period: 'Oktober 2026',
    };
  }
}

