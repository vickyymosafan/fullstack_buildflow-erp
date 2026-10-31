# BUILDFlow ERP — Component Rules & State Governance (COMPONENT_RULES.md)

## 1. Universal Component States
Every visual component and route view MUST explicitly support 4 fundamental states:
1. **Loading State**: Contextual skeleton screens with exact layout dimensions (no generic full-screen spinners).
2. **Empty State**: Friendly illustration/icon, clear explanation of why data is empty, and a primary CTA (e.g., "Belum ada Purchase Order. [ + Buat PO Pertama ]").
3. **Error State**: Non-blocking banner or localized card displaying human-readable failure reason, correlation ID, and a "Coba Lagi" action.
4. **Success State**: Clear feedback badge or toast confirmation for completed asynchronous tasks.

---

## 2. Data Table Standards (`@tanstack/react-table`)
Enterprise tables are the core workhorse of BuildFlow ERP:
* **Headers**: Fixed header with sorting indicators and column width resizing.
* **Density**: Compact mode (cell height 36px) and Normal mode (cell height 44px).
* **Pagination & Virtualization**: Cursor-based pagination with server-side page size selector (10, 25, 50, 100).
* **Column Filters**: Filter popovers per column (status multiselect, date range picker, numeric min/max).
* **Bulk Actions**: Checkbox selection bar floating at bottom-center when rows are selected (e.g., "[3 Terpilih] $\rightarrow$ [ Approve Massal ] | [ Export Selected ]").
* **Row Actions**: Primary action single-click, secondary actions inside three-dot context dropdown menu.

---

## 3. Form & Validation Patterns
* **Libraries**: `react-hook-form` + `@hookform/resolvers/zod` + `zod`.
* **Inline Errors**: Form errors rendered directly beneath the specific field, never in an alert popup.
* **Auto-Formatting**:
  * Currency fields automatically format with thousands separator (`Rp 1.500.000.000`).
  * Date fields use localized Indonesian date formatting (`31 Okt 2026`).
* **Destructive Actions**: Irreversible actions (Delete, Void PO, Reverse Journal) require a confirmation modal with explicit typing of the confirmation phrase or two-step verification.

