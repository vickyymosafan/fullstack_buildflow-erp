import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBcfTopicDto {
  @ApiProperty({ example: 'PRJ-MRT-001', description: 'ID Proyek Konstruksi' })
  projectId: string;

  @ApiProperty({ example: 'Pipa Air Bersih Chilled Water Menembus Shear Wall Tanpa Sleeve', description: 'Judul Isu BCF' })
  title: string;

  @ApiProperty({ example: 'CLASH', enum: ['CLASH', 'DESIGN_DEFECT', 'SITE_OBSTRUCTION', 'SAFETY_HAZARD', 'INQUIRY'] })
  topicType: 'CLASH' | 'DESIGN_DEFECT' | 'SITE_OBSTRUCTION' | 'SAFETY_HAZARD' | 'INQUIRY';

  @ApiProperty({ example: 'CRITICAL', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @ApiProperty({ example: 'Ir. Ahmad Baihaqi (MEP Lead)', description: 'Penanggung Jawab Penanganan' })
  assignedTo: string;

  @ApiProperty({ example: 'Bambang Kusumo, S.T. (Senior Site Engineer)', description: 'Pelapor Isu' })
  createdByName: string;

  @ApiPropertyOptional({ example: 'ELE-DW-004', description: 'ID elemen 3D terkait' })
  relatedElementId?: string;

  @ApiPropertyOptional({
    example: { posX: 14.2, posY: -8.5, posZ: 22.0, targetX: 12.0, targetY: -8.0, targetZ: 20.0, fov: 60 },
    description: 'Vektor posisi kamera viewpoint 3D BCF',
  })
  viewpoint?: {
    posX: number;
    posY: number;
    posZ: number;
    targetX: number;
    targetY: number;
    targetZ: number;
    fov: number;
  };

  @ApiPropertyOptional({ example: 'Pipa HVAC diameter 250mm berbenturan dengan balok girder portal G-14 di elevasi -12.50m', description: 'Deskripsi Detail' })
  description?: string;
}

