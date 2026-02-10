# Ordering Platform

Multi-tenant restaurant ordering SaaS built by [Shimizu Technology](https://shimizu-technology.com).

Current tenants:

- `havajava` — coffee shop ordering
- `threesquares` — restaurant ordering + multi-location + catering + Latte Stone Cookies module

## Monorepo Structure

```text
ordering-platform/
├── api/                          # Rails API
├── frontends/
│   ├── havajava/                 # Tenant frontend
│   └── threesquares/             # Tenant frontend
├── packages/
│   └── shared/                   # Shared TS package (types/components/utils)
├── docs/
├── AGENTS.md
├── PRD.md
├── ARCHITECTURE.md
├── BUILD_PLAN.md
└── STABILIZATION_CHECKLIST.md
```

## Stack

- Backend: Rails 7/8 API mode, Ruby 3.3+, PostgreSQL
- Frontend: React 19, Vite, TypeScript, Tailwind CSS v4, Framer Motion
- State: Zustand
- Payments: Stripe
- Auth: Clerk (admin/staff), guest checkout for customers
- Icons: Lucide React
- Package manager: pnpm workspaces

## Deployment (Canonical)

- API: Render
- Frontends: Netlify (one site per tenant)
- Database: Neon PostgreSQL

See `docs/DEPLOYMENT_STACK.md` for deployment details.

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Ruby 3.3+
- PostgreSQL (or Neon connection string)

### Install

```bash
pnpm install
cd api && bundle install
```

### Run Locally

Terminal 1 (API):

```bash
cd api
bin/rails db:setup
bin/rails server -p 3000
```

Terminal 2 (HavaJava):

```bash
cd frontends/havajava
pnpm dev
```

Terminal 3 (Three Squares):

```bash
cd frontends/threesquares
pnpm dev
```

## Quality Gate

Run before commits:

```bash
./scripts/gate.sh
```

Gate covers:

- shared package type checks
- both frontends: typecheck, lint, build
- API: RuboCop, Brakeman, bundle-audit, tests

## Current Execution Plan

- Product scope: `PRD.md`
- Architecture details: `ARCHITECTURE.md`
- Delivery tracking: `BUILD_PLAN.md`
- Stabilization tasks and status: `STABILIZATION_CHECKLIST.md`

## Design Rules

- No emoji in UI (Lucide icons only)
- Mobile-first layout, minimum 44px touch targets
- Use brand tokens/CSS custom properties (no hardcoded tenant colors)
- Use Framer Motion for animation
