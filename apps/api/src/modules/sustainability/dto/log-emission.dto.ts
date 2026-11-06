import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LogEmissionDto {
  @ApiProperty({ description: 'ID Proyek Konstruksi' })
  projectId: string;

  @ApiProperty({
    description: 'Klasifikasi Cakupan Emisi Gas Rumah Kaca',
    enum: ['SCOPE_1_DIRECT', 'SCOPE_2_INDIRECT', 'SCOPE_3_EMBODIED'],
  })
  scope: 'SCOPE_1_DIRECT' | 'SCOPE_2_INDIRECT' | 'SCOPE_3_EMBODIED';

  @ApiProperty({
    description: 'Kategori Sumber Emisi',
    enum: [
      'HEAVY_EQUIPMENT_FUEL',
      'GENERATOR_FUEL',
      'GRID_ELECTRICITY',
      'CONCRETE_MATERIAL',
      'STEEL_REBAR',
      'CEMENT_MATERIAL',
      'TRANSPORT_LOGISTICS',
    ],
  })
  sourceCategory:
    | 'HEAVY_EQUIPMENT_FUEL'
    | 'GENERATOR_FUEL'
    | 'GRID_ELECTRICITY'
    | 'CONCRETE_MATERIAL'
    | 'STEEL_REBAR'
    | 'CEMENT_MATERIAL'
    | 'TRANSPORT_LOGISTICS';

  @ApiProperty({ description: 'Kuantitas Aktivitas (e.g. Liter BBM, kWh listrik, m3 beton, ton baja)' })
  activityQuantity: number;

  @ApiProperty({ description: 'Satuan Aktivitas', enum: ['LITER', 'KWH', 'M3', 'TON', 'SAK'] })
  activityUnit: 'LITER' | 'KWH' | 'M3' | 'TON' | 'SAK';

  @ApiPropertyOptional({ description: 'Faktor emisi kustom (kg CO2e per satuan)' })
  customEmissionFactor?: number;

  @ApiProperty({ description: 'Tanggal Aktivitas Pencatatan (ISO String)' })
  recordedDate: string;

  @ApiPropertyOptional({ description: 'Catatan operasional lapangan atau nomor delivery order' })
  notes?: string;
}

