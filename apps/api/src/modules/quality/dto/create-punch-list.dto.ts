import { ApiProperty } from '@nestjs/swagger';

export class CreatePunchListDto {
  @ApiProperty({ example: 'PRJ-2026-IKN-PK3', description: 'Kode proyek konstruksi' })
  projectCode!: string;

  @ApiProperty({ example: 'Nat Homogenous Tile 60x60 Retak dan Rongga Kosong', description: 'Uraian cacat/punch item' })
  title!: string;

  @ApiProperty({ example: 'Gedung Sayap Barat Lantai 2 R. Meeting 204', description: 'Lokasi ruangan/zona cacat' })
  location!: string;

  @ApiProperty({ example: 'FINISHING_ARSI', description: 'Disiplin (STRUKTUR, FINISHING_ARSI, MEP, LANSEKAP)' })
  tradeCategory!: string;

  @ApiProperty({ example: 'MEDIUM', description: 'Tingkat keparahan (LOW, MEDIUM, HIGH)' })
  severity!: string;

  @ApiProperty({ example: 'PT Karya Finishing Nusantara', description: 'Subkontraktor yang bertanggung jawab' })
  subcontractorName!: string;

  @ApiProperty({ example: '2026-11-20', description: 'Target tanggal penyelesaian perbaikan' })
  targetCloseDate?: string;

  @ApiProperty({ example: 'Bongkar nat lama, lakukan grouting ulang dengan semen nat elastis kedap air', description: 'Rencana tindakan perbaikan' })
  actionPlan?: string;
}

export class UpdatePunchStatusDto {
  @ApiProperty({ example: 'RECTIFIED', description: 'Status punch list (IN_PROGRESS, RECTIFIED, VERIFIED_CLOSED)' })
  status!: 'IN_PROGRESS' | 'RECTIFIED' | 'VERIFIED_CLOSED';

  @ApiProperty({ example: 'Bambang Kusuma, S.T. (QC Handover Lead)', description: 'Verifikator penutupan punch list' })
  verifiedBy!: string;

  @ApiProperty({ example: 'Perbaikan telah diperiksa bersama Konsultan Pengawas dan dinyatakan rapi sesuai standar', description: 'Catatan verifikasi' })
  verificationNotes?: string;
}

