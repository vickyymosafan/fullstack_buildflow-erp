-- ====================================================================
-- BUILDFlow ERP — Initial Enterprise Seed Data (PostgreSQL)
-- ====================================================================

-- 1. Insert Master Organization
INSERT INTO organizations (id, name, legal_name, default_currency, timezone, status)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'PT Maju Konstruksi Perkasa',
    'PT Maju Konstruksi Perkasa Tbk',
    'IDR',
    'Asia/Jakarta',
    'ACTIVE'
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert Branches
INSERT INTO branches (id, organization_id, code, name, address, status)
VALUES 
(
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'BR-JKT-01',
    'Kantor Pusat & Cabang Jakarta',
    'Jl. TB Simatupang Kav. 88, Jakarta Selatan',
    'ACTIVE'
),
(
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'BR-SBY-02',
    'Cabang Operasional Surabaya',
    'Jl. Mayjen Sungkono No. 45, Surabaya',
    'ACTIVE'
) ON CONFLICT DO NOTHING;

-- 3. Insert System Roles
INSERT INTO roles (id, organization_id, name, description)
VALUES 
('r0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'DIRECTOR', 'Executive leadership with complete visibility and high-value approvals'),
('r0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'PROJECT_MANAGER', 'Manages project lifecycle, WBS, schedule, and site progress'),
('r0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'FINANCE_MANAGER', 'Controls financial ledger, AP/AR, cashflow, and journal approvals'),
('r0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'PROCUREMENT_MANAGER', 'Handles vendor quotations, bids, and Purchase Orders'),
('r0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'WAREHOUSE_STAFF', 'Manages goods receipt, storage locations, and site issues'),
('r0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'SITE_SUPERVISOR', 'Submits daily field reports, site labor logs, and photo evidence')
ON CONFLICT DO NOTHING;

-- 4. Insert Standard Indonesian Construction Chart of Accounts (COA)
INSERT INTO accounts (id, organization_id, account_code, account_name, account_type)
VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '1-1001', 'Kas Operasional Proyek', 'ASSET'),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '1-1002', 'Bank Mandiri Utama IDR', 'ASSET'),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', '1-1200', 'Piutang Termin Kontrak (AR)', 'ASSET'),
('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', '1-1300', 'Persediaan Bahan & Material Gudang', 'ASSET'),
('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', '1-1400', 'Pekerjaan Dalam Pelaksanaan (WIP Proyek)', 'ASSET'),
('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', '2-1100', 'Utang Usaha Supplier / Subkon (AP)', 'LIABILITY'),
('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', '2-1200', 'Utang Retensi Proyek', 'LIABILITY'),
('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', '4-1000', 'Pendapatan Kontrak Konstruksi', 'REVENUE'),
('c0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', '5-1100', 'HPP - Biaya Material Lapangan', 'EXPENSE'),
('c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', '5-1200', 'HPP - Upah Tenaga Kerja Lapangan', 'EXPENSE'),
('c0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', '5-1300', 'HPP - Sewa Alat Berat & Peralatan', 'EXPENSE')
ON CONFLICT DO NOTHING;

-- 5. Insert Cost Categories
INSERT INTO cost_categories (id, code, name, type)
VALUES
('cc000000-0000-0000-0000-000000000001', 'MAT', 'Biaya Bahan & Material', 'MATERIAL'),
('cc000000-0000-0000-0000-000000000002', 'LAB', 'Biaya Upah & Mandor', 'LABOR'),
('cc000000-0000-0000-0000-000000000003', 'EQP', 'Biaya Sewa Alat Berat', 'EQUIPMENT'),
('cc000000-0000-0000-0000-000000000004', 'SUB', 'Biaya Subkontraktor Spesialis', 'SUBCON'),
('cc000000-0000-0000-0000-000000000005', 'OVH', 'Biaya Overhead Lapangan & K3', 'OVERHEAD')
ON CONFLICT DO NOTHING;

