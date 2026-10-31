const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('[BUILDFlow Phase 2 Seed] Seeding Budgets, Site Reports, and Approval items...');

  // 1. Get LRT Project
  const lrtProject = await prisma.project.findFirst({
    where: { projectCode: 'PRJ-2026-LRT' },
  });

  if (!lrtProject) {
    throw new Error('PRJ-2026-LRT not found. Run base seed first.');
  }

  // 2. Get Cost Categories
  const categories = await prisma.costCategory.findMany();
  const catMap = {};
  for (const c of categories) {
    catMap[c.code] = c.id;
  }

  // 3. Create or Update Approved Budget
  const budget = await prisma.budget.upsert({
    where: {
      projectId_version: {
        projectId: lrtProject.id,
        version: 1,
      },
    },
    update: {
      totalBudgetAmount: 39600000000,
      status: 'APPROVED',
      approvedAt: new Date('2026-01-20'),
      approvedBy: 'Bambang Soedarmono (Direktur)',
    },
    create: {
      projectId: lrtProject.id,
      version: 1,
      status: 'APPROVED',
      totalBudgetAmount: 39600000000,
      approvedAt: new Date('2026-01-20'),
      approvedBy: 'Bambang Soedarmono (Direktur)',
    },
  });

  // 4. Seed Budget Items
  const items = [
    {
      costCode: 'MAT-01',
      cat: 'MAT',
      desc: 'Ready Mix Concrete K-350 Slump 12±2 (Pondasi & Pile Cap)',
      qty: 2500,
      unit: 'm3',
      unitPrice: 1150000,
      total: 2875000000,
    },
    {
      costCode: 'MAT-02',
      cat: 'MAT',
      desc: 'Besi Beton Ulir BJTD-40 D16 & D25 SNI',
      qty: 450000,
      unit: 'kg',
      unitPrice: 14500,
      total: 6525000000,
    },
    {
      costCode: 'MAT-03',
      cat: 'MAT',
      desc: 'Baja Profil WF 400x200 & Plat Buhul Grade SM490',
      qty: 320000,
      unit: 'kg',
      unitPrice: 22000,
      total: 7040000000,
    },
    {
      costCode: 'LAB-01',
      cat: 'LAB',
      desc: 'Mandor & Tukang Pembesian Terampil',
      qty: 12000,
      unit: 'OH',
      unitPrice: 185000,
      total: 2220000000,
    },
    {
      costCode: 'LAB-02',
      cat: 'LAB',
      desc: 'Tukang Pengecoran & Finishing Permukaan Beton',
      qty: 8500,
      unit: 'OH',
      unitPrice: 175000,
      total: 1487500000,
    },
    {
      costCode: 'EQP-01',
      cat: 'EQP',
      desc: 'Sewa Tower Crane Potain Jib 50m (Mobilisasi, Erection, Operator)',
      qty: 10,
      unit: 'Bulan',
      unitPrice: 180000000,
      total: 1800000000,
    },
    {
      costCode: 'EQP-02',
      cat: 'EQP',
      desc: 'Sewa Concrete Pump Truck Long Boom 36m',
      qty: 120,
      unit: 'Hari',
      unitPrice: 8500000,
      total: 1020000000,
    },
    {
      costCode: 'SUB-01',
      cat: 'SUB',
      desc: 'Subkon Pondasi Bored Pile Dia 800mm kedalaman 32m',
      qty: 1,
      unit: 'Lot',
      unitPrice: 9800000000,
      total: 9800000000,
    },
    {
      costCode: 'SUB-02',
      cat: 'SUB',
      desc: 'Subkon Sistem Mekanikal Elektrikal Plumbing & Fire Protection',
      qty: 1,
      unit: 'Lot',
      unitPrice: 5200000000,
      total: 5200000000,
    },
    {
      costCode: 'OVH-01',
      cat: 'OVH',
      desc: 'Direksi Keet, Pengamanan K3 Lapangan, Sertifikasi Alat & Uji Lab',
      qty: 1,
      unit: 'Lot',
      unitPrice: 1632500000,
      total: 1632500000,
    },
  ];

  await prisma.budgetItem.deleteMany({
    where: { budgetId: budget.id },
  });

  for (const it of items) {
    const costCatId = catMap[it.cat] || categories[0].id;
    await prisma.budgetItem.create({
      data: {
        budgetId: budget.id,
        costCategoryId: costCatId,
        costCode: it.costCode,
        description: it.desc,
        quantity: it.qty,
        unit: it.unit,
        unitPrice: it.unitPrice,
        totalAmount: it.total,
      },
    });
  }
  console.log(`[BUILDFlow Phase 2 Seed] ${items.length} Budget items seeded into PRJ-2026-LRT`);

  // 5. Seed Daily Reports
  const reportDates = [
    {
      date: new Date('2026-10-29'),
      weather: 'CERAH',
      summary: 'Pengecoran tie beam grid A-4 s.d C-8 volume 120 m3 selesai pukul 16:30. Uji slump 12 cm, pembuatan 6 benda uji kubus beton.',
      workers: 84,
    },
    {
      date: new Date('2026-10-30'),
      weather: 'MENDUNG',
      summary: 'Pabrikasi pembesian kolom lantai 1 zona barat dan perakitan bekisting peri. Pengiriman 3 tronton baja profil WF 400 tiba di site.',
      workers: 79,
    },
    {
      date: new Date('2026-10-31'),
      weather: 'CERAH',
      summary: 'Erection kolom baja baja stasiun frame F1-F4 dengan Tower Crane. Pengelasan sambungan full penetration dan NDT test (Ultrasonic).',
      workers: 86,
    },
  ];

  for (const rep of reportDates) {
    await prisma.dailyReport.upsert({
      where: {
        projectId_reportDate: {
          projectId: lrtProject.id,
          reportDate: rep.date,
        },
      },
      update: {
        weather: rep.weather,
        workSummary: rep.summary,
        workerCount: rep.workers,
      },
      create: {
        projectId: lrtProject.id,
        reportDate: rep.date,
        weather: rep.weather,
        workSummary: rep.summary,
        workerCount: rep.workers,
      },
    });
  }
  console.log('[BUILDFlow Phase 2 Seed] 3 Daily Site reports seeded');

  console.log('[BUILDFlow Phase 2 Seed] Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('[BUILDFlow Phase 2 Seed] Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

