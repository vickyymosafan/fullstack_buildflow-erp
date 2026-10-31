"use client";

import { useState } from "react";
import { HardHat, CloudSun, Users, PackageCheck, Camera, CheckCircle2, Save } from "lucide-react";

export default function SiteReportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [weather, setWeather] = useState("Cerah");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div>
          <h1 className="text-xl font-bold text-content-main flex items-center gap-2">
            <HardHat className="w-5 h-5 text-action" /> Laporan Harian Lapangan (DSR)
          </h1>
          <p className="text-xs text-content-muted">
            Input aktivitas harian, tenaga kerja, cuaca, dan konsumsi material di site proyek.
          </p>
        </div>
        <span className="text-[10px] font-mono bg-status-successBg text-status-success px-2 py-0.5 rounded border border-status-success/20">
          Mode Offline Tersedia
        </span>
      </div>

      {submitted && (
        <div className="p-3 bg-status-successBg border border-status-success/30 rounded-md text-xs text-status-success flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Laporan Harian berhasil disimpan ke ledger dan siap ditinjau Project Manager!</span>
        </div>
      )}

      {/* Field Form Card */}
      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg p-5 shadow-sm space-y-4">
        {/* Project & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-content-main mb-1">Pilih Proyek</label>
            <select className="w-full text-xs bg-background border border-border rounded-md px-3 py-2 text-content-main focus:outline-none focus:ring-1 focus:ring-action">
              <option value="PRJ-2026-001">PRJ-2026-001 — Menara 8 Office Tower</option>
              <option value="PRJ-2026-002">PRJ-2026-002 — Emerald Blok A</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-content-main mb-1">Tanggal Laporan</label>
            <input
              type="date"
              defaultValue="2026-10-31"
              className="w-full text-xs bg-background border border-border rounded-md px-3 py-2 text-content-main focus:outline-none focus:ring-1 focus:ring-action"
            />
          </div>
        </div>

        {/* Weather Condition */}
        <div>
          <label className="block text-xs font-semibold text-content-main mb-1 flex items-center gap-1.5">
            <CloudSun className="w-3.5 h-3.5 text-action" /> Kondisi Cuaca Lapangan
          </label>
          <div className="grid grid-cols-3 gap-2">
            {["Cerah", "Mendung", "Hujan / Hujan Deras"].map((w) => (
              <button
                type="button"
                key={w}
                onClick={() => setWeather(w)}
                className={`py-1.5 px-3 rounded-md text-xs font-medium border text-center transition-colors ${
                  weather === w
                    ? "bg-action text-white border-action"
                    : "bg-surface-subtle border-border text-content-main hover:bg-white"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Work Activities Description */}
        <div>
          <label className="block text-xs font-semibold text-content-main mb-1">Aktivitas & Progres Pekerjaan Hari Ini</label>
          <textarea
            rows={3}
            required
            placeholder="Contoh: Pengecoran slab lantai 5 zona barat, pemasangan bekisting kolom..."
            className="w-full text-xs bg-background border border-border rounded-md p-3 text-content-main focus:outline-none focus:ring-1 focus:ring-action"
            defaultValue="Pengecoran plat lantai 5 zona barat volume 24 m3. Inspeksi besi tulangan bersama Konsultan Pengawas lulus tanpa catatan NCR."
          />
        </div>

        {/* Workforce & Equipment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-content-main mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-action" /> Jumlah Tenaga Kerja
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Mandor"
                defaultValue={2}
                className="w-1/2 text-xs bg-background border border-border rounded-md px-3 py-2 text-content-main"
              />
              <input
                type="number"
                placeholder="Tukang / Pekerja"
                defaultValue={28}
                className="w-1/2 text-xs bg-background border border-border rounded-md px-3 py-2 text-content-main"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-content-main mb-1 flex items-center gap-1.5">
              <PackageCheck className="w-3.5 h-3.5 text-action" /> Material Terpakai (Consumptions)
            </label>
            <input
              type="text"
              defaultValue="Beton ReadyMix K-350: 24 m³, Besi D16: 45 btg"
              className="w-full text-xs bg-background border border-border rounded-md px-3 py-2 text-content-main"
            />
          </div>
        </div>

        {/* Photo Evidence Upload */}
        <div>
          <label className="block text-xs font-semibold text-content-main mb-1 flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-action" /> Bukti Foto Lapangan
          </label>
          <div className="border-2 border-dashed border-border rounded-md p-4 text-center bg-surface-subtle/50 hover:bg-surface-subtle transition-colors cursor-pointer">
            <Camera className="w-6 h-6 text-content-muted mx-auto mb-1" />
            <span className="text-xs text-content-muted block font-medium">Klik untuk mengambil foto atau upload gambar</span>
            <span className="text-[10px] text-content-muted/80 block mt-0.5">Maks. 5 foto (JPEG, PNG maks 10MB)</span>
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-content-main hover:bg-surface-subtle flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5 text-content-muted" /> Simpan Draft
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-action hover:bg-action-hover text-white rounded-md text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Kirim Laporan Harian
          </button>
        </div>
      </form>
    </div>
  );
}

