import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateOfficialReportDto } from './dto/create-official-report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { CreateBastBapDto } from './dto/create-bast-bap.dto';

@Injectable()
export class OfficialReportsService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDemonstrationReports();
  }

  private async getProjectId(projectCode?: string): Promise<string> {
    if (projectCode) {
      const p = await this.prisma.project.findFirst({
        where: { projectCode },
      });
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

  // Auto-seed Initial Reports and BAP/BAST if empty
  private async seedDemonstrationReports() {
    const projectId = await this.getProjectId();
    const count = await this.prisma.inspection.count({
      where: { projectId, category: 'OFFICIAL_REPORT' },
    });

    if (count === 0) {

      // Report 1: Laporan Mingguan Ke-18 (Current Live)
      await this.prisma.inspection.create({
        data: {
          projectId,
          title: 'Laporan Mingguan Progres Fisik Minggu Ke-18',
          category: 'OFFICIAL_REPORT',
          status: 'VERIFIED_MK',
          severity: 'WEEKLY',
          location: 'Tower Utama Lantai 12 - 14 & Area Fasad',
          inspectorName: 'Ir. Agus Wijaya, M.T. (Project Manager)',
          score: 68.5, // 68.5%
          ncrNumber: 'LAP-MG-2026-018',
          actionPlan: 'Pengecoran plat lantai 14, instalasi curtain wall fasad utara lantai 8-10, dan pemipaan MEP basement 2',
          notes: JSON.stringify({
            reportNumber: 'LAP-MG-2026-018',
            reportType: 'WEEKLY',
            periodNumber: 18,
            startDate: '2026-02-23',
            endDate: '2026-03-01',
            title: 'Laporan Mingguan Progres Fisik Minggu Ke-18',
            cumulativeProgressPercent: 68.5,
            plannedProgressPercent: 65.0,
            variancePercent: 3.5,
            workSummary: 'Pengecoran plat lantai 14 (volume 145 m3), instalasi curtain wall kaca double glazing fasad utara lantai 8-10, serta pemipaan chiller MEP basement 2.',
            weatherSummary: '5 hari cerah berawan (efektif 8 jam/hari), 2 hari hujan sore (rata-rata 2.5 jam)',
            manpowerCount: 520,
            issuesSummary: 'Keterlambatan tiba armada kaca tempered 2 hari terkompensasi dengan penambahan shift lembur perakitan bracket.',
            contractorPic: 'Ir. Agus Wijaya, M.T.',
            mkPic: 'Ir. Hendra Prasetyo (Konsultan MK)',
            ownerPic: 'Dr. Ir. Bambang Sutrisno (PPK)',
            status: 'VERIFIED_MK',
            reviewerNotes: 'Opname volume beton dan uji kubus K-350 umur 7 hari telah memenuhi syarat teknis (Rata-rata 28.5 MPa). Dokumen disahkan.',
            approvedProgressPercent: 68.5,
            verifiedBy: 'Ir. Hendra Prasetyo (Konsultan MK)',
            verifiedAt: '2026-03-02T10:30:00Z',
            keyActivities: [
              { code: 'STR-FL14', desc: 'Pembesian & Pengecoran Plat Lantai 14', volume: '145 m3', unit: 'm3', weight: 4.2, status: 'DONE' },
              { code: 'FSD-CW-08', desc: 'Pemasangan Unitized Curtain Wall Fasad Utara', volume: '380 m2', unit: 'm2', weight: 3.8, status: 'DONE' },
              { code: 'MEP-CHILL', desc: 'Instalasi Pipa Chilled Water Menuju AHU', volume: '120 m', unit: 'm', weight: 2.1, status: 'IN_PROGRESS' },
              { code: 'ARS-INT-10', desc: 'Pasangan Dinding Bata Ringan Lantai 10', volume: '450 m2', unit: 'm2', weight: 1.5, status: 'IN_PROGRESS' },
            ],
          }),
        },
      });

      // Report 2: Laporan Mingguan Ke-17
      await this.prisma.inspection.create({
        data: {
          projectId,
          title: 'Laporan Mingguan Progres Fisik Minggu Ke-17',
          category: 'OFFICIAL_REPORT',
          status: 'APPROVED_OWNER',
          severity: 'WEEKLY',
          location: 'Tower Utama Lantai 11 - 13',
          inspectorName: 'Ir. Agus Wijaya, M.T. (Project Manager)',
          score: 64.2,
          ncrNumber: 'LAP-MG-2026-017',
          actionPlan: 'Pengecoran kolom struktur lantai 13 dan waterproofing toilet lantai 6-8',
          notes: JSON.stringify({
            reportNumber: 'LAP-MG-2026-017',
            reportType: 'WEEKLY',
            periodNumber: 17,
            startDate: '2026-02-16',
            endDate: '2026-02-22',
            title: 'Laporan Mingguan Progres Fisik Minggu Ke-17',
            cumulativeProgressPercent: 64.2,
            plannedProgressPercent: 61.5,
            variancePercent: 2.7,
            workSummary: 'Pengecoran kolom struktur lantai 13, waterproofing membran bakar toilet lantai 6-8, dan uji tekan pipa air bersih.',
            weatherSummary: '6 hari cerah, 1 hari hujan ringan',
            manpowerCount: 495,
            contractorPic: 'Ir. Agus Wijaya, M.T.',
            mkPic: 'Ir. Hendra Prasetyo (Konsultan MK)',
            ownerPic: 'Dr. Ir. Bambang Sutrisno (PPK)',
            status: 'APPROVED_OWNER',
            reviewerNotes: 'Laporan lengkap, progres mendahului schedule rencana +2.7%.',
            approvedProgressPercent: 64.2,
            verifiedBy: 'Dr. Ir. Bambang Sutrisno (PPK)',
            verifiedAt: '2026-02-24T14:15:00Z',
          }),
        },
      });

      // Report 3: Laporan Bulanan Ke-4 (Februari 2026)
      await this.prisma.inspection.create({
        data: {
          projectId,
          title: 'Laporan Bulanan Evaluasi Progres Proyek - Periode Ke-4 (Februari 2026)',
          category: 'OFFICIAL_REPORT',
          status: 'APPROVED_OWNER',
          severity: 'MONTHLY',
          location: 'Seluruh Area Konstruksi Gedung Utama & Lansekap',
          inspectorName: 'Ir. Agus Wijaya, M.T. (Project Manager)',
          score: 68.5,
          ncrNumber: 'LAP-BLN-2026-004',
          actionPlan: 'Rekapitulasi komprehensif pencapaian progres fisik, analisa EVM, deviasi biaya, dan K3 bulan Februari 2026',
          notes: JSON.stringify({
            reportNumber: 'LAP-BLN-2026-004',
            reportType: 'MONTHLY',
            periodNumber: 4,
            startDate: '2026-02-01',
            endDate: '2026-02-28',
            title: 'Laporan Bulanan Evaluasi Progres Proyek - Periode Ke-4 (Februari 2026)',
            cumulativeProgressPercent: 68.5,
            plannedProgressPercent: 65.0,
            variancePercent: 3.5,
            workSummary: 'Penyelesaian struktur kolom dan plat lantai 12-14, fasad kaca curtain wall utara-barat, pipa chiller HVAC, genset 1000kVA terpasang, serta zero accident 340.000 jam kerja.',
            weatherSummary: 'Curah hujan bulanan 142 mm, hari hujan efektif 6 hari.',
            manpowerCount: 2150,
            contractorPic: 'Ir. Agus Wijaya, M.T.',
            mkPic: 'Ir. Hendra Prasetyo (Konsultan MK)',
            ownerPic: 'Dr. Ir. Bambang Sutrisno (PPK)',
            status: 'APPROVED_OWNER',
            reviewerNotes: 'Evaluasi kinerja sangat baik (SPI 1.05 & CPI 1.02). Disetujui sebagai lampiran resmi penarikan termin IV.',
            approvedProgressPercent: 68.5,
            verifiedBy: 'Dr. Ir. Bambang Sutrisno (PPK)',
            verifiedAt: '2026-03-03T09:00:00Z',
          }),
        },
      });

      // Report 4: Laporan Harian 04 Maret 2026
      await this.prisma.inspection.create({
        data: {
          projectId,
          title: 'Laporan Harian Lapangan - 04 Maret 2026',
          category: 'OFFICIAL_REPORT',
          status: 'SUBMITTED',
          severity: 'DAILY',
          location: 'Lantai 14 & Area Ground Tank',
          inspectorName: 'Dedi Kurniawan, S.T. (Site Engineer)',
          score: 68.8,
          ncrNumber: 'LAP-HR-2026-0304',
          actionPlan: 'Pekerjaan bekisting balok lantai 15 dan pembesian ground reservoir',
          notes: JSON.stringify({
            reportNumber: 'LAP-HR-2026-0304',
            reportType: 'DAILY',
            periodNumber: 154,
            startDate: '2026-03-04',
            endDate: '2026-03-04',
            title: 'Laporan Harian Lapangan - 04 Maret 2026',
            cumulativeProgressPercent: 68.8,
            plannedProgressPercent: 65.4,
            variancePercent: 3.4,
            workSummary: 'Pemasangan scaffolding & bekisting balok lantai 15, perakitan besi D16 ground reservoir kapasitas 200 m3.',
            weatherSummary: 'Pagi cerah (31°C), siang berawan, malam cerah.',
            manpowerCount: 88,
            contractorPic: 'Dedi Kurniawan, S.T.',
            mkPic: 'Wahyu Hidayat, S.T. (Pengawas Lapangan MK)',
            status: 'SUBMITTED',
          }),
        },
      });

      // Seed BAP & BAST Records
      // BAP 1: Termin II (40%)
      await this.prisma.inspection.create({
        data: {
          projectId,
          title: 'Berita Acara Pembayaran (BAP) Termin Ke-2 Progres Fisik 40%',
          category: 'BAST_BAP',
          status: 'FINALIZED',
          severity: 'BAP_TERMIN',
          location: 'Kantor Pengelola Proyek',
          inspectorName: 'Tim Evaluator Bersama Kontraktor & MK',
          score: 40.0,
          ncrNumber: 'BAP-TERM-02-2025',
          actionPlan: 'Pembayaran termin ke-2 setelah verifikasi opname fisik struktur mencapai 40%',
          notes: JSON.stringify({
            docNumber: 'BAP-TERM-02-2025',
            docType: 'BAP_TERMIN',
            title: 'Berita Acara Pembayaran (BAP) Termin Ke-2 Progres Fisik 40%',
            terminNumber: 2,
            physicalProgressPercent: 40.0,
            grossAmount: 5700000000,
            retentionPercent: 5.0,
            retentionAmount: 285000000,
            netAmount: 5415000000,
            punchListItemsCount: 0,
            inspectionDate: '2025-12-15',
            contractorRepresentative: 'PT Adhi Megah Konstruksi',
            mkRepresentative: 'PT Ciriajasa MK Mandiri',
            ownerRepresentative: 'PPK Proyek Nusantara Tower',
            status: 'FINALIZED',
            notes: 'Pembayaran telah disalurkan penuh oleh KPPN / Bank Rekening Penampung.',
          }),
        },
      });

      // BAP 2: Termin III (60%)
      await this.prisma.inspection.create({
        data: {
          projectId,
          title: 'Berita Acara Pembayaran (BAP) Termin Ke-3 Progres Fisik 60%',
          category: 'BAST_BAP',
          status: 'APPROVED_OWNER',
          severity: 'BAP_TERMIN',
          location: 'Ruang Rapat Koordinasi MK',
          inspectorName: 'Tim Evaluator Tripartit',
          score: 60.0,
          ncrNumber: 'BAP-TERM-03-2026',
          actionPlan: 'Pengesahan capaian fisik 60% untuk pencairan termin pembayaran ke-3',
          notes: JSON.stringify({
            docNumber: 'BAP-TERM-03-2026',
            docType: 'BAP_TERMIN',
            title: 'Berita Acara Pembayaran (BAP) Termin Ke-3 Progres Fisik 60%',
            terminNumber: 3,
            physicalProgressPercent: 60.0,
            grossAmount: 5700000000,
            retentionPercent: 5.0,
            retentionAmount: 285000000,
            netAmount: 5415000000,
            punchListItemsCount: 2,
            inspectionDate: '2026-02-15',
            contractorRepresentative: 'PT Adhi Megah Konstruksi',
            mkRepresentative: 'PT Ciriajasa MK Mandiri',
            ownerRepresentative: 'PPK Proyek Nusantara Tower',
            status: 'APPROVED_OWNER',
            notes: 'Disetujui untuk diterbitkan SPP / SPM pembayaran termin 60%.',
          }),
        },
      });

      // BAST 1: Draft PHO (Provisional Hand Over)
      await this.prisma.inspection.create({
        data: {
          projectId,
          title: 'Draft Berita Acara Serah Terima Pertama (BAST-1 / PHO)',
          category: 'BAST_BAP',
          status: 'DRAFT',
          severity: 'BAST_1_PHO',
          location: 'Proyek Nusantara Prime Tower',
          inspectorName: 'Panitia Peneliti Pelaksanaan Kontrak (P3K)',
          score: 100.0,
          ncrNumber: 'BAST-PHO-2026-DRAFT',
          actionPlan: 'Penyusunan format baku serah terima pertama dan masa pemeliharaan retensi 180 hari',
          notes: JSON.stringify({
            docNumber: 'BAST-PHO-2026-DRAFT',
            docType: 'BAST_1_PHO',
            title: 'Draft Berita Acara Serah Terima Pertama (BAST-1 / PHO)',
            terminNumber: null,
            physicalProgressPercent: 100.0,
            grossAmount: 28500000000,
            retentionPercent: 5.0,
            retentionAmount: 1425000000,
            netAmount: 27075000000,
            punchListItemsCount: 5,
            inspectionDate: '2026-06-30',
            warrantyExpiryDate: '2026-12-31',
            contractorRepresentative: 'PT Adhi Megah Konstruksi',
            mkRepresentative: 'PT Ciriajasa MK Mandiri',
            ownerRepresentative: 'PPK Proyek Nusantara Tower',
            status: 'DRAFT',
            notes: 'Format baku disiapkan mengacu ke Permen PUPR No. 14/PRT/M/2020 Lampiran Standar BAST PHO.',
          }),
        },
      });
    }
  }

  // 1. Get KPI Summary with EVM Metrics
  async getSummary(projectCode?: string) {
    const projectId = await this.getProjectId(projectCode);
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    const contractValue = project?.contractValue ? Number(project.contractValue) : 28500000000;

    // Fetch latest verified report for progress %
    const reports = await this.prisma.inspection.findMany({
      where: { projectId, category: 'OFFICIAL_REPORT' },
      orderBy: { inspectedAt: 'desc' },
    });

    let currentPhysicalProgress = 68.5;
    let currentPlannedProgress = 65.0;

    if (reports.length > 0) {
      const latest = reports[0];
      try {
        const parsed = latest.notes ? JSON.parse(latest.notes) : {};
        currentPhysicalProgress = Number(parsed.cumulativeProgressPercent) || Number(latest.score) || currentPhysicalProgress;
        currentPlannedProgress = Number(parsed.plannedProgressPercent) || currentPlannedProgress;
      } catch {}
    }

    const variancePercent = Number((currentPhysicalProgress - currentPlannedProgress).toFixed(2));

    // EVM Calculations (ANSI/PMI 99-001)
    const plannedValue = Math.round((contractValue * currentPlannedProgress) / 100);
    const earnedValue = Math.round((contractValue * currentPhysicalProgress) / 100);
    // Actual cost is approximately 98% of earned value (healthy margin)
    const actualCost = Math.round(earnedValue * 0.98);

    const costVariance = earnedValue - actualCost;
    const scheduleVariance = earnedValue - plannedValue;
    const spi = Number((earnedValue / (plannedValue || 1)).toFixed(2));
    const cpi = Number((earnedValue / (actualCost || 1)).toFixed(2));
    const eac = Math.round(contractValue / (cpi || 1));
    const vac = contractValue - eac;

    const totalReports = reports.length;
    const bastBapCount = await this.prisma.inspection.count({
      where: { projectId, category: 'BAST_BAP' },
    });

    return {
      projectCode: project?.projectCode || 'PRJ-NSI-2026',
      projectName: project?.name || 'Proyek Nusantara Prime Tower',
      contractValue,
      physicalProgressPercent: currentPhysicalProgress,
      plannedProgressPercent: currentPlannedProgress,
      variancePercent,
      progressStatus: variancePercent >= 0 ? 'AHEAD_OF_SCHEDULE' : 'BEHIND_SCHEDULE',
      evm: {
        plannedValue,
        earnedValue,
        actualCost,
        costVariance,
        scheduleVariance,
        spi,
        cpi,
        eac,
        vac,
        costStatus: cpi >= 1.0 ? 'UNDER_BUDGET' : 'OVER_BUDGET',
        scheduleStatus: spi >= 1.0 ? 'AHEAD' : 'BEHIND',
      },
      totalReports,
      totalBastBap: bastBapCount,
      activePhase: 'Struktur Atas & Fasad (Tahap Konstruksi)',
      contractPeriod: 'Oktober 2025 - Juni 2026 (270 Hari Kalender)',
      leadContractor: 'PT Adhi Megah Konstruksi',
      mkConsultant: 'PT Ciriajasa MK Mandiri',
    };
  }

  // 2. Get Kurva S Data Points (24 Weeks)
  async getKurvaSData(projectCode?: string) {
    const summary = await this.getSummary(projectCode);
    const bac = summary.contractValue;

    // S-Curve standard progression curve (Sigmoid polynomial)
    const weeksTotal = 24;
    const currentWeek = 18;

    // Planned cumulative curve S baseline
    const plannedS = [
      1.2, 2.8, 5.0, 8.0, 11.5, 15.5, 20.0, 25.5, 31.5, 38.0, 45.0, 52.0, 59.0, 65.0, 71.5, 78.0, 84.0, 89.5, 94.0, 97.0, 98.8, 99.6, 100.0, 100.0
    ];

    // Actual progress recorded up to week 18
    const actualS = [
      1.5, 3.2, 5.5, 8.8, 12.0, 16.2, 21.0, 26.8, 33.0, 39.5, 47.0, 54.5, 61.2, 67.0, 73.0, 79.5, 85.2, 89.8
    ];

    const weeks = [];
    for (let w = 1; w <= weeksTotal; w++) {
      const planned = plannedS[w - 1];
      const actual = w <= currentWeek ? (actualS[w - 1] !== undefined ? actualS[w - 1] : null) : null;
      const plannedCost = Math.round((bac * planned) / 100);
      const actualCost = actual !== null ? Math.round(((bac * actual) / 100) * 0.98) : null;

      weeks.push({
        weekNumber: w,
        weekLabel: `Mgg ${String(w).padStart(2, '0')}`,
        plannedCumulative: planned,
        actualCumulative: actual,
        variance: actual !== null ? Number((actual - planned).toFixed(2)) : null,
        plannedValueRp: plannedCost,
        earnedValueRp: actual !== null ? Math.round((bac * actual) / 100) : null,
        actualCostRp: actualCost,
        status: actual !== null ? (actual >= planned ? 'AHEAD' : 'BEHIND') : 'PLANNED',
      });
    }

    return {
      totalWeeks: weeksTotal,
      currentWeek,
      bac,
      summaryEVM: summary.evm,
      dataPoints: weeks,
    };
  }

  // 3. Get Periodic Reports List
  async getReports(projectCode?: string, type?: string, status?: string) {
    const projectId = await this.getProjectId(projectCode);
    const where: any = { projectId, category: 'OFFICIAL_REPORT' };

    if (type && type !== 'ALL') {
      where.severity = type;
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const records = await this.prisma.inspection.findMany({
      where,
      orderBy: { inspectedAt: 'desc' },
    });

    return records.map((r) => {
      let parsed: any = {};
      try {
        parsed = r.notes ? JSON.parse(r.notes) : {};
      } catch {
        parsed = {};
      }

      return {
        id: r.id,
        reportNumber: r.ncrNumber || parsed.reportNumber || 'LAP-00',
        reportType: r.severity || parsed.reportType || 'WEEKLY',
        periodNumber: parsed.periodNumber || 1,
        title: parsed.title || r.title,
        startDate: parsed.startDate || r.inspectedAt.toISOString().slice(0, 10),
        endDate: parsed.endDate || r.inspectedAt.toISOString().slice(0, 10),
        cumulativeProgressPercent: Number(parsed.cumulativeProgressPercent) || Number(r.score) || 0,
        plannedProgressPercent: Number(parsed.plannedProgressPercent) || 0,
        variancePercent: Number(parsed.variancePercent) || 0,
        workSummary: parsed.workSummary || r.actionPlan || '',
        weatherSummary: parsed.weatherSummary || 'Cerah berawan',
        manpowerCount: parsed.manpowerCount || 0,
        issuesSummary: parsed.issuesSummary || null,
        contractorPic: parsed.contractorPic || r.inspectorName,
        mkPic: parsed.mkPic || 'Ir. Hendra Prasetyo (Konsultan MK)',
        ownerPic: parsed.ownerPic || 'Dr. Ir. Bambang Sutrisno (PPK)',
        status: r.status,
        reviewerNotes: parsed.reviewerNotes || null,
        approvedProgressPercent: parsed.approvedProgressPercent || null,
        verifiedBy: parsed.verifiedBy || null,
        verifiedAt: parsed.verifiedAt || null,
        createdAt: r.inspectedAt,
      };
    });
  }

  // 4. Get Report Detail by ID
  async getReportById(id: string) {
    const r = await this.prisma.inspection.findUnique({ where: { id } });
    if (!r || r.category !== 'OFFICIAL_REPORT') {
      throw new NotFoundException(`Laporan resmi dengan ID ${id} tidak ditemukan`);
    }

    let parsed: any = {};
    try {
      parsed = r.notes ? JSON.parse(r.notes) : {};
    } catch {
      parsed = {};
    }

    return {
      id: r.id,
      reportNumber: r.ncrNumber || parsed.reportNumber,
      reportType: r.severity || parsed.reportType,
      periodNumber: parsed.periodNumber,
      title: parsed.title || r.title,
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      cumulativeProgressPercent: Number(parsed.cumulativeProgressPercent) || Number(r.score) || 0,
      plannedProgressPercent: Number(parsed.plannedProgressPercent) || 0,
      variancePercent: Number(parsed.variancePercent) || 0,
      workSummary: parsed.workSummary || r.actionPlan,
      weatherSummary: parsed.weatherSummary,
      manpowerCount: parsed.manpowerCount,
      issuesSummary: parsed.issuesSummary,
      contractorPic: parsed.contractorPic || r.inspectorName,
      mkPic: parsed.mkPic,
      ownerPic: parsed.ownerPic,
      status: r.status,
      reviewerNotes: parsed.reviewerNotes,
      approvedProgressPercent: parsed.approvedProgressPercent,
      verifiedBy: parsed.verifiedBy,
      verifiedAt: parsed.verifiedAt,
      keyActivities: parsed.keyActivities || [],
      createdAt: r.inspectedAt,
    };
  }

  // 5. Create Official Report
  async createReport(dto: CreateOfficialReportDto) {
    const projectId = await this.getProjectId(dto.projectCode);
    const reportNum = dto.reportNumber || `LAP-${dto.reportType.slice(0, 2)}-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const variance = Number((Number(dto.cumulativeProgressPercent) - Number(dto.plannedProgressPercent)).toFixed(2));

    const notesJson = JSON.stringify({
      reportNumber: reportNum,
      reportType: dto.reportType,
      periodNumber: dto.periodNumber,
      startDate: dto.startDate,
      endDate: dto.endDate,
      title: dto.title,
      cumulativeProgressPercent: Number(dto.cumulativeProgressPercent),
      plannedProgressPercent: Number(dto.plannedProgressPercent),
      variancePercent: variance,
      workSummary: dto.workSummary,
      weatherSummary: dto.weatherSummary || 'Cerah berawan normal',
      manpowerCount: Number(dto.manpowerCount) || 50,
      issuesSummary: dto.issuesSummary || null,
      contractorPic: dto.contractorPic || 'Ir. Agus Wijaya, M.T.',
      mkPic: dto.mkPic || 'Ir. Hendra Prasetyo (Konsultan MK)',
      status: dto.status || 'SUBMITTED',
      reviewerNotes: null,
      approvedProgressPercent: null,
      verifiedBy: null,
      verifiedAt: null,
    });

    const record = await this.prisma.inspection.create({
      data: {
        projectId,
        title: dto.title,
        category: 'OFFICIAL_REPORT',
        status: dto.status || 'SUBMITTED',
        severity: dto.reportType,
        location: 'Area Utama Proyek Konstruksi',
        inspectorName: dto.contractorPic || 'Ir. Agus Wijaya, M.T.',
        score: Number(dto.cumulativeProgressPercent),
        ncrNumber: reportNum,
        actionPlan: dto.workSummary,
        notes: notesJson,
      },
    });

    return {
      success: true,
      message: `Laporan resmi ${reportNum} berhasil diajukan`,
      id: record.id,
      reportId: record.id,
      reportNumber: reportNum,
      status: record.status,
      cumulativeProgressPercent: Number(dto.cumulativeProgressPercent),
      variancePercent: variance,
    };
  }

  // 6. Update Report Status (Approval / Digital Signature Workflow)
  async updateReportStatus(id: string, dto: UpdateReportStatusDto) {
    const r = await this.prisma.inspection.findUnique({ where: { id } });
    if (!r || r.category !== 'OFFICIAL_REPORT') {
      throw new NotFoundException(`Laporan resmi dengan ID ${id} tidak ditemukan`);
    }

    let parsed: any = {};
    try {
      parsed = r.notes ? JSON.parse(r.notes) : {};
    } catch {
      parsed = {};
    }

    parsed.status = dto.status;
    parsed.reviewerNotes = dto.reviewerNotes || parsed.reviewerNotes;
    parsed.verifiedBy = dto.verifiedBy;
    parsed.verifiedAt = new Date().toISOString();
    if (dto.approvedProgressPercent !== undefined && dto.approvedProgressPercent !== null) {
      parsed.approvedProgressPercent = Number(dto.approvedProgressPercent);
      parsed.cumulativeProgressPercent = Number(dto.approvedProgressPercent);
    }

    const updated = await this.prisma.inspection.update({
      where: { id },
      data: {
        status: dto.status,
        score: parsed.cumulativeProgressPercent || r.score,
        notes: JSON.stringify(parsed),
      },
    });

    return {
      success: true,
      message: `Status laporan ${r.ncrNumber || id} berhasil diperbarui ke ${dto.status}`,
      id: updated.id,
      status: updated.status,
      verifiedBy: dto.verifiedBy,
      approvedProgressPercent: parsed.approvedProgressPercent || r.score,
    };
  }

  // 7. Get BAP & BAST Records
  async getBastBap(projectCode?: string, docType?: string, status?: string) {
    const projectId = await this.getProjectId(projectCode);
    const where: any = { projectId, category: 'BAST_BAP' };

    if (docType && docType !== 'ALL') {
      where.severity = docType;
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const records = await this.prisma.inspection.findMany({
      where,
      orderBy: { inspectedAt: 'desc' },
    });

    return records.map((r) => {
      let parsed: any = {};
      try {
        parsed = r.notes ? JSON.parse(r.notes) : {};
      } catch {
        parsed = {};
      }

      return {
        id: r.id,
        docNumber: r.ncrNumber || parsed.docNumber || 'DOC-BA-00',
        docType: r.severity || parsed.docType || 'BAP_TERMIN',
        title: parsed.title || r.title,
        terminNumber: parsed.terminNumber || null,
        physicalProgressPercent: Number(parsed.physicalProgressPercent) || Number(r.score) || 0,
        grossAmount: Number(parsed.grossAmount) || 0,
        retentionPercent: Number(parsed.retentionPercent) || 5.0,
        retentionAmount: Number(parsed.retentionAmount) || 0,
        netAmount: Number(parsed.netAmount) || 0,
        punchListItemsCount: Number(parsed.punchListItemsCount) || 0,
        inspectionDate: parsed.inspectionDate || r.inspectedAt.toISOString().slice(0, 10),
        warrantyExpiryDate: parsed.warrantyExpiryDate || null,
        contractorRepresentative: parsed.contractorRepresentative || 'PT Adhi Megah Konstruksi',
        mkRepresentative: parsed.mkRepresentative || 'PT Ciriajasa MK Mandiri',
        ownerRepresentative: parsed.ownerRepresentative || 'PPK Proyek Nusantara Tower',
        status: r.status,
        notes: parsed.notes || '',
        createdAt: r.inspectedAt,
      };
    });
  }

  // 8. Create BAP or BAST Document
  async createBastBap(dto: CreateBastBapDto) {
    const projectId = await this.getProjectId(dto.projectCode);
    const docNum = dto.docNumber || `BA-${dto.docType.slice(0, 3)}-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

    const gross = Number(dto.grossAmount) || 0;
    const retPercent = Number(dto.retentionPercent) || 5.0;
    const retAmount = dto.retentionAmount !== undefined ? Number(dto.retentionAmount) : Math.round((gross * retPercent) / 100);
    const net = dto.netAmount !== undefined ? Number(dto.netAmount) : (gross - retAmount);

    const notesJson = JSON.stringify({
      docNumber: docNum,
      docType: dto.docType,
      title: dto.title,
      terminNumber: dto.terminNumber || null,
      physicalProgressPercent: Number(dto.physicalProgressPercent),
      grossAmount: gross,
      retentionPercent: retPercent,
      retentionAmount: retAmount,
      netAmount: net,
      punchListItemsCount: Number(dto.punchListItemsCount) || 0,
      inspectionDate: dto.inspectionDate,
      warrantyExpiryDate: dto.warrantyExpiryDate || null,
      contractorRepresentative: dto.contractorRepresentative || 'PT Adhi Megah Konstruksi',
      mkRepresentative: dto.mkRepresentative || 'PT Ciriajasa MK Mandiri',
      ownerRepresentative: dto.ownerRepresentative || 'PPK Proyek Nusantara Tower',
      status: dto.status || 'DRAFT',
      notes: 'Dokumen Berita Acara diajukan melalui sistem BuildFlow ERP resmi.',
    });

    const record = await this.prisma.inspection.create({
      data: {
        projectId,
        title: dto.title,
        category: 'BAST_BAP',
        status: dto.status || 'DRAFT',
        severity: dto.docType,
        location: 'Kantor Pengelola Proyek Lapangan',
        inspectorName: dto.contractorRepresentative || 'Kontraktor Utama',
        score: Number(dto.physicalProgressPercent),
        ncrNumber: docNum,
        actionPlan: dto.title,
        notes: notesJson,
      },
    });

    return {
      success: true,
      message: `Berita Acara ${docNum} berhasil diterbitkan`,
      id: record.id,
      docId: record.id,
      docNumber: docNum,
      docType: dto.docType,
      netAmount: net,
      status: record.status,
    };
  }

  // 9. Get Print Preview Standard PUPR A4 Data
  async getPrintPreview(id?: string) {
    let report: any = null;
    if (id) {
      try {
        report = await this.getReportById(id);
      } catch {
        report = null;
      }
    }
    if (!report) {
      const allReports = await this.getReports();
      report = allReports[0] || {
        reportNumber: 'LAP-MG-2026-018',
        reportType: 'WEEKLY',
        startDate: '2026-02-23',
        endDate: '2026-03-01',
        title: 'Laporan Kemajuan Pekerjaan Fisik Konstruksi',
        cumulativeProgressPercent: 68.5,
        plannedProgressPercent: 65.0,
        variancePercent: 3.5,
        workSummary: 'Penyelesaian struktur kolom dan plat lantai 14',
        weatherSummary: 'Cerah Berawan',
        manpowerCount: 145,
        issuesSummary: 'Tidak ada deviasi kritis',
        contractorPic: 'Ir. Agus Wijaya, M.T.',
        mkPic: 'Ir. Hendra Prasetyo',
        ownerPic: 'Dr. Ir. Bambang Sutrisno',
        status: 'APPROVED_OWNER',
      };
    }
    const summary = await this.getSummary();

    return {
      documentTitle: 'Laporan Kemajuan Pekerjaan Fisik Konstruksi Standar PUPR',
      format: 'A4_OFFICIAL_PUPR',
      header: {
        ministry: 'KEMENTERIAN PEKERJAAN UMUM DAN PERUMAHAN RAKYAT',
        directorate: 'DIREKTORAT JENDERAL BINA MARGA & CIPTA KARYA',
        projectName: summary.projectName,
        projectCode: summary.projectCode,
        contractPeriod: summary.contractPeriod,
        contractValue: summary.contractValue,
      },
      document: {
        reportNumber: report.reportNumber,
        reportType: report.reportType,
        period: `${report.startDate} s/d ${report.endDate}`,
        title: report.title,
        physicalProgressPercent: report.cumulativeProgressPercent,
        plannedProgressPercent: report.plannedProgressPercent,
        variancePercent: report.variancePercent,
        workSummary: report.workSummary,
        weatherSummary: report.weatherSummary,
        manpowerCount: report.manpowerCount,
        issuesSummary: report.issuesSummary,
      },
      signatures: [
        {
          role: 'KONTRAKTOR UTAMA',
          company: summary.leadContractor,
          name: report.contractorPic,
          title: 'Project Manager',
          signed: true,
          status: 'TERVERIFIKASI',
        },
        {
          role: 'KONSULTAN PENGAWAS (MK)',
          company: summary.mkConsultant,
          name: report.mkPic,
          title: 'Team Leader MK',
          signed: report.status === 'VERIFIED_MK' || report.status === 'APPROVED_OWNER' || report.status === 'FINALIZED',
          status: report.status === 'VERIFIED_MK' || report.status === 'APPROVED_OWNER' || report.status === 'FINALIZED' ? 'DISETUJUI' : 'MENUNGGU_VERIFIKASI',
        },
        {
          role: 'PEMILIK PROYEK (OWNER / PPK)',
          company: 'Satuan Kerja Wilayah Metropolitan',
          name: report.ownerPic,
          title: 'Pejabat Pembuat Komitmen (PPK)',
          signed: report.status === 'APPROVED_OWNER' || report.status === 'FINALIZED',
          status: report.status === 'APPROVED_OWNER' || report.status === 'FINALIZED' ? 'DISAHKAN' : 'MENUNGGU_PENGESAHAN',
        },
      ],
    };
  }
}
