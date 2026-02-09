# Phase 0.0 — Font/Color Audit

**Date:** February 9, 2026
**Status:** ✅ Complete

---

## Summary

The current frontend is **well set up** with a proper brand token system.

### ✅ Good Things Found

1. **Brand Token System** — CSS custom properties for all colors
   - `--brand-primary`, `--brand-secondary`, `--brand-accent`
   - Derived tokens (light, dark, hover variants)
   - Surface, text, border colors

2. **Approved Font** — Using `DM Sans` (on the approved list)

3. **No Tailwind Defaults** — Custom color palette, not default blue-500 for primary

4. **Proper Spacing/Radius/Animation** tokens

---

## Issues Fixed

### 1. Font Options (RestaurantSettings.tsx)

**Before:**
- Included "Inter" (blacklisted)

**After:**
- Removed "Inter"
- Added "Sora" and "General Sans" as better alternatives

---

## Items Left As-Is (Acceptable)

### Status Badge Colors
```tsx
confirmed: 'bg-blue-500/15', 'text-blue-600'
preparing: 'bg-purple-500/15', 'text-purple-600'
```

**Rationale:** These are semantic status colors in the admin dashboard, not brand colors. Blue for "confirmed" and purple for "preparing" provide clear visual differentiation between states. This is standard UX practice.

### Notify Button (OrderCard.tsx)
```tsx
className="bg-blue-500/10 text-blue-600"
```

**Rationale:** Secondary action button. Blue is commonly used for info/secondary actions. Could be changed to brand colors later if desired.

---

## Recommendations for Later

1. **Add status colors to token system** — Define `--color-status-confirmed`, `--color-status-preparing`, etc.

2. **Consider brand-derived status colors** — Could use brand accent for some statuses

3. **Font loading** — Ensure Google Fonts or Fontshare fonts are properly loaded in index.html

---

## Next Step

Proceed to Phase 0.1: Initialize pnpm workspace
