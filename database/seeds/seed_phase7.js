const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Phase 7: Document & Engineering Drawing Management (DMS)...');

  const project = await prisma.project.findFirst({
    where: { projectCode: 'PRJ-2026-LRT' }
  });

  if (!project) {
    throw new Error('Project PRJ-2026-LRT not found!');
  }

  // Clear existing documents for this project to ensure clean idempotent seed
  await prisma.document.deleteMany({
    where: { projectId: project.id }
  });

  const documentsData = [
    {
      projectId: project.id,
      documentNumber: 'DWG-2026-LRT-01',
      category: 'DRAWING',
      title: 'Shop Drawing Struktur Pier Head & Girder Span 30M (P-10 s/d P-12)',
      description: 'Revisi elevasi bearing pad elastomeric dan detail penulangan sengkang gempa sesuai SNI 2833:2016.',
      fileUrl: '/storage/drawings/DWG-2026-LRT-01-rev3.dwg',
      fileType: 'DWG',
      fileSize: '34.8 MB',
      version: 3,
      uploadedBy: 'Ir. Hendra Saputra (Chief Drafter)',
      status: 'APPROVED'
    },
    {
      projectId: project.id,
      documentNumber: 'DWG-2026-LRT-02',
      category: 'DRAWING',
      title: 'Model BIM 3D Stasiun Dukuh Atas (LOD 400 - Arsitektur & MEP)',
      description: 'Clash detection integrasi ducting HVAC dengan kabel tray persinyalan LRT rute peron 2.',
      fileUrl: '/storage/drawings/BIM-STASION-DUKUHATAS-LOD400.ifc',
      fileType: 'BIM',
      fileSize: '128.5 MB',
      version: 2,
      uploadedBy: 'Dimas Wicaksono (BIM Lead)',
      status: 'UNDER_REVIEW'
    },
    {
      projectId: project.id,
      documentNumber: 'CTR-2026-EPC-001',
      category: 'CONTRACT',
      title: 'Kontrak Induk EPC Konstruksi Jalur Layang LRT Cawang - Dukuh Atas',
      description: 'Perjanjian pemborongan FIDIC Silver Book mencakup klausul jaminan pelaksanaan dan retensi 5%.',
      fileUrl: '/storage/contracts/CTR-2026-EPC-001-Signed.pdf',
      fileType: 'PDF',
      fileSize: '18.2 MB',
      version: 1,
      uploadedBy: 'Tim Legal & Kontrak',
      status: 'APPROVED'
    },
    {
      projectId: project.id,
      documentNumber: 'CTR-2026-ADD-002',
      category: 'CONTRACT',
      title: 'Addendum 02: Penyesuaian Right of Way (ROW) & Interchange Rasuna Said',
      description: 'Klausul perubahan batasan lahan serta penyesuaian timeline milestone integrasi koridor transjakarta.',
      fileUrl: '/storage/contracts/CTR-2026-ADD-002.pdf',
      fileType: 'PDF',
      fileSize: '4.6 MB',
      version: 2,
      uploadedBy: 'Tim Legal & Kontrak',
      status: 'APPROVED'
    },
    {
      projectId: project.id,
      documentNumber: 'PMT-2026-PBG-01',
      category: 'PERMIT',
      title: 'Persetujuan Bangunan Gedung (PBG) & Sertifikat Laik Fungsi (SLF) Stasiun',
      description: 'Surat Keputusan Dinas Cipta Karya, Tata Ruang dan Pertanahan Pemprov DKI No. 472/PBG/2026.',
      fileUrl: '/storage/permits/PMT-2026-PBG-DKI-472.pdf',
      fileType: 'PDF',
      fileSize: '8.7 MB',
      version: 1,
      uploadedBy: 'External Relations & Permit Officer',
      status: 'APPROVED'
    },
    {
      projectId: project.id,
      documentNumber: 'PMT-2026-AMDAL-04',
      category: 'PERMIT',
      title: 'Dokumen Kelayakan Lingkungan Hidup (AMDAL & RKL-RPL) Koridor Jalur',
      description: 'Rekomendasi teknis mitigasi kebisingan, getaran, serta manajemen limpasan air hujan trase layang.',
      fileUrl: '/storage/permits/PMT-2026-AMDAL-FINAL.pdf',
      fileType: 'PDF',
      fileSize: '22.4 MB',
      version: 1,
      uploadedBy: 'HSE & Environmental Division',
      status: 'APPROVED'
    },
    {
      projectId: project.id,
      documentNumber: 'SPC-2026-RKS-STR',
      category: 'SPECIFICATION',
      title: 'Rencana Kerja & Syarat (RKS) Struktur Beton ReadyMix fc\' 45 MPa',
      description: 'Standar mutu agregat, penggunaan admixture retarder, dan SOP curing beton masif pier head.',
      fileUrl: '/storage/specs/SPC-2026-RKS-BETON-FC45.pdf',
      fileType: 'PDF',
      fileSize: '12.1 MB',
      version: 2,
      uploadedBy: 'Ir. Hendra Saputra (Chief Drafter)',
      status: 'APPROVED'
    },
    {
      projectId: project.id,
      documentNumber: 'SPC-2026-RKS-MEP',
      category: 'SPECIFICATION',
      title: 'Spesifikasi Teknis Sistem Proteksi Kebakaran & SCADA Stasiun LRT',
      description: 'Persyaratan teknis sprinkler otomatis, clean agent fire suppression FM-200, dan integrasi OCC.',
      fileUrl: '/storage/specs/SPC-2026-RKS-MEP-FIRE-SCADA.pdf',
      fileType: 'PDF',
      fileSize: '15.3 MB',
      version: 1,
      uploadedBy: 'Fajar Nugraha, S.T. (MEP Lead)',
      status: 'UNDER_REVIEW'
    }
  ];

  for (const doc of documentsData) {
    await prisma.document.create({
      data: doc
    });
  }

  console.log(`Successfully seeded ${documentsData.length} Phase 7 engineering documents!`);
}

main()
  .catch((e) => {
    console.error('Error seeding Phase 7:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

