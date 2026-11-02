import { ApiProperty } from '@nestjs/swagger';

export class CreateOpnameDto {
  @ApiProperty({ example: 'SPK-2026-STR-01', description: 'ID atau Nomor SPK' })
  spkId!: string;

  @ApiProperty({ example: 'OPN-2026-03-STR', description: 'Nomor Berita Acara Opname' })
  opnameNumber!: string;

  @ApiProperty({ example: 'Maret 2026 (Minggu ke-3)', description: 'Periode opname' })
  period!: string;

  @ApiProperty({ example: 50.0, description: 'Progres kumulatif sebelumnya (%)' })
  previousProgress!: number;

  @ApiProperty({ example: 75.0, description: 'Progres kumulatif saat ini (%)' })
  currentProgress!: number;

  @ApiProperty({ example: 'Ir. Hendra Prasetyo (Konsultan MK)', description: 'Nama verifikator / konsultan pengawas' })
  verifiedBy!: string;

  @ApiProperty({ example: 'Besi plat dan bekisting terpasang sesuai RKS', description: 'Catatan hasil opname', required: false })
  notes?: string;

  @ApiProperty({ example: 'https://storage.buildflow.id/opname-photo-01.jpg', description: 'Bukti foto opname fisik', required: false })
  evidencePhotoUrl?: string;

  @ApiProperty({ example: 'PRJ-2026-IKN-PK3', description: 'Kode proyek', required: false })
  projectCode?: string;
}
