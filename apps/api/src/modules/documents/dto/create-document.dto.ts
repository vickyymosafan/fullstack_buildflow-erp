import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({ example: 'PRJ-2026-LRT', description: 'Kode proyek BUILDFlow' })
  projectCode!: string;

  @ApiProperty({ example: 'DWG-2026-004', description: 'Nomor registrasi dokumen / gambar kerja', required: false })
  documentNumber?: string;

  @ApiProperty({ example: 'DRAWING', description: 'Kategori: DRAWING, CONTRACT, PERMIT, SPECIFICATION' })
  category!: string;

  @ApiProperty({ example: 'Detail Sambungan Portal Baja Stasiun Interchange', description: 'Judul dokumen teknik' })
  title!: string;

  @ApiProperty({ example: 'Gambar detail elevasi peron dan struktur atap baja kanopi', description: 'Deskripsi teknis', required: false })
  description?: string;

  @ApiProperty({ example: '/storage/drawings/DWG-2026-004.dwg', description: 'Path atau URL file penyimpanan', required: false })
  fileUrl?: string;

  @ApiProperty({ example: 'DWG', description: 'Tipe ekstensi format file (PDF, DWG, BIM, XLSX, DOCX)', required: false })
  fileType?: string;

  @ApiProperty({ example: '18.4 MB', description: 'Ukuran file dokumen', required: false })
  fileSize?: string;

  @ApiProperty({ example: 1, description: 'Nomor versi revisi dokumen', required: false })
  version?: number;

  @ApiProperty({ example: 'Ir. Hendra Saputra', description: 'Nama author / pihak yang mengunggah dokumen', required: false })
  uploadedBy?: string;

  @ApiProperty({ example: 'APPROVED', description: 'Status dokumen (APPROVED, UNDER_REVIEW, SUPERSEDED)', required: false })
  status?: string;
}

