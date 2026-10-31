"use client";

import { useState, useEffect } from "react";
import {
  HardHat,
  CloudSun,
  Users,
  PackageCheck,
  Camera,
  CheckCircle2,
  Save,
  Wifi,
  WifiOff,
  History,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface SiteReport {
  id: string;
  reportDate: string;
  weather: string;
  workerCount: number;
  workSummary: string;
}

export default function SiteReportPage() {
  const [projectId, setProjectId] = useState("PRJ-2026-LRT");
  const [reportDate, setReportDate] = useState("2026-11-01");
  const [weather, setWeather] = useState("CERAH");
  const [mandorCount, setMandorCount] = useState(4);
  const [workerCount, setWorkerCount] = useState(82);
  const [workSummary, setWorkSummary] = useState(
    "Pengecoran plat lantai concourse stasiun LRT grid B-4 s.d C-9 volume 145 m3. Pengujian slump 12±2 cm dan pengambilan 8 sampel benda uji beton."
  );
  const [isOffline, setIsOffline] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recentReports, setRecentReports] = useState<SiteReport[]>([]);

  // Load past reports
  useEffect(() => {
    fetchRecentReports(projectId);
  }, [projectId]);

  // Check online/offline state
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Load offline draft if exists
    const saved = localStorage.getItem("buildflow_site_draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.workSummary) setWorkSummary(parsed.workSummary);
        if (parsed.weather) setWeather(parsed.weather);
        if (parsed.workerCount) setWorkerCount(parsed.workerCount);
        setDraftSaved(true);
      } catch (e) {}
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const fetchRecentReports = async (pid: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/v1/site-reports/project/${pid}`);
      if (res.ok) {
        const json = await res.json();
        setRecentReports(json.data || []);
      }
    } catch (e) {
      // Offline fallback
    }
  };

  const handleSaveDraft = () => {
    const draft = {
      projectId,
      reportDate,
      weather,
      workerCount: mandorCount + workerCount,
      workSummary,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem("buildflow_site_draft", JSON.stringify(draft));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const totalWorkers = Number(mandorCount) + Number(workerCount);

    try {
      const res = await fetch("http://localhost:4000/api/v1/site-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          reportDate,
          weather,
          workerCount: totalWorkers,
          workSummary,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.message || "Gagal menyimpan laporan");
      }

      const json = await res.json();
      setSuccessMessage("Laporan harian berhasil dikirim dan tersinkronisasi ke PostgreSQL server pusat!");
      localStorage.removeItem("buildflow_site_draft");
      fetchRecentReports(projectId);
    } catch (err: any) {
      // Save locally if network fails
      handleSaveDraft();
      setErrorMessage(
        "Koneksi jaringan terputus. Laporan otomatis disimpan di memori lokal (offline draft) dan siap disinkron saat online kembali."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title & Network Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <HardHat className="w-6 h-6 text-[#2F6B9A]" /> Laporan Harian Lapangan (Daily Site Report)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan real-time progres konstruksi, cuaca, jumlah tenaga kerja, dan konsumsi material di site.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isOffline ? (
            <span className="text-[11px] font-semibold bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1">
              <WifiOff className="w-3.5 h-3.5 text-rose-600" /> Mode Offline (Draft Aktif)
            </span>
          ) : (
            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5 text-emerald-600" /> Terhubung Server Pusat
            </span>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {draftSaved && (
        <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 flex items-center gap-2">
          <Save className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Draft tersimpan di penyimpanan lokal browser.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card (2 Cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Proyek Konstruksi</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2F6B9A]"
              >
                <option value="PRJ-2026-LRT">PRJ-2026-LRT — Stasiun LRT Dukuh Atas</option>
                <option value="PRJ-2026-TOL">PRJ-2026-TOL — Tol Patimban Seksi 2</option>
                <option value="PRJ-2025-HSP">PRJ-2025-HSP — RSUD Regional</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Laporan</label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2F6B9A]"
              />
            </div>
          </div>

          {/* Weather Badges */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <CloudSun className="w-3.5 h-3.5 text-[#2F6B9A]" /> Kondisi Cuaca Lapangan
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["CERAH", "MENDUNG", "HUJAN"].map((w) => (
                <button
                  type="button"
                  key={w}
                  onClick={() => setWeather(w)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border text-center transition-all ${
                    weather === w
                      ? "bg-[#17324D] text-white border-[#17324D] shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Work Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Aktivitas & Progres Pekerjaan Fisik Hari Ini
            </label>
            <textarea
              rows={3}
              required
              value={workSummary}
              onChange={(e) => setWorkSummary(e.target.value)}
              placeholder="Jelaskan zona pengecoran, pekerjaan pembesian, uji lab, atau kendala alat..."
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2F6B9A]"
            />
          </div>

          {/* Workforce Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#2F6B9A]" /> Jumlah Tenaga Kerja
              </label>
              <div className="flex gap-2">
                <div className="w-1/2">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Mandor / Pelaksana</span>
                  <input
                    type="number"
                    value={mandorCount}
                    onChange={(e) => setMandorCount(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div className="w-1/2">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Tukang & Pembantu</span>
                  <input
                    type="number"
                    value={workerCount}
                    onChange={(e) => setWorkerCount(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <PackageCheck className="w-3.5 h-3.5 text-[#2F6B9A]" /> Material Terpakai
              </label>
              <span className="text-[10px] text-slate-400 block mb-0.5">Volume & jenis material</span>
              <input
                type="text"
                defaultValue="Beton ReadyMix K-350: 145 m³, Besi D25: 65 btg"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
              />
            </div>
          </div>

          {/* Photo Evidence */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[#2F6B9A]" /> Bukti Dokumentasi Lapangan (Opname)
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer">
              <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <span className="text-xs text-slate-600 block font-medium">Klik untuk upload foto opname lapangan</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Maks. 5 foto geotagged (JPEG/PNG)</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" /> Simpan Draft Offline
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#2F6B9A] hover:bg-[#25567b] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> {submitting ? "Mengirim..." : "Kirim Laporan"}
            </button>
          </div>
        </form>

        {/* Recent Reports Timeline (1 Col) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-500" /> Riwayat Lapangan Terakhir
            </h3>
            <span className="text-[10px] text-slate-400">PostgreSQL Live</span>
          </div>

          <div className="space-y-3">
            {recentReports.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-6">Belum ada riwayat laporan tersimpan</div>
            ) : (
              recentReports.map((r) => (
                <div key={r.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#2F6B9A]" /> {r.reportDate}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-[#17324D]">
                      {r.weather} • {r.workerCount} Org
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {r.workSummary}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
