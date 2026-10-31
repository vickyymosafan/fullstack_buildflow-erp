# BUILDFlow ERP — Database Architecture & ERD (DATABASE_ERD.md)

## 1. Database Standards & Conventions
* **Engine**: PostgreSQL 16+
* **Primary Key**: `UUIDv7` (Time-sortable UUID) atau `UUIDv4` untuk performa clustering B-Tree.
* **Numeric Precision**:
  * Monetary Values (RAB, Kontrak, Invoice, Jurnal): `NUMERIC(18, 4)`
  * Quantities (Material, Volume, Satuan): `NUMERIC(14, 4)`
* **Audit Columns (Standard)**:
  * `created_at TIMESTAMPTZ DEFAULT NOW()`
  * `updated_at TIMESTAMPTZ DEFAULT NOW()`
  * `created_by UUID REFERENCES users(id)`
  * `updated_by UUID REFERENCES users(id)`
* **Document Numbering Pattern**:
  * Unik per organisasi dan tipe dokumen, contoh:
    * Purchase Request: `PR/PROJ-2026/001`
    * Purchase Order: `PO/2026/10/0042`
    * Journal Entry: `JV/2026/10/0123`
    * Daily Site Report: `DSR/PRJ-01/2026-10-31`

---

## 2. Core Entities Schema Overview

### 2.1 Core Organization & Identity
```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    default_currency VARCHAR(3) DEFAULT 'IDR',
    timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, email)
);
```

### 2.2 Project Management & Cost Estimation
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    branch_id UUID NOT NULL REFERENCES branches(id),
    client_id UUID,
    project_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    project_manager_id UUID REFERENCES users(id),
    contract_value NUMERIC(18, 4) NOT NULL DEFAULT 0,
    planned_start DATE,
    planned_end DATE,
    actual_start DATE,
    actual_end DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'PLANNING', -- PLANNING, ACTIVE, ON_HOLD, COMPLETED, CLOSED
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, project_code)
);

CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version INT NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT, SUBMITTED, APPROVED, SUPERSEDED
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),
    total_budget_amount NUMERIC(18, 4) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, version)
);

CREATE TABLE budget_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    cost_code VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL, -- MATERIAL, LABOR, EQUIPMENT, SUBCON, OVERHEAD
    description TEXT NOT NULL,
    quantity NUMERIC(14, 4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unit_price NUMERIC(18, 4) NOT NULL,
    total_amount NUMERIC(18, 4) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.3 Procurement & Stock Movement Ledger
```sql
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    project_id UUID NOT NULL REFERENCES projects(id),
    vendor_id UUID NOT NULL,
    po_number VARCHAR(100) NOT NULL,
    total_amount NUMERIC(18, 4) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, CLOSED
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, po_number)
);

-- Immutable Inventory Stock Movement Ledger
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    warehouse_id UUID NOT NULL,
    project_id UUID,
    movement_type VARCHAR(50) NOT NULL, -- IN_PURCHASE, OUT_PROJECT_ISSUE, TRANSFER_IN, TRANSFER_OUT, ADJUSTMENT
    quantity NUMERIC(14, 4) NOT NULL, -- Positif untuk masuk, Negatif untuk keluar
    unit_cost NUMERIC(18, 4) NOT NULL DEFAULT 0,
    reference_type VARCHAR(50) NOT NULL, -- GOODS_RECEIPT, MATERIAL_REQUISITION, STOCK_COUNT
    reference_id UUID NOT NULL,
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.4 Double-Entry Financial Ledger
```sql
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    journal_number VARCHAR(100) NOT NULL,
    transaction_date DATE NOT NULL,
    description TEXT,
    posting_status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT, POSTED, REVERSED
    posted_at TIMESTAMPTZ,
    posted_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, journal_number)
);

CREATE TABLE journal_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL,
    project_id UUID REFERENCES projects(id),
    debit NUMERIC(18, 4) NOT NULL DEFAULT 0,
    credit NUMERIC(18, 4) NOT NULL DEFAULT 0,
    memo TEXT,
    CONSTRAINT check_debit_credit_positive CHECK (debit >= 0 AND credit >= 0),
    CONSTRAINT check_line_not_zero CHECK (debit > 0 OR credit > 0)
);
```

---

## 3. Data Integrity & Invariant Rules
1. **Double-Entry Balance Constraint**: `SUM(debit) == SUM(credit)` enforced through database transaction locks prior to setting `posting_status = 'POSTED'`.
2. **Immutable Stock Ledger**: Tabel `stock_movements` tidak pernah di-UPDATE atau di-DELETE. Koreksi stok dilakukan dengan menyisipkan baris pergerakan baru bertipe `ADJUSTMENT`.
3. **Budget Baseline Locking**: Saat status versi budget menjadi `APPROVED`, data `budget_items` menjadi read-only. Setiap modifikasi wajib membuat `budget_version` baru melalui mekanisme *Change Order*.

