import { ApiProperty } from '@nestjs/swagger';

export class PostReceiptJournalDto {
  @ApiProperty({ example: 'GR-2026-1101-01', description: 'Nomor Surat Penerimaan Barang (GR)' })
  receiptNumber!: string;

  @ApiProperty({ example: 'PO-2026-088', description: 'Nomor Purchase Order bersangkutan' })
  poNumber!: string;

  @ApiProperty({ example: 14800000, description: 'Total nilai transaksi barang diterima (IDR)' })
  totalAmount!: number;

  @ApiProperty({ example: 'PRJ-2026-LRT', description: 'Kode proyek konstruksi', required: false })
  projectCode?: string;

  @ApiProperty({ example: 'Auto-journal penerimaan material proyek', required: false })
  description?: string;
}

