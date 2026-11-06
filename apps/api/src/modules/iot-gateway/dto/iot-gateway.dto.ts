import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterGatewayDto {
  @ApiProperty({ example: 'gw-weigh-ikn-02', description: 'ID unik hardware edge gateway' })
  gatewayId: string;

  @ApiProperty({ example: 'Weighbridge Edge Node IKN Sektor 2', description: 'Nama perangkat gateway' })
  name: string;

  @ApiProperty({ example: 'WEIGHBRIDGE_MODBUS', enum: ['WEIGHBRIDGE_MODBUS', 'OBD_CANBUS_TELEMATICS', 'BIOMETRIC_RFID_TERMINAL', 'LORAWAN_CONCENTRATOR'] })
  deviceType: string;

  @ApiProperty({ example: 'Proyek Tol IKN Seksi 3B - Gate Timur', description: 'Lokasi pemasangan' })
  siteLocation: string;

  @ApiProperty({ example: 'MQTT_TLS_1_3', description: 'Protokol komunikasi' })
  protocol: string;

  @ApiPropertyOptional({ example: 'Starlink Business Sat-04', description: 'Jalur konektivitas uplink' })
  uplinkBackhaul?: string;
}

export class RecordWeighbridgeDto {
  @ApiProperty({ example: 'gw-weigh-01', description: 'ID gateway jembatan timbang' })
  gatewayId: string;

  @ApiProperty({ example: 'B 9482 UIA', description: 'Nomor polisi truk hasil tangkapan kamera ANPR' })
  licensePlate: string;

  @ApiProperty({ example: 'DO-SMG-2026-0891', description: 'Nomor Surat Jalan (Delivery Order)' })
  deliveryOrderNo: string;

  @ApiProperty({ example: 'Semen Portland Komposit Curah (Bulk)', description: 'Nama material curah' })
  materialName: string;

  @ApiProperty({ example: 42850, description: 'Berat Bruto (Gross Weight) dalam kg' })
  grossWeightKg: number;

  @ApiProperty({ example: 14200, description: 'Berat Tara (Tare Weight) truk kosong dalam kg' })
  tareWeightKg: number;

  @ApiProperty({ example: 28500, description: 'Berat Netto menurut Surat Jalan vendor dalam kg' })
  doExpectedNetKg: number;
}

export class IngestTelematicsDto {
  @ApiProperty({ example: 'EQ-EXC-001', description: 'ID unit alat berat' })
  equipmentId: string;

  @ApiProperty({ example: 'Komatsu PC200-8MO Excavator #01', description: 'Nama unit alat berat' })
  unitName: string;

  @ApiProperty({ example: 1650, description: 'Putaran mesin (RPM) dari J1939 CAN bus' })
  engineRpm: number;

  @ApiProperty({ example: 18.4, description: 'Konsumsi BBM aktual (Liter/Jam)' })
  fuelBurnRateLph: number;

  @ApiProperty({ example: 64.5, description: 'Persentase level tangki BBM (%)' })
  fuelLevelPercent: number;

  @ApiProperty({ example: 4128.5, description: 'Total Hour Meter (HM) mesin' })
  hourMeter: number;

  @ApiPropertyOptional({ example: -0.9721, description: 'Koordinat Latitude GPS' })
  latitude?: number;

  @ApiPropertyOptional({ example: 116.7088, description: 'Koordinat Longitude GPS' })
  longitude?: number;

  @ApiPropertyOptional({ example: 0, description: 'Penurunan mendadak tangki BBM dalam 5 menit (Liter)' })
  suddenFuelDropLiters?: number;
}

export class AcknowledgeFuelAlertDto {
  @ApiProperty({ example: 'alert-fuel-01', description: 'ID peringatan anomali BBM' })
  alertId: string;

  @ApiProperty({ example: 'Ir. Hendra Wijaya (Kepala Peralatan)', description: 'Pejabat pemeriksa' })
  acknowledgedBy: string;

  @ApiProperty({ example: 'Terverifikasi pengurasan tangki terjadwal untuk kalibrasi filter solar', description: 'Catatan tindak lanjut' })
  resolutionNotes: string;
}

export class SyncBiometricBatchDto {
  @ApiProperty({ example: 'gw-bio-01', description: 'ID terminal biometrik/RFID lapangan' })
  gatewayId: string;

  @ApiProperty({ example: 'Terminal Turnstile Gate A - Proyek Bendungan', description: 'Nama lokasi gate' })
  gateName: string;

  @ApiProperty({ example: 48, description: 'Jumlah antrean log absensi offline yang disinkronkan' })
  recordsCount: number;

  @ApiPropertyOptional({ example: 48, description: 'Jumlah pekerja yang terdeteksi memakai helm K3 lengkap' })
  helmetCompliantCount?: number;
}

export class PingGatewayDto {
  @ApiProperty({ example: 'gw-weigh-01', description: 'ID gateway yang diuji konektivitasnya' })
  gatewayId: string;
}

