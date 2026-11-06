import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFinalAccountDto {
  @ApiProperty({ description: 'Nomor penyelesaian final account resmi (e.g. FA-2026-001)' })
  settlementNumber: string;

  @ApiProperty({ description: 'ID Proyek Konstruksi' })
  projectId: string;

  @ApiProperty({ description: 'Nama Proyek Konstruksi' })
  projectName: string;

  @ApiProperty({ description: 'Nama Kontraktor Utama' })
  contractorName: string;

  @ApiProperty({ description: 'Nilai Kontrak Awal (IDR)' })
  originalContractValue: number;

  @ApiProperty({ description: 'Total Nilai Change Orders / CCO Kumulatif (IDR)' })
  totalVariationOrders: number;

  @ApiProperty({ description: 'Nilai Potongan Retensi 5% (IDR)' })
  retentionDeduction: number;

  @ApiProperty({ description: 'Potongan Denda Keterlambatan / Liquidated Damages (IDR)' })
  liquidatedDamages: number;

  @ApiProperty({ description: 'Kumulatif Pembayaran Progres Sebelumnya (IDR)' })
  previousPayments: number;

  @ApiPropertyOptional({ description: 'Catatan rekonsiliasi dan rincian klaim akhir' })
  notes?: string;
}

