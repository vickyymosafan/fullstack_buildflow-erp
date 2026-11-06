import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DisasterRecoveryService } from './disaster-recovery.service';
import { CreatePartitionDto } from './dto/create-partition.dto';
import { ArchivePartitionDto } from './dto/archive-partition.dto';
import { SimulateFailoverDto } from './dto/simulate-failover.dto';
import { SimulatePitrDto } from './dto/simulate-pitr.dto';
import { PurgeCacheDto } from './dto/purge-cache.dto';
import { CertifyDrillDto } from './dto/certify-drill.dto';

@ApiTags('disaster-recovery')
@Controller('disaster-recovery')
export class DisasterRecoveryController {
  constructor(private readonly drService: DisasterRecoveryService) {}

  @Get('status')
  @ApiOperation({ summary: 'Mendapatkan status cluster HA, kesehatan replikasi, dan metrik RPO/RTO' })
  @ApiResponse({ status: 200, description: 'Status cluster dan DR berhasil diambil' })
  getClusterStatus() {
    return this.drService.getClusterStatus();
  }

  @Get('partitions')
  @ApiOperation({ summary: 'Daftar seluruh partisi database per tenant dan tahun anggaran' })
  @ApiResponse({ status: 200, description: 'Daftar partisi database' })
  getPartitions() {
    return this.drService.getPartitions();
  }

  @Post('partitions/create')
  @ApiOperation({ summary: 'Membuat/mempersiapkan skema partisi baru untuk tenant atau tahun buku' })
  @ApiResponse({ status: 201, description: 'Partisi baru berhasil dibuat' })
  createPartition(@Body() dto: CreatePartitionDto) {
    return this.drService.createPartition(dto);
  }

  @Post('partitions/archive')
  @ApiOperation({ summary: 'Melepaskan (detach) dan mengarsipkan partisi tahun buku lampau ke cold storage' })
  @ApiResponse({ status: 200, description: 'Partisi berhasil diarsipkan' })
  archivePartition(@Body() dto: ArchivePartitionDto) {
    return this.drService.archivePartition(dto);
  }

  @Get('replicas')
  @ApiOperation({ summary: 'Mendapatkan topologi master-replica, lag replikasi, dan status LSN' })
  @ApiResponse({ status: 200, description: 'Topologi replica cluster' })
  getReplicas() {
    return this.drService.getReplicas();
  }

  @Post('failover/simulate')
  @ApiOperation({ summary: 'Menjalankan simulasi failover otomatis dan promosi hot standby' })
  @ApiResponse({ status: 201, description: 'Simulasi failover selesai dieksekusi' })
  simulateFailover(@Body() dto: SimulateFailoverDto) {
    return this.drService.simulateFailover(dto);
  }

  @Get('cache/metrics')
  @ApiOperation({ summary: 'Mendapatkan metrik performa multi-tier Redis cache dan status distributed lock' })
  @ApiResponse({ status: 200, description: 'Metrik cache Redis' })
  getCacheMetrics() {
    return this.drService.getCacheMetrics();
  }

  @Post('cache/purge')
  @ApiOperation({ summary: 'Melakukan invalidasi cache terarah atau pembersihan total' })
  @ApiResponse({ status: 200, description: 'Cache berhasil dibersihkan' })
  purgeCache(@Body() dto: PurgeCacheDto) {
    return this.drService.purgeCache(dto);
  }

  @Get('pitr/snapshots')
  @ApiOperation({ summary: 'Daftar base snapshot dan status aliran continuous WAL archiving' })
  @ApiResponse({ status: 200, description: 'Daftar snapshot PITR' })
  getPitrSnapshots() {
    return this.drService.getPitrSnapshots();
  }

  @Post('pitr/simulate-restore')
  @ApiOperation({ summary: 'Menjalankan simulasi pemulihan Point-in-Time Recovery ke environment sandbox' })
  @ApiResponse({ status: 201, description: 'Simulasi pemulihan PITR selesai dieksekusi' })
  simulatePitrRestore(@Body() dto: SimulatePitrDto) {
    return this.drService.simulatePitrRestore(dto);
  }

  @Get('drills/history')
  @ApiOperation({ summary: 'Riwayat audit drill pemulihan bencana dan failover cluster' })
  @ApiResponse({ status: 200, description: 'Riwayat drill DR' })
  getDrillsHistory() {
    return this.drService.getDrillsHistory();
  }

  @Post('drills/certify')
  @ApiOperation({ summary: 'Penerbitan sertifikasi audit kepatuhan ISO 22301 / ISO 27001 untuk drill DR' })
  @ApiResponse({ status: 200, description: 'Drill berhasil disertifikasi' })
  certifyDrill(@Body() dto: CertifyDrillDto) {
    return this.drService.certifyDrill(dto);
  }
}

