# BUILDFlow ERP — Design Tokens & Visual Contract (DESIGN.md)

## 1. Design Philosophy
BUILDFlow ERP adheres to a calm, precise, data-dense enterprise visual language. It is optimized for construction professionals (project managers, estimators, finance auditors) who navigate dense tables and complex data for hours every day.

---

## 2. Color Palette & Semantic Tokens

### Color Tokens
```css
:root {
  /* Brand & Navigation */
  --primary: #17324D;          /* Deep Navy - Header, primary navigation, branding */
  --primary-foreground: #FFFFFF;
  
  /* Action & Interactions */
  --action: #2F6B9A;           /* Steel Blue - Interactive buttons, primary links, focus rings */
  --action-hover: #24557A;
  --action-foreground: #FFFFFF;
  
  /* Backgrounds & Surfaces */
  --background: #F4F7FA;       /* Off-White - Main app background */
  --surface: #FFFFFF;          /* Pure White - Cards, modal surfaces, data tables */
  --surface-subtle: #EBF0F5;   /* Light Slate - Table headers, subtle hover rows */
  
  /* Typography */
  --text-main: #2D3D4B;        /* Dark Slate - Primary headings, body copy */
  --text-muted: #6B7C8D;       /* Gray Blue - Secondary metadata, helper text */
  --border: #D8E1E8;           /* Soft Gray - Dividers, card borders, table grid lines */
  
  /* Semantic Status */
  --success: #4D8B70;          /* Sage Green - Approved, reconciled, completed */
  --success-bg: #EAF4EE;
  --warning: #C18A3A;          /* Amber - Pending approval, near budget ceiling */
  --warning-bg: #FDF6EC;
  --danger: #B95B5B;           /* Muted Red - Rejected, budget overrun, overdue task */
  --danger-bg: #FBEFEF;
}
```

---

## 3. Typography Hierarchy
* **Font Family**: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.
* **Monospace Font**: JetBrains Mono, SFMono-Regular, Consolas (for document numbers: `PR-2026-001`, monetary amounts, currency, dates).

| Element | Size | Weight | Line Height | Tracking |
| :--- | :--- | :--- | :--- | :--- |
| **Page Title (H1)** | 24px (1.5rem) | 600 (Semibold) | 32px | -0.02em |
| **Section Header (H2)** | 18px (1.125rem) | 600 (Semibold) | 26px | -0.01em |
| **Subheader (H3)** | 15px (0.9375rem) | 600 (Semibold) | 22px | normal |
| **Body (Default)** | 14px (0.875rem) | 400 (Regular) | 20px | normal |
| **Data Table Cell** | 13px (0.8125rem) | 400 (Regular) | 18px | normal |
| **Caption / Muted** | 12px (0.75rem) | 400 (Regular) | 16px | normal |
| **Badge / Status** | 11px (0.6875rem) | 600 (Semibold) | 14px | +0.02em |

---

## 4. Spacing, Elevation & Radii
* **Grid Base**: 4px / 8px scale.
* **Border Radius**:
  * Buttons & Inputs: `6px` (`rounded-md`)
  * Cards & Modals: `8px` (`rounded-lg`)
  * Badges & Tags: `4px` (`rounded-sm`)
* **Box Shadows**: Minimal flat elevation to reduce eye strain:
  * Card: `0 1px 2px 0 rgba(16, 24, 40, 0.05)`
  * Dropdown / Popover: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)`

