import { ApiProperty } from '@nestjs/swagger';

export class UpdatePtwStatusDto {
  @ApiProperty({ example: 'APPROVED', description: 'Status baru: APPROVED, REJECTED, CLOSED' })
  status!: 'APPROVED' | 'REJECTED' | 'CLOSED';

  @ApiProperty({ example: 'Ir. Danang Wicaksono, CSP (HSE Manager)', description: 'Nama pejabat K3 yang memverifikasi' })
  reviewerName!: string;

  @ApiProperty({ example: 'Seluruh checklist JSA dan APAR telah diverifikasi di lokasi. Izin kerja disetujui sampai pukul 17:00 WIB.', description: 'Catatan hasil review K3' })
  notes?: string;
}

