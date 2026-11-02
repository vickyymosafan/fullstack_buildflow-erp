import { ApiProperty } from '@nestjs/swagger';

export class CreateTbmDto {
  @ApiProperty({ example: 'PRJ-2026-IKN-PK3', description: 'Kode proyek konstruksi', required: false })
  projectCode?: string;

  @ApiProperty({ example: 'Briefing K3 Harian: Penggunaan Full Body Harness Double Lanyard saat Pasang Fasad', description: 'Topik Toolbox Meeting' })
  topic!: string;

  @ApiProperty({ example: 'Zona Podium Barat & Facade Tower 1', description: 'Zona / Area Briefing' })
  zoneLocation!: string;

  @ApiProperty({ example: 'Rahmat Hidayat (Mandor Struktur & Safety Representative)', description: 'Pemimpin sesi TBM / Safety Induction' })
  leadBy!: string;

  @ApiProperty({ example: 42, description: 'Jumlah pekerja / mandor yang hadir' })
  attendeeCount!: number;

  @ApiProperty({ example: 'Pekerja Struktur, Scaffolder, dan Mekanikal Subkon PT Jaya Tehnik', description: 'Kelompok kerja target' })
  targetGroup!: string;

  @ApiProperty({ example: 'Cerah Berawan / Angin 8 km/h', description: 'Kondisi cuaca saat briefing' })
  weatherCondition!: string;

  @ApiProperty({ example: 'Cek 100% hook life-line, dilarang melepas helm saat berada di bawah perancah, wajib minum air cukup untuk hindari dehidrasi.', description: 'Poin penting instruksi K3' })
  keySafetyNotes!: string;
}

