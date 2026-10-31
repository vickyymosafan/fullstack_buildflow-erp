import { ApiProperty } from '@nestjs/swagger';

export class ApprovalActionDto {
  @ApiProperty({ example: 'PO-2026-088', description: 'ID item atau nomor dokumen yang disetujui/ditolak' })
  itemId!: string;

  @ApiProperty({ example: 'PURCHASE_ORDER', description: 'Tipe dokumen: PURCHASE_ORDER, SITE_REPORT, BUDGET_REVISION' })
  itemType!: string;

  @ApiProperty({ example: 'APPROVE', description: 'Aksi: APPROVE, REJECT, REQUEST_REVISION' })
  action!: string;

  @ApiProperty({ example: 'Spesifikasi dan kuotasi harga telah diverifikasi sesuai RAP', description: 'Catatan persetujuan / alasan penolakan' })
  notes?: string;
}

