import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChangeOrderDto {
  @ApiProperty({ description: 'Nomor resmi CCO / Variation Order', example: 'CCO-2026-001' })
  ccoNumber: string;

  @ApiProperty({
    description: 'Judul deskriptif perubahan pekerjaan kontrak',
    example: 'Perubahan Spesifikasi Fasad Curtain Wall & Penambahan Kanopi Drop-off',
  })
  title: string;

  @ApiProperty({
    description: 'Tipe perubahan kontrak',
    enum: [
      'SCOPE_ADDITION',
      'SCOPE_DEDUCTION',
      'DESIGN_REVISION',
      'MATERIAL_SUBSTITUTION',
      'SITE_CONDITION',
    ],
    example: 'SCOPE_ADDITION',
  })
  changeType: string;

  @ApiProperty({
    description: 'Pihak pengusul perubahan',
    enum: ['CONTRACTOR', 'CONSULTANT_MK', 'OWNER'],
    example: 'OWNER',
  })
  requestedBy: string;

  @ApiProperty({
    description: 'Nama instansi / PIC pengusul',
    example: 'Ir. Hendra Prasetyo (Konsultan MK)',
  })
  originatorName: string;

  @ApiProperty({
    description: 'Dasar teknis dan justifikasi pengajuan perubahan',
    example: 'Instruksi Owner untuk upgrading spesifikasi kaca low-e double glazing dan penambahan kanopi baja area drop-off',
  })
  reason: string;

  @ApiProperty({
    description: 'Estimasi dampak biaya (Rp, positif untuk tambah, negatif untuk kurang)',
    example: 485000000,
  })
  costImpact: number;

  @ApiProperty({
    description: 'Estimasi dampak waktu pelaksanaan (Extension of Time dalam hari kalender)',
    example: 14,
  })
  timeImpactDays: number;

  @ApiProperty({
    description: 'Lokasi zona pelaksanaan pekerjaan',
    example: 'Fasad Tower Utama & Area Lobby',
  })
  location: string;

  @ApiPropertyOptional({
    description: 'Kode elemen WBS terkait',
    example: 'ARS-FSD-01',
  })
  wbsElement?: string;

  @ApiPropertyOptional({
    description: 'Status awal tiket CCO',
    default: 'SUBMITTED',
    example: 'SUBMITTED',
  })
  status?: string;

  @ApiPropertyOptional({ description: 'Kode proyek aktif', example: 'PRJ-2026-001' })
  projectCode?: string;
}

