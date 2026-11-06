import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SimulateScenarioDto {
  @ApiProperty({ description: 'Nama Skenario Makro Finansial' })
  scenarioName: string;

  @ApiProperty({ description: 'Penyesuaian Waktu Keterlambatan Termin (Hari, e.g. 15, 30)' })
  paymentDelayDays: number;

  @ApiProperty({ description: 'Persentase Fluktuasi Kenaikan Harga Material / Inflasi (%, e.g. 5, 10)' })
  materialInflationPercent: number;

  @ApiProperty({ description: 'Percepatan Durasi Crash Schedule (Bulan, e.g. 0, 1, 2)' })
  crashScheduleMonths: number;

  @ApiPropertyOptional({ description: 'Deskripsi tujuan skenario simulasi' })
  description?: string;
}

