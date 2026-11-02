import { ApiProperty } from '@nestjs/swagger';

export class CreateIncidentDto {
  @ApiProperty({ example: 'PRJ-2026-IKN-PK3', description: 'Kode proyek konstruksi', required: false })
  projectCode?: string;

  @ApiProperty({ example: 'Pekerja terpeleset di area tangga perancah basah', description: 'Judul laporan insiden / near-miss' })
  title!: string;

  @ApiProperty({ example: 'NEAR_MISS', description: 'Tipe: FIRST_AID, MEDICAL_TREATMENT, LOST_TIME_INJURY, NEAR_MISS, PROPERTY_DAMAGE, ENVIRONMENTAL_SPILL' })
  incidentType!: string;

  @ApiProperty({ example: 'MEDIUM', description: 'Tingkat keparahan: LOW, MEDIUM, HIGH, CRITICAL' })
  severity!: string;

  @ApiProperty({ example: 'Tower B Lantai 6 Tangga Akses 2', description: 'Lokasi spesifik kejadian' })
  location!: string;

  @ApiProperty({ example: 'Budi Santoso (Safety Officer)', description: 'Nama pelapor K3' })
  reporterName!: string;

  @ApiProperty({ example: 'Joko Prabowo', description: 'Nama pekerja terdampak / saksi', required: false })
  affectedPerson?: string;

  @ApiProperty({ example: 'Pekerja membawa material pipa dan terpeleset karena tumpahan air hujan tanpa grip karet pada pijakan bordes.', description: 'Kronologi detail insiden' })
  description!: string;

  @ApiProperty({ example: 'Pijakan tangga licin dan pencahayaan minim saat shift malam.', description: 'Analisis akar penyebab (Root Cause)', required: false })
  rootCause?: string;

  @ApiProperty({ example: 'Pemasangan anti-slip tape dan lampu sorot LED 100W portabel di area tangga.', description: 'Tindakan perbaikan (Corrective Action)' })
  correctiveAction!: string;

  @ApiProperty({ example: 0, description: 'Hari kerja hilang (Lost Workdays) untuk kalkulasi Severity Rate', required: false })
  daysLost?: number;
}

