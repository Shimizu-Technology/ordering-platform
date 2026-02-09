# Build Plan — Ordering Platform

**Version:** 2.0
**Last Updated:** February 9, 2026
**Status:** Restructuring to Monorepo

---

## Overview

This document tracks the development phases for the Ordering Platform monorepo. The platform serves multiple restaurant tenants, each with their own customized frontend.

### Current Tenants

| Tenant | Slug | Status |
|--------|------|--------|
| HavaJava Café | `havajava` | POC in progress |
| Three Squares / B&G Pacific | `threesquares` | POC in progress |

---

## ⚠️ Testing Requirements (MANDATORY)

**Every task must be tested before marking complete:**
1. Run `./scripts/gate.sh` — must pass
2. Start servers locally (API + Frontend)
3. Open in browser (`profile="openclaw"`) — actually see the UI
4. Test the flow end-to-end
5. Check mobile viewport
6. Screenshot as evidence
7. Then commit

**See AGENTS.md → "Testing Workflow" for full details.**

---

## Phase 0: Monorepo Restructure ⬅️ CURRENT

**Goal:** Convert the existing single-frontend structure to a monorepo with shared components.

### Key Decisions (Feb 9, 2026)
- **Staging:** One environment with both tenants
- **Domains:** Shimizu manages (clients don't have their own)
- **Stripe:** Direct API keys per restaurant (not Connect)
- **Auth:** Clerk (per starter-app guide)
- **Testing:** Gate script + incremental test coverage

See [docs/DECISIONS.md](./docs/DECISIONS.md) for full details.

### Tasks

- [x] **0.0** Audit current frontend for blacklisted fonts/colors ✅
  - Removed Inter from font options
  - Added Sora and General Sans
  - Documented in docs/AUDIT_NOTES.md

- [x] **0.1** Initialize pnpm workspace ✅
  - Created `pnpm-workspace.yaml`
  - Renamed ordering-platform-api → api/
  - Renamed ordering-platform-web → frontends/havajava/
  - Created packages/shared/ with TypeScript types

- [ ] **0.2** Create `packages/shared` library
  - [x] TypeScript types (menu, order, restaurant)
  - [ ] Extract reusable UI components
  - [ ] Extract hooks and stores
  
- [ ] **0.3** Create `frontends/_template` (SKIPPED - copy havajava instead)
  
- [x] **0.4** Create `frontends/havajava` ✅
  - Renamed from ordering-platform-web
  - Existing branding system works
  - Feature flags: simple menu ordering only
  
- [x] **0.5** Create `frontends/threesquares` ✅ (Feb 9, 2026)
  - Forest green (#1B4332) / Gold (#FFD700) branding
  - Montserrat + DM Sans fonts
  - Features: catering, multi-location, merchandise enabled
  
- [x] **0.6** Update API for multi-tenant routing ✅
  - [x] Location model for multi-location support
  - [x] MerchandiseCategory, MerchandiseItem, MerchandiseVariant models
  - [x] features JSON column to restaurants
  - [x] Seed Three Squares data (32 menu items across 5 categories)
  - [x] Seed Latte Stone Cookies data ✅ (Feb 9, 2026)

- [x] **0.7** Add starter-app docs ✅
  - Copied 20+ guides to docs/starter-app/
  - Referenced in AGENTS.md

- [x] **0.8** Create gate script ✅
  - `scripts/gate.sh` — lint, types, build for all packages
  - Fixed ESLint and RuboCop issues

- [x] **0.9** Add Stripe per-restaurant fields ✅
  - Migration: stripe_publishable_key, stripe_secret_key, stripe_webhook_secret
  - [ ] Update payment flow to use restaurant's keys

- [ ] **0.10** Set up Clerk auth
  - Follow CLERK_AUTH_SETUP_GUIDE.md
  - Admin/staff roles per restaurant

### Deliverables
- Monorepo structure working locally
- Both frontends running against shared API
- Shared component library functional

---

## Phase 1: HavaJava MVP

**Goal:** Production-ready ordering for HavaJava Café.

### 1.1 Customer Ordering
- [x] Menu browsing with categories
- [x] Item detail with modifier selection
- [x] Cart management
- [x] Checkout with Stripe
- [x] Order confirmation page
- [x] Email confirmation

### 1.2 Staff Dashboard
- [x] Order queue (real-time polling)
- [x] Status updates (pending → preparing → ready → completed)
- [x] New order sound notification
- [x] Order detail view

### 1.3 Menu Management
- [x] CRUD for categories
- [x] CRUD for items
- [x] CRUD for modifier groups
- [x] CRUD for modifiers
- [x] Reordering (drag or up/down)
- [x] Toggle availability

### 1.4 Restaurant Settings
- [x] Business hours
- [x] Contact info
- [x] Branding (colors, logo)

### 1.5 Notifications
- [x] Email order confirmation
- [x] SMS "order ready" notification
- [ ] SMS order confirmation (optional)

### 1.6 Promotions
- [x] Happy hour scheduling
- [x] Percentage discounts
- [x] Fixed amount discounts
- [x] BOGO promotions

### 1.7 HavaJava-Specific
- [x] Custom landing page with hero ✅
- [x] About section ✅ (Feb 9, 2026)
- [x] Hours display on homepage ✅ (Feb 9, 2026)
- [ ] Simple POS mode for staff orders

### 1.12 Tips at Checkout ✅ (Feb 9, 2026)
- [x] Add tip_amount, tip_percentage columns to orders
- [x] TipSelector component (15%, 20%, 25%, custom)
- [x] Update checkout flow to include tip selection
- [x] Update order total calculation
- [x] Display tip on confirmation/receipt

### 1.13 Prep Time Estimates ✅ (Feb 9, 2026)
- [x] Add default_prep_time_minutes to restaurants (default: 10)
- [x] Display "Ready in ~X min" on confirmation page
- [x] Display estimated ready time on order tracking page

### 1.14 Image Optimization (Imgix) ✅ (Feb 9, 2026)
- [x] Create OptimizedImage component (adapted from Hafaloha)
- [x] Create image utils (getImgixImageUrl, widths/sizes helpers)
- [x] Add to packages/shared exports
- [x] Add VITE_IMGIX_DOMAIN to env config (both frontends)
- [x] Update MenuItemCard in both frontends
- [x] Update CookieStorePage in Three Squares
- [x] Graceful fallback when IMGIX_DOMAIN not set

### 1.8 Clerk Admin Auth ✅ (Feb 9, 2026)
- [x] Clerk frontend integration (ClerkProvider, SignIn)
- [x] Auth context for token management
- [x] Backend JWT verification via JWKS
- [x] Auto-create first user as super_admin
- [x] Admin dashboard protected by auth

### 1.9 Stripe Payments ⬅️ IN PROGRESS (Feb 9, 2026)
- [x] PaymentForm component with Stripe Elements
- [x] Payment modal in checkout flow
- [x] PaymentIntent creation via API
- [x] Real Stripe test keys configured
- [ ] Webhook handler for payment confirmation
- [ ] Handle failed payments gracefully

### 1.10 Refunds System ✅ (Feb 9, 2026)
See [docs/REFUNDS_DESIGN.md](./docs/REFUNDS_DESIGN.md) for full spec.

- [x] Refunds table migration
- [x] RefundService (Stripe integration)
- [x] Full refund (one-click)
- [x] Partial refund (enter amount)
- [x] Refund reasons enum
- [x] Admin UI for refund processing (RefundModal)
- [x] Refund history on order detail
- [ ] Webhook handler for async Stripe refund status

### 1.11 Inventory Tracking ✅ (Feb 9, 2026)
See [docs/INVENTORY_DESIGN.md](./docs/INVENTORY_DESIGN.md) for full spec.

- [x] Add inventory fields to menu_items
- [x] Add inventory fields to merchandise_variants
- [x] StockAdjustment audit log table
- [x] TrackableInventory concern with decrement/restore methods
- [x] Decrement stock on order creation
- [x] Restore stock on refund (via RefundService)
- [x] Restore stock on order cancellation
- [x] Block ordering when stock = 0 (with "Sold Out" badge)
- [x] Admin inventory dashboard (InventoryManagement.tsx)
- [x] Low stock indicators
- [x] Quick +/- stock adjustment
- [x] Stock history modal

### Status: ~90% complete

---

## Phase 2: Three Squares Features ✅ MOSTLY COMPLETE

**Goal:** Add features unique to Three Squares / B&G Pacific.

### 2.1 Multi-Location Support ✅ (Feb 9, 2026)
- [x] Location model in API
- [x] Location picker component (LocationPicker.tsx)
- [x] Location-scoped orders
- [x] 2 locations seeded (Hagåtña, Tamuning)
- [ ] Location-specific hours
- [ ] Location-specific menus (optional)

### 2.2 Catering System ✅ (Feb 9, 2026)
- [x] CateringInquiry model
- [x] Catering landing page (CateringPage.tsx)
- [x] Quote request form
  - Event date, time, type
  - Guest count
  - Budget range
  - Special requests
- [x] Admin catering inbox (CateringInbox.tsx)
- [x] Quote response workflow (status: pending → quoted → accepted/declined)
- [ ] Lead time rules (2-3 days for specialty items)

### 2.3 Merchandise Store (Latte Stone Cookies) ✅ (Feb 9, 2026)

Based on actual Shopify store research — they have 6 flavors, dipped versions, and multiple collections.

**API Models:**
- [x] MerchandiseCategory model
- [x] MerchandiseItem model
- [x] MerchandiseVariant model (for size options)
- [x] Merchandise API endpoints

**Frontend:**
- [x] Cookie store page (CookieStorePage.tsx)
- [x] Collection navigation
- [x] Product cards with variant display
- [x] Add to cart integration
- [x] Merchandise admin CRUD (MerchandiseAdmin.tsx)

**POC Scope:**
- [x] Seed real Latte Stone Cookies products ✅ (Feb 9, 2026)
- [x] Local pickup only
- [ ] Simple inquiry link for corporate/bulk orders

**Future (Post-POC):**
- [ ] Full product catalog from client
- [ ] Shipping integration (EasyPost like Hafaloha)
- [ ] Wedding favor custom orders
- [ ] Keepsakes/gifts section (if in scope)

### 2.4 Corporate/Bulk Ordering
- [ ] Corporate inquiry form
- [ ] Recurring order setup (future)
- [ ] Corporate account dashboard (future)

### 2.5 Three Squares-Specific ✅ (Feb 9, 2026)
- [x] Custom landing page (LandingPage.tsx)
- [x] Restaurant vs Catering vs Cookies navigation (landing page cards)
- [x] Location-aware ordering

### 2.6 Order Tracking ✅ (Feb 9, 2026)
- [x] Order tracking page (OrderTrackingPage.tsx)
- [x] Order lookup by ID
- [x] Status progress visualization (pending → confirmed → preparing → ready)
- [x] Auto-refresh every 30 seconds
- [x] Ready for pickup banner
- [x] Add tracking link to ConfirmationPage ✅

---

## Phase 3: Simple POS Mode ✅ (Feb 9, 2026)

**Goal:** Allow staff to create orders for walk-in customers.

### 3.1 POS Interface
- [x] Quick-add menu grid
- [x] Modifier selection (streamlined modal)
- [x] Order builder (cart with qty controls)
- [x] Payment options:
  - [x] Mark as "Pay at Counter" (auto-confirms for cash/card)
  - [x] Process via Stripe (card button, uses existing flow)
- [ ] Receipt/ticket printing (future)
- [x] Search menu functionality
- [x] Touch-friendly layout for iPad

### 3.2 Order Source Tracking
- [x] `source` field: `online` | `pos` | `phone`
- [ ] Reporting by source (future)

---

## Phase 4: Polish & Production

**Goal:** Production-ready deployment for both tenants.

### 4.1 Deployment
- [ ] API deployed to Render
- [ ] HavaJava frontend deployed to Netlify
- [ ] Three Squares frontend deployed to Netlify
- [ ] Custom domains configured
- [ ] SSL certificates active

### 4.2 Monitoring
- [ ] Error tracking (Sentry or similar)
- [ ] Uptime monitoring
- [ ] Performance monitoring

### 4.3 Testing
- [ ] API test coverage > 80%
- [ ] E2E tests for critical flows
- [ ] Mobile testing (iOS Safari, Android Chrome)

### 4.4 Documentation
- [ ] Staff training guide
- [ ] Admin user guide
- [ ] API documentation

### 4.5 Visual Polish (From Feb 9 Audit)
- [ ] Add real product images (Latte Stone Cookies currently using placeholders)
- [ ] Add subtle hover animations (card lifts, button hovers per Design Guide)
- [ ] Add skeleton loaders for perceived performance
- [ ] Dark mode support (token system already ready)

---

## Phase 5: Future Enhancements

### 5.1 Rewards/Loyalty
- [ ] Points system
- [ ] Punch card digital equivalent
- [ ] Rewards redemption

### 5.2 Inventory Tracking
- [ ] Stock quantities per item
- [ ] Low stock alerts
- [ ] Auto-disable when out of stock

### 5.3 POS Integration
- [ ] Clover API integration
- [ ] Revel API integration
- [ ] KwickPOS integration (if API available)
- [ ] Unified order queue

### 5.4 Customer Accounts
- [ ] Optional account creation
- [ ] Order history
- [ ] Saved payment methods
- [ ] Favorite orders

### 5.5 Analytics Dashboard
- [ ] Revenue trends
- [ ] Popular items
- [ ] Peak hours
- [ ] Customer insights

---

## Timeline

### Week of Feb 9, 2026 (Current)

| Day | Focus |
|-----|-------|
| Mon-Tue | Phase 0: Monorepo restructure |
| Wed | Phase 0: Finish restructure, HavaJava frontend |
| Thu | Three Squares frontend + multi-location |
| Fri | Catering system basics |

### Week of Feb 16, 2026

| Day | Focus |
|-----|-------|
| Mon-Tue | Catering + cookie store |
| Wed-Thu | POS mode, polish |
| Fri | Testing, staging deploy |

### Week of Feb 23, 2026

| Day | Focus |
|-----|-------|
| Mon-Tue | Production deploy |
| Wed-Fri | Client training, bug fixes |

---

## Dependencies

### External Services

| Service | Purpose | Status |
|---------|---------|--------|
| Stripe | Payments | Configured |
| Clerk | Auth | Configured |
| Netlify | Frontend hosting | Ready |
| Render | API hosting | Ready |
| SendGrid | Email | Configured |
| Twilio | SMS | Configured |

### API Keys Needed

- [ ] HavaJava Stripe account (or use platform account)
- [ ] Three Squares Stripe account (or use platform account)
- [ ] Production SendGrid key
- [ ] Production Twilio credentials

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Scope creep | Strict feature flags, POC-first approach |
| POS confusion | Clear staff training, dual-screen setup |
| Stripe onboarding delays | Start onboarding early, have fallback |
| DNS propagation | Use Netlify preview URLs for demos |

---

## Definition of Done

### For POC (This Week)
- [ ] Both frontends deployed to staging
- [ ] Can place and complete orders on both
- [ ] Staff can manage orders via dashboard
- [ ] Demo-ready for client meetings

### For Production
- [ ] Custom domains active
- [ ] Payment processing live
- [ ] Notifications working
- [ ] Staff trained
- [ ] Monitoring in place

---

## Related Documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Monorepo structure & technical decisions
- [PRD.md](./PRD.md) — Product requirements & feature details
- [docs/starter-app/](./docs/starter-app/) — Shimizu Technology development standards

---

*Plan maintained by Jerry | Last updated: February 9, 2026*
