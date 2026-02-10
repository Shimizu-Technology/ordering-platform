# Ordering Platform — Architecture

**Version:** 2.1  
**Last Updated:** February 10, 2026  
**Status:** Active Development (stabilization in progress)

---

## Overview

Ordering Platform is a multi-tenant restaurant ordering system built as a monorepo.

- Shared Rails API for all tenants.
- Tenant-specific React frontends in `frontends/`.
- Shared frontend package in `packages/shared` (currently partial/in-progress extraction).

Current tenants:

- `havajava` — coffee shop ordering
- `threesquares` — restaurant + multi-location + catering + Latte Stone Cookies module

---

## Repository Structure (Current)

```text
ordering-platform/
├── api/                              # Rails API (multi-tenant)
├── frontends/
│   ├── havajava/
│   └── threesquares/
├── packages/
│   └── shared/
├── docs/
├── .github/workflows/
│   └── pr-checks.yml
├── ARCHITECTURE.md
├── BUILD_PLAN.md
├── PRD.md
└── STABILIZATION_CHECKLIST.md
```

Notes:

- `frontends/_template` is not currently present.
- `packages/shared` includes shared types/utilities and selected components; not all frontend UI has been extracted yet.

---

## Multi-Tenancy Model

### API scoping

Public APIs are scoped by restaurant slug:

- `GET /api/v1/restaurants/:slug/menu`
- `POST /api/v1/restaurants/:slug/orders`
- `GET /api/v1/restaurants/:slug/merchandise`

Admin APIs require explicit `restaurant_slug` context and auth.

### Tenant data boundaries

- `Restaurant` is the tenant root model.
- Domain models are scoped via `restaurant_id` (directly or through ownership chains).
- Admin access checks enforce restaurant-level permissions.

---

## Data Integrity and Concurrency

The platform uses layered safeguards:

- **Optimistic locking** via `lock_version` on orders.
- **Safe status transitions** through model transition methods (`confirm!`, `start_preparing!`, `mark_ready!`, `complete!`, `cancel!`).
- **Stripe idempotency** via `idempotency_key` for payment-intent creation.
- **Inventory locking** through stock adjustment methods and audit logging.

Canonical status flow:

```text
pending -> confirmed -> preparing -> ready -> completed
   \         \            \
    \-------> cancelled    \-------> cancelled
```

---

## Feature Delivery Model

Features are controlled by:

1. Restaurant feature flags (`restaurants.features` JSON).
2. Tenant-specific frontend routes/pages.

Examples:

- HavaJava: core ordering-first experience.
- Three Squares: multi-location + catering + cookies module.

---

## Checkout and Payments

- Both tenant checkouts support Stripe payment flow.
- Payment-intent creation is routed through `PaymentService`.
- Webhook handling updates order states via the payment service (idempotent path).
- On payment setup failure, checkout provides retry/counter-payment fallback without immediately losing cart context.

---

## Merchandise Strategy (Current)

Latte Stone Cookies currently uses a **Shopify handoff** checkout pattern:

- Native product browsing/cart selection inside the Three Squares app.
- Checkout handoff opens Shopify for final merchandise transaction.
- This avoids duplicating merchandise order processing logic in the platform for current scope.

Future option: native merchandise checkout with dedicated order-item support.

---

## Deployment Architecture (Canonical)

- **API:** Render
- **Frontends:** Netlify (one site per tenant)
- **Database:** Neon PostgreSQL

See `docs/DEPLOYMENT_STACK.md` for environment details and deployment notes.

---

## CI and Quality Gates

- Root CI workflow: `.github/workflows/pr-checks.yml`
- Local/CI gate script: `./scripts/gate.sh`

Gate includes:

- shared package type checks
- both frontends typecheck/lint/build
- API RuboCop, Brakeman, bundle-audit, tests

---

## Known Gaps / In-Progress Areas

- Shared frontend extraction is still partial; some duplicate tenant UI remains.
- Automated test coverage is still thin (currently mostly lint/build/security gates).
- Production runbook and staff docs need finalization.

These are tracked in `STABILIZATION_CHECKLIST.md` and `BUILD_PLAN.md`.

---

## Related Documents

- `PRD.md` — product scope and feature matrix
- `BUILD_PLAN.md` — phased roadmap and status
- `STABILIZATION_CHECKLIST.md` — active stabilization execution
- `docs/DEPLOYMENT_STACK.md` — canonical deployment path
