import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBimModelDto {
  @ApiProperty({ example: 'PRJ-MRT-001', description: 'ID Proyek Konstruksi' })
  projectId: string;

  @ApiProperty({ example: 'MRT Fase 2A CP201 Monas-Harmoni', description: 'Nama Proyek' })
  projectName: string;

  @ApiProperty({ example: 'Model Struktur Stasiun Bawah Tanah Harmoni', description: 'Nama Model 3D' })
  modelName: string;

  @ApiProperty({ example: 'STRUCTURE', enum: ['ARCHITECTURE', 'STRUCTURE', 'MEP', 'CIVIL_INFRASTRUCTURE'] })
  discipline: 'ARCHITECTURE' | 'STRUCTURE' | 'MEP' | 'CIVIL_INFRASTRUCTURE';

  @ApiProperty({ example: 'IFC4', enum: ['IFC2X3', 'IFC4', 'RVT', 'NWD'] })
  fileFormat: 'IFC2X3' | 'IFC4' | 'RVT' | 'NWD';

  @ApiProperty({ example: 'LOD_350', enum: ['LOD_200', 'LOD_300', 'LOD_350', 'LOD_400'] })
  lodLevel: 'LOD_200' | 'LOD_300' | 'LOD_350' | 'LOD_400';

  @ApiPropertyOptional({ example: '142.5 MB', description: 'Ukuran file model' })
  fileSize?: string;

  @ApiPropertyOptional({ example: 'Ir. Dwi Prasetyo, S.T. (BIM Coordinator)', description: 'Author/Pengunggah Model' })
  authorName?: string;

  @ApiPropertyOptional({ example: 'Model revisi struktur D-Wall dan Box Station Harmoni hasil koordinasi CCO-02', description: 'Catatan Rilis' })
  description?: string;
}

