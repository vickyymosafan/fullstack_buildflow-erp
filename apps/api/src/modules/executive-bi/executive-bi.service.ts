import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDirectiveDto } from './dto/create-directive.dto';
import { SimulateScenarioDto } from './dto/simulate-scenario.dto';

export interface ProjectEvmForecast {
  projectId: string;
  projectCode: string;
  projectName: string;
  sector: 'INFRASTRUCTURE' | 'COMMERCIAL_BUILDING' | 'WATER_RESOURCES' | 'INDUSTRIAL';
  contractValue: number;
  plannedValue: number;
  earnedValue: number;
  actualCost: number;
  cpi: number;
  spi: number;
  eac: number;
  vac: number;
  forecastedMargin: number;
  targetMargin: number;
  scheduleSlipDays: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  aiRiskFactor: string;
  executiveActionRequired: string;
}

export interface CashflowRunwayMonth {
  month: string;
  label: string;
  projectedInflow: number;
  projectedOutflow: number;
  netCashflow: number;
  cumulativeCashBalance: number;
  runwayStatus: 'HEALTHY' | 'MODERATE' | 'DEFICIT_WARNING';
}

export interface ExecutiveDirective {
  id: string;
  projectId: string;
  projectName: string;
  issueCategory: 'COST_OVERRUN' | 'SCHEDULE_SLIP' | 'CASHFLOW_DEFICIT' | 'SUB_CONTRACTOR_DEFAULT' | 'PERMIT_DELAY';
  directive: string;
  assignedDirector: string;
  deadline: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  resolvedAt?: string;
  notes?: string;
}

@Injectable()
export class ExecutiveBiService {
  private projectForecasts: ProjectEvmForecast[] = [
    {
      projectId: 'proj-001',
      projectCode: 'PRJ-LRT-001',
      projectName: 'Pembangunan Stasiun LRT Hub Dukuh Atas',
      sector: 'INFRASTRUCTURE',
      contractValue: 48500000000,
      plannedValue: 48500000000,
      earnedValue: 48500000000,
      actualCost: 40643000000,
      cpi: 1.19,
      spi: 1.00,
      eac: 40643000000,
      vac: 7857000000,
      forecastedMargin: 16.2,
      targetMargin: 15.0,
      scheduleSlipDays: 0,
      riskLevel: 'LOW',
      aiRiskFactor: 'Tahap penyelesaian BAST & pencairan retensi berjalan sesuai kontrak tanpa anomali biaya.',
      executiveActionRequired: 'Pengawasan administrasi penagihan saldo sisa termin akhir.',
    },
    {
      projectId: 'proj-002',
      projectCode: 'PRJ-IKN-002',
      projectName: 'Pembangunan Rusun ASN Kawasan Inti IKN',
      sector: 'COMMERCIAL_BUILDING',
      contractValue: 66200000000,
      plannedValue: 56000000000,
      earnedValue: 53760000000,
      actualCost: 55900000000,
      cpi: 0.96,
      spi: 0.96,
      eac: 68958000000,
      vac: -2758000000,
      forecastedMargin: 13.8,
      targetMargin: 15.0,
      scheduleSlipDays: 14,
      riskLevel: 'MEDIUM',
      aiRiskFactor: 'Keterlambatan pasokan material modular & kenaikan tarif logistik darat Kalimantan Timur.',
      executiveActionRequired: 'Negosiasi harga konsorsium KSO dengan supplier beton dan percepatan jadwal shift malam.',
    },
    {
      projectId: 'proj-003',
      projectCode: 'PRJ-TOL-003',
      projectName: 'Pembangunan Jalan Tol Akses Patimban Paket 3',
      sector: 'INFRASTRUCTURE',
      contractValue: 185000000000,
      plannedValue: 125000000000,
      earnedValue: 110000000000,
      actualCost: 120879000000,
      cpi: 0.91,
      spi: 0.88,
      eac: 203296000000,
      vac: -18296000000,
      forecastedMargin: 9.8,
      targetMargin: 15.0,
      scheduleSlipDays: 42,
      riskLevel: 'HIGH',
      aiRiskFactor: 'Pembebasan lahan trase frontage belum tuntas dan cuaca curah hujan tinggi memicu deviasi kritis.',
      executiveActionRequired: 'Intervensi Direktur Operasional untuk rapat koordinasi lintas kementerian dengan PPK & BPN.',
    },
    {
      projectId: 'proj-004',
      projectCode: 'PRJ-SDA-004',
      projectName: 'Pembangunan Bendungan Pengendali Banjir Citarum',
      sector: 'WATER_RESOURCES',
      contractValue: 120800000000,
      plannedValue: 88000000000,
      earnedValue: 88880000000,
      actualCost: 87137000000,
      cpi: 1.02,
      spi: 1.01,
      eac: 118431000000,
      vac: 2369000000,
      forecastedMargin: 15.6,
      targetMargin: 15.0,
      scheduleSlipDays: -5,
      riskLevel: 'LOW',
      aiRiskFactor: 'Progres galian terowongan pengelak lebih cepat 5 hari dari baseline jadwal awal.',
      executiveActionRequired: 'Pertahankan utilisasi alat berat excavator & dump truck pada siklus optimum.',
    },
    {
      projectId: 'proj-005',
      projectCode: 'PRJ-IND-005',
      projectName: 'Kawasan Industri Terpadu Batang Phase 2',
      sector: 'INDUSTRIAL',
      contractValue: 65000000000,
      plannedValue: 35000000000,
      earnedValue: 34650000000,
      actualCost: 35000000000,
      cpi: 0.99,
      spi: 0.99,
      eac: 65656000000,
      vac: -656000000,
      forecastedMargin: 14.7,
      targetMargin: 15.0,
      scheduleSlipDays: 4,
      riskLevel: 'LOW',
      aiRiskFactor: 'Pemadatan tanah dan rigid pavement berjalan stabil sesuai target bulanan MC.',
      executiveActionRequired: 'Monitoring berkala tagihan uang muka subkontraktor mekanikal elektrikal.',
    },
  ];

  private cashflowProjections: CashflowRunwayMonth[] = [
    {
      month: '2026-11',
      label: 'Nov 2026',
      projectedInflow: 42500000000,
      projectedOutflow: 35200000000,
      netCashflow: 7300000000,
      cumulativeCashBalance: 88300000000,
      runwayStatus: 'HEALTHY',
    },
    {
      month: '2026-12',
      label: 'Des 2026',
      projectedInflow: 55000000000,
      projectedOutflow: 44000000000,
      netCashflow: 11000000000,
      cumulativeCashBalance: 99300000000,
      runwayStatus: 'HEALTHY',
    },
    {
      month: '2027-01',
      label: 'Jan 2027',
      projectedInflow: 28000000000,
      projectedOutflow: 31500000000,
      netCashflow: -3500000000,
      cumulativeCashBalance: 95800000000,
      runwayStatus: 'HEALTHY',
    },
    {
      month: '2027-02',
      label: 'Feb 2027',
      projectedInflow: 34200000000,
      projectedOutflow: 32000000000,
      netCashflow: 2200000000,
      cumulativeCashBalance: 98000000000,
      runwayStatus: 'HEALTHY',
    },
    {
      month: '2027-03',
      label: 'Mar 2027',
      projectedInflow: 39500000000,
      projectedOutflow: 36000000000,
      netCashflow: 3500000000,
      cumulativeCashBalance: 101500000000,
      runwayStatus: 'HEALTHY',
    },
    {
      month: '2027-04',
      label: 'Apr 2027',
      projectedInflow: 45000000000,
      projectedOutflow: 38500000000,
      netCashflow: 6500000000,
      cumulativeCashBalance: 108000000000,
      runwayStatus: 'HEALTHY',
    },
  ];

  private directives: ExecutiveDirective[] = [
    {
      id: 'dir-001',
      projectId: 'proj-003',
      projectName: 'Pembangunan Jalan Tol Akses Patimban Paket 3',
      issueCategory: 'SCHEDULE_SLIP',
      directive: 'Direktur Operasional menginstruksikan percepatan crash-schedule 2 shift dan pengadaan tanah percepatan bersama Satgas BPN.',
      assignedDirector: 'Ir. Ahmad Zulkarnaen (Direktur Operasional I)',
      deadline: '2026-11-20T17:00:00.000Z',
      status: 'IN_PROGRESS',
      createdAt: '2026-11-04T09:00:00.000Z',
      notes: 'Rapat koordinasi dengan PPK dijadwalkan tanggal 10 November 2026.',
    },
    {
      id: 'dir-002',
      projectId: 'proj-002',
      projectName: 'Pembangunan Rusun ASN Kawasan Inti IKN',
      issueCategory: 'COST_OVERRUN',
      directive: 'Direktur Keuangan meminta renegotiasi harga borongan material batching plant KSO untuk menekan margin variance.',
      assignedDirector: 'Siti Rahmawati, SE, Ak, CA (Direktur Keuangan & Manajemen Risiko)',
      deadline: '2026-11-15T15:00:00.000Z',
      status: 'PENDING',
      createdAt: '2026-11-05T14:30:00.000Z',
      notes: 'Target efisiensi pengadaan material Rp 1,5 Miliar.',
    },
  ];

  getSummary() {
    const totalPortfolioValue = this.projectForecasts.reduce((acc, p) => acc + p.contractValue, 0);
    const totalRevenueRealized = this.projectForecasts.reduce((acc, p) => acc + p.earnedValue, 0);
    const enterpriseBacklog = totalPortfolioValue - totalRevenueRealized;

    const weightedMargin =
      this.projectForecasts.reduce((acc, p) => acc + p.forecastedMargin * p.contractValue, 0) /
      (totalPortfolioValue || 1);

    const highRiskProjects = this.projectForecasts.filter(p => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL').length;
    const cashflowRunwayMonths = 8.4;

    return {
      totalPortfolioValue,
      totalRevenueRealized,
      enterpriseBacklog,
      forecastedGrossMargin: Number(weightedMargin.toFixed(1)),
      targetGrossMargin: 15.0,
      cashflowRunwayMonths,
      totalProjects: this.projectForecasts.length,
      activeProjects: this.projectForecasts.length,
      highRiskProjects,
    };
  }

  getProjectForecasts(sector?: string, riskLevel?: string, search?: string) {
    let result = [...this.projectForecasts];
    if (sector && sector !== 'ALL') {
      result = result.filter(p => p.sector === sector);
    }
    if (riskLevel && riskLevel !== 'ALL') {
      result = result.filter(p => p.riskLevel === riskLevel);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.projectName.toLowerCase().includes(q) ||
        p.projectCode.toLowerCase().includes(q) ||
        p.aiRiskFactor.toLowerCase().includes(q),
      );
    }
    return result;
  }

  getCashflowRunway() {
    return {
      runwayMonths: 8.4,
      safetyBufferStatus: 'SECURE (Di atas ambang batas 6.0 bulan)',
      monthlyProjections: this.cashflowProjections,
    };
  }

  simulateScenario(dto: SimulateScenarioDto) {
    // Model simulasi makro finansial dampak penundaan bayar dan inflasi material
    const delayFactor = Math.max(0, dto.paymentDelayDays / 30);
    const inflationImpact = (dto.materialInflationPercent / 100) * 0.4; // Biaya material ~40% total
    const crashScheduleCost = (dto.crashScheduleMonths * 0.015); // Biaya lembur & akselerasi ~1.5%/bulan

    const baselineMargin = 14.8;
    const simulatedMargin = Math.max(0, baselineMargin - (inflationImpact * 100) - (crashScheduleCost * 100));
    const baselineRunway = 8.4;
    const simulatedRunway = Math.max(1.2, baselineRunway - delayFactor * 0.9);

    return {
      scenarioName: dto.scenarioName,
      inputs: dto,
      simulatedMetrics: {
        originalMargin: baselineMargin,
        simulatedMargin: Number(simulatedMargin.toFixed(1)),
        marginDelta: Number((simulatedMargin - baselineMargin).toFixed(1)),
        originalRunwayMonths: baselineRunway,
        simulatedRunwayMonths: Number(simulatedRunway.toFixed(1)),
        runwayDeltaMonths: Number((simulatedRunway - baselineRunway).toFixed(1)),
        riskStatus: simulatedRunway < 6.0 ? 'DEFICIT_WARNING' : 'ACCEPTABLE',
        recommendedAction:
          simulatedRunway < 6.0
            ? 'BOD wajib mengaktifkan fasilitas standby letter of credit (SBLC) atau percepatan penagihan SCF (Supply Chain Financing).'
            : 'Struktur likuiditas tetap memadai untuk menopang percepatan operasional portofolio.',
      },
    };
  }

  getDirectives(status?: string) {
    if (status && status !== 'ALL') {
      return this.directives.filter(d => d.status === status);
    }
    return this.directives;
  }

  createDirective(dto: CreateDirectiveDto) {
    const project = this.projectForecasts.find(p => p.projectId === dto.projectId);
    const newDirective: ExecutiveDirective = {
      id: `dir-${Date.now()}`,
      projectId: dto.projectId,
      projectName: project ? project.projectName : 'Proyek Korporat',
      issueCategory: dto.issueCategory,
      directive: dto.directive,
      assignedDirector: dto.assignedDirector,
      deadline: dto.deadline,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      notes: dto.notes,
    };

    this.directives.unshift(newDirective);
    return newDirective;
  }

  resolveDirective(id: string) {
    const directive = this.directives.find(d => d.id === id);
    if (!directive) {
      throw new NotFoundException(`Directive dengan ID ${id} tidak ditemukan.`);
    }

    directive.status = 'RESOLVED';
    directive.resolvedAt = new Date().toISOString();
    return directive;
  }
}
