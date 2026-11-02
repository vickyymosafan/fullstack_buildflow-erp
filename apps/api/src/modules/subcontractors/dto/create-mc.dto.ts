import { ApiProperty } from '@nestjs/swagger';

export class CreateMcDto {
  @ApiProperty({ example: 'SPK-2026-STR-01', description: 'ID atau Nomor SPK' })
  spkId!: string;

  @ApiProperty({ example: 'MC-2026-03-01', description: 'Nomor Monthly Certificate' })
  mcNumber!: string;

  @ApiProperty({ example: 'Maret 2026', description: 'Periode klaim sertifikat bulanan' })
  period!: string;

  @ApiProperty({ example: 612500000, description: 'Nilai klaim bruto pekerjaan terpasang (Rp)' })
  grossAmount!: number;

  @ApiProperty({ example: 61250000, description: 'Potongan pengembalian uang muka (Rp)', required: false })
  dpDeduction?: number;

  @ApiProperty({ example: 30625000, description: 'Potongan retensi garansi 5% (Rp)', required: false })
  retentionDeduction?: number;

  @ApiProperty({ example: 2.65, description: 'Tarif PPh Final Jasa Konstruksi (%)', required: false })
  pphFinalPercent?: number;

  @ApiProperty({ example: 16231250, description: 'Nominal potongan pajak PPh Final (Rp)' })
  taxPphAmount!: number;

  @ApiProperty({ example: 504393750, description: 'Nilai bersih tagihan siap dibayar / net payable (Rp)' })
  netPayable!: number;

  @ApiProperty({ example: 'Termasuk rekonsiliasi material besi beton', description: 'Catatan MC', required: false })
  notes?: string;

  @ApiProperty({ example: 'PRJ-2026-IKN-PK3', description: 'Kode proyek', required: false })
  projectCode?: string;
}
