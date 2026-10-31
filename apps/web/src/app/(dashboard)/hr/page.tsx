"use client";

import { useState, useEffect } from "react";
import {
  Users2,
  HardHat,
  Clock,
  Plus,
  Search,
  Filter,
  DollarSign,
  CheckCircle2,
  Calendar,
  RotateCcw,
  X,
  Briefcase,
  ShieldAlert,
} from "lucide-react";

interface EmployeeItem {
  id: string;
  employeeCode: string;
  fullName: string;
  jobTitle: string;
  departmentCode: string;
  departmentName: string;
  status: string;
  totalHoursLogged: number;
  timesheetCount: number;
}

interface TimesheetItem {
  id: string;
  employeeCode: string;
  employeeName: string;
  jobTitle: string;
  departmentName: string;
  projectCode: string;
  workDate: string;
  hoursWorked: number;
  overtimeHours: number;
  taskCategory: string;
  status: string;
  dailyWage: number;
  overtimePay: number;
  totalGrossPay: number;
  notes?: string;
}

interface HRSummary {
  totalHeadcount: number;
  activeOnSiteToday: number;
  totalHoursWorked: number;
  totalWageExpense: number;
  attendanceRate: number;
}

export default function HRPage() {
  const [activeTab, setActiveTab] = useState<"timesheets" | "employees">("timesheets");
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [timesheets, setTimesheets] = useState<TimesheetItem[]>([]);
  const [summary, setSummary] = useState<HRSummary | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State for Timesheet
  const [employeeCode, setEmployeeCode] = useState<string>("EMP-003");
  const [workDate, setWorkDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [hoursWorked, setHoursWorked] = useState<number>(8);
  const [overtimeHours, setOvertimeHours] = useState<number>(2);
  const [taskCategory, setTaskCategory] = useState<string>("PEMBESIAN");
  const [dailyWage, setDailyWage] = useState<number>(250000);
  const [notes, setNotes] = useState<string>("Pemasangan tulangan rebar Pier Head P-12");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, timeRes, sumRes] = await Promise.all([
        fetch("http://localhost:4000/api/v1/hr/employees"),
        fetch("http://localhost:4000/api/v1/hr/timesheets?limit=50"),
        fetch("http://localhost:4000/api/v1/hr/summary"),
      ]);

      if (empRes.ok) {
        const json = await empRes.json();
        setEmployees(json.data || []);
      }
      if (timeRes.ok) {
        const json = await timeRes.json();
        setTimesheets(json.data || []);
      }
      if (sumRes.ok) {
        const json = await sumRes.json();
        setSummary(json.data || null);
      }
    } catch (e) {
      console.error("Gagal memuat data tenaga kerja:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTimesheet = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        employeeCode,
        workDate: new Date(workDate).toISOString(),
        hoursWorked: Number(hoursWorked),
        overtimeHours: Number(overtimeHours),
        taskCategory,
        dailyWage: Number(dailyWage),
        notes,
        projectCode: "PRJ-2026-LRT",
      };

      const res = await fetch("http://localhost:4000/api/v1/hr/timesheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccessMsg(
          `Presensi harian ${employeeCode} berhasil dicatat dan diverifikasi.`
        );
        setShowModal(false);
        await loadData();
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        const errJson = await res.json();
        alert(`Gagal mencatat presensi: ${errJson.message || "Periksa data input"}`);
      }
    } catch (e) {
      alert("Terjadi kendala jaringan saat mencatat presensi");
    } finally {
      setSubmitting(false);
    }
  };

  const formatIDR = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

  // Filter Timesheets
  const filteredTimesheets = timesheets.filter((t) => {
    const matchesCat =
      selectedCategory === "ALL" || t.taskCategory === selectedCategory;
    const matchesSearch =
      t.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users2 className="w-6 h-6 text-[#2F6B9A]" /> Karyawan & Timesheet Lapangan (Workforce)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Presensi Tenaga Kerja Mandor, Jam Kerja Reguler & Lembur, Rekapitulasi Beban Upah Proyek.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData()}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
            title="Muat Ulang Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#2F6B9A] hover:bg-[#25567b] text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Input Presensi Harian
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Headcount
            </span>
            <Users2 className="w-4 h-4 text-[#2F6B9A]" />
          </div>
          <div className="text-2xl font-bold text-[#17324D] mt-1 font-mono">
            {summary ? summary.totalHeadcount : "..."} Personil
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Staff tetap & mandor terdaftar</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Hadir di Lapangan Hari Ini
            </span>
            <HardHat className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono">
            {summary ? summary.activeOnSiteToday : "..."} Orang
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Tingkat Presensi: {summary ? `${summary.attendanceRate}%` : "..."}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Jam Kerja Terdata
            </span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-1 font-mono">
            {summary ? `${summary.totalHoursWorked} Jam` : "..."}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Reguler + jam lembur (OT)</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Estimasi Beban Upah
            </span>
            <DollarSign className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 font-mono">
            {summary ? formatIDR(summary.totalWageExpense) : "..."}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Beban langsung upah WBS</div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("timesheets")}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
              activeTab === "timesheets"
                ? "bg-[#2F6B9A] text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Presensi & Timesheet Harian
          </button>
          <button
            onClick={() => setActiveTab("employees")}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
              activeTab === "employees"
                ? "bg-[#2F6B9A] text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Direktori Pegawai & Mandor
          </button>
        </div>

        {activeTab === "timesheets" && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 max-w-[200px] sm:max-w-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer w-full truncate"
              >
                <option value="ALL">Semua Pekerjaan</option>
                <option value="PEMBESIAN">Pembesian (Rebar)</option>
                <option value="BEKISTING">Bekisting (Formwork)</option>
                <option value="PENGECORAN">Pengecoran (Concrete)</option>
                <option value="ENGINEERING">Site Engineering</option>
                <option value="K3_SAFETY">Safety (K3)</option>
                <option value="QC_INSPEKSI">QC Inspeksi</option>
                <option value="FABRIKASI">Fabrikasi Baja</option>
              </select>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-auto">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atau catatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#2F6B9A] w-full sm:w-48"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Content Areas */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
          Memuat data presensi dan direktori tenaga kerja...
        </div>
      ) : activeTab === "timesheets" ? (
        /* TAB 1: Timesheets Table */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden xl:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Nama Tenaga Kerja</th>
                  <th className="py-3 px-4">Kategori Pekerjaan</th>
                  <th className="py-3 px-4 text-center">Reguler</th>
                  <th className="py-3 px-4 text-center">Lembur (OT)</th>
                  <th className="py-3 px-4 text-right">Tarif Dasar</th>
                  <th className="py-3 px-4 text-right">Total Upah Gross</th>
                  <th className="py-3 px-4">Catatan Aktivitas Lapangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTimesheets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Tidak ada catatan presensi yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredTimesheets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {new Date(t.workDate).toLocaleDateString("id-ID", {
                          dateStyle: "medium",
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{t.employeeName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {t.employeeCode} • {t.jobTitle}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {t.taskCategory}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-medium text-slate-700">
                        {t.hoursWorked} Jam
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        {t.overtimeHours > 0 ? (
                          <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px]">
                            +{t.overtimeHours} Jam
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        {formatIDR(t.dailyWage)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {formatIDR(t.totalGrossPay)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px] max-w-xs truncate">
                        {t.notes || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Card View */}
          <div className="block xl:hidden p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredTimesheets.length === 0 ? (
              <div className="col-span-full py-6 text-center text-xs text-slate-400">
                Tidak ada catatan presensi yang sesuai.
              </div>
            ) : (
              filteredTimesheets.map((t) => (
                <div key={t.id} className="bg-slate-50/50 rounded-xl border border-slate-200 p-4 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-slate-400">
                      {new Date(t.workDate).toLocaleDateString("id-ID", {
                        dateStyle: "medium",
                      })}
                    </span>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {t.taskCategory}
                    </span>
                  </div>
                  <div className="font-semibold text-xs text-slate-900">{t.employeeName}</div>
                  <div className="text-[11px] text-slate-400">
                    {t.employeeCode} • {t.jobTitle}
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                    <span className="text-slate-500">Jam Kerja:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {t.hoursWorked} Jam {t.overtimeHours > 0 && `(+${t.overtimeHours} OT)`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Total Upah:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {formatIDR(t.totalGrossPay)}
                    </span>
                  </div>
                  {t.notes && (
                    <div className="text-[11px] text-slate-500 bg-white p-2 rounded border border-slate-100">
                      {t.notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* TAB 2: Employees & Mandor Directory */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden xl:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Kode Pegawai</th>
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-4">Jabatan / Spesialisasi Mandor</th>
                  <th className="py-3 px-4">Departemen</th>
                  <th className="py-3 px-4 text-center">Total Jam Terdata</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {emp.employeeCode}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {emp.fullName}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{emp.jobTitle}</td>
                    <td className="py-3 px-4 text-slate-500">{emp.departmentName}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-blue-700">
                      {emp.totalHoursLogged} Jam
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Card View */}
          <div className="block xl:hidden p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {employees.map((emp) => (
              <div key={emp.id} className="bg-slate-50/50 rounded-xl border border-slate-200 p-4 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-900">{emp.employeeCode}</span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {emp.status}
                  </span>
                </div>
                <div className="font-semibold text-xs text-slate-900">{emp.fullName}</div>
                <div className="text-[11px] text-slate-500">
                  {emp.jobTitle} • {emp.departmentName}
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <span className="text-slate-500">Total Jam Terdata:</span>
                  <span className="font-mono font-bold text-blue-700">{emp.totalHoursLogged} Jam</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Input Presensi Harian */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <HardHat className="w-5 h-5 text-[#2F6B9A]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Input Presensi & Jam Kerja Lapangan
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTimesheet} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tenaga Kerja / Mandor
                </label>
                <select
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#2F6B9A]"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.employeeCode}>
                      {emp.employeeCode} - {emp.fullName} ({emp.jobTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Presensi
                  </label>
                  <input
                    type="date"
                    required
                    value={workDate}
                    onChange={(e) => setWorkDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#2F6B9A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Pekerjaan
                  </label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#2F6B9A]"
                  >
                    <option value="PEMBESIAN">PEMBESIAN (Rebar)</option>
                    <option value="BEKISTING">BEKISTING (Formwork)</option>
                    <option value="PENGECORAN">PENGECORAN (Concrete)</option>
                    <option value="ENGINEERING">ENGINEERING</option>
                    <option value="K3_SAFETY">K3 & SAFETY</option>
                    <option value="QC_INSPEKSI">QC INSPEKSI</option>
                    <option value="FABRIKASI">FABRIKASI BAJA</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jam Reguler
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    step="0.5"
                    required
                    value={hoursWorked}
                    onChange={(e) => setHoursWorked(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#2F6B9A] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jam Lembur (OT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="8"
                    step="0.5"
                    required
                    value={overtimeHours}
                    onChange={(e) => setOvertimeHours(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#2F6B9A] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tarif Upah Harian (IDR)
                </label>
                <input
                  type="number"
                  min="50000"
                  step="10000"
                  required
                  value={dailyWage}
                  onChange={(e) => setDailyWage(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#2F6B9A] font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Opname Lapangan
                </label>
                <input
                  type="text"
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Pemasangan tulangan Pier P-12"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#2F6B9A]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#2F6B9A] hover:bg-[#25567b] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan Presensi Harian"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
