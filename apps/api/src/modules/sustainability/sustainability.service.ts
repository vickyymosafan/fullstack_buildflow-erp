import { Injectable, NotFoundException } from '@nestjs/common';
import { LogEmissionDto } from './dto/log-emission.dto';
import { LogWasteDto } from './dto/log-waste.dto';
import { CreateInitiativeDto } from './dto/create-initiative.dto';

export interface EmissionRecord {
  id: string;
  projectId: string;
  projectName: string;
  scope: 'SCOPE_1_DIRECT' | 'SCOPE_2_INDIRECT' | 'SCOPE_3_EMBODIED';
  sourceCategory: string;
  activityQuantity: number;
  activityUnit: string;
  emissionFactor: number;
  calculatedEmissionKgCO2e: number;
  calculatedEmissionTonsCO2e: number;
  recordedDate: string;
  notes?: string;
}

export interface WasteRecord {
  id: string;
  projectId: string;
  projectName: string;
  wasteType: string;
  quantityTons: number;
  handlingMethod: string;
  isDivertedFromLandfill: boolean;
  manifestNumber?: string;
  disposalPartner?: string;
  recordedDate: string;
  notes?: string;
}

export interface BghRatingRecord {
  projectId: string;
  projectCode: string;
  projectName: string;
  location: string;
  grossFloorAreaM2: number;
  categories: {
    tataKelolaTapak: number; // max 20
    efisiensiEnergi: number; // max 25
    konservasiAir: number; // max 20
    siklusMaterial: number; // max 15
    kualitasUdaraDalamRuang: number; // max 10
    pengelolaanSampah: number; // max 10
  };
  totalScore: number;
  ratingTier: 'BGH_UTAMA' | 'BGH_MADYA' | 'BGH_PRATAMA' | 'BELUM_MEMENUHI';
  auditStatus: 'VERIFIED_PUPR' | 'SELF_ASSESSED' | 'IN_REVIEW';
  lastAssessmentDate: string;
}

export interface DecarbonizationInitiative {
  id: string;
  projectId: string;
  projectName: string;
  initiativeName: string;
  category: string;
  targetReductionTonsCO2e: number;
  estimatedInvestment: number;
  targetCompletionDate: string;
  responsibleLead: string;
  description: string;
  status: 'PROPOSED' | 'APPROVED' | 'IN_EXECUTION' | 'COMPLETED';
  createdAt: string;
  approvedAt?: string;
}

@Injectable()
export class SustainabilityService {
  private emissionFactors: Record<string, number> = {
    HEAVY_EQUIPMENT_FUEL: 2.68, // kg CO2e per liter Solar
    GENERATOR_FUEL: 2.68, // kg CO2e per liter Solar
    GRID_ELECTRICITY: 0.79, // kg CO2e per kWh PLN
    CONCRETE_MATERIAL: 345.0, // kg CO2e per m3 beton ready-mix
    STEEL_REBAR: 1850.0, // kg CO2e per ton baja tulangan
    CEMENT_MATERIAL: 48.0, // kg CO2e per sak semen 50kg
    TRANSPORT_LOGISTICS: 2.45, // kg CO2e per liter armada dump truck
  };

  private projectCatalog = [
    { id: 'proj-001', code: 'PRJ-LRT-001', name: 'Pembangunan Stasiun LRT Hub Dukuh Atas', gfa: 24500 },
    { id: 'proj-002', code: 'PRJ-IKN-002', name: 'Pembangunan Rusun ASN Kawasan Inti IKN', gfa: 38200 },
    { id: 'proj-003', code: 'PRJ-TOL-003', name: 'Pembangunan Jalan Tol Akses Patimban Paket 3', gfa: 85000 },
    { id: 'proj-004', code: 'PRJ-SDA-004', name: 'Pembangunan Bendungan Pengendali Banjir Citarum', gfa: 120000 },
    { id: 'proj-005', code: 'PRJ-IND-005', name: 'Kawasan Industri Terpadu Batang Phase 2', gfa: 64000 },
  ];

  private emissions: EmissionRecord[] = [
    {
      id: 'ems-001',
      projectId: 'proj-003',
      projectName: 'Pembangunan Jalan Tol Akses Patimban Paket 3',
      scope: 'SCOPE_1_DIRECT',
      sourceCategory: 'HEAVY_EQUIPMENT_FUEL',
      activityQuantity: 18400,
      activityUnit: 'LITER',
      emissionFactor: 2.68,
      calculatedEmissionKgCO2e: 49312,
      calculatedEmissionTonsCO2e: 49.31,
      recordedDate: '2026-11-01T08:00:00.000Z',
      notes: 'Operasional 6 unit Excavator PC200 & 4 Bulldozer D85',
    },
    {
      id: 'ems-002',
      projectId: 'proj-002',
      projectName: 'Pembangunan Rusun ASN Kawasan Inti IKN',
      scope: 'SCOPE_2_INDIRECT',
      sourceCategory: 'GRID_ELECTRICITY',
      activityQuantity: 42500,
      activityUnit: 'KWH',
      emissionFactor: 0.79,
      calculatedEmissionKgCO2e: 33575,
      calculatedEmissionTonsCO2e: 33.58,
      recordedDate: '2026-11-02T10:00:00.000Z',
      notes: 'Konsumsi daya gardu sementara & penerangan tower crane 24 jam',
    },
    {
      id: 'ems-003',
      projectId: 'proj-002',
      projectName: 'Pembangunan Rusun ASN Kawasan Inti IKN',
      scope: 'SCOPE_3_EMBODIED',
      sourceCategory: 'CONCRETE_MATERIAL',
      activityQuantity: 1250,
      activityUnit: 'M3',
      emissionFactor: 345.0,
      calculatedEmissionKgCO2e: 431250,
      calculatedEmissionTonsCO2e: 431.25,
      recordedDate: '2026-11-03T14:30:00.000Z',
      notes: 'Pengecoran plat lantai 8 modul precast batching plant',
    },
    {
      id: 'ems-004',
      projectId: 'proj-001',
      projectName: 'Pembangunan Stasiun LRT Hub Dukuh Atas',
      scope: 'SCOPE_3_EMBODIED',
      sourceCategory: 'STEEL_REBAR',
      activityQuantity: 180,
      activityUnit: 'TON',
      emissionFactor: 1850.0,
      calculatedEmissionKgCO2e: 333000,
      calculatedEmissionTonsCO2e: 333.0,
      recordedDate: '2026-11-04T09:15:00.000Z',
      notes: 'Pabrikasi rangka atap baja kanopi canilever stasiun',
    },
    {
      id: 'ems-005',
      projectId: 'proj-004',
      projectName: 'Pembangunan Bendungan Pengendali Banjir Citarum',
      scope: 'SCOPE_1_DIRECT',
      sourceCategory: 'GENERATOR_FUEL',
      activityQuantity: 6500,
      activityUnit: 'LITER',
      emissionFactor: 2.68,
      calculatedEmissionKgCO2e: 17420,
      calculatedEmissionTonsCO2e: 17.42,
      recordedDate: '2026-11-05T16:00:00.000Z',
      notes: 'Genset utama terowongan pengelak spillway',
    },
  ];

  private wasteEntries: WasteRecord[] = [
    {
      id: 'wst-001',
      projectId: 'proj-003',
      projectName: 'Pembangunan Jalan Tol Akses Patimban Paket 3',
      wasteType: 'SOIL_SPOIL',
      quantityTons: 420.0,
      handlingMethod: 'SALVAGED_REUSE',
      isDivertedFromLandfill: true,
      recordedDate: '2026-11-01T11:00:00.000Z',
      notes: 'Tanah galian dimanfaatkan kembali untuk timbunan sub-base trase frontage',
    },
    {
      id: 'wst-002',
      projectId: 'proj-002',
      projectName: 'Pembangunan Rusun ASN Kawasan Inti IKN',
      wasteType: 'CONCRETE_RUBBLE',
      quantityTons: 85.5,
      handlingMethod: 'RECYCLED_ONSITE',
      isDivertedFromLandfill: true,
      recordedDate: '2026-11-02T15:20:00.000Z',
      notes: 'Pecahan beton dihancurkan mesin crusher untuk agregat lapis pondasi kerja',
    },
    {
      id: 'wst-003',
      projectId: 'proj-001',
      projectName: 'Pembangunan Stasiun LRT Hub Dukuh Atas',
      wasteType: 'SCRAP_METAL',
      quantityTons: 24.8,
      handlingMethod: 'OFFSITE_RECYCLING_PARTNER',
      isDivertedFromLandfill: true,
      disposalPartner: 'PT Aneka Daur Ulang Logam Mandiri',
      recordedDate: '2026-11-03T13:45:00.000Z',
      notes: 'Besi sisa pemotongan rebar disalurkan ke peleburan daur ulang resmi',
    },
    {
      id: 'wst-004',
      projectId: 'proj-004',
      projectName: 'Pembangunan Bendungan Pengendali Banjir Citarum',
      wasteType: 'HAZARDOUS_B3',
      quantityTons: 3.2,
      handlingMethod: 'LICENSED_B3_DISPOSAL',
      isDivertedFromLandfill: true,
      manifestNumber: 'KLHK-B3-2026-88192',
      disposalPartner: 'PT Wastec International (Izin KLHK)',
      recordedDate: '2026-11-04T10:30:00.000Z',
      notes: 'Oli bekas filter alat berat & residu cairan formwork chemical',
    },
    {
      id: 'wst-005',
      projectId: 'proj-005',
      projectName: 'Kawasan Industri Terpadu Batang Phase 2',
      wasteType: 'PACKAGING_PLASTIC',
      quantityTons: 12.0,
      handlingMethod: 'LANDFILL',
      isDivertedFromLandfill: false,
      disposalPartner: 'TPA Daerah Batang',
      recordedDate: '2026-11-05T09:00:00.000Z',
      notes: 'Plastik kemasan wrapping semen non-recyclable terkontaminasi',
    },
  ];

  private bghRatings: BghRatingRecord[] = [
    {
      projectId: 'proj-002',
      projectCode: 'PRJ-IKN-002',
      projectName: 'Pembangunan Rusun ASN Kawasan Inti IKN',
      location: 'Sepaku, Penajam Paser Utara (IKN)',
      grossFloorAreaM2: 38200,
      categories: {
        tataKelolaTapak: 18, // max 20
        efisiensiEnergi: 23, // max 25
        konservasiAir: 19, // max 20
        siklusMaterial: 14, // max 15
        kualitasUdaraDalamRuang: 9, // max 10
        pengelolaanSampah: 9, // max 10
      },
      totalScore: 92,
      ratingTier: 'BGH_UTAMA',
      auditStatus: 'VERIFIED_PUPR',
      lastAssessmentDate: '2026-10-25T10:00:00.000Z',
    },
    {
      projectId: 'proj-001',
      projectCode: 'PRJ-LRT-001',
      projectName: 'Pembangunan Stasiun LRT Hub Dukuh Atas',
      location: 'Dukuh Atas, Jakarta Pusat',
      grossFloorAreaM2: 24500,
      categories: {
        tataKelolaTapak: 16,
        efisiensiEnergi: 20,
        konservasiAir: 15,
        siklusMaterial: 12,
        kualitasUdaraDalamRuang: 8,
        pengelolaanSampah: 8,
      },
      totalScore: 79,
      ratingTier: 'BGH_MADYA',
      auditStatus: 'SELF_ASSESSED',
      lastAssessmentDate: '2026-10-28T14:00:00.000Z',
    },
    {
      projectId: 'proj-005',
      projectCode: 'PRJ-IND-005',
      projectName: 'Kawasan Industri Terpadu Batang Phase 2',
      location: 'Batang, Jawa Tengah',
      grossFloorAreaM2: 64000,
      categories: {
        tataKelolaTapak: 14,
        efisiensiEnergi: 18,
        konservasiAir: 14,
        siklusMaterial: 10,
        kualitasUdaraDalamRuang: 7,
        pengelolaanSampah: 7,
      },
      totalScore: 70,
      ratingTier: 'BGH_MADYA',
      auditStatus: 'IN_REVIEW',
      lastAssessmentDate: '2026-11-02T11:00:00.000Z',
    },
    {
      projectId: 'proj-004',
      projectCode: 'PRJ-SDA-004',
      projectName: 'Pembangunan Bendungan Pengendali Banjir Citarum',
      location: 'Kabupaten Bandung Barat, Jawa Barat',
      grossFloorAreaM2: 120000,
      categories: {
        tataKelolaTapak: 12,
        efisiensiEnergi: 15,
        konservasiAir: 12,
        siklusMaterial: 9,
        kualitasUdaraDalamRuang: 6,
        pengelolaanSampah: 6,
      },
      totalScore: 60,
      ratingTier: 'BGH_PRATAMA',
      auditStatus: 'SELF_ASSESSED',
      lastAssessmentDate: '2026-11-04T09:30:00.000Z',
    },
  ];

  private initiatives: DecarbonizationInitiative[] = [
    {
      id: 'ini-001',
      projectId: 'proj-002',
      projectName: 'Pembangunan Rusun ASN Kawasan Inti IKN',
      initiativeName: 'Substitusi Semen Portland dengan Fly-Ash & Slag Low-Carbon Cement',
      category: 'LOW_CARBON_MATERIAL',
      targetReductionTonsCO2e: 180.0,
      estimatedInvestment: 450000000,
      targetCompletionDate: '2026-12-15T00:00:00.000Z',
      responsibleLead: 'Ir. Hendra Kusuma (Lead Materials Engineer)',
      description: 'Penggantian 30% binder klinker dengan fly ash bersertifikat SNI untuk menurunkan embodied carbon struktur.',
      status: 'APPROVED',
      createdAt: '2026-10-20T10:00:00.000Z',
      approvedAt: '2026-10-22T14:30:00.000Z',
    },
    {
      id: 'ini-002',
      projectId: 'proj-001',
      projectName: 'Pembangunan Stasiun LRT Hub Dukuh Atas',
      initiativeName: 'Pemasangan Solar PV Rooftop 120 kWp pada Site Office & Workshop',
      category: 'RENEWABLE_ENERGY',
      targetReductionTonsCO2e: 64.5,
      estimatedInvestment: 820000000,
      targetCompletionDate: '2026-11-30T00:00:00.000Z',
      responsibleLead: 'Agus Santoso, ST (Site MEP Manager)',
      description: 'Pemasangan panel surya fotovoltaik on-grid untuk menyuplai 45% konsumsi listrik kerja harian stasiun.',
      status: 'IN_EXECUTION',
      createdAt: '2026-10-25T11:15:00.000Z',
      approvedAt: '2026-10-26T09:00:00.000Z',
    },
    {
      id: 'ini-003',
      projectId: 'proj-003',
      projectName: 'Pembangunan Jalan Tol Akses Patimban Paket 3',
      initiativeName: 'In-Situ Concrete Recycling & Cold In-Place Recycling (CIR) Pavement',
      category: 'WASTE_REDUCTION',
      targetReductionTonsCO2e: 210.0,
      estimatedInvestment: 1200000000,
      targetCompletionDate: '2027-01-31T00:00:00.000Z',
      responsibleLead: 'Bambang Irawan (Project Manager Patimban)',
      description: 'Daur ulang dingin material rigid pavement eksisting menjadi sub-base baru tanpa pembuangan ke landfill.',
      status: 'PROPOSED',
      createdAt: '2026-11-04T16:00:00.000Z',
    },
  ];

  getSummary() {
    // Total Carbon
    const scope1Tons = Number(
      this.emissions
        .filter(e => e.scope === 'SCOPE_1_DIRECT')
        .reduce((sum, e) => sum + e.calculatedEmissionTonsCO2e, 0)
        .toFixed(2),
    );
    const scope2Tons = Number(
      this.emissions
        .filter(e => e.scope === 'SCOPE_2_INDIRECT')
        .reduce((sum, e) => sum + e.calculatedEmissionTonsCO2e, 0)
        .toFixed(2),
    );
    const scope3Tons = Number(
      this.emissions
        .filter(e => e.scope === 'SCOPE_3_EMBODIED')
        .reduce((sum, e) => sum + e.calculatedEmissionTonsCO2e, 0)
        .toFixed(2),
    );
    const totalCarbonTons = Number((scope1Tons + scope2Tons + scope3Tons).toFixed(2));

    // Waste Diversion
    const totalWasteTons = Number(
      this.wasteEntries.reduce((sum, w) => sum + w.quantityTons, 0).toFixed(1),
    );
    const divertedWasteTons = Number(
      this.wasteEntries
        .filter(w => w.isDivertedFromLandfill)
        .reduce((sum, w) => sum + w.quantityTons, 0)
        .toFixed(1),
    );
    const wasteDiversionRatePct = totalWasteTons > 0
      ? Number(((divertedWasteTons / totalWasteTons) * 100).toFixed(1))
      : 0;

    // BGH Average
    const bghAvgScore = this.bghRatings.length > 0
      ? Number(
          (this.bghRatings.reduce((sum, r) => sum + r.totalScore, 0) / this.bghRatings.length).toFixed(1),
        )
      : 0;

    // Initiatives Target
    const totalInitiativeReductionTons = Number(
      this.initiatives.reduce((sum, i) => sum + i.targetReductionTonsCO2e, 0).toFixed(1),
    );

    return {
      totalCarbonFootprintTons: totalCarbonTons,
      carbonBreakdown: {
        scope1DirectTons: scope1Tons,
        scope2IndirectTons: scope2Tons,
        scope3EmbodiedTons: scope3Tons,
      },
      wasteMetrics: {
        totalWasteGeneratedTons: totalWasteTons,
        divertedFromLandfillTons: divertedWasteTons,
        landfillWasteTons: Number((totalWasteTons - divertedWasteTons).toFixed(1)),
        wasteDiversionRatePct,
        targetDiversionRatePct: 75.0,
      },
      bghMetrics: {
        averageBghScore: bghAvgScore,
        portfolioTier: bghAvgScore >= 80 ? 'BGH_UTAMA' : bghAvgScore >= 65 ? 'BGH_MADYA' : 'BGH_PRATAMA',
        totalEvaluatedProjects: this.bghRatings.length,
      },
      initiativesSummary: {
        activeInitiativesCount: this.initiatives.length,
        projectedReductionTonsCO2e: totalInitiativeReductionTons,
      },
      esgGovernanceRating: 'A (Very Good - Menuju Kepatuhan Net Zero Construction 2050)',
    };
  }

  getEmissions(projectId?: string, scope?: string) {
    let result = [...this.emissions];
    if (projectId && projectId !== 'ALL') {
      result = result.filter(e => e.projectId === projectId);
    }
    if (scope && scope !== 'ALL') {
      result = result.filter(e => e.scope === scope);
    }
    return result;
  }

  logEmission(dto: LogEmissionDto) {
    const project = this.projectCatalog.find(p => p.id === dto.projectId);
    const factor = dto.customEmissionFactor || this.emissionFactors[dto.sourceCategory] || 1.0;
    const kgCO2e = Number((dto.activityQuantity * factor).toFixed(2));
    const tonsCO2e = Number((kgCO2e / 1000).toFixed(2));

    const newRecord: EmissionRecord = {
      id: `ems-${Date.now()}`,
      projectId: dto.projectId,
      projectName: project ? project.name : 'Proyek Korporat',
      scope: dto.scope,
      sourceCategory: dto.sourceCategory,
      activityQuantity: dto.activityQuantity,
      activityUnit: dto.activityUnit,
      emissionFactor: factor,
      calculatedEmissionKgCO2e: kgCO2e,
      calculatedEmissionTonsCO2e: tonsCO2e,
      recordedDate: dto.recordedDate || new Date().toISOString(),
      notes: dto.notes,
    };

    this.emissions.unshift(newRecord);
    return newRecord;
  }

  getWasteEntries(projectId?: string, wasteType?: string) {
    let result = [...this.wasteEntries];
    if (projectId && projectId !== 'ALL') {
      result = result.filter(w => w.projectId === projectId);
    }
    if (wasteType && wasteType !== 'ALL') {
      result = result.filter(w => w.wasteType === wasteType);
    }
    return result;
  }

  logWaste(dto: LogWasteDto) {
    const project = this.projectCatalog.find(p => p.id === dto.projectId);
    const isDiverted = dto.handlingMethod !== 'LANDFILL';

    const newRecord: WasteRecord = {
      id: `wst-${Date.now()}`,
      projectId: dto.projectId,
      projectName: project ? project.name : 'Proyek Korporat',
      wasteType: dto.wasteType,
      quantityTons: dto.quantityTons,
      handlingMethod: dto.handlingMethod,
      isDivertedFromLandfill: isDiverted,
      manifestNumber: dto.manifestNumber,
      disposalPartner: dto.disposalPartner,
      recordedDate: dto.recordedDate || new Date().toISOString(),
      notes: dto.notes,
    };

    this.wasteEntries.unshift(newRecord);
    return newRecord;
  }

  getBghRatings(projectId?: string) {
    if (projectId && projectId !== 'ALL') {
      return this.bghRatings.filter(b => b.projectId === projectId);
    }
    return this.bghRatings;
  }

  getInitiatives(status?: string) {
    if (status && status !== 'ALL') {
      return this.initiatives.filter(i => i.status === status);
    }
    return this.initiatives;
  }

  createInitiative(dto: CreateInitiativeDto) {
    const project = this.projectCatalog.find(p => p.id === dto.projectId);

    const newInitiative: DecarbonizationInitiative = {
      id: `ini-${Date.now()}`,
      projectId: dto.projectId,
      projectName: project ? project.name : 'Proyek Korporat',
      initiativeName: dto.initiativeName,
      category: dto.category,
      targetReductionTonsCO2e: dto.targetReductionTonsCO2e,
      estimatedInvestment: dto.estimatedInvestment,
      targetCompletionDate: dto.targetCompletionDate,
      responsibleLead: dto.responsibleLead,
      description: dto.description,
      status: 'PROPOSED',
      createdAt: new Date().toISOString(),
    };

    this.initiatives.unshift(newInitiative);
    return newInitiative;
  }

  approveInitiative(id: string) {
    const init = this.initiatives.find(i => i.id === id);
    if (!init) {
      throw new NotFoundException(`Inisiatif hijau dengan ID ${id} tidak ditemukan.`);
    }

    init.status = 'APPROVED';
    init.approvedAt = new Date().toISOString();
    return init;
  }
}

