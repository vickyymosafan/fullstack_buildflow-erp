import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConsortiumDto {
  @ApiProperty({ description: 'Kode registrasi KSO konsorsium', example: 'KSO-IKN-PK3-2026' })
  ksoCode: string;

  @ApiProperty({ description: 'Nama resmi konsorsium kemitraan', example: 'KSO Adhi - Wijaya - Pembangunan Perumahan' })
  consortiumName: string;

  @ApiProperty({ description: 'Nama perusahaan kontraktor utama (Lead)', example: 'PT Adhi Megah Konstruksi (Persero) Tbk' })
  leadContractor: string;

  @ApiProperty({ description: 'Porsi ekuitas dan tanggung jawab kontraktor utama (%)', example: 60 })
  leadSharePercent: number;

  @ApiProperty({ description: 'Nama perwakilan resmi penandatangan pihak kontraktor utama', example: 'Ir. Agus Wijaya, M.T. (Project Manager)' })
  leadSignatory: string;

  @ApiProperty({ description: 'Nama perusahaan kontraktor mitra anggota', example: 'PT Wijaya Mandiri Kontraktor' })
  partnerContractor: string;

  @ApiProperty({ description: 'Porsi ekuitas dan tanggung jawab kontraktor mitra (%)', example: 40 })
  partnerSharePercent: number;

  @ApiProperty({ description: 'Nama perwakilan resmi penandatangan pihak kontraktor mitra', example: 'Bambang Haryanto, S.T. (Kuasa KSO)' })
  partnerSignatory: string;

  @ApiProperty({ description: 'Bank pengelola rekening kas bersama', example: 'Bank Mandiri (Persero) Tbk - Cabang Khusus BUMN' })
  jointBank: string;

  @ApiProperty({ description: 'Nomor rekening kas bersama KSO (dual-signatory)', example: '137-00-2026888-1' })
  jointAccountNumber: string;

  @ApiProperty({ description: 'Atas nama rekening bersama', example: 'KSO ADHI WIJAYA PRJ IKN' })
  jointAccountName: string;

  @ApiProperty({ description: 'Total nilai pagu kontrak gabungan KSO (Rp)', example: 142500000000 })
  contractValue: number;

  @ApiPropertyOptional({ description: 'Saldo kas awal rekening bersama (Rp)', example: 18750000000 })
  jointCashBalance?: number;

  @ApiProperty({ description: 'Kualifikasi usaha jasa konstruksi untuk penentuan tarif PPh Final 4(2)', enum: ['KECIL', 'MENENGAH', 'BESAR', 'SPESIALIS'], example: 'BESAR' })
  taxQualification: string;

  @ApiPropertyOptional({ description: 'Catatan akta pendirian dan addendum KSO', example: 'Akta Notaris No. 42 / 2026 tanggal 15 Januari 2026' })
  notes?: string;
}

