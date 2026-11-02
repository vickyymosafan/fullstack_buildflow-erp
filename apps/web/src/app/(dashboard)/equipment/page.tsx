"use client";

import { useState, useEffect } from "react";
import {
  Truck,
  Wrench,
  Fuel,
  Clock,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Plus,
  Search,
  RefreshCw,
  X,
  Check,
  Building,
  HardHat,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  Gauge,
  Activity,
  FileCheck2,
} from "lucide-react";

interface EquipmentSummary {
  totalEquipment: number;
  operationalCount: number;
  maintenanceCount: number;
  standbyCount: number;
  breakdownCount: number;
  internalCount: number;
  rentalCount: number;
  totalHourMeter: number;
  totalOperatingHours: number;
  totalFuelLiters: number;
  averageFuelConsumption: number;
  siloValidCount: number;
  siloExpiringCount: number;
  siloCompliancePercent: number;
  activeMaintenanceCount: number;
}

interface FleetItem {
  id: string;
  equipmentCode: string;
  name: string;
  category: string;
  brandModel: string;
  serialNumber?: string;
  year?: number;
  ownership: string;
  vendorName?: string | null;
  hourlyRentalRate?: number;
  operatorName: string;
  sioNumber: string;
  siloNumber: string;
  siloExpiryDate: string;
  initialHourMeter: number;
  currentHourMeter: number;
  location: string;
  status: string;
  lastServiceHourMeter?: number;
  nextServiceHourMeter?: number;
  createdAt: string;
}

interface LogItem {
  id: string;
  logNumber: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  date: string;
  shift: string;
  startHourMeter: number;
  endHourMeter: number;
  operatingHours: number;
  idleHours: number;
  fuelAddedLiters: number;
  fuelEfficiency: number;
  operatorName: string;
  workDescription: string;
  location: string;
  status: string;
  createdAt: string;
}

interface MaintenanceItem {
  id: string;
  maintenanceNumber: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  serviceType: string;
  scheduledDate: string;
  scheduledHourMeter: number;
  actualDate?: string | null;
  actualHourMeter?: number | null;
  technicianVendor: string;
  cost: number;
  sparePartsReplaced: string[];
  notes: string;
  status: string;
  createdAt: string;
}

interface ComplianceItem {
  equipmentId: string;
  equipmentCode: string;
  name: string;
  category: string;
  brandModel: string;
  operatorName: string;
  sioNumber: string;
  sioStatus: string;
  siloNumber: string;
  siloExpiryDate: string;
  daysRemaining: number;
  siloStatus: string;
  isSiloValid: boolean;
  location: string;
  status: string;
}

export default function EquipmentPage() {
  const [activeTab, setActiveTab] = useState<"fleet" | "logs" | "maintenance" | "compliance">("fleet");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data states
  const [summary, setSummary] = useState<EquipmentSummary>({
    totalEquipment: 4,
    operationalCount: 3,
    maintenanceCount: 1,
    standbyCount: 0,
    breakdownCount: 0,
    internalCount: 3,
    rentalCount: 1,
    totalHourMeter: 8162.5,
    totalOperatingHours: 26.5,
    totalFuelLiters: 420,
    averageFuelConsumption: 15.85,
    siloValidCount: 3,
    siloExpiringCount: 1,
    siloCompliancePercent: 75,
    activeMaintenanceCount: 2,
  });

  const [fleetList, setFleetList] = useState<FleetItem[]>([]);
  const [logsList, setLogsList] = useState<LogItem[]>([]);
  const [maintenanceList, setMaintenanceList] = useState<MaintenanceItem[]>([]);
  const [complianceList, setComplianceList] = useState<ComplianceItem[]>([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Modal states
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<FleetItem | null>(null);

  // Form states
  const [equipmentForm, setEquipmentForm] = useState({
    equipmentCode: "",
    name: "",
    category: "LIFTING_CRANE",
    brandModel: "",
    serialNumber: "",
    year: 2024,
    ownership: "INTERNAL",
    vendorName: "",
    hourlyRentalRate: 0,
    operatorName: "",
    sioNumber: "",
    siloNumber: "",
    siloExpiryDate: "",
    initialHourMeter: 100,
    location: "Zona Proyek Utama",
  });

  const [logForm, setLogForm] = useState({
    equipmentId: "",
    equipmentCode: "",
    date: new Date().toISOString().slice(0, 10),
    shift: "Pagi",
    startHourMeter: 0,
    endHourMeter: 0,
    operatingHours: 8,
    idleHours: 1,
    fuelAddedLiters: 80,
    operatorName: "",
    workDescription: "",
    location: "Zona A",
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    equipmentId: "",
    equipmentCode: "",
    serviceType: "PREVENTIVE_250_HM",
    scheduledDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    scheduledHourMeter: 2000,
    technicianVendor: "",
    cost: 5000000,
    sparePartsReplaced: "Filter Oli Hidrolik, Grease EP-2",
    notes: "",
  });

  const [statusForm, setStatusForm] = useState({
    status: "OPERATIONAL",
    notes: "",
    currentLocation: "",
    currentHourMeter: 0,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, fleetRes, logRes, mntRes, compRes] = await Promise.all([
        fetch("http://localhost:4000/api/v1/equipment/summary"),
        fetch("http://localhost:4000/api/v1/equipment/fleet"),
        fetch("http://localhost:4000/api/v1/equipment/logs"),
        fetch("http://localhost:4000/api/v1/equipment/maintenance"),
        fetch("http://localhost:4000/api/v1/equipment/compliance"),
      ]);

      if (sumRes.ok) setSummary(await sumRes.json());
      if (fleetRes.ok) setFleetList(await fleetRes.json());
      if (logRes.ok) setLogsList(await logRes.json());
      if (mntRes.ok) setMaintenanceList(await mntRes.json());
      if (compRes.ok) setComplianceList(await compRes.json());
    } catch (err: any) {
      console.error("Gagal memuat data alat berat:", err);
      setError("Gagal menyambung ke server API. Menampilkan mode cadangan lokal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/v1/equipment/fleet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(equipmentForm),
      });
      if (res.ok) {
        showToast(`Unit ${equipmentForm.equipmentCode} berhasil ditambahkan!`);
        setShowEquipmentModal(false);
        loadData();
      } else {
        showToast("Gagal menyimpan data unit baru.");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat menghubungi API.");
    }
  };

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/v1/equipment/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logForm),
      });
      if (res.ok) {
        showToast(`Log harian untuk ${logForm.equipmentCode} berhasil dicatat!`);
        setShowLogModal(false);
        loadData();
      } else {
        showToast("Gagal menyimpan log harian.");
      }
    } catch (err) {
      showToast("Terjadi kesalahan koneksi API.");
    }
  };

  const handleCreateMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...maintenanceForm,
        sparePartsReplaced: maintenanceForm.sparePartsReplaced
          ? maintenanceForm.sparePartsReplaced.split(",").map((s) => s.trim())
          : [],
      };
      const res = await fetch("http://localhost:4000/api/v1/equipment/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showToast(`Jadwal pemeliharaan ${maintenanceForm.equipmentCode} berhasil dibuat!`);
        setShowMaintenanceModal(false);
        loadData();
      } else {
        showToast("Gagal membuat tiket pemeliharaan.");
      }
    } catch (err) {
      showToast("Terjadi kesalahan koneksi API.");
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment) return;
    try {
      const res = await fetch(
        `http://localhost:4000/api/v1/equipment/fleet/${selectedEquipment.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(statusForm),
        }
      );
      if (res.ok) {
        showToast(`Status unit ${selectedEquipment.equipmentCode} diperbarui ke ${statusForm.status}!`);
        setShowStatusModal(false);
        loadData();
      } else {
        showToast("Gagal memperbarui status unit.");
      }
    } catch (err) {
      showToast("Terjadi kesalahan koneksi API.");
    }
  };

  const formatRupiah = (val?: number) => {
    if (!val && val !== 0) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPERATIONAL":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            Operasional
          </span>
        );
      case "MAINTENANCE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <Wrench className="w-3 h-3" />
            Maintenance
          </span>
        );
      case "STANDBY":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            <Clock className="w-3 h-3" />
            Standby
          </span>
        );
      case "BREAKDOWN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
            <AlertTriangle className="w-3 h-3" />
            Breakdown
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "LIFTING_CRANE":
        return "Lifting & Crane";
      case "EARTHMOVING":
        return "Earthmoving / Excavator";
      case "CONCRETE":
        return "Concrete & Pump";
      case "POWER_GENERATOR":
        return "Power & Genset";
      case "TRANSPORT":
        return "Transport & Dump Truck";
      default:
        return cat;
    }
  };

  const filteredFleet = fleetList.filter((f) => {
    if (statusFilter !== "ALL" && f.status !== statusFilter) return false;
    if (categoryFilter !== "ALL" && f.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        f.equipmentCode.toLowerCase().includes(q) ||
        f.name.toLowerCase().includes(q) ||
        f.operatorName.toLowerCase().includes(q) ||
        f.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Manajemen Alat Berat & Armada
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
              Fleet / HM
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Monitoring utilisasi jam kerja (HM), efisiensi solar (L/jam), siklus pemeliharaan berkala, dan sertifikasi K3 SILO & SIO.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg border border-border hover:bg-muted/50 transition-colors"
            title="Muat ulang data"
            aria-label="Muat ulang data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => {
              if (fleetList.length > 0) {
                const f = fleetList[0];
                setLogForm({
                  equipmentId: f.id,
                  equipmentCode: f.equipmentCode,
                  date: new Date().toISOString().slice(0, 10),
                  shift: "Pagi",
                  startHourMeter: f.currentHourMeter,
                  endHourMeter: f.currentHourMeter + 7.5,
                  operatingHours: 7.0,
                  idleHours: 0.5,
                  fuelAddedLiters: 90,
                  operatorName: f.operatorName,
                  workDescription: "Operasi reguler shift pagi proyek",
                  location: f.location,
                });
              }
              setShowLogModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Gauge className="w-4 h-4" />
            <span>Catat Log HM</span>
          </button>

          <button
            onClick={() => {
              if (fleetList.length > 0) {
                const f = fleetList[0];
                setMaintenanceForm({
                  equipmentId: f.id,
                  equipmentCode: f.equipmentCode,
                  serviceType: "PREVENTIVE_250_HM",
                  scheduledDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
                  scheduledHourMeter: f.currentHourMeter + 50,
                  technicianVendor: "Tim Teknisi Workshop Proyek",
                  cost: 6500000,
                  sparePartsReplaced: "Filter Oli Mesin, Oli SAE 15W-40 30L",
                  notes: "Servis berkala preventif",
                });
              }
              setShowMaintenanceModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-sm"
          >
            <Wrench className="w-4 h-4" />
            <span>Jadwal Servis</span>
          </button>

          <button
            onClick={() => setShowEquipmentModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Unit</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Armada */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Unit Armada
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {summary.totalEquipment} Unit Alat
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold">
                {summary.operationalCount} Siap Operasi
              </span>
              <span>• {summary.maintenanceCount} Servis</span>
            </div>
          </div>
        </div>

        {/* Card 2: Jam Kerja Kumulatif */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Jam Kerja Operasi (HM)
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {summary.totalOperatingHours} Jam Log
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 text-blue-600 font-semibold">
                Kumulatif {summary.totalHourMeter} HM
              </span>
              <span>• Shift Aktif</span>
            </div>
          </div>
        </div>

        {/* Card 3: Konsumsi Solar & Efisiensi */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Konsumsi Solar & Efisiensi
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Fuel className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {summary.averageFuelConsumption} L / Jam
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 text-amber-600 font-semibold">
                Total {summary.totalFuelLiters} L Terisi
              </span>
              <span>• Standar &lt; 18 L/jam</span>
            </div>
          </div>
        </div>

        {/* Card 4: Kelaikan K3 SILO & SIO */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Kelaikan K3 SILO & SIO
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {summary.siloCompliancePercent}% Sesuai
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold">
                {summary.siloValidCount} Ijin Valid
              </span>
              <span>• {summary.siloExpiringCount} Warning 30 Hari</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border">
        <nav className="flex flex-wrap gap-1 sm:gap-4 pb-px" role="tablist" aria-label="Tabs Manajemen Alat Berat">
          <button
            onClick={() => setActiveTab("fleet")}
            className={`py-2.5 px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 ${
              activeTab === "fleet"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Master Armada & Unit</span>
            <span className="ml-1 px-1.5 py-0.5 text-[11px] rounded-full bg-primary/10 text-primary">
              {fleetList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`py-2.5 px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 ${
              activeTab === "logs"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>Log Harian & Hour Meter</span>
            <span className="ml-1 px-1.5 py-0.5 text-[11px] rounded-full bg-emerald-500/10 text-emerald-600">
              {logsList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("maintenance")}
            className={`py-2.5 px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 ${
              activeTab === "maintenance"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Pemeliharaan & Servis</span>
            <span className="ml-1 px-1.5 py-0.5 text-[11px] rounded-full bg-amber-500/10 text-amber-600">
              {maintenanceList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("compliance")}
            className={`py-2.5 px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 ${
              activeTab === "compliance"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Kelaikan K3 (SILO & SIO)</span>
            <span className="ml-1 px-1.5 py-0.5 text-[11px] rounded-full bg-indigo-500/10 text-indigo-600">
              {complianceList.length}
            </span>
          </button>
        </nav>
      </div>

      {/* TAB 1: FLEET MASTER */}
      {activeTab === "fleet" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari kode unit, nama alat, operator, atau lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs sm:text-sm rounded-md border border-input bg-background text-foreground"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="LIFTING_CRANE">Lifting & Crane</option>
                <option value="EARTHMOVING">Earthmoving / Excavator</option>
                <option value="CONCRETE">Concrete & Pump</option>
                <option value="POWER_GENERATOR">Power & Genset</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs sm:text-sm rounded-md border border-input bg-background text-foreground"
              >
                <option value="ALL">Semua Status</option>
                <option value="OPERATIONAL">Operasional</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="STANDBY">Standby</option>
                <option value="BREAKDOWN">Breakdown</option>
              </select>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden xl:block rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <table className="w-full table-fixed text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-3 px-4 w-[24%]">Kode & Nama Unit</th>
                  <th className="py-3 px-4 w-[16%]">Kategori & Tipe</th>
                  <th className="py-3 px-4 w-[18%]">Operator & SIO</th>
                  <th className="py-3 px-4 w-[12%]">Hour Meter</th>
                  <th className="py-3 px-4 w-[14%]">Sertifikat SILO</th>
                  <th className="py-3 px-4 w-[16%] text-right">Status & Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredFleet.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Tidak ada unit alat berat yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredFleet.map((unit) => (
                    <tr key={unit.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground truncate">{unit.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                          <span className="font-mono font-medium text-primary">{unit.equipmentCode}</span>
                          <span>•</span>
                          <span className="truncate">{unit.brandModel}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-foreground truncate">{getCategoryLabel(unit.category)}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {unit.ownership === "RENTAL" ? `Sewa (${unit.vendorName || "Vendor"})` : "Internal Asset"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-foreground truncate flex items-center gap-1">
                          <HardHat className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">{unit.operatorName}</span>
                        </div>
                        <div className="font-mono text-[11px] text-muted-foreground truncate">{unit.sioNumber}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-foreground font-mono">{unit.currentHourMeter} HM</div>
                        <div className="text-[11px] text-muted-foreground truncate">{unit.location}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-[11px] text-foreground truncate">{unit.siloNumber}</div>
                        <div className="text-[11px] text-muted-foreground">Exp: {unit.siloExpiryDate}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {getStatusBadge(unit.status)}
                          <button
                            onClick={() => {
                              setSelectedEquipment(unit);
                              setStatusForm({
                                status: unit.status,
                                notes: "",
                                currentLocation: unit.location,
                                currentHourMeter: unit.currentHourMeter,
                              });
                              setShowStatusModal(true);
                            }}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Update status"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Card View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:hidden">
            {filteredFleet.map((unit) => (
              <div key={unit.id} className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-semibold text-primary">{unit.equipmentCode}</span>
                    <h3 className="font-semibold text-sm text-foreground leading-tight mt-0.5">{unit.name}</h3>
                    <p className="text-xs text-muted-foreground">{unit.brandModel}</p>
                  </div>
                  <div>{getStatusBadge(unit.status)}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Kategori:</span>
                    <span className="font-medium text-foreground">{getCategoryLabel(unit.category)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Hour Meter:</span>
                    <span className="font-mono font-bold text-foreground">{unit.currentHourMeter} HM</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Operator:</span>
                    <span className="font-medium text-foreground truncate block">{unit.operatorName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">SILO Exp:</span>
                    <span className="font-medium text-foreground">{unit.siloExpiryDate}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground truncate">{unit.location}</span>
                  <button
                    onClick={() => {
                      setSelectedEquipment(unit);
                      setStatusForm({
                        status: unit.status,
                        notes: "",
                        currentLocation: unit.location,
                        currentHourMeter: unit.currentHourMeter,
                      });
                      setShowStatusModal(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Ubah Status</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: DAILY LOGS */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden xl:block rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <table className="w-full table-fixed text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-3 px-4 w-[18%]">No. Log & Tanggal</th>
                  <th className="py-3 px-4 w-[18%]">Unit Alat</th>
                  <th className="py-3 px-4 w-[16%]">Hour Meter (HM)</th>
                  <th className="py-3 px-4 w-[16%]">Solar & Rasio</th>
                  <th className="py-3 px-4 w-[16%]">Operator & Lokasi</th>
                  <th className="py-3 px-4 w-[16%]">Pekerjaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Belum ada catatan log harian jam kerja alat berat.
                    </td>
                  </tr>
                ) : (
                  logsList.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-medium text-foreground">{log.logNumber}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span>{log.date} ({log.shift})</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground truncate">{log.equipmentName}</div>
                        <div className="font-mono text-[11px] text-primary">{log.equipmentCode}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-foreground font-mono">
                          {log.operatingHours} Jam Operasi
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {log.startHourMeter} → {log.endHourMeter} HM
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                          +{log.fuelAddedLiters} L Solar
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          Rasio: {log.fuelEfficiency} L/jam
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-foreground truncate">{log.operatorName}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{log.location}</div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-[11px] text-muted-foreground line-clamp-2" title={log.workDescription}>
                          {log.workDescription}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:hidden">
            {logsList.map((log) => (
              <div key={log.id} className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-primary">{log.logNumber}</span>
                  <span className="text-muted-foreground">{log.date} • Shift {log.shift}</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{log.equipmentName} ({log.equipmentCode})</h4>
                  <p className="text-muted-foreground line-clamp-2 mt-0.5">{log.workDescription}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Durasi Operasi:</span>
                    <span className="font-bold font-mono text-foreground">{log.operatingHours} Jam ({log.startHourMeter} - {log.endHourMeter} HM)</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">BBM Solar:</span>
                    <span className="font-bold font-mono text-amber-600">+{log.fuelAddedLiters} L ({log.fuelEfficiency} L/jam)</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-border flex items-center justify-between text-muted-foreground text-[11px]">
                  <span>Operator: {log.operatorName}</span>
                  <span>{log.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MAINTENANCE */}
      {activeTab === "maintenance" && (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden xl:block rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <table className="w-full table-fixed text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-3 px-4 w-[16%]">No. Tiket & Tanggal</th>
                  <th className="py-3 px-4 w-[18%]">Unit Alat</th>
                  <th className="py-3 px-4 w-[18%]">Tipe Pemeliharaan</th>
                  <th className="py-3 px-4 w-[16%]">Target HM & Realisasi</th>
                  <th className="py-3 px-4 w-[16%]">Teknisi / Vendor</th>
                  <th className="py-3 px-4 w-[16%] text-right">Biaya & Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {maintenanceList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Belum ada jadwal pemeliharaan alat berat.
                    </td>
                  </tr>
                ) : (
                  maintenanceList.map((mnt) => (
                    <tr key={mnt.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-medium text-foreground">{mnt.maintenanceNumber}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{mnt.scheduledDate}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground truncate">{mnt.equipmentName}</div>
                        <div className="font-mono text-[11px] text-primary">{mnt.equipmentCode}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground truncate">{mnt.serviceType}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{mnt.notes}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-foreground font-mono">{mnt.scheduledHourMeter} HM Target</div>
                        <div className="text-[11px] text-muted-foreground">
                          {mnt.actualHourMeter ? `Selesai pada ${mnt.actualHourMeter} HM` : "Menunggu jadwal"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-foreground truncate">{mnt.technicianVendor}</div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {mnt.sparePartsReplaced.join(", ") || "Servis berkala"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-mono font-bold text-foreground">{formatRupiah(mnt.cost)}</div>
                        <div className="mt-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              mnt.status === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : mnt.status === "IN_PROGRESS"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                            }`}
                          >
                            {mnt.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:hidden">
            {maintenanceList.map((mnt) => (
              <div key={mnt.id} className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-primary">{mnt.maintenanceNumber}</span>
                  <span className="font-bold text-foreground">{formatRupiah(mnt.cost)}</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{mnt.equipmentName} ({mnt.equipmentCode})</h4>
                  <p className="text-muted-foreground text-xs mt-0.5">{mnt.serviceType} • {mnt.notes}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Jadwal Servis:</span>
                    <span className="font-medium text-foreground">{mnt.scheduledDate} ({mnt.scheduledHourMeter} HM)</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Status:</span>
                    <span className="font-semibold text-foreground">{mnt.status}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-border text-[11px] text-muted-foreground truncate">
                  Teknisi: {mnt.technicianVendor}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: COMPLIANCE K3 (SILO & SIO) */}
      {activeTab === "compliance" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">
                  Audit Kelaikan Operasi K3 Alat Berat (SILO & SIO)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sesuai Peraturan Menaker No. 08/MEN/2020 tentang K3 Pesawat Angkat dan Pesawat Angkut. Seluruh alat berat dan operator wajib memiliki lisensi aktif sebelum beroperasi di site proyek.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complianceList.map((comp) => (
              <div
                key={comp.equipmentId}
                className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-semibold text-primary">{comp.equipmentCode}</span>
                    <h4 className="font-bold text-sm text-foreground">{comp.name}</h4>
                    <p className="text-xs text-muted-foreground">{comp.brandModel}</p>
                  </div>
                  <div>
                    {comp.siloStatus === "VALID" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        SILO Valid
                      </span>
                    ) : comp.siloStatus === "EXPIRING_SOON" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Segera Perpanjang ({comp.daysRemaining} Hari)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        SILO Expired
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Nomor Sertifikat SILO:</span>
                    <span className="font-mono font-bold text-foreground">{comp.siloNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Masa Berlaku SILO:</span>
                    <span className="font-medium text-foreground">{comp.siloExpiryDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Operator Bersertifikat:</span>
                    <span className="font-medium text-foreground">{comp.operatorName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Nomor Lisensi SIO:</span>
                    <span className="font-mono text-foreground">{comp.sioNumber}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 text-muted-foreground">
                  <span>Lokasi: {comp.location}</span>
                  <span>Status: {comp.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: TAMBAH UNIT ALAT BERAT */}
      {showEquipmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                Tambah Unit Alat Berat Baru
              </h3>
              <button
                onClick={() => setShowEquipmentModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEquipment} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Kode Unit / Lambung *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: EQ-DT-05"
                    value={equipmentForm.equipmentCode}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, equipmentCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Kategori Alat *</label>
                  <select
                    value={equipmentForm.category}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                  >
                    <option value="LIFTING_CRANE">Lifting & Crane</option>
                    <option value="EARTHMOVING">Earthmoving / Excavator</option>
                    <option value="CONCRETE">Concrete & Pump</option>
                    <option value="POWER_GENERATOR">Power & Genset</option>
                    <option value="TRANSPORT">Transport & Dump Truck</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Nama Alat Berat *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dump Truck Hino 500 FM 260 Ti"
                  value={equipmentForm.name}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Merk & Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Hino FM 260 Ti"
                    value={equipmentForm.brandModel}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, brandModel: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Kepemilikan *</label>
                  <select
                    value={equipmentForm.ownership}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, ownership: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                  >
                    <option value="INTERNAL">Internal Perusahaan</option>
                    <option value="RENTAL">Sewa dari Vendor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Nama Operator *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={equipmentForm.operatorName}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, operatorName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">No. Lisensi SIO Operator *</label>
                  <input
                    type="text"
                    required
                    placeholder="SIO-05.7712-DEPNAKER/2025"
                    value={equipmentForm.sioNumber}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, sioNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Nomor SILO Disnaker *</label>
                  <input
                    type="text"
                    required
                    placeholder="SILO-DT-01129-DISNAKER/2025"
                    value={equipmentForm.siloNumber}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, siloNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Masa Berlaku SILO *</label>
                  <input
                    type="date"
                    required
                    value={equipmentForm.siloExpiryDate}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, siloExpiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Hour Meter Awal (HM) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={equipmentForm.initialHourMeter}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, initialHourMeter: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Lokasi Penempatan *</label>
                  <input
                    type="text"
                    required
                    value={equipmentForm.location}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEquipmentModal(false)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors"
                >
                  Simpan Unit Alat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CATAT LOG HARIAN HM */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Gauge className="w-5 h-5 text-emerald-600" />
                Catat Log Harian HM & BBM
              </h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLog} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">Pilih Unit Alat Berat *</label>
                <select
                  value={logForm.equipmentCode}
                  onChange={(e) => {
                    const sel = fleetList.find((f) => f.equipmentCode === e.target.value);
                    if (sel) {
                      setLogForm({
                        ...logForm,
                        equipmentId: sel.id,
                        equipmentCode: sel.equipmentCode,
                        startHourMeter: sel.currentHourMeter,
                        endHourMeter: sel.currentHourMeter + logForm.operatingHours,
                        operatorName: sel.operatorName,
                        location: sel.location,
                      });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                >
                  {fleetList.map((f) => (
                    <option key={f.id} value={f.equipmentCode}>
                      {f.equipmentCode} - {f.name} ({f.currentHourMeter} HM)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Tanggal Operasi *</label>
                  <input
                    type="date"
                    required
                    value={logForm.date}
                    onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Shift Kerja *</label>
                  <select
                    value={logForm.shift}
                    onChange={(e) => setLogForm({ ...logForm, shift: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                  >
                    <option value="Pagi">Pagi (08:00 - 16:00)</option>
                    <option value="Siang">Siang / Sore (16:00 - 24:00)</option>
                    <option value="Malam">Malam (00:00 - 08:00)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Hour Meter Awal *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={logForm.startHourMeter}
                    onChange={(e) => {
                      const start = parseFloat(e.target.value) || 0;
                      setLogForm({
                        ...logForm,
                        startHourMeter: start,
                        operatingHours: Math.max(0, parseFloat((logForm.endHourMeter - start).toFixed(1))),
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Hour Meter Akhir *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={logForm.endHourMeter}
                    onChange={(e) => {
                      const end = parseFloat(e.target.value) || 0;
                      setLogForm({
                        ...logForm,
                        endHourMeter: end,
                        operatingHours: Math.max(0, parseFloat((end - logForm.startHourMeter).toFixed(1))),
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Jam Operasi Efektif (Jam) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={logForm.operatingHours}
                    onChange={(e) => setLogForm({ ...logForm, operatingHours: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">BBM Solar Ditambahkan (Liter)</label>
                  <input
                    type="number"
                    step="1"
                    value={logForm.fuelAddedLiters}
                    onChange={(e) => setLogForm({ ...logForm, fuelAddedLiters: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Uraian Pekerjaan yang Dikerjakan *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Contoh: Pengangkatan material bekisting dan tulangan kolom lantai 8"
                  value={logForm.workDescription}
                  onChange={(e) => setLogForm({ ...logForm, workDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors"
                >
                  Simpan Log Harian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: BUAT JADWAL PEMELIHARAAN */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-600" />
                Buat Jadwal Pemeliharaan & Servis
              </h3>
              <button
                onClick={() => setShowMaintenanceModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMaintenance} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">Pilih Unit Alat Berat *</label>
                <select
                  value={maintenanceForm.equipmentCode}
                  onChange={(e) => {
                    const sel = fleetList.find((f) => f.equipmentCode === e.target.value);
                    if (sel) {
                      setMaintenanceForm({
                        ...maintenanceForm,
                        equipmentId: sel.id,
                        equipmentCode: sel.equipmentCode,
                        scheduledHourMeter: sel.currentHourMeter + 50,
                      });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                >
                  {fleetList.map((f) => (
                    <option key={f.id} value={f.equipmentCode}>
                      {f.equipmentCode} - {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Tipe Servis *</label>
                  <select
                    value={maintenanceForm.serviceType}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, serviceType: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                  >
                    <option value="PREVENTIVE_250_HM">Preventive 250 HM</option>
                    <option value="PREVENTIVE_500_HM">Preventive 500 HM</option>
                    <option value="PREVENTIVE_1000_HM">Preventive 1000 HM / Mayor</option>
                    <option value="CORRECTIVE_REPAIR">Corrective Repair / Kerusakan</option>
                    <option value="SAFETY_INSPECTION">Uji Kelayakan K3</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Target Tanggal Servis *</label>
                  <input
                    type="date"
                    required
                    value={maintenanceForm.scheduledDate}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Target Hour Meter (HM) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={maintenanceForm.scheduledHourMeter}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, scheduledHourMeter: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Estimasi Biaya (Rp) *</label>
                  <input
                    type="number"
                    step="100000"
                    required
                    value={maintenanceForm.cost}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Teknisi Internal / Vendor Servis *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tim Workshop Internal / Trakindo Support"
                  value={maintenanceForm.technicianVendor}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, technicianVendor: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Penggantian Spare Part (Pisahkan Koma)</label>
                <input
                  type="text"
                  placeholder="Contoh: Filter Oli, Oli 15W-40 30L, Grease EP-2"
                  value={maintenanceForm.sparePartsReplaced}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, sparePartsReplaced: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Rincian Instruksi Pemeliharaan *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Instruksi perbaikan atau item checklist pengecekan berkala..."
                  value={maintenanceForm.notes}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMaintenanceModal(false)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 font-medium transition-colors"
                >
                  Jadwalkan Servis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: UBAH STATUS ALAT BERAT */}
      {showStatusModal && selectedEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-base text-foreground">
                Ubah Status: {selectedEquipment.equipmentCode}
              </h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">Status Unit Baru *</label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                >
                  <option value="OPERATIONAL">OPERATIONAL (Siap Operasi)</option>
                  <option value="MAINTENANCE">MAINTENANCE (Servis / Perbaikan)</option>
                  <option value="STANDBY">STANDBY (Tidak Beroperasi)</option>
                  <option value="BREAKDOWN">BREAKDOWN (Rusak di Lokasi)</option>
                  <option value="DEMOBILIZED">DEMOBILIZED (Keluar Site)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Update Hour Meter Terkini (HM)</label>
                <input
                  type="number"
                  step="0.1"
                  value={statusForm.currentHourMeter}
                  onChange={(e) => setStatusForm({ ...statusForm, currentHourMeter: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Update Lokasi Unit</label>
                <input
                  type="text"
                  value={statusForm.currentLocation}
                  onChange={(e) => setStatusForm({ ...statusForm, currentLocation: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Catatan Alasan Perubahan</label>
                <textarea
                  rows={2}
                  placeholder="Catatan teknis pergantian status..."
                  value={statusForm.notes}
                  onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors"
                >
                  Perbarui Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
