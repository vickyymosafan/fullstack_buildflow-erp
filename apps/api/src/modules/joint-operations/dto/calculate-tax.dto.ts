import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CalculateTaxDto {
  @ApiProperty({ description: 'Nilai tagihan bruto pekerjaan konstruksi (Rp)', example: 10000000000 })
  grossAmount: number;

  @ApiProperty({
    description: 'Kualifikasi penyedia jasa konstruksi berdasarkan PP No. 9 Tahun 2022',
    enum: ['KECIL', 'MENENGAH_BESAR', 'TIDAK_BERSERTIFIKAT', 'KONSULTASI_KONSTRUKSI', 'SPESIALIS'],
    example: 'MENENGAH_BESAR',
  })
  contractorQualification: string;

  @ApiPropertyOptional({
    description: 'Termasuk unsur sewa alat berat / jasa teknik PPh 23 (2%)',
    example: false,
  })
  includePph23?: boolean;

  @ApiPropertyOptional({ description: 'Nominal porsi sewa alat untuk perhitungan PPh 23 (Rp)', example: 0 })
  equipmentRentPortion?: number;

  @ApiPropertyOptional({ description: 'Tarif PPN berlaku (11 atau 12 persen)', example: 12 })
  ppnRatePercent?: number;

  @ApiPropertyOptional({ description: 'Nomor invoice acuan', example: 'INV-KSO-2026-0301' })
  invoiceNumber?: string;
}

