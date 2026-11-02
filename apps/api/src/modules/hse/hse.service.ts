import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { CreatePtwDto } from './dto/create-ptw.dto';
import { UpdatePtwStatusDto } from './dto/update-ptw-status.dto';
import { CreateTbmDto } from './dto/create-tbm.dto';
import { CreateHseInspectionDto } from './dto/create-hse-inspection.dto';

@Injectable()
export class HseService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  private async getProjectId(projectCode?: string): Promise<string> {
    if (projectCode) {
      const p = await this.prisma.project.findFirst({ where: { projectCode } });
      if (p) return p.id;
    }
    const defaultProject = await this.prisma.project.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    if (!defaultProject) {
      throw new NotFoundException('Tidak ada proyek aktif yang ditemukan');
    }
    return defaultProject.id;
  }

  async onModuleInit() {
    const project = await this.prisma.project.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (project) {
      // 1. Seed Incidents if none exist
      const incidentCount = await this.prisma.inspection.count({
        where: { category: 'HSE_INCIDENT' },
      });
      if (incidentCount === 0) {
        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'INC-2026-001: Pekerja Terpeleset di Tangga Akses Perancah',
            category: 'HSE_INCIDENT',
            status: 'CLOSED',
            severity: 'LOW',
            location: 'Tower B Lantai 6 Tangga Akses 2',
            inspectorName: 'Budi Santoso (Safety Officer)',
            score: 100.0,
            ncrNumber: 'INC-2026-001',
            notes: JSON.stringify({
              incidentType: 'NEAR_MISS',
              affectedPerson: 'Joko Prabowo (Tukang Bekisting)',
              description: 'Pekerja membawa material pipa dan terpeleset karena genangan air hujan pada bordes tanpa grip karet.',
              rootCause: 'Pijakan tangga licin dan penerangan minim saat shift lembur malam.',
              daysLost: 0,
            }),
            actionPlan: 'Pemasangan anti-slip strip fluorescent dan lampu sorot LED portabel 100W.',
          },
        });

        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'INC-2026-002: Luka Gores Ringan Tangan Kanan Saat Penataan Besi Beton',
            category: 'HSE_INCIDENT',
            status: 'CLOSED',
            severity: 'LOW',
            location: 'Fabrikasi Bar-Bending Yard Zona Selatan',
            inspectorName: 'Budi Santoso (Safety Officer)',
            score: 95.0,
            ncrNumber: 'INC-2026-002',
            notes: JSON.stringify({
              incidentType: 'FIRST_AID',
              affectedPerson: 'Agus Riyanto (Helper Pembesian)',
              description: 'Tangan tergores ujung kawat bendrat saat mengikat rangkaian sloof pondasi.',
              rootCause: 'Sarung tangan katun biasa sobek dan tidak menggunakan sarung tangan kulit anti-cut.',
              daysLost: 0,
            }),
            actionPlan: 'Penanganan P3K antiseptik seketika dan pembagian sarung tangan anti-cut level 3.',
          },
        });
      }

      // 2. Seed PTW if none exist
      const ptwCount = await this.prisma.inspection.count({
        where: { category: 'HSE_PTW' },
      });
      if (ptwCount === 0) {
        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'PTW-2026-041: Pengelasan Rangka Baja Truss Canopy Lobby Utama',
            category: 'HSE_PTW',
            status: 'APPROVED',
            severity: 'HIGH',
            location: 'Drop-Off Lobby Utama Tower A',
            inspectorName: 'Ir. Danang Wicaksono, CSP (HSE Manager)',
            score: 98.0,
            ncrNumber: 'PTW-HW-041',
            notes: JSON.stringify({
              permitType: 'HOT_WORK',
              riskLevel: 'HIGH',
              contractorName: 'PT Baja Mandiri Utama',
              supervisorName: 'Wawan Hermawan',
              workerCount: 4,
              validFrom: new Date(Date.now() - 3600000 * 4).toISOString(),
              validTo: new Date(Date.now() + 3600000 * 8).toISOString(),
              specialPrecautionsRequired: true,
              safetyPrecautions: 'APAR Powder 6kg standby, Fire Blanket terpasang, Barricade line radius 5m.',
              reviewedBy: 'Ir. Danang Wicaksono, CSP',
              reviewNotes: 'Semua APD welder dan izin api panas lengkap diverifikasi.',
            }),
            actionPlan: 'Fire Watcher siaga penuh selama pekerjaan dan 30 menit pasca pekerjaan selesai.',
          },
        });

        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'PTW-2026-042: Pemasangan Modul Facade Kaca Curtain Wall di Ketinggian',
            category: 'HSE_PTW',
            status: 'APPROVED',
            severity: 'HIGH',
            location: 'Sisi Selatan Lantai 18-20 Tower Utama',
            inspectorName: 'Ir. Danang Wicaksono, CSP (HSE Manager)',
            score: 95.0,
            ncrNumber: 'PTW-WAH-042',
            notes: JSON.stringify({
              permitType: 'WORKING_AT_HEIGHT',
              riskLevel: 'HIGH',
              contractorName: 'PT Alumindo Mega Facade',
              supervisorName: 'Darmawan Santosa',
              workerCount: 6,
              validFrom: new Date().toISOString(),
              validTo: new Date(Date.now() + 3600000 * 10).toISOString(),
              specialPrecautionsRequired: true,
              safetyPrecautions: 'Full body harness double lanyard 100% tie-off, lifeline kawat baja 12mm.',
              reviewedBy: 'Ir. Danang Wicaksono, CSP',
              reviewNotes: 'Gondola & sertifikat rigger telah diaudit dan valid.',
            }),
            actionPlan: 'Pengawasan ketat safety officer lapangan terhadap kancingan hook harness.',
          },
        });

        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'PTW-2026-043: Pembersihan dan Waterproofing Tangki Ground Water Tank (GWT)',
            category: 'HSE_PTW',
            status: 'SUBMITTED',
            severity: 'CRITICAL',
            location: 'Basement 3 Area Mekanikal GWT',
            inspectorName: 'Budi Santoso (Safety Officer)',
            score: 90.0,
            ncrNumber: 'PTW-CS-043',
            notes: JSON.stringify({
              permitType: 'CONFINED_SPACE',
              riskLevel: 'CRITICAL',
              contractorName: 'CV Tirta Abadi Plumbing',
              supervisorName: 'Kurniawan',
              workerCount: 3,
              validFrom: new Date(Date.now() + 3600000 * 2).toISOString(),
              validTo: new Date(Date.now() + 3600000 * 12).toISOString(),
              specialPrecautionsRequired: true,
              safetyPrecautions: 'Blower ventilasi mekanik continuous, uji kadar O2 dan gas beracun (CO, H2S, LEL).',
              reviewedBy: 'Menunggu Review HSE Manager',
            }),
            actionPlan: 'Wajib lolos multi-gas detector test sebelum personil memasuki tangki tertutup.',
          },
        });
      }

      // 3. Seed TBM if none exist
      const tbmCount = await this.prisma.inspection.count({
        where: { category: 'HSE_TBM' },
      });
      if (tbmCount === 0) {
        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'TBM-2026-089: Briefing K3 Disiplin Penggunaan Full Body Harness & 100% Tie-off',
            category: 'HSE_TBM',
            status: 'PASSED',
            severity: 'LOW',
            location: 'Plaza Utama Zona Konstruksi Lt. Dasar',
            inspectorName: 'Rahmat Hidayat (Safety Representative)',
            score: 100.0,
            ncrNumber: 'TBM-089',
            notes: JSON.stringify({
              attendeeCount: 64,
              targetGroup: 'Mandor & Pekerja Struktur Lantai 14-20',
              weatherCondition: 'Cerah Berawan / Angin 6 km/h',
              keySafetyNotes: 'Pengecekan fisik D-ring harness, dilarang bekerja di tepi void tanpa pengait lifeline.',
            }),
            actionPlan: 'Inspeksi berkala setiap jam kerja oleh HSE patrol lapangan.',
          },
        });

        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'TBM-2026-090: Safety Induction Pekerja Baru & Simulasi Jalur Evakuasi Kebakaran',
            category: 'HSE_TBM',
            status: 'PASSED',
            severity: 'LOW',
            location: 'Ruang Briefing K3 / Assembly Point 1',
            inspectorName: 'Budi Santoso (Safety Officer)',
            score: 100.0,
            ncrNumber: 'TBM-090',
            notes: JSON.stringify({
              attendeeCount: 48,
              targetGroup: 'Tenaga Kerja Baru Subkon MEP & Finishing',
              weatherCondition: 'Cerah, Suhu 31°C',
              keySafetyNotes: 'Pengenalan Golden Rules K3 BUILDFlow, lokasi assembly point darurat, tata cara pemadaman awal dengan APAR.',
            }),
            actionPlan: 'Penyerahan safety induction badge dan buku panduan K3 saku kepada 48 pekerja.',
          },
        });
      }

      // 4. Seed HSE Inspections / APD Audits if none exist
      const hseInspCount = await this.prisma.inspection.count({
        where: { category: 'HSE_INSPECTION' },
      });
      if (hseInspCount === 0) {
        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'AUDIT-APD-2026-104: Audit Kepatuhan APD Wajib & 5R Zona Struktur',
            category: 'HSE_INSPECTION',
            status: 'PASSED',
            severity: 'LOW',
            location: 'Tower Utama Lantai 12 - 15',
            inspectorName: 'Tri Handoko (HSE Inspector)',
            score: 96.5,
            ncrNumber: 'APD-104',
            notes: JSON.stringify({
              inspectionType: 'APD_COMPLIANCE',
              helmetCompliant: true,
              vestCompliant: true,
              bootsCompliant: true,
              harnessCompliant: true,
              observations: 'Tingkat kepatuhan APD helm bertali dagu dan sepatu safety mencapai 98%. Area kerja bersih dan rapi.',
            }),
            actionPlan: 'Lanjutkan patroli K3 rutin dan berikan safety reward bulanan untuk mandor terbaik.',
          },
        });

        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'OBS-2026-077: Temuan Unsafe Condition Kabel Genset Terkelupas Dekat Genangan Air',
            category: 'HSE_INSPECTION',
            status: 'RECTIFIED',
            severity: 'MEDIUM',
            location: 'Area Basement 1 Sisi Timur',
            inspectorName: 'Tri Handoko (HSE Inspector)',
            score: 88.0,
            ncrNumber: 'OBS-077',
            notes: JSON.stringify({
              inspectionType: 'UNSAFE_CONDITION',
              helmetCompliant: true,
              vestCompliant: true,
              bootsCompliant: true,
              harnessCompliant: true,
              observations: 'Kabel power penerangan sementara 220V terkelupas dan menyentuh genangan air sisa hujan di lantai basement.',
            }),
            actionPlan: 'Daya diputus sementara (LOTO), kabel diganti isolasi ganda karet baru, dan digantung pada cable hanger 2 meter di atas lantai.',
          },
        });
      }
    }
  }

  async getSummary(projectCode?: string) {
    let whereProject: any = {};
    if (projectCode) {
      const project = await this.prisma.project.findFirst({
        where: { projectCode },
      });
      if (project) {
        whereProject = { projectId: project.id };
      }
    }

    const [incidents, ptwList, tbmList, audits] = await Promise.all([
      this.prisma.inspection.findMany({
        where: { ...whereProject, category: 'HSE_INCIDENT' },
      }),
      this.prisma.inspection.findMany({
        where: { ...whereProject, category: 'HSE_PTW' },
      }),
      this.prisma.inspection.findMany({
        where: { ...whereProject, category: 'HSE_TBM' },
      }),
      this.prisma.inspection.findMany({
        where: { ...whereProject, category: 'HSE_INSPECTION' },
      }),
    ]);

    const baselineSafeHours = 1485200;
    let totalLostDays = 0;
    let totalLtiCount = 0;
    let nearMissCount = 0;

    incidents.forEach((inc) => {
      try {
        const parsed = inc.notes ? JSON.parse(inc.notes) : {};
        if (parsed.incidentType === 'LOST_TIME_INJURY') {
          totalLtiCount += 1;
          totalLostDays += Number(parsed.daysLost || 0);
        } else if (parsed.incidentType === 'NEAR_MISS') {
          nearMissCount += 1;
        }
      } catch {
        // ignore json parse error
      }
    });

    const safeManHours = baselineSafeHours + tbmList.length * 1500;
    const ltifr = Number(((totalLtiCount * 1000000) / safeManHours).toFixed(2));
    const severityRate = Number(((totalLostDays * 1000000) / safeManHours).toFixed(2));
    const zeroAccidentDays = totalLtiCount === 0 ? 248 + Math.floor(tbmList.length * 2.5) : 14;

    let totalScore = 0;
    audits.forEach((a) => {
      totalScore += a.score ?? 95.0;
    });
    const apdComplianceRate = audits.length > 0
      ? Number((totalScore / audits.length).toFixed(1))
      : 96.5;

    const activePtwCount = ptwList.filter((p) => p.status === 'APPROVED' || p.status === 'SUBMITTED').length;

    let totalWorkersProtected = 0;
    tbmList.forEach((t) => {
      try {
        const parsed = t.notes ? JSON.parse(t.notes) : {};
        totalWorkersProtected += Number(parsed.attendeeCount || 40);
      } catch {
        totalWorkersProtected += 40;
      }
    });

    return {
      safeManHours,
      zeroAccidentDays,
      ltifr,
      severityRate,
      apdComplianceRate,
      activePtwCount,
      nearMissCount,
      tbmTotalSessions: tbmList.length,
      totalWorkersProtected,
      totalIncidents: incidents.length,
      standardConformance: 'SMK3 PP 50/2012 & ISO 45001:2018',
    };
  }

  async getIncidents(projectCode?: string) {
    let whereProject: any = {};
    if (projectCode) {
      const project = await this.prisma.project.findFirst({
        where: { projectCode },
      });
      if (project) {
        whereProject = { projectId: project.id };
      }
    }

    const items = await this.prisma.inspection.findMany({
      where: { ...whereProject, category: 'HSE_INCIDENT' },
      include: { project: { select: { id: true, name: true, projectCode: true } } },
      orderBy: { inspectedAt: 'desc' },
    });

    return items.map((item) => {
      let details: any = {};
      try {
        details = item.notes ? JSON.parse(item.notes) : {};
      } catch {
        details = { description: item.notes };
      }
      return {
        id: item.id,
        incidentNumber: item.ncrNumber || `INC-${item.id.slice(0, 8)}`,
        title: item.title,
        incidentType: details.incidentType || 'NEAR_MISS',
        severity: item.severity,
        location: item.location,
        reporterName: item.inspectorName,
        affectedPerson: details.affectedPerson || '-',
        description: details.description || item.title,
        rootCause: details.rootCause || '-',
        correctiveAction: item.actionPlan || '-',
        daysLost: details.daysLost || 0,
        status: item.status,
        createdAt: item.inspectedAt,
        project: item.project,
      };
    });
  }

  async createIncident(dto: CreateIncidentDto) {
    const projectId = await this.getProjectId(dto.projectCode);
    const count = await this.prisma.inspection.count({ where: { category: 'HSE_INCIDENT' } });
    const incidentNumber = `INC-2026-${String(count + 1).padStart(3, '0')}`;

    const created = await this.prisma.inspection.create({
      data: {
        projectId,
        title: `${incidentNumber}: ${dto.title}`,
        category: 'HSE_INCIDENT',
        status: dto.incidentType === 'LOST_TIME_INJURY' ? 'INVESTIGATING' : 'CLOSED',
        severity: dto.severity || 'LOW',
        location: dto.location,
        inspectorName: dto.reporterName,
        score: dto.daysLost && dto.daysLost > 0 ? 70.0 : 95.0,
        ncrNumber: incidentNumber,
        notes: JSON.stringify({
          incidentType: dto.incidentType,
          affectedPerson: dto.affectedPerson,
          description: dto.description,
          rootCause: dto.rootCause,
          daysLost: dto.daysLost || 0,
        }),
        actionPlan: dto.correctiveAction,
      },
    });

    return {
      message: 'Laporan insiden / near-miss berhasil disimpan',
      incident: created,
    };
  }

  async getPtwList(projectCode?: string) {
    let whereProject: any = {};
    if (projectCode) {
      const project = await this.prisma.project.findFirst({
        where: { projectCode },
      });
      if (project) {
        whereProject = { projectId: project.id };
      }
    }

    const items = await this.prisma.inspection.findMany({
      where: { ...whereProject, category: 'HSE_PTW' },
      include: { project: { select: { id: true, name: true, projectCode: true } } },
      orderBy: { inspectedAt: 'desc' },
    });

    return items.map((item) => {
      let details: any = {};
      try {
        details = item.notes ? JSON.parse(item.notes) : {};
      } catch {
        details = {};
      }
      return {
        id: item.id,
        permitNumber: item.ncrNumber || `PTW-${item.id.slice(0, 8)}`,
        title: item.title,
        permitType: details.permitType || 'HOT_WORK',
        riskLevel: details.riskLevel || item.severity,
        location: item.location,
        contractorName: details.contractorName || 'PT Rekan Kontraktor',
        supervisorName: details.supervisorName || '-',
        workerCount: details.workerCount || 4,
        validFrom: details.validFrom || item.inspectedAt,
        validTo: details.validTo || new Date(new Date(item.inspectedAt).getTime() + 8 * 3600000).toISOString(),
        specialPrecautionsRequired: details.specialPrecautionsRequired ?? true,
        safetyPrecautions: details.safetyPrecautions || item.actionPlan,
        status: item.status,
        reviewedBy: details.reviewedBy || item.inspectorName,
        reviewNotes: details.reviewNotes || item.actionPlan,
        createdAt: item.inspectedAt,
        project: item.project,
      };
    });
  }

  async createPtw(dto: CreatePtwDto) {
    const projectId = await this.getProjectId(dto.projectCode);
    const count = await this.prisma.inspection.count({ where: { category: 'HSE_PTW' } });
    const permitNumber = `PTW-${dto.permitType.slice(0, 2)}-${String(count + 1).padStart(3, '0')}`;

    const created = await this.prisma.inspection.create({
      data: {
        projectId,
        title: `${permitNumber}: ${dto.title}`,
        category: 'HSE_PTW',
        status: 'SUBMITTED',
        severity: dto.riskLevel || 'HIGH',
        location: dto.location,
        inspectorName: dto.supervisorName,
        score: 90.0,
        ncrNumber: permitNumber,
        notes: JSON.stringify({
          permitType: dto.permitType,
          riskLevel: dto.riskLevel,
          contractorName: dto.contractorName,
          supervisorName: dto.supervisorName,
          workerCount: dto.workerCount,
          validFrom: dto.validFrom,
          validTo: dto.validTo,
          specialPrecautionsRequired: dto.specialPrecautionsRequired,
          safetyPrecautions: dto.safetyPrecautions,
          reviewedBy: 'Menunggu Review HSE Manager',
        }),
        actionPlan: dto.safetyPrecautions,
      },
    });

    return {
      message: 'Pengajuan Permit to Work (PTW) berhasil dikirim',
      ptw: created,
    };
  }

  async updatePtwStatus(id: string, dto: UpdatePtwStatusDto) {
    const ptw = await this.prisma.inspection.findUnique({
      where: { id },
    });

    if (!ptw || ptw.category !== 'HSE_PTW') {
      throw new NotFoundException(`Izin Kerja PTW dengan ID ${id} tidak ditemukan`);
    }

    let details: any = {};
    try {
      details = ptw.notes ? JSON.parse(ptw.notes) : {};
    } catch {
      details = {};
    }

    details.reviewedBy = dto.reviewerName;
    details.reviewNotes = dto.notes || `Permit diubah ke status ${dto.status}`;

    const updated = await this.prisma.inspection.update({
      where: { id },
      data: {
        status: dto.status,
        inspectorName: dto.reviewerName,
        notes: JSON.stringify(details),
        actionPlan: dto.notes || ptw.actionPlan,
      },
    });

    return {
      message: `Status Permit to Work berhasil diperbarui menjadi ${dto.status}`,
      ptw: updated,
    };
  }

  async getTbmList(projectCode?: string) {
    let whereProject: any = {};
    if (projectCode) {
      const project = await this.prisma.project.findFirst({
        where: { projectCode },
      });
      if (project) {
        whereProject = { projectId: project.id };
      }
    }

    const items = await this.prisma.inspection.findMany({
      where: { ...whereProject, category: 'HSE_TBM' },
      include: { project: { select: { id: true, name: true, projectCode: true } } },
      orderBy: { inspectedAt: 'desc' },
    });

    return items.map((item) => {
      let details: any = {};
      try {
        details = item.notes ? JSON.parse(item.notes) : {};
      } catch {
        details = {};
      }
      return {
        id: item.id,
        tbmNumber: item.ncrNumber || `TBM-${item.id.slice(0, 8)}`,
        topic: item.title,
        zoneLocation: item.location,
        leadBy: item.inspectorName,
        attendeeCount: details.attendeeCount || 35,
        targetGroup: details.targetGroup || 'Mandor & Pekerja Lapangan',
        weatherCondition: details.weatherCondition || 'Cerah',
        keySafetyNotes: details.keySafetyNotes || item.actionPlan,
        status: item.status,
        sessionDate: item.inspectedAt,
        project: item.project,
      };
    });
  }

  async createTbm(dto: CreateTbmDto) {
    const projectId = await this.getProjectId(dto.projectCode);
    const count = await this.prisma.inspection.count({ where: { category: 'HSE_TBM' } });
    const tbmNumber = `TBM-2026-${String(count + 1).padStart(3, '0')}`;

    const created = await this.prisma.inspection.create({
      data: {
        projectId,
        title: `${tbmNumber}: ${dto.topic}`,
        category: 'HSE_TBM',
        status: 'PASSED',
        severity: 'LOW',
        location: dto.zoneLocation,
        inspectorName: dto.leadBy,
        score: 100.0,
        ncrNumber: tbmNumber,
        notes: JSON.stringify({
          attendeeCount: dto.attendeeCount,
          targetGroup: dto.targetGroup,
          weatherCondition: dto.weatherCondition,
          keySafetyNotes: dto.keySafetyNotes,
        }),
        actionPlan: dto.keySafetyNotes,
      },
    });

    return {
      message: 'Briefing Toolbox Meeting (TBM) harian berhasil dicatat',
      tbm: created,
    };
  }

  async getInspections(projectCode?: string) {
    let whereProject: any = {};
    if (projectCode) {
      const project = await this.prisma.project.findFirst({
        where: { projectCode },
      });
      if (project) {
        whereProject = { projectId: project.id };
      }
    }

    const items = await this.prisma.inspection.findMany({
      where: { ...whereProject, category: 'HSE_INSPECTION' },
      include: { project: { select: { id: true, name: true, projectCode: true } } },
      orderBy: { inspectedAt: 'desc' },
    });

    return items.map((item) => {
      let details: any = {};
      try {
        details = item.notes ? JSON.parse(item.notes) : {};
      } catch {
        details = {};
      }
      return {
        id: item.id,
        auditNumber: item.ncrNumber || `AUDIT-${item.id.slice(0, 8)}`,
        title: item.title,
        inspectionType: details.inspectionType || 'APD_COMPLIANCE',
        severity: item.severity,
        location: item.location,
        inspectorName: item.inspectorName,
        score: item.score ?? 95.0,
        helmetCompliant: details.helmetCompliant ?? true,
        vestCompliant: details.vestCompliant ?? true,
        bootsCompliant: details.bootsCompliant ?? true,
        harnessCompliant: details.harnessCompliant ?? true,
        observations: details.observations || item.notes,
        actionPlan: item.actionPlan,
        status: item.status,
        auditDate: item.inspectedAt,
        project: item.project,
      };
    });
  }

  async createHseInspection(dto: CreateHseInspectionDto) {
    const projectId = await this.getProjectId(dto.projectCode);
    const count = await this.prisma.inspection.count({ where: { category: 'HSE_INSPECTION' } });
    const auditNumber = `AUDIT-K3-${String(count + 1).padStart(3, '0')}`;

    const created = await this.prisma.inspection.create({
      data: {
        projectId,
        title: `${auditNumber}: ${dto.title}`,
        category: 'HSE_INSPECTION',
        status: dto.score >= 90 ? 'PASSED' : 'RECTIFIED',
        severity: dto.severity || 'LOW',
        location: dto.location,
        inspectorName: dto.inspectorName,
        score: dto.score,
        ncrNumber: auditNumber,
        notes: JSON.stringify({
          inspectionType: dto.inspectionType,
          helmetCompliant: dto.helmetCompliant,
          vestCompliant: dto.vestCompliant,
          bootsCompliant: dto.bootsCompliant,
          harnessCompliant: dto.harnessCompliant,
          observations: dto.observations,
        }),
        actionPlan: dto.actionPlan,
      },
    });

    return {
      message: 'Audit kepatuhan APD & observasi bahaya berhasil dicatat',
      inspection: created,
    };
  }
}
