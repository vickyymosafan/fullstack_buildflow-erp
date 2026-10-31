const path = require('path');
const { PrismaClient } = require('@prisma/client');
let bcrypt;
try {
  bcrypt = require(path.resolve(__dirname, '../../apps/api/node_modules/bcryptjs'));
} catch (e) {
  bcrypt = require('bcryptjs');
}

const prisma = new PrismaClient();

async function main() {
  console.log('[BUILDFlow Seed] Starting database seeding...');

  // 1. Organization
  const org = await prisma.organization.upsert({
    where: { id: 'a0000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: 'a0000000-0000-0000-0000-000000000001',
      name: 'PT Maju Konstruksi Perkasa',
      legalName: 'PT Maju Konstruksi Perkasa Tbk',
      defaultCurrency: 'IDR',
      timezone: 'Asia/Jakarta',
      status: 'ACTIVE',
    },
  });
  console.log(`[BUILDFlow Seed] Organization: ${org.name}`);

  // 2. Branches
  const brJkt = await prisma.branch.upsert({
    where: {
      organizationId_code: {
        organizationId: org.id,
        code: 'BR-JKT-01',
      },
    },
    update: {},
    create: {
      id: 'b0000000-0000-0000-0000-000000000001',
      organizationId: org.id,
      code: 'BR-JKT-01',
      name: 'Kantor Pusat & Cabang Jakarta',
      address: 'Jl. TB Simatupang Kav. 88, Jakarta Selatan',
      status: 'ACTIVE',
    },
  });

  const brSby = await prisma.branch.upsert({
    where: {
      organizationId_code: {
        organizationId: org.id,
        code: 'BR-SBY-02',
      },
    },
    update: {},
    create: {
      id: 'b0000000-0000-0000-0000-000000000002',
      organizationId: org.id,
      code: 'BR-SBY-02',
      name: 'Cabang Operasional Surabaya',
      address: 'Jl. Mayjen Sungkono No. 45, Surabaya',
      status: 'ACTIVE',
    },
  });
  console.log('[BUILDFlow Seed] Branches registered');

  // 3. Roles
  const roles = [
    { name: 'SUPERADMIN', desc: 'Sistem Administrator Global' },
    { name: 'DIRECTOR', desc: 'Direksi Eksekutif & Approval Nilai Tinggi' },
    { name: 'PROJECT_MANAGER', desc: 'Pengendali Proyek, WBS, Schedule & Opname' },
    { name: 'FINANCE_MANAGER', desc: 'Pengendali Keuangan, Jurnal, AP/AR & Pajak' },
    { name: 'PROCUREMENT_MANAGER', desc: 'Pengadaan, Tender Vendor & Purchase Order' },
    { name: 'WAREHOUSE_STAFF', desc: 'Penerimaan Material, Stok Fisik & Pengeluaran' },
    { name: 'SITE_SUPERVISOR', desc: 'Laporan Harian Lapangan, Tenaga Kerja & Progres' },
  ];

  const roleMap = {};
  for (const r of roles) {
    const roleRecord = await prisma.role.upsert({
      where: {
        organizationId_name: {
          organizationId: org.id,
          name: r.name,
        },
      },
      update: {},
      create: {
        organizationId: org.id,
        name: r.name,
        description: r.desc,
      },
    });
    roleMap[r.name] = roleRecord.id;
  }
  console.log('[BUILDFlow Seed] Standard Construction Roles provisioned');

  // 4. Users (Default password: Password123!)
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const users = [
    { email: 'director@buildflow.id', name: 'Bambang Soedarmono (Direktur Utama)', role: 'DIRECTOR' },
    { email: 'pm@buildflow.id', name: 'Ir. Hendra Gunawan (Project Manager Senior)', role: 'PROJECT_MANAGER' },
    { email: 'finance@buildflow.id', name: 'Siti Rahmawati, SE (Finance Lead)', role: 'FINANCE_MANAGER' },
    { email: 'site@buildflow.id', name: 'Joko Prabowo (Site Supervisor)', role: 'SITE_SUPERVISOR' },
    { email: 'procurement@buildflow.id', name: 'Arief Wicaksono (Procurement Manager)', role: 'PROCUREMENT_MANAGER' },
    { email: 'warehouse@buildflow.id', name: 'Agus Santoso (Warehouse Officer)', role: 'WAREHOUSE_STAFF' },
  ];

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: {
        organizationId_email: {
          organizationId: org.id,
          email: u.email,
        },
      },
      update: { passwordHash },
      create: {
        organizationId: org.id,
        email: u.email,
        fullName: u.name,
        passwordHash,
        status: 'ACTIVE',
      },
    });

    const roleId = roleMap[u.role];
    if (roleId) {
      await prisma.userRole.deleteMany({
        where: { userId: user.id },
      });
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: roleId,
          branchId: brJkt.id,
        },
      });
    }
  }
  console.log(`[BUILDFlow Seed] ${users.length} Users created with password 'Password123!'`);

  // 5. Chart of Accounts (COA - Akuntansi Indonesia)
  const coaList = [
    { code: '1-1001', name: 'Kas Operasional Proyek', type: 'ASSET' },
    { code: '1-1002', name: 'Bank Mandiri Utama IDR', type: 'ASSET' },
    { code: '1-1200', name: 'Piutang Termin Kontrak (AR)', type: 'ASSET' },
    { code: '1-1300', name: 'Persediaan Bahan & Material Gudang', type: 'ASSET' },
    { code: '1-1400', name: 'Pekerjaan Dalam Pelaksanaan (WIP Proyek)', type: 'ASSET' },
    { code: '2-1100', name: 'Utang Usaha Supplier / Subkon (AP)', type: 'LIABILITY' },
    { code: '2-1200', name: 'Utang Retensi Proyek', type: 'LIABILITY' },
    { code: '4-1000', name: 'Pendapatan Kontrak Konstruksi', type: 'REVENUE' },
    { code: '5-1100', name: 'HPP - Biaya Material Lapangan', type: 'EXPENSE' },
    { code: '5-1200', name: 'HPP - Upah Tenaga Kerja Lapangan', type: 'EXPENSE' },
    { code: '5-1300', name: 'HPP - Sewa Alat Berat & Peralatan', type: 'EXPENSE' },
  ];

  for (const c of coaList) {
    await prisma.account.upsert({
      where: {
        organizationId_accountCode: {
          organizationId: org.id,
          accountCode: c.code,
        },
      },
      update: {},
      create: {
        organizationId: org.id,
        accountCode: c.code,
        accountName: c.name,
        accountType: c.type,
      },
    });
  }
  console.log('[BUILDFlow Seed] Standard Indonesian Construction COA registered');

  // 6. Sample Construction Projects
  const projects = [
    {
      code: 'PRJ-2026-LRT',
      name: 'Pembangunan Stasiun LRT Dukuh Atas Hub',
      contractValue: 45000000000,
      status: 'ACTIVE',
      plannedStart: new Date('2026-01-15'),
      plannedEnd: new Date('2026-11-30'),
    },
    {
      code: 'PRJ-2026-TOL',
      name: 'Jalan Tol Akses Pelabuhan Patimban Seksi 2',
      contractValue: 120000000000,
      status: 'ACTIVE',
      plannedStart: new Date('2026-02-01'),
      plannedEnd: new Date('2027-04-30'),
    },
    {
      code: 'PRJ-2025-HSP',
      name: 'Gedung RSUD Regional 8 Lantai',
      contractValue: 88000000000,
      status: 'COMPLETED',
      plannedStart: new Date('2025-03-01'),
      plannedEnd: new Date('2026-02-28'),
    },
  ];

  for (const p of projects) {
    await prisma.project.upsert({
      where: {
        organizationId_projectCode: {
          organizationId: org.id,
          projectCode: p.code,
        },
      },
      update: {
        contractValue: p.contractValue,
        status: p.status,
      },
      create: {
        organizationId: org.id,
        branchId: brJkt.id,
        projectCode: p.code,
        name: p.name,
        contractValue: p.contractValue,
        status: p.status,
        plannedStart: p.plannedStart,
        plannedEnd: p.plannedEnd,
      },
    });
  }
  console.log('[BUILDFlow Seed] Initial Construction Projects seeded');

  console.log('[BUILDFlow Seed] All seed records successfully inserted!');
}

main()
  .catch((e) => {
    console.error('[BUILDFlow Seed] Fatal Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
