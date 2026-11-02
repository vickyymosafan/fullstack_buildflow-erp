import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateSpkDto } from './dto/create-spk.dto';
import { CreateOpnameDto } from './dto/create-opname.dto';
import { CreateMcDto } from './dto/create-mc.dto';
import { UpdateMcStatusDto } from './dto/update-mc-status.dto';

@Injectable()
export class SubcontractorsService implements OnModuleInit {
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
      // 1. Seed Subcontractor SPKs if none exist
      const spkCount = await this.prisma.inspection.count({
        where: { category: 'SUBCON_SPK' },
      });

      if (spkCount === 0) {
        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Pekerjaan Pembesian & Bekisting Struktur Tower A Lantai 1-8',
            category: 'SUBCON_SPK',
            status: 'ACTIVE',
            severity: 'STRUKTUR',
            location: 'Tower A Lantai 1-8',
            inspectorName: 'Ir. Hendra Prasetyo (Site Engineer)',
            score: 75.0, // Progres fisik saat ini 75%
            ncrNumber: 'SPK-2026-STR-01',
            actionPlan: 'PT Sinar Baja Konstruksi',
            notes: JSON.stringify({
              subconName: 'PT Sinar Baja Konstruksi',
              spkNumber: 'SPK-2026-STR-01',
              category: 'STRUKTUR',
              contractValue: 2450000000,
              downPaymentPercent: 10,
              retentionPercent: 5,
              startDate: '2026-01-15',
              endDate: '2026-08-30',
              picName: 'H. Sudirman, S.T.',
              picPhone: '0812-8899-1001',
              scopeOfWork: 'Pekerjaan fabrikasi bekisting, perakitan besi tulangan beton D10-D25, dan pembongkaran bekisting.',
            }),
          },
        });

        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Instalasi Plumbing, Pompa Booster, & Hydrant Gedung Utama',
            category: 'SUBCON_SPK',
            status: 'ACTIVE',
            severity: 'MEP',
            location: 'Shaft MEP & Basement 1',
            inspectorName: 'Dimas Wicaksono (MEP Supervisor)',
            score: 45.0, // Progres 45%
            ncrNumber: 'SPK-2026-MEP-02',
            actionPlan: 'CV Citra Mandiri Teknik',
            notes: JSON.stringify({
              subconName: 'CV Citra Mandiri Teknik',
              spkNumber: 'SPK-2026-MEP-02',
              category: 'MEP',
              contractValue: 1150000000,
              downPaymentPercent: 15,
              retentionPercent: 5,
              startDate: '2026-02-01',
              endDate: '2026-09-15',
              picName: 'Ahmad Fauzi',
              picPhone: '0813-7722-4411',
              scopeOfWork: 'Pemasangan pipa PPR, black steel pipe hydrant, dan testing commissioning pompa booster 15kW.',
            }),
          },
        });

        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Pasangan Bata Ringan, Plesteran, & Acian Tower B Lantai 2-6',
            category: 'SUBCON_SPK',
            status: 'ACTIVE',
            severity: 'ARSITEKTUR',
            location: 'Tower B Lantai 2-6',
            inspectorName: 'Rudi Hartono (Chief Inspector)',
            score: 90.0, // Progres 90%
            ncrNumber: 'SPK-2026-FIN-03',
            actionPlan: 'Mandor H. Komarudin',
            notes: JSON.stringify({
              subconName: 'Mandor H. Komarudin',
              spkNumber: 'SPK-2026-FIN-03',
              category: 'ARSITEKTUR',
              contractValue: 680000000,
              downPaymentPercent: 10,
              retentionPercent: 5,
              startDate: '2026-01-20',
              endDate: '2026-06-30',
              picName: 'H. Komarudin',
              picPhone: '0857-1133-9080',
              scopeOfWork: 'Pemasangan bata hebel tebal 10cm, adukan mortar thin bed, plester aci finish halus siap cat.',
            }),
          },
        });
      }

      // 2. Seed Opname Lapangan if none exist
      const opnameCount = await this.prisma.inspection.count({
        where: { category: 'SUBCON_OPNAME' },
      });

      if (opnameCount === 0) {
        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Berita Acara Opname Progres Pembesian Kolom & Balok Lantai 6 Tower A',
            category: 'SUBCON_OPNAME',
            status: 'VERIFIED',
            severity: 'APPROVED',
            location: 'Tower A Lantai 6',
            inspectorName: 'Ir. Hendra Prasetyo (Konsultan MK)',
            score: 75.0,
            ncrNumber: 'OPN-2026-03-STR',
            actionPlan: 'Disetujui bersama Site Engineer dan Konsultan MK',
            notes: JSON.stringify({
              opnameNumber: 'OPN-2026-03-STR',
              spkNumber: 'SPK-2026-STR-01',
              subconName: 'PT Sinar Baja Konstruksi',
              period: 'Maret 2026 (Minggu ke-3)',
              previousProgress: 50.0,
              currentProgress: 75.0,
              progressDelta: 25.0,
              verifiedBy: 'Ir. Hendra Prasetyo (Konsultan MK)',
              notes: 'Pemasangan besi tulangan plat dan balok lantai 6 telah diinspeksi sesuai RKS.',
            }),
          },
        });

        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Opname Instalasi Pipa Hydrant & Header Basement 1',
            category: 'SUBCON_OPNAME',
            status: 'VERIFIED',
            severity: 'APPROVED',
            location: 'Basement 1 Ruang Pompa',
            inspectorName: 'Dimas Wicaksono (Site Engineer)',
            score: 45.0,
            ncrNumber: 'OPN-2026-03-MEP',
            actionPlan: 'Pekerjaan sesuai shop drawing approved',
            notes: JSON.stringify({
              opnameNumber: 'OPN-2026-03-MEP',
              spkNumber: 'SPK-2026-MEP-02',
              subconName: 'CV Citra Mandiri Teknik',
              period: 'Maret 2026 (Minggu ke-2)',
              previousProgress: 30.0,
              currentProgress: 45.0,
              progressDelta: 15.0,
              verifiedBy: 'Dimas Wicaksono (Site Engineer)',
              notes: 'Uji tekan pipa (hydrostatic test) pada tekanan 12 bar selama 2 jam tidak bocor.',
            }),
          },
        });

        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Opname Pasangan Bata Ringan & Plesteran Lantai 5 Tower B',
            category: 'SUBCON_OPNAME',
            status: 'VERIFIED',
            severity: 'APPROVED',
            location: 'Tower B Lantai 5',
            inspectorName: 'Rudi Hartono (Chief Inspector)',
            score: 90.0,
            ncrNumber: 'OPN-2026-03-FIN',
            actionPlan: 'Opname diterima penuh',
            notes: JSON.stringify({
              opnameNumber: 'OPN-2026-03-FIN',
              spkNumber: 'SPK-2026-FIN-03',
              subconName: 'Mandor H. Komarudin',
              period: 'Maret 2026 (Minggu ke-4)',
              previousProgress: 60.0,
              currentProgress: 90.0,
              progressDelta: 30.0,
              verifiedBy: 'Rudi Hartono (Chief Inspector)',
              notes: 'Kelurusan dinding dan kerataan acian lolos toleransi uji jidar 2 meter (< 2mm).',
            }),
          },
        });
      }

      // 3. Seed Monthly Certificate (MC) if none exist
      const mcCount = await this.prisma.inspection.count({
        where: { category: 'SUBCON_MC' },
      });

      if (mcCount === 0) {
        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Monthly Certificate (MC) Ke-3: PT Sinar Baja Konstruksi',
            category: 'SUBCON_MC',
            status: 'APPROVED',
            severity: 'PAYMENT_READY',
            location: 'Finance Project Desk',
            inspectorName: 'Finance Project & Project Manager',
            score: 75.0,
            ncrNumber: 'MC-2026-03-01',
            actionPlan: 'Disetujui untuk proses penerbitan voucher pembayaran kas/bank',
            notes: JSON.stringify({
              mcNumber: 'MC-2026-03-01',
              spkNumber: 'SPK-2026-STR-01',
              subconName: 'PT Sinar Baja Konstruksi',
              period: 'Maret 2026',
              grossAmount: 612500000, // 25% dari Rp 2.45M
              dpDeduction: 61250000, // 10%
              retentionDeduction: 30625000, // 5%
              pphFinalPercent: 2.65,
              taxPphAmount: 16231250,
              netPayable: 504393750,
              status: 'APPROVED',
              notes: 'Termasuk sertifikat garansi dan rekonsiliasi material besi sisa.',
            }),
          },
        });

        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Monthly Certificate (MC) Ke-2: CV Citra Mandiri Teknik',
            category: 'SUBCON_MC',
            status: 'VERIFIED',
            severity: 'IN_REVIEW',
            location: 'Finance Project Desk',
            inspectorName: 'Quantity Surveyor (QS)',
            score: 45.0,
            ncrNumber: 'MC-2026-03-02',
            actionPlan: 'Menunggu tanda tangan Project Manager',
            notes: JSON.stringify({
              mcNumber: 'MC-2026-03-02',
              spkNumber: 'SPK-2026-MEP-02',
              subconName: 'CV Citra Mandiri Teknik',
              period: 'Maret 2026',
              grossAmount: 172500000, // 15% dari Rp 1.15M
              dpDeduction: 17250000, // 10%
              retentionDeduction: 8625000, // 5%
              pphFinalPercent: 2.65,
              taxPphAmount: 4571250,
              netPayable: 142053750,
              status: 'VERIFIED',
              notes: 'Dokumen pendukung BAP dan foto opname lengkap.',
            }),
          },
        });

        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Monthly Certificate (MC) Ke-4: Mandor H. Komarudin',
            category: 'SUBCON_MC',
            status: 'PAID',
            severity: 'DISBURSED',
            location: 'Bank Transfer Mandiri Operasional Proyek',
            inspectorName: 'Finance Project & Project Manager',
            score: 90.0,
            ncrNumber: 'MC-2026-03-03',
            actionPlan: 'Telah ditransfer ke Rek. BCA 4829-0012 a/n H. Komarudin',
            notes: JSON.stringify({
              mcNumber: 'MC-2026-03-03',
              spkNumber: 'SPK-2026-FIN-03',
              subconName: 'Mandor H. Komarudin',
              period: 'Maret 2026',
              grossAmount: 204000000, // 30% dari Rp 680jt
              dpDeduction: 20400000, // 10%
              retentionDeduction: 10200000, // 5%
              pphFinalPercent: 1.75, // Tarif mandor perorangan dengan NPWP
              taxPphAmount: 3570000,
              netPayable: 169830000,
              status: 'PAID',
              notes: 'Lunas ditransfer pada 28 Maret 2026. Bukti potong PPh 4(2) telah diserahkan.',
            }),
          },
        });
      }
    }
  }

  // --- Summary KPIs ---
  async getSummary(projectCode?: string) {
    const projectId = await this.getProjectId(projectCode);

    const spkList = await this.prisma.inspection.findMany({
      where: { projectId, category: 'SUBCON_SPK' },
    });

    const opnameList = await this.prisma.inspection.findMany({
      where: { projectId, category: 'SUBCON_OPNAME' },
    });

    const mcList = await this.prisma.inspection.findMany({
      where: { projectId, category: 'SUBCON_MC' },
    });

    let totalContractValue = 0;
    spkList.forEach((item) => {
      try {
        const parsed = JSON.parse(item.notes || '{}');
        totalContractValue += Number(parsed.contractValue || 0);
      } catch {
        // ignore
      }
    });

    let totalRetentionHeld = 0;
    let totalMcPayable = 0;
    let totalPaid = 0;

    mcList.forEach((item) => {
      try {
        const parsed = JSON.parse(item.notes || '{}');
        totalRetentionHeld += Number(parsed.retentionDeduction || 0);
        if (item.status === 'APPROVED' || item.status === 'VERIFIED') {
          totalMcPayable += Number(parsed.netPayable || 0);
        } else if (item.status === 'PAID') {
          totalPaid += Number(parsed.netPayable || 0);
        }
      } catch {
        // ignore
      }
    });

    return {
      totalSpkCount: spkList.length,
      activeSpkCount: spkList.filter((s) => s.status === 'ACTIVE').length,
      totalContractValue,
      totalOpnameCount: opnameList.length,
      totalMcCount: mcList.length,
      totalRetentionHeld,
      totalMcPayable,
      totalPaid,
    };
  }

  // --- SPK Management ---
  async getSpkList(projectCode?: string) {
    const projectId = await this.getProjectId(projectCode);
    const records = await this.prisma.inspection.findMany({
      where: { projectId, category: 'SUBCON_SPK' },
      orderBy: { inspectedAt: 'desc' },
    });

    return records.map((r) => {
      let meta: any = {};
      try {
        meta = JSON.parse(r.notes || '{}');
      } catch {
        meta = {};
      }
      return {
        id: r.id,
        spkNumber: r.ncrNumber || meta.spkNumber || 'SPK-AUTO',
        title: r.title,
        subconName: meta.subconName || r.actionPlan || 'Subkontraktor',
        category: r.severity || meta.category || 'STRUKTUR',
        scopeOfWork: meta.scopeOfWork || r.title,
        contractValue: meta.contractValue || 0,
        currentProgress: r.score ?? 0,
        status: r.status,
        downPaymentPercent: meta.downPaymentPercent || 10,
        retentionPercent: meta.retentionPercent || 5,
        startDate: meta.startDate || '2026-01-01',
        endDate: meta.endDate || '2026-12-31',
        picName: meta.picName || r.inspectorName,
        picPhone: meta.picPhone || '-',
        location: r.location,
        createdAt: r.inspectedAt,
      };
    });
  }

  async createSpk(dto: CreateSpkDto) {
    const projectId = await this.getProjectId(dto.projectCode);

    const record = await this.prisma.inspection.create({
      data: {
        projectId,
        title: `${dto.spkNumber}: ${dto.scopeOfWork}`,
        category: 'SUBCON_SPK',
        status: 'ACTIVE',
        severity: dto.category.toUpperCase(),
        location: 'Site Area Proyek',
        inspectorName: dto.picName,
        score: 0.0,
        ncrNumber: dto.spkNumber,
        actionPlan: dto.subconName,
        notes: JSON.stringify({
          spkNumber: dto.spkNumber,
          subconName: dto.subconName,
          scopeOfWork: dto.scopeOfWork,
          category: dto.category,
          contractValue: dto.contractValue,
          downPaymentPercent: dto.downPaymentPercent || 10,
          retentionPercent: dto.retentionPercent || 5,
          startDate: dto.startDate,
          endDate: dto.endDate,
          picName: dto.picName,
          picPhone: dto.picPhone || '-',
        }),
      },
    });

    return {
      message: 'SPK Subkontraktor berhasil diterbitkan',
      id: record.id,
      spkNumber: dto.spkNumber,
    };
  }

  // --- Opname Lapangan ---
  async getOpnameList(projectCode?: string) {
    const projectId = await this.getProjectId(projectCode);
    const records = await this.prisma.inspection.findMany({
      where: { projectId, category: 'SUBCON_OPNAME' },
      orderBy: { inspectedAt: 'desc' },
    });

    return records.map((r) => {
      let meta: any = {};
      try {
        meta = JSON.parse(r.notes || '{}');
      } catch {
        meta = {};
      }
      return {
        id: r.id,
        opnameNumber: r.ncrNumber || meta.opnameNumber || 'OPN-AUTO',
        title: r.title,
        spkNumber: meta.spkNumber || '-',
        subconName: meta.subconName || '-',
        period: meta.period || 'Maret 2026',
        previousProgress: meta.previousProgress || 0,
        currentProgress: r.score ?? meta.currentProgress ?? 0,
        progressDelta: (r.score ?? meta.currentProgress ?? 0) - (meta.previousProgress || 0),
        verifiedBy: r.inspectorName || meta.verifiedBy,
        location: r.location,
        status: r.status,
        notes: meta.notes || '',
        verifiedAt: r.inspectedAt,
      };
    });
  }

  async createOpname(dto: CreateOpnameDto) {
    const projectId = await this.getProjectId(dto.projectCode);

    // Update the parent SPK progress score if possible
    try {
      const spk = await this.prisma.inspection.findFirst({
        where: {
          projectId,
          category: 'SUBCON_SPK',
          OR: [{ id: dto.spkId }, { ncrNumber: dto.spkId }],
        },
      });

      if (spk) {
        await this.prisma.inspection.update({
          where: { id: spk.id },
          data: { score: dto.currentProgress },
        });
      }
    } catch {
      // non-critical
    }

    const record = await this.prisma.inspection.create({
      data: {
        projectId,
        title: `Opname Progres Lapangan ${dto.opnameNumber} (${dto.currentProgress}%)`,
        category: 'SUBCON_OPNAME',
        status: 'VERIFIED',
        severity: 'APPROVED',
        location: 'Area Kerja Subkon',
        inspectorName: dto.verifiedBy,
        score: dto.currentProgress,
        ncrNumber: dto.opnameNumber,
        actionPlan: 'Disetujui bersama tim pengawas lapangan',
        notes: JSON.stringify({
          opnameNumber: dto.opnameNumber,
          spkId: dto.spkId,
          spkNumber: dto.spkId,
          period: dto.period,
          previousProgress: dto.previousProgress,
          currentProgress: dto.currentProgress,
          progressDelta: dto.currentProgress - dto.previousProgress,
          verifiedBy: dto.verifiedBy,
          notes: dto.notes || '',
          evidencePhotoUrl: dto.evidencePhotoUrl,
        }),
      },
    });

    return {
      message: 'Berita Acara Opname Fisik Lapangan berhasil dicatat',
      id: record.id,
      opnameNumber: dto.opnameNumber,
      progress: dto.currentProgress,
    };
  }

  // --- Monthly Certificate (MC) ---
  async getMcList(projectCode?: string) {
    const projectId = await this.getProjectId(projectCode);
    const records = await this.prisma.inspection.findMany({
      where: { projectId, category: 'SUBCON_MC' },
      orderBy: { inspectedAt: 'desc' },
    });

    return records.map((r) => {
      let meta: any = {};
      try {
        meta = JSON.parse(r.notes || '{}');
      } catch {
        meta = {};
      }
      return {
        id: r.id,
        mcNumber: r.ncrNumber || meta.mcNumber || 'MC-AUTO',
        title: r.title,
        spkNumber: meta.spkNumber || '-',
        subconName: meta.subconName || '-',
        period: meta.period || 'Maret 2026',
        grossAmount: meta.grossAmount || 0,
        dpDeduction: meta.dpDeduction || 0,
        retentionDeduction: meta.retentionDeduction || 0,
        pphFinalPercent: meta.pphFinalPercent || 2.65,
        taxPphAmount: meta.taxPphAmount || 0,
        netPayable: meta.netPayable || 0,
        status: r.status,
        verifiedBy: r.inspectorName,
        notes: meta.notes || '',
        createdAt: r.inspectedAt,
      };
    });
  }

  async createMc(dto: CreateMcDto) {
    const projectId = await this.getProjectId(dto.projectCode);

    const record = await this.prisma.inspection.create({
      data: {
        projectId,
        title: `Monthly Certificate ${dto.mcNumber} (${dto.period})`,
        category: 'SUBCON_MC',
        status: 'VERIFIED',
        severity: 'IN_REVIEW',
        location: 'Finance Project Desk',
        inspectorName: 'Project QS & Finance',
        score: 100.0,
        ncrNumber: dto.mcNumber,
        actionPlan: 'Klaim pembayaran sertifikat bulanan',
        notes: JSON.stringify({
          mcNumber: dto.mcNumber,
          spkId: dto.spkId,
          spkNumber: dto.spkId,
          period: dto.period,
          grossAmount: dto.grossAmount,
          dpDeduction: dto.dpDeduction || 0,
          retentionDeduction: dto.retentionDeduction || 0,
          pphFinalPercent: dto.pphFinalPercent || 2.65,
          taxPphAmount: dto.taxPphAmount,
          netPayable: dto.netPayable,
          notes: dto.notes || '',
        }),
      },
    });

    return {
      message: 'Monthly Certificate (MC) berhasil diajukan',
      id: record.id,
      mcNumber: dto.mcNumber,
      netPayable: dto.netPayable,
    };
  }

  async updateMcStatus(id: string, dto: UpdateMcStatusDto) {
    const existing = await this.prisma.inspection.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`MC dengan ID ${id} tidak ditemukan`);
    }

    let meta: any = {};
    try {
      meta = JSON.parse(existing.notes || '{}');
    } catch {
      meta = {};
    }

    meta.status = dto.status;
    if (dto.approvedBy) meta.approvedBy = dto.approvedBy;
    if (dto.rejectionReason) meta.rejectionReason = dto.rejectionReason;

    const updated = await this.prisma.inspection.update({
      where: { id },
      data: {
        status: dto.status,
        actionPlan:
          dto.status === 'APPROVED'
            ? 'Disetujui untuk proses pembayaran'
            : dto.status === 'PAID'
            ? 'Telah dicairkan oleh Finance'
            : existing.actionPlan,
        notes: JSON.stringify(meta),
      },
    });

    return {
      message: `Status MC berhasil diperbarui menjadi ${dto.status}`,
      id: updated.id,
      status: updated.status,
    };
  }

  // --- Mitra Direktori ---
  async getVendors() {
    return [
      {
        id: 'subcon-01',
        name: 'PT Sinar Baja Konstruksi',
        category: 'STRUKTUR & PEMBESIAN',
        rating: 4.8,
        activeProjects: 3,
        contactPerson: 'H. Sudirman, S.T.',
        phone: '0812-8899-1001',
        legalStatus: 'SIUJK & SBU Terverifikasi (Kualifikasi Besar B1)',
        npwp: '01.345.678.9-012.000',
      },
      {
        id: 'subcon-02',
        name: 'CV Citra Mandiri Teknik',
        category: 'MEKANIKAL & PLUMBING (MEP)',
        rating: 4.6,
        activeProjects: 2,
        contactPerson: 'Ahmad Fauzi',
        phone: '0813-7722-4411',
        legalStatus: 'SIUJK & Sertifikat Ahli K3 MEP Aktif',
        npwp: '02.456.789.0-023.000',
      },
      {
        id: 'subcon-03',
        name: 'Mandor H. Komarudin',
        category: 'ARSITEKTUR & DINDING BATA',
        rating: 4.9,
        activeProjects: 1,
        contactPerson: 'H. Komarudin',
        phone: '0857-1133-9080',
        legalStatus: 'Mandor Terakreditasi LPJK (Tenaga Terampil Kelas 1)',
        npwp: '78.901.234.5-034.000',
      },
      {
        id: 'subcon-04',
        name: 'PT Pratama Karya Geoteknik',
        category: 'PONDASI BORE PILE & DEWATERING',
        rating: 4.7,
        activeProjects: 2,
        contactPerson: 'Ir. Yulianto Basuki',
        phone: '0811-2244-5566',
        legalStatus: 'SBU Spesialis Pondasi Dalam (Kualifikasi M1)',
        npwp: '03.567.890.1-045.000',
      },
    ];
  }
}

