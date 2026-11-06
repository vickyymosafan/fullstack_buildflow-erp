import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSharedExpenseDto {
  @ApiPropertyOptional({ description: 'ID Konsorsium KSO', example: 'KSO-IKN-PK3-2026' })
  ksoCode?: string;

  @ApiProperty({ description: 'Deskripsi / Uraian pengeluaran beban bersama', example: 'Pembangunan Direksi Keet, Laboratorium Beton, dan Posko Gabungan KSO' })
  title: string;

  @ApiProperty({
    description: 'Kategori alokasi beban',
    enum: ['DIRECT_JOB', 'SHARED_OVERHEAD', 'EQUIPMENT_MOB', 'SITE_FACILITY', 'SAFETY_ENVIRONMENT'],
    example: 'SITE_FACILITY',
  })
  category: string;

  @ApiProperty({ description: 'Total nilai nominal pengeluaran (Rp)', example: 450000000 })
  amount: number;

  @ApiProperty({ description: 'Vendor / Pihak penerima pembayaran', example: 'PT Sarana Fasilitas Konstruksi' })
  vendorName: string;

  @ApiProperty({ description: 'Nomor faktur / invoice pendukung', example: 'INV-SFK-2026-088' })
  invoiceRef: string;

  @ApiPropertyOptional({ description: 'Tanggal pengeluaran transaksi (YYYY-MM-DD)', example: '2026-03-02' })
  expenseDate?: string;

  @ApiPropertyOptional({ description: 'Catatan justifikasi teknis pengeluaran bersama', example: 'Fasilitas dipakai bersama oleh tim engineering Adhi dan Wijaya' })
  notes?: string;
}

