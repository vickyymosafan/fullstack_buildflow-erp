import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface TenderOpportunity {
  id: string;
  tenderNumber: string;
  title: string;
  clientName: string;
  clientId?: string;
  category: 'INFRASTRUCTURE' | 'BUILDING' | 'INDUSTRIAL' | 'COMMERCIAL';
  ownerType: 'BUMN' | 'PEMERINTAH' | 'SWASTA';
  estimatedValue: number;
  bidBondAmount: number;
  submissionDeadline: string;
  stage: 'AANWIJZING' | 'PROPOSAL_SUBMITTED' | 'NEGOTIATION' | 'WON' | 'LOST';
  winProbability: number; // percentage 0 - 100
  notes?: string;
  handoverProjectId?: string;
  createdAt: string;
}

@Injectable()
export class CrmService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  // In-memory persistent tender opportunities with rich construction industry scenarios
  private tenders: TenderOpportunity[] = [
    {
      id: 'tnd-001',
      tenderNumber: 'TND-2026-IKN-01',
      title: 'Pembangunan Gedung Kantor Kementerian Koordinator Paket 3 IKN',
      clientName: 'Kementerian PUPR',
      category: 'BUILDING',
      ownerType: 'PEMERINTAH',
      estimatedValue: 240000000000,
      bidBondAmount: 12000000000,
      submissionDeadline: '2026-11-20',
      stage: 'PROPOSAL_SUBMITTED',
      winProbability: 75,
      notes: 'Dokumen teknis dan BOQ telah diajukan via SPSE. Evaluasi kualifikasi teknis grade A.',
      createdAt: '2026-10-15T08:30:00.000Z',
    },
    {
      id: 'tnd-002',
      tenderNumber: 'TND-2026-AP2-08',
      title: 'Perpanjangan & Penguatan Runway Bandara Internasional Kertajati',
      clientName: 'PT Angkasa Pura II',
      category: 'INFRASTRUCTURE',
      ownerType: 'BUMN',
      estimatedValue: 165000000000,
      bidBondAmount: 8250000000,
      submissionDeadline: '2026-11-28',
      stage: 'AANWIJZING',
      winProbability: 60,
      notes: 'Tahap penjelasan teknis (Aanwijzing kantor & site visit). Jaminan penawaran telah diterbitkan Bank Mandiri.',
      createdAt: '2026-10-20T10:15:00.000Z',
    },
    {
      id: 'tnd-003',
      tenderNumber: 'TND-2026-PLN-14',
      title: 'Pondasi Gardu Induk & Transmisi Tegangan Tinggi 150kV Jawa-Bali',
      clientName: 'PT PLN (Persero) UIP JBT',
      category: 'INDUSTRIAL',
      ownerType: 'BUMN',
      estimatedValue: 95000000000,
      bidBondAmount: 4750000000,
      submissionDeadline: '2026-11-10',
      stage: 'NEGOTIATION',
      winProbability: 85,
      notes: 'Peringkat 1 teknis & harga terendah terevaluasi. Klarifikasi harga satuan dan klausul jaminan pelaksanaan.',
      createdAt: '2026-09-28T14:00:00.000Z',
    },
    {
      id: 'tnd-004',
      tenderNumber: 'TND-2026-CP-05',
      title: 'Gudang Logistik & Cold Storage Cikarang Hub 25.000 m2',
      clientName: 'PT Mega Logistik Nusantara',
      category: 'COMMERCIAL',
      ownerType: 'SWASTA',
      estimatedValue: 58000000000,
      bidBondAmount: 2900000000,
      submissionDeadline: '2026-10-25',
      stage: 'WON',
      winProbability: 100,
      notes: 'Surat Penunjukan Penyedia Barang/Jasa (SPPBJ) telah terbit. Siap diterbitkan kontrak & handover proyek.',
      createdAt: '2026-09-01T09:00:00.000Z',
    },
    {
      id: 'tnd-005',
      tenderNumber: 'TND-2026-BDG-02',
      title: 'Underpass Simpang Pasteur Kota Bandung',
      clientName: 'Dinas Bina Marga Provinsi Jawa Barat',
      category: 'INFRASTRUCTURE',
      ownerType: 'PEMERINTAH',
      estimatedValue: 78000000000,
      bidBondAmount: 3900000000,
      submissionDeadline: '2026-09-15',
      stage: 'LOST',
      winProbability: 0,
      notes: 'Kompetitor mengajukan diskon harga 12% di bawah HPS. Analisis internal: margin terlalu berisiko.',
      createdAt: '2026-08-10T11:20:00.000Z',
    },
  ];

  async onModuleInit() {
    await this.seedDefaultsIfNeeded();
  }

  async seedDefaultsIfNeeded() {
    try {
      const clientCount = await this.prisma.client.count();
      if (clientCount > 0) return;

      // Seed 5 realistic Indonesian clients
      const mrt = await this.prisma.client.create({
        data: {
          name: 'PT MRT Jakarta (Perseroda)',
          legalName: 'PT Mass Rapid Transit Jakarta (Perseroda)',
          email: 'procurement@jakartamrt.co.id',
          phone: '+62-21-3906444',
          address: 'Wisma Nusantara Lt. 21, Jl. M.H. Thamrin No. 59, Jakarta Pusat',
        },
      });

      const jasaMarga = await this.prisma.client.create({
        data: {
          name: 'PT Jasa Marga (Persero) Tbk',
          legalName: 'PT Jasa Marga (Persero) Tbk',
          email: 'tender@jasamarga.co.id',
          phone: '+62-21-8413526',
          address: 'Plaza Tol Taman Mini Indonesia Indah, Jakarta Timur',
        },
      });

      const dinkes = await this.prisma.client.create({
        data: {
          name: 'Dinas Kesehatan Provinsi DKI Jakarta',
          legalName: 'Pemerintah Provinsi Daerah Khusus Ibukota Jakarta - Dinas Kesehatan',
          email: 'dinkes@jakarta.go.id',
          phone: '+62-21-3451338',
          address: 'Jl. Kesehatan No. 10, Petojo Selatan, Gambir, Jakarta Pusat',
        },
      });

      const summarecon = await this.prisma.client.create({
        data: {
          name: 'PT Summarecon Agung Tbk',
          legalName: 'PT Summarecon Agung Tbk',
          email: 'vendor.relation@summarecon.com',
          phone: '+62-21-4531101',
          address: 'Plaza Summarecon, Jl. Perintis Kemerdekaan No. 42, Jakarta Timur',
        },
      });

      const pupr = await this.prisma.client.create({
        data: {
          name: 'Kementerian PUPR',
          legalName: 'Kementerian Pekerjaan Umum dan Perumahan Rakyat Republik Indonesia',
          email: 'info@pu.go.id',
          phone: '+62-21-7221013',
          address: 'Jl. Pattimura No. 20, Kebayoran Baru, Jakarta Selatan',
        },
      });

      // Seed contracts linked to clients
      const ctr1 = await this.prisma.contract.create({
        data: {
          clientId: mrt.id,
          contractNumber: 'CTR-2025-MRT-001',
          title: 'Kontrak Paket Konstruksi Stasiun LRT Dukuh Atas Hub Transit',
          contractValue: 45000000000,
          startDate: new Date('2025-06-01'),
          endDate: new Date('2026-12-31'),
          status: 'ACTIVE',
        },
      });

      const ctr2 = await this.prisma.contract.create({
        data: {
          clientId: jasaMarga.id,
          contractNumber: 'CTR-2025-JM-082',
          title: 'Kontrak Konstruksi Utama Jalan Tol Akses Patimban Seksi 2',
          contractValue: 120000000000,
          startDate: new Date('2025-03-01'),
          endDate: new Date('2027-02-28'),
          status: 'ACTIVE',
        },
      });

      const ctr3 = await this.prisma.contract.create({
        data: {
          clientId: dinkes.id,
          contractNumber: 'CTR-2025-DKI-HSP',
          title: 'Kontrak Rancang Bangun Gedung RSUD Regional 8 Lantai',
          contractValue: 88000000000,
          startDate: new Date('2025-01-15'),
          endDate: new Date('2026-08-30'),
          status: 'ACTIVE',
        },
      });

      await this.prisma.contract.create({
        data: {
          clientId: summarecon.id,
          contractNumber: 'CTR-2026-SMA-012',
          title: 'Kontrak Struktur & Arsitektur Commercial Lifestyle Mall Bekasi',
          contractValue: 65000000000,
          startDate: new Date('2026-02-01'),
          endDate: new Date('2027-04-30'),
          status: 'SIGNED',
        },
      });

      // Link contracts & clients to existing 3 projects
      await this.prisma.project.updateMany({
        where: { projectCode: 'PRJ-2026-LRT' },
        data: { clientId: mrt.id, contractId: ctr1.id },
      });

      await this.prisma.project.updateMany({
        where: { projectCode: 'PRJ-2026-TOL' },
        data: { clientId: jasaMarga.id, contractId: ctr2.id },
      });

      await this.prisma.project.updateMany({
        where: { projectCode: 'PRJ-2025-HSP' },
        data: { clientId: dinkes.id, contractId: ctr3.id },
      });

      // Link client id to TND-2026-IKN-01
      const tndPUPR = this.tenders.find((t) => t.tenderNumber === 'TND-2026-IKN-01');
      if (tndPUPR) tndPUPR.clientId = pupr.id;
    } catch (err) {
      console.warn('CRM seed error (handled safely):', err);
    }
  }

  async getOverview() {
    const clients = await this.prisma.client.findMany({
      include: {
        contracts: true,
        projects: { select: { id: true, name: true, projectCode: true, status: true } },
      },
    });

    const contracts = await this.prisma.contract.findMany({
      include: { client: true, projects: true },
      orderBy: { createdAt: 'desc' },
    });

    const totalContractValue = contracts.reduce((acc, c) => acc + Number(c.contractValue), 0);
    const activeContractCount = contracts.filter((c) => c.status === 'ACTIVE' || c.status === 'SIGNED').length;

    const totalTenderPipelineValue = this.tenders.reduce((acc, t) => acc + t.estimatedValue, 0);
    const activeBids = this.tenders.filter((t) => t.stage !== 'WON' && t.stage !== 'LOST');
    const wonBids = this.tenders.filter((t) => t.stage === 'WON');
    const lostBids = this.tenders.filter((t) => t.stage === 'LOST');
    const decidedBidsCount = wonBids.length + lostBids.length;
    const winRate = decidedBidsCount > 0 ? Math.round((wonBids.length / decidedBidsCount) * 100) : 0;

    const stageBreakdown = {
      AANWIJZING: this.tenders.filter((t) => t.stage === 'AANWIJZING').length,
      PROPOSAL_SUBMITTED: this.tenders.filter((t) => t.stage === 'PROPOSAL_SUBMITTED').length,
      NEGOTIATION: this.tenders.filter((t) => t.stage === 'NEGOTIATION').length,
      WON: wonBids.length,
      LOST: lostBids.length,
    };

    return {
      kpis: {
        totalTenderPipelineValue,
        activeBidsCount: activeBids.length,
        totalContractsCount: contracts.length,
        activeContractsCount: activeContractCount,
        totalContractValue,
        totalClientsCount: clients.length,
        winRatePercentage: winRate,
      },
      stageBreakdown,
      recentTenders: this.tenders.slice(0, 5),
      recentContracts: contracts.slice(0, 5).map((c) => ({
        id: c.id,
        contractNumber: c.contractNumber,
        title: c.title,
        clientName: c.client?.name || 'Klien Tidak Terdaftar',
        contractValue: Number(c.contractValue),
        startDate: c.startDate.toISOString().split('T')[0],
        endDate: c.endDate.toISOString().split('T')[0],
        status: c.status,
        hasProject: c.projects.length > 0,
      })),
    };
  }

  async getClients() {
    const clients = await this.prisma.client.findMany({
      include: {
        contracts: true,
        projects: {
          select: {
            id: true,
            projectCode: true,
            name: true,
            status: true,
            contractValue: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return clients.map((c) => ({
      id: c.id,
      name: c.name,
      legalName: c.legalName || c.name,
      email: c.email || '-',
      phone: c.phone || '-',
      address: c.address || '-',
      contractsCount: c.contracts.length,
      projectsCount: c.projects.length,
      totalContractValue: c.contracts.reduce((acc, ctr) => acc + Number(ctr.contractValue), 0),
      projects: c.projects,
      createdAt: c.createdAt.toISOString(),
    }));
  }

  async createClient(dto: { name: string; legalName?: string; email?: string; phone?: string; address?: string }) {
    if (!dto.name) {
      throw new BadRequestException('Nama klien wajib diisi');
    }
    const client = await this.prisma.client.create({
      data: {
        name: dto.name,
        legalName: dto.legalName || dto.name,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
      },
    });
    return client;
  }

  async getContracts() {
    const contracts = await this.prisma.contract.findMany({
      include: {
        client: true,
        projects: {
          select: {
            id: true,
            projectCode: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return contracts.map((c) => ({
      id: c.id,
      contractNumber: c.contractNumber,
      title: c.title,
      clientId: c.clientId,
      clientName: c.client?.name || '-',
      clientLegalName: c.client?.legalName || c.client?.name || '-',
      contractValue: Number(c.contractValue),
      startDate: c.startDate.toISOString().split('T')[0],
      endDate: c.endDate.toISOString().split('T')[0],
      status: c.status,
      linkedProjects: c.projects,
      createdAt: c.createdAt.toISOString(),
    }));
  }

  async createContract(dto: {
    clientId: string;
    contractNumber: string;
    title: string;
    contractValue: number;
    startDate: string;
    endDate: string;
    status?: string;
  }) {
    if (!dto.clientId || !dto.contractNumber || !dto.title || !dto.contractValue) {
      throw new BadRequestException('Data kontrak tidak lengkap');
    }

    const client = await this.prisma.client.findUnique({ where: { id: dto.clientId } });
    if (!client) {
      throw new NotFoundException(`Klien dengan ID ${dto.clientId} tidak ditemukan`);
    }

    const contract = await this.prisma.contract.create({
      data: {
        clientId: dto.clientId,
        contractNumber: dto.contractNumber,
        title: dto.title,
        contractValue: dto.contractValue,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: dto.status || 'DRAFT',
      },
      include: { client: true },
    });

    return {
      ...contract,
      contractValue: Number(contract.contractValue),
    };
  }

  async getTenders() {
    return this.tenders;
  }

  async createTender(dto: {
    title: string;
    clientName: string;
    category?: 'INFRASTRUCTURE' | 'BUILDING' | 'INDUSTRIAL' | 'COMMERCIAL';
    ownerType?: 'BUMN' | 'PEMERINTAH' | 'SWASTA';
    estimatedValue: number;
    bidBondAmount?: number;
    submissionDeadline: string;
    notes?: string;
  }) {
    if (!dto.title || !dto.clientName || !dto.estimatedValue) {
      throw new BadRequestException('Data tender wajib diisi lengkap');
    }

    const tenderNumber = `TND-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${String(this.tenders.length + 1).padStart(2, '0')}`;
    const newTender: TenderOpportunity = {
      id: `tnd-${Date.now()}`,
      tenderNumber,
      title: dto.title,
      clientName: dto.clientName,
      category: dto.category || 'BUILDING',
      ownerType: dto.ownerType || 'SWASTA',
      estimatedValue: Number(dto.estimatedValue),
      bidBondAmount: dto.bidBondAmount ? Number(dto.bidBondAmount) : Math.round(Number(dto.estimatedValue) * 0.05),
      submissionDeadline: dto.submissionDeadline,
      stage: 'AANWIJZING',
      winProbability: 50,
      notes: dto.notes,
      createdAt: new Date().toISOString(),
    };

    this.tenders.unshift(newTender);
    return newTender;
  }

  async updateTenderStage(id: string, stage: 'AANWIJZING' | 'PROPOSAL_SUBMITTED' | 'NEGOTIATION' | 'WON' | 'LOST') {
    const tender = this.tenders.find((t) => t.id === id);
    if (!tender) {
      throw new NotFoundException(`Tender dengan ID ${id} tidak ditemukan`);
    }

    tender.stage = stage;
    if (stage === 'WON') tender.winProbability = 100;
    else if (stage === 'LOST') tender.winProbability = 0;
    else if (stage === 'NEGOTIATION') tender.winProbability = 80;
    else if (stage === 'PROPOSAL_SUBMITTED') tender.winProbability = 60;
    else if (stage === 'AANWIJZING') tender.winProbability = 40;

    return tender;
  }

  async handoverToProject(dto: {
    tenderId?: string;
    contractId?: string;
    projectCode: string;
    projectName: string;
    plannedStart?: string;
    plannedEnd?: string;
  }) {
    if (!dto.projectCode || !dto.projectName) {
      throw new BadRequestException('Project code dan project name wajib disertakan');
    }

    // Default Org & Branch IDs
    const org = await this.prisma.organization.findFirst();
    const branch = await this.prisma.branch.findFirst();

    if (!org || !branch) {
      throw new BadRequestException('Organization dan Branch harus terdaftar di sistem');
    }

    let clientId: string | undefined;
    let contractId = dto.contractId;
    let contractValue = 0;

    if (contractId) {
      const contract = await this.prisma.contract.findUnique({ where: { id: contractId } });
      if (contract) {
        clientId = contract.clientId;
        contractValue = Number(contract.contractValue);
        // Set contract to ACTIVE upon handover
        await this.prisma.contract.update({
          where: { id: contractId },
          data: { status: 'ACTIVE' },
        });
      }
    }

    if (dto.tenderId) {
      const tender = this.tenders.find((t) => t.id === dto.tenderId);
      if (tender) {
        tender.stage = 'WON';
        tender.winProbability = 100;
        if (!contractValue) contractValue = tender.estimatedValue;

        // If no contract existed yet, create one automatically
        if (!contractId) {
          // Check if client exists by name or create
          let client = await this.prisma.client.findFirst({ where: { name: tender.clientName } });
          if (!client) {
            client = await this.prisma.client.create({
              data: {
                name: tender.clientName,
                legalName: tender.clientName,
              },
            });
          }
          clientId = client.id;

          const newContract = await this.prisma.contract.create({
            data: {
              clientId: client.id,
              contractNumber: `CTR-AUTO-${tender.tenderNumber}`,
              title: `Kontrak Pelaksanaan ${tender.title}`,
              contractValue,
              startDate: dto.plannedStart ? new Date(dto.plannedStart) : new Date(),
              endDate: dto.plannedEnd ? new Date(dto.plannedEnd) : new Date(Date.now() + 365 * 24 * 3600 * 1000),
              status: 'ACTIVE',
            },
          });
          contractId = newContract.id;
        }
      }
    }

    // Create the Project in database
    const newProject = await this.prisma.project.create({
      data: {
        organizationId: org.id,
        branchId: branch.id,
        clientId,
        contractId,
        projectCode: dto.projectCode,
        name: dto.projectName,
        contractValue,
        plannedStart: dto.plannedStart ? new Date(dto.plannedStart) : new Date(),
        plannedEnd: dto.plannedEnd ? new Date(dto.plannedEnd) : new Date(Date.now() + 365 * 24 * 3600 * 1000),
        status: 'PLANNING',
      },
    });

    if (dto.tenderId) {
      const tender = this.tenders.find((t) => t.id === dto.tenderId);
      if (tender) tender.handoverProjectId = newProject.id;
    }

    return {
      message: 'Serah terima tender & kontrak ke proyek berhasil dilakukan',
      project: {
        id: newProject.id,
        projectCode: newProject.projectCode,
        name: newProject.name,
        contractValue: Number(newProject.contractValue),
        status: newProject.status,
      },
    };
  }
}

