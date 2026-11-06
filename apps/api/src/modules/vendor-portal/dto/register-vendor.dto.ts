import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterVendorDto {
  @ApiProperty({ example: 'PT Solusi Bangun Semen Indonesia' })
  companyName: string;

  @ApiPropertyOptional({ example: 'Dynamix Cement' })
  brandName?: string;

  @ApiProperty({
    example: 'MATERIAL_SUPPLIER',
    enum: ['MATERIAL_SUPPLIER', 'SPECIALIST_SUBCON', 'HEAVY_EQUIPMENT', 'SCAFFOLDING', 'LOGISTICS_SERVICE'],
  })
  category: 'MATERIAL_SUPPLIER' | 'SPECIALIST_SUBCON' | 'HEAVY_EQUIPMENT' | 'SCAFFOLDING' | 'LOGISTICS_SERVICE';

  @ApiProperty({ example: '0123456789012' })
  nib: string;

  @ApiPropertyOptional({ example: 'SBU-LPJK-2024-8891' })
  sbuNumber?: string;

  @ApiPropertyOptional({ example: 'B1', enum: ['K1', 'K2', 'K3', 'M1', 'M2', 'B1', 'B2'] })
  sbuGrade?: 'K1' | 'K2' | 'K3' | 'M1' | 'M2' | 'B1' | 'B2';

  @ApiProperty({ example: '01.234.567.8-012.000' })
  npwp: string;

  @ApiProperty({ example: true })
  isPkp: boolean;

  @ApiProperty({ example: 'Bank Mandiri' })
  bankName: string;

  @ApiProperty({ example: '1230009876543' })
  bankAccountNumber: string;

  @ApiProperty({ example: 'PT Solusi Bangun Semen Indonesia' })
  bankAccountName: string;

  @ApiProperty({ example: 'Ir. Hendro Wijaya' })
  contactPerson: string;

  @ApiProperty({ example: 'hendro@solusibangun.co.id' })
  email: string;

  @ApiProperty({ example: '+628118899001' })
  phone: string;

  @ApiProperty({ example: 'Kawasan Industri Cilegon Kav. 45' })
  address: string;

  @ApiProperty({ example: 'Cilegon' })
  city: string;

  @ApiProperty({ example: 'Banten' })
  province: string;

  @ApiPropertyOptional({ example: ['SMK3 Kemnaker', 'ISO 9001:2015', 'ISO 45001:2018', 'SNI'] })
  certifications?: string[];

  @ApiPropertyOptional({ example: ['Semen PCC', 'Semen OPC Tipe 1', 'Ready Mix K-350'] })
  materialsSupplied?: string[];
}
