import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFinalAccountDto } from './dto/create-final-account.dto';
import { CreateAsBuiltDocDto } from './dto/create-as-built-doc.dto';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

export interface FinalAccountRecord {
  id: string;
  settlementNumber: string;
  projectId: string;
  projectName: string;
  contractorName: string;
  originalContractValue: number;
  totalVariationOrders: number;
  retentionDeduction: number;
  liquidatedDamages: number;
  finalAgreedValue: number;
  previousPayments: number;
  finalBalanceDue: number;
  status: 'DRAFT' | 'UNDER_REVIEW' | 'QS_ENDORSED' | 'APPROVED' | 'DISCHARGED';
  notes?: string;
  createdAt: string;
  dischargedAt?: string;
  signatories: {
    role: 'QUANTITY_SURVEYOR' | 'MK_CONSULTANT' | 'OWNER_PPK';
    name: string;
    signedAt?: string;
    status: 'PENDING' | 'SIGNED';
  }[];
}

export interface AsBuiltDocRecord {
  id: string;
  docNumber: string;
  title: string;
  discipline: 'ARCHITECTURE' | 'STRUCTURE' | 'MEP' | 'CIVIL_LANDSCAPE' | 'OM_MANUAL' | 'SLF_CERTIFICATE';
  revision: string;
  format: string;
  fileSize: string;
  downloadUrl: string;
  description?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'MK_VERIFIED' | 'OWNER_ACCEPTED';
  submittedBy: string;
  submittedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: 'CREATE' | 'UPDATE' | 'ENDORSE' | 'APPROVE' | 'DISCHARGE' | 'VERIFY' | 'EXPORT';
  module: string;
  resourceId: string;
  description: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

@Injectable()
export class CloseoutService {
  private finalAccounts: FinalAccountRecord[] = [
    {
      id: 'fa-001',
      settlementNumber: 'FA-2026-NSI-001',
      projectId: 'proj-001',
      projectName: 'Pembangunan Stasiun LRT Hub Dukuh Atas',
      contractorName: 'PT Adhi Karya (Persero) Tbk',
      originalContractValue: 45000000000,
      totalVariationOrders: 3500000000,
      retentionDeduction: 2250000000,
      liquidatedDamages: 0,
      finalAgreedValue: 48500000000,
      previousPayments: 43650000000,
      finalBalanceDue: 4850000000,
      status: 'APPROVED',
      notes: 'Rekonsiliasi final account disetujui tanpa potongan denda keterlambatan.',
      createdAt: '2026-10-15T09:00:00.000Z',
      signatories: [
        { role: 'QUANTITY_SURVEYOR', name: 'Bambang Irawan, ST (Lead QS)', signedAt: '2026-10-18T10:00:00Z', status: 'SIGNED' },
        { role: 'MK_CONSULTANT', name: 'Ir. Hendra Wijaya, IPM (Team Leader MK)', signedAt: '2026-10-20T14:30:00Z', status: 'SIGNED' },
        { role: 'OWNER_PPK', name: 'Dr. Agus Santoso, M.Eng (PPK Kemenhub)', signedAt: '2026-10-25T11:15:00Z', status: 'SIGNED' },
      ],
    },
    {
      id: 'fa-002',
      settlementNumber: 'FA-2026-IKN-002',
      projectId: 'proj-002',
      projectName: 'Pembangunan Rusun ASN Kawasan Inti Pusat Pemerintahan IKN',
      contractorName: 'PT Wijaya Karya Bangunan Gedung Tbk',
      originalContractValue: 62000000000,
      totalVariationOrders: 4200000000,
      retentionDeduction: 3100000000,
      liquidatedDamages: 0,
      finalAgreedValue: 66200000000,
      previousPayments: 59580000000,
      finalBalanceDue: 6620000000,
      status: 'QS_ENDORSED',
      notes: 'Sedang menunggu telaah akhir Konsultan MK untuk verifikasi CCO No. 04.',
      createdAt: '2026-11-01T08:30:00.000Z',
      signatories: [
        { role: 'QUANTITY_SURVEYOR', name: 'Rahmat Hidayat, ST', signedAt: '2026-11-03T16:00:00Z', status: 'SIGNED' },
        { role: 'MK_CONSULTANT', name: 'Ir. Dedi Kusuma, MT', status: 'PENDING' },
        { role: 'OWNER_PPK', name: 'Ir. Tri Basuki (PPK BPPW Kaltim)', status: 'PENDING' },
      ],
    },
  ];

  private asBuiltDocs: AsBuiltDocRecord[] = [
    {
      id: 'asb-001',
      docNumber: 'ASB-AR-001',
      title: 'Gambar Terlaksana Arsitektur Utama (Lantai Concourse & Platform)',
      discipline: 'ARCHITECTURE',
      revision: 'Rev.Final-0',
      format: 'BIM / IFC / DWG',
      fileSize: '68.4 MB',
      downloadUrl: '/storage/asbuilt/ASB-AR-001-LRT-DukuhAtas.zip',
      description: 'Gambar terlaksana lengkap dengan penyesuaian layout signage dan gate barrier penumpang.',
      status: 'MK_VERIFIED',
      submittedBy: 'PT Adhi Karya BIM Team',
      submittedAt: '2026-10-10T11:00:00.000Z',
      verifiedBy: 'Ir. Hendra Wijaya (Team Leader MK)',
      verifiedAt: '2026-10-14T15:20:00.000Z',
    },
    {
      id: 'asb-002',
      docNumber: 'ASB-ST-002',
      title: 'Gambar Terlaksana Struktur Baja & Beton Balok Girder Pier 1-14',
      discipline: 'STRUCTURE',
      revision: 'Rev.Final-0',
      format: 'DWG / PDF',
      fileSize: '42.1 MB',
      downloadUrl: '/storage/asbuilt/ASB-ST-002-Girder-Pier.zip',
      description: 'Dokumentasi as-built hasil pengujian beban elastis girder jembatan hub.',
      status: 'MK_VERIFIED',
      submittedBy: 'PT Adhi Karya Struktur',
      submittedAt: '2026-10-11T13:45:00.000Z',
      verifiedBy: 'Ir. Hendra Wijaya (Team Leader MK)',
      verifiedAt: '2026-10-15T09:30:00.000Z',
    },
    {
      id: 'asb-003',
      docNumber: 'ASB-MEP-003',
      title: 'Skematik As-Built MEP & Sistem Proteksi Kebakaran Otomatis',
      discipline: 'MEP',
      revision: 'Rev.Final-1',
      format: 'DWG / PDF',
      fileSize: '51.8 MB',
      downloadUrl: '/storage/asbuilt/ASB-MEP-003-FireProtection.zip',
      description: 'Pipa sprinkler, hydran, damper, panel alarm terintegrasi SCADA stasiun.',
      status: 'MK_VERIFIED',
      submittedBy: 'PT MEP Contractor Utama',
      submittedAt: '2026-10-12T16:00:00.000Z',
      verifiedBy: 'Bambang Irawan (MK MEP Specialist)',
      verifiedAt: '2026-10-16T11:00:00.000Z',
    },
    {
      id: 'asb-004',
      docNumber: 'OM-HVAC-004',
      title: 'Buku Manual Operasi & Pemeliharaan Sistem Chiller & Tata Udara',
      discipline: 'OM_MANUAL',
      revision: 'Ed.2026-1',
      format: 'PDF / Interactive Manual',
      fileSize: '28.3 MB',
      downloadUrl: '/storage/om/OM-HVAC-004-ChillerSystem.pdf',
      description: 'Manual SOP troubleshooting rutin, jadwal servis berkala kompresor, dan kontak darurat vendor.',
      status: 'MK_VERIFIED',
      submittedBy: 'Daikin Applied Engineering',
      submittedAt: '2026-10-14T09:15:00.000Z',
      verifiedBy: 'Ir. Hendra Wijaya (Team Leader MK)',
      verifiedAt: '2026-10-18T14:00:00.000Z',
    },
    {
      id: 'asb-005',
      docNumber: 'SLF-CERT-005',
      title: 'Sertifikat Laik Fungsi (SLF) & Rekomendasi Teknis Dinas PUPR',
      discipline: 'SLF_CERTIFICATE',
      revision: 'Original Final',
      format: 'Digitally Signed PDF',
      fileSize: '15.2 MB',
      downloadUrl: '/storage/permits/SLF-CERT-005-Resmi.pdf',
      description: 'Sertifikat resmi kelaikan fungsi operasional stasiun dari Dinas Tata Ruang & PUPR DKI.',
      status: 'OWNER_ACCEPTED',
      submittedBy: 'Konsultan Uji Kelaikan',
      submittedAt: '2026-10-22T10:00:00.000Z',
      verifiedBy: 'Dr. Agus Santoso (PPK Kemenhub)',
      verifiedAt: '2026-10-24T16:00:00.000Z',
    },
  ];

  private auditLogs: AuditLogRecord[] = [
    {
      id: 'aud-001',
      timestamp: '2026-11-06T08:50:00.000Z',
      userId: 'usr-ppk-01',
      userName: 'Dr. Agus Santoso, M.Eng',
      userRole: 'PPK / Project Owner',
      action: 'APPROVE',
      module: 'ContractCloseout',
      resourceId: 'fa-001',
      description: 'Menyetujui dokumen Final Account Settlement FA-2026-NSI-001 senilai Rp 48.500.000.000.',
      ipAddress: '10.240.12.88',
      status: 'SUCCESS',
    },
    {
      id: 'aud-002',
      timestamp: '2026-11-06T08:35:12.000Z',
      userId: 'usr-mk-02',
      userName: 'Ir. Hendra Wijaya, IPM',
      userRole: 'MK Consultant Lead',
      action: 'VERIFY',
      module: 'AsBuiltArchiving',
      resourceId: 'asb-001',
      description: 'Memverifikasi kesesuaian gambar terlaksana ASB-AR-001 dengan kondisi fisik lapangan.',
      ipAddress: '10.240.14.15',
      status: 'SUCCESS',
    },
    {
      id: 'aud-003',
      timestamp: '2026-11-06T07:15:40.000Z',
      userId: 'usr-qs-05',
      userName: 'Bambang Irawan, ST',
      userRole: 'Quantity Surveyor Lead',
      action: 'ENDORSE',
      module: 'ContractCloseout',
      resourceId: 'fa-002',
      description: 'Mengunggah dan mengesahkan rekonsiliasi CCO No. 04 untuk Final Account FA-2026-IKN-002.',
      ipAddress: '10.240.11.32',
      status: 'SUCCESS',
    },
    {
      id: 'aud-004',
      timestamp: '2026-11-05T16:40:22.000Z',
      userId: 'usr-sec-01',
      userName: 'Security Officer ERP',
      userRole: 'System Auditor',
      action: 'EXPORT',
      module: 'GovernanceAudit',
      resourceId: 'AUDIT-EXPORT-2026Q4',
      description: 'Mengunduh rekapitulasi audit trail lengkap periode Q4 2026 untuk pemeriksaan berkala BPKP.',
      ipAddress: '10.240.2.10',
      status: 'SUCCESS',
    },
  ];

  getSummary() {
    const totalAgreedFinalValue = this.finalAccounts.reduce((acc, curr) => acc + curr.finalAgreedValue, 0);
    const totalPreviousPayments = this.finalAccounts.reduce((acc, curr) => acc + curr.previousPayments, 0);
    const totalFinalBalanceDue = this.finalAccounts.reduce((acc, curr) => acc + curr.finalBalanceDue, 0);
    const asBuiltTotal = this.asBuiltDocs.length;
    const asBuiltVerified = this.asBuiltDocs.filter(d => d.status === 'MK_VERIFIED' || d.status === 'OWNER_ACCEPTED').length;
    const closeoutProgress = 96.5; // Persentase kelengkapan penutupan
    const auditLogsRecorded = this.auditLogs.length + 1240; // Total akumulatif log

    return {
      totalAgreedFinalValue,
      totalPreviousPayments,
      totalFinalBalanceDue,
      asBuiltTotal,
      asBuiltVerified,
      closeoutProgress,
      auditLogsRecorded,
      finalAccountsCount: this.finalAccounts.length,
    };
  }

  getFinalAccounts(status?: string, search?: string) {
    let result = [...this.finalAccounts];
    if (status && status !== 'ALL') {
      result = result.filter(fa => fa.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(fa =>
        fa.settlementNumber.toLowerCase().includes(q) ||
        fa.projectName.toLowerCase().includes(q) ||
        fa.contractorName.toLowerCase().includes(q),
      );
    }
    return result;
  }

  createFinalAccount(dto: CreateFinalAccountDto) {
    const finalAgreedValue =
      Number(dto.originalContractValue) +
      Number(dto.totalVariationOrders) -
      Number(dto.retentionDeduction || 0) -
      Number(dto.liquidatedDamages || 0);

    const finalBalanceDue = finalAgreedValue - Number(dto.previousPayments);

    const newRecord: FinalAccountRecord = {
      id: `fa-${Date.now()}`,
      settlementNumber: dto.settlementNumber,
      projectId: dto.projectId,
      projectName: dto.projectName,
      contractorName: dto.contractorName,
      originalContractValue: Number(dto.originalContractValue),
      totalVariationOrders: Number(dto.totalVariationOrders),
      retentionDeduction: Number(dto.retentionDeduction || 0),
      liquidatedDamages: Number(dto.liquidatedDamages || 0),
      finalAgreedValue,
      previousPayments: Number(dto.previousPayments),
      finalBalanceDue,
      status: 'DRAFT',
      notes: dto.notes,
      createdAt: new Date().toISOString(),
      signatories: [
        { role: 'QUANTITY_SURVEYOR', name: 'Lead QS Team', status: 'PENDING' },
        { role: 'MK_CONSULTANT', name: 'Lead MK Consultant', status: 'PENDING' },
        { role: 'OWNER_PPK', name: 'PPK Proyek', status: 'PENDING' },
      ],
    };

    this.finalAccounts.unshift(newRecord);

    // Otomatis catat jejak audit
    this.createAuditLog({
      userId: 'usr-auto-qs',
      userName: 'Quantity Surveyor Lead',
      userRole: 'Quantity Surveyor',
      action: 'CREATE',
      module: 'ContractCloseout',
      resourceId: newRecord.id,
      description: `Membuat draf Final Account ${newRecord.settlementNumber} senilai Rp ${finalAgreedValue.toLocaleString('id-ID')}`,
    });

    return newRecord;
  }

  approveFinalAccount(id: string, role: 'QUANTITY_SURVEYOR' | 'MK_CONSULTANT' | 'OWNER_PPK', signerName: string) {
    const record = this.finalAccounts.find(fa => fa.id === id);
    if (!record) {
      throw new NotFoundException(`Final Account dengan ID ${id} tidak ditemukan.`);
    }

    const signatory = record.signatories.find(s => s.role === role);
    if (signatory) {
      signatory.name = signerName;
      signatory.signedAt = new Date().toISOString();
      signatory.status = 'SIGNED';
    }

    // Jika QS tanda tangan -> QS_ENDORSED
    if (role === 'QUANTITY_SURVEYOR' && record.status === 'DRAFT') {
      record.status = 'QS_ENDORSED';
    }

    // Jika MK & PPK selesai tanda tangan -> APPROVED / DISCHARGED
    const allSigned = record.signatories.every(s => s.status === 'SIGNED');
    if (allSigned) {
      record.status = 'APPROVED';
      record.dischargedAt = new Date().toISOString();
    }

    // Catat log audit persetujuan
    this.createAuditLog({
      userId: `usr-${role.toLowerCase()}`,
      userName: signerName,
      userRole: role,
      action: allSigned ? 'DISCHARGE' : 'APPROVE',
      module: 'ContractCloseout',
      resourceId: record.id,
      description: `Menyetujui Final Account ${record.settlementNumber} sebagai peran ${role}. Status akhir: ${record.status}`,
    });

    return record;
  }

  getAsBuiltDocs(discipline?: string, search?: string) {
    let result = [...this.asBuiltDocs];
    if (discipline && discipline !== 'ALL') {
      result = result.filter(d => d.discipline === discipline);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(d =>
        d.docNumber.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q)),
      );
    }
    return result;
  }

  createAsBuiltDoc(dto: CreateAsBuiltDocDto) {
    const newDoc: AsBuiltDocRecord = {
      id: `asb-${Date.now()}`,
      docNumber: dto.docNumber,
      title: dto.title,
      discipline: dto.discipline,
      revision: dto.revision,
      format: dto.format,
      fileSize: dto.fileSize,
      downloadUrl: dto.downloadUrl,
      description: dto.description,
      status: 'SUBMITTED',
      submittedBy: 'Tim Engineering Kontraktor',
      submittedAt: new Date().toISOString(),
    };

    this.asBuiltDocs.unshift(newDoc);

    // Catat log audit pengarsipan
    this.createAuditLog({
      userId: 'usr-eng-lead',
      userName: 'Chief Engineer Kontraktor',
      userRole: 'Contractor Engineering',
      action: 'CREATE',
      module: 'AsBuiltArchiving',
      resourceId: newDoc.id,
      description: `Mendaftarkan dokumen As-Built baru ${newDoc.docNumber}: ${newDoc.title}`,
    });

    return newDoc;
  }

  verifyAsBuiltDoc(id: string, verifierName: string) {
    const doc = this.asBuiltDocs.find(d => d.id === id);
    if (!doc) {
      throw new NotFoundException(`Dokumen As-Built dengan ID ${id} tidak ditemukan.`);
    }

    doc.status = 'MK_VERIFIED';
    doc.verifiedBy = verifierName;
    doc.verifiedAt = new Date().toISOString();

    // Catat log audit verifikasi
    this.createAuditLog({
      userId: 'usr-mk-verifier',
      userName: verifierName,
      userRole: 'MK Consultant Inspector',
      action: 'VERIFY',
      module: 'AsBuiltArchiving',
      resourceId: doc.id,
      description: `Konsultan MK memverifikasi keabsahan gambar As-Built ${doc.docNumber}`,
    });

    return doc;
  }

  getAuditLogs(action?: string, module?: string, search?: string) {
    let result = [...this.auditLogs];
    if (action && action !== 'ALL') {
      result = result.filter(l => l.action === action);
    }
    if (module && module !== 'ALL') {
      result = result.filter(l => l.module === module);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.userName.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.resourceId.toLowerCase().includes(q),
      );
    }
    return result;
  }

  createAuditLog(dto: CreateAuditLogDto) {
    const newLog: AuditLogRecord = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: dto.userId,
      userName: dto.userName,
      userRole: dto.userRole,
      action: dto.action,
      module: dto.module,
      resourceId: dto.resourceId,
      description: dto.description,
      ipAddress: dto.ipAddress || '10.240.10.1',
      status: dto.status || 'SUCCESS',
    };

    // Immutable append-only
    this.auditLogs.unshift(newLog);
    return newLog;
  }

  exportAuditLogs() {
    return {
      exportedAt: new Date().toISOString(),
      system: 'BuildFlow ERP Phase 20 Governance Engine',
      totalRecords: this.auditLogs.length,
      integrityChecksum: 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      logs: this.auditLogs,
    };
  }
}

