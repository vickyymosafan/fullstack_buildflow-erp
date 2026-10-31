# BUILDFlow ERP — Module Boundaries & Dependency Governance (MODULE_BOUNDARIES.md)

## 1. Domain Ownership Matrix

Setiap modul memiliki tanggung jawab terbatas (*Single Responsibility Principle* pada level arsitektur).

| No | Module Name | Primary Responsibility | Data Entities Owned | Upstream Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| **01** | **Core Platform** | Auth, Org, Branch, RBAC, System Config, Audit Logs | `organizations`, `branches`, `departments`, `users`, `roles`, `permissions`, `audit_logs` | *None (Root)* |
| **02** | **CRM & Sales** | Client acquisition, bids, quotations, signed contracts | `clients`, `contacts`, `leads`, `opportunities`, `proposals`, `contracts` | Core Platform |
| **03** | **Project Management** | Project workspace, WBS hierarchy, Gantt tasks, milestones | `projects`, `project_members`, `wbs_nodes`, `tasks`, `milestones` | Core Platform, CRM (Contract) |
| **04** | **Cost & Budget** | RAB baseline, BOQ items, unit rates, budget revisions, cost codes | `budgets`, `budget_versions`, `budget_items`, `cost_categories`, `change_orders` | Project Management |
| **05** | **Procurement** | Vendor onboarding, PR approval, RFQ comparisons, PO issuance | `vendors`, `purchase_requests`, `pr_items`, `rfqs`, `vendor_bids`, `purchase_orders` | Project, Cost & Budget |
| **06** | **Inventory & Warehouse**| Multi-warehouse storage, stock movement ledger, item reservations | `products`, `uoms`, `warehouses`, `locations`, `stock_movements`, `reservations` | Core, Procurement (Goods Receipt) |
| **07** | **Finance & Accounting** | Double-entry GL, COA, Customer Invoicing, Vendor Bills, AP/AR | `accounts`, `journal_entries`, `journal_lines`, `invoices`, `payments`, `bank_accounts` | Project, Procurement, Inventory |
| **08** | **HR & Workforce** | Employee directory, timesheets, site attendance, shifts | `employees`, `attendances`, `timesheets`, `leave_requests`, `shifts` | Core Platform, Project |
| **09** | **Site Operations** | Daily site reports, site weather, photo proof, daily worker/tool logs | `daily_reports`, `progress_records`, `site_issues`, `equipment_logs` | Project, HR, Inventory |
| **10** | **Document Control** | CAD drawings, technical specs, submittals, versioning | `documents`, `document_versions`, `submittals`, `transmittals` | Core, Project |
| **11** | **Quality & Safety** | QC checklist, NCR (Non-conformance), HSE incident tracking | `inspections`, `checklists`, `ncrs`, `corrective_actions`, `safety_incidents` | Project, Site Operations |
| **12** | **BI & Analytics** | Real-time dashboards, S-Curve EVM, cashflow projection | *Read-only Materialized Views & Snapshots* | Read model from all modules |

---

## 2. Dependency Rules & Enforcement
1. **Unidirectional Flow**: Core $\rightarrow$ CRM/Project $\rightarrow$ Budget/Procurement/Inventory $\rightarrow$ Finance. Finance tidak boleh memanggil langsung logika internal Project Management; Finance menerima event transaksi untuk dicatat dalam ledger.
2. **Circular Dependency Prohibition**: Modul tidak boleh saling mengimpor secara siklis. Jika Modul A dan Modul B membutuhkan sinkronisasi data, gunakan domain events via `domain_outbox`.
3. **Database Isolation**:
   * Modul Procurement **tidak boleh** melakukan `UPDATE products SET stock_quantity = ...`. Mutasi stok harus dilakukan dengan memanggil `InventoryService.recordStockMovement(...)`.
   * Modul Project **tidak boleh** melakukan manipulasi langsung terhadap `journal_entries`.

