import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEquipmentDto {
  @ApiProperty({ description: 'Nomor lambung / kode unik alat berat', example: 'EQ-TC-01' })
  equipmentCode: string;

  @ApiProperty({ description: 'Nama unit alat berat', example: 'Tower Crane Liebherr 550 EC-H' })
  name: string;

  @ApiProperty({ description: 'Kategori alat berat', example: 'LIFTING_CRANE' })
  category: string;

  @ApiProperty({ description: 'Merk dan Model', example: 'Liebherr 550 EC-H 20 Litronic' })
  brandModel: string;

  @ApiPropertyOptional({ description: 'Nomor seri mesin / chasis', example: 'SN-TC-889102' })
  serialNumber?: string;

  @ApiPropertyOptional({ description: 'Tahun pembuatan unit', example: 2022 })
  year?: number;

  @ApiProperty({ description: 'Status kepemilikan', enum: ['INTERNAL', 'RENTAL'], example: 'INTERNAL' })
  ownership: string;

  @ApiPropertyOptional({ description: 'Nama vendor bila unit sewa', example: 'PT Berlian Crane Indonesia' })
  vendorName?: string;

  @ApiPropertyOptional({ description: 'Tarif sewa per jam (Rp/jam)', example: 450000 })
  hourlyRentalRate?: number;

  @ApiProperty({ description: 'Nama operator pemegang alat', example: 'Hariyanto, S.T.' })
  operatorName: string;

  @ApiProperty({ description: 'Nomor lisensi operator K3 (SIO)', example: 'SIO-01.5542-DEPNAKER/2024' })
  sioNumber: string;

  @ApiProperty({ description: 'Nomor sertifikat surat ijin layak operasi (SILO)', example: 'SILO-TC-09912-DISNAKER/2025' })
  siloNumber: string;

  @ApiProperty({ description: 'Tanggal masa berlaku SILO (YYYY-MM-DD)', example: '2027-02-15' })
  siloExpiryDate: string;

  @ApiProperty({ description: 'Hour Meter awal saat deployment (HM)', example: 1850.5 })
  initialHourMeter: number;

  @ApiProperty({ description: 'Lokasi penempatan di area proyek', example: 'Tower Utama Zona A' })
  location: string;

  @ApiPropertyOptional({ description: 'Status operasional alat', default: 'OPERATIONAL', example: 'OPERATIONAL' })
  status?: string;

  @ApiPropertyOptional({ description: 'Kode proyek aktif', example: 'PRJ-2026-001' })
  projectCode?: string;
}
