import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IotGatewayService } from './iot-gateway.service';
import {
  RegisterGatewayDto,
  RecordWeighbridgeDto,
  IngestTelematicsDto,
  AcknowledgeFuelAlertDto,
  SyncBiometricBatchDto,
  PingGatewayDto,
} from './dto/iot-gateway.dto';

@ApiTags('iot-gateway')
@Controller('iot-gateway')
export class IotGatewayController {
  constructor(private readonly iotService: IotGatewayService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Ringkasan status IoT Site Gateway, jembatan timbang, telematika BBM, dan antrean biometrik' })
  @ApiResponse({ status: 200, description: 'Ringkasan IoT berhasil diambil' })
  getOverview() {
    return this.iotService.getOverview();
  }

  @Get('devices')
  @ApiOperation({ summary: 'Daftar perangkat Edge Gateway lapangan (Modbus, CAN bus, Biometrik, LoRaWAN)' })
  @ApiResponse({ status: 200, description: 'Daftar perangkat edge gateway' })
  getDevices() {
    return this.iotService.getDevices();
  }

  @Post('devices/register')
  @ApiOperation({ summary: 'Mendaftarkan node Edge Gateway IoT baru di lokasi proyek' })
  @ApiResponse({ status: 201, description: 'Perangkat gateway berhasil terdaftar' })
  registerDevice(@Body() dto: RegisterGatewayDto) {
    return this.iotService.registerDevice(dto);
  }

  @Get('weighbridge/tickets')
  @ApiOperation({ summary: 'Daftar tiket penimbangan jembatan timbang digital dan verifikasi ANPR' })
  @ApiResponse({ status: 200, description: 'Daftar tiket timbangan' })
  getWeighbridgeTickets() {
    return this.iotService.getWeighbridgeTickets();
  }

  @Post('weighbridge/record')
  @ApiOperation({ summary: 'Mencatat hasil timbangan truk material curah (Bruto, Tara, Netto vs Surat Jalan)' })
  @ApiResponse({ status: 201, description: 'Tiket timbangan berhasil direkam' })
  recordWeighbridgeTicket(@Body() dto: RecordWeighbridgeDto) {
    return this.iotService.recordWeighbridgeTicket(dto);
  }

  @Get('telematics/fleet')
  @ApiOperation({ summary: 'Data telematika OBD-II / J1939 CAN bus armada alat berat (RPM, BBM L/jam, HM, GPS)' })
  @ApiResponse({ status: 200, description: 'Status telematika alat berat' })
  getFleetTelematics() {
    return this.iotService.getFleetTelematics();
  }

  @Post('telematics/telemetry')
  @ApiOperation({ summary: 'Ingest paket telematika CAN bus dan evaluasi deteksi pencurian BBM (Fuel Theft)' })
  @ApiResponse({ status: 201, description: 'Telematika berhasil diproses' })
  ingestTelematics(@Body() dto: IngestTelematicsDto) {
    return this.iotService.ingestTelematics(dto);
  }

  @Get('telematics/fuel-alerts')
  @ApiOperation({ summary: 'Daftar peringatan anomali penurunan mendadak tangki BBM alat berat' })
  @ApiResponse({ status: 200, description: 'Daftar peringatan anomali BBM' })
  getFuelAlerts() {
    return this.iotService.getFuelAlerts();
  }

  @Post('telematics/fuel-alerts/acknowledge')
  @ApiOperation({ summary: 'Konfirmasi dan tindak lanjut investigasi anomali BBM alat berat' })
  @ApiResponse({ status: 200, description: 'Peringatan BBM berhasil ditindaklanjuti' })
  acknowledgeFuelAlert(@Body() dto: AcknowledgeFuelAlertDto) {
    return this.iotService.acknowledgeFuelAlert(dto);
  }

  @Get('biometrics/logs')
  @ApiOperation({ summary: 'Riwayat batch sinkronisasi absensi biometrik & kepatuhan helm K3' })
  @ApiResponse({ status: 200, description: 'Daftar batch sinkronisasi biometrik' })
  getBiometricLogs() {
    return this.iotService.getBiometricLogs();
  }

  @Post('biometrics/sync-batch')
  @ApiOperation({ summary: 'Sinkronisasi antrean log absensi biometrik offline saat koneksi pulih' })
  @ApiResponse({ status: 201, description: 'Batch biometrik berhasil disinkronkan' })
  syncBiometricBatch(@Body() dto: SyncBiometricBatchDto) {
    return this.iotService.syncBiometricBatch(dto);
  }

  @Post('devices/ping')
  @ApiOperation({ summary: 'Uji konektivitas heartbeat mTLS ke node Edge Gateway lapangan' })
  @ApiResponse({ status: 200, description: 'Ping gateway berhasil' })
  pingGateway(@Body() dto: PingGatewayDto) {
    return this.iotService.pingGateway(dto);
  }
}

