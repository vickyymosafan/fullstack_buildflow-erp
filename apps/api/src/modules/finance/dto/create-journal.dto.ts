import { ApiProperty } from '@nestjs/swagger';

export class JournalLineInputDto {
  @ApiProperty({ example: '1-1400', description: 'Kode akun bagan (COA)' })
  accountCode!: string;

  @ApiProperty({ example: 5000000, description: 'Nilai debit (IDR)' })
  debit!: number;

  @ApiProperty({ example: 0, description: 'Nilai kredit (IDR)' })
  credit!: number;

  @ApiProperty({ example: 'Alokasi semen pengecoran Pier Head', required: false })
  memo?: string;

  @ApiProperty({ example: 'PRJ-2026-LRT', required: false })
  projectCode?: string;
}

export class CreateJournalDto {
  @ApiProperty({ example: 'JV-2026-02-005', description: 'Nomor voucher jurnal transaksi' })
  journalNumber!: string;

  @ApiProperty({ example: '2026-02-01T10:00:00Z', description: 'Tanggal transaksi' })
  transactionDate!: string;

  @ApiProperty({ example: 'Penyesuaian Biaya Material Proyek LRT', description: 'Keterangan transaksi jurnal' })
  description!: string;

  @ApiProperty({ type: [JournalLineInputDto], description: 'Daftar rincian baris debit & kredit jurnal' })
  lines!: JournalLineInputDto[];
}

