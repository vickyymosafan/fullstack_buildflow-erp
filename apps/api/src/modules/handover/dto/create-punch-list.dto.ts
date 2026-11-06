import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePunchListDto {
  @ApiProperty({ description: 'ID Sertifikat BAST PHO Terkait', example: 'bast-01' })
  certificateId: string;

  @ApiProperty({ description: 'Deskripsi Cacat Mutu / Kerusakan', example: 'Rembesan waterproofing minor pada sambungan talang beton sayap barat' })
  title: string;

  @ApiProperty({
    description: 'Kategori Pekerjaan',
    enum: ['ARCHITECTURAL', 'STRUCTURAL', 'MEP', 'FACADE', 'CIVIL_INFRA'],
    example: 'CIVIL_INFRA',
  })
  category: string;

  @ApiProperty({
    description: 'Tingkat Urgensi / Keparahan Cacat',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    example: 'MEDIUM',
  })
  severity: string;

  @ApiProperty({ description: 'Lokasi Spesifik Titik Cacat', example: 'Lantai Atap Blok C As 14-16' })
  location: string;

  @ApiProperty({ description: 'Nama Subkontraktor / Mandor Penanggung Jawab', example: 'PT Tirta Waterproofing Mandiri' })
  assignedSubcon: string;

  @ApiProperty({ description: 'Batas Waktu Perbaikan SLA (YYYY-MM-DD)', example: '2026-04-15' })
  deadline: string;

  @ApiPropertyOptional({ description: 'URL Foto Bukti Cacat Awal', example: 'https://storage.buildflow.id/proofs/punch-roof-leak-01.jpg' })
  beforePhotoUrl?: string;

  @ApiPropertyOptional({ description: 'Catatan Teknis Metode Perbaikan', example: 'Injeksi polyurethane dan pelapisan ulang bituminous membrane 2 layer' })
  repairMethod?: string;
}
