import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { CreateEquipmentLogDto } from './dto/create-equipment-log.dto';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateEquipmentStatusDto } from './dto/update-equipment-status.dto';

@Injectable()
export class EquipmentService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  private async getProjectId(projectCode?: string): Promise<string> {
    if (projectCode) {
      const p = await this.prisma.project.findFirst({ where: { projectCode } });
      if (p) return p.id;
    }
    const defaultProject = await this.prisma.project.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    if (!defaultProject) {
      throw new NotFoundException('Tidak ada proyek aktif yang ditemukan');
    }
    return defaultProject.id;
  }

  async onModuleInit() {
    const project = await this.prisma.project.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (project) {
      // 1. Seed Equipment Master if none exist
      const equipmentCount = await this.prisma.inspection.count({
        where: { category: 'FLEET_EQUIPMENT' },
      });

      if (equipmentCount === 0) {
        // Equipment 1: Tower Crane Liebherr
        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Tower Crane Liebherr 550 EC-H 20 Litronic',
            category: 'FLEET_EQUIPMENT',
            status: 'OPERATIONAL',
            severity: 'LIFTING_CRANE',
            location: 'Tower Utama Zona A',
            inspectorName: 'Hariyanto, S.T. (Operator Kelas 1)',
            score: 2486.0, // Current Hour Meter (HM)
            ncrNumber: 'EQ-TC-01',
            actionPlan: 'Liebherr 550 EC-H 20 Litronic',
            notes: JSON.stringify({
              equipmentCode: 'EQ-TC-01',
              name: 'Tower Crane Liebherr 550 EC-H',
              category: 'LIFTING_CRANE',
              brandModel: 'Liebherr 550 EC-H 20 Litronic',
              serialNumber: 'SN-TC-889102',
              year: 2022,
              ownership: 'INTERNAL',
              vendorName: null,
              hourlyRentalRate: 0,
              operatorName: 'Hariyanto, S.T.',
              sioNumber: 'SIO-01.5542-DEPNAKER/2024',
              siloNumber: 'SILO-TC-09912-DISNAKER/2025',
              siloExpiryDate: '2027-02-15',
              initialHourMeter: 2450.0,
              currentHourMeter: 2486.0,
              location: 'Tower Utama Zona A',
              fuelCapacity: 500,
              maintenanceIntervalHours: 250,
              lastServiceHourMeter: 2250.0,
              nextServiceHourMeter: 2500.0,
            }),
          },
        });

        // Equipment 2: Hydraulic Excavator CAT 320D
        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Hydraulic Excavator Caterpillar 320D Series 3',
            category: 'FLEET_EQUIPMENT',
            status: 'OPERATIONAL',
            severity: 'EARTHMOVING',
            location: 'Area Basement & Retaining Wall',
            inspectorName: 'Joko Widodo (Operator K3)',
            score: 1654.5, // Current HM
            ncrNumber: 'EQ-EXC-02',
            actionPlan: 'Caterpillar 320D Series 3',
            notes: JSON.stringify({
              equipmentCode: 'EQ-EXC-02',
              name: 'Hydraulic Excavator CAT 320D',
              category: 'EARTHMOVING',
              brandModel: 'Caterpillar 320D Series 3',
              serialNumber: 'SN-CAT-320D-9941',
              year: 2023,
              ownership: 'INTERNAL',
              vendorName: null,
              hourlyRentalRate: 0,
              operatorName: 'Joko Widodo',
              sioNumber: 'SIO-02.8831-DEPNAKER/2023',
              siloNumber: 'SILO-EXC-04412-DISNAKER/2025',
              siloExpiryDate: '2026-12-10',
              initialHourMeter: 1620.0,
              currentHourMeter: 1654.5,
              location: 'Area Basement & Retaining Wall',
              fuelCapacity: 410,
              maintenanceIntervalHours: 250,
              lastServiceHourMeter: 1500.0,
              nextServiceHourMeter: 1750.0,
            }),
          },
        });

        // Equipment 3: Mobile Concrete Pump Putzmeister BSF 36
        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Mobile Concrete Pump Putzmeister BSF 36-4.16 H',
            category: 'FLEET_EQUIPMENT',
            status: 'MAINTENANCE',
            severity: 'CONCRETE',
            location: 'Zona Pengecoran Podium B',
            inspectorName: 'Agus Riyadi (Operator K3)',
            score: 3144.0, // Current HM
            ncrNumber: 'EQ-CP-03',
            actionPlan: 'Putzmeister BSF 36-4.16 H',
            notes: JSON.stringify({
              equipmentCode: 'EQ-CP-03',
              name: 'Mobile Concrete Pump Putzmeister BSF 36',
              category: 'CONCRETE',
              brandModel: 'Putzmeister BSF 36-4.16 H',
              serialNumber: 'SN-PM-36-7712',
              year: 2021,
              ownership: 'RENTAL',
              vendorName: 'PT Pionirbeton Perkasa',
              hourlyRentalRate: 650000,
              operatorName: 'Agus Riyadi',
              sioNumber: 'SIO-03.4411-DEPNAKER/2024',
              siloNumber: 'SILO-CP-08819-DISNAKER/2024',
              siloExpiryDate: '2026-03-25',
              initialHourMeter: 3120.0,
              currentHourMeter: 3144.0,
              location: 'Zona Pengecoran Podium B',
              fuelCapacity: 300,
              maintenanceIntervalHours: 250,
              lastServiceHourMeter: 3000.0,
              nextServiceHourMeter: 3250.0,
            }),
          },
        });

        // Equipment 4: Genset Silent Perkins 150 kVA
        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Genset Silent Perkins 150 kVA Stamford',
            category: 'FLEET_EQUIPMENT',
            status: 'OPERATIONAL',
            severity: 'POWER_GENERATOR',
            location: 'Power House Sentral',
            inspectorName: 'Suparno (M&E Team)',
            score: 878.0, // Current HM
            ncrNumber: 'EQ-GEN-04',
            actionPlan: 'Perkins 1106A-70TG1 Stamford',
            notes: JSON.stringify({
              equipmentCode: 'EQ-GEN-04',
              name: 'Genset Silent Perkins 150 kVA',
              category: 'POWER_GENERATOR',
              brandModel: 'Perkins 1106A-70TG1 Stamford',
              serialNumber: 'SN-PK-150-5510',
              year: 2024,
              ownership: 'INTERNAL',
              vendorName: null,
              hourlyRentalRate: 0,
              operatorName: 'Suparno',
              sioNumber: 'SIO-04.1192-DEPNAKER/2025',
              siloNumber: 'SILO-GEN-01142-DISNAKER/2026',
              siloExpiryDate: '2027-08-30',
              initialHourMeter: 840.0,
              currentHourMeter: 878.0,
              location: 'Power House Sentral',
              fuelCapacity: 350,
              maintenanceIntervalHours: 250,
              lastServiceHourMeter: 750.0,
              nextServiceHourMeter: 1000.0,
            }),
          },
        });
      }

      // 2. Seed Daily Logs if none exist
      const logCount = await this.prisma.inspection.count({
        where: { category: 'EQUIPMENT_LOG' },
      });

      if (logCount === 0) {
        const fleetTC = await this.prisma.inspection.findFirst({
          where: { category: 'FLEET_EQUIPMENT', ncrNumber: 'EQ-TC-01' },
        });
        const fleetEXC = await this.prisma.inspection.findFirst({
          where: { category: 'FLEET_EQUIPMENT', ncrNumber: 'EQ-EXC-02' },
        });
        const fleetCP = await this.prisma.inspection.findFirst({
          where: { category: 'FLEET_EQUIPMENT', ncrNumber: 'EQ-CP-03' },
        });
        const fleetGEN = await this.prisma.inspection.findFirst({
          where: { category: 'FLEET_EQUIPMENT', ncrNumber: 'EQ-GEN-04' },
        });

        // Log 1: TC-01
        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Log Harian EQ-TC-01 (Tower Crane Liebherr)',
            category: 'EQUIPMENT_LOG',
            status: 'VERIFIED',
            severity: 'LOG',
            location: 'Tower Utama Zona A',
            inspectorName: 'Hariyanto, S.T.',
            score: 8.0, // Operating hours
            ncrNumber: 'LOG-20260301-TC01',
            actionPlan: 'Pengangkatan baja tulangan kolom & formwork lantai 8',
            notes: JSON.stringify({
              equipmentId: fleetTC?.id || 'fleet-tc-01',
              equipmentCode: 'EQ-TC-01',
              equipmentName: 'Tower Crane Liebherr 550 EC-H',
              date: '2026-03-01',
              shift: 'Pagi',
              startHourMeter: 2478.0,
              endHourMeter: 2486.0,
              operatingHours: 7.0,
              idleHours: 1.0,
              fuelAddedLiters: 95.0,
              operatorName: 'Hariyanto, S.T.',
              workDescription: 'Pengangkatan baja tulangan kolom & formwork lantai 8',
              location: 'Tower Utama Zona A',
              fuelEfficiency: 13.57, // Liters / operating hour
            }),
          },
        });

        // Log 2: EXC-02
        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Log Harian EQ-EXC-02 (Excavator CAT 320D)',
            category: 'EQUIPMENT_LOG',
            status: 'VERIFIED',
            severity: 'LOG',
            location: 'Area Basement & Retaining Wall',
            inspectorName: 'Joko Widodo',
            score: 7.5, // Operating hours
            ncrNumber: 'LOG-20260301-EXC02',
            actionPlan: 'Galian drainase keliling retaining wall zona timur',
            notes: JSON.stringify({
              equipmentId: fleetEXC?.id || 'fleet-exc-02',
              equipmentCode: 'EQ-EXC-02',
              equipmentName: 'Hydraulic Excavator CAT 320D',
              date: '2026-03-01',
              shift: 'Pagi',
              startHourMeter: 1647.0,
              endHourMeter: 1654.5,
              operatingHours: 6.5,
              idleHours: 1.0,
              fuelAddedLiters: 130.0,
              operatorName: 'Joko Widodo',
              workDescription: 'Galian drainase keliling retaining wall zona timur',
              location: 'Area Basement & Retaining Wall',
              fuelEfficiency: 20.0, // Liters / hour
            }),
          },
        });

        // Log 3: CP-03
        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Log Harian EQ-CP-03 (Concrete Pump Putzmeister)',
            category: 'EQUIPMENT_LOG',
            status: 'VERIFIED',
            severity: 'LOG',
            location: 'Zona Pengecoran Podium B',
            inspectorName: 'Agus Riyadi',
            score: 6.0,
            ncrNumber: 'LOG-20260228-CP03',
            actionPlan: 'Pengecoran slab podium zona B volume 95 m3',
            notes: JSON.stringify({
              equipmentId: fleetCP?.id || 'fleet-cp-03',
              equipmentCode: 'EQ-CP-03',
              equipmentName: 'Mobile Concrete Pump Putzmeister BSF 36',
              date: '2026-02-28',
              shift: 'Siang',
              startHourMeter: 3138.0,
              endHourMeter: 3144.0,
              operatingHours: 5.0,
              idleHours: 1.0,
              fuelAddedLiters: 85.0,
              operatorName: 'Agus Riyadi',
              workDescription: 'Pengecoran slab podium zona B volume 95 m3',
              location: 'Zona Pengecoran Podium B',
              fuelEfficiency: 17.0, // Liters / hour
            }),
          },
        });

        // Log 4: GEN-04
        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Log Harian EQ-GEN-04 (Genset Perkins 150 kVA)',
            category: 'EQUIPMENT_LOG',
            status: 'VERIFIED',
            severity: 'LOG',
            location: 'Power House Sentral',
            inspectorName: 'Suparno',
            score: 8.0,
            ncrNumber: 'LOG-20260301-GEN04',
            actionPlan: 'Suplai daya malam untuk crane, penerangan & submersible pumps',
            notes: JSON.stringify({
              equipmentId: fleetGEN?.id || 'fleet-gen-04',
              equipmentCode: 'EQ-GEN-04',
              equipmentName: 'Genset Silent Perkins 150 kVA',
              date: '2026-03-01',
              shift: 'Malam',
              startHourMeter: 870.0,
              endHourMeter: 878.0,
              operatingHours: 8.0,
              idleHours: 0.0,
              fuelAddedLiters: 110.0,
              operatorName: 'Suparno',
              workDescription: 'Suplai daya malam untuk crane, penerangan & submersible pumps',
              location: 'Power House Sentral',
              fuelEfficiency: 13.75, // Liters / hour
            }),
          },
        });
      }

      // 3. Seed Maintenance Records if none exist
      const maintenanceCount = await this.prisma.inspection.count({
        where: { category: 'EQUIPMENT_MAINTENANCE' },
      });

      if (maintenanceCount === 0) {
        const fleetTC = await this.prisma.inspection.findFirst({
          where: { category: 'FLEET_EQUIPMENT', ncrNumber: 'EQ-TC-01' },
        });
        const fleetCP = await this.prisma.inspection.findFirst({
          where: { category: 'FLEET_EQUIPMENT', ncrNumber: 'EQ-CP-03' },
        });
        const fleetEXC = await this.prisma.inspection.findFirst({
          where: { category: 'FLEET_EQUIPMENT', ncrNumber: 'EQ-EXC-02' },
        });

        // Maintenance 1: Scheduled Servis 250 HM Tower Crane
        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Jadwal Pemeliharaan Berkala 250 HM - Tower Crane Liebherr',
            category: 'EQUIPMENT_MAINTENANCE',
            status: 'SCHEDULED',
            severity: 'PREVENTIVE_250_HM',
            location: 'Tower Utama Zona A',
            inspectorName: 'Tim Servis Liebherr Indonesia',
            score: 2500.0, // Scheduled HM
            ncrNumber: 'MNT-2026-001',
            actionPlan: 'Ganti filter oli hidrolik & grease slewing gear',
            notes: JSON.stringify({
              equipmentId: fleetTC?.id || 'fleet-tc-01',
              equipmentCode: 'EQ-TC-01',
              equipmentName: 'Tower Crane Liebherr 550 EC-H',
              serviceType: 'PREVENTIVE_250_HM',
              scheduledDate: '2026-03-15',
              scheduledHourMeter: 2500.0,
              actualDate: null,
              actualHourMeter: null,
              technicianVendor: 'Tim Servis Liebherr Indonesia',
              cost: 7500000,
              sparePartsReplaced: ['Filter Oli Hidrolik', 'Grease Slewing Bearing EP-2', 'Filter Udara'],
              notes: 'Servis rutin 250 jam mencakup pengecekan wire rope hoist, torsi baut pin mast section, dan kalibrasi load moment indicator (LMI)',
              status: 'SCHEDULED',
            }),
          },
        });

        // Maintenance 2: In-Progress Repair Concrete Pump
        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Perbaikan Korektif Silinder & Wear Plate - Concrete Pump Putzmeister',
            category: 'EQUIPMENT_MAINTENANCE',
            status: 'IN_PROGRESS',
            severity: 'CORRECTIVE_REPAIR',
            location: 'Workshop PT Pionirbeton Perkasa',
            inspectorName: 'Workshop PT Pionirbeton',
            score: 3144.0, // Current HM
            ncrNumber: 'MNT-2026-002',
            actionPlan: 'Penggantian wearing ring, cutting ring & pembersihan delivery cylinder',
            notes: JSON.stringify({
              equipmentId: fleetCP?.id || 'fleet-cp-03',
              equipmentCode: 'EQ-CP-03',
              equipmentName: 'Mobile Concrete Pump Putzmeister BSF 36',
              serviceType: 'CORRECTIVE_REPAIR',
              scheduledDate: '2026-03-01',
              scheduledHourMeter: 3144.0,
              actualDate: '2026-03-02',
              actualHourMeter: 3144.0,
              technicianVendor: 'Workshop PT Pionirbeton Perkasa',
              cost: 14200000,
              sparePartsReplaced: ['Cutting Ring Tungsten Carbide', 'Spectacle Wear Plate', 'Piston Seal 230mm'],
              notes: 'Penggantian wear plate dan ring pompa beton karena keausan gesek material slurry cor agregat kasar',
              status: 'IN_PROGRESS',
            }),
          },
        });

        // Maintenance 3: Completed Servis 500 HM Excavator
        await this.prisma.inspection.create({
          data: {
            projectId: project.id,
            title: 'Servis Berkala 500 HM Selesai - Hydraulic Excavator CAT 320D',
            category: 'EQUIPMENT_MAINTENANCE',
            status: 'COMPLETED',
            severity: 'PREVENTIVE_500_HM',
            location: 'Area Basement & Retaining Wall',
            inspectorName: 'Trakindo Utama Site Support',
            score: 1502.0, // Actual completed HM
            ncrNumber: 'MNT-2026-003',
            actionPlan: 'Penggantian oli mesin, filter solar primer/sekunder, dan pembersihan radiator cooler',
            notes: JSON.stringify({
              equipmentId: fleetEXC?.id || 'fleet-exc-02',
              equipmentCode: 'EQ-EXC-02',
              equipmentName: 'Hydraulic Excavator CAT 320D',
              serviceType: 'PREVENTIVE_500_HM',
              scheduledDate: '2026-02-10',
              scheduledHourMeter: 1500.0,
              actualDate: '2026-02-11',
              actualHourMeter: 1502.0,
              technicianVendor: 'Trakindo Utama Site Support',
              cost: 11800000,
              sparePartsReplaced: ['Oli Mesin CAT DEO 15W-40 30L', 'Filter Oli Mesin', 'Filter Solar Primer & Sekunder', 'Filter Udara Radial Seal'],
              notes: 'Servis berkala 500 jam selesai dan unit lulus uji fungsi tekanan hidrolik standar pabrikan',
              status: 'COMPLETED',
            }),
          },
        });
      }
    }
  }

  // 1. Get KPI Summary
  async getSummary(projectCode?: string) {
    const projectId = await this.getProjectId(projectCode);

    const fleetRecords = await this.prisma.inspection.findMany({
      where: { projectId, category: 'FLEET_EQUIPMENT' },
    });

    const logRecords = await this.prisma.inspection.findMany({
      where: { projectId, category: 'EQUIPMENT_LOG' },
    });

    const maintenanceRecords = await this.prisma.inspection.findMany({
      where: { projectId, category: 'EQUIPMENT_MAINTENANCE' },
    });

    const totalEquipment = fleetRecords.length;
    const operationalCount = fleetRecords.filter((r) => r.status === 'OPERATIONAL').length;
    const maintenanceCount = fleetRecords.filter((r) => r.status === 'MAINTENANCE').length;
    const standbyCount = fleetRecords.filter((r) => r.status === 'STANDBY').length;
    const breakdownCount = fleetRecords.filter((r) => r.status === 'BREAKDOWN').length;

    let internalCount = 0;
    let rentalCount = 0;
    let totalHourMeter = 0;
    let siloValidCount = 0;
    let siloExpiringCount = 0;

    const today = new Date();
    const thirtyDaysAhead = new Date();
    thirtyDaysAhead.setDate(today.getDate() + 30);

    for (const item of fleetRecords) {
      totalHourMeter += item.score || 0;
      let parsed: any = {};
      try {
        parsed = item.notes ? JSON.parse(item.notes) : {};
      } catch {
        parsed = {};
      }

      if (parsed.ownership === 'RENTAL') {
        rentalCount++;
      } else {
        internalCount++;
      }

      if (parsed.siloExpiryDate) {
        const expiry = new Date(parsed.siloExpiryDate);
        if (expiry > thirtyDaysAhead) {
          siloValidCount++;
        } else {
          siloExpiringCount++;
        }
      } else {
        siloValidCount++;
      }
    }

    let totalOperatingHours = 0;
    let totalFuelLiters = 0;

    for (const log of logRecords) {
      let parsed: any = {};
      try {
        parsed = log.notes ? JSON.parse(log.notes) : {};
      } catch {
        parsed = {};
      }
      totalOperatingHours += parsed.operatingHours || 0;
      totalFuelLiters += parsed.fuelAddedLiters || 0;
    }

    const averageFuelConsumption =
      totalOperatingHours > 0
        ? parseFloat((totalFuelLiters / totalOperatingHours).toFixed(2))
        : 0;

    const siloCompliancePercent =
      totalEquipment > 0
        ? Math.round((siloValidCount / totalEquipment) * 100)
        : 100;

    return {
      totalEquipment,
      operationalCount,
      maintenanceCount,
      standbyCount,
      breakdownCount,
      internalCount,
      rentalCount,
      totalHourMeter: parseFloat(totalHourMeter.toFixed(1)),
      totalOperatingHours: parseFloat(totalOperatingHours.toFixed(1)),
      totalFuelLiters: parseFloat(totalFuelLiters.toFixed(1)),
      averageFuelConsumption, // Liters per hour
      siloValidCount,
      siloExpiringCount,
      siloCompliancePercent,
      activeMaintenanceCount: maintenanceRecords.filter(
        (m) => m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS',
      ).length,
    };
  }

  // 2. Get Fleet List
  async getFleet(
    projectCode?: string,
    category?: string,
    status?: string,
    search?: string,
  ) {
    const projectId = await this.getProjectId(projectCode);
    const where: any = { projectId, category: 'FLEET_EQUIPMENT' };

    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (category && category !== 'ALL') {
      where.severity = category;
    }

    const records = await this.prisma.inspection.findMany({
      where,
      orderBy: { inspectedAt: 'desc' },
    });

    const parsed = records.map((r) => {
      let notesData: any = {};
      try {
        notesData = r.notes ? JSON.parse(r.notes) : {};
      } catch {
        notesData = {};
      }
      return {
        id: r.id,
        equipmentCode: r.ncrNumber || notesData.equipmentCode || 'EQ-00',
        name: notesData.name || r.title,
        category: r.severity || notesData.category || 'GENERAL',
        brandModel: r.actionPlan || notesData.brandModel || '',
        serialNumber: notesData.serialNumber || '',
        year: notesData.year || 2023,
        ownership: notesData.ownership || 'INTERNAL',
        vendorName: notesData.vendorName || null,
        hourlyRentalRate: notesData.hourlyRentalRate || 0,
        operatorName: notesData.operatorName || r.inspectorName,
        sioNumber: notesData.sioNumber || '',
        siloNumber: notesData.siloNumber || '',
        siloExpiryDate: notesData.siloExpiryDate || '',
        initialHourMeter: notesData.initialHourMeter || 0,
        currentHourMeter: r.score || notesData.currentHourMeter || 0,
        location: r.location || notesData.location || '',
        status: r.status,
        lastServiceHourMeter: notesData.lastServiceHourMeter || 0,
        nextServiceHourMeter: notesData.nextServiceHourMeter || 0,
        createdAt: r.inspectedAt,
        updatedAt: r.inspectedAt,
      };
    });

    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      return parsed.filter(
        (item) =>
          item.equipmentCode.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.brandModel.toLowerCase().includes(q) ||
          item.operatorName.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q),
      );
    }

    return parsed;
  }

  // 3. Get Equipment by ID
  async getEquipmentById(id: string) {
    const r = await this.prisma.inspection.findUnique({
      where: { id },
    });
    if (!r || r.category !== 'FLEET_EQUIPMENT') {
      throw new NotFoundException(`Alat berat dengan ID ${id} tidak ditemukan`);
    }

    let notesData: any = {};
    try {
      notesData = r.notes ? JSON.parse(r.notes) : {};
    } catch {
      notesData = {};
    }

    return {
      id: r.id,
      equipmentCode: r.ncrNumber || notesData.equipmentCode,
      name: notesData.name || r.title,
      category: r.severity || notesData.category,
      brandModel: r.actionPlan || notesData.brandModel,
      serialNumber: notesData.serialNumber,
      year: notesData.year,
      ownership: notesData.ownership,
      vendorName: notesData.vendorName,
      hourlyRentalRate: notesData.hourlyRentalRate,
      operatorName: notesData.operatorName || r.inspectorName,
      sioNumber: notesData.sioNumber,
      siloNumber: notesData.siloNumber,
      siloExpiryDate: notesData.siloExpiryDate,
      initialHourMeter: notesData.initialHourMeter,
      currentHourMeter: r.score,
      location: r.location,
      status: r.status,
      lastServiceHourMeter: notesData.lastServiceHourMeter,
      nextServiceHourMeter: notesData.nextServiceHourMeter,
      createdAt: r.inspectedAt,
      updatedAt: r.inspectedAt,
    };
  }

  // 4. Create Equipment
  async createEquipment(dto: CreateEquipmentDto) {
    const projectId = await this.getProjectId(dto.projectCode);

    const initialHM = Number(dto.initialHourMeter) || 0;
    const notesJson = JSON.stringify({
      equipmentCode: dto.equipmentCode,
      name: dto.name,
      category: dto.category,
      brandModel: dto.brandModel,
      serialNumber: dto.serialNumber || '',
      year: Number(dto.year) || new Date().getFullYear(),
      ownership: dto.ownership,
      vendorName: dto.vendorName || null,
      hourlyRentalRate: Number(dto.hourlyRentalRate) || 0,
      operatorName: dto.operatorName,
      sioNumber: dto.sioNumber,
      siloNumber: dto.siloNumber,
      siloExpiryDate: dto.siloExpiryDate,
      initialHourMeter: initialHM,
      currentHourMeter: initialHM,
      location: dto.location,
      fuelCapacity: 300,
      maintenanceIntervalHours: 250,
      lastServiceHourMeter: initialHM,
      nextServiceHourMeter: initialHM + 250,
    });

    const record = await this.prisma.inspection.create({
      data: {
        projectId,
        title: `${dto.name} (${dto.equipmentCode})`,
        category: 'FLEET_EQUIPMENT',
        status: dto.status || 'OPERATIONAL',
        severity: dto.category,
        location: dto.location,
        inspectorName: dto.operatorName,
        score: initialHM,
        ncrNumber: dto.equipmentCode,
        actionPlan: dto.brandModel,
        notes: notesJson,
      },
    });

    return {
      success: true,
      message: `Unit alat berat ${dto.equipmentCode} berhasil didaftarkan`,
      equipmentId: record.id,
      equipmentCode: dto.equipmentCode,
    };
  }

  // 5. Update Equipment Status
  async updateEquipmentStatus(id: string, dto: UpdateEquipmentStatusDto) {
    const r = await this.prisma.inspection.findUnique({ where: { id } });
    if (!r || r.category !== 'FLEET_EQUIPMENT') {
      throw new NotFoundException(`Alat berat dengan ID ${id} tidak ditemukan`);
    }

    let notesData: any = {};
    try {
      notesData = r.notes ? JSON.parse(r.notes) : {};
    } catch {
      notesData = {};
    }

    if (dto.currentHourMeter !== undefined) {
      notesData.currentHourMeter = Number(dto.currentHourMeter);
    }
    if (dto.currentLocation) {
      notesData.location = dto.currentLocation;
    }
    if (dto.notes) {
      notesData.statusNotes = dto.notes;
    }

    const updated = await this.prisma.inspection.update({
      where: { id },
      data: {
        status: dto.status,
        score: dto.currentHourMeter !== undefined ? Number(dto.currentHourMeter) : r.score,
        location: dto.currentLocation || r.location,
        notes: JSON.stringify(notesData),
      },
    });

    return {
      success: true,
      message: `Status unit ${r.ncrNumber} diperbarui menjadi ${dto.status}`,
      updatedStatus: updated.status,
      currentHourMeter: updated.score,
    };
  }

  // 6. Get Logs List
  async getLogs(
    projectCode?: string,
    equipmentCode?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const projectId = await this.getProjectId(projectCode);
    const where: any = { projectId, category: 'EQUIPMENT_LOG' };

    const records = await this.prisma.inspection.findMany({
      where,
      orderBy: { inspectedAt: 'desc' },
    });

    const parsed = records.map((r) => {
      let notesData: any = {};
      try {
        notesData = r.notes ? JSON.parse(r.notes) : {};
      } catch {
        notesData = {};
      }
      return {
        id: r.id,
        logNumber: r.ncrNumber || 'LOG-00',
        equipmentId: notesData.equipmentId || '',
        equipmentCode: notesData.equipmentCode || '',
        equipmentName: notesData.equipmentName || r.title,
        date: notesData.date || r.inspectedAt.toISOString().slice(0, 10),
        shift: notesData.shift || 'Pagi',
        startHourMeter: notesData.startHourMeter || 0,
        endHourMeter: notesData.endHourMeter || 0,
        operatingHours: Number(notesData.operatingHours) || Number(r.score) || 0,
        idleHours: Number(notesData.idleHours) || 0,
        fuelAddedLiters: Number(notesData.fuelAddedLiters) || 0,
        fuelEfficiency: Number(notesData.fuelEfficiency) || 0,
        operatorName: notesData.operatorName || r.inspectorName,
        workDescription: notesData.workDescription || r.actionPlan || '',
        location: r.location || notesData.location || '',
        status: r.status,
        createdAt: r.inspectedAt,
      };
    });

    return parsed.filter((item) => {
      if (equipmentCode && item.equipmentCode !== equipmentCode) return false;
      if (startDate && item.date < startDate) return false;
      if (endDate && item.date > endDate) return false;
      return true;
    });
  }

  // 7. Create Daily Log
  async createLog(dto: CreateEquipmentLogDto) {
    const projectId = await this.getProjectId(dto.projectCode);

    const operatingHours = Number(dto.operatingHours) || 0;
    const fuelAddedLiters = Number(dto.fuelAddedLiters) || 0;
    const fuelEfficiency =
      operatingHours > 0
        ? parseFloat((fuelAddedLiters / operatingHours).toFixed(2))
        : 0;

    const logNumber = `LOG-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${dto.equipmentCode}`;

    const notesJson = JSON.stringify({
      equipmentId: dto.equipmentId,
      equipmentCode: dto.equipmentCode,
      date: dto.date,
      shift: dto.shift,
      startHourMeter: Number(dto.startHourMeter) || 0,
      endHourMeter: Number(dto.endHourMeter) || 0,
      operatingHours,
      idleHours: Number(dto.idleHours) || 0,
      fuelAddedLiters,
      fuelEfficiency,
      operatorName: dto.operatorName,
      workDescription: dto.workDescription,
      location: dto.location,
    });

    const record = await this.prisma.inspection.create({
      data: {
        projectId,
        title: `Log Harian ${dto.equipmentCode} (${dto.date} - ${dto.shift})`,
        category: 'EQUIPMENT_LOG',
        status: 'VERIFIED',
        severity: 'LOG',
        location: dto.location,
        inspectorName: dto.operatorName,
        score: operatingHours,
        ncrNumber: logNumber,
        actionPlan: dto.workDescription,
        notes: notesJson,
      },
    });

    // Update equipment current hour meter
    const equipment = await this.prisma.inspection.findFirst({
      where: {
        projectId,
        category: 'FLEET_EQUIPMENT',
        OR: [{ id: dto.equipmentId }, { ncrNumber: dto.equipmentCode }],
      },
    });

    if (equipment) {
      let eqNotes: any = {};
      try {
        eqNotes = equipment.notes ? JSON.parse(equipment.notes) : {};
      } catch {
        eqNotes = {};
      }
      const newHM = Math.max(Number(dto.endHourMeter) || 0, equipment.score || 0);
      eqNotes.currentHourMeter = newHM;

      await this.prisma.inspection.update({
        where: { id: equipment.id },
        data: {
          score: newHM,
          notes: JSON.stringify(eqNotes),
        },
      });
    }

    return {
      success: true,
      message: `Log harian ${dto.equipmentCode} tanggal ${dto.date} berhasil dicatat`,
      logId: record.id,
      logNumber,
      operatingHours,
      fuelAddedLiters,
      fuelEfficiency,
    };
  }

  // 8. Get Maintenance Records
  async getMaintenance(
    projectCode?: string,
    equipmentCode?: string,
    status?: string,
  ) {
    const projectId = await this.getProjectId(projectCode);
    const where: any = { projectId, category: 'EQUIPMENT_MAINTENANCE' };

    if (status && status !== 'ALL') {
      where.status = status;
    }

    const records = await this.prisma.inspection.findMany({
      where,
      orderBy: { inspectedAt: 'desc' },
    });

    const parsed = records.map((r) => {
      let notesData: any = {};
      try {
        notesData = r.notes ? JSON.parse(r.notes) : {};
      } catch {
        notesData = {};
      }
      return {
        id: r.id,
        maintenanceNumber: r.ncrNumber || 'MNT-00',
        equipmentId: notesData.equipmentId || '',
        equipmentCode: notesData.equipmentCode || '',
        equipmentName: notesData.equipmentName || r.title,
        serviceType: r.severity || notesData.serviceType || 'PREVENTIVE',
        scheduledDate: notesData.scheduledDate || '',
        scheduledHourMeter: Number(notesData.scheduledHourMeter) || Number(r.score) || 0,
        actualDate: notesData.actualDate || null,
        actualHourMeter: Number(notesData.actualHourMeter) || null,
        technicianVendor: notesData.technicianVendor || r.inspectorName,
        cost: Number(notesData.cost) || 0,
        sparePartsReplaced: notesData.sparePartsReplaced || [],
        notes: notesData.notes || r.actionPlan || '',
        status: r.status,
        createdAt: r.inspectedAt,
      };
    });

    if (equipmentCode) {
      return parsed.filter((item) => item.equipmentCode === equipmentCode);
    }

    return parsed;
  }

  // 9. Create Maintenance Record
  async createMaintenance(dto: CreateMaintenanceDto) {
    const projectId = await this.getProjectId(dto.projectCode);
    const count = await this.prisma.inspection.count({
      where: { projectId, category: 'EQUIPMENT_MAINTENANCE' },
    });

    const maintenanceNumber = `MNT-2026-${String(count + 1).padStart(3, '0')}`;

    const notesJson = JSON.stringify({
      equipmentId: dto.equipmentId,
      equipmentCode: dto.equipmentCode,
      serviceType: dto.serviceType,
      scheduledDate: dto.scheduledDate,
      scheduledHourMeter: Number(dto.scheduledHourMeter) || 0,
      actualDate: dto.actualDate || null,
      actualHourMeter: dto.actualHourMeter ? Number(dto.actualHourMeter) : null,
      technicianVendor: dto.technicianVendor,
      cost: Number(dto.cost) || 0,
      sparePartsReplaced: dto.sparePartsReplaced || [],
      notes: dto.notes,
      status: dto.status || 'SCHEDULED',
    });

    const record = await this.prisma.inspection.create({
      data: {
        projectId,
        title: `Pemeliharaan ${dto.serviceType} - ${dto.equipmentCode}`,
        category: 'EQUIPMENT_MAINTENANCE',
        status: dto.status || 'SCHEDULED',
        severity: dto.serviceType,
        location: 'Workshop Pemeliharaan',
        inspectorName: dto.technicianVendor,
        score: Number(dto.scheduledHourMeter) || 0,
        ncrNumber: maintenanceNumber,
        actionPlan: dto.notes,
        notes: notesJson,
      },
    });

    return {
      success: true,
      message: `Jadwal pemeliharaan ${maintenanceNumber} untuk ${dto.equipmentCode} berhasil dibuat`,
      maintenanceId: record.id,
      maintenanceNumber,
      status: dto.status || 'SCHEDULED',
    };
  }

  // 10. Get Compliance (SILO & SIO) List
  async getCompliance(projectCode?: string) {
    const fleet = await this.getFleet(projectCode);
    const today = new Date();
    const thirtyDaysAhead = new Date();
    thirtyDaysAhead.setDate(today.getDate() + 30);

    return fleet.map((unit) => {
      let isSiloValid = true;
      let daysRemaining = 999;
      let siloStatus = 'VALID';

      if (unit.siloExpiryDate) {
        const expiry = new Date(unit.siloExpiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (daysRemaining < 0) {
          isSiloValid = false;
          siloStatus = 'EXPIRED';
        } else if (daysRemaining <= 30) {
          siloStatus = 'EXPIRING_SOON';
        } else {
          siloStatus = 'VALID';
        }
      }

      return {
        equipmentId: unit.id,
        equipmentCode: unit.equipmentCode,
        name: unit.name,
        category: unit.category,
        brandModel: unit.brandModel,
        operatorName: unit.operatorName,
        sioNumber: unit.sioNumber,
        sioStatus: 'VALID',
        siloNumber: unit.siloNumber,
        siloExpiryDate: unit.siloExpiryDate,
        daysRemaining,
        siloStatus,
        isSiloValid,
        location: unit.location,
        status: unit.status,
      };
    });
  }
}
