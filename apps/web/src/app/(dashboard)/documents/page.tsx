"use client";

import { useState, useEffect } from "react";
import {
  FolderLock,
  FileText,
  Layers,
  FileCode,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  RotateCcw,
  X,
  Download,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileBox,
} from "lucide-react";

interface DocumentItem {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  documentNumber: string;
  category: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: string;
  version: number;
  uploadedBy: string;
  status: string;
  createdAt: string;
}

interface DocumentsSummary {
  totalDocuments: number;
  drawingCount: number;
  contractCount: number;
  permitCount: number;
  specCount: number;
  approvedCount: number;
  reviewCount: number;
  approvalRate: number;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [summary, setSummary] = useState<DocumentsSummary | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [docCategory, setDocCategory] = useState<string>("DRAWING");
  const [docNumber, setDocNumber] = useState<string>("");
  const [docTitle, setDocTitle] = useState<string>("");
  const [docDescription, setDocDescription] = useState<string>("");
  const [docFileType, setDocFileType] = useState<string>("DWG");
  const [docFileSize, setDocFileSize] = useState<string>("12.5 MB");
  const [docVersion, setDocVersion] = useState<number>(1);
  const [docAuthor, setDocAuthor] = useState<string>("Tim Engineering");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, docsRes] = await Promise.all([
        fetch("http://localhost:4000/api/v1/documents/summary"),
        fetch("http://localhost:4000/api/v1/documents?limit=50"),
      ]);

      if (sumRes.ok) {
        const sumJson = await sumRes.json();
        setSummary(sumJson.data);
      }

      if (docsRes.ok) {
        const docsJson = await docsRes.json();
        setDocuments(docsJson.data || []);
      }
    } catch (err) {
      console.error("Gagal mengambil data dokumen:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        projectCode: "PRJ-2026-LRT",
        documentNumber: docNumber.trim() || undefined,
        category: docCategory,
        title: docTitle.trim(),
        description: docDescription.trim(),
        fileType: docFileType,
        fileSize: docFileSize.trim(),
        version: Number(docVersion) || 1,
        uploadedBy: docAuthor.trim(),
        status: "APPROVED",
      };

      const res = await fetch("http://localhost:4000/api/v1/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const resJson = await res.json();
        setSuccessMsg(resJson.message || "Dokumen berhasil didaftarkan");
        setShowModal(false);
        // Reset form
        setDocNumber("");
        setDocTitle("");
        setDocDescription("");
        loadData();
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        alert("Gagal mendaftarkan dokumen. Periksa input data.");
      }
    } catch (err) {
      console.error("Error creating document:", err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchCategory =
      activeCategory === "ALL" || doc.category === activeCategory;
    const matchStatus =
      selectedStatus === "ALL" || doc.status === selectedStatus;
    const matchSearch =
      searchQuery === "" ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCategory && matchStatus && matchSearch;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "DRAWING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Layers className="w-3 h-3" /> Gambar Teknik / BIM
          </span>
        );
      case "CONTRACT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <FileText className="w-3 h-3" /> Kontrak EPC & ROW
          </span>
        );
      case "PERMIT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3 h-3" /> Perizinan PBG/AMDAL
          </span>
        );
      case "SPECIFICATION":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <FileCode className="w-3 h-3" /> Spesifikasi RKS
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">
            {category}
          </span>
        );
    }
  };

  const getFormatBadge = (fileType: string) => {
    switch (fileType?.toUpperCase()) {
      case "DWG":
        return (
          <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            DWG
          </span>
        );
      case "BIM":
      case "IFC":
        return (
          <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
            BIM (IFC)
          </span>
        );
      case "PDF":
        return (
          <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            PDF
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-slate-100 text-slate-700">
            {fileType || "DOC"}
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Disetujui
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> Sedang Direview
          </span>
        );
      case "SUPERSEDED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-300">
            <AlertCircle className="w-3 h-3 text-slate-500" /> Tergantikan
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <FolderLock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Dokumen & Gambar Teknik (DMS)
              </h1>
              <p className="text-sm text-slate-500">
                Repositori terpusat shop drawing BIM, kontrak EPC, perizinan PBG/AMDAL, dan spesifikasi RKS
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition"
            title="Refresh data dokumen"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Muat Ulang
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Unggah Dokumen
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-800 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-600 hover:text-emerald-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Arsip Dokumen</span>
            <FileBox className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {summary ? summary.totalDocuments : 0}
            </span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {summary ? `${summary.approvalRate}% Approved` : "100%"}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {summary ? summary.reviewCount : 0} dokumen dalam antrean review
          </p>
        </div>

        {/* KPI 2 */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Gambar Kerja & BIM</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {summary ? summary.drawingCount : 0}
            </span>
            <span className="text-xs text-slate-500">Revisi Terakhir</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Shop drawing pier, girder, & model BIM LOD 400
          </p>
        </div>

        {/* KPI 3 */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Kontrak & Addendum</span>
            <FileText className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {summary ? summary.contractCount : 0}
            </span>
            <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              FIDIC Silver
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Perjanjian EPC, subkontrak & ROW interchange
          </p>
        </div>

        {/* KPI 4 */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Perizinan & RKS</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {summary ? summary.permitCount + summary.specCount : 0}
            </span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Valid Pemprov DKI
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            PBG, AMDAL, serta SOP teknis mutu beton fc&apos; 45
          </p>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="space-y-3">
        {/* Responsive Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveCategory("ALL")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeCategory === "ALL"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua Dokumen ({documents.length})
          </button>
          <button
            onClick={() => setActiveCategory("DRAWING")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeCategory === "DRAWING"
                ? "bg-blue-600 text-white"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Gambar Kerja & BIM ({summary?.drawingCount || 0})
          </button>
          <button
            onClick={() => setActiveCategory("CONTRACT")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeCategory === "CONTRACT"
                ? "bg-purple-600 text-white"
                : "bg-purple-50 text-purple-700 hover:bg-purple-100"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Kontrak & Addendum ({summary?.contractCount || 0})
          </button>
          <button
            onClick={() => setActiveCategory("PERMIT")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeCategory === "PERMIT"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Perizinan PBG/AMDAL ({summary?.permitCount || 0})
          </button>
          <button
            onClick={() => setActiveCategory("SPECIFICATION")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeCategory === "SPECIFICATION"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Spesifikasi RKS ({summary?.specCount || 0})
          </button>
        </div>

        {/* Search & Filter Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nomor dokumen, judul gambar, deskripsi, atau author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                <option value="APPROVED">Disetujui (Approved)</option>
                <option value="UNDER_REVIEW">Review (Under Review)</option>
                <option value="SUPERSEDED">Tergantikan (Superseded)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Dual-Mode Responsive Layout */}
      {loading ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-xl">
          <RotateCcw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-xs text-slate-500">Memuat arsip repositori dokumen...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-xl">
          <FileText className="w-8 h-8 mx-auto text-slate-300" />
          <p className="mt-2 text-sm font-semibold text-slate-700">Tidak ada dokumen ditemukan</p>
          <p className="text-xs text-slate-500">
            Sesuaikan kata kunci pencarian atau filter kategori di atas.
          </p>
        </div>
      ) : (
        <>
          {/* Card View (< 1280px / xl:hidden) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:hidden">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {doc.documentNumber}
                    </span>
                    {getStatusBadge(doc.status)}
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 leading-snug">
                      {doc.title}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                      {doc.description || "Tidak ada deskripsi rincian dokumen."}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {getCategoryBadge(doc.category)}
                    {getFormatBadge(doc.fileType)}
                    <span className="text-[11px] text-slate-500 font-medium">
                      {doc.fileSize}
                    </span>
                    <span className="text-[11px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                      v{doc.version}.0
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div>
                    <span className="block font-medium text-slate-700 truncate max-w-[150px]">
                      {doc.uploadedBy}
                    </span>
                    <span className="text-[10px]">
                      {new Date(doc.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => alert(`Mengunduh file: ${doc.title} (${doc.fileUrl})`)}
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Unduh Dokumen"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => alert(`Membuka preview visual: ${doc.title}`)}
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Buka Preview"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= 1280px) */}
          <div className="hidden xl:block bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-32">No. Registrasi</th>
                  <th className="py-2.5 px-3">Judul Dokumen & Deskripsi</th>
                  <th className="py-2.5 px-3 w-36">Kategori</th>
                  <th className="py-2.5 px-3 w-28">Format & Size</th>
                  <th className="py-2.5 px-2 text-center w-14">Versi</th>
                  <th className="py-2.5 px-3 w-36">Pengunggah</th>
                  <th className="py-2.5 px-3 text-center w-28">Status</th>
                  <th className="py-2.5 px-3 text-right w-16">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 text-[11px]">
                      {doc.documentNumber}
                    </td>
                    <td className="py-2.5 px-3 max-w-[240px]">
                      <div className="font-semibold text-slate-900 truncate">{doc.title}</div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {doc.description || "-"}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      {getCategoryBadge(doc.category)}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1">
                        {getFormatBadge(doc.fileType)}
                        <span className="text-[10px] text-slate-500">{doc.fileSize}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold text-[10px]">
                        v{doc.version}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-800 truncate text-[11px]">{doc.uploadedBy}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(doc.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {getStatusBadge(doc.status)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => alert(`Mengunduh file: ${doc.title} (${doc.fileUrl})`)}
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Unduh Dokumen"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => alert(`Membuka preview visual: ${doc.title}`)}
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Buka Preview"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal: Unggah / Registrasi Dokumen */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                  <FolderLock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Registrasi Dokumen & Gambar Kerja
                  </h3>
                  <p className="text-xs text-slate-500">
                    Proyek: PRJ-2026-LRT (Stasiun LRT Dukuh Atas Hub)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterDocument} className="p-4 sm:p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Dokumen *
                  </label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="DRAWING">Gambar Kerja / BIM</option>
                    <option value="CONTRACT">Kontrak & Addendum</option>
                    <option value="PERMIT">Perizinan PBG/AMDAL</option>
                    <option value="SPECIFICATION">Spesifikasi Teknis (RKS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Dokumen (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: DWG-2026-005"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Dokumen Teknik *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Detail Penulangan Balok Girder Span 30M"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi / Catatan Perubahan
                </label>
                <textarea
                  rows={2}
                  placeholder="Rincian catatan elevasi, revisi koordinat, atau standar acuan..."
                  value={docDescription}
                  onChange={(e) => setDocDescription(e.target.value)}
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Format File
                  </label>
                  <select
                    value={docFileType}
                    onChange={(e) => setDocFileType(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DWG">DWG (AutoCAD)</option>
                    <option value="BIM">BIM (IFC / Revit)</option>
                    <option value="PDF">PDF Dokumen</option>
                    <option value="XLSX">Excel Spreadsheet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ukuran File
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 14.8 MB"
                    value={docFileSize}
                    onChange={(e) => setDocFileSize(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Revisi Versi
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={docVersion}
                    onChange={(e) => setDocVersion(Number(e.target.value))}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Author / Pengunggah *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Ir. Hendra Saputra (Chief Drafter)"
                  value={docAuthor}
                  onChange={(e) => setDocAuthor(e.target.value)}
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan Dokumen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
