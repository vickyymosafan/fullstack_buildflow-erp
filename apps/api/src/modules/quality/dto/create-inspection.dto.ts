import { ApiProperty } from '@nestjs/swagger';

export class CreateInspectionDto {
  @ApiProperty({ example: 'PRJ-2026-LRT', description: 'Kode proyek' })
  projectCode!: string;

  @ApiProperty({ example: 'Inspeksi Pengecoran Kolom Zona 1', description: 'Judul inspeksi QC atau K3' })
  title!: string;

  @ApiProperty({ example: 'QUALITY_QC', description: 'Kategori (QUALITY_QC, SAFETY_K3, ENVIRONMENTAL)' })
  category!: string;

  @ApiProperty({ example: 'PASSED', description: 'Status (PASSED, FAILED, NCR_ISSUED)', required: false })
  status?: string;

  @ApiProperty({ example: 'LOW', description: 'Tingkat keparahan risiko (LOW, MEDIUM, HIGH, CRITICAL)', required: false })
  severity?: string;

  @ApiProperty({ example: 'Pier Head P-12', description: 'Lokasi spesifik di site', required: false })
  location?: string;

  @ApiProperty({ example: 'Bambang Kusuma, S.T.', description: 'Nama inspektor penguji' })
  inspectorName!: string;

  @ApiProperty({ example: 95.5, description: 'Skor kesesuaian checklist (0 - 100)', required: false })
  score?: number;

  @ApiProperty({ example: 'Hasil uji slump sesuai toleransi', description: 'Catatan teknis lapangan', required: false })
  notes?: string;

  @ApiProperty({ example: 'NCR-2026-003', description: 'Nomor registrasi NCR jika ada temuan', required: false })
  ncrNumber?: string;

  @ApiProperty({ example: 'Koreksi penulangan ulang', description: 'Tindakan perbaikan yang diwajibkan', required: false })
  actionPlan?: string;
}
