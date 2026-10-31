import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-po.dto';

@Injectable()
export class ProcurementService {
  constructor(private prisma: PrismaService) {}

  async getVendors() {
    const vendors = await this.prisma.vendor.findMany({
      orderBy: { name: 'asc' },
    });
    return vendors;
  }

  async getPurchaseOrders(projectId?: string) {
    const where: any = {};
    if (projectId) {
      const project = await this.prisma.project.findFirst({
        where: { OR: [{ id: projectId }, { projectCode: projectId }] },
      });
      if (project) {
        where.projectId = project.id;
      }
    }

    const pos = await this.prisma.purchaseOrder.findMany({
      where,
      include: {
        vendor: true,
        project: true,
        goodsReceipts: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return pos.map((po) => ({
      id: po.id,
      poNumber: po.poNumber,
      projectCode: po.project.projectCode,
      projectName: po.project.name,
      vendorCode: po.vendor.code,
      vendorName: po.vendor.name,
      totalAmount: Number(po.totalAmount),
      status: po.status,
      goodsReceiptCount: po.goodsReceipts.length,
      approvedAt: po.approvedAt,
      approvedBy: po.approvedBy,
      createdAt: po.createdAt,
    }));
  }

  async createPurchaseOrder(dto: CreatePurchaseOrderDto) {
    const project = await this.prisma.project.findFirst({
      where: { OR: [{ id: dto.projectCode }, { projectCode: dto.projectCode }] },
    });
    if (!project) {
      throw new NotFoundException(`Proyek ${dto.projectCode} tidak ditemukan`);
    }

    const vendor = await this.prisma.vendor.findFirst({
      where: { OR: [{ id: dto.vendorCode }, { code: dto.vendorCode }] },
    });
    if (!vendor) {
      throw new NotFoundException(`Vendor ${dto.vendorCode} tidak ditemukan`);
    }

    const existingPO = await this.prisma.purchaseOrder.findFirst({
      where: { poNumber: dto.poNumber },
    });
    if (existingPO) {
      throw new ConflictException(`Nomor PO ${dto.poNumber} sudah terdaftar`);
    }

    const po = await this.prisma.purchaseOrder.create({
      data: {
        organizationId: project.organizationId,
        projectId: project.id,
        vendorId: vendor.id,
        poNumber: dto.poNumber,
        totalAmount: dto.totalAmount,
        status: 'PENDING_APPROVAL',
      },
      include: {
        vendor: true,
        project: true,
      },
    });

    return {
      id: po.id,
      poNumber: po.poNumber,
      projectCode: po.project.projectCode,
      vendorName: po.vendor.name,
      totalAmount: Number(po.totalAmount),
      status: po.status,
    };
  }
}

