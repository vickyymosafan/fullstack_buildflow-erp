import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  RegisterGatewayDto,
  RecordWeighbridgeDto,
  IngestTelematicsDto,
  AcknowledgeFuelAlertDto,
  SyncBiometricBatchDto,
  PingGatewayDto,
} from './dto/iot-gateway.dto';

export interface EdgeGatewayDevice {
  id: string;
  gatewayId: string;
  name: string;
  deviceType: string;
  siteLocation: string;
  protocol: string;
  uplinkBackhaul: string;
  status: 'ONLINE' | 'BUFFERING_OFFLINE' | 'DEGRADED';
  signalRssiDbm: number;
  queuedPackets: number;
  lastHeartbeatAt: string;
  firmwareVersion: string;
}

export interface WeighbridgeTicket {
  id: string;
  ticketNumber: string;
  gatewayId: string;
  licensePlate: string;
  deliveryOrderNo: string;
  materialName: string;
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  doExpectedNetKg: number;
  varianceKg: number;
  variancePercent: number;
  status: 'MATCHED' | 'TOLERANCE_WARNING' | 'SHORTAGE_REJECTED';
  anprVerified: boolean;
  recordedAt: string;
}

export interface FleetTelematicsUnit {
  equipmentId: string;
  unitName: string;
  category: string;
  siteZone: string;
  engineState: 'RUNNING_LOAD' | 'IDLE' | 'OFF';
  engineRpm: number;
  fuelBurnRateLph: number;
  fuelLevelPercent: number;
  hourMeter: number;
  geofenceStatus: 'INSIDE_ZONE' | 'BREACH_ALERT';
  latitude: number;
  longitude: number;
  canBusProtocol: string;
  lastTelemetryAt: string;
}

export interface FuelAnomalyAlert {
  id: string;
  equipmentId: string;
  unitName: string;
  dropLiters: number;
  engineRpmAtEvent: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  detectedAt: string;
  status: 'OPEN' | 'ACKNOWLEDGED';
  acknowledgedBy?: string;
  resolutionNotes?: string;
}

export interface BiometricSyncBatch {
  id: string;
  batchCode: string;
  gatewayId: string;
  gateName: string;
  recordsCount: number;
  helmetCompliantCount: number;
  complianceRatePercent: number;
  offlineDurationMinutes: number;
  syncedAt: string;
  hashStatus: 'SHA256_VERIFIED';
}

@Injectable()
export class IotGatewayService {
  private gateways: EdgeGatewayDevice[] = [
    {
      id: '1',
      gatewayId: 'gw-weigh-01',
      name: 'Weighbridge Modbus TCP Node #01 (Batching Plant)',
      deviceType: 'WEIGHBRIDGE_MODBUS',
      siteLocation: 'Proyek Tol Trans Sumatera Seksi 4 - Gate Utama',
      protocol: 'MODBUS_TCP_OVER_MQTT_TLS',
      uplinkBackhaul: 'Fiber Optic Dedicated + 5G Backup',
      status: 'ONLINE',
      signalRssiDbm: -54,
      queuedPackets: 0,
      lastHeartbeatAt: '2026-11-06T23:55:00Z',
      firmwareVersion: 'v4.8.2-lts',
    },
    {
      id: '2',
      gatewayId: 'gw-can-01',
      name: 'LoRaWAN & OBD-II J1939 Fleet Concentrator',
      deviceType: 'OBD_CANBUS_TELEMATICS',
      siteLocation: 'Proyek Bendungan Meninting Lombok - Zona Galian',
      protocol: 'J1939_CAN_TO_MQTT_TLS',
      uplinkBackhaul: 'Starlink Maritime/Enterprise Sat-02',
      status: 'ONLINE',
      signalRssiDbm: -68,
      queuedPackets: 0,
      lastHeartbeatAt: '2026-11-06T23:55:10Z',
      firmwareVersion: 'v4.8.2-lts',
    },
    {
      id: '3',
      gatewayId: 'gw-bio-01',
      name: 'Biometric Face/RFID Turnstile Terminal (Offline-First)',
      deviceType: 'BIOMETRIC_RFID_TERMINAL',
      siteLocation: 'Proyek IKN Seksi 3B - Camp Pekerja & Mandor',
      protocol: 'REST_MTLS_SQLITE_QUEUE',
      uplinkBackhaul: 'Starlink Business Sat-04 (Intermittent Rain Fade)',
      status: 'BUFFERING_OFFLINE',
      signalRssiDbm: -81,
      queuedPackets: 34,
      lastHeartbeatAt: '2026-11-06T23:42:00Z',
      firmwareVersion: 'v4.8.0-lts',
    },
  ];

  private weighTickets: WeighbridgeTicket[] = [
    {
      id: 'wt-1',
      ticketNumber: 'WB-20261106-001',
      gatewayId: 'gw-weigh-01',
      licensePlate: 'B 9482 UIA',
      deliveryOrderNo: 'DO-SMG-2026-0891',
      materialName: 'Semen Portland Komposit Curah (Bulk)',
      grossWeightKg: 42680,
      tareWeightKg: 14200,
      netWeightKg: 28480,
      doExpectedNetKg: 28500,
      varianceKg: -20,
      variancePercent: -0.07,
      status: 'MATCHED',
      anprVerified: true,
      recordedAt: '2026-11-06T22:15:00Z',
    },
    {
      id: 'wt-2',
      ticketNumber: 'WB-20261106-002',
      gatewayId: 'gw-weigh-01',
      licensePlate: 'BE 8812 YU',
      deliveryOrderNo: 'DO-AGG-2026-1120',
      materialName: 'Agregat Kasar Split 20-30mm',
      grossWeightKg: 36900,
      tareWeightKg: 12500,
      netWeightKg: 24400,
      doExpectedNetKg: 25000,
      varianceKg: -600,
      variancePercent: -2.4,
      status: 'SHORTAGE_REJECTED',
      anprVerified: true,
      recordedAt: '2026-11-06T22:48:00Z',
    },
    {
      id: 'wt-3',
      ticketNumber: 'WB-20261106-003',
      gatewayId: 'gw-weigh-01',
      licensePlate: 'B 9011 KQA',
      deliveryOrderNo: 'DO-ASP-2026-0419',
      materialName: 'Aspal Pen 60/70 Drum Curah',
      grossWeightKg: 31890,
      tareWeightKg: 11900,
      netWeightKg: 19990,
      doExpectedNetKg: 20000,
      varianceKg: -10,
      variancePercent: -0.05,
      status: 'MATCHED',
      anprVerified: true,
      recordedAt: '2026-11-06T23:12:00Z',
    },
  ];

  private fleetUnits: FleetTelematicsUnit[] = [
    {
      equipmentId: 'EQ-EXC-001',
      unitName: 'Komatsu PC200-8MO Hydraulic Excavator #01',
      category: 'Excavator',
      siteZone: 'Zona Galian Bendungan Utama',
      engineState: 'RUNNING_LOAD',
      engineRpm: 1720,
      fuelBurnRateLph: 18.6,
      fuelLevelPercent: 72.4,
      hourMeter: 4128.5,
      geofenceStatus: 'INSIDE_ZONE',
      latitude: -8.5241,
      longitude: 116.1422,
      canBusProtocol: 'SAE J1939 (250 kbps)',
      lastTelemetryAt: '2026-11-06T23:54:50Z',
    },
    {
      equipmentId: 'EQ-DOZ-002',
      unitName: 'Caterpillar D6R2 XL Bulldozer #02',
      category: 'Bulldozer',
      siteZone: 'Zona Timbunan Seksi 3B',
      engineState: 'IDLE',
      engineRpm: 820,
      fuelBurnRateLph: 6.2,
      fuelLevelPercent: 48.0,
      hourMeter: 2890.2,
      geofenceStatus: 'INSIDE_ZONE',
      latitude: -0.9718,
      longitude: 116.7091,
      canBusProtocol: 'SAE J1939 (500 kbps)',
      lastTelemetryAt: '2026-11-06T23:54:55Z',
    },
    {
      equipmentId: 'EQ-DMP-009',
      unitName: 'Hino FM 260 JD Dump Truck #09',
      category: 'Dump Truck',
      siteZone: 'Jalur Hauling Quarry KM 14',
      engineState: 'OFF',
      engineRpm: 0,
      fuelBurnRateLph: 0,
      fuelLevelPercent: 31.5,
      hourMeter: 6412.0,
      geofenceStatus: 'BREACH_ALERT',
      latitude: -8.5612,
      longitude: 116.1984,
      canBusProtocol: 'OBD-II ISO 15765-4',
      lastTelemetryAt: '2026-11-06T23:50:12Z',
    },
  ];

  private fuelAlerts: FuelAnomalyAlert[] = [
    {
      id: 'alert-fuel-01',
      equipmentId: 'EQ-DMP-009',
      unitName: 'Hino FM 260 JD Dump Truck #09',
      dropLiters: 38.5,
      engineRpmAtEvent: 0,
      severity: 'CRITICAL',
      detectedAt: '2026-11-06T23:18:00Z',
      status: 'OPEN',
    },
    {
      id: 'alert-fuel-02',
      equipmentId: 'EQ-DOZ-002',
      unitName: 'Caterpillar D6R2 XL Bulldozer #02',
      dropLiters: 21.0,
      engineRpmAtEvent: 0,
      severity: 'HIGH',
      detectedAt: '2026-11-05T02:40:00Z',
      status: 'ACKNOWLEDGED',
      acknowledgedBy: 'Ir. Hendra Wijaya',
      resolutionNotes: 'Pengurasan terjadwal untuk penggantian water separator filter solar.',
    },
  ];

  private biometricBatches: BiometricSyncBatch[] = [
    {
      id: 'bio-batch-01',
      batchCode: 'SYNC-IKN-20261106-A',
      gatewayId: 'gw-bio-01',
      gateName: 'Turnstile Gate A - Camp Pekerja IKN',
      recordsCount: 142,
      helmetCompliantCount: 142,
      complianceRatePercent: 100,
      offlineDurationMinutes: 45,
      syncedAt: '2026-11-06T19:00:00Z',
      hashStatus: 'SHA256_VERIFIED',
    },
    {
      id: 'bio-batch-02',
      batchCode: 'SYNC-MNT-20261106-B',
      gatewayId: 'gw-bio-01',
      gateName: 'Turnstile Gate B - Area Tunnel Spillway',
      recordsCount: 86,
      helmetCompliantCount: 84,
      complianceRatePercent: 97.67,
      offlineDurationMinutes: 120,
      syncedAt: '2026-11-06T21:30:00Z',
      hashStatus: 'SHA256_VERIFIED',
    },
  ];

  // 1. Overview
  getOverview() {
    const onlineGateways = this.gateways.filter((g) => g.status === 'ONLINE').length;
    const totalNetWeighedKg = this.weighTickets.reduce((s, t) => s + t.netWeightKg, 0);
    const openFuelAlerts = this.fuelAlerts.filter((a) => a.status === 'OPEN').length;
    const totalBiometricRecords = this.biometricBatches.reduce((s, b) => s + b.recordsCount, 0);

    return {
      status: 'OPERATIONAL',
      gatewaysSummary: {
        totalGateways: this.gateways.length,
        onlineGateways,
        bufferingGateways: this.gateways.length - onlineGateways,
      },
      weighbridgeSummary: {
        totalTicketsToday: this.weighTickets.length,
        totalNetWeighedTon: Number((totalNetWeighedKg / 1000).toFixed(2)),
        rejectedShortageCount: this.weighTickets.filter((t) => t.status === 'SHORTAGE_REJECTED').length,
      },
      telematicsSummary: {
        monitoredUnits: this.fleetUnits.length,
        averageBurnRateLph: Number(
          (this.fleetUnits.reduce((s, u) => s + u.fuelBurnRateLph, 0) / this.fleetUnits.length).toFixed(2),
        ),
        openFuelTheftAlerts: openFuelAlerts,
      },
      biometricsSummary: {
        totalSyncedWorkersToday: totalBiometricRecords,
        pendingOfflineQueue: this.gateways.reduce((s, g) => s + g.queuedPackets, 0),
      },
    };
  }

  // 2. Get Gateways
  getDevices() {
    return this.gateways;
  }

  // 3. Register Gateway
  registerDevice(dto: RegisterGatewayDto) {
    if (this.gateways.some((g) => g.gatewayId === dto.gatewayId)) {
      throw new BadRequestException(`Gateway dengan ID '${dto.gatewayId}' sudah terdaftar.`);
    }
    const created: EdgeGatewayDevice = {
      id: `${this.gateways.length + 1}`,
      gatewayId: dto.gatewayId,
      name: dto.name,
      deviceType: dto.deviceType,
      siteLocation: dto.siteLocation,
      protocol: dto.protocol,
      uplinkBackhaul: dto.uplinkBackhaul || '4G LTE / Starlink Failover',
      status: 'ONLINE',
      signalRssiDbm: -58,
      queuedPackets: 0,
      lastHeartbeatAt: new Date().toISOString(),
      firmwareVersion: 'v4.8.2-lts',
    };
    this.gateways.unshift(created);
    return {
      message: `Edge gateway '${dto.name}' berhasil didaftarkan.`,
      device: created,
    };
  }

  // 4. Weighbridge Tickets
  getWeighbridgeTickets() {
    return this.weighTickets;
  }

  // 5. Record Weighbridge Ticket
  recordWeighbridgeTicket(dto: RecordWeighbridgeDto) {
    if (dto.grossWeightKg <= dto.tareWeightKg) {
      throw new BadRequestException('Berat Bruto (grossWeightKg) harus lebih besar dari Berat Tara (tareWeightKg).');
    }
    const netWeightKg = dto.grossWeightKg - dto.tareWeightKg;
    const varianceKg = netWeightKg - dto.doExpectedNetKg;
    const variancePercent = Number(((varianceKg / dto.doExpectedNetKg) * 100).toFixed(2));
    const status =
      variancePercent < -1.0
        ? 'SHORTAGE_REJECTED'
        : variancePercent < -0.3
        ? 'TOLERANCE_WARNING'
        : 'MATCHED';

    const ticket: WeighbridgeTicket = {
      id: `wt-${Date.now()}`,
      ticketNumber: `WB-20261106-${String(this.weighTickets.length + 1).padStart(3, '0')}`,
      gatewayId: dto.gatewayId,
      licensePlate: dto.licensePlate,
      deliveryOrderNo: dto.deliveryOrderNo,
      materialName: dto.materialName,
      grossWeightKg: dto.grossWeightKg,
      tareWeightKg: dto.tareWeightKg,
      netWeightKg,
      doExpectedNetKg: dto.doExpectedNetKg,
      varianceKg,
      variancePercent,
      status,
      anprVerified: true,
      recordedAt: new Date().toISOString(),
    };
    this.weighTickets.unshift(ticket);
    return {
      message: `Tiket timbangan '${ticket.ticketNumber}' tercatat (${status}).`,
      ticket,
    };
  }

  // 6. Fleet Telematics
  getFleetTelematics() {
    return this.fleetUnits;
  }

  // 7. Ingest Telemetry
  ingestTelematics(dto: IngestTelematicsDto) {
    let unit = this.fleetUnits.find((u) => u.equipmentId === dto.equipmentId);
    if (!unit) {
      unit = {
        equipmentId: dto.equipmentId,
        unitName: dto.unitName,
        category: 'Heavy Equipment',
        siteZone: 'Zona Proyek Utama',
        engineState: dto.engineRpm > 900 ? 'RUNNING_LOAD' : dto.engineRpm > 0 ? 'IDLE' : 'OFF',
        engineRpm: dto.engineRpm,
        fuelBurnRateLph: dto.fuelBurnRateLph,
        fuelLevelPercent: dto.fuelLevelPercent,
        hourMeter: dto.hourMeter,
        geofenceStatus: 'INSIDE_ZONE',
        latitude: dto.latitude ?? -0.9721,
        longitude: dto.longitude ?? 116.7088,
        canBusProtocol: 'SAE J1939',
        lastTelemetryAt: new Date().toISOString(),
      };
      this.fleetUnits.unshift(unit);
    } else {
      unit.engineRpm = dto.engineRpm;
      unit.fuelBurnRateLph = dto.fuelBurnRateLph;
      unit.fuelLevelPercent = dto.fuelLevelPercent;
      unit.hourMeter = dto.hourMeter;
      unit.engineState = dto.engineRpm > 900 ? 'RUNNING_LOAD' : dto.engineRpm > 0 ? 'IDLE' : 'OFF';
      unit.lastTelemetryAt = new Date().toISOString();
    }

    let generatedAlert: FuelAnomalyAlert | null = null;
    if ((dto.suddenFuelDropLiters ?? 0) >= 15 && dto.engineRpm === 0) {
      generatedAlert = {
        id: `alert-fuel-${Date.now()}`,
        equipmentId: dto.equipmentId,
        unitName: dto.unitName,
        dropLiters: dto.suddenFuelDropLiters!,
        engineRpmAtEvent: dto.engineRpm,
        severity: dto.suddenFuelDropLiters! >= 30 ? 'CRITICAL' : 'HIGH',
        detectedAt: new Date().toISOString(),
        status: 'OPEN',
      };
      this.fuelAlerts.unshift(generatedAlert);
    }

    return {
      message: `Paket telematika CAN bus unit '${dto.equipmentId}' berhasil diproses.`,
      unit,
      fuelTheftAlertTriggered: Boolean(generatedAlert),
      alert: generatedAlert,
    };
  }

  // 8. Get Fuel Alerts
  getFuelAlerts() {
    return this.fuelAlerts;
  }

  // 9. Acknowledge Fuel Alert
  acknowledgeFuelAlert(dto: AcknowledgeFuelAlertDto) {
    const alert = this.fuelAlerts.find((a) => a.id === dto.alertId);
    if (!alert) {
      throw new NotFoundException(`Fuel alert dengan ID '${dto.alertId}' tidak ditemukan.`);
    }
    alert.status = 'ACKNOWLEDGED';
    alert.acknowledgedBy = dto.acknowledgedBy;
    alert.resolutionNotes = dto.resolutionNotes;
    return {
      message: `Anomali BBM '${alert.id}' telah diverifikasi oleh ${dto.acknowledgedBy}.`,
      alert,
    };
  }

  // 10. Get Biometric Logs
  getBiometricLogs() {
    return this.biometricBatches;
  }

  // 11. Sync Biometric Offline Batch
  syncBiometricBatch(dto: SyncBiometricBatchDto) {
    if (dto.recordsCount <= 0) {
      throw new BadRequestException('Jumlah record sinkronisasi harus lebih dari 0.');
    }
    const compliant = dto.helmetCompliantCount ?? dto.recordsCount;
    const batch: BiometricSyncBatch = {
      id: `bio-batch-${Date.now()}`,
      batchCode: `SYNC-${Date.now().toString().slice(-5)}`,
      gatewayId: dto.gatewayId,
      gateName: dto.gateName,
      recordsCount: dto.recordsCount,
      helmetCompliantCount: compliant,
      complianceRatePercent: Number(((compliant / dto.recordsCount) * 100).toFixed(2)),
      offlineDurationMinutes: 25,
      syncedAt: new Date().toISOString(),
      hashStatus: 'SHA256_VERIFIED',
    };
    this.biometricBatches.unshift(batch);

    const gw = this.gateways.find((g) => g.gatewayId === dto.gatewayId);
    if (gw) {
      gw.queuedPackets = 0;
      gw.status = 'ONLINE';
      gw.lastHeartbeatAt = new Date().toISOString();
    }

    return {
      message: `Sinkronisasi ${dto.recordsCount} log biometrik offline dari '${dto.gateName}' berhasil.`,
      batch,
    };
  }

  // 12. Ping / Heartbeat Gateway
  pingGateway(dto: PingGatewayDto) {
    const gw = this.gateways.find((g) => g.gatewayId === dto.gatewayId);
    if (!gw) {
      throw new NotFoundException(`Edge gateway '${dto.gatewayId}' tidak ditemukan.`);
    }
    gw.status = 'ONLINE';
    gw.lastHeartbeatAt = new Date().toISOString();
    return {
      message: `Heartbeat mTLS ke gateway '${gw.name}' responsif (RTT 18ms).`,
      gateway: gw,
      rttMs: 18,
    };
  }
}
