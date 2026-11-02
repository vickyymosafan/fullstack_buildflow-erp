"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Settings,
  Building2,
  Users,
  Shield,
  History,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Lock,
  UserCheck,
  UserX,
  X,
  FileCheck2,
  Globe,
  Sliders,
} from "lucide-react";

interface Branch {
  id: string;
  code: string;
  name: string;
  address: string;
  isHeadOffice: boolean;
  status: string;
  departmentsCount: number;
  departments: Array<{ id: string; code: string; name: string }>;
  activeProjectsCount: number;
  projects: Array<{ id: string; projectCode: string; name: string; status: string }>;
}

interface OrganizationData {
  id: string;
  code: string;
  name: string;
  legalName: string;
  taxId: string;
  address: string;
  defaultCurrency: string;
  timezone: string;
  branches: Branch[];
}

interface UserEntity {
  id: string;
  email: string;
  fullName: string;
  status: "ACTIVE" | "SUSPENDED";
  roles: string[];
  roleDescriptions: string[];
  managedProjectsCount: number;
  managedProjects: Array<{ id: string; projectCode: string; name: string; status: string }>;
  createdAt: string;
}

interface RoleEntity {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  permissions: string[];
}

interface AuditLogEntity {
  id: string;
  actorName: string;
  actorEmail: string;
  action: string;
  resourceType: string;
  resourceId: string;
  payload: any;
  ipAddress: string;
  correlationId: string;
  timestamp: string;
  formattedTime: string;
}

interface SettingsOverview {
  companyName: string;
  legalName: string;
  companyCode: string;
  taxId: string;
  address: string;
  defaultCurrency: string;
  timezone: string;
  kpis: {
    totalBranches: number;
    totalDepartments: number;
    totalUsers: number;
    activeUsers: number;
    totalRoles: number;
    totalAuditLogs: number;
    securityStatus: string;
  };
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"organization" | "users" | "rbac" | "audit">("organization");
  const [loading, setLoading] = useState<boolean>(true);
  const [overview, setOverview] = useState<SettingsOverview | null>(null);
  const [orgData, setOrgData] = useState<OrganizationData | null>(null);
  const [users, setUsers] = useState<UserEntity[]>([]);
  const [rolesData, setRolesData] = useState<{ roles: RoleEntity[]; availablePermissions: any[] }>({
    roles: [],
    availablePermissions: [],
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogEntity[]>([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  // Modals
  const [isNewBranchModalOpen, setIsNewBranchModalOpen] = useState<boolean>(false);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState<boolean>(false);

  // Form states
  const [newBranch, setNewBranch] = useState({ code: "", name: "", address: "" });
  const [newUser, setNewUser] = useState({ fullName: "", email: "", roleName: "SITE_SUPERVISOR" });

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ovRes, orgRes, uRes, rRes, aRes] = await Promise.all([
        fetch("http://localhost:4000/api/v1/settings/overview").then((r) => r.json()),
        fetch("http://localhost:4000/api/v1/settings/organization").then((r) => r.json()),
        fetch("http://localhost:4000/api/v1/settings/users").then((r) => r.json()),
        fetch("http://localhost:4000/api/v1/settings/roles").then((r) => r.json()),
        fetch("http://localhost:4000/api/v1/settings/audit-logs").then((r) => r.json()),
      ]);

      setOverview(ovRes);
      setOrgData(orgRes);
      setUsers(uRes);
      setRolesData(rRes);
      setAuditLogs(aRes);
    } catch (err) {
      console.error("Gagal memuat data pengaturan sistem:", err);
      setNotification({ type: "error", message: "Gagal terhubung ke API backend Settings." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.code || !newBranch.name) {
      setNotification({ type: "error", message: "Kode dan nama cabang wajib diisi." });
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/v1/settings/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBranch),
      });

      if (!res.ok) throw new Error("Gagal membuat cabang baru.");

      setIsNewBranchModalOpen(false);
      setNewBranch({ code: "", name: "", address: "" });
      setNotification({ type: "success", message: "Kantor cabang baru berhasil ditambahkan." });
      fetchData();
    } catch (err) {
      setNotification({ type: "error", message: "Gagal menambahkan kantor cabang." });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.fullName) {
      setNotification({ type: "error", message: "Nama lengkap dan email wajib diisi." });
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/v1/settings/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!res.ok) throw new Error("Gagal mendaftarkan pengguna.");

      setIsNewUserModalOpen(false);
      setNewUser({ fullName: "", email: "", roleName: "SITE_SUPERVISOR" });
      setNotification({ type: "success", message: "Pengguna baru berhasil didaftarkan ke sistem." });
      fetchData();
    } catch (err) {
      setNotification({ type: "error", message: "Gagal mendaftarkan pengguna baru." });
    }
  };

  const handleToggleUserStatus = async (id: string, currentStatus: "ACTIVE" | "SUSPENDED") => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch(`http://localhost:4000/api/v1/settings/users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error("Gagal mengubah status pengguna.");

      setNotification({
        type: "success",
        message: `Status pengguna berhasil diperbarui menjadi ${nextStatus}.`,
      });
      fetchData();
    } catch (err) {
      setNotification({ type: "error", message: "Gagal memperbarui status pengguna." });
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = roleFilter === "ALL" || u.roles.includes(roleFilter);
      return matchSearch && matchRole;
    });
  }, [users, searchTerm, roleFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-sm shadow-md transition-all ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : "bg-rose-50 text-rose-900 border border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-gray-600" aria-label="Tutup notifikasi">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-900 text-white font-mono">
              MODUL 01 — CORE PLATFORM
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
              MULTI-BRANCH ENTERPRISE
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
              RBAC & AUDIT LOG COMPLIANT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Pengaturan Sistem & Tata Kelola RBAC
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Konfigurasi profil perusahaan, hierarki kantor cabang regional, user directory, matriks izin peran, dan immutable audit trail.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsNewBranchModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Cabang</span>
          </button>
          <button
            onClick={() => setIsNewUserModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium shadow-sm transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>Tambah User</span>
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium shadow-sm transition-colors"
            title="Muat ulang data terbaru"
            aria-label="Muat ulang data pengaturan sistem"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kantor Cabang Regional</span>
            <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {overview?.kpis.totalBranches ?? 0} Cabang
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="font-semibold text-blue-700">1 Kantor Pusat</span> + {Math.max(0, (overview?.kpis.totalBranches ?? 0) - 1)} Kantor Wilayah
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pengguna Terdaftar</span>
            <div className="w-9 h-9 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {overview?.kpis.totalUsers ?? 0} Akun
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-700 font-semibold">{overview?.kpis.activeUsers ?? 0} aktif</span> (100% terverifikasi)
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Peran Hak Akses (RBAC)</span>
            <div className="w-9 h-9 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {overview?.kpis.totalRoles ?? 0} Peran
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span>Director, PM, QS, Finance, Auditor</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rekaman Audit (Trail)</span>
            <div className="w-9 h-9 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {overview?.kpis.totalAuditLogs ?? 0} Log
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="font-semibold text-amber-700">Append-Only</span> (ISO 27001 Standard)
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-2 sm:space-x-8 overflow-x-auto pb-px" aria-label="Tabs Pengaturan">
          <button
            id="tab-btn-organization"
            onClick={() => setActiveTab("organization")}
            className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === "organization"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Profil Perusahaan & Cabang</span>
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-mono">
              {orgData?.branches.length ?? 0}
            </span>
          </button>

          <button
            id="tab-btn-users"
            onClick={() => setActiveTab("users")}
            className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === "users"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Manajemen Pengguna</span>
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-mono">
              {users.length}
            </span>
          </button>

          <button
            id="tab-btn-rbac"
            onClick={() => setActiveTab("rbac")}
            className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === "rbac"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Matriks Peran (RBAC)</span>
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-800 font-mono">
              {rolesData.roles.length}
            </span>
          </button>

          <button
            id="tab-btn-audit"
            onClick={() => setActiveTab("audit")}
            className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === "audit"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit Trail & Kepatuhan</span>
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 font-mono">
              {auditLogs.length}
            </span>
          </button>
        </nav>
      </div>

      {/* TAB 1: ORGANIZATION & BRANCHES */}
      {activeTab === "organization" && orgData && (
        <div id="tab-content-organization" className="space-y-6">
          {/* Company Profile Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest">
                  ENTITAS INDUK PERSEROAN
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">{orgData.name}</h2>
                <div className="text-xs text-slate-500 mt-1">{orgData.legalName}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono">
                  NPWP: {orgData.taxId}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-700 block">Kantor Pusat Perseroan</span>
                  <span>{orgData.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Globe className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-700 block">Mata Uang & Zona Waktu</span>
                  <span className="font-mono">{orgData.defaultCurrency} • {orgData.timezone}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <FileCheck2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-700 block">Sertifikasi & Kepatuhan</span>
                  <span>ISO 9001 (Mutu) • ISO 45001 (K3) • ISO 27001 (Keamanan)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Branches Section Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Hierarki Kantor Cabang Regional</h2>
              <p className="text-xs text-slate-500">Kantor perwakilan wilayah operasional dan alokasi proyek konstruksi.</p>
            </div>
            <button
              onClick={() => setIsNewBranchModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Cabang</span>
            </button>
          </div>

          {/* Branches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {orgData.branches.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {b.code}
                    </span>
                    {b.isHeadOffice ? (
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-900 text-white uppercase">
                        KANTOR PUSAT
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                        KANTOR CABANG
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-2">{b.name}</h3>
                  <div className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{b.address}</span>
                  </div>

                  {/* Departments */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Departemen & Divisi ({b.departmentsCount})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {b.departments.length > 0 ? (
                        b.departments.map((d) => (
                          <span
                            key={d.id}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                          >
                            {d.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Belum ada departemen</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Projects link */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Proyek Terhubung:</span>
                  <span className="font-bold font-mono text-slate-900 bg-slate-50 px-2 py-0.5 rounded">
                    {b.activeProjectsCount} Proyek Aktif
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: USER DIRECTORY */}
      {activeTab === "users" && (
        <div id="tab-content-users" className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari personil berdasarkan nama atau alamat email perusahaan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Filter Peran:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-sm border border-slate-300 rounded-md py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Semua Peran</option>
                {rolesData.roles.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Nama Lengkap & Akun</th>
                    <th className="py-3 px-4">Peran Hak Akses (Role)</th>
                    <th className="py-3 px-4 text-center">Proyek Dikelola</th>
                    <th className="py-3 px-4">Terdaftar</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        Tidak ada pengguna yang cocok dengan filter
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 text-sm">{u.fullName}</div>
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5">{u.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {u.roles.map((r, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-50 text-blue-700 border border-blue-200"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {u.managedProjectsCount} Proyek
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {u.createdAt}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              u.status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.status)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors ${
                              u.status === "ACTIVE"
                                ? "text-rose-700 hover:bg-rose-50"
                                : "text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {u.status === "ACTIVE" ? "Suspend" : "Aktifkan"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RBAC GOVERNANCE */}
      {activeTab === "rbac" && (
        <div id="tab-content-rbac" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Matriks Peran & Hak Akses (RBAC Governance)</h2>
              <p className="text-xs text-slate-500">
                Pemetaan hak akses operasional antar peran (*Least Privilege Principle* & *Segregation of Duties*).
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Izin Modul (Permission)</th>
                    <th className="py-3 px-2 text-center">SUPERADMIN</th>
                    <th className="py-3 px-2 text-center">DIRECTOR</th>
                    <th className="py-3 px-2 text-center">PROJECT MANAGER</th>
                    <th className="py-3 px-2 text-center">FINANCE MANAGER</th>
                    <th className="py-3 px-2 text-center">PROCUREMENT</th>
                    <th className="py-3 px-2 text-center">SITE SUPERVISOR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {rolesData.availablePermissions.map((perm) => (
                    <tr key={perm.code} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-sans">
                        <div className="font-bold text-slate-900 text-xs">{perm.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{perm.code} • {perm.module}</div>
                      </td>
                      {/* SUPERADMIN */}
                      <td className="py-3 px-2 text-center">
                        <span className="inline-block w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold leading-5 text-center">
                          ✓
                        </span>
                      </td>
                      {/* DIRECTOR */}
                      <td className="py-3 px-2 text-center">
                        <span className="inline-block w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold leading-5 text-center">
                          ✓
                        </span>
                      </td>
                      {/* PM */}
                      <td className="py-3 px-2 text-center">
                        {["projects.manage", "budget.lock", "crm.manage"].includes(perm.code) ? (
                          <span className="inline-block w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold leading-5 text-center">
                            ✓
                          </span>
                        ) : (
                          <span className="text-slate-300 font-bold">-</span>
                        )}
                      </td>
                      {/* FINANCE */}
                      <td className="py-3 px-2 text-center">
                        {["finance.gl", "audit.view"].includes(perm.code) ? (
                          <span className="inline-block w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold leading-5 text-center">
                            ✓
                          </span>
                        ) : (
                          <span className="text-slate-300 font-bold">-</span>
                        )}
                      </td>
                      {/* PROCUREMENT */}
                      <td className="py-3 px-2 text-center">
                        {["procurement.po", "inventory.movement"].includes(perm.code) ? (
                          <span className="inline-block w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold leading-5 text-center">
                            ✓
                          </span>
                        ) : (
                          <span className="text-slate-300 font-bold">-</span>
                        )}
                      </td>
                      {/* SITE */}
                      <td className="py-3 px-2 text-center">
                        {["projects.manage"].includes(perm.code) ? (
                          <span className="inline-block w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold leading-5 text-center">
                            ✓
                          </span>
                        ) : (
                          <span className="text-slate-300 font-bold">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL STREAM */}
      {activeTab === "audit" && (
        <div id="tab-content-audit" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Audit Trail Keamanan & Kepatuhan</h2>
              <p className="text-xs text-slate-500">
                Rekaman perubahan sistem yang bersifat tidak dapat diubah (*immutable append-only audit trail*).
              </p>
            </div>
            <div className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-bold">
              TAMPER-PROOF VERIFIED
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Waktu (WIB)</th>
                    <th className="py-3 px-4">Aktor / Pengguna</th>
                    <th className="py-3 px-4 text-center">Aksi (Action)</th>
                    <th className="py-3 px-4">Entitas Sumber Daya</th>
                    <th className="py-3 px-4">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400 font-sans">
                        Belum ada rekaman audit log
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {log.formattedTime}
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <div className="font-bold text-slate-900">{log.actorName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{log.actorEmail}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              log.action.includes("SUCCESS") || log.action.includes("CREATED") || log.action.includes("REGISTERED")
                                ? "bg-emerald-100 text-emerald-800"
                                : log.action.includes("TOGGLED") || log.action.includes("UPDATED")
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{log.resourceType}</div>
                          <div className="text-[10px] text-slate-400">{log.resourceId}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {log.ipAddress}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH CABANG */}
      {isNewBranchModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Registrasi Kantor Cabang Regional</h3>
              <button onClick={() => setIsNewBranchModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kode Cabang Unik *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: BR-SMG"
                  value={newBranch.code}
                  onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Kantor Cabang *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kantor Cabang Wilayah Semarang & Jawa Tengah"
                  value={newBranch.name}
                  onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Kantor Wilayah</label>
                <textarea
                  rows={2}
                  placeholder="Jl. Pemuda No. ..., Semarang"
                  value={newBranch.address}
                  onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewBranchModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded shadow-sm"
                >
                  Simpan Cabang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH USER */}
      {isNewUserModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Pendaftaran Pengguna Internal Sistem</h3>
              <button onClick={() => setIsNewUserModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ir. Ahmad Fauzi, MT"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Perusahaan *</label>
                <input
                  type="email"
                  required
                  placeholder="ahmad.fauzi@buildflow.id"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Peran Jabatan (Role Access)</label>
                <select
                  value={newUser.roleName}
                  onChange={(e) => setNewUser({ ...newUser, roleName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800"
                >
                  <option value="PROJECT_MANAGER">PROJECT_MANAGER (Pengendali Proyek & Schedule)</option>
                  <option value="FINANCE_MANAGER">FINANCE_MANAGER (Keuangan & Akuntansi)</option>
                  <option value="PROCUREMENT_MANAGER">PROCUREMENT_MANAGER (Pengadaan & Vendor)</option>
                  <option value="SITE_SUPERVISOR">SITE_SUPERVISOR (Pengawas Lapangan & QC)</option>
                  <option value="WAREHOUSE_STAFF">WAREHOUSE_STAFF (Petugas Gudang & Logistik)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewUserModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded shadow-sm"
                >
                  Daftarkan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
