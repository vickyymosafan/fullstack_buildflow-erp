# BUILDFlow ERP — Accessibility (a11y) Verification Report (ACCESSIBILITY_AUDIT.md)

## 1. Landmark & Semantic Structure
- `<aside>` used for navigation with role and section headings.
- `<header>` used for application-wide topbar context.
- `<main>` houses unique view contents with logical `<h1>`, `<h2>` hierarchy.
- Native interactive elements (`<button>`, `<a>`, `<input>`, `<select>`, `<textarea>`) used rather than unsemantic `<div>` handlers.

## 2. Keyboard & Focus Management
- Interactive controls respond to `Tab` / `Shift+Tab`.
- Form inputs have visible focus indicators (`focus:ring-1 focus:ring-action`).
- Mobile navigation drawer includes clear dismiss button with `aria-label="Tutup menu navigasi"`.

## 3. Assistive Technology & Form Labels
- All form controls in Daily Site Report and filter bars have explicit corresponding `<label>` elements.
- Icon-only buttons (Hamburger menu, Bell notification, Drawer close) include descriptive `aria-label` tags.

