import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LogWasteDto {
  @ApiProperty({ description: 'ID Proyek Konstruksi' })
  projectId: string;

  @ApiProperty({
    description: 'Jenis Limbah Konstruksi & Pembongkaran (CDW)',
    enum: [
      'CONCRETE_RUBBLE',
      'SCRAP_METAL',
      'TIMBER_OFFCUT',
      'PACKAGING_PLASTIC',
      'SOIL_SPOIL',
      'HAZARDOUS_B3',
    ],
  })
  wasteType:
    | 'CONCRETE_RUBBLE'
    | 'SCRAP_METAL'
    | 'TIMBER_OFFCUT'
    | 'PACKAGING_PLASTIC'
    | 'SOIL_SPOIL'
    | 'HAZARDOUS_B3';

  @ApiProperty({ description: 'Volume/Berat Limbah (Ton)' })
  quantityTons: number;

  @ApiProperty({
    description: 'Metode Penanganan Limbah',
    enum: [
      'RECYCLED_ONSITE',
      'OFFSITE_RECYCLING_PARTNER',
      'SALVAGED_REUSE',
      'LICENSED_B3_DISPOSAL',
      'LANDFILL',
    ],
  })
  handlingMethod:
    | 'RECYCLED_ONSITE'
    | 'OFFSITE_RECYCLING_PARTNER'
    | 'SALVAGED_REUSE'
    | 'LICENSED_B3_DISPOSAL'
    | 'LANDFILL';

  @ApiPropertyOptional({ description: 'Nomor Surat Jalan / Manifes Limbah KLHK' })
  manifestNumber?: string;

  @ApiPropertyOptional({ description: 'Nama Vendor Pengolah / Transporter Berizin' })
  disposalPartner?: string;

  @ApiProperty({ description: 'Tanggal Penimbangan / Pengangkutan (ISO String)' })
  recordedDate: string;

  @ApiPropertyOptional({ description: 'Catatan lokasi pemilahan di site atau penampungan sementara' })
  notes?: string;
}

