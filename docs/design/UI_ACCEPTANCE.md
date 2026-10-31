# BUILDFlow ERP — UI/UX Acceptance Criteria (UI_ACCEPTANCE.md)

## 1. Visual & Typography Quality Standards
* [ ] Contrast ratio between text and background meets WCAG AA standards ($\ge 4.5:1$ for regular text, $\ge 3:1$ for large text).
* [ ] No unstyled raw text flashes (FOUC). Font smoothing enabled (`antialiased`).
* [ ] Consistent color token usage across all 12 modules according to `DESIGN.md`.

## 2. Interaction & Keyboard Accessibility
* [ ] Full keyboard navigability (`Tab`, `Shift+Tab`, `Enter`, `Escape` to close modals and dropdowns).
* [ ] Focus ring indicator (`focus-visible:ring-2 focus-visible:ring-action`) visibly active on all inputs, buttons, and row links.
* [ ] Screen-reader accessible labels (`aria-label`, `aria-describedby`) on icon-only buttons and status icons.

## 3. Responsive & Device Parity
* [ ] Zero accidental horizontal overflow or cut-off content on viewports from 360px up to 2560px.
* [ ] Daily Site Report form renders perfectly on mobile viewports with easily tappable fields and photo upload inputs.
* [ ] Loading skeletons faithfully mimic the layout of target components to prevent cumulative layout shifts (CLS < 0.1).

