import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAsBuiltDocDto {
  @ApiProperty({ description: 'Nomor dokumen gambar terlaksana (e.g. ASB-AR-001)' })
  docNumber: string;

  @ApiProperty({ description: 'Judul dokumen / gambar / manual' })
  title: string;

  @ApiProperty({ description: 'Disiplin teknis', enum: ['ARCHITECTURE', 'STRUCTURE', 'MEP', 'CIVIL_LANDSCAPE', 'OM_MANUAL', 'SLF_CERTIFICATE'] })
  discipline: 'ARCHITECTURE' | 'STRUCTURE' | 'MEP' | 'CIVIL_LANDSCAPE' | 'OM_MANUAL' | 'SLF_CERTIFICATE';

  @ApiProperty({ description: 'Nomor revisi final (e.g. Rev.Final-0)' })
  revision: string;

  @ApiProperty({ description: 'Format file (DWG, BIM/RVT, PDF, ZIP)' })
  format: string;

  @ApiProperty({ description: 'Ukuran file (e.g. 45.2 MB)' })
  fileSize: string;

  @ApiProperty({ description: 'URL atau path unduhan dokumen' })
  downloadUrl: string;

  @ApiPropertyOptional({ description: 'Keterangan revisi dan lingkup perubahan lapangan' })
  description?: string;
}
