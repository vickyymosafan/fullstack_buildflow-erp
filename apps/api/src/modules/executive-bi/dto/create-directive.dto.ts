import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDirectiveDto {
  @ApiProperty({ description: 'ID Proyek Konstruksi' })
  projectId: string;

  @ApiProperty({ description: 'Kategori Isu Risiko', enum: ['COST_OVERRUN', 'SCHEDULE_SLIP', 'CASHFLOW_DEFICIT', 'SUB_CONTRACTOR_DEFAULT', 'PERMIT_DELAY'] })
  issueCategory: 'COST_OVERRUN' | 'SCHEDULE_SLIP' | 'CASHFLOW_DEFICIT' | 'SUB_CONTRACTOR_DEFAULT' | 'PERMIT_DELAY';

  @ApiProperty({ description: 'Arahan & Instruksi Khusus Jajaran Direksi / BOD' })
  directive: string;

  @ApiProperty({ description: 'Direktur Penanggung Jawab (e.g. Direktur Operasional, Direktur Keuangan)' })
  assignedDirector: string;

  @ApiProperty({ description: 'Tenggat Waktu Tindak Lanjut (ISO Date)' })
  deadline: string;

  @ApiPropertyOptional({ description: 'Catatan tambahan atau dampak eskalasi' })
  notes?: string;
}

