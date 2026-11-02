import { ApiProperty } from '@nestjs/swagger';

export class CreateMaterialTestDto {
  @ApiProperty({ example: 'PRJ-2026-IKN-PK3', description: 'Kode proyek konstruksi' })
  projectCode!: string;

  @ApiProperty({ example: 'CONCRETE', description: 'Tipe material (CONCRETE, REBAR_STEEL, SOIL_COMPACTION)' })
  materialType!: 'CONCRETE' | 'REBAR_STEEL' | 'SOIL_COMPACTION';

  @ApiProperty({ example: 'Uji Kuat Tekan Beton Silinder fc 35 MPa - Umur 28 Hari', description: 'Judul pengujian laboratorium' })
  title!: string;

  @ApiProperty({ example: 28, description: 'Umur benda uji dalam hari (3, 7, 14, 28)', required: false })
  sampleAgeDays?: number;

  @ApiProperty({ example: 35.0, description: 'Target kekuatan desain rencana (MPa)' })
  targetStrength!: number;

  @ApiProperty({ example: 37.8, description: 'Hasil uji aktual laboratorium (MPa)' })
  actualStrength!: number;

  @ApiProperty({ example: 12.0, description: 'Hasil slump test di lapangan (cm)', required: false })
  slumpValue?: number;

  @ApiProperty({ example: 'TM-08/SCM-20261102', description: 'Nomor batch / delivery order / heat number' })
  batchNumber!: string;

  @ApiProperty({ example: 'PT Semen Prima Beton ReadyMix', description: 'Nama pemasok / vendor beton/baja' })
  supplierName!: string;

  @ApiProperty({ example: 'Laboratorium Uji Bahan Teknik Sipil ITB', description: 'Nama laboratorium independen penguji' })
  labName!: string;

  @ApiProperty({ example: 'Benda uji memenuhi spesifikasi SNI 2847:2019 dengan margin kuat tekan +8.0%', description: 'Keterangan teknis mutu', required: false })
  notes?: string;
}

