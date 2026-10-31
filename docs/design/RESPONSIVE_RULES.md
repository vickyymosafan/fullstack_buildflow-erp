# BUILDFlow ERP — Responsive Design & Mobile Strategy (RESPONSIVE_RULES.md)

## 1. Viewport Profiles & Breakpoints

BUILDFlow ERP operates on two core user paradigms:
1. **Desktop / Laptop Workstation ($\ge$ 1280px)**: Finance managers, estimators, project planners doing heavy spreadsheet-like work, Gantt scheduling, and 3-way matching.
2. **Mobile / Tablet PWA ($\le$ 768px)**: Site supervisors, storekeepers, and field engineers doing daily reporting, equipment logs, and receiving deliveries at construction sites.

### Standard Breakpoints
* `sm`: `640px` (Compact mobile / field forms)
* `md`: `768px` (Tablets / field tablets)
* `lg`: `1024px` (Small laptops)
* `xl`: `1280px` (Desktop workstations)
* `2xl`: `1536px` (Wide multi-column monitoring dashboards)

---

## 2. Layout Reflow Rules
* **Navigation**:
  * Desktop: Collapsible sidebar (pinned or icon-only mode).
  * Mobile: Bottom navigation bar for top 4 field tasks (Laporan Harian, Terima Barang, Absensi, Isu Lapangan) + Slide-out drawer menu for full navigation.
* **Data Grids on Mobile**:
  * Tables automatically convert to card list views on mobile viewports ($\le$ 640px), showing primary badge, amount, and date with a tap-to-expand drawer for line items.
* **Touch Targets**:
  * Minimum touch target size on mobile is `44x44px` with ample tap padding to facilitate glove-friendly or outdoor usage.
* **Offline & Resilience**:
  * Field forms (Daily Site Report, Material Receipt) store drafts in IndexedDB so site engineers never lose input during connection dropouts.

