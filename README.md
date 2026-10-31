# BUILDFlow ERP — Construction Enterprise Management System

> **Modular Enterprise Resource Planning (ERP)** dirancang khusus untuk perusahaan konstruksi dan arsitektur skala menengah (*50–300 karyawan, 5–30 proyek aktif, multi-cabang, multi-gudang*).

---

## 🏗️ 12 Domain Modules & Arsitektur

BUILDFlow ERP dibangun dengan arsitektur **Modular Monolith** berbasis *vertical slices*:

1. **Core Platform & Administration**: Manajemen Multi-Tenant, Struktur Organisasi & Cabang, RBAC, dan Audit Logs.
2. **CRM & Sales Management**: Akuisisi Klien, Pipeline Penawaran, Proposal, dan Kontrak Kerja Sama.
3. **Project Management**: Siklus Hidup Proyek, Struktur WBS, Jadwal & Gantt, Milestone, dan Serah Terima.
4. **Cost Estimation & Budget**: RAB, BOQ, Penguncian Versi Baseline Anggaran, Pengendalian Deviasi Biaya (*Cost Variance*), dan *Change Orders*.
5. **Procurement & Vendor Management**: Registrasi Vendor, Purchase Request (PR), RFQ Bidding, Purchase Order (PO), dan *3-Way Matching* (PO vs GR vs Tagihan).
6. **Inventory & Warehouse**: Manajemen Multi-Gudang, *Immutable Stock Movement Ledger*, Reservasi Material, dan Transfer Proyek.
7. **Finance & Accounting**: Bagan Akun (COA), Jurnal Berpasangan (*Double-Entry GL*), Piutang (AR), Utang (AP), dan Laporan Profitabilitas Proyek.
8. **HR & Workforce Management**: Direktori Karyawan, Presensi, Cuti, dan Timesheet Terintegrasi Proyek.
9. **Site Operations Management**: Laporan Harian Lapangan (*Daily Site Report*), Catatan Cuaca, Log Mandor & Tukang, dan Bukti Foto Lapangan (Didukung PWA Offline Draft).
10. **Document Management**: Manajemen Gambar Teknik (CAD/BIM), Spesifikasi Teknis, Submittal, dan Versioning.
11. **Quality & Safety Management**: Checklist QC, Laporan Ketidaksesuaian (*Non-Conformance Report / NCR*), dan K3/HSE Incident Records.
12. **BI & Analytics**: Executive Overview KPI Dashboard, Schedule Variance, dan Analisis Portofolio Proyek.

---

## 💻 Tech Stack

* **Frontend**: Next.js 15 (App Router, Server Components, PWA Capabilities)
* **Design System**: Tailwind CSS + shadcn/ui (Enterprise Slate/Navy Theme)
* **Backend**: NestJS (Modular Monolith, Dependency Injection, Guards, CQRS)
* **Database**: PostgreSQL 16+ (Strict Constraints, Decimal Precision, UUID Keys)
* **ORM**: Prisma / Drizzle
* **Async & Event-Driven**: Redis 7 + BullMQ (*Transactional Outbox Pattern*)
* **Storage**: MinIO (Local) / Cloudflare R2 & AWS S3 (Production)
* **Monorepo**: pnpm Workspaces + Turborepo

---

## 🚀 Memulai (Local Development)

### 1. Prasyarat
* Node.js v20+ atau v22+
* pnpm v9+ atau npx pnpm
* Docker & Docker Compose

### 2. Setup Lingkungan
Salin file environment:
```bash
cp .env.example .env
```

Jalankan container database dan cache:
```bash
docker-compose up -d
```

### 3. Install Dependensi & Migrasi Database
```bash
npx pnpm install
npx pnpm db:generate
```

### 4. Menjalankan Server
```bash
# Menjalankan frontend dan backend sekaligus
npx pnpm dev
```
* **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
* **Backend REST API**: [http://localhost:4000/api/v1](http://localhost:4000/api/v1)
* **OpenAPI Documentation**: [http://localhost:4000/docs/api](http://localhost:4000/docs/api)
* **MinIO Object Console**: [http://localhost:9001](http://localhost:9001)

---

## 🔒 Tata Kelola Kualitas & Keamanan
Setiap perubahan arsitektur dan fungsionalitas diatur di bawah tata kelola kontrak:
* [docs/security/SECURITY.md](docs/security/SECURITY.md) — Matriks Akses & Threat Model
* [docs/architecture/SYSTEM_ARCHITECTURE.md](docs/architecture/SYSTEM_ARCHITECTURE.md) — Pola Arsitektur Sistem
* [docs/architecture/MODULE_BOUNDARIES.md](docs/architecture/MODULE_BOUNDARIES.md) — Batasan Domain & Dependency Rules
* [docs/architecture/DATABASE_ERD.md](docs/architecture/DATABASE_ERD.md) — Spesifikasi Skema Database
* [docs/design/DESIGN.md](docs/design/DESIGN.md) — Token Desain & Visual Contract
* [docs/api/API_CONTRACT.md](docs/api/API_CONTRACT.md) — Standar Endpoint & Error Envelopes

