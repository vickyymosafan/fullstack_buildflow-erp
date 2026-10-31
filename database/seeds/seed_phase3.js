const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('[BUILDFlow Phase 3 Seed] Seeding Vendors, Warehouses, Products, POs, Goods Receipts & Stock Movements...');

  const org = await prisma.organization.findFirst();
  if (!org) throw new Error('No organization found.');

  const lrtProject = await prisma.project.findFirst({
    where: { projectCode: 'PRJ-2026-LRT' },
  });
  if (!lrtProject) throw new Error('PRJ-2026-LRT not found.');

  const branch = await prisma.branch.findFirst({
    where: { organizationId: org.id },
  });
  if (!branch) throw new Error('No branch found.');

  // 1. Seed Vendors
  const vendors = [
    { code: 'VND-001', name: 'PT Semen Indonesia Tbk', taxId: '01.000.123.4-051.000', bankName: 'Mandiri', bankAccount: '122-00-1122334-5' },
    { code: 'VND-002', name: 'PT Krakatau Steel (Persero) Tbk', taxId: '01.000.456.7-052.000', bankName: 'BNI', bankAccount: '009-88-7766554-1' },
    { code: 'VND-003', name: 'PT United Tractors Tbk', taxId: '01.000.789.0-053.000', bankName: 'BCA', bankAccount: '883-09-12345-0' },
    { code: 'VND-004', name: 'PT SCG Readymix Indonesia', taxId: '01.000.321.9-054.000', bankName: 'BRI', bankAccount: '034-01-002934-50-8' },
  ];

  const vendorMap = {};
  for (const v of vendors) {
    const record = await prisma.vendor.upsert({
      where: { code: v.code },
      update: { name: v.name, taxId: v.taxId, bankName: v.bankName, bankAccount: v.bankAccount },
      create: {
        code: v.code,
        name: v.name,
        taxId: v.taxId,
        bankName: v.bankName,
        bankAccount: v.bankAccount,
        status: 'ACTIVE',
      },
    });
    vendorMap[v.code] = record.id;
  }
  console.log('[BUILDFlow Phase 3 Seed] 4 Vendors seeded');

  // 2. Seed Warehouses
  const warehouses = [
    { code: 'WH-JKT-01', name: 'Gudang Logistik Pusat Pulogadung' },
    { code: 'WH-SITE-LRT', name: 'Gudang Site Transit Stasiun LRT Dukuh Atas' },
  ];

  const whMap = {};
  for (const wh of warehouses) {
    const existing = await prisma.warehouse.findFirst({
      where: { warehouseCode: wh.code },
    });
    if (existing) {
      whMap[wh.code] = existing.id;
    } else {
      const created = await prisma.warehouse.create({
        data: {
          branchId: branch.id,
          warehouseCode: wh.code,
          name: wh.name,
        },
      });
      whMap[wh.code] = created.id;
    }
  }
  console.log('[BUILDFlow Phase 3 Seed] 2 Warehouses seeded');

  // 3. Seed Products
  const products = [
    { code: 'PRD-MAT-001', name: 'Semen Portland Composite Type 1 (Sak 50kg)', cat: 'MATERIAL', unit: 'Sak', min: 200 },
    { code: 'PRD-MAT-002', name: 'Besi Beton Ulir D25 BJTD-40 SNI (12m)', cat: 'MATERIAL', unit: 'Batang', min: 500 },
    { code: 'PRD-MAT-003', name: 'Baja Profil WF 400x200 Grade SM490 (12m)', cat: 'MATERIAL', unit: 'Batang', min: 10 },
    { code: 'PRD-MAT-004', name: 'Admixture Sika Viscocrete High Range (Drum 200L)', cat: 'CHEMICAL', unit: 'Drum', min: 5 },
    { code: 'PRD-MAT-005', name: 'Pipa Galvanis Medium 4 inch SNI (6m)', cat: 'MEP', unit: 'Batang', min: 50 },
  ];

  const prodMap = {};
  for (const p of products) {
    const record = await prisma.product.upsert({
      where: {
        organizationId_productCode: {
          organizationId: org.id,
          productCode: p.code,
        },
      },
      update: { name: p.name, category: p.cat, unit: p.unit, minStock: p.min },
      create: {
        organizationId: org.id,
        productCode: p.code,
        name: p.name,
        category: p.cat,
        unit: p.unit,
        minStock: p.min,
      },
    });
    prodMap[p.code] = record.id;
  }
  console.log('[BUILDFlow Phase 3 Seed] 5 Master Products seeded');

  // 4. Seed Purchase Orders
  const pos = [
    { poNum: 'PO-2026-088', vendorCode: 'VND-001', amount: 185000000, status: 'APPROVED' },
    { poNum: 'PO-2026-092', vendorCode: 'VND-002', amount: 840000000, status: 'APPROVED' },
    { poNum: 'PO-2026-095', vendorCode: 'VND-003', amount: 396000000, status: 'PENDING_APPROVAL' },
    { poNum: 'PO-2026-099', vendorCode: 'VND-004', amount: 560000000, status: 'DRAFT' },
  ];

  const poMap = {};
  for (const po of pos) {
    const existing = await prisma.purchaseOrder.findFirst({
      where: { poNumber: po.poNum },
    });
    if (existing) {
      poMap[po.poNum] = existing.id;
    } else {
      const created = await prisma.purchaseOrder.create({
        data: {
          organizationId: org.id,
          projectId: lrtProject.id,
          vendorId: vendorMap[po.vendorCode],
          poNumber: po.poNum,
          totalAmount: po.amount,
          status: po.status,
          approvedAt: po.status === 'APPROVED' ? new Date('2026-10-25') : null,
          approvedBy: po.status === 'APPROVED' ? 'Bambang Soedarmono (Direktur)' : null,
        },
      });
      poMap[po.poNum] = created.id;
    }
  }
  console.log('[BUILDFlow Phase 3 Seed] 4 Purchase Orders seeded');

  // 5. Seed Goods Receipts
  const grs = [
    { grNum: 'GR-2026-088-01', poNum: 'PO-2026-088', whCode: 'WH-SITE-LRT' },
    { grNum: 'GR-2026-092-01', poNum: 'PO-2026-092', whCode: 'WH-SITE-LRT' },
  ];

  for (const gr of grs) {
    const poId = poMap[gr.poNum];
    const whId = whMap[gr.whCode];
    if (poId && whId) {
      await prisma.goodsReceipt.upsert({
        where: { receiptNumber: gr.grNum },
        update: {},
        create: {
          purchaseOrderId: poId,
          warehouseId: whId,
          receiptNumber: gr.grNum,
          receivedAt: new Date('2026-10-28T09:30:00Z'),
        },
      });
    }
  }
  console.log('[BUILDFlow Phase 3 Seed] 2 Goods Receipts seeded');

  // 6. Seed Immutable Stock Movements
  const siteWhId = whMap['WH-SITE-LRT'];
  await prisma.stockMovement.deleteMany({
    where: { warehouseId: siteWhId },
  });

  const movements = [
    // Semen Portland: Masuk 2.500, Keluar 1.200 -> Sisa 1.300
    { prodCode: 'PRD-MAT-001', type: 'IN_PURCHASE', qty: 2500, cost: 74000, refType: 'GOODS_RECEIPT', refId: 'GR-2026-088-01' },
    { prodCode: 'PRD-MAT-001', type: 'OUT_PROJECT_ISSUE', qty: -1200, cost: 74000, refType: 'DAILY_REPORT', refId: 'DLR-2026-1029' },
    // Besi Beton D25: Masuk 3.000, Keluar 1.850 -> Sisa 1.150
    { prodCode: 'PRD-MAT-002', type: 'IN_PURCHASE', qty: 3000, cost: 280000, refType: 'GOODS_RECEIPT', refId: 'GR-2026-092-01' },
    { prodCode: 'PRD-MAT-002', type: 'OUT_PROJECT_ISSUE', qty: -1850, cost: 280000, refType: 'DAILY_REPORT', refId: 'DLR-2026-1030' },
    // Admixture Sika: Masuk 20, Keluar 18 -> Sisa 2 (Trigger alert: minStock 5!)
    { prodCode: 'PRD-MAT-004', type: 'IN_PURCHASE', qty: 20, cost: 4200000, refType: 'GOODS_RECEIPT', refId: 'GR-2026-088-01' },
    { prodCode: 'PRD-MAT-004', type: 'OUT_PROJECT_ISSUE', qty: -18, cost: 4200000, refType: 'DAILY_REPORT', refId: 'DLR-2026-1031' },
    // Pipa Galvanis: Masuk 80, Keluar 20 -> Sisa 60
    { prodCode: 'PRD-MAT-005', type: 'IN_PURCHASE', qty: 80, cost: 350000, refType: 'TRANSFER_IN', refId: 'TRF-JKT-001' },
    { prodCode: 'PRD-MAT-005', type: 'OUT_PROJECT_ISSUE', qty: -20, cost: 350000, refType: 'DAILY_REPORT', refId: 'DLR-2026-1031' },
  ];

  for (const m of movements) {
    await prisma.stockMovement.create({
      data: {
        productId: prodMap[m.prodCode],
        warehouseId: siteWhId,
        projectId: lrtProject.id,
        movementType: m.type,
        quantity: m.qty,
        unitCost: m.cost,
        referenceType: m.refType,
        referenceId: m.refId,
        createdById: 'Agus Santoso (Warehouse Officer)',
      },
    });
  }
  console.log('[BUILDFlow Phase 3 Seed] 8 Immutable Stock Movements seeded');

  console.log('[BUILDFlow Phase 3 Seed] Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('[BUILDFlow Phase 3 Seed] Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

