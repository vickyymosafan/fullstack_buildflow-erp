"use client";

import React, { useState } from "react";
import {
  Leaf,
  Factory,
  Zap,
  Boxes,
  Recycle,
  Award,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Sparkles,
  TrendingDown,
  Building,
  Fuel,
  Info,
  X,
  ShieldCheck,
} from "lucide-react";

interface EmissionRecord {
  id: string;
  projectId: string;
  projectName: string;
  scope: "SCOPE_1_DIRECT" | "SCOPE_2_INDIRECT" | "SCOPE_3_EMBODIED";
  sourceCategory: string;
  activityQuantity: number;
  activityUnit: string;
  emissionFactor: number;
  calculatedEmissionKgCO2e: number;
  calculatedEmissionTonsCO2e: number;
  recordedDate: string;
  notes?: string;
}

interface WasteRecord {
  id: string;
  projectId: string;
  projectName: string;
  wasteType: string;
  quantityTons: number;
  handlingMethod: string;
  isDivertedFromLandfill: boolean;
  manifestNumber?: string;
  disposalPartner?: string;
  recordedDate: string;
  notes?: string;
}

interface BghRating {
  projectId: string;
  projectCode: string;
  projectName: string;
  location: string;
  grossFloorAreaM2: number;
  categories: {
    tataKelolaTapak: number;
    efisiensiEnergi: number;
    konservasiAir: number;
    siklusMaterial: number;
    kualitasUdaraDalamRuang: number;
    pengelolaanSampah: number;
  };
  totalScore: number;
  ratingTier: "BGH_UTAMA" | "BGH_MADYA" | "BGH_PRATAMA" | "BELUM_MEMENUHI";
  auditStatus: "VERIFIED_PUPR" | "SELF_ASSESSED" | "IN_REVIEW";
}

interface DecarbonizationInitiative {
  id: string;
  projectId: string;
  projectName: string;
  initiativeName: string;
  category: string;
  targetReductionTonsCO2e: number;
  estimatedInvestment: number;
  targetCompletionDate: string;
  responsibleLead: string;
  description: string;
  status: "PROPOSED" | "APPROVED" | "IN_EXECUTION" | "COMPLETED";
}

export default function SustainabilityDashboard() {
  const [activeTab, setActiveTab] = useState<"carbon" | "waste" | "bgh" | "initiatives">("carbon");
  const [scopeFilter, setScopeFilter] = useState<string>("ALL");
  const [wasteFilter, setWasteFilter] = useState<string>("ALL");

  // Modals
  const [isLogEmissionOpen, setIsLogEmissionOpen] = useState(false);
  const [isLogWasteOpen, setIsLogWasteOpen] = useState(false);
  const [isCreateInitiativeOpen, setIsCreateInitiativeOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [emissionForm, setEmissionForm] = useState({
    projectId: "proj-002",
    scope: "SCOPE_1_DIRECT",
    sourceCategory: "HEAVY_EQUIPMENT_FUEL",
    activityQuantity: 5000,
    activityUnit: "LITER",
    notes: "",
  });

  const [wasteForm, setWasteForm] = useState({
    projectId: "proj-003",
    wasteType: "CONCRETE_RUBBLE",
    quantityTons: 35.0,
    handlingMethod: "RECYCLED_ONSITE",
    manifestNumber: "",
    disposalPartner: "",
    notes: "",
  });

  const [initiativeForm, setInitiativeForm] = useState({
    projectId: "proj-001",
    initiativeName: "",
    category: "LOW_CARBON_MATERIAL",
    targetReductionTonsCO2e: 50,
    estimatedInvestment: 250000000,
    targetCompletionDate: "2026-12-31",
    responsibleLead: "",
    description: "",
  });

  // Data
  const [emissions, setEmissions] = useState<EmissionRecord[]>([
    {
      id: "ems-001",
      projectId: "proj-003",
      projectName: "Pembangunan Jalan Tol Akses Patimban Paket 3",
      scope: "SCOPE_1_DIRECT",
      sourceCategory: "HEAVY_EQUIPMENT_FUEL",
      activityQuantity: 18400,
      activityUnit: "LITER",
      emissionFactor: 2.68,
      calculatedEmissionKgCO2e: 49312,
      calculatedEmissionTonsCO2e: 49.31,
      recordedDate: "2026-11-01T08:00:00.000Z",
      notes: "Operasional 6 unit Excavator PC200 & 4 Bulldozer D85",
    },
    {
      id: "ems-002",
      projectId: "proj-002",
      projectName: "Pembangunan Rusun ASN Kawasan Inti IKN",
      scope: "SCOPE_2_INDIRECT",
      sourceCategory: "GRID_ELECTRICITY",
      activityQuantity: 42500,
      activityUnit: "KWH",
      emissionFactor: 0.79,
      calculatedEmissionKgCO2e: 33575,
      calculatedEmissionTonsCO2e: 33.58,
      recordedDate: "2026-11-02T10:00:00.000Z",
      notes: "Konsumsi daya gardu sementara & penerangan tower crane 24 jam",
    },
    {
      id: "ems-003",
      projectId: "proj-002",
      projectName: "Pembangunan Rusun ASN Kawasan Inti IKN",
      scope: "SCOPE_3_EMBODIED",
      sourceCategory: "CONCRETE_MATERIAL",
      activityQuantity: 1250,
      activityUnit: "M3",
      emissionFactor: 345.0,
      calculatedEmissionKgCO2e: 431250,
      calculatedEmissionTonsCO2e: 431.25,
      recordedDate: "2026-11-03T14:30:00.000Z",
      notes: "Pengecoran plat lantai 8 modul precast batching plant",
    },
    {
      id: "ems-004",
      projectId: "proj-001",
      projectName: "Pembangunan Stasiun LRT Hub Dukuh Atas",
      scope: "SCOPE_3_EMBODIED",
      sourceCategory: "STEEL_REBAR",
      activityQuantity: 180,
      activityUnit: "TON",
      emissionFactor: 1850.0,
      calculatedEmissionKgCO2e: 333000,
      calculatedEmissionTonsCO2e: 333.0,
      recordedDate: "2026-11-04T09:15:00.000Z",
      notes: "Pabrikasi rangka atap baja kanopi canilever stasiun",
    },
    {
      id: "ems-005",
      projectId: "proj-004",
      projectName: "Pembangunan Bendungan Pengendali Banjir Citarum",
      scope: "SCOPE_1_DIRECT",
      sourceCategory: "GENERATOR_FUEL",
      activityQuantity: 6500,
      activityUnit: "LITER",
      emissionFactor: 2.68,
      calculatedEmissionKgCO2e: 17420,
      calculatedEmissionTonsCO2e: 17.42,
      recordedDate: "2026-11-05T16:00:00.000Z",
      notes: "Genset utama terowongan pengelak spillway",
    },
  ]);

  const [wasteEntries, setWasteEntries] = useState<WasteRecord[]>([
    {
      id: "wst-001",
      projectId: "proj-003",
      projectName: "Pembangunan Jalan Tol Akses Patimban Paket 3",
      wasteType: "SOIL_SPOIL",
      quantityTons: 420.0,
      handlingMethod: "SALVAGED_REUSE",
      isDivertedFromLandfill: true,
      recordedDate: "2026-11-01T11:00:00.000Z",
      notes: "Tanah galian dimanfaatkan kembali untuk timbunan sub-base trase frontage",
    },
    {
      id: "wst-002",
      projectId: "proj-002",
      projectName: "Pembangunan Rusun ASN Kawasan Inti IKN",
      wasteType: "CONCRETE_RUBBLE",
      quantityTons: 85.5,
      handlingMethod: "RECYCLED_ONSITE",
      isDivertedFromLandfill: true,
      recordedDate: "2026-11-02T15:20:00.000Z",
      notes: "Pecahan beton dihancurkan mesin crusher untuk agregat lapis pondasi kerja",
    },
    {
      id: "wst-003",
      projectId: "proj-001",
      projectName: "Pembangunan Stasiun LRT Hub Dukuh Atas",
      wasteType: "SCRAP_METAL",
      quantityTons: 24.8,
      handlingMethod: "OFFSITE_RECYCLING_PARTNER",
      isDivertedFromLandfill: true,
      disposalPartner: "PT Aneka Daur Ulang Logam Mandiri",
      recordedDate: "2026-11-03T13:45:00.000Z",
      notes: "Besi sisa pemotongan rebar disalurkan ke peleburan daur ulang resmi",
    },
    {
      id: "wst-004",
      projectId: "proj-004",
      projectName: "Pembangunan Bendungan Pengendali Banjir Citarum",
      wasteType: "HAZARDOUS_B3",
      quantityTons: 3.2,
      handlingMethod: "LICENSED_B3_DISPOSAL",
      isDivertedFromLandfill: true,
      manifestNumber: "KLHK-B3-2026-88192",
      disposalPartner: "PT Wastec International (Izin KLHK)",
      recordedDate: "2026-11-04T10:30:00.000Z",
      notes: "Oli bekas filter alat berat & residu cairan formwork chemical",
    },
    {
      id: "wst-005",
      projectId: "proj-005",
      projectName: "Kawasan Industri Terpadu Batang Phase 2",
      wasteType: "PACKAGING_PLASTIC",
      quantityTons: 12.0,
      handlingMethod: "LANDFILL",
      isDivertedFromLandfill: false,
      disposalPartner: "TPA Daerah Batang",
      recordedDate: "2026-11-05T09:00:00.000Z",
      notes: "Plastik kemasan wrapping semen non-recyclable terkontaminasi",
    },
  ]);

  const [bghRatings] = useState<BghRating[]>([
    {
      projectId: "proj-002",
      projectCode: "PRJ-IKN-002",
      projectName: "Pembangunan Rusun ASN Kawasan Inti IKN",
      location: "Sepaku, Penajam Paser Utara (IKN)",
      grossFloorAreaM2: 38200,
      categories: {
        tataKelolaTapak: 18,
        efisiensiEnergi: 23,
        konservasiAir: 19,
        siklusMaterial: 14,
        kualitasUdaraDalamRuang: 9,
        pengelolaanSampah: 9,
      },
      totalScore: 92,
      ratingTier: "BGH_UTAMA",
      auditStatus: "VERIFIED_PUPR",
    },
    {
      projectId: "proj-001",
      projectCode: "PRJ-LRT-001",
      projectName: "Pembangunan Stasiun LRT Hub Dukuh Atas",
      location: "Dukuh Atas, Jakarta Pusat",
      grossFloorAreaM2: 24500,
      categories: {
        tataKelolaTapak: 16,
        efisiensiEnergi: 20,
        konservasiAir: 15,
        siklusMaterial: 12,
        kualitasUdaraDalamRuang: 8,
        pengelolaanSampah: 8,
      },
      totalScore: 79,
      ratingTier: "BGH_MADYA",
      auditStatus: "SELF_ASSESSED",
    },
    {
      projectId: "proj-005",
      projectCode: "PRJ-IND-005",
      projectName: "Kawasan Industri Terpadu Batang Phase 2",
      location: "Batang, Jawa Tengah",
      grossFloorAreaM2: 64000,
      categories: {
        tataKelolaTapak: 14,
        efisiensiEnergi: 18,
        konservasiAir: 14,
        siklusMaterial: 10,
        kualitasUdaraDalamRuang: 7,
        pengelolaanSampah: 7,
      },
      totalScore: 70,
      ratingTier: "BGH_MADYA",
      auditStatus: "IN_REVIEW",
    },
    {
      projectId: "proj-004",
      projectCode: "PRJ-SDA-004",
      projectName: "Pembangunan Bendungan Pengendali Banjir Citarum",
      location: "Kabupaten Bandung Barat, Jawa Barat",
      grossFloorAreaM2: 120000,
      categories: {
        tataKelolaTapak: 12,
        efisiensiEnergi: 15,
        konservasiAir: 12,
        siklusMaterial: 9,
        kualitasUdaraDalamRuang: 6,
        pengelolaanSampah: 6,
      },
      totalScore: 60,
      ratingTier: "BGH_PRATAMA",
      auditStatus: "SELF_ASSESSED",
    },
  ]);

  const [initiatives, setInitiatives] = useState<DecarbonizationInitiative[]>([
    {
      id: "ini-001",
      projectId: "proj-002",
      projectName: "Pembangunan Rusun ASN Kawasan Inti IKN",
      initiativeName: "Substitusi Semen Portland dengan Fly-Ash & Slag Low-Carbon Cement",
      category: "LOW_CARBON_MATERIAL",
      targetReductionTonsCO2e: 180.0,
      estimatedInvestment: 450000000,
      targetCompletionDate: "2026-12-15",
      responsibleLead: "Ir. Hendra Kusuma (Lead Materials Engineer)",
      description: "Penggantian 30% binder klinker dengan fly ash bersertifikat SNI untuk menurunkan embodied carbon struktur.",
      status: "APPROVED",
    },
    {
      id: "ini-002",
      projectId: "proj-001",
      projectName: "Pembangunan Stasiun LRT Hub Dukuh Atas",
      initiativeName: "Pemasangan Solar PV Rooftop 120 kWp pada Site Office & Workshop",
      category: "RENEWABLE_ENERGY",
      targetReductionTonsCO2e: 64.5,
      estimatedInvestment: 820000000,
      targetCompletionDate: "2026-11-30",
      responsibleLead: "Agus Santoso, ST (Site MEP Manager)",
      description: "Pemasangan panel surya fotovoltaik on-grid untuk menyuplai 45% konsumsi listrik kerja harian stasiun.",
      status: "IN_EXECUTION",
    },
    {
      id: "ini-003",
      projectId: "proj-003",
      projectName: "Pembangunan Jalan Tol Akses Patimban Paket 3",
      initiativeName: "In-Situ Concrete Recycling & Cold In-Place Recycling (CIR) Pavement",
      category: "WASTE_REDUCTION",
      targetReductionTonsCO2e: 210.0,
      estimatedInvestment: 1200000000,
      targetCompletionDate: "2027-01-31",
      responsibleLead: "Bambang Irawan (Project Manager Patimban)",
      description: "Daur ulang dingin material rigid pavement eksisting menjadi sub-base baru tanpa pembuangan ke landfill.",
      status: "PROPOSED",
    },
  ]);

  // Aggregate Metrics
  const scope1Total = emissions
    .filter((e) => e.scope === "SCOPE_1_DIRECT")
    .reduce((acc, curr) => acc + curr.calculatedEmissionTonsCO2e, 0);

  const scope2Total = emissions
    .filter((e) => e.scope === "SCOPE_2_INDIRECT")
    .reduce((acc, curr) => acc + curr.calculatedEmissionTonsCO2e, 0);

  const scope3Total = emissions
    .filter((e) => e.scope === "SCOPE_3_EMBODIED")
    .reduce((acc, curr) => acc + curr.calculatedEmissionTonsCO2e, 0);

  const totalCarbon = (scope1Total + scope2Total + scope3Total).toFixed(2);

  const totalWaste = wasteEntries.reduce((acc, curr) => acc + curr.quantityTons, 0);
  const divertedWaste = wasteEntries
    .filter((w) => w.isDivertedFromLandfill)
    .reduce((acc, curr) => acc + curr.quantityTons, 0);
  const diversionRate = totalWaste > 0 ? ((divertedWaste / totalWaste) * 100).toFixed(1) : "0";

  const avgBghScore = (
    bghRatings.reduce((acc, curr) => acc + curr.totalScore, 0) / bghRatings.length
  ).toFixed(1);

  const totalPlannedReduction = initiatives.reduce(
    (acc, curr) => acc + curr.targetReductionTonsCO2e,
    0
  );

  // Handlers
  const handleLogEmission = (e: React.FormEvent) => {
    e.preventDefault();
    const factor =
      emissionForm.sourceCategory === "HEAVY_EQUIPMENT_FUEL" ||
      emissionForm.sourceCategory === "GENERATOR_FUEL"
        ? 2.68
        : emissionForm.sourceCategory === "GRID_ELECTRICITY"
        ? 0.79
        : emissionForm.sourceCategory === "CONCRETE_MATERIAL"
        ? 345.0
        : 1850.0;

    const kgCO2e = emissionForm.activityQuantity * factor;
    const tonsCO2e = Number((kgCO2e / 1000).toFixed(2));

    const newRecord: EmissionRecord = {
      id: `ems-${Date.now()}`,
      projectId: emissionForm.projectId,
      projectName:
        emissionForm.projectId === "proj-001"
          ? "Pembangunan Stasiun LRT Hub Dukuh Atas"
          : emissionForm.projectId === "proj-002"
          ? "Pembangunan Rusun ASN Kawasan Inti IKN"
          : "Pembangunan Jalan Tol Akses Patimban Paket 3",
      scope: emissionForm.scope as any,
      sourceCategory: emissionForm.sourceCategory,
      activityQuantity: Number(emissionForm.activityQuantity),
      activityUnit: emissionForm.activityUnit,
      emissionFactor: factor,
      calculatedEmissionKgCO2e: kgCO2e,
      calculatedEmissionTonsCO2e: tonsCO2e,
      recordedDate: new Date().toISOString(),
      notes: emissionForm.notes,
    };

    setEmissions([newRecord, ...emissions]);
    setIsLogEmissionOpen(false);
    setToastMessage(`Sukses mencatat ${tonsCO2e} Ton CO2e emisi baru.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleLogWaste = (e: React.FormEvent) => {
    e.preventDefault();
    const isDiverted = wasteForm.handlingMethod !== "LANDFILL";

    const newWaste: WasteRecord = {
      id: `wst-${Date.now()}`,
      projectId: wasteForm.projectId,
      projectName:
        wasteForm.projectId === "proj-003"
          ? "Pembangunan Jalan Tol Akses Patimban Paket 3"
          : "Pembangunan Rusun ASN Kawasan Inti IKN",
      wasteType: wasteForm.wasteType,
      quantityTons: Number(wasteForm.quantityTons),
      handlingMethod: wasteForm.handlingMethod,
      isDivertedFromLandfill: isDiverted,
      manifestNumber: wasteForm.manifestNumber || undefined,
      disposalPartner: wasteForm.disposalPartner || undefined,
      recordedDate: new Date().toISOString(),
      notes: wasteForm.notes,
    };

    setWasteEntries([newWaste, ...wasteEntries]);
    setIsLogWasteOpen(false);
    setToastMessage(`Catatan limbah ${wasteForm.quantityTons} Ton berhasil disimpan.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateInitiative = (e: React.FormEvent) => {
    e.preventDefault();
    const newInit: DecarbonizationInitiative = {
      id: `ini-${Date.now()}`,
      projectId: initiativeForm.projectId,
      projectName:
        initiativeForm.projectId === "proj-001"
          ? "Pembangunan Stasiun LRT Hub Dukuh Atas"
          : "Pembangunan Rusun ASN Kawasan Inti IKN",
      initiativeName: initiativeForm.initiativeName,
      category: initiativeForm.category,
      targetReductionTonsCO2e: Number(initiativeForm.targetReductionTonsCO2e),
      estimatedInvestment: Number(initiativeForm.estimatedInvestment),
      targetCompletionDate: initiativeForm.targetCompletionDate,
      responsibleLead: initiativeForm.responsibleLead || "Sustainability Officer",
      description: initiativeForm.description,
      status: "PROPOSED",
    };

    setInitiatives([newInit, ...initiatives]);
    setIsCreateInitiativeOpen(false);
    setToastMessage(`Proposal inisiatif ${newInit.initiativeName} diajukan.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApproveInitiative = (id: string) => {
    setInitiatives(
      initiatives.map((i) => (i.id === id ? { ...i, status: "APPROVED" as const } : i))
    );
    setToastMessage("Inisiatif dekarbonisasi disetujui untuk dialokasikan anggaran.");
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-xl flex items-center space-x-2 border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-700/60 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Sustainability & Green Construction ESG
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Permen PUPR 09/2021
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Akuntansi Jejak Karbon Scope 1, 2, 3, Neraca Limbah CDW, & Sertifikasi Bangunan Gedung Hijau
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsLogEmissionOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Emisi</span>
          </button>
          <button
            onClick={() => setIsLogWasteOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors shadow-sm"
          >
            <Recycle className="w-4 h-4" />
            <span>Catat Limbah</span>
          </button>
          <button
            onClick={() => setIsCreateInitiativeOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors shadow-sm border border-slate-600"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Inisiatif Hijau</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Carbon */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Total Jejak Karbon
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono mt-1">
                {totalCarbon} <span className="text-xs font-sans text-slate-400 font-normal">Ton CO2e</span>
              </h3>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Factory className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700/50 flex justify-between text-xs text-slate-400">
            <span>S1: {scope1Total.toFixed(1)}t</span>
            <span>S2: {scope2Total.toFixed(1)}t</span>
            <span className="text-emerald-400 font-medium">S3: {scope3Total.toFixed(1)}t</span>
          </div>
        </div>

        {/* Card 2: Waste Diversion Rate */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                CDW Diversion Rate
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-teal-300 font-mono mt-1">
                {diversionRate}%
              </h3>
            </div>
            <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400">
              <Recycle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs">
            <span className="text-slate-400">Target PUPR: 75%</span>
            <span className="text-emerald-400 font-semibold flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Memenuhi
            </span>
          </div>
        </div>

        {/* Card 3: BGH Portfolio Rating */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Rating Portofolio BGH
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono mt-1">
                {avgBghScore} <span className="text-xs font-sans text-slate-400 font-normal">/ 100</span>
              </h3>
            </div>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs">
            <span className="text-slate-400">Klasifikasi Korporat</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              BGH MADYA
            </span>
          </div>
        </div>

        {/* Card 4: Decarbonization Target */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Target Reduksi Emisi
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-sky-400 font-mono mt-1">
                {totalPlannedReduction} <span className="text-xs font-sans text-slate-400 font-normal">Ton CO2e</span>
              </h3>
            </div>
            <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
            <span>{initiatives.length} Inisiatif Aktif</span>
            <span className="text-sky-300 font-medium">Net-Zero 2050</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap border-b border-slate-700/60 gap-1 sm:gap-2">
        <button
          onClick={() => setActiveTab("carbon")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${
            activeTab === "carbon"
              ? "border-emerald-500 text-emerald-400 bg-slate-800/40"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20"
          }`}
        >
          <div className="flex items-center space-x-2">
            <Factory className="w-4 h-4" />
            <span>Akuntansi Karbon (Scope 1, 2, 3)</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("waste")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${
            activeTab === "waste"
              ? "border-teal-500 text-teal-400 bg-slate-800/40"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20"
          }`}
        >
          <div className="flex items-center space-x-2">
            <Recycle className="w-4 h-4" />
            <span>Limbah Konstruksi & Daur Ulang</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("bgh")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${
            activeTab === "bgh"
              ? "border-amber-500 text-amber-400 bg-slate-800/40"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20"
          }`}
        >
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4" />
            <span>Bangunan Gedung Hijau (BGH PUPR)</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("initiatives")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${
            activeTab === "initiatives"
              ? "border-sky-500 text-sky-400 bg-slate-800/40"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20"
          }`}
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>Inisiatif Dekarbonisasi ({initiatives.length})</span>
          </div>
        </button>
      </div>

      {/* TAB 1: Carbon Accounting */}
      {activeTab === "carbon" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Filter Scope Emisi:</span>
              <select
                value={scopeFilter}
                onChange={(e) => setScopeFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ALL">Semua Cakupan (Scope 1, 2, 3)</option>
                <option value="SCOPE_1_DIRECT">Scope 1 (BBM Alat Berat & Genset)</option>
                <option value="SCOPE_2_INDIRECT">Scope 2 (Listrik Grid Lapangan)</option>
                <option value="SCOPE_3_EMBODIED">Scope 3 (Embodied Material Beton/Baja)</option>
              </select>
            </div>
            <div className="text-xs text-slate-400">
              Menampilkan {emissions.filter((e) => scopeFilter === "ALL" || e.scope === scopeFilter).length} entri pencatatan emisi
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-700/70 bg-slate-800/80 text-slate-300">
                    <th className="py-3 px-4 font-semibold">Proyek & Tanggal</th>
                    <th className="py-3 px-4 font-semibold">Scope & Sumber</th>
                    <th className="py-3 px-4 font-semibold text-right">Aktivitas Terukur</th>
                    <th className="py-3 px-4 font-semibold text-right">Faktor Emisi</th>
                    <th className="py-3 px-4 font-semibold text-right">Kalkulasi Emisi</th>
                    <th className="py-3 px-4 font-semibold">Keterangan Teknis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40 text-slate-300">
                  {emissions
                    .filter((e) => scopeFilter === "ALL" || e.scope === scopeFilter)
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{item.projectName}</div>
                          <div className="text-[11px] text-slate-400">
                            {new Date(item.recordedDate).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                              item.scope === "SCOPE_1_DIRECT"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                : item.scope === "SCOPE_2_INDIRECT"
                                ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            }`}
                          >
                            {item.scope.replace(/_/g, " ")}
                          </span>
                          <div className="text-[11px] text-slate-400 mt-1">
                            {item.sourceCategory.replace(/_/g, " ")}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          {item.activityQuantity.toLocaleString("id-ID")} {item.activityUnit}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-400">
                          {item.emissionFactor} kg/unit
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono font-bold text-emerald-400 text-sm">
                            {item.calculatedEmissionTonsCO2e.toFixed(2)}
                          </span>{" "}
                          <span className="text-[11px] text-slate-400">Ton CO2e</span>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-slate-400" title={item.notes}>
                          {item.notes || "-"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Waste Management */}
      {activeTab === "waste" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Filter Tipe Limbah:</span>
              <select
                value={wasteFilter}
                onChange={(e) => setWasteFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-teal-500"
              >
                <option value="ALL">Semua Jenis Limbah</option>
                <option value="SOIL_SPOIL">Tanah Galian (Soil Spoil)</option>
                <option value="CONCRETE_RUBBLE">Pecahan Beton (Concrete Rubble)</option>
                <option value="SCRAP_METAL">Besi Scraps (Scrap Metal)</option>
                <option value="HAZARDOUS_B3">Limbah Bahan Berbahaya (B3)</option>
                <option value="PACKAGING_PLASTIC">Plastik Kemasan (Packaging)</option>
              </select>
            </div>
            <div className="text-xs text-emerald-400 font-medium">
              Tingkat Daur Ulang & Pengalihan TPA: {diversionRate}%
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-700/70 bg-slate-800/80 text-slate-300">
                    <th className="py-3 px-4 font-semibold">Proyek & Tanggal</th>
                    <th className="py-3 px-4 font-semibold">Jenis Limbah</th>
                    <th className="py-3 px-4 font-semibold text-right">Volume (Ton)</th>
                    <th className="py-3 px-4 font-semibold">Metode Penanganan</th>
                    <th className="py-3 px-4 font-semibold">Status Pengalihan TPA</th>
                    <th className="py-3 px-4 font-semibold">Manifes / Rekanan Berizin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40 text-slate-300">
                  {wasteEntries
                    .filter((w) => wasteFilter === "ALL" || w.wasteType === wasteFilter)
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{item.projectName}</div>
                          <div className="text-[11px] text-slate-400">
                            {new Date(item.recordedDate).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-200">
                          {item.wasteType.replace(/_/g, " ")}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-teal-300">
                          {item.quantityTons.toFixed(1)} Ton
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-300 text-[11px]">
                            {item.handlingMethod.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {item.isDivertedFromLandfill ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> DIVERSI (DAUR ULANG)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              <AlertTriangle className="w-3 h-3 mr-1" /> PEMBUANGAN TPA
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-400">
                          {item.manifestNumber && (
                            <div className="font-mono text-emerald-400">{item.manifestNumber}</div>
                          )}
                          <div>{item.disposalPartner || "Pengolahan In-Situ Proyek"}</div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BGH Rating */}
      {activeTab === "bgh" && (
        <div className="space-y-4">
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Standar Teknis Bangunan Gedung Hijau (Permen PUPR No. 9/2021)
                </h3>
                <p className="text-xs text-slate-400">
                  Ambang batas kelulusan sertifikasi: BGH Utama (≥80 Poin), BGH Madya (≥65 Poin), BGH Pratama (≥50 Poin)
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold">
              Kementerian PUPR Terakreditasi
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bghRatings.map((rating) => (
              <div
                key={rating.projectId}
                className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-colors shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-mono text-emerald-400">{rating.projectCode}</span>
                    <h4 className="text-base font-bold text-white mt-0.5">{rating.projectName}</h4>
                    <p className="text-xs text-slate-400">{rating.location} • GFA: {rating.grossFloorAreaM2.toLocaleString("id-ID")} m²</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded text-xs font-extrabold border ${
                        rating.ratingTier === "BGH_UTAMA"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      }`}
                    >
                      {rating.ratingTier.replace(/_/g, " ")}
                    </span>
                    <div className="text-2xl font-black font-mono text-white mt-1">
                      {rating.totalScore} <span className="text-xs text-slate-400 font-sans font-normal">/ 100</span>
                    </div>
                  </div>
                </div>

                {/* Categories progress */}
                <div className="mt-4 pt-3 border-t border-slate-700/40 space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                      <span>Tata Kelola Tapak</span>
                      <span className="font-mono">{rating.categories.tataKelolaTapak} / 20</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full"
                        style={{ width: `${(rating.categories.tataKelolaTapak / 20) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                      <span>Efisiensi & Konservasi Energi</span>
                      <span className="font-mono">{rating.categories.efisiensiEnergi} / 25</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-teal-400 h-1.5 rounded-full"
                        style={{ width: `${(rating.categories.efisiensiEnergi / 25) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                      <span>Konservasi Air</span>
                      <span className="font-mono">{rating.categories.konservasiAir} / 20</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-sky-400 h-1.5 rounded-full"
                        style={{ width: `${(rating.categories.konservasiAir / 20) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                      <span>Siklus Material Rendah Karbon</span>
                      <span className="font-mono">{rating.categories.siklusMaterial} / 15</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-400 h-1.5 rounded-full"
                        style={{ width: `${(rating.categories.siklusMaterial / 15) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/40 flex justify-between items-center text-xs text-slate-400">
                  <span className="flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-1 text-emerald-400" />
                    Status Audit: <strong className="text-slate-200 ml-1">{rating.auditStatus.replace(/_/g, " ")}</strong>
                  </span>
                  <button className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold underline">
                    Unduh Sertifikat PUPR
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Decarbonization Initiatives */}
      {activeTab === "initiatives" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {initiatives.map((item) => (
              <div
                key={item.id}
                className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                      {item.category.replace(/_/g, " ")}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        item.status === "APPROVED" || item.status === "IN_EXECUTION"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-slate-700 text-slate-300 border-slate-600"
                      }`}
                    >
                      {item.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mt-2.5 leading-snug">
                    {item.initiativeName}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">{item.projectName}</p>
                  <p className="text-xs text-slate-300 mt-2.5 leading-relaxed bg-slate-900/40 p-2.5 rounded-lg border border-slate-700/30">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/40 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Target Reduksi:</span>
                    <strong className="text-emerald-400 font-mono">
                      {item.targetReductionTonsCO2e} Ton CO2e
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Estimasi Investasi:</span>
                    <strong className="text-slate-200 font-mono">
                      Rp {item.estimatedInvestment.toLocaleString("id-ID")}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Target Selesai:</span>
                    <span className="text-slate-300">{item.targetCompletionDate}</span>
                  </div>

                  {item.status === "PROPOSED" && (
                    <button
                      onClick={() => handleApproveInitiative(item.id)}
                      className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm"
                    >
                      Setujui Program Investasi Hijau
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Catat Emisi */}
      {isLogEmissionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsLogEmissionOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 text-emerald-400 mb-4">
              <Factory className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white">Catat Jejak Karbon Konstruksi</h3>
            </div>

            <form onSubmit={handleLogEmission} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Pilih Proyek</label>
                <select
                  value={emissionForm.projectId}
                  onChange={(e) => setEmissionForm({ ...emissionForm, projectId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                >
                  <option value="proj-001">PRJ-LRT-001: Pembangunan Stasiun LRT Hub Dukuh Atas</option>
                  <option value="proj-002">PRJ-IKN-002: Pembangunan Rusun ASN Kawasan Inti IKN</option>
                  <option value="proj-003">PRJ-TOL-003: Pembangunan Jalan Tol Akses Patimban Paket 3</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Cakupan Emisi (Scope)</label>
                  <select
                    value={emissionForm.scope}
                    onChange={(e) => setEmissionForm({ ...emissionForm, scope: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  >
                    <option value="SCOPE_1_DIRECT">Scope 1: Emisi Langsung BBM</option>
                    <option value="SCOPE_2_INDIRECT">Scope 2: Listrik PLN Lapangan</option>
                    <option value="SCOPE_3_EMBODIED">Scope 3: Embodied Carbon Material</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Kategori Sumber</label>
                  <select
                    value={emissionForm.sourceCategory}
                    onChange={(e) => setEmissionForm({ ...emissionForm, sourceCategory: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  >
                    <option value="HEAVY_EQUIPMENT_FUEL">BBM Alat Berat (Solar)</option>
                    <option value="GENERATOR_FUEL">BBM Genset Lapangan (Solar)</option>
                    <option value="GRID_ELECTRICITY">Listrik Grid PLN (kWh)</option>
                    <option value="CONCRETE_MATERIAL">Beton Ready-Mix (m3)</option>
                    <option value="STEEL_REBAR">Baja Tulangan (Ton)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Kuantitas Terukur</label>
                  <input
                    type="number"
                    value={emissionForm.activityQuantity}
                    onChange={(e) => setEmissionForm({ ...emissionForm, activityQuantity: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Satuan</label>
                  <select
                    value={emissionForm.activityUnit}
                    onChange={(e) => setEmissionForm({ ...emissionForm, activityUnit: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  >
                    <option value="LITER">Liter</option>
                    <option value="KWH">kWh</option>
                    <option value="M3">M3</option>
                    <option value="TON">Ton</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Catatan Lapangan / No. DO Pengiriman</label>
                <textarea
                  value={emissionForm.notes}
                  onChange={(e) => setEmissionForm({ ...emissionForm, notes: e.target.value })}
                  placeholder="Contoh: Pengisian solar harian batching plant atau pengecoran plat lantai..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 h-20"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsLogEmissionOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 font-semibold"
                >
                  Simpan & Hitung Emisi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Catat Limbah */}
      {isLogWasteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsLogWasteOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 text-teal-400 mb-4">
              <Recycle className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white">Catat Neraca Limbah Konstruksi (CDW)</h3>
            </div>

            <form onSubmit={handleLogWaste} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Pilih Proyek</label>
                <select
                  value={wasteForm.projectId}
                  onChange={(e) => setWasteForm({ ...wasteForm, projectId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                >
                  <option value="proj-003">PRJ-TOL-003: Pembangunan Jalan Tol Akses Patimban Paket 3</option>
                  <option value="proj-002">PRJ-IKN-002: Pembangunan Rusun ASN Kawasan Inti IKN</option>
                  <option value="proj-001">PRJ-LRT-001: Pembangunan Stasiun LRT Hub Dukuh Atas</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Jenis Material Limbah</label>
                  <select
                    value={wasteForm.wasteType}
                    onChange={(e) => setWasteForm({ ...wasteForm, wasteType: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  >
                    <option value="CONCRETE_RUBBLE">Pecahan Beton</option>
                    <option value="SOIL_SPOIL">Tanah Galian</option>
                    <option value="SCRAP_METAL">Besi Sisa Potongan</option>
                    <option value="TIMBER_OFFCUT">Kayu Bekisting</option>
                    <option value="HAZARDOUS_B3">Limbah Bahan Berbahaya (B3)</option>
                    <option value="PACKAGING_PLASTIC">Plastik Kemasan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Volume Limbah (Ton)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={wasteForm.quantityTons}
                    onChange={(e) => setWasteForm({ ...wasteForm, quantityTons: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Metode Penanganan</label>
                <select
                  value={wasteForm.handlingMethod}
                  onChange={(e) => setWasteForm({ ...wasteForm, handlingMethod: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                >
                  <option value="RECYCLED_ONSITE">Didaur Ulang di Lokasi Proyek (Crusher / Agregat)</option>
                  <option value="SALVAGED_REUSE">Dimanfaatkan Kembali (Timbunan Sub-Base)</option>
                  <option value="OFFSITE_RECYCLING_PARTNER">Disalurkan ke Pabrik Daur Ulang Berizin</option>
                  <option value="LICENSED_B3_DISPOSAL">Pemusnahan B3 oleh Pengolah Berizin KLHK</option>
                  <option value="LANDFILL">Dibuang ke Tempat Pembuangan Akhir (TPA)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Nomor Manifes KLHK (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: KLHK-B3-2026-XXXX"
                    value={wasteForm.manifestNumber}
                    onChange={(e) => setWasteForm({ ...wasteForm, manifestNumber: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Mitra Daur Ulang / Pengangkut</label>
                  <input
                    type="text"
                    placeholder="Nama Perusahaan Pengolah"
                    value={wasteForm.disposalPartner}
                    onChange={(e) => setWasteForm({ ...wasteForm, disposalPartner: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsLogWasteOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 font-semibold"
                >
                  Simpan Catatan Limbah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Inisiatif Hijau */}
      {isCreateInitiativeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsCreateInitiativeOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 text-sky-400 mb-4">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white">Ajukan Program Inisiatif Dekarbonisasi</h3>
            </div>

            <form onSubmit={handleCreateInitiative} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nama Inisiatif Hijau</label>
                <input
                  type="text"
                  placeholder="Contoh: Penerapan B35 Biodiesel Penuh & Solar PV Workshop..."
                  value={initiativeForm.initiativeName}
                  onChange={(e) => setInitiativeForm({ ...initiativeForm, initiativeName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Kategori Inisiatif</label>
                  <select
                    value={initiativeForm.category}
                    onChange={(e) => setInitiativeForm({ ...initiativeForm, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  >
                    <option value="LOW_CARBON_MATERIAL">Material Rendah Karbon</option>
                    <option value="RENEWABLE_ENERGY">Energi Terbarukan (Solar PV)</option>
                    <option value="WASTE_REDUCTION">Reduksi Limbah In-Situ</option>
                    <option value="WATER_RECYCLING">Daur Ulang Air Hujan</option>
                    <option value="GREEN_AFFORESTATION">Penghijauan & Revegetasi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Target Reduksi (Ton CO2e)</label>
                  <input
                    type="number"
                    value={initiativeForm.targetReductionTonsCO2e}
                    onChange={(e) => setInitiativeForm({ ...initiativeForm, targetReductionTonsCO2e: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Estimasi Investasi (IDR)</label>
                  <input
                    type="number"
                    value={initiativeForm.estimatedInvestment}
                    onChange={(e) => setInitiativeForm({ ...initiativeForm, estimatedInvestment: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Target Penyelesaian</label>
                  <input
                    type="date"
                    value={initiativeForm.targetCompletionDate}
                    onChange={(e) => setInitiativeForm({ ...initiativeForm, targetCompletionDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Penanggung Jawab Teknis</label>
                <input
                  type="text"
                  placeholder="Nama Lead Sustainability / Site Manager"
                  value={initiativeForm.responsibleLead}
                  onChange={(e) => setInitiativeForm({ ...initiativeForm, responsibleLead: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Deskripsi Metodologi Implementasi</label>
                <textarea
                  value={initiativeForm.description}
                  onChange={(e) => setInitiativeForm({ ...initiativeForm, description: e.target.value })}
                  placeholder="Jelaskan spesifikasi teknis, mekanisme monitoring, dan sertifikasi SNI/ISO..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 h-20"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateInitiativeOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-500 font-semibold"
                >
                  Kirimkan Proposal Inisiatif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

