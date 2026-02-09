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

## Phase 0: Monorepo Restructure ⬅️ CURRENT

**Goal:** Convert the existing single-frontend structure to a monorepo with shared components.

### Tasks

- [ ] **0.1** Initialize pnpm workspace
  - Create `pnpm-workspace.yaml`
  - Update root `package.json`
  
- [ ] **0.2** Create `packages/shared` library
  - Extract reusable components from current frontend
  - Set up TypeScript config for library
  - Export components, hooks, stores, utils
  
- [ ] **0.3** Create `frontends/_template`
  - Minimal starter frontend
  - Document customization points
  - README with setup instructions
  
- [ ] **0.4** Create `frontends/havajava`
  - Fork current frontend
  - Apply HavaJava branding
  - Configure feature flags (no catering, no multi-location)
  
- [ ] **0.5** Create `frontends/threesquares`
  - Fork from template
  - Apply Three Squares branding
  - Configure feature flags (catering, multi-location, merchandise)
  
- [ ] **0.6** Update API for multi-tenant routing
  - Ensure all endpoints accept restaurant slug
  - Add Location model for multi-location support
  - Seed Three Squares data

- [ ] **0.7** Add starter-app docs
  - Copy from Brain Dump
  - Reference in AGENTS.md

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

### Status: ~85% complete (from previous build)

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
- [ ] MerchandiseCategory model
- [ ] MerchandiseItem model
- [ ] MerchandiseVariant model
- [ ] Cookie store page
- [ ] Separate cart section (or combined)
- [ ] Gift box builder (optional)

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
