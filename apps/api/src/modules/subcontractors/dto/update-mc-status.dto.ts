import { ApiProperty } from '@nestjs/swagger';

export class UpdateMcStatusDto {
  @ApiProperty({ example: 'APPROVED', description: 'Status baru: DRAFT, VERIFIED, APPROVED, PAID, REJECTED' })
  status!: 'DRAFT' | 'VERIFIED' | 'APPROVED' | 'PAID' | 'REJECTED';

  @ApiProperty({ example: 'Ir. Danang Wicaksono (Project Manager)', description: 'Nama penyetuju', required: false })
  approvedBy?: string;

  @ApiProperty({ example: 'Dokumen lengkap dan opname telah diverifikasi', description: 'Alasan atau catatan verifikasi', required: false })
  rejectionReason?: string;
}
