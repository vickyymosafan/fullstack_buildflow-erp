import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateChangeOrderDto } from './dto/create-change-order.dto';
import { UpdateChangeOrderStatusDto } from './dto/update-change-order-status.dto';
import { CreateClaimDto } from './dto/create-claim.dto';

@Injectable()
export class ChangeOrdersService implements OnModuleInit {
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
      // 1. Seed Change Orders if none exist
      const ccoCount = await this.prisma.inspection.count({
        where: { category: 'CHANGE_ORDER' },
      });

      if (ccoCount === 0) {
        // CCO 1: Upgrading Spesifikasi Kaca Low-E (+Rp 485jt, +14 Hari, APPROVED_OWNER)
        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Upgrading Spesifikasi Kaca Low-E Double Glazing & Kanopi Baja Drop-Off',
            category: 'CHANGE_ORDER',
            status: 'APPROVED_OWNER',
            severity: 'SCOPE_ADDITION',
            location: 'Fasad Tower Utama & Lobby',
            inspectorName: 'Ir. Hendra Prasetyo (Konsultan MK)',
            score: 485000000, // Cost impact (Rp)
            ncrNumber: 'CCO-2026-001',
            actionPlan: 'Instruksi Owner untuk upgrading spesifikasi kaca low-e double glazing dan penambahan kanopi drop-off lobby',
            notes: JSON.stringify({
              ccoNumber: 'CCO-2026-001',
              title: 'Upgrading Spesifikasi Kaca Low-E Double Glazing & Kanopi Baja Drop-Off',
              changeType: 'SCOPE_ADDITION',
              requestedBy: 'OWNER',
              originatorName: 'Ir. Hendra Prasetyo (Konsultan MK)',
              reason: 'Instruksi Owner untuk upgrading spesifikasi fasad kaca hemat energi low-e double glazing dan penambahan kanopi baja area drop-off lobby utama',
              costImpact: 485000000,
              timeImpactDays: 14,
              location: 'Fasad Tower Utama & Lobby',
              wbsElement: 'ARS-FSD-01',
              status: 'APPROVED_OWNER',
              approvedCostImpact: 485000000,
              approvedTimeImpactDays: 14,
              reviewedBy: 'Budi Santoso, S.T. (Direktur Proyek)',
              reviewerNotes: 'Disetujui penuh sesuai Berita Acara Rekomendasi MK No. BA-042/MK/2026',
              submittedDate: '2026-02-10',
              approvedDate: '2026-02-18',
              items: [
                {
                  description: 'Upgrading Kaca Tempered 8mm ke DGU Low-E 6mm+12A+6mm',
                  qty: 1250,
                  unit: 'm2',
                  unitPrice: 280000,
                  totalPrice: 350000000,
                  type: 'ADDITION',
                },
                {
                  description: 'Struktur Rangka Baja WF & Atap Kaca Laminated Kanopi',
                  qty: 1,
                  unit: 'ls',
                  unitPrice: 135000000,
                  totalPrice: 135000000,
                  type: 'ADDITION',
                },
              ],
            }),
          },
        });

        // CCO 2: Relokasi Pipa & Pengurangan Bekisting (-Rp 120jt, 0 Hari, EXECUTED)
        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Relokasi Jalur Pipa Sanitair & Pengurangan Volume Bekisting Basement',
            category: 'CHANGE_ORDER',
            status: 'EXECUTED',
            severity: 'SCOPE_DEDUCTION',
            location: 'Basement B2 Zona STP',
            inspectorName: 'PT Sinar Baja Konstruksi',
            score: -120000000,
            ncrNumber: 'CCO-2026-002',
            actionPlan: 'Optimasi jalur pemipaan gravitasi STP menghasilkan efisiensi volume bekisting balok transfer basement 2',
            notes: JSON.stringify({
              ccoNumber: 'CCO-2026-002',
              title: 'Relokasi Jalur Pipa Sanitair & Pengurangan Volume Bekisting Basement',
              changeType: 'SCOPE_DEDUCTION',
              requestedBy: 'CONTRACTOR',
              originatorName: 'PT Sinar Baja Konstruksi',
              reason: 'Optimasi jalur instalasi pemipaan gravitasi STP menghasilkan pengurangan bekisting dan beton balok transfer basement',
              costImpact: -120000000,
              timeImpactDays: 0,
              location: 'Basement B2 Zona STP',
              wbsElement: 'MEP-SAN-02',
              status: 'EXECUTED',
              approvedCostImpact: -120000000,
              approvedTimeImpactDays: 0,
              reviewedBy: 'Ir. Hendra Prasetyo (Konsultan MK)',
              reviewerNotes: 'Pekerjaan kurang telah disetujui dan diperhitungkan pada MC ke-3',
              submittedDate: '2026-02-14',
              approvedDate: '2026-02-22',
              items: [
                {
                  description: 'Efisiensi Volume Bekisting Balok Transfer & Pelat B2',
                  qty: 480,
                  unit: 'm2',
                  unitPrice: -250000,
                  totalPrice: -120000000,
                  type: 'DEDUCTION',
                },
              ],
            }),
          },
        });

        // CCO 3: Perkuatan Pondasi Bored Pile (+Rp 340jt, +10 Hari, REVIEW_MK)
        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Penambahan Perkuatan Pondasi Bored Pile Akibat Lensa Pasir Lapangan',
            category: 'CHANGE_ORDER',
            status: 'REVIEW_MK',
            severity: 'SITE_CONDITION',
            location: 'Zona Pondasi Podium Tower A',
            inspectorName: 'Dr. Ir. Bambang Soedjarwo (Geoteknik MK)',
            score: 340000000,
            ncrNumber: 'CCO-2026-003',
            actionPlan: 'Lapisan lensa pasir lunak membutuhkan 6 titik tiang bored pile tambahan diameter 800mm',
            notes: JSON.stringify({
              ccoNumber: 'CCO-2026-003',
              title: 'Penambahan Perkuatan Pondasi Bored Pile Akibat Lensa Pasir Lapangan',
              changeType: 'SITE_CONDITION',
              requestedBy: 'CONSULTANT_MK',
              originatorName: 'Dr. Ir. Bambang Soedjarwo (Geoteknik MK)',
              reason: 'Ditemukan lapisan lensa pasir lunak tak terduga pada kedalaman 24m berdasarkan sondir ulang lapangan, membutuhkan 6 titik tiang bored pile tambahan',
              costImpact: 340000000,
              timeImpactDays: 10,
              location: 'Zona Pondasi Podium Tower A',
              wbsElement: 'STR-FND-03',
              status: 'REVIEW_MK',
              approvedCostImpact: null,
              approvedTimeImpactDays: null,
              reviewedBy: null,
              reviewerNotes: 'Sedang dalam review verifikasi kedalaman bor log dan tes beban PDA tiang uji',
              submittedDate: '2026-02-25',
              approvedDate: null,
              items: [
                {
                  description: 'Pengadaan & Pengeboran Bored Pile D800mm Kedalaman 28m',
                  qty: 6,
                  unit: 'titik',
                  unitPrice: 45000000,
                  totalPrice: 270000000,
                  type: 'ADDITION',
                },
                {
                  description: 'Uji Integritas Tiang PIT & PDA Dynamic Load Test',
                  qty: 2,
                  unit: 'titik',
                  unitPrice: 35000000,
                  totalPrice: 70000000,
                  type: 'ADDITION',
                },
              ],
            }),
          },
        });

        // CCO 4: Penataan Ulang Interior Lobby (+Rp 210jt, +7 Hari, SUBMITTED)
        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Penataan Ulang Interior Lobby & Finishing Dinding Marmer Import',
            category: 'CHANGE_ORDER',
            status: 'SUBMITTED',
            severity: 'DESIGN_REVISION',
            location: 'Lobby Utama Lantai 1',
            inspectorName: 'Studio Desain Pratama',
            score: 210000000,
            ncrNumber: 'CCO-2026-004',
            actionPlan: 'Revisi layout resepsionis, backdrop acoustic panel, dan aplikasi marmer Statuario pada dinding lift lobby',
            notes: JSON.stringify({
              ccoNumber: 'CCO-2026-004',
              title: 'Penataan Ulang Interior Lobby & Finishing Dinding Marmer Import',
              changeType: 'DESIGN_REVISION',
              requestedBy: 'OWNER',
              originatorName: 'Studio Desain Pratama',
              reason: 'Revisi layout resepsionis, backdrop acoustic panel, dan aplikasi marmer Statuario pada dinding lift lobby utama',
              costImpact: 210000000,
              timeImpactDays: 7,
              location: 'Lobby Utama Lantai 1',
              wbsElement: 'ARS-INT-04',
              status: 'SUBMITTED',
              approvedCostImpact: null,
              approvedTimeImpactDays: null,
              reviewedBy: null,
              reviewerNotes: null,
              submittedDate: '2026-03-01',
              approvedDate: null,
              items: [
                {
                  description: 'Dinding Cladding Marmer Import Statuario White',
                  qty: 140,
                  unit: 'm2',
                  unitPrice: 1500000,
                  totalPrice: 210000000,
                  type: 'ADDITION',
                },
              ],
            }),
          },
        });
      }

      // 2. Seed Construction Claims if none exist
      const claimCount = await this.prisma.inspection.count({
        where: { category: 'CONSTRUCTION_CLAIM' },
      });

      if (claimCount === 0) {
        // Claim 1: Rain delay
        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Klaim Perpanjangan Waktu Hujan Ekstrim Siklon Tropis',
            category: 'CONSTRUCTION_CLAIM',
            status: 'APPROVED',
            severity: 'RAIN_DELAY',
            location: 'Seluruh Area Proyek Lapangan',
            inspectorName: 'Ir. Hendra Prasetyo (Konsultan MK)',
            score: 18, // 18 Hari EoT
            ncrNumber: 'CLM-2026-001',
            actionPlan: 'Laporan resmi BMKG curah hujan > 150mm/hari mengakibatkan genangan galian retaining wall',
            notes: JSON.stringify({
              claimNumber: 'CLM-2026-001',
              title: 'Klaim Perpanjangan Waktu Hujan Ekstrim Siklon Tropis',
              claimCategory: 'RAIN_DELAY',
              submittedDate: '2026-02-15',
              requestedDays: 18,
              requestedCost: 0,
              status: 'APPROVED',
              approvedDays: 18,
              approvedCost: 0,
              evidenceDescription: 'Laporan resmi BMKG stasiun maritim curah hujan di atas 150 mm/hari selama 18 hari kumulatif mengakibatkan banjir genangan area galian retaining wall',
              verifiedBy: 'Ir. Hendra Prasetyo (Konsultan MK)',
              notes: 'Disetujui kompensasi waktu kerja 18 hari kalender tanpa kompensasi finansial (Force Majeure clause)',
            }),
          },
        });

        // Claim 2: Delay owner drawing
        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Keterlambatan Serah Terima Gambar Detail Arsitektur Lantai Atap',
            category: 'CONSTRUCTION_CLAIM',
            status: 'UNDER_REVIEW',
            severity: 'DELAY_OWNER_DRAWING',
            location: 'Struktur Crown Lantai Atap',
            inspectorName: 'PT Sinar Baja Konstruksi',
            score: 12, // 12 Hari
            ncrNumber: 'CLM-2026-002',
            actionPlan: 'Gambar For-Construction (FC) struktur crown baja terlambat diserahkan konsultan perencana',
            notes: JSON.stringify({
              claimNumber: 'CLM-2026-002',
              title: 'Keterlambatan Serah Terima Gambar Detail Arsitektur Lantai Atap',
              claimCategory: 'DELAY_OWNER_DRAWING',
              submittedDate: '2026-02-28',
              requestedDays: 12,
              requestedCost: 45000000,
              status: 'UNDER_REVIEW',
              approvedDays: null,
              approvedCost: null,
              evidenceDescription: 'Gambar For-Construction (FC) struktur crown baja dan helipad terlambat diserahkan konsultan perencana 14 hari kerja, menyebabkan mandor baja standby',
              verifiedBy: null,
              notes: 'Dalam proses klarifikasi perhitungan biaya standby alat berat dan mandor struktur',
            }),
          },
        });

        // Claim 3: Unexpected Groundwater seepage
        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Penanganan Rembesan Air Tanah Tak Terduga Basement Zona 3',
            category: 'CONSTRUCTION_CLAIM',
            status: 'APPROVED',
            severity: 'SITE_CONDITION',
            location: 'Basement Zona 3',
            inspectorName: 'PT Sinar Baja Konstruksi',
            score: 7, // 7 Hari
            ncrNumber: 'CLM-2026-003',
            actionPlan: 'Mata air rembesan tebing basement membutuhkan pengoperasian genset & dewatering pump tambahan',
            notes: JSON.stringify({
              claimNumber: 'CLM-2026-003',
              title: 'Penanganan Rembesan Air Tanah Tak Terduga Basement Zona 3',
              claimCategory: 'SITE_CONDITION',
              submittedDate: '2026-03-01',
              requestedDays: 7,
              requestedCost: 65000000,
              status: 'APPROVED',
              approvedDays: 7,
              approvedCost: 65000000,
              evidenceDescription: 'Terobosan mata air rembesan tebing basement membutuhkan pengoperasian genset & submersible dewatering pump tambahan selama 14 hari non-stop',
              verifiedBy: 'Ir. Hendra Prasetyo (Konsultan MK)',
              notes: 'Disetujui kompensasi biaya sewa pompa & solar genset sebesar Rp 65.000.000 dan EoT 7 hari',
            }),
          },
        });
      }
    }
  }

  // 1. Get KPI Summary
  async getSummary(projectCode?: string) {
    const projectId = await this.getProjectId(projectCode);

    const ccoRecords = await this.prisma.inspection.findMany({
      where: { projectId, category: 'CHANGE_ORDER' },
    });

    const claimRecords = await this.prisma.inspection.findMany({
      where: { projectId, category: 'CONSTRUCTION_CLAIM' },
    });

    const totalCcoCount = ccoRecords.length;
    let approvedCcoCount = 0;
    let reviewCcoCount = 0;
    let totalCostAddition = 0;
    let totalCostDeduction = 0;
    let totalTimeImpactDays = 0;

    for (const r of ccoRecords) {
      if (r.status === 'APPROVED_OWNER' || r.status === 'EXECUTED') {
        approvedCcoCount++;
      } else if (r.status === 'REVIEW_MK' || r.status === 'SUBMITTED') {
        reviewCcoCount++;
      }

      let parsed: any = {};
      try {
        parsed = r.notes ? JSON.parse(r.notes) : {};
      } catch {
        parsed = {};
      }

      const cost = Number(parsed.costImpact) || Number(r.score) || 0;
      if (cost >= 0) {
        totalCostAddition += cost;
      } else {
        totalCostDeduction += Math.abs(cost);
      }

      totalTimeImpactDays += Number(parsed.timeImpactDays) || 0;
    }

    const netCostImpact = totalCostAddition - totalCostDeduction;

    // Claims summary
    const totalClaimsCount = claimRecords.length;
    let approvedClaimDays = 0;
    let approvedClaimCost = 0;

    for (const clm of claimRecords) {
      let parsed: any = {};
      try {
        parsed = clm.notes ? JSON.parse(clm.notes) : {};
      } catch {
        parsed = {};
      }

      if (clm.status === 'APPROVED') {
        approvedClaimDays += Number(parsed.approvedDays) || Number(parsed.requestedDays) || Number(clm.score) || 0;
        approvedClaimCost += Number(parsed.approvedCost) || Number(parsed.requestedCost) || 0;
      }
    }

    // Default project contract baseline
    const originalContractValue = 28500000000; // Rp 28.5 Miliar baseline
    const revisedContractValue = originalContractValue + netCostImpact;
    const deviationPercent = parseFloat(((netCostImpact / originalContractValue) * 100).toFixed(2));
    const approvalRate = totalCcoCount > 0 ? Math.round((approvedCcoCount / totalCcoCount) * 100) : 100;

    return {
      totalCcoCount,
      approvedCcoCount,
      reviewCcoCount,
      totalCostAddition,
      totalCostDeduction,
      netCostImpact,
      totalTimeImpactDays,
      totalClaimsCount,
      approvedClaimDays,
      approvedClaimCost,
      originalContractValue,
      revisedContractValue,
      deviationPercent,
      approvalRate,
    };
  }

  // 2. Get Change Orders List
  async getChangeOrders(
    projectCode?: string,
    status?: string,
    changeType?: string,
    search?: string,
  ) {
    const projectId = await this.getProjectId(projectCode);
    const where: any = { projectId, category: 'CHANGE_ORDER' };

    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (changeType && changeType !== 'ALL') {
      where.severity = changeType;
    }

    const records = await this.prisma.inspection.findMany({
      where,
      orderBy: { inspectedAt: 'desc' },
    });

    const parsed = records.map((r) => {
      let notesData: any = {};
      try {
        notesData = r.notes ? JSON.parse(r.notes) : {};
      } catch {
        notesData = {};
      }

      return {
        id: r.id,
        ccoNumber: r.ncrNumber || notesData.ccoNumber || 'CCO-00',
        title: notesData.title || r.title,
        changeType: r.severity || notesData.changeType || 'SCOPE_ADDITION',
        requestedBy: notesData.requestedBy || 'OWNER',
        originatorName: notesData.originatorName || r.inspectorName,
        reason: notesData.reason || r.actionPlan || '',
        costImpact: Number(notesData.costImpact) || Number(r.score) || 0,
        timeImpactDays: Number(notesData.timeImpactDays) || 0,
        location: r.location || notesData.location || '',
        wbsElement: notesData.wbsElement || 'GENERAL',
        status: r.status,
        approvedCostImpact: notesData.approvedCostImpact || null,
        approvedTimeImpactDays: notesData.approvedTimeImpactDays || null,
        reviewedBy: notesData.reviewedBy || null,
        reviewerNotes: notesData.reviewerNotes || null,
        submittedDate: notesData.submittedDate || r.inspectedAt.toISOString().slice(0, 10),
        approvedDate: notesData.approvedDate || null,
        items: notesData.items || [],
        createdAt: r.inspectedAt,
      };
    });

    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      return parsed.filter(
        (c) =>
          c.ccoNumber.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.originatorName.toLowerCase().includes(q) ||
          c.reason.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q),
      );
    }

    return parsed;
  }

  // 3. Get Change Order by ID
  async getChangeOrderById(id: string) {
    const r = await this.prisma.inspection.findUnique({ where: { id } });
    if (!r || r.category !== 'CHANGE_ORDER') {
      throw new NotFoundException(`Tiket CCO dengan ID ${id} tidak ditemukan`);
    }

    let notesData: any = {};
    try {
      notesData = r.notes ? JSON.parse(r.notes) : {};
    } catch {
      notesData = {};
    }

    return {
      id: r.id,
      ccoNumber: r.ncrNumber || notesData.ccoNumber,
      title: notesData.title || r.title,
      changeType: r.severity || notesData.changeType,
      requestedBy: notesData.requestedBy,
      originatorName: notesData.originatorName || r.inspectorName,
      reason: notesData.reason || r.actionPlan,
      costImpact: Number(notesData.costImpact) || Number(r.score) || 0,
      timeImpactDays: Number(notesData.timeImpactDays) || 0,
      location: r.location,
      wbsElement: notesData.wbsElement,
      status: r.status,
      approvedCostImpact: notesData.approvedCostImpact,
      approvedTimeImpactDays: notesData.approvedTimeImpactDays,
      reviewedBy: notesData.reviewedBy,
      reviewerNotes: notesData.reviewerNotes,
      submittedDate: notesData.submittedDate,
      approvedDate: notesData.approvedDate,
      items: notesData.items || [],
      createdAt: r.inspectedAt,
    };
  }

  // 4. Create Change Order
  async createChangeOrder(dto: CreateChangeOrderDto) {
    const projectId = await this.getProjectId(dto.projectCode);

    const cost = Number(dto.costImpact) || 0;
    const timeDays = Number(dto.timeImpactDays) || 0;
    const ccoNum = dto.ccoNumber || `CCO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const reasonText = dto.reason || dto.title;

    const notesJson = JSON.stringify({
      ccoNumber: ccoNum,
      title: dto.title,
      changeType: dto.changeType || 'SCOPE_ADDITION',
      requestedBy: dto.requestedBy || 'OWNER',
      originatorName: dto.originatorName || 'Project Team',
      reason: reasonText,
      costImpact: cost,
      timeImpactDays: timeDays,
      location: dto.location || 'Area Proyek',
      wbsElement: dto.wbsElement || 'GENERAL',
      status: dto.status || 'SUBMITTED',
      submittedDate: new Date().toISOString().slice(0, 10),
      approvedCostImpact: null,
      approvedTimeImpactDays: null,
      reviewedBy: null,
      reviewerNotes: null,
      items: [
        {
          description: dto.title,
          qty: 1,
          unit: 'ls',
          unitPrice: cost,
          totalPrice: cost,
          type: cost >= 0 ? 'ADDITION' : 'DEDUCTION',
        },
      ],
    });

    const record = await this.prisma.inspection.create({
      data: {
        projectId,
        title: dto.title,
        category: 'CHANGE_ORDER',
        status: dto.status || 'SUBMITTED',
        severity: dto.changeType || 'SCOPE_ADDITION',
        location: dto.location || 'Area Proyek',
        inspectorName: dto.originatorName || 'Project Team',
        score: cost,
        ncrNumber: ccoNum,
        actionPlan: reasonText,
        notes: notesJson,
      },
    });

    return {
      success: true,
      message: `Tiket perubahan kontrak ${ccoNum} berhasil diajukan`,
      id: record.id,
      changeOrderId: record.id,
      ccoNumber: ccoNum,
      status: record.status,
      costImpact: cost,
      timeImpactDays: timeDays,
    };
  }

  // 5. Update Change Order Status (Approval / Review Workflow)
  async updateStatus(id: string, dto: UpdateChangeOrderStatusDto) {
    const r = await this.prisma.inspection.findUnique({ where: { id } });
    if (!r || r.category !== 'CHANGE_ORDER') {
      throw new NotFoundException(`Tiket CCO dengan ID ${id} tidak ditemukan`);
    }

    let notesData: any = {};
    try {
      notesData = r.notes ? JSON.parse(r.notes) : {};
    } catch {
      notesData = {};
    }

    notesData.status = dto.status;
    if (dto.reviewerNotes) notesData.reviewerNotes = dto.reviewerNotes;
    if (dto.reviewedBy) notesData.reviewedBy = dto.reviewedBy;
    if (dto.approvedCostImpact !== undefined) {
      notesData.approvedCostImpact = Number(dto.approvedCostImpact);
    }
    if (dto.approvedTimeImpactDays !== undefined) {
      notesData.approvedTimeImpactDays = Number(dto.approvedTimeImpactDays);
    }
    if (dto.status === 'APPROVED_OWNER' || dto.status === 'EXECUTED') {
      notesData.approvedDate = new Date().toISOString().slice(0, 10);
    }

    const updated = await this.prisma.inspection.update({
      where: { id },
      data: {
        status: dto.status,
        score: dto.approvedCostImpact !== undefined ? Number(dto.approvedCostImpact) : r.score,
        notes: JSON.stringify(notesData),
      },
    });

    return {
      success: true,
      message: `Status CCO ${r.ncrNumber} berhasil diperbarui menjadi ${dto.status}`,
      updatedStatus: updated.status,
      approvedCostImpact: notesData.approvedCostImpact,
      approvedTimeImpactDays: notesData.approvedTimeImpactDays,
    };
  }

  // 6. Get Claims List
  async getClaims(projectCode?: string, category?: string, status?: string) {
    const projectId = await this.getProjectId(projectCode);
    const where: any = { projectId, category: 'CONSTRUCTION_CLAIM' };

    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (category && category !== 'ALL') {
      where.severity = category;
    }

    const records = await this.prisma.inspection.findMany({
      where,
      orderBy: { inspectedAt: 'desc' },
    });

    return records.map((r) => {
      let notesData: any = {};
      try {
        notesData = r.notes ? JSON.parse(r.notes) : {};
      } catch {
        notesData = {};
      }

      return {
        id: r.id,
        claimNumber: r.ncrNumber || notesData.claimNumber || 'CLM-00',
        title: notesData.title || r.title,
        claimCategory: r.severity || notesData.claimCategory || 'RAIN_DELAY',
        submittedDate: notesData.submittedDate || r.inspectedAt.toISOString().slice(0, 10),
        requestedDays: Number(notesData.requestedDays) || Number(r.score) || 0,
        requestedCost: Number(notesData.requestedCost) || 0,
        status: r.status,
        approvedDays: notesData.approvedDays || null,
        approvedCost: notesData.approvedCost || null,
        evidenceDescription: notesData.evidenceDescription || r.actionPlan || '',
        verifiedBy: notesData.verifiedBy || r.inspectorName || null,
        notes: notesData.notes || '',
        createdAt: r.inspectedAt,
      };
    });
  }

  // 7. Create Construction Claim
  async createClaim(dto: CreateClaimDto) {
    const projectId = await this.getProjectId(dto.projectCode);

    const days = Number(dto.requestedDays) || 0;
    const cost = Number(dto.requestedCost) || 0;
    const clmNum = dto.claimNumber || `CLM-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

    const notesJson = JSON.stringify({
      claimNumber: clmNum,
      title: dto.title,
      claimCategory: dto.claimCategory || 'RAIN_DELAY',
      submittedDate: dto.submittedDate || new Date().toISOString().slice(0, 10),
      requestedDays: days,
      requestedCost: cost,
      status: dto.status || 'SUBMITTED',
      evidenceDescription: dto.evidenceDescription || 'Laporan kendala operasional lapangan',
      changeOrderId: dto.changeOrderId || null,
      approvedDays: null,
      approvedCost: null,
      verifiedBy: null,
      notes: 'Klaim baru diajukan, menunggu telaah teknis Konsultan MK',
    });

    const record = await this.prisma.inspection.create({
      data: {
        projectId,
        title: dto.title,
        category: 'CONSTRUCTION_CLAIM',
        status: dto.status || 'SUBMITTED',
        severity: dto.claimCategory || 'RAIN_DELAY',
        location: 'Area Site Proyek Lapangan',
        inspectorName: 'Kontraktor Utama (Tim QS)',
        score: days,
        ncrNumber: clmNum,
        actionPlan: dto.evidenceDescription || 'Laporan kendala operasional lapangan',
        notes: notesJson,
      },
    });

    return {
      success: true,
      message: `Klaim konstruksi ${clmNum} berhasil diajukan`,
      id: record.id,
      claimId: record.id,
      claimNumber: clmNum,
      requestedDays: days,
      requestedCost: cost,
      status: record.status,
    };
  }
}
