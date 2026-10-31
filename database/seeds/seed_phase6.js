const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Phase 6: Quality & Safety Inspections & NCRs...');

  const project = await prisma.project.findFirst({
    where: { projectCode: 'PRJ-2026-LRT' }
  });

  if (!project) {
    throw new Error('Project PRJ-2026-LRT not found!');
  }

  // Clear existing inspections for this project to ensure clean idempotent seed
  await prisma.inspection.deleteMany({
    where: { projectId: project.id }
  });

  const inspectionsData = [
    {
      projectId: project.id,
      title: 'Inspeksi Pembesian Pier Head P-12 (Rebar Spacing & Diameter)',
      category: 'QUALITY_QC',
      status: 'NCR_ISSUED',
      severity: 'HIGH',
      location: 'Zona Pier P-12 Jalur Layang',
      inspectorName: 'Bambang Kusuma, S.T. (QC Engineer)',
      score: 72.5,
      notes: 'Ditemukan deviasi jarak sengkang (stirrups) melebihi toleransi desain 15mm pada layer 2 sisi barat.',
      ncrNumber: 'NCR-2026-001',
      actionPlan: 'Penataan ulang ikatan kawat bendrat dan penambahan 4 rebar D25 sebelum izin pengecoran diterbitkan.',
      inspectedAt: new Date('2026-10-30T09:30:00Z')
    },
    {
      projectId: project.id,
      title: 'Uji Slump & Uji Kuat Tekan Benda Uji Beton ReadyMix K-400',
      category: 'QUALITY_QC',
      status: 'PASSED',
      severity: 'LOW',
      location: 'Batching Plant & Lokasi Pengecoran Pier P-11',
      inspectorName: 'Bambang Kusuma, S.T. (QC Engineer)',
      score: 98.0,
      notes: 'Nilai slump test 12 ± 2 cm memenuhi spesifikasi teknis RKS. 6 silinder benda uji siap uji tekan 7 & 28 hari.',
      ncrNumber: null,
      actionPlan: null,
      inspectedAt: new Date('2026-10-30T14:15:00Z')
    },
    {
      projectId: project.id,
      title: 'Inspeksi Rutin K3: Kepatuhan APD Wajib & Pemasangan Jaring Pengaman (Safety Net)',
      category: 'SAFETY_K3',
      status: 'PASSED',
      severity: 'LOW',
      location: 'Zona Elevasi Struktur Bentang Utama',
      inspectorName: 'Siti Rahmawati, S.K.M. (HSE Officer)',
      score: 100.0,
      notes: '100% pekerja lapangan mengenakan helm keselamatan, rompi reflektif, body harness double lanyard, dan safety boots.',
      ncrNumber: null,
      actionPlan: null,
      inspectedAt: new Date('2026-10-31T08:00:00Z')
    },
    {
      projectId: project.id,
      title: 'Audit K3: Verifikasi Sertifikasi Operator & Ground Stability Crane Gantry 100T',
      category: 'SAFETY_K3',
      status: 'PASSED',
      severity: 'LOW',
      location: 'Area Fabrikasi Box Girder',
      inspectorName: 'Siti Rahmawati, S.K.M. (HSE Officer)',
      score: 96.5,
      notes: 'Outrigger pad terpasang di atas plat baja 30mm, SIO & SILO operator berlaku hingga 2027.',
      ncrNumber: null,
      actionPlan: null,
      inspectedAt: new Date('2026-10-31T10:45:00Z')
    },
    {
      projectId: project.id,
      title: 'Inspeksi Kerapatan & Kelurusan Bekisting Girder Span 4 (Formwork Alignment)',
      category: 'QUALITY_QC',
      status: 'PASSED',
      severity: 'LOW',
      location: 'Span 4 Pier Head P-10',
      inspectorName: 'Bambang Kusuma, S.T. (QC Engineer)',
      score: 94.0,
      notes: 'Toleransi ketegakan bekisting baja dalam ambang batas ±3mm. Pelepasan formwork oil merata.',
      ncrNumber: null,
      actionPlan: null,
      inspectedAt: new Date('2026-10-31T13:20:00Z')
    },
    {
      projectId: project.id,
      title: 'Temuan Ceceran Oli Mesin Genset Cadangan Dekat Drainase Sementara',
      category: 'ENVIRONMENTAL',
      status: 'FAILED',
      severity: 'MEDIUM',
      location: 'Workshop Peralatan Barat',
      inspectorName: 'Siti Rahmawati, S.K.M. (HSE Officer)',
      score: 65.0,
      notes: 'Tetesan oli genset tidak tertampung oil drip tray sehingga berisiko mencemari saluran air sementara.',
      ncrNumber: 'NCR-2026-002',
      actionPlan: 'Pemasangan drip tray penampung oli sekunder dan pembersihan area dengan absorbent pad.',
      inspectedAt: new Date('2026-10-31T15:00:00Z')
    }
  ];

  for (const item of inspectionsData) {
    await prisma.inspection.create({ data: item });
  }

  console.log(`Seeded ${inspectionsData.length} Quality & Safety inspection records successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
