import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEquipmentStatusDto {
  @ApiProperty({
    description: 'Status operasional alat berat yang baru',
    enum: ['OPERATIONAL', 'MAINTENANCE', 'STANDBY', 'BREAKDOWN', 'DEMOBILIZED'],
    example: 'MAINTENANCE',
  })
  status: string;

  @ApiPropertyOptional({
    description: 'Catatan alasan perubahan status',
    example: 'Unit sedang menjalani penggantian oli & perbaikan hidrolik silinder',
  })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Update lokasi penempatan alat berat terkini',
    example: 'Workshop Utama Lapangan',
  })
  currentLocation?: string;

  @ApiPropertyOptional({
    description: 'Update Hour Meter terkini',
    example: 2150.0,
  })
  currentHourMeter?: number;
}
