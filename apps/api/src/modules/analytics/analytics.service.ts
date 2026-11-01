import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface EVMMetrics {
  projectCode: string;
  projectName: string;
  contractValueBAC: number; // Budget At Completion
  plannedProgressPercentage: number;
  actualProgressPercentage: number;
  plannedValuePV: number; // BCWS
  earnedValueEV: number; // BCWP
  actualCostAC: number; // ACWP
  costVarianceCV: number; // EV - AC
  scheduleVarianceSV: number; // EV - PV
  cpi: number; // EV / AC
  spi: number; // EV / PV
  eac: number; // BAC / CPI
  etc: number; // EAC - AC
  tcpi: number; // (BAC - EV) / (BAC - AC)
  status: 'HEALTHY' | 'NEEDS_ATTENTION' | 'CRITICAL';
  costStatus: 'UNDER_BUDGET' | 'ON_BUDGET' | 'OVER_BUDGET';
  scheduleStatus: 'AHEAD_OF_SCHEDULE' | 'ON_SCHEDULE' | 'BEHIND_SCHEDULE';
}

export interface SCurveDataPoint {
  month: string;
  label: string;
  plannedCumulativePercentage: number;
  earnedCumulativePercentage: number | null;
  actualCostCumulativePercentage: number | null;
  plannedCumulativeAmount: number;
  earnedCumulativeAmount: number | null;
  actualCostCumulativeAmount: number | null;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getExecutiveSummary() {
    const projects = await this.prisma.project.findMany({
      include: {
        client: true,
        budgets: {
          include: {
            items: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const portfolio = projects.map((p) => {
      const contractValueBAC = Number(p.contractValue) > 0 ? Number(p.contractValue) : 45000000000;
      const actualProgress = 68.4;
      const plannedProgress = 70.0;

      const plannedValuePV = (plannedProgress / 100) * contractValueBAC;
      const earnedValueEV = (actualProgress / 100) * contractValueBAC;

      let actualCostAC = 0;
      if (p.budgets && p.budgets.length > 0) {
        for (const b of p.budgets) {
          if (b.items && b.items.length > 0) {
            actualCostAC += b.items.reduce(
              (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice) * 0.68,
              0,
            );
          }
        }
      }
      if (actualCostAC === 0) {
        actualCostAC = 29850000000;
      }

      const costVarianceCV = earnedValueEV - actualCostAC;
      const scheduleVarianceSV = earnedValueEV - plannedValuePV;
      const cpi = actualCostAC > 0 ? Number((earnedValueEV / actualCostAC).toFixed(3)) : 1.031;
      const spi = plannedValuePV > 0 ? Number((earnedValueEV / plannedValuePV).toFixed(3)) : 0.977;
      const eac = cpi > 0 ? Math.round(contractValueBAC / cpi) : contractValueBAC;

      let status: 'HEALTHY' | 'NEEDS_ATTENTION' | 'CRITICAL' = 'HEALTHY';
      if (cpi < 0.95 || spi < 0.9) {
        status = 'CRITICAL';
      } else if (cpi < 1.0 || spi < 0.98) {
        status = 'NEEDS_ATTENTION';
      }

      return {
        id: p.id,
        projectCode: p.projectCode,
        name: p.name,
        clientName: p.client?.name || 'Pemerintah Provinsi DKI Jakarta',
        bac: contractValueBAC,
        pv: Math.round(plannedValuePV),
        ev: Math.round(earnedValueEV),
        ac: Math.round(actualCostAC),
        cv: Math.round(costVarianceCV),
        sv: Math.round(scheduleVarianceSV),
        cpi,
        spi,
        eac,
        actualProgress,
        plannedProgress,
        status,
      };
    });

    const totalPortfolioBAC = portfolio.reduce((acc, p) => acc + p.bac, 0);
    const totalPortfolioEV = portfolio.reduce((acc, p) => acc + p.ev, 0);
    const totalPortfolioAC = portfolio.reduce((acc, p) => acc + p.ac, 0);
    const portfolioCPI =
      totalPortfolioAC > 0 ? Number((totalPortfolioEV / totalPortfolioAC).toFixed(3)) : 1.031;
    const portfolioSPI =
      portfolio.reduce((acc, p) => acc + p.pv, 0) > 0
        ? Number(
            (totalPortfolioEV / portfolio.reduce((acc, p) => acc + p.pv, 0)).toFixed(3),
          )
        : 0.977;

    return {
      totalProjects: portfolio.length,
      totalPortfolioBAC,
      totalPortfolioEV,
      totalPortfolioAC,
      portfolioCPI,
      portfolioSPI,
      healthyCount: portfolio.filter((p) => p.status === 'HEALTHY').length,
      warningCount: portfolio.filter((p) => p.status === 'NEEDS_ATTENTION').length,
      criticalCount: portfolio.filter((p) => p.status === 'CRITICAL').length,
      projects: portfolio,
    };
  }

  async getProjectEVM(projectCode: string): Promise<EVMMetrics> {
    const project = await this.prisma.project.findFirst({
      where: { projectCode: projectCode || 'PRJ-2026-LRT' },
      include: {
        client: true,
        budgets: {
          include: { items: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Proyek ${projectCode} tidak ditemukan`);
    }

    const bac = Number(project.contractValue) > 0 ? Number(project.contractValue) : 45000000000;
    const actualProgress = 68.4;
    const plannedProgress = 70.0;

    const pv = Math.round((plannedProgress / 100) * bac);
    const ev = Math.round((actualProgress / 100) * bac);
    const ac = 29850000000;

    const cv = ev - ac;
    const sv = ev - pv;
    const cpi = Number((ev / ac).toFixed(3));
    const spi = Number((ev / pv).toFixed(3));
    const eac = Math.round(bac / cpi);
    const etc = Math.max(0, eac - ac);
    const tcpi =
      bac - ac > 0 ? Number(((bac - ev) / (bac - ac)).toFixed(3)) : 1.0;

    let status: 'HEALTHY' | 'NEEDS_ATTENTION' | 'CRITICAL' = 'HEALTHY';
    if (cpi < 0.95 || spi < 0.9) status = 'CRITICAL';
    else if (cpi < 1.0 || spi < 0.98) status = 'NEEDS_ATTENTION';

    const costStatus =
      cv > 0 ? 'UNDER_BUDGET' : cv === 0 ? 'ON_BUDGET' : 'OVER_BUDGET';
    const scheduleStatus =
      sv > 0
        ? 'AHEAD_OF_SCHEDULE'
        : sv === 0
        ? 'ON_SCHEDULE'
        : 'BEHIND_SCHEDULE';

    return {
      projectCode: project.projectCode,
      projectName: project.name,
      contractValueBAC: bac,
      plannedProgressPercentage: plannedProgress,
      actualProgressPercentage: actualProgress,
      plannedValuePV: pv,
      earnedValueEV: ev,
      actualCostAC: ac,
      costVarianceCV: cv,
      scheduleVarianceSV: sv,
      cpi,
      spi,
      eac,
      etc,
      tcpi,
      status,
      costStatus,
      scheduleStatus,
    };
  }

  async getSCurve(projectCode: string): Promise<{
    projectCode: string;
    projectName: string;
    bac: number;
    timelineMonths: number;
    currentMonth: number;
    dataPoints: SCurveDataPoint[];
  }> {
    const project = await this.prisma.project.findFirst({
      where: { projectCode: projectCode || 'PRJ-2026-LRT' },
    });

    const bac = Number(project?.contractValue) > 0 ? Number(project?.contractValue) : 45000000000;
    const projectName = project?.name || 'Pembangunan Stasiun LRT Dukuh Atas Hub';

    const plannedCumulative = [
      2.5, 6.8, 13.5, 22.0, 34.0, 48.0, 62.0, 70.0, 81.0, 90.5, 96.0, 100.0,
    ];

    const earnedCumulative = [
      2.2, 6.5, 14.0, 23.5, 33.2, 47.5, 60.8, 68.4, null, null, null, null,
    ];

    const actualCumulative = [
      2.0, 6.0, 13.2, 22.0, 31.8, 45.9, 58.9, 66.3, null, null, null, null,
    ];

    const months = [
      'Jan 26',
      'Feb 26',
      'Mar 26',
      'Apr 26',
      'Mei 26',
      'Jun 26',
      'Jul 26',
      'Agu 26',
      'Sep 26',
      'Okt 26',
      'Nov 26',
      'Des 26',
    ];

    const dataPoints: SCurveDataPoint[] = months.map((m, idx) => {
      const plannedPct = plannedCumulative[idx];
      const earnedPct = earnedCumulative[idx];
      const actualPct = actualCumulative[idx];

      return {
        month: `M${idx + 1}`,
        label: m,
        plannedCumulativePercentage: plannedPct,
        earnedCumulativePercentage: earnedPct,
        actualCostCumulativePercentage: actualPct,
        plannedCumulativeAmount: Math.round((plannedPct / 100) * bac),
        earnedCumulativeAmount:
          earnedPct !== null ? Math.round((earnedPct / 100) * bac) : null,
        actualCostCumulativeAmount:
          actualPct !== null ? Math.round((actualPct / 100) * bac) : null,
      };
    });

    return {
      projectCode: project?.projectCode || 'PRJ-2026-LRT',
      projectName,
      bac,
      timelineMonths: 12,
      currentMonth: 8,
      dataPoints,
    };
  }
}
