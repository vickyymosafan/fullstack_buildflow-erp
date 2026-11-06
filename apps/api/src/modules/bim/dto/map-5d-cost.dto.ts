import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Map5dCostDto {
  @ApiProperty({ example: 'ELE-BP-001', description: 'ID Elemen 3D BIM' })
  elementId: string;

  @ApiProperty({ example: 'BOQ-STR-014', description: 'Item Kode BOQ / RAP' })
  boqItemCode: string;

  @ApiProperty({ example: 'Beton Ready Mix K-400 Pengecoran Tiang Pancang Bored Pile', description: 'Deskripsi Item BOQ' })
  boqDescription: string;

  @ApiProperty({ example: 48.5, description: 'Volume Desain Model (m3 / ton / m2)' })
  designQuantity: number;

  @ApiProperty({ example: 'm3', description: 'Satuan Pengukuran (UoM)' })
  uom: string;

  @ApiProperty({ example: 1850000, description: 'Harga Satuan RAP (IDR)' })
  unitRate: number;

  @ApiPropertyOptional({ example: 51.2, description: 'Volume Realisasi Terpasang (m3 / ton / m2)' })
  actualQuantity?: number;

  @ApiPropertyOptional({ example: 1890000, description: 'Harga Satuan Realisasi (IDR)' })
  actualUnitRate?: number;
}

