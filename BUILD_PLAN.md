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
  
- [ ] **0.5** Create `frontends/threesquares` ⬅️ NEXT
  - Copy from havajava
  - Apply Three Squares branding (green/gold)
  - Enable: catering, multi-location, merchandise
  
- [x] **0.6** Update API for multi-tenant routing ✅
  - [x] Location model for multi-location support
  - [x] MerchandiseCategory, MerchandiseItem, MerchandiseVariant models
  - [x] features JSON column to restaurants
  - [ ] Seed Three Squares data (see docs/seed-data/three-squares.md)
  - [ ] Seed Latte Stone Cookies data (see docs/seed-data/latte-stone-cookies.md)

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
- [ ] Custom landing page with hero
- [ ] About section
- [ ] Hours display on homepage
- [ ] Simple POS mode for staff orders

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
- [ ] Decrement stock on order (integration pending)
- [ ] Restore stock on refund (integration pending)
- [ ] Block ordering when stock = 0 (integration pending)
- [x] Admin inventory dashboard (InventoryManagement.tsx)
- [x] Low stock indicators
- [x] Quick +/- stock adjustment
- [x] Stock history modal

### Status: ~90% complete

---

## Phase 2: Three Squares Features

**Goal:** Add features unique to Three Squares / B&G Pacific.

### 2.1 Multi-Location Support
- [ ] Location model in API
- [ ] Location picker component
- [ ] Location-scoped orders
- [ ] Location-specific hours
- [ ] Location-specific menus (optional)

### 2.2 Catering System
- [ ] CateringInquiry model
- [ ] Catering landing page
- [ ] Quote request form
  - Event date, time, type
  - Guest count
  - Budget range
  - Special requests
- [ ] Admin catering inbox
- [ ] Quote response workflow
- [ ] Lead time rules (2-3 days for specialty items)

### 2.3 Merchandise Store (Latte Stone Cookies)

Based on actual Shopify store research — they have 6 flavors, dipped versions, and multiple collections.

**API Models:**
- [ ] MerchandiseCategory model (Assortment Boxes, Single Flavors, Tin Collection, Gift Sets)
- [ ] MerchandiseItem model (6pc Chocolate Dipped @ $11, 12pc Grand Assortment, etc.)
- [ ] MerchandiseVariant model (for size options like 9pc vs 20pc tin)

**Frontend:**
- [ ] Cookie store page with separate branding (cookie-theme.css)
- [ ] Collection navigation (Tropical, Tin, Fruit, etc.)
- [ ] Product detail page with variant selection
- [ ] Add to cart (shared cart or separate — TBD)
- [ ] Checkout with pickup location selection

**POC Scope:**
- [ ] Seed top 5-6 products with estimated prices
- [ ] Local pickup only (shipping is Phase 2+)
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

### 2.5 Three Squares-Specific
- [ ] Custom landing page
- [ ] Restaurant vs Catering vs Cookies navigation
- [ ] Location-aware homepage

---

## Phase 3: Simple POS Mode

**Goal:** Allow staff to create orders for walk-in customers.

### 3.1 POS Interface
- [ ] Quick-add menu grid
- [ ] Modifier selection (streamlined)
- [ ] Order builder
- [ ] Payment options:
  - [ ] Mark as "Pay at Counter" (cash/card via their POS)
  - [ ] Process via Stripe (optional)
- [ ] Receipt/ticket printing (future)

### 3.2 Order Source Tracking
- [ ] `order_source` field: `online` | `pos` | `phone`
- [ ] Reporting by source

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
