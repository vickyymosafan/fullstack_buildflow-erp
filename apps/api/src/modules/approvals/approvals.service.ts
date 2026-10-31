import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ApprovalActionDto } from './dto/approval-action.dto';

export interface PendingItem {
  id: string;
  itemType: 'PURCHASE_ORDER' | 'SITE_REPORT' | 'BUDGET_REVISION';
  title: string;
  projectCode: string;
  projectName: string;
  amount?: number;
  submittedBy: string;
  submittedAt: string;
  requiredRole: string;
  priority: 'HIGH' | 'MEDIUM' | 'NORMAL';
  status: 'PENDING';
}

@Injectable()
export class ApprovalsService {
  constructor(private prisma: PrismaService) {}

  private pendingStore: PendingItem[] = [
    {
      id: 'PO-2026-088',
      itemType: 'PURCHASE_ORDER',
      title: 'PO Semen Portland Type 1 (2.000 Sak) & Admixture Sika',
      projectCode: 'PRJ-2026-LRT',
      projectName: 'Pembangunan Stasiun LRT Dukuh Atas Hub',
      amount: 185000000,
      submittedBy: 'Arief Wicaksono (Procurement)',
      submittedAt: '2026-10-31T09:15:00Z',
      requiredRole: 'DIRECTOR',
      priority: 'HIGH',
      status: 'PENDING',
    },
    {
      id: 'DLR-2026-1031',
      itemType: 'SITE_REPORT',
      title: 'Verifikasi Laporan Harian Site Pengecoran Pier P4-P7 (86 Pekerja)',
      projectCode: 'PRJ-2026-LRT',
      projectName: 'Pembangunan Stasiun LRT Dukuh Atas Hub',
      submittedBy: 'Joko Prabowo (Site Supervisor)',
      submittedAt: '2026-10-31T11:45:00Z',
      requiredRole: 'PROJECT_MANAGER',
      priority: 'MEDIUM',
      status: 'PENDING',
    },
    {
      id: 'RAP-2026-V2',
      itemType: 'BUDGET_REVISION',
      title: 'Usulan Revisi RAP Tambah Kurang Struktur Pier P7 (+Rp 250 Jt)',
      projectCode: 'PRJ-2026-TOL',
      projectName: 'Jalan Tol Akses Pelabuhan Patimban Seksi 2',
      amount: 250000000,
      submittedBy: 'Ir. Hendra Gunawan (Project Manager)',
      submittedAt: '2026-10-30T16:20:00Z',
      requiredRole: 'FINANCE_MANAGER',
      priority: 'HIGH',
      status: 'PENDING',
    },
  ];

  async getPendingApprovals(roleName?: string) {
    if (!roleName || roleName === 'SUPERADMIN' || roleName === 'DIRECTOR') {
      return this.pendingStore;
    }

    return this.pendingStore.filter((item) => item.requiredRole === roleName);
  }

  async processApproval(dto: ApprovalActionDto, userId?: string, userRole?: string) {
    const itemIndex = this.pendingStore.findIndex((i) => i.id === dto.itemId);
    if (itemIndex === -1) {
      throw new BadRequestException(`Item persetujuan ${dto.itemId} tidak ditemukan atau sudah diproses`);
    }

    const item = this.pendingStore[itemIndex];

    // SoD Check: Verify role requirement
    if (userRole && userRole !== 'SUPERADMIN' && item.requiredRole !== userRole) {
      throw new ForbiddenException(
        `Segregation of Duties: Aksi ini membutuhkan wewenang ${item.requiredRole}, peran Anda adalah ${userRole}`,
      );
    }

    // Remove from queue
    const [processed] = this.pendingStore.splice(itemIndex, 1);

    // Record auditable record in database
    const org = await this.prisma.organization.findFirst();
    if (org) {
      await this.prisma.auditLog.create({
        data: {
          organizationId: org.id,
          actorId: userId || null,
          action: `WORKFLOW_${dto.action}`,
          resourceType: dto.itemType,
          resourceId: dto.itemId,
          payload: {
            title: processed.title,
            amount: processed.amount || 0,
            notes: dto.notes || 'Disetujui via BuildFlow Approval Portal',
            approvedByRole: userRole || 'DIRECTOR',
            timestamp: new Date().toISOString(),
          },
        },
      });
    }

    return {
      itemId: dto.itemId,
      itemType: dto.itemType,
      decision: dto.action,
      notes: dto.notes,
      processedAt: new Date().toISOString(),
      remainingQueueCount: this.pendingStore.length,
    };
  }
}

