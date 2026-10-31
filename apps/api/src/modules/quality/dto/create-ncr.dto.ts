import { ApiProperty } from '@nestjs/swagger';

export class CreateNCRDto {
  @ApiProperty({ example: 'PRJ-2026-LRT', description: 'Kode proyek konstruksi' })
  projectCode!: string;

  @ApiProperty({ example: 'Deviasi Selimut Beton Kolom K-14 Melebihi Toleransi RKS', description: 'Uraian ketidaksesuaian mutu' })
  title!: string;

  @ApiProperty({ example: 'Zona Kolom K-14 Lantai 2', description: 'Lokasi temuan fisik di site' })
  location!: string;

  @ApiProperty({ example: 'HIGH', description: 'Tingkat keparahan (MEDIUM, HIGH, CRITICAL)' })
  severity!: string;

  @ApiProperty({ example: 'Bambang Kusuma, S.T. (QC Lead)', description: 'Nama auditor/inspektor pelapor' })
  inspectorName!: string;

  @ApiProperty({ example: 'Selimut beton terukur hanya 20mm dari standar minimal 40mm pada gambar kerja.', description: 'Detail deskripsi ketidaksesuaian' })
  notes!: string;

  @ApiProperty({ example: 'Bongkar bekisting lokal, pasang beton decking 40mm standar, lakukan re-inspeksi sebelum izin cor.', description: 'Rencana tindakan korektif (Corrective Action Plan)' })
  actionPlan!: string;
}
