const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('[BUILDFlow Phase 5 Seed] Seeding Construction Workforce, Mandor Crews & Timesheets...');

  const org = await prisma.organization.findFirst();
  if (!org) throw new Error('No organization found.');

  const lrtProject = await prisma.project.findFirst({
    where: { projectCode: 'PRJ-2026-LRT' },
  });
  if (!lrtProject) throw new Error('PRJ-2026-LRT not found.');

  // 1. Seed Departments
  const departments = [
    { code: 'DEP-ENG', name: 'Engineering & Perencanaan Teknis' },
    { code: 'DEP-OPS', name: 'Operasional Lapangan & Konstruksi' },
    { code: 'DEP-HSE', name: 'Health, Safety & Environment (K3)' },
  ];

  const depMap = {};
  for (const dep of departments) {
    let d = await prisma.department.findFirst({
      where: { organizationId: org.id, code: dep.code },
    });
    if (!d) {
      d = await prisma.department.create({
        data: {
          organizationId: org.id,
          code: dep.code,
          name: dep.name,
        },
      });
    }
    depMap[dep.code] = d.id;
  }
  console.log('[BUILDFlow Phase 5 Seed] 3 Departments ready.');

  // 2. Seed Employees and Mandor Crews
  const employeesData = [
    { code: 'EMP-001', name: 'Ir. Budi Santoso, M.T.', title: 'Project Manager Utama', dep: 'DEP-ENG' },
    { code: 'EMP-002', name: 'Hendra Wijaya, S.T.', title: 'Senior Site Engineer', dep: 'DEP-ENG' },
    { code: 'EMP-003', name: 'Agus Supriyadi', title: 'Mandor Utama Pembesian', dep: 'DEP-OPS' },
    { code: 'EMP-004', name: 'Joko Widodo', title: 'Mandor Bekisting & Perancah', dep: 'DEP-OPS' },
    { code: 'EMP-005', name: 'Dedi Suryana', title: 'Mandor Pengecoran Ready Mix', dep: 'DEP-OPS' },
    { code: 'EMP-006', name: 'Siti Rahmawati, S.T.', title: 'Lead HSE & Safety Officer (K3)', dep: 'DEP-HSE' },
    { code: 'EMP-007', name: 'Rian Pratama, S.T.', title: 'Quality Control Inspector', dep: 'DEP-ENG' },
    { code: 'EMP-008', name: 'Bambang Sutrisno', title: 'Tukang Las & Fabrikasi Baja', dep: 'DEP-OPS' },
  ];

  const empMap = {};
  for (const emp of employeesData) {
    const record = await prisma.employee.upsert({
      where: { employeeCode: emp.code },
      update: {
        fullName: emp.name,
        jobTitle: emp.title,
        departmentId: depMap[emp.dep],
        status: 'ACTIVE',
      },
      create: {
        employeeCode: emp.code,
        fullName: emp.name,
        jobTitle: emp.title,
        departmentId: depMap[emp.dep],
        status: 'ACTIVE',
      },
    });
    empMap[emp.code] = record.id;
  }
  console.log(`[BUILDFlow Phase 5 Seed] ${employeesData.length} Employees & Mandors seeded.`);

  // 3. Clear existing timesheet records for clean testing
  await prisma.timesheet.deleteMany({});

  // 4. Seed Daily Timesheets & Labor Attendance
  const baseDate = new Date('2026-10-31T08:00:00Z');
  const yesterday = new Date('2026-10-30T08:00:00Z');

  const timesheetEntries = [
    // Today
    { emp: 'EMP-001', date: baseDate, hours: 8.0, ot: 1.5, cat: 'MANAJEMEN', wage: 450000, notes: 'Monitoring progres mingguan WBS Pier Head' },
    { emp: 'EMP-002', date: baseDate, hours: 8.0, ot: 2.0, cat: 'ENGINEERING', wage: 300000, notes: 'Opname pembesian Pier 12' },
    { emp: 'EMP-003', date: baseDate, hours: 8.0, ot: 3.0, cat: 'PEMBESIAN', wage: 250000, notes: 'Pemasangan rebar D25 zona span 4' },
    { emp: 'EMP-004', date: baseDate, hours: 8.0, ot: 1.0, cat: 'BEKISTING', wage: 220000, notes: 'Pemasangan formwork pier head P-12' },
    { emp: 'EMP-005', date: baseDate, hours: 8.0, ot: 4.0, cat: 'PENGECORAN', wage: 250000, notes: 'Pengecoran malam ready mix K-350' },
    { emp: 'EMP-006', date: baseDate, hours: 8.0, ot: 0.0, cat: 'K3_SAFETY', wage: 280000, notes: 'Safety briefing & toolbox meeting pagi' },
    { emp: 'EMP-007', date: baseDate, hours: 8.0, ot: 1.0, cat: 'QC_INSPEKSI', wage: 270000, notes: 'Slump test & uji kubus beton' },
    { emp: 'EMP-008', date: baseDate, hours: 8.0, ot: 2.5, cat: 'FABRIKASI', wage: 240000, notes: 'Fabrikasi rebar cage spiral' },

    // Yesterday
    { emp: 'EMP-002', date: yesterday, hours: 8.0, ot: 1.0, cat: 'ENGINEERING', wage: 300000, notes: 'Survey elevasi pier' },
    { emp: 'EMP-003', date: yesterday, hours: 8.0, ot: 2.0, cat: 'PEMBESIAN', wage: 250000, notes: 'Perakitan tulangan pile cap' },
    { emp: 'EMP-004', date: yesterday, hours: 8.0, ot: 2.0, cat: 'BEKISTING', wage: 220000, notes: 'Bongkar bekisting kolom P-11' },
    { emp: 'EMP-005', date: yesterday, hours: 8.0, ot: 2.0, cat: 'PENGECORAN', wage: 250000, notes: 'Curing beton pier P-11' },
  ];

  for (const t of timesheetEntries) {
    await prisma.timesheet.create({
      data: {
        employeeId: empMap[t.emp],
        projectId: lrtProject.id,
        workDate: t.date,
        hoursWorked: t.hours,
        overtimeHours: t.ot,
        taskCategory: t.cat,
        status: 'APPROVED',
        dailyWage: t.wage,
        notes: t.notes,
      },
    });
  }

  console.log(`[BUILDFlow Phase 5 Seed] ${timesheetEntries.length} Timesheet records seeded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

