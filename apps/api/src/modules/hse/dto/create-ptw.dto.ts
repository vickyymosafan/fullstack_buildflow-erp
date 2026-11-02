import { ApiProperty } from '@nestjs/swagger';

export class CreatePtwDto {
  @ApiProperty({ example: 'PRJ-2026-IKN-PK3', description: 'Kode proyek konstruksi', required: false })
  projectCode?: string;

  @ApiProperty({ example: 'Pengelasan Struktur Baja Truss Canopy Lobby', description: 'Judul izin kerja risiko tinggi' })
  title!: string;

  @ApiProperty({ example: 'HOT_WORK', description: 'Jenis izin: HOT_WORK, WORKING_AT_HEIGHT, CONFINED_SPACE, HEAVY_LIFTING, ELECTRICAL_ISOLATION, EXCAVATION' })
  permitType!: string;

  @ApiProperty({ example: 'HIGH', description: 'Tingkat risiko pekerjaan: LOW, MEDIUM, HIGH, CRITICAL' })
  riskLevel!: string;

  @ApiProperty({ example: 'Area Drop-Off Lobby Utama Gedung Tower A', description: 'Lokasi fisik pekerjaan' })
  location!: string;

  @ApiProperty({ example: 'PT Baja Mandiri Utama', description: 'Subkontraktor / Pelaksana Lapangan' })
  contractorName!: string;

  @ApiProperty({ example: 'Wawan Hermawan', description: 'Penanggung jawab lapangan (Supervisor / Mandor)' })
  supervisorName!: string;

  @ApiProperty({ example: 4, description: 'Estimasi jumlah pekerja yang terlibat' })
  workerCount!: number;

  @ApiProperty({ example: '2026-11-03T08:00:00.000Z', description: 'Masa berlaku mulai' })
  validFrom!: string;

  @ApiProperty({ example: '2026-11-03T17:00:00.000Z', description: 'Masa berlaku selesai' })
  validTo!: string;

  @ApiProperty({ example: true, description: 'Apakah memerlukan APAR / Fire Watcher / Gas Detector?' })
  specialPrecautionsRequired!: boolean;

  @ApiProperty({ example: 'APAR Powder 6kg standby, Fire Blanket terpasang, Barricade line radius 5 meter, Inspeksi kabel genset grounding.', description: 'Langkah pencegahan dan mitigasi K3' })
  safetyPrecautions!: string;
}

