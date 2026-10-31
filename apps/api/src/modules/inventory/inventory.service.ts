import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getWarehouses() {
    return this.prisma.warehouse.findMany({
      include: { branch: true },
      orderBy: { warehouseCode: 'asc' },
    });
  }

  async getStockOnHand(warehouseCode?: string) {
    let warehouseId: string | undefined;
    if (warehouseCode) {
      const wh = await this.prisma.warehouse.findFirst({
        where: { warehouseCode },
      });
      if (wh) warehouseId = wh.id;
    }

    // Get all products
    const products = await this.prisma.product.findMany({
      orderBy: { productCode: 'asc' },
    });

    // Group sum movements per product
    const movements = await this.prisma.stockMovement.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      where: warehouseId ? { warehouseId } : undefined,
    });

    const stockMap: Record<string, number> = {};
    for (const m of movements) {
      stockMap[m.productId] = Number(m._sum.quantity || 0);
    }

    return products.map((p) => {
      const currentStock = stockMap[p.id] || 0;
      const minStock = Number(p.minStock);
      const isLowStock = currentStock <= minStock;

      return {
        id: p.id,
        productCode: p.productCode,
        name: p.name,
        category: p.category,
        unit: p.unit,
        minStock,
        currentStock,
        status: isLowStock ? 'LOW_STOCK' : 'AVAILABLE',
      };
    });
  }

  async getMovements(limit = 20) {
    const movements = await this.prisma.stockMovement.findMany({
      take: limit,
      include: {
        product: true,
        warehouse: true,
      },
      orderBy: { transactionDate: 'desc' },
    });

    return movements.map((m) => ({
      id: m.id,
      productCode: m.product.productCode,
      productName: m.product.name,
      warehouseCode: m.warehouse.warehouseCode,
      warehouseName: m.warehouse.name,
      movementType: m.movementType,
      quantity: Number(m.quantity),
      unitCost: Number(m.unitCost),
      referenceType: m.referenceType,
      referenceId: m.referenceId,
      createdById: m.createdById,
      transactionDate: m.transactionDate,
    }));
  }

  async createGoodsReceipt(dto: CreateGoodsReceiptDto) {
    const po = await this.prisma.purchaseOrder.findFirst({
      where: { poNumber: dto.poNumber },
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
      throw new NotFoundException(`Produk material ${dto.productCode} tidak ditemukan`);
    }

    // Check duplicate GR
    const existingGR = await this.prisma.goodsReceipt.findUnique({
      where: { receiptNumber: dto.receiptNumber },
    });
    if (existingGR) {
      throw new ConflictException(`Nomor Penerimaan Barang ${dto.receiptNumber} sudah terdaftar`);
    }

    // Atomic transaction: create GoodsReceipt AND write immutable StockMovement
    const result = await this.prisma.$transaction(async (tx) => {
      const gr = await tx.goodsReceipt.create({
        data: {
          purchaseOrderId: po.id,
          warehouseId: wh.id,
          receiptNumber: dto.receiptNumber,
          receivedAt: new Date(),
        },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId: product.id,
          warehouseId: wh.id,
          projectId: po.projectId,
          movementType: 'IN_PURCHASE',
          quantity: dto.quantity,
          unitCost: dto.unitCost,
          referenceType: 'GOODS_RECEIPT',
          referenceId: gr.receiptNumber,
          createdById: 'Warehouse Receiver (Auto-sync)',
        },
      });

      return { gr, movement };
    });

    return {
      receiptNumber: result.gr.receiptNumber,
      poNumber: po.poNumber,
      warehouseCode: wh.warehouseCode,
      productCode: product.productCode,
      quantityAdded: Number(result.movement.quantity),
      status: 'VERIFIED_IN_WAREHOUSE',
    };
  }
}

