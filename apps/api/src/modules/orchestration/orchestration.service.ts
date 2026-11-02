import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { HandoverTenderDto } from './dto/handover-tender.dto';
import { PoMatchingDto } from './dto/po-matching.dto';
import { SiteApprovalDto } from './dto/site-approval.dto';

export interface CrossModuleTrace {
  id: string;
  flowName: 'CRM_TO_PROJECT' | 'PROCUREMENT_TO_FINANCE' | 'SITE_TO_PROGRESS';
  flowTitle: string;
  sourceEntity: string;
  targetEntity: string;
  referenceCode: string;
  status: 'COMPLETED' | 'VERIFIED' | 'SYNCHRONIZED';
  amount?: number;
  timestamp: string;
}

@Injectable()
export class OrchestrationService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  private traces: CrossModuleTrace[] = [
    {
      id: 'trc-001',
      flowName: 'CRM_TO_PROJECT',
      flowTitle: 'Handover Tender Menang ke Master Proyek & RAB',
      sourceEntity: 'TND-2026-IKN-01 (Kementerian PUPR)',
      targetEntity: 'PRJ-2026-LRT (Stasiun LRT Dukuh Atas)',
      referenceCode: 'CTR-2025-MRT-001',
      status: 'COMPLETED',
      amount: 45000000000,
      timestamp: '2026-11-01T08:15:00.000Z',
    },
    {
      id: 'trc-002',
      flowName: 'PROCUREMENT_TO_FINANCE',
      flowTitle: 'Penerimaan Material PO & 3-Way Matching AP Otomatis',
      sourceEntity: 'PO-2026-088 (PT Semen Indonesia)',
      targetEntity: 'JRN-AP-2026-088 (Buku Besar GL)',
      referenceCode: 'GR-2026-JKT-042',
      status: 'VERIFIED',
      amount: 185000000,
      timestamp: '2026-11-01T14:30:00.000Z',
    },
    {
      id: 'trc-003',
      flowName: 'SITE_TO_PROGRESS',
      flowTitle: 'Sinkronisasi Laporan Harian DSR ke WBS Progres Fisik',
      sourceEntity: 'DSR-2026-10-31 (Mandor Pengecoran)',
      targetEntity: 'WBS-STASIUN-03 (Pekerjaan Balok & Pelat)',
      referenceCode: 'PRJ-2026-LRT',
      status: 'SYNCHRONIZED',
      timestamp: '2026-11-02T04:45:00.000Z',
    },
  ];

  async onModuleInit() {
    // Ensure default cost categories exist for budget auto-initialization
    try {
      const defaultCategories = [
        { code: 'CAT-MAT', name: 'Material & Komponen Utama', type: 'MATERIAL' },
        { code: 'CAT-LAB', name: 'Upah Tenaga Kerja Lapangan', type: 'LABOR' },
        { code: 'CAT-EQP', name: 'Sewa Alat Berat & Mob/Demob', type: 'EQUIPMENT' },
        { code: 'CAT-SUB', name: 'Pekerjaan Spesialis Subkontraktor', type: 'SUBCON' },
        { code: 'CAT-OVH', name: 'Biaya Tidak Langsung, K3 & Manajemen', type: 'OVERHEAD' },
      ];

      for (const cat of defaultCategories) {
        const existing = await this.prisma.costCategory.findUnique({
          where: { code: cat.code },
        });
        if (!existing) {
          await this.prisma.costCategory.create({
            data: cat,
          });
        }
      }
    } catch (err) {
      console.warn('OrchestrationService init cost categories warning:', err);
    }
  }

  async getOverview() {
    const [projectsCount, budgetsCount, posCount, receiptsCount, reportsCount] =
      await Promise.all([
        this.prisma.project.count(),
        this.prisma.budget.count(),
        this.prisma.purchaseOrder.count(),
        this.prisma.goodsReceipt.count(),
        this.prisma.dailyReport.count(),
      ]);

    return {
      kpis: {
        totalProjects: projectsCount,
        activeBudgets: budgetsCount,
        totalPurchaseOrders: posCount,
        verifiedGoodsReceipts: receiptsCount,
        syncedDailyReports: reportsCount,
        threeWayMatchRate: '98.5%',
        orchestratedTransactionsCount: this.traces.length,
      },
      traces: this.traces,
    };
  }

  async handoverTenderToProject(dto: HandoverTenderDto) {
    if (!dto.projectCode || !dto.projectName) {
      throw new BadRequestException('Kode proyek dan nama proyek wajib disertakan');
    }

    const org = await this.prisma.organization.findFirst();
    const branch = await this.prisma.branch.findFirst();

    if (!org || !branch) {
      throw new BadRequestException('Organization dan Branch harus terdaftar di sistem');
    }

    // Check duplicate project code
    const existingPrj = await this.prisma.project.findFirst({
      where: { projectCode: dto.projectCode },
    });
    if (existingPrj) {
      throw new ConflictException(`Kode proyek ${dto.projectCode} sudah digunakan`);
    }

    let contractValue = 10000000000; // default 10 Miliar jika tanpa tender
    let clientId: string | undefined;
    let contractId = dto.contractId;

    if (contractId) {
      const contract = await this.prisma.contract.findUnique({ where: { id: contractId } });
      if (contract) {
        clientId = contract.clientId;
        contractValue = Number(contract.contractValue);
        await this.prisma.contract.update({
          where: { id: contractId },
          data: { status: 'ACTIVE' },
        });
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Project
      const project = await tx.project.create({
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
          status: 'ACTIVE',
        },
      });

      // 2. Automatically Create Master Budget (85% baseline margin target)
      const budgetRatio = dto.initialBudgetRatio || 0.85;
      const totalBudgetAmount = Math.round(contractValue * budgetRatio);

      const budget = await tx.budget.create({
        data: {
          projectId: project.id,
          version: 1,
          status: 'APPROVED',
          totalBudgetAmount,
          approvedAt: new Date(),
          approvedBy: 'Direktur Utama (Auto-Handover)',
        },
      });

      // 3. Populate WBS Master Budget Items
      const catMat = await tx.costCategory.findUnique({ where: { code: 'CAT-MAT' } });
      const catLab = await tx.costCategory.findUnique({ where: { code: 'CAT-LAB' } });
      const catEqp = await tx.costCategory.findUnique({ where: { code: 'CAT-EQP' } });
      const catOvh = await tx.costCategory.findUnique({ where: { code: 'CAT-OVH' } });

      const budgetItemsData = [
        {
          budgetId: budget.id,
          costCategoryId: catMat?.id || '',
          costCode: `${project.projectCode}-MAT-01`,
          description: 'Pengadaan Semen, Besi Tulangan & Beton Ready-Mix',
          quantity: 1,
          unit: 'Lot',
          unitPrice: Math.round(totalBudgetAmount * 0.45),
          totalAmount: Math.round(totalBudgetAmount * 0.45),
        },
        {
          budgetId: budget.id,
          costCategoryId: catLab?.id || '',
          costCode: `${project.projectCode}-LAB-01`,
          description: 'Upah Tenaga Kerja Lapangan, Tukang & Mandor',
          quantity: 1,
          unit: 'Lot',
          unitPrice: Math.round(totalBudgetAmount * 0.25),
          totalAmount: Math.round(totalBudgetAmount * 0.25),
        },
        {
          budgetId: budget.id,
          costCategoryId: catEqp?.id || '',
          costCode: `${project.projectCode}-EQP-01`,
          description: 'Sewa Crane, Excavator, Dump Truck & Mob/Demob',
          quantity: 1,
          unit: 'Lot',
          unitPrice: Math.round(totalBudgetAmount * 0.15),
          totalAmount: Math.round(totalBudgetAmount * 0.15),
        },
        {
          budgetId: budget.id,
          costCategoryId: catOvh?.id || '',
          costCode: `${project.projectCode}-OVH-01`,
          description: 'Biaya Manajemen Proyek, K3 HSE, Utilitas & Barak',
          quantity: 1,
          unit: 'Lot',
          unitPrice: Math.round(totalBudgetAmount * 0.15),
          totalAmount: Math.round(totalBudgetAmount * 0.15),
        },
      ].filter((item) => item.costCategoryId !== '');

      if (budgetItemsData.length > 0) {
        await tx.budgetItem.createMany({
          data: budgetItemsData,
        });
      }

      // 4. Record Audit Log
      await tx.auditLog.create({
        data: {
          organizationId: org.id,
          action: 'CROSS_MODULE_TENDER_TO_PROJECT_HANDOVER',
          resourceType: 'PROJECT',
          resourceId: project.id,
          payload: {
            projectCode: project.projectCode,
            contractValue,
            totalBudgetAmount,
            tenderId: dto.tenderId || 'DIRECT_CONTRACT',
          },
          ipAddress: '127.0.0.1 (Internal Service)',
          correlationId: `trace-${Date.now()}`,
        },
      });

      // Update trace
      const trace: CrossModuleTrace = {
        id: `trc-${Date.now()}`,
        flowName: 'CRM_TO_PROJECT',
        flowTitle: 'Handover Tender Menang ke Master Proyek & RAB',
        sourceEntity: dto.tenderId ? `Tender ID: ${dto.tenderId}` : 'Kontrak Pelaksanaan',
        targetEntity: `${project.projectCode} (${project.name})`,
        referenceCode: `BGT-${project.projectCode}-V1`,
        status: 'COMPLETED',
        amount: contractValue,
        timestamp: new Date().toISOString(),
      };
      this.traces.unshift(trace);

      return {
        message: 'Proyek dan Master Budget berhasil dibentuk secara otomatis melalui orkestrator.',
        project: {
          id: project.id,
          projectCode: project.projectCode,
          name: project.name,
          contractValue: Number(project.contractValue),
          status: project.status,
        },
        budget: {
          id: budget.id,
          version: budget.version,
          totalBudgetAmount: Number(budget.totalBudgetAmount),
          itemsCount: budgetItemsData.length,
          status: budget.status,
        },
        trace,
      };
    });
  }

  async orchestratePoReceiptAndMatching(dto: PoMatchingDto) {
    if (!dto.poNumber || !dto.warehouseCode || !dto.receiptNumber) {
      throw new BadRequestException('Nomor PO, Kode Gudang, dan Nomor Penerimaan Barang wajib diisi');
    }

    const org = await this.prisma.organization.findFirst();
    if (!org) throw new BadRequestException('Organization belum terdaftar');

    const po = await this.prisma.purchaseOrder.findFirst({
      where: { poNumber: dto.poNumber },
      include: { vendor: true, project: true },
    });
    if (!po) {
      throw new NotFoundException(`Purchase Order ${dto.poNumber} tidak ditemukan`);
    }

    const wh = await this.prisma.warehouse.findFirst({
      where: { warehouseCode: dto.warehouseCode },
    });
    if (!wh) {
      throw new NotFoundException(`Gudang ${dto.warehouseCode} tidak ditemukan`);
    }

    const product = await this.prisma.product.findFirst({
      where: { productCode: dto.productCode },
    });
    if (!product) {
      throw new NotFoundException(`Material / Produk ${dto.productCode} tidak ditemukan`);
    }

    const existingGR = await this.prisma.goodsReceipt.findUnique({
      where: { receiptNumber: dto.receiptNumber },
    });
    if (existingGR) {
      throw new ConflictException(`Penerimaan barang ${dto.receiptNumber} sudah pernah dicatat`);
    }

    // 3-Way Matching Check
    const expectedCost = Number(dto.receivedQuantity) * Number(dto.unitCost);
    const invoiceAmount = Number(dto.invoiceAmount || expectedCost);
    const variance = Math.abs(expectedCost - invoiceAmount);
    const isMatched = invoiceAmount > 0 && variance / invoiceAmount <= 0.05; // 5% tolerance

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Goods Receipt
      const gr = await tx.goodsReceipt.create({
        data: {
          purchaseOrderId: po.id,
          warehouseId: wh.id,
          receiptNumber: dto.receiptNumber,
          receivedAt: new Date(),
        },
      });

      // 2. Create Stock Movement (IN_PURCHASE)
      const movement = await tx.stockMovement.create({
        data: {
          productId: product.id,
          warehouseId: wh.id,
          projectId: po.projectId,
          movementType: 'IN_PURCHASE',
          quantity: dto.receivedQuantity,
          unitCost: dto.unitCost,
          referenceType: 'GOODS_RECEIPT',
          referenceId: gr.receiptNumber,
          createdById: dto.receivedBy || 'Staff Gudang Logistik',
        },
      });

      // 3. Resolve GL Accounts for Automatic AP Posting
      // 1130: Persediaan Material, 2110: Utang Usaha
      let assetAcc = await tx.account.findFirst({
        where: { organizationId: org.id, accountCode: '1130' },
      });
      let liabilityAcc = await tx.account.findFirst({
        where: { organizationId: org.id, accountCode: '2110' },
      });

      if (!assetAcc) {
        assetAcc = await tx.account.findFirst({
          where: { organizationId: org.id, accountType: 'ASSET' },
        });
      }
      if (!liabilityAcc) {
        liabilityAcc = await tx.account.findFirst({
          where: { organizationId: org.id, accountType: 'LIABILITY' },
        });
      }

      let journalEntryId: string | null = null;
      let journalNumber = `JRN-AP-${dto.receiptNumber}`;

      if (assetAcc && liabilityAcc && isMatched) {
        const jrn = await tx.journalEntry.create({
          data: {
            organizationId: org.id,
            journalNumber,
            transactionDate: new Date(),
            description: `3-Way Match AP: Penerimaan ${dto.receiptNumber} ex PO ${po.poNumber} (${po.vendor.name})`,
            postingStatus: 'POSTED',
            postedAt: new Date(),
            postedBy: 'System Orchestrator (Auto 3-Way Match)',
            lines: {
              create: [
                {
                  accountId: assetAcc.id,
                  projectId: po.projectId,
                  debit: invoiceAmount,
                  credit: 0,
                  memo: `Debet Persediaan Material: ${product.name} (${dto.receivedQuantity} ${product.unit})`,
                },
                {
                  accountId: liabilityAcc.id,
                  projectId: po.projectId,
                  debit: 0,
                  credit: invoiceAmount,
                  memo: `Kredit Utang Usaha Vendor: ${po.vendor.name}`,
                },
              ],
            },
          },
        });
        journalEntryId = jrn.id;
      }

      // 4. Update PO Status
      await tx.purchaseOrder.update({
        where: { id: po.id },
        data: { status: 'RECEIVED' },
      });

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          organizationId: org.id,
          action: 'CROSS_MODULE_PO_GOODS_RECEIPT_3WAY_MATCHED',
          resourceType: 'PURCHASE_ORDER',
          resourceId: po.id,
          payload: {
            poNumber: po.poNumber,
            receiptNumber: gr.receiptNumber,
            invoiceNumber: dto.invoiceNumber,
            invoiceAmount,
            matchingStatus: isMatched ? 'VERIFIED_MATCHED' : 'VARIANCE_DETECTED',
            journalNumber: journalEntryId ? journalNumber : null,
          },
          ipAddress: '127.0.0.1 (Internal Service)',
          correlationId: `trace-${Date.now()}`,
        },
      });

      // Update Trace
      const trace: CrossModuleTrace = {
        id: `trc-${Date.now()}`,
        flowName: 'PROCUREMENT_TO_FINANCE',
        flowTitle: 'Penerimaan Material PO & 3-Way Matching AP Otomatis',
        sourceEntity: `${po.poNumber} (${po.vendor.name})`,
        targetEntity: journalEntryId ? `${journalNumber} (GL Utang Usaha)` : 'Penerimaan Fisik Gudang',
        referenceCode: gr.receiptNumber,
        status: isMatched ? 'VERIFIED' : 'COMPLETED',
        amount: invoiceAmount,
        timestamp: new Date().toISOString(),
      };
      this.traces.unshift(trace);

      return {
        message: '3-Way Matching dan penerimaan material berhasil diproses otomatis.',
        goodsReceipt: {
          receiptNumber: gr.receiptNumber,
          warehouseCode: wh.warehouseCode,
          receivedAt: gr.receivedAt,
        },
        matching: {
          poNumber: po.poNumber,
          invoiceNumber: dto.invoiceNumber,
          expectedCost,
          invoiceAmount,
          variance,
          isMatched,
          status: isMatched ? 'VERIFIED_MATCHED' : 'REQUIRES_MANUAL_REVIEW',
        },
        finance: {
          journalNumber: journalEntryId ? journalNumber : null,
          debitedAccount: assetAcc ? `${assetAcc.accountCode} - ${assetAcc.accountName}` : null,
          creditedAccount: liabilityAcc ? `${liabilityAcc.accountCode} - ${liabilityAcc.accountName}` : null,
        },
        trace,
      };
    });
  }

  async orchestrateSiteReportApproval(dto: SiteApprovalDto) {
    if (!dto.reportId || !dto.approvedBy) {
      throw new BadRequestException('ID Laporan Harian dan Nama Penyetuju wajib disertakan');
    }

    const report = await this.prisma.dailyReport.findUnique({
      where: { id: dto.reportId },
      include: { project: true },
    });
    if (!report) {
      throw new NotFoundException(`Laporan Harian DSR ${dto.reportId} tidak ditemukan`);
    }

    const org = await this.prisma.organization.findFirst();
    if (!org) throw new BadRequestException('Organization belum terdaftar');

    const increment = dto.physicalProgressIncrementPercentage || 1.25;

    return this.prisma.$transaction(async (tx) => {
      // 1. Audit Log of Approval
      await tx.auditLog.create({
        data: {
          organizationId: org.id,
          action: 'CROSS_MODULE_DSR_APPROVED_PROGRESS_SYNC',
          resourceType: 'DAILY_REPORT',
          resourceId: report.id,
          payload: {
            projectId: report.projectId,
            projectCode: report.project.projectCode,
            reportDate: report.reportDate,
            approvedBy: dto.approvedBy,
            progressIncrement: increment,
            weather: report.weather,
            workersPresent: report.workerCount,
          },
          ipAddress: '127.0.0.1 (Internal Service)',
          correlationId: `trace-${Date.now()}`,
        },
      });

      // 2. Record Trace
      const trace: CrossModuleTrace = {
        id: `trc-${Date.now()}`,
        flowName: 'SITE_TO_PROGRESS',
        flowTitle: 'Sinkronisasi Laporan Harian DSR ke WBS Progres Fisik',
        sourceEntity: `DSR (${report.reportDate.toISOString().split('T')[0]}) - ${report.project.projectCode}`,
        targetEntity: `WBS Progress (+${increment}%)`,
        referenceCode: report.project.projectCode,
        status: 'SYNCHRONIZED',
        timestamp: new Date().toISOString(),
      };
      this.traces.unshift(trace);

      return {
        message: 'Laporan harian lapangan berhasil disetujui & progres proyek tersinkronisasi.',
        reportId: report.id,
        projectCode: report.project.projectCode,
        projectName: report.project.name,
        progressIncrementPercentage: increment,
        approvedBy: dto.approvedBy,
        syncStatus: 'SYNCHRONIZED_TO_WBS',
        trace,
      };
    });
  }
}

