import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePartitionDto } from './dto/create-partition.dto';
import { ArchivePartitionDto } from './dto/archive-partition.dto';
import { SimulateFailoverDto } from './dto/simulate-failover.dto';
import { SimulatePitrDto } from './dto/simulate-pitr.dto';
import { PurgeCacheDto } from './dto/purge-cache.dto';
import { CertifyDrillDto } from './dto/certify-drill.dto';

export interface ReplicaNode {
  id: string;
  name: string;
  role: 'primary' | 'standby_sync' | 'standby_async';
  location: string;
  endpoint: string;
  port: number;
  status: 'healthy' | 'degraded' | 'syncing' | 'offline';
  replicationLagBytes: number;
  replicationLagMs: number;
  currentLsn: string;
  replayLsn: string;
  isEligibleForPromotion: boolean;
  activeConnections: number;
  maxConnections: number;
}

export interface PartitionRecord {
  id: string;
  tenantId: string;
  tenantName: string;
  fiscalYear: number;
  schemaName: string;
  partitionKey: string;
  status: 'active' | 'detached' | 'archived_cold';
  tableCount: number;
  rowCount: number;
  diskSizeBytes: number;
  diskSizeFormatted: string;
  retentionMonths: number;
  lastVacuumAt: string;
  storageTarget: string;
  createdAt: string;
}

export interface RedisCacheMetrics {
  status: 'optimal' | 'degraded' | 'critical';
  hitRatioPercent: number;
  totalHits24h: number;
  totalMisses24h: number;
  usedMemoryBytes: number;
  usedMemoryFormatted: string;
  maxMemoryBytes: number;
  maxMemoryFormatted: string;
  memoryUsagePercent: number;
  evictionPolicy: string;
  evictedKeys24h: number;
  connectedClients: number;
  activeDistributedLocks: Array<{
    lockKey: string;
    resource: string;
    acquiredBy: string;
    ttlRemainingMs: number;
    acquiredAt: string;
  }>;
  keyStatsByTag: Array<{
    tag: string;
    keyCount: number;
    hitRatio: number;
    memoryKb: number;
  }>;
}

export interface PitrSnapshot {
  id: string;
  snapshotType: 'full_base' | 'incremental_wal';
  timestamp: string;
  walStartLsn: string;
  walEndLsn: string;
  sizeBytes: number;
  sizeFormatted: string;
  storageBucket: string;
  sha256Checksum: string;
  verificationStatus: 'verified' | 'verifying' | 'corrupted';
  retentionUntil: string;
}

export interface DisasterRecoveryDrill {
  id: string;
  drillCode: string;
  title: string;
  drillType: string;
  executedAt: string;
  durationSeconds: number;
  durationFormatted: string;
  targetNode: string;
  simulatedScenario: string;
  rpoAchievedSeconds: number;
  rtoAchievedSeconds: number;
  dataLossDetected: boolean;
  status: 'success' | 'warning' | 'failed';
  certified: boolean;
  complianceStandard?: string;
  auditorName?: string;
  certificationDate?: string;
  auditNotes?: string;
}

@Injectable()
export class DisasterRecoveryService {
  private primaryNode: ReplicaNode = {
    id: 'pg-primary-01',
    name: 'PostgreSQL Primary Cluster (Write Master)',
    role: 'primary',
    location: 'Jakarta Tier-IV Equinix JK1 Data Center',
    endpoint: 'db-master.buildflow.internal',
    port: 5432,
    status: 'healthy',
    replicationLagBytes: 0,
    replicationLagMs: 0,
    currentLsn: '0/1F992AC0',
    replayLsn: '0/1F992AC0',
    isEligibleForPromotion: false,
    activeConnections: 68,
    maxConnections: 500,
  };

  private replicaNodes: ReplicaNode[] = [
    {
      id: 'pg-replica-jkt-01',
      name: 'Read Replica 01 (Sync Hot Standby)',
      role: 'standby_sync',
      location: 'Jakarta Tier-IV DCI Cibitung H2',
      endpoint: 'db-ro-01.buildflow.internal',
      port: 5432,
      status: 'healthy',
      replicationLagBytes: 0,
      replicationLagMs: 8,
      currentLsn: '0/1F992AC0',
      replayLsn: '0/1F992AC0',
      isEligibleForPromotion: true,
      activeConnections: 42,
      maxConnections: 500,
    },
    {
      id: 'pg-replica-sby-01',
      name: 'Read Replica 02 (Async Regional Surabaya)',
      role: 'standby_async',
      location: 'Surabaya Tier-III Telkom Sigma DC',
      endpoint: 'db-ro-02.buildflow.internal',
      port: 5432,
      status: 'healthy',
      replicationLagBytes: 16384,
      replicationLagMs: 24,
      currentLsn: '0/1F992AC0',
      replayLsn: '0/1F98EB40',
      isEligibleForPromotion: true,
      activeConnections: 29,
      maxConnections: 500,
    },
    {
      id: 'pg-replica-ikn-01',
      name: 'Read Replica 03 (Async Nusantara Gov DC)',
      role: 'standby_async',
      location: 'IKN Nusantara Pusat Data Nasional (PDN)',
      endpoint: 'db-ro-03.buildflow.internal',
      port: 5432,
      status: 'healthy',
      replicationLagBytes: 65536,
      replicationLagMs: 42,
      currentLsn: '0/1F992AC0',
      replayLsn: '0/1F982000',
      isEligibleForPromotion: true,
      activeConnections: 18,
      maxConnections: 500,
    },
  ];

  private partitions: PartitionRecord[] = [
    {
      id: 'part-public-shared',
      tenantId: 'system_core',
      tenantName: 'Master Metadata & Shared Security Context',
      fiscalYear: 2026,
      schemaName: 'public',
      partitionKey: 'system_core',
      status: 'active',
      tableCount: 42,
      rowCount: 189420,
      diskSizeBytes: 1288490188,
      diskSizeFormatted: '1.20 GB',
      retentionMonths: 120,
      lastVacuumAt: '2026-11-06T18:00:00Z',
      storageTarget: 'local_nvme_raid10',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'part-adhimix-2026',
      tenantId: 'tenant_adhimix',
      tenantName: 'PT Adhimix Precast Indonesia (Ready-Mix & Beton)',
      fiscalYear: 2026,
      schemaName: 'tenant_adhimix_2026',
      partitionKey: 'fiscal_year',
      status: 'active',
      tableCount: 68,
      rowCount: 1420500,
      diskSizeBytes: 9019431321,
      diskSizeFormatted: '8.40 GB',
      retentionMonths: 84,
      lastVacuumAt: '2026-11-06T19:30:00Z',
      storageTarget: 'local_nvme_raid10',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'part-wika-2026',
      tenantId: 'tenant_wika',
      tenantName: 'PT Wijaya Karya (Persero) Tbk - KSO Tol Trans Sumatera',
      fiscalYear: 2026,
      schemaName: 'tenant_wika_2026',
      partitionKey: 'fiscal_year',
      status: 'active',
      tableCount: 68,
      rowCount: 2894200,
      diskSizeBytes: 15247133900,
      diskSizeFormatted: '14.20 GB',
      retentionMonths: 84,
      lastVacuumAt: '2026-11-06T20:15:00Z',
      storageTarget: 'local_nvme_raid10',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'part-hk-2026',
      tenantId: 'tenant_hk',
      tenantName: 'PT Hutama Karya (Persero) - Proyek EPC Bendungan Meninting',
      fiscalYear: 2026,
      schemaName: 'tenant_hk_2026',
      partitionKey: 'fiscal_year',
      status: 'active',
      tableCount: 68,
      rowCount: 2150300,
      diskSizeBytes: 12669871718,
      diskSizeFormatted: '11.80 GB',
      retentionMonths: 84,
      lastVacuumAt: '2026-11-06T21:00:00Z',
      storageTarget: 'local_nvme_raid10',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'part-adhimix-2024',
      tenantId: 'tenant_adhimix',
      tenantName: 'PT Adhimix Precast Indonesia (Arsip Audited 2024)',
      fiscalYear: 2024,
      schemaName: 'tenant_adhimix_2024',
      partitionKey: 'fiscal_year',
      status: 'archived_cold',
      tableCount: 68,
      rowCount: 3912000,
      diskSizeBytes: 19434856448,
      diskSizeFormatted: '18.10 GB',
      retentionMonths: 84,
      lastVacuumAt: '2025-01-10T12:00:00Z',
      storageTarget: 'cold_minio_s3 (AES-256 GZIP)',
      createdAt: '2024-01-01T00:00:00Z',
    },
  ];

  private cacheMetrics: RedisCacheMetrics = {
    status: 'optimal',
    hitRatioPercent: 96.84,
    totalHits24h: 3418290,
    totalMisses24h: 111580,
    usedMemoryBytes: 432013312,
    usedMemoryFormatted: '412.0 MB',
    maxMemoryBytes: 2147483648,
    maxMemoryFormatted: '2.0 GB',
    memoryUsagePercent: 20.12,
    evictionPolicy: 'allkeys-lru',
    evictedKeys24h: 0,
    connectedClients: 84,
    activeDistributedLocks: [
      {
        lockKey: 'redlock:disbursement:mandor-payroll-bca-091',
        resource: 'payroll_disbursement_batch',
        acquiredBy: 'worker-disbursement-pod-1',
        ttlRemainingMs: 3420,
        acquiredAt: '2026-11-06T23:10:14Z',
      },
      {
        lockKey: 'redlock:budget:rap-revision-toll-km42',
        resource: 'project_rap_baseline',
        acquiredBy: 'api-service-pod-3',
        ttlRemainingMs: 8120,
        acquiredAt: '2026-11-06T23:11:02Z',
      },
      {
        lockKey: 'redlock:inventory:stock-alloc-cement-jkt01',
        resource: 'warehouse_stock_movement',
        acquiredBy: 'worker-inventory-pod-2',
        ttlRemainingMs: 1980,
        acquiredAt: '2026-11-06T23:11:45Z',
      },
    ],
    keyStatsByTag: [
      { tag: 'contracts:clauses', keyCount: 4210, hitRatio: 98.4, memoryKb: 34120 },
      { tag: 'budget:rap', keyCount: 8940, hitRatio: 97.2, memoryKb: 89400 },
      { tag: 'treasury:pool', keyCount: 3120, hitRatio: 99.1, memoryKb: 18450 },
      { tag: 'inventory:stock', keyCount: 14200, hitRatio: 94.6, memoryKb: 124300 },
      { tag: 'auth:sessions', keyCount: 2210, hitRatio: 99.8, memoryKb: 12100 },
    ],
  };

  private pitrSnapshots: PitrSnapshot[] = [
    {
      id: 'snap-20261106-0000',
      snapshotType: 'full_base',
      timestamp: '2026-11-06T00:00:00Z',
      walStartLsn: '0/1D440000',
      walEndLsn: '0/1D880000',
      sizeBytes: 45204488192,
      sizeFormatted: '42.10 GB',
      storageBucket: 's3://buildflow-pitr-backups/full/2026-11-06/',
      sha256Checksum: '8f4c9a1e0b573d82a45c110294bfa2830f81d1e4c921345678abcdef01234567',
      verificationStatus: 'verified',
      retentionUntil: '2026-12-06T00:00:00Z',
    },
    {
      id: 'snap-20261105-0000',
      snapshotType: 'full_base',
      timestamp: '2026-11-05T00:00:00Z',
      walStartLsn: '0/1A220000',
      walEndLsn: '0/1A660000',
      sizeBytes: 44882411520,
      sizeFormatted: '41.80 GB',
      storageBucket: 's3://buildflow-pitr-backups/full/2026-11-05/',
      sha256Checksum: '3a1b8c7d9e0f21436587a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8',
      verificationStatus: 'verified',
      retentionUntil: '2026-12-05T00:00:00Z',
    },
    {
      id: 'snap-20261104-0000',
      snapshotType: 'full_base',
      timestamp: '2026-11-04T00:00:00Z',
      walStartLsn: '0/17000000',
      walEndLsn: '0/17440000',
      sizeBytes: 44238120960,
      sizeFormatted: '41.20 GB',
      storageBucket: 's3://buildflow-pitr-backups/full/2026-11-04/',
      sha256Checksum: '7c9e5a3f1d2b4c6e8a0f2b4d6e8a0c2e4f6a8c0e2b4d6a8c0e2b4d6f8a0c2e4a',
      verificationStatus: 'verified',
      retentionUntil: '2026-12-04T00:00:00Z',
    },
  ];

  private drillsHistory: DisasterRecoveryDrill[] = [
    {
      id: 'drill-20261028-01',
      drillCode: 'DR-DRILL-Q4-2026',
      title: 'Simulasi Bencana Data Center Jakarta & Switchover ke Cibitung',
      drillType: 'scheduled_switchover',
      executedAt: '2026-10-28T02:00:00Z',
      durationSeconds: 198,
      durationFormatted: '3m 18s',
      targetNode: 'pg-replica-jkt-01',
      simulatedScenario: 'Simulasi pemutusan jaringan fiber optik utama JK1. Failover otomatis via Raft Quorum consensus dan promosi Hot Standby Cibitung.',
      rpoAchievedSeconds: 14,
      rtoAchievedSeconds: 198,
      dataLossDetected: false,
      status: 'success',
      certified: true,
      complianceStandard: 'ISO 22301:2019 / ISO 27001',
      auditorName: 'BSI Group Indonesia Assurance',
      certificationDate: '2026-10-29T10:00:00Z',
      auditNotes: 'RPO terbukti 14 detik (ambang batas SLA < 300 detik), RTO terbukti 3m 18s (ambang batas SLA < 900 detik). Tidak ditemukan anomali konsistensi data transaksi akuntansi.',
    },
    {
      id: 'drill-20260715-01',
      drillCode: 'DR-DRILL-Q3-2026',
      title: 'Uji Coba Point-in-Time Recovery (PITR) Simulasi Ransomware Sandbox',
      drillType: 'pitr_sandbox_restoration',
      executedAt: '2026-07-15T03:30:00Z',
      durationSeconds: 254,
      durationFormatted: '4m 14s',
      targetNode: 'buildflow-pitr-sandbox-q3',
      simulatedScenario: 'Injeksi kerusakan data buatan pada 500 baris tabel SPK. Restorasi snapshot dasar + continuous WAL replay ke titik 30 detik sebelum anomali.',
      rpoAchievedSeconds: 22,
      rtoAchievedSeconds: 254,
      dataLossDetected: false,
      status: 'success',
      certified: true,
      complianceStandard: 'ISO 22301:2019',
      auditorName: 'PT TUV Rheinland Indonesia',
      certificationDate: '2026-07-16T14:00:00Z',
      auditNotes: 'Restorasi data sukses 100% dengan SHA-256 parity match pada seluruh 68 tabel tenant.',
    },
  ];

  // 1. Overall Status
  getClusterStatus() {
    const totalPartitions = this.partitions.length;
    const activePartitions = this.partitions.filter((p) => p.status === 'active').length;
    const archivedPartitions = this.partitions.filter((p) => p.status === 'archived_cold').length;
    const totalDiskSizeGB =
      this.partitions.reduce((acc, p) => acc + p.diskSizeBytes, 0) / (1024 * 1024 * 1024);

    return {
      clusterHealth: 'HEALTHY',
      haMode: 'Multi-Region Master-Replica with Raft Quorum',
      rpoStatus: {
        slaTargetSeconds: 300,
        currentLagSeconds: 38,
        compliance: 'COMPLIANT_EXCELLENT',
      },
      rtoStatus: {
        slaTargetSeconds: 900,
        estimatedRecoverySeconds: 252,
        compliance: 'COMPLIANT_EXCELLENT',
      },
      nodesSummary: {
        totalNodes: 4,
        healthyNodes: 4,
        primaryNodeId: this.primaryNode.id,
        replicasCount: this.replicaNodes.length,
      },
      partitionsSummary: {
        totalPartitions,
        activePartitions,
        archivedPartitions,
        totalDiskSizeGB: Number(totalDiskSizeGB.toFixed(2)),
      },
      redisSummary: {
        hitRatioPercent: this.cacheMetrics.hitRatioPercent,
        memoryUsagePercent: this.cacheMetrics.memoryUsagePercent,
        activeDistributedLocks: this.cacheMetrics.activeDistributedLocks.length,
      },
      walArchiving: {
        status: 'STREAMING',
        destinationBucket: 's3://buildflow-wal-archive/asia-southeast2/',
        latestArchiveLsn: '0/1F992000',
        encryption: 'AES-256 GCM',
      },
    };
  }

  // 2. Partitions List
  getPartitions() {
    return this.partitions;
  }

  // 3. Create Partition
  createPartition(dto: CreatePartitionDto) {
    const existing = this.partitions.find((p) => p.schemaName === dto.schemaName);
    if (existing) {
      throw new BadRequestException(`Schema partisi '${dto.schemaName}' sudah terdaftar.`);
    }

    const newPartition: PartitionRecord = {
      id: `part-${dto.tenantId.replace('tenant_', '')}-${dto.fiscalYear}`,
      tenantId: dto.tenantId,
      tenantName: dto.tenantName,
      fiscalYear: dto.fiscalYear,
      schemaName: dto.schemaName,
      partitionKey: dto.partitionKey,
      status: 'active',
      tableCount: dto.tables.length > 0 ? dto.tables.length : 68,
      rowCount: 0,
      diskSizeBytes: 268435456, // Initial 256MB
      diskSizeFormatted: '256.0 MB (Baru)',
      retentionMonths: dto.retentionMonths || 84,
      lastVacuumAt: new Date().toISOString(),
      storageTarget: 'local_nvme_raid10',
      createdAt: new Date().toISOString(),
    };

    this.partitions.unshift(newPartition);
    return {
      message: `Partisi multi-tenant untuk skema '${dto.schemaName}' berhasil diprovisi.`,
      partition: newPartition,
    };
  }

  // 4. Archive Partition
  archivePartition(dto: ArchivePartitionDto) {
    const partition = this.partitions.find((p) => p.id === dto.partitionId);
    if (!partition) {
      throw new NotFoundException(`Partisi dengan ID '${dto.partitionId}' tidak ditemukan.`);
    }

    partition.status = 'archived_cold';
    partition.storageTarget = `${dto.targetStorage} (AES-256 GZIP)`;

    return {
      message: `Partisi '${partition.schemaName}' berhasil di-detach dan dialokasikan ke penyimpanan arsip '${dto.targetStorage}'.`,
      partition,
      archivedBy: dto.authorizedBy,
      reason: dto.reason,
      archivedAt: new Date().toISOString(),
    };
  }

  // 5. Replicas List
  getReplicas() {
    return {
      primary: this.primaryNode,
      replicas: this.replicaNodes,
    };
  }

  // 6. Simulate Failover
  simulateFailover(dto: SimulateFailoverDto) {
    const target = this.replicaNodes.find((r) => r.id === dto.targetReplicaId);
    if (!target) {
      throw new NotFoundException(`Replica dengan ID '${dto.targetReplicaId}' tidak ditemukan.`);
    }

    if (!target.isEligibleForPromotion && !dto.forcePromotion) {
      throw new BadRequestException(`Replica '${target.name}' belum memenuhi syarat promosi tanpa flag forcePromotion.`);
    }

    const drillRecord: DisasterRecoveryDrill = {
      id: `drill-${Date.now()}`,
      drillCode: `DR-FAILOVER-${Date.now().toString().slice(-4)}`,
      title: `Simulasi Failover Otomatis ke ${target.name}`,
      drillType: dto.drillType,
      executedAt: new Date().toISOString(),
      durationSeconds: (dto.gracefulDrainSeconds || 5) + 12,
      durationFormatted: `${(dto.gracefulDrainSeconds || 5) + 12} detik`,
      targetNode: target.id,
      simulatedScenario: `Drain koneksi aktif write selama ${dto.gracefulDrainSeconds || 5}s, verifikasi keselarasan LSN (${target.currentLsn}), eksekusi Raft promotion, dan reroute DNS write pool.`,
      rpoAchievedSeconds: Math.round(target.replicationLagMs / 1000),
      rtoAchievedSeconds: (dto.gracefulDrainSeconds || 5) + 12,
      dataLossDetected: false,
      status: 'success',
      certified: false,
    };

    this.drillsHistory.unshift(drillRecord);

    return {
      message: `Simulasi failover ke node '${target.name}' sukses tanpa data loss.`,
      targetNode: target.name,
      oldPrimary: this.primaryNode.name,
      rpoAchievedSeconds: drillRecord.rpoAchievedSeconds,
      rtoAchievedSeconds: drillRecord.rtoAchievedSeconds,
      drillResult: drillRecord,
    };
  }

  // 7. Cache Metrics
  getCacheMetrics() {
    return this.cacheMetrics;
  }

  // 8. Purge Cache
  purgeCache(dto: PurgeCacheDto) {
    const purgedKeysCount =
      dto.scope === 'all'
        ? 84210
        : dto.scope === 'tag'
        ? 4210
        : 1250;

    return {
      message: `Cache Redis berhasil dibersihkan untuk cakupan '${dto.scope}'${dto.targetTag ? ` [Tag: ${dto.targetTag}]` : ''}.`,
      purgedKeysCount,
      timestamp: new Date().toISOString(),
      reason: dto.reason,
      newMemoryUsagePercent: dto.scope === 'all' ? 2.5 : 18.4,
    };
  }

  // 9. PITR Snapshots
  getPitrSnapshots() {
    return {
      snapshots: this.pitrSnapshots,
      walStreamingStatus: {
        status: 'ONLINE_ACTIVE',
        currentLsn: this.primaryNode.currentLsn,
        walArchiveLagSeconds: 12,
        continuousArchiving: true,
      },
    };
  }

  // 10. Simulate PITR Restore
  simulatePitrRestore(dto: SimulatePitrDto) {
    const snapshot = this.pitrSnapshots.find((s) => s.id === dto.sourceSnapshotId) || this.pitrSnapshots[0];
    const targetDate = new Date(dto.targetTimestamp);
    const snapDate = new Date(snapshot.timestamp);
    const diffMinutes = Math.max(1, Math.round((targetDate.getTime() - snapDate.getTime()) / (60 * 1000)));

    const restoredDrill: DisasterRecoveryDrill = {
      id: `drill-${Date.now()}`,
      drillCode: `PITR-RESTORE-${Date.now().toString().slice(-4)}`,
      title: `Simulasi Pemulihan PITR ke Waktu ${dto.targetTimestamp}`,
      drillType: 'pitr_sandbox_restoration',
      executedAt: new Date().toISOString(),
      durationSeconds: 185,
      durationFormatted: '3m 05s',
      targetNode: dto.sandboxInstanceName,
      simulatedScenario: `Mengunduh base snapshot '${snapshot.id}' (${snapshot.sizeFormatted}) dan mengaplikasikan ${diffMinutes * 4} segmen WAL kontinu hingga target LSN.`,
      rpoAchievedSeconds: 18,
      rtoAchievedSeconds: 185,
      dataLossDetected: false,
      status: 'success',
      certified: false,
    };

    this.drillsHistory.unshift(restoredDrill);

    return {
      message: `Simulasi pemulihan Point-in-Time Recovery (PITR) ke sandbox '${dto.sandboxInstanceName}' sukses.`,
      restorationDetails: {
        targetTimestamp: dto.targetTimestamp,
        baseSnapshotId: snapshot.id,
        walSegmentsReplayed: diffMinutes * 4,
        sandboxEndpoint: `${dto.sandboxInstanceName}.internal.buildflow:5433`,
        checksumVerification: dto.verifyChecksums ? 'PASS_MATCHED (SHA-256 Parity 100%)' : 'SKIPPED',
        timeElapsedSeconds: 185,
      },
      drillResult: restoredDrill,
    };
  }

  // 11. Drills History
  getDrillsHistory() {
    return this.drillsHistory;
  }

  // 12. Certify Drill
  certifyDrill(dto: CertifyDrillDto) {
    const drill = this.drillsHistory.find((d) => d.id === dto.drillId);
    if (!drill) {
      throw new NotFoundException(`Drill dengan ID '${dto.drillId}' tidak ditemukan.`);
    }

    drill.certified = true;
    drill.complianceStandard = dto.complianceStandard;
    drill.auditorName = dto.auditorName;
    drill.certificationDate = new Date().toISOString();
    drill.auditNotes = dto.notes || `Disahkan memenuhi standar ketat ${dto.complianceStandard}`;

    return {
      message: `Drill '${drill.drillCode}' berhasil disertifikasi sesuai standar '${dto.complianceStandard}'.`,
      certifiedDrill: drill,
    };
  }
}

