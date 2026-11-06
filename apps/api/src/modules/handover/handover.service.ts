import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateHandoverCertificateDto } from './dto/create-handover-certificate.dto';
import { CreatePunchListDto } from './dto/create-punch-list.dto';
import { CreateRetentionReleaseDto } from './dto/create-retention-release.dto';

@Injectable()
export class HandoverService {
  constructor(private readonly prisma: PrismaService) {}

  private async getProjectId(projectCode?: string): Promise<string> {
    const project = await this.prisma.project.findFirst({
      where: projectCode ? { projectCode } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    if (!project) {
      throw new NotFoundException('Proyek konstruksi tidak ditemukan.');
    }
    return project.id;
  }

  // 1. Get Portfolio Summary
  async getSummary(projectCode?: string) {
    const projectId = await this.getProjectId(projectCode);
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { projectCode: true, name: true, contractValue: true },
    });

    const certificates = await this.getCertificates();
    const punchLists = await this.getPunchLists();
    const retentions = await this.getRetentionReleases();

    const totalPunch = punchLists.length;
    const rectifiedCount = punchLists.filter((p) => p.status === 'RECTIFIED' || p.status === 'VERIFIED_CLOSED').length;
    const resolutionRate = totalPunch > 0 ? Number(((rectifiedCount / totalPunch) * 100).toFixed(1)) : 100;

    const totalRetentionAmount = retentions.reduce((acc, r) => acc + r.retentionAmount, 0) || 7125000000;
    const releasedRetentionAmount = retentions
      .filter((r) => r.releaseStatus === 'RELEASED')
      .reduce((acc, r) => acc + r.retentionAmount, 0);

    return {
      projectId,
      projectCode: project?.projectCode || 'PRJ-2026-IKN-PK3',
      projectName: project?.name || 'Proyek Pembangunan Gedung Istana Kawasan Inti Pusat Pemerintahan (KIPP)',
      totalContractValue: Number(project?.contractValue || 142500000000),
      totalHandoverCertificates: certificates.length,
      activeDlpCount: certificates.filter((c) => c.status === 'SIGNED' && c.certificateType === 'PHO_BAST_1').length,
      fhoCompletedCount: certificates.filter((c) => c.certificateType === 'FHO_BAST_2' && c.status === 'SIGNED').length,
      totalPunchLists: totalPunch,
      openPunchLists: punchLists.filter((p) => p.status === 'OPEN' || p.status === 'IN_PROGRESS').length,
      closedPunchLists: rectifiedCount,
      punchListResolutionRate: resolutionRate,
      totalRetentionAmount,
      releasedRetentionAmount,
      retentionRemaining: totalRetentionAmount - releasedRetentionAmount,
    };
  }

  // 2. Get Certificates (PHO BAST I & FHO BAST II)
  async getCertificates(projectCode?: string, type?: string) {
    const defaultCertificates = [
      {
        id: 'bast-01',
        projectCode: 'PRJ-2026-IKN-PK3',
        certificateType: 'PHO_BAST_1',
        certificateNumber: 'BAST-PHO-2026-001',
        title: 'Serah Terima Pertama (PHO) Pekerjaan Fisik 100% Gedung Istana Utama IKN',
        handoverDate: '2026-03-31',
        workProgressPercent: 100,
        warrantyPeriodMonths: 6,
        warrantyEndDate: '2026-09-30',
        committeeChair: 'Ir. Danang Wicaksono, M.Eng. (PPHP PUPR)',
        contractorRepresentative: 'Ir. Agus Wijaya, M.T. (Project Manager)',
        ownerSignatory: 'Dr. Hendra Gunawan, S.T., M.T. (PPK PUPR)',
        status: 'SIGNED',
        signedAt: '2026-03-31T14:30:00Z',
        retentionAmount: 7125000000, // 5% dari 142.5M
        retentionStatus: 'HELD_IN_DLP',
        asBuiltDrawingsVerified: true,
        omManualVerified: true,
        notes: 'Fisik pekerjaan telah diuji komisioning lengkap, commissioning certificate diterbitkan. Memasuki masa pemeliharaan (DLP) 6 bulan.',
      },
      {
        id: 'bast-02',
        projectCode: 'PRJ-2026-LRT-DUKUH',
        certificateType: 'FHO_BAST_2',
        certificateNumber: 'BAST-FHO-2026-004',
        title: 'Serah Terima Akhir (FHO) Pekerjaan Trackwork & Viaduct LRT Jabodebek Extension',
        handoverDate: '2026-02-15',
        workProgressPercent: 100,
        warrantyPeriodMonths: 12,
        warrantyEndDate: '2026-02-15',
        committeeChair: 'Ir. Budi Prasetyo (PPHP Kemenhub)',
        contractorRepresentative: 'Drs. Hendro Wibowo (PM Trackwork)',
        ownerSignatory: 'Ahmad Syukri, M.Sc. (PPK Balai Kereta Api)',
        status: 'SIGNED',
        signedAt: '2026-02-15T11:00:00Z',
        retentionAmount: 4425000000,
        retentionStatus: 'RELEASED_FULL',
        asBuiltDrawingsVerified: true,
        omManualVerified: true,
        notes: 'Masa pemeliharaan 12 bulan tuntas tanpa catatan cacat mutu tersisa. Seluruh jaminan pemeliharaan dikembalikan.',
      },
      {
        id: 'bast-03',
        projectCode: 'PRJ-2026-TOL-SUMATRA',
        certificateType: 'PHO_BAST_1',
        certificateNumber: 'BAST-PHO-2026-008',
        title: 'Serah Terima Pertama (PHO) Paket Interchange & Gerbang Tol Seksi 4',
        handoverDate: '2026-04-10',
        workProgressPercent: 100,
        warrantyPeriodMonths: 12,
        warrantyEndDate: '2027-04-10',
        committeeChair: 'Ir. Slamet Riyadi (Direksi Teknis BPJT)',
        contractorRepresentative: 'Ir. Hendra Gunawan (PM Tol)',
        ownerSignatory: 'Bambang Sudiro (Direktur Utama PT Hutama Karya)',
        status: 'INSPECTION_PENDING',
        signedAt: null,
        retentionAmount: 4750000000,
        retentionStatus: 'HELD_IN_DLP',
        asBuiltDrawingsVerified: true,
        omManualVerified: false,
        notes: 'Pemeriksaan bersama tim PPHP sedang berlangsung. Dokumen manual O&M gardu tol dalam tahap verifikasi final.',
      },
    ];

    let result = defaultCertificates;
    if (projectCode) {
      result = result.filter((c) => c.projectCode === projectCode);
    }
    if (type && type !== 'ALL') {
      result = result.filter((c) => c.certificateType === type);
    }
    return result;
  }

  // 3. Create Handover Certificate
  async createCertificate(dto: CreateHandoverCertificateDto) {
    const handoverDateObj = new Date(dto.handoverDate);
    const warrantyEnd = new Date(handoverDateObj);
    warrantyEnd.setMonth(warrantyEnd.getMonth() + Number(dto.warrantyPeriodMonths));

    const newCert = {
      id: `bast-${Date.now().toString().slice(-4)}`,
      projectCode: dto.projectCode,
      certificateType: dto.certificateType,
      certificateNumber: dto.certificateNumber,
      title: dto.title,
      handoverDate: dto.handoverDate,
      workProgressPercent: Number(dto.workProgressPercent),
      warrantyPeriodMonths: Number(dto.warrantyPeriodMonths),
      warrantyEndDate: warrantyEnd.toISOString().split('T')[0],
      committeeChair: dto.committeeChair,
      contractorRepresentative: dto.contractorRepresentative,
      ownerSignatory: dto.ownerSignatory,
      status: 'DRAFT',
      signedAt: null,
      retentionAmount: 7125000000,
      retentionStatus: 'HELD_IN_DLP',
      asBuiltDrawingsVerified: true,
      omManualVerified: true,
      notes: dto.notes || 'Pengajuan penerbitan Berita Acara Serah Terima pekerjaan konstruksi.',
    };

    return newCert;
  }

  // 4. Sign Handover Certificate (PPHP / Contractor / Owner)
  async signCertificate(id: string, signatoryRole: 'PPHP' | 'CONTRACTOR' | 'OWNER_PPK', notes?: string) {
    const certs = await this.getCertificates();
    const cert = certs.find((c) => c.id === id) || certs[0];

    const updated = {
      ...cert,
      status: 'SIGNED',
      signedAt: new Date().toISOString(),
      verifiedByRole: signatoryRole,
      notes: notes || `Sertifikat ${cert.certificateNumber} telah disahkan dan ditandatangani oleh ${signatoryRole}.`,
    };

    return updated;
  }

  // 5. Get Punch List Items
  async getPunchLists(certificateId?: string, status?: string, severity?: string) {
    const punchLists = [
      {
        id: 'punch-01',
        certificateId: 'bast-01',
        itemCode: 'PUNCH-2026-001',
        title: 'Retak rambut pada plesteran dinding lobby utama lantai dasar',
        category: 'ARCHITECTURAL',
        severity: 'LOW',
        location: 'Lobby Utama Sayap Barat As 5-7',
        assignedSubcon: 'PT Dinding Megah Perkasa',
        deadline: '2026-04-15',
        status: 'VERIFIED_CLOSED',
        beforePhotoUrl: '/proofs/punch-lobby-crack-before.jpg',
        afterPhotoUrl: '/proofs/punch-lobby-crack-after.jpg',
        rectifiedDate: '2026-04-10',
        verifiedBy: 'Ir. Danang Wicaksono (PPHP PUPR)',
        notes: 'Perbaikan dengan plamir elastis dan pengecatan ulang telah rata sempurna dan disetujui pengawas.',
      },
      {
        id: 'punch-02',
        certificateId: 'bast-01',
        itemCode: 'PUNCH-2026-002',
        title: 'Rembesan waterproofing minor pada sambungan talang beton sayap barat',
        category: 'CIVIL_INFRA',
        severity: 'MEDIUM',
        location: 'Lantai Atap Blok C As 14-16',
        assignedSubcon: 'PT Tirta Waterproofing Mandiri',
        deadline: '2026-04-20',
        status: 'RECTIFIED',
        beforePhotoUrl: '/proofs/punch-gutter-leak-before.jpg',
        afterPhotoUrl: '/proofs/punch-gutter-leak-after.jpg',
        rectifiedDate: '2026-04-18',
        verifiedBy: 'Bambang Haryanto (Pengawas Lapangan)',
        notes: 'Injeksi sealant polyurethane telah diaplikasikan; menunggu uji genangan air 2x24 jam sebelum verifikasi closed.',
      },
      {
        id: 'punch-03',
        certificateId: 'bast-01',
        itemCode: 'PUNCH-2026-003',
        title: 'Pengaturan ulang balancing damper ducting HVAC ruang rapat VIP',
        category: 'MEP',
        severity: 'HIGH',
        location: 'Ruang Rapat VIP Lantai 2',
        assignedSubcon: 'PT Cipta Udara Segar',
        deadline: '2026-04-25',
        status: 'IN_PROGRESS',
        beforePhotoUrl: '/proofs/punch-hvac-damper-before.jpg',
        afterPhotoUrl: null,
        rectifiedDate: null,
        verifiedBy: null,
        notes: 'Tingkat kebisingan masih 52 dB (target batas maksimal 45 dB). Tim teknisi sedang mengganti sound attenuator.',
      },
      {
        id: 'punch-04',
        certificateId: 'bast-01',
        itemCode: 'PUNCH-2026-004',
        title: 'Pembersihan sisa noda semen & pelapisan ulang granite tile serambi',
        category: 'ARCHITECTURAL',
        severity: 'LOW',
        location: 'Serambi Timur Gedung Utama',
        assignedSubcon: 'PT Granit Selaras Alam',
        deadline: '2026-04-30',
        status: 'OPEN',
        beforePhotoUrl: '/proofs/punch-granite-clean-before.jpg',
        afterPhotoUrl: null,
        rectifiedDate: null,
        verifiedBy: null,
        notes: 'Poles lantai kristalisasi dijadwalkan setelah mobilisasi material interior selesai.',
      },
      {
        id: 'punch-05',
        certificateId: 'bast-02',
        itemCode: 'PUNCH-2026-005',
        title: 'Penyesuaian torsi baut elastis penambat rel jalur layang Stasiun Ciliwung',
        category: 'STRUCTURAL',
        severity: 'CRITICAL',
        location: 'Track 1 Km 12+450',
        assignedSubcon: 'PT Rekayasa Trackindo',
        deadline: '2026-02-10',
        status: 'VERIFIED_CLOSED',
        beforePhotoUrl: '/proofs/punch-rail-bolt-before.jpg',
        afterPhotoUrl: '/proofs/punch-rail-bolt-after.jpg',
        rectifiedDate: '2026-02-08',
        verifiedBy: 'Ir. Budi Prasetyo (PPHP Kemenhub)',
        notes: 'Kalibrasi uji torsi 250 Nm tuntas 100% dengan sertifikat uji keselamatan Ditjen Perkeretaapian.',
      },
    ];

    let result = punchLists;
    if (certificateId) {
      result = result.filter((p) => p.certificateId === certificateId);
    }
    if (status && status !== 'ALL') {
      result = result.filter((p) => p.status === status);
    }
    if (severity && severity !== 'ALL') {
      result = result.filter((p) => p.severity === severity);
    }
    return result;
  }

  // 6. Create Punch List Item
  async createPunchList(dto: CreatePunchListDto) {
    const newPunch = {
      id: `punch-${Date.now().toString().slice(-4)}`,
      certificateId: dto.certificateId,
      itemCode: `PUNCH-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: dto.title,
      category: dto.category,
      severity: dto.severity,
      location: dto.location,
      assignedSubcon: dto.assignedSubcon,
      deadline: dto.deadline,
      status: 'OPEN',
      beforePhotoUrl: dto.beforePhotoUrl || '/proofs/punch-defect-default.jpg',
      afterPhotoUrl: null,
      rectifiedDate: null,
      verifiedBy: null,
      notes: dto.repairMethod || 'Temuan cacat mutu baru dicatat untuk ditindaklanjuti kontraktor pelaksana.',
    };

    return newPunch;
  }

  // 7. Rectify Punch List (Mark as repaired by Contractor)
  async rectifyPunchList(id: string, afterPhotoUrl: string, notes?: string) {
    const list = await this.getPunchLists();
    const item = list.find((p) => p.id === id) || list[0];

    const updated = {
      ...item,
      status: 'RECTIFIED',
      afterPhotoUrl: afterPhotoUrl || '/proofs/punch-rectified-sample.jpg',
      rectifiedDate: new Date().toISOString().split('T')[0],
      notes: notes || 'Perbaikan fisik cacat mutu telah selesai dikerjakan oleh subkontraktor dan siap diinspeksi konsultan pengawas.',
    };

    return updated;
  }

  // 8. Close Punch List (Approved by Supervising MK / Owner)
  async closePunchList(id: string, verifiedBy: string, notes?: string) {
    const list = await this.getPunchLists();
    const item = list.find((p) => p.id === id) || list[0];

    const updated = {
      ...item,
      status: 'VERIFIED_CLOSED',
      verifiedBy: verifiedBy || 'Ir. Danang Wicaksono, M.Eng. (PPHP PUPR)',
      notes: notes || 'Pekerjaan perbaikan cacat mutu telah diverifikasi dan dinyatakan tuntas sesuai spesifikasi teknis.',
    };

    return updated;
  }

  // 9. Get Retention Releases List
  async getRetentionReleases(certificateId?: string) {
    const retentions = [
      {
        id: 'ret-01',
        certificateId: 'bast-01',
        releaseNumber: 'RET-REL-2026-001',
        projectTitle: 'Pembangunan Gedung Istana Kawasan Inti IKN',
        releaseType: 'CASH_RETENTION',
        retentionAmount: 7125000000,
        bankName: 'Bank Mandiri (Persero) Tbk - Cabang Khusus BUMN',
        bankGuaranteeNumber: 'BG-MANDIRI-MNT-2026-9901',
        guaranteeValidityDate: '2026-09-30',
        releaseStatus: 'PENDING_VERIFICATION',
        financeApproval: true,
        ownerPpkApproval: false,
        releasedDate: null,
        notes: 'Pengajuan pencairan termin retensi 5% setelah 50% masa garansi pemeliharaan berjalan dengan resolusi punch list 75%.',
      },
      {
        id: 'ret-02',
        certificateId: 'bast-02',
        releaseNumber: 'RET-REL-2026-002',
        projectTitle: 'Trackwork & Viaduct LRT Jabodebek Extension Dukuh Atas',
        releaseType: 'MAINTENANCE_BOND',
        retentionAmount: 4425000000,
        bankName: 'Bank BNI (Persero) Tbk - Cabang Dukuh Atas',
        bankGuaranteeNumber: 'BG-BNI-MNT-2025-4412',
        guaranteeValidityDate: '2026-02-15',
        releaseStatus: 'RELEASED',
        financeApproval: true,
        ownerPpkApproval: true,
        releasedDate: '2026-02-20',
        notes: 'Pelepasan sertifikat Bank Garansi Pemeliharaan telah tuntas diserahkan kembali kepada kontraktor utama pasca-FHO.',
      },
    ];

    if (certificateId) {
      return retentions.filter((r) => r.certificateId === certificateId);
    }
    return retentions;
  }

  // 10. Create Retention Release Request
  async createRetentionRelease(dto: CreateRetentionReleaseDto) {
    const newRelease = {
      id: `ret-${Date.now().toString().slice(-4)}`,
      certificateId: dto.certificateId,
      releaseNumber: `RET-REL-2026-${Math.floor(100 + Math.random() * 900)}`,
      projectTitle: 'Proyek Pembangunan Gedung Istana Kawasan Inti IKN',
      releaseType: dto.releaseType,
      retentionAmount: Number(dto.retentionAmount),
      bankName: dto.bankName,
      bankGuaranteeNumber: dto.bankGuaranteeNumber || 'BG-PEMELIHARAAN-2026-DEFAULT',
      guaranteeValidityDate: dto.guaranteeValidityDate || '2026-12-31',
      releaseStatus: 'PENDING_VERIFICATION',
      financeApproval: true, // Pembuat finance otomatis setujui
      ownerPpkApproval: false,
      releasedDate: null,
      notes: dto.notes || 'Pengajuan pencairan uang retensi pemeliharaan proyek konstruksi.',
    };

    return newRelease;
  }

  // 11. Approve Retention Release (Dual Approval: Finance & Owner PPK)
  async approveRetentionRelease(id: string, approverRole: 'FINANCE' | 'OWNER_PPK', notes?: string) {
    const list = await this.getRetentionReleases();
    const release = list.find((r) => r.id === id) || list[0];

    const financeApproved = approverRole === 'FINANCE' ? true : release.financeApproval;
    const ownerApproved = approverRole === 'OWNER_PPK' ? true : release.ownerPpkApproval;
    const isFullyApproved = financeApproved && ownerApproved;

    const updated = {
      ...release,
      financeApproval: financeApproved,
      ownerPpkApproval: ownerApproved,
      releaseStatus: isFullyApproved ? 'RELEASED' : 'PENDING_VERIFICATION',
      releasedDate: isFullyApproved ? new Date().toISOString().split('T')[0] : null,
      notes: notes || `Otorisasi pelepasan retensi oleh ${approverRole} berhasil diverifikasi.`,
    };

    return updated;
  }
}
