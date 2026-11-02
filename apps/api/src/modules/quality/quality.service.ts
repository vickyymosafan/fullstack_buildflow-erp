import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { CreateNCRDto } from './dto/create-ncr.dto';
import { CreateWIRDto, UpdateWIRStatusDto } from './dto/create-wir.dto';
import { CreatePunchListDto, UpdatePunchStatusDto } from './dto/create-punch-list.dto';
import { CreateMaterialTestDto } from './dto/create-material-test.dto';

@Injectable()
export class QualityService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const project = await this.prisma.project.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (project) {
      // 1. Seed WIR if none
      const wirCount = await this.prisma.inspection.count({ where: { category: 'WIR' } });
      if (wirCount === 0) {
        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'WIR-2026-001: Inspeksi Pembesian & Bekisting Kolom K1-K8 Lt 4',
            category: 'WIR',
            status: 'APPROVED_TO_PROCEED',
            severity: 'LOW',
            location: 'Tower Utama Lantai 4 Zona 2',
            inspectorName: 'Ahmad Fauzi (QC Civil Inspector)',
            score: 98.0,
            notes: JSON.stringify({
              drawingReference: 'DWG-STR-COL-004 Rev B',
              subcontractorName: 'PT Wira Baja Konstruksi',
              notes: 'Jarak sengkang D10-100 dan selimut beton 40mm telah diverifikasi.',
            }),
            actionPlan: 'Disetujui cor beton ready mix fc 35 MPa oleh MK.',
          },
        });

        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'WIR-2026-002: Inspeksi Instalasi Conduit & Tray MEP Lantai 3',
            category: 'WIR',
            status: 'SUBMITTED',
            severity: 'LOW',
            location: 'Lantai 3 Plafon Koridor Barat',
            inspectorName: 'Doni Pratama (QC MEP)',
            score: 90.0,
            notes: JSON.stringify({
              drawingReference: 'DWG-MEP-ELE-012 Rev A',
              subcontractorName: 'CV Sinar Elektrika',
              notes: 'Inspeksi jalur kabel power dan pipa conduit sebelum penutupan plafon.',
            }),
            actionPlan: 'Menunggu peninjauan bersama Konsultan Pengawas.',
          },
        });
      }

      // 2. Seed Punch List if none
      const punchCount = await this.prisma.inspection.count({ where: { category: 'PUNCH_LIST' } });
      if (punchCount === 0) {
        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Nat Homogenous Tile 60x60 Retak dan Rongga Kosong di Koridor',
            category: 'PUNCH_LIST',
            status: 'IN_PROGRESS',
            severity: 'MEDIUM',
            location: 'Lantai 2 Koridor R. Meeting 204',
            inspectorName: 'Siti Rahma (QC Handover)',
            score: 75.0,
            notes: JSON.stringify({
              tradeCategory: 'FINISHING_ARSI',
              subcontractorName: 'PT Karya Finishing Nusantara',
              targetCloseDate: '2026-11-25',
            }),
            actionPlan: 'Bongkar nat keropos dan grouting ulang semen nat elastis.',
          },
        });

        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Fitting Downlight LED Plafon Menggantung Tidak Presisi',
            category: 'PUNCH_LIST',
            status: 'OPEN',
            severity: 'LOW',
            location: 'Lobby Utama Gedung',
            inspectorName: 'Siti Rahma (QC Handover)',
            score: 80.0,
            notes: JSON.stringify({
              tradeCategory: 'MEP',
              subcontractorName: 'CV Sinar Elektrika',
              targetCloseDate: '2026-11-20',
            }),
            actionPlan: 'Kencangkan spring clip dan pasang rata permukaan plafon gypsum.',
          },
        });
      }

      // 3. Seed Material Tests if none
      const matCount = await this.prisma.inspection.count({ where: { category: 'MATERIAL_TEST' } });
      if (matCount === 0) {
        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Uji Kuat Tekan Beton Silinder fc 35 MPa - Umur 28 Hari (Batch B-08)',
            category: 'MATERIAL_TEST',
            status: 'PASSED',
            severity: 'LOW',
            location: 'Laboratorium Bahan ITB',
            inspectorName: 'Laboratorium Uji Independen ITB',
            score: 38.2,
            notes: JSON.stringify({
              materialType: 'CONCRETE',
              sampleAgeDays: 28,
              targetStrength: 35.0,
              actualStrength: 38.2,
              slumpValue: 12.0,
              batchNumber: 'TM-08/SCM-20261015',
              supplierName: 'PT Semen Prima Beton ReadyMix',
            }),
            actionPlan: 'Lolos uji mutu spesifikasi SNI 2847:2019 (+9.1% di atas target).',
          },
        });

        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Uji Kuat Tarik Baja Tulangan Ulir D16 BjTS 420B',
            category: 'MATERIAL_TEST',
            status: 'PASSED',
            severity: 'LOW',
            location: 'Balai Besar Pengujian Mutu Konstruksi',
            inspectorName: 'B4T Kemenperin',
            score: 445.0,
            notes: JSON.stringify({
              materialType: 'REBAR_STEEL',
              sampleAgeDays: 0,
              targetStrength: 420.0,
              actualStrength: 445.0,
              slumpValue: 0,
              batchNumber: 'HEAT-7782-KS',
              supplierName: 'PT Krakatau Steel Tbk',
            }),
            actionPlan: 'Kuat leleh dan elongasi memenuhi standar SNI 2052:2017.',
          },
        });
      }
    }
  }

  async getSummary() {
    const totalInspections = await this.prisma.inspection.count();
    const passedCount = await this.prisma.inspection.count({
      where: { status: { in: ['PASSED', 'APPROVED_TO_PROCEED', 'VERIFIED_CLOSED'] } },
    });

    // WIR Metrics
    const totalWIR = await this.prisma.inspection.count({ where: { category: 'WIR' } });
    const approvedWIR = await this.prisma.inspection.count({
      where: { category: 'WIR', status: 'APPROVED_TO_PROCEED' },
    });
    const pendingWIR = await this.prisma.inspection.count({
      where: { category: 'WIR', status: { in: ['SUBMITTED', 'PENDING'] } },
    });

    // NCR Metrics
    const activeNcrs = await this.prisma.inspection.count({
      where: {
        category: { in: ['NCR', 'QUALITY_QC'] },
        status: { in: ['NCR_ISSUED', 'IN_PROGRESS', 'OPEN'] },
      },
    });
    const resolvedNcrs = await this.prisma.inspection.count({
      where: {
        category: { in: ['NCR', 'QUALITY_QC'] },
        status: { in: ['RESOLVED', 'CLOSED'] },
      },
    });

    // Punch List Metrics
    const totalPunchItems = await this.prisma.inspection.count({ where: { category: 'PUNCH_LIST' } });
    const closedPunchItems = await this.prisma.inspection.count({
      where: { category: 'PUNCH_LIST', status: { in: ['RECTIFIED', 'VERIFIED_CLOSED'] } },
    });
    const punchCompletionRate =
      totalPunchItems > 0 ? Math.round((closedPunchItems / totalPunchItems) * 100) : 100;

    // Material Testing Metrics
    const totalMaterialTests = await this.prisma.inspection.count({ where: { category: 'MATERIAL_TEST' } });
    const passedMaterialTests = await this.prisma.inspection.count({
      where: { category: 'MATERIAL_TEST', status: 'PASSED' },
    });
    const materialComplianceRate =
      totalMaterialTests > 0 ? Math.round((passedMaterialTests / totalMaterialTests) * 100) : 100;

    const passRate =
      totalInspections > 0 ? Math.round((passedCount / totalInspections) * 100) : 100;

    return {
      totalInspections,
      passedCount,
      passRate,
      wir: {
        total: totalWIR,
        approved: approvedWIR,
        pending: pendingWIR,
      },
      ncr: {
        active: activeNcrs,
        resolved: resolvedNcrs,
      },
      punchList: {
        total: totalPunchItems,
        closed: closedPunchItems,
        completionRate: punchCompletionRate,
      },
      materialTesting: {
        total: totalMaterialTests,
        passed: passedMaterialTests,
        complianceRate: materialComplianceRate,
      },
      zeroAccidentDays: 185,
      safeManHours: 42560,
      ppeComplianceRate: 98.4,
    };
  }

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

  // WIR Operations
  async getWIRList(projectCode?: string) {
    const where: any = { category: 'WIR' };
    if (projectCode) {
      where.project = { projectCode };
    }

    return this.prisma.inspection.findMany({
      where,
      include: {
        project: { select: { projectCode: true, name: true } },
      },
      orderBy: { inspectedAt: 'desc' },
    });
  }

  async createWIR(dto: CreateWIRDto) {
    const project = await this.prisma.project.findFirst({
      where: { projectCode: dto.projectCode },
    });

    if (!project) {
      throw new NotFoundException(`Proyek ${dto.projectCode} tidak ditemukan`);
    }

    const wirCount = await this.prisma.inspection.count({ where: { category: 'WIR' } });
    const wirCode = `WIR-2026-${String(wirCount + 1).padStart(3, '0')}`;

    return this.prisma.inspection.create({
      data: {
        projectId: project.id,
        title: `${wirCode}: ${dto.title}`,
        category: 'WIR',
        status: 'SUBMITTED',
        severity: 'LOW',
        location: dto.location,
        inspectorName: dto.inspectorName,
        score: 95.0,
        notes: JSON.stringify({
          drawingReference: dto.drawingReference || '-',
          subcontractorName: dto.subcontractorName || '-',
          notes: dto.notes || '',
        }),
        actionPlan: 'Menunggu verifikasi lapangan oleh Konsultan Pengawas MK',
      },
    });
  }

  async updateWIRStatus(id: string, dto: UpdateWIRStatusDto) {
    const wir = await this.prisma.inspection.findUnique({ where: { id } });
    if (!wir) throw new NotFoundException('Data WIR tidak ditemukan');

    return this.prisma.inspection.update({
      where: { id },
      data: {
        status: dto.status,
        actionPlan: `${dto.status === 'APPROVED_TO_PROCEED' ? 'DISETUJUI' : 'DITOLAK/REVISI'} oleh ${dto.approverName}. Catatan: ${dto.approvalNotes || '-'}`,
      },
    });
  }

  // NCR Operations
  async getNCRList(projectCode?: string) {
    const where: any = { category: { in: ['NCR', 'QUALITY_QC'] }, ncrNumber: { not: null } };
    if (projectCode) {
      where.project = { projectCode };
    }

    return this.prisma.inspection.findMany({
      where,
      include: {
        project: { select: { projectCode: true, name: true } },
      },
      orderBy: { inspectedAt: 'desc' },
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
        category: 'NCR',
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

  async resolveNCR(id: string, notes: string, resolverName: string) {
    const item = await this.prisma.inspection.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Data NCR tidak ditemukan');

    return this.prisma.inspection.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        actionPlan: `Telah diperbaiki & diverifikasi tutup oleh ${resolverName}. Hasil: ${notes}`,
      },
    });
  }

  // Punch List Operations
  async getPunchList(projectCode?: string) {
    const where: any = { category: 'PUNCH_LIST' };
    if (projectCode) {
      where.project = { projectCode };
    }

    return this.prisma.inspection.findMany({
      where,
      include: {
        project: { select: { projectCode: true, name: true } },
      },
      orderBy: { inspectedAt: 'desc' },
    });
  }

  async createPunchItem(dto: CreatePunchListDto) {
    const project = await this.prisma.project.findFirst({
      where: { projectCode: dto.projectCode },
    });

    if (!project) {
      throw new NotFoundException(`Proyek ${dto.projectCode} tidak ditemukan`);
    }

    return this.prisma.inspection.create({
      data: {
        projectId: project.id,
        title: dto.title,
        category: 'PUNCH_LIST',
        status: 'OPEN',
        severity: dto.severity,
        location: dto.location,
        inspectorName: 'Tim Inspeksi Handover',
        score: 75.0,
        notes: JSON.stringify({
          tradeCategory: dto.tradeCategory,
          subcontractorName: dto.subcontractorName,
          targetCloseDate: dto.targetCloseDate || '-',
        }),
        actionPlan: dto.actionPlan || 'Segera perbaiki sebelum jadwal serah terima parsial',
      },
    });
  }

  async updatePunchStatus(id: string, dto: UpdatePunchStatusDto) {
    const item = await this.prisma.inspection.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Item Punch List tidak ditemukan');

    return this.prisma.inspection.update({
      where: { id },
      data: {
        status: dto.status,
        actionPlan: `Status diubah menjadi ${dto.status} oleh ${dto.verifiedBy}. Keterangan: ${dto.verificationNotes || '-'}`,
      },
    });
  }

  // Material Tests Operations
  async getMaterialTests(projectCode?: string) {
    const where: any = { category: 'MATERIAL_TEST' };
    if (projectCode) {
      where.project = { projectCode };
    }

    return this.prisma.inspection.findMany({
      where,
      include: {
        project: { select: { projectCode: true, name: true } },
      },
      orderBy: { inspectedAt: 'desc' },
    });
  }

  async createMaterialTest(dto: CreateMaterialTestDto) {
    const project = await this.prisma.project.findFirst({
      where: { projectCode: dto.projectCode },
    });

    if (!project) {
      throw new NotFoundException(`Proyek ${dto.projectCode} tidak ditemukan`);
    }

    const passed = dto.actualStrength >= dto.targetStrength;

    return this.prisma.inspection.create({
      data: {
        projectId: project.id,
        title: dto.title,
        category: 'MATERIAL_TEST',
        status: passed ? 'PASSED' : 'FAILED',
        severity: passed ? 'LOW' : 'CRITICAL',
        location: dto.labName,
        inspectorName: dto.labName,
        score: dto.actualStrength,
        notes: JSON.stringify({
          materialType: dto.materialType,
          sampleAgeDays: dto.sampleAgeDays || 28,
          targetStrength: dto.targetStrength,
          actualStrength: dto.actualStrength,
          slumpValue: dto.slumpValue || 0,
          batchNumber: dto.batchNumber,
          supplierName: dto.supplierName,
        }),
        actionPlan: passed
          ? `Lolos uji spesifikasi (+${(((dto.actualStrength - dto.targetStrength) / dto.targetStrength) * 100).toFixed(1)}% vs target).`
          : `Gagal uji spesifikasi (-${(((dto.targetStrength - dto.actualStrength) / dto.targetStrength) * 100).toFixed(1)}% di bawah target). Terbitkan NCR!`,
      },
    });
  }
}
