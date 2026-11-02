import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEquipmentLogDto {
  @ApiProperty({ description: 'ID master unit alat berat' })
  equipmentId: string;

  @ApiProperty({ description: 'Kode unik / nomor lambung alat berat', example: 'EQ-TC-01' })
  equipmentCode: string;

  @ApiProperty({ description: 'Tanggal operasional harian (YYYY-MM-DD)', example: '2026-03-01' })
  date: string;

  @ApiProperty({ description: 'Shift kerja', enum: ['Pagi', 'Siang', 'Malam'], example: 'Pagi' })
  shift: string;

  @ApiProperty({ description: 'Hour meter awal shift', example: 1850.5 })
  startHourMeter: number;

  @ApiProperty({ description: 'Hour meter akhir shift', example: 1858.5 })
  endHourMeter: number;

  @ApiProperty({ description: 'Total jam kerja operasional aktif (jam)', example: 7.0 })
  operatingHours: number;

  @ApiPropertyOptional({ description: 'Jam standby / idle (jam)', default: 1.0, example: 1.0 })
  idleHours?: number;

  @ApiPropertyOptional({ description: 'Penambahan bahan bakar solar (Liter)', default: 0, example: 120 })
  fuelAddedLiters?: number;

  @ApiProperty({ description: 'Nama operator yang bertugas', example: 'Hariyanto, S.T.' })
  operatorName: string;

  @ApiProperty({ description: 'Deskripsi pekerjaan yang dilaksanakan', example: 'Pengecoran plat lantai 8 dan pengangkatan tulangan kolom zona A' })
  workDescription: string;

  @ApiProperty({ description: 'Lokasi kerja alat', example: 'Tower A Lantai 8' })
  location: string;

  @ApiPropertyOptional({ description: 'Kode proyek aktif', example: 'PRJ-2026-001' })
  projectCode?: string;
}
