import { ApiProperty } from '@nestjs/swagger';

export class CreateHseInspectionDto {
  @ApiProperty({ example: 'PRJ-2026-IKN-PK3', description: 'Kode proyek konstruksi', required: false })
  projectCode?: string;

  @ApiProperty({ example: 'Inspeksi Kepatuhan APD Wajib & Housekeeping 5R Shift Pagi', description: 'Judul audit / observasi' })
  title!: string;

  @ApiProperty({ example: 'APD_COMPLIANCE', description: 'Tipe: APD_COMPLIANCE, UNSAFE_ACT, UNSAFE_CONDITION, HOUSEKEEPING_5R' })
  inspectionType!: string;

  @ApiProperty({ example: 'MEDIUM', description: 'Tingkat bahaya / risiko: LOW, MEDIUM, HIGH, CRITICAL' })
  severity!: string;

  @ApiProperty({ example: 'Tower A Lantai 12 Area Void Tangga', description: 'Lokasi inspeksi' })
  location!: string;

  @ApiProperty({ example: 'Tri Handoko (HSE Inspector)', description: 'Nama auditor / pengawas K3' })
  inspectorName!: string;

  @ApiProperty({ example: 95.0, description: 'Skor kepatuhan (0 - 100%)' })
  score!: number;

  @ApiProperty({ example: true, description: 'Kepatuhan Helm Safety' })
  helmetCompliant!: boolean;

  @ApiProperty({ example: true, description: 'Kepatuhan Rompi Reflektif' })
  vestCompliant!: boolean;

  @ApiProperty({ example: true, description: 'Kepatuhan Sepatu Safety' })
  bootsCompliant!: boolean;

  @ApiProperty({ example: false, description: 'Kepatuhan Body Harness (bila di ketinggian > 1.8m)' })
  harnessCompliant!: boolean;

  @ApiProperty({ example: 'Ditemukan 1 tukang bekisting tidak mengaitkan hook harness ke sling lifeline saat bekerja di tepi plat lantai.', description: 'Temuan detail Unsafe Act / Condition' })
  observations!: string;

  @ApiProperty({ example: 'Pekerjaan dihentikan seketika (Stop Work Authority), briefing 5 menit di tempat, dan hook diikatkan ke angkur permanen.', description: 'Tindakan koreksi langsung' })
  actionPlan!: string;
}

