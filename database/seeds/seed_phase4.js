const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('[BUILDFlow Phase 4 Seed] Seeding Construction Chart of Accounts & General Ledger Journals...');

  const org = await prisma.organization.findFirst();
  if (!org) throw new Error('No organization found.');

  const lrtProject = await prisma.project.findFirst({
    where: { projectCode: 'PRJ-2026-LRT' },
  });
  if (!lrtProject) throw new Error('PRJ-2026-LRT not found.');

  // 1. Seed Construction Standard Chart of Accounts (COA)
  const coaData = [
    { code: '1-1100', name: 'Kas Operasional Lapangan Depo', type: 'ASSET' },
    { code: '1-1200', name: 'Bank Mandiri Escrow Proyek LRT', type: 'ASSET' },
    { code: '1-1300', name: 'Piutang Termin Proyek LRT', type: 'ASSET' },
    { code: '1-1350', name: 'Piutang Retensi 5% Proyek', type: 'ASSET' },
    { code: '1-1400', name: 'Persediaan Material Konstruksi Gudang & Site', type: 'ASSET' },
    { code: '2-1100', name: 'Utang Usaha Rekanan Vendor (AP)', type: 'LIABILITY' },
    { code: '2-1200', name: 'Utang Retensi Subkontraktor Lapangan', type: 'LIABILITY' },
    { code: '2-1300', name: 'Utang Pajak Konstruksi (PPh & PPN)', type: 'LIABILITY' },
    { code: '3-1100', name: 'Modal Disetor Ventura Proyek', type: 'EQUITY' },
    { code: '3-2100', name: 'Laba Ditahan Operasional Proyek', type: 'EQUITY' },
    { code: '4-1100', name: 'Pendapatan Termin Prestasi Proyek', type: 'REVENUE' },
    { code: '5-1100', name: 'Beban Pokok Konstruksi - Material Langsung', type: 'EXPENSE' },
    { code: '5-1200', name: 'Beban Pokok Konstruksi - Upah & Subkon', type: 'EXPENSE' },
    { code: '5-1300', name: 'Beban Pokok Konstruksi - Sewa Alat Berat', type: 'EXPENSE' },
  ];

  const accountMap = {};
  for (const acc of coaData) {
    const record = await prisma.account.upsert({
      where: {
        organizationId_accountCode: {
          organizationId: org.id,
          accountCode: acc.code,
        },
      },
      update: {
        accountName: acc.name,
        accountType: acc.type,
      },
      create: {
        organizationId: org.id,
        accountCode: acc.code,
        accountName: acc.name,
        accountType: acc.type,
      },
    });
    accountMap[acc.code] = record.id;
  }
  console.log(`[BUILDFlow Phase 4 Seed] ${coaData.length} Chart of Accounts seeded.`);

  // 2. Clear old demo journals if any
  const existingEntries = await prisma.journalEntry.findMany({
    where: { organizationId: org.id },
  });
  if (existingEntries.length > 0) {
    await prisma.journalEntry.deleteMany({
      where: { organizationId: org.id },
    });
    console.log('[BUILDFlow Phase 4 Seed] Cleared previous journal demo records.');
  }

  // 3. Seed Realistic Balanced Double-Entry Journals
  // Journal 1: Termin 1 Uang Muka Proyek LRT (Rp 2.500.000.000)
  const j1 = await prisma.journalEntry.create({
    data: {
      organizationId: org.id,
      journalNumber: 'JV-2026-01-001',
      transactionDate: new Date('2026-01-15T08:30:00Z'),
      description: 'Pencatatan Pembayaran Uang Muka Termin 1 Proyek LRT Jabodebek',
      postingStatus: 'POSTED',
      postedAt: new Date('2026-01-15T09:00:00Z'),
      postedBy: 'Finance Controller',
      lines: {
        create: [
          {
            accountId: accountMap['1-1200'],
            projectId: lrtProject.id,
            debit: 2500000000,
            credit: 0,
            memo: 'Penerimaan Termin 1 Uang Muka di Bank Mandiri Escrow',
          },
          {
            accountId: accountMap['4-1100'],
            projectId: lrtProject.id,
            debit: 0,
            credit: 2500000000,
            memo: 'Pengakuan Pendapatan Termin 1 Uang Muka Proyek',
          },
        ],
      },
    },
  });

  // Journal 2: Penerimaan Fisik Material Semen & Besi (Goods Receipt) -> Auto-Journal AP (Rp 185.000.000)
  const j2 = await prisma.journalEntry.create({
    data: {
      organizationId: org.id,
      journalNumber: 'JV-2026-01-042',
      transactionDate: new Date('2026-01-20T11:15:00Z'),
      description: 'Auto-Journal Penerimaan Material Semen Composite (GR-2026-088) ex PT Semen Indonesia',
      postingStatus: 'POSTED',
      postedAt: new Date('2026-01-20T11:30:00Z'),
      postedBy: 'Logistics Integration Bot',
      lines: {
        create: [
          {
            accountId: accountMap['1-1400'],
            projectId: lrtProject.id,
            debit: 185000000,
            credit: 0,
            memo: 'Persediaan semen portland dan besi beton masuk Gudang Depo',
          },
          {
            accountId: accountMap['2-1100'],
            projectId: lrtProject.id,
            debit: 0,
            credit: 185000000,
            memo: 'Utang Usaha PO-2026-088 kepada PT Semen Indonesia Tbk',
          },
        ],
      },
    },
  });

  // Journal 3: Pemakaian Material untuk Pengecoran Pier Head (Rp 95.000.000)
  const j3 = await prisma.journalEntry.create({
    data: {
      organizationId: org.id,
      journalNumber: 'JV-2026-01-077',
      transactionDate: new Date('2026-01-25T14:00:00Z'),
      description: 'Pembebanan Material Beton & Baja Ulir ke Biaya Langsung Konstruksi Pier Head P-12',
      postingStatus: 'POSTED',
      postedAt: new Date('2026-01-25T15:00:00Z'),
      postedBy: 'Project Accountant',
      lines: {
        create: [
          {
            accountId: accountMap['5-1100'],
            projectId: lrtProject.id,
            debit: 95000000,
            credit: 0,
            memo: 'Beban material pengecoran Pier Head P-12',
          },
          {
            accountId: accountMap['1-1400'],
            projectId: lrtProject.id,
            debit: 0,
            credit: 95000000,
            memo: 'Pengurangan persediaan material fisik terpakai',
          },
        ],
      },
    },
  });

  // Journal 4: Pembayaran Parsial Utang Usaha Rekanan (Rp 100.000.000)
  const j4 = await prisma.journalEntry.create({
    data: {
      organizationId: org.id,
      journalNumber: 'JV-2026-01-098',
      transactionDate: new Date('2026-01-28T16:20:00Z'),
      description: 'Pelunasan Bertahap Faktur Tagihan PT Semen Indonesia (PO-2026-088)',
      postingStatus: 'POSTED',
      postedAt: new Date('2026-01-28T17:00:00Z'),
      postedBy: 'Treasury Officer',
      lines: {
        create: [
          {
            accountId: accountMap['2-1100'],
            projectId: lrtProject.id,
            debit: 100000000,
            credit: 0,
            memo: 'Pengurangan Utang Usaha AP vendor PT Semen Indonesia',
          },
          {
            accountId: accountMap['1-1200'],
            projectId: lrtProject.id,
            debit: 0,
            credit: 100000000,
            memo: 'Transfer keluar rekening Bank Mandiri Escrow',
          },
        ],
      },
    },
  });

  console.log('[BUILDFlow Phase 4 Seed] 4 Balanced Double-Entry Journals seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

