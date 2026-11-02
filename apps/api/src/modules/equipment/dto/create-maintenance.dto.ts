import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMaintenanceDto {
  @ApiProperty({ description: 'ID master unit alat berat' })
  equipmentId: string;

  @ApiProperty({ description: 'Kode unik / nomor lambung alat berat', example: 'EQ-TC-01' })
  equipmentCode: string;

  @ApiProperty({
    description: 'Tipe pemeliharaan / servis',
    enum: [
      'PREVENTIVE_250_HM',
      'PREVENTIVE_500_HM',
      'PREVENTIVE_1000_HM',
      'CORRECTIVE_REPAIR',
      'OVERHAUL',
      'SAFETY_INSPECTION',
    ],
    example: 'PREVENTIVE_250_HM',
  })
  serviceType: string;

  @ApiProperty({ description: 'Target tanggal pemeliharaan (YYYY-MM-DD)', example: '2026-03-10' })
  scheduledDate: string;

  @ApiProperty({ description: 'Target Hour Meter servis (HM)', example: 2000.0 })
  scheduledHourMeter: number;

  @ApiPropertyOptional({ description: 'Tanggal realisasi servis selesai (YYYY-MM-DD)', example: '2026-03-10' })
  actualDate?: string;

  @ApiPropertyOptional({ description: 'Hour Meter saat servis selesai (HM)', example: 2004.5 })
  actualHourMeter?: number;

  @ApiProperty({ description: 'Nama teknisi internal atau vendor servis resmi', example: 'Tim Servis Liebherr Indonesia' })
  technicianVendor: string;

  @ApiProperty({ description: 'Estimasi atau total biaya pemeliharaan (Rp)', example: 8500000 })
  cost: number;

  @ApiPropertyOptional({
    description: 'Daftar spare part & pelumas yang diganti',
    type: [String],
    example: ['Filter Oli Hidrolik', 'Oli Mesin SAE 15W-40 30L', 'Grease EP-2'],
  })
  sparePartsReplaced?: string[];

  @ApiProperty({ description: 'Rincian pekerjaan & catatan servis', example: 'Ganti filter oli hidrolik, periksa sling utama, kalibrasi limit switch & load indicator' })
  notes: string;

  @ApiPropertyOptional({
    description: 'Status pemeliharaan',
    enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'],
    default: 'SCHEDULED',
    example: 'SCHEDULED',
  })
  status?: string;

  @ApiPropertyOptional({ description: 'Kode proyek aktif', example: 'PRJ-2026-001' })
  projectCode?: string;
}

