import { ApiProperty } from '@nestjs/swagger';

export class CreateWIRDto {
  @ApiProperty({ example: 'PRJ-2026-IKN-PK3', description: 'Kode proyek konstruksi' })
  projectCode!: string;

  @ApiProperty({ example: 'Inspeksi Pembesian & Bekisting Kolom Lt 4 Zona Barat', description: 'Judul Izin Inspeksi Kerja (WIR)' })
  title!: string;

  @ApiProperty({ example: 'Tower Utama Lantai 4 Zona 2', description: 'Lokasi fisik pekerjaan yang diinspeksi' })
  location!: string;

  @ApiProperty({ example: 'Ahmad Fauzi (QC Civil Inspector)', description: 'Nama QC Engineer / Inspector' })
  inspectorName!: string;

  @ApiProperty({ example: 'DWG-STR-COL-004 Rev B', description: 'Nomor Gambar Kerja / RKS Acuan', required: false })
  drawingReference?: string;

  @ApiProperty({ example: 'PT Wira Baja Konstruksi', description: 'Nama Subkontraktor / Mandor Pelaksana', required: false })
  subcontractorName?: string;

  @ApiProperty({ example: 'Pengecekan jarak sengkang D10-100 dan selimut beton decking tebal 40mm', description: 'Catatan lingkup inspeksi', required: false })
  notes?: string;
}

export class UpdateWIRStatusDto {
  @ApiProperty({ example: 'APPROVED_TO_PROCEED', description: 'Status WIR (APPROVED_TO_PROCEED / REJECTED_REVISE)' })
  status!: 'APPROVED_TO_PROCEED' | 'REJECTED_REVISE';

  @ApiProperty({ example: 'Ir. Hendra Gunawan (MK / Konsultan Supervisi)', description: 'Nama penyetuju MK / Lead QC' })
  approverName!: string;

  @ApiProperty({ example: 'Disetujui untuk lanjut ke tahap pengecoran beton ready mix fc 35 MPa', description: 'Catatan persetujuan / revisi' })
  approvalNotes?: string;
}

