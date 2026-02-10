# E2E Test Runbook

This runbook covers local end-to-end testing for both tenants:

- `havajava`
- `threesquares`

It uses Playwright for repeatable flow testing and complements `agent-browser` visual checks.

## What This Covers

### Smoke

- HavaJava order flow: landing -> menu -> cart -> checkout -> confirmation
- Three Squares order flow: landing -> menu -> cart -> checkout -> confirmation

### Comprehensive

- HavaJava tracking flow from confirmation
- Three Squares catering inquiry submission
- Three Squares cookie-store Shopify handoff
- Optional admin login flows (token or Clerk, based on env)

## One-Time Setup

From repo root:

```bash
pnpm install
pnpm test:e2e:install
```

## Run Commands

From repo root:

```bash
# Smoke only (recommended for quick checks)
pnpm test:e2e:smoke

# Comprehensive suite
pnpm test:e2e:comprehensive

# Full suite
pnpm test:e2e

# Headed debug mode
pnpm test:e2e:headed
```

## How Environment Values Are Loaded

Playwright auto-loads env keys from:

- `api/.env`
- `frontends/havajava/.env`
- `frontends/threesquares/.env`

If you also export variables in your shell, shell values take precedence.

## Optional Admin Auth Variables

If admin tests are enabled, provide one of:

- Token mode:
  - `E2E_ADMIN_PASSWORD` (or `ADMIN_PASSWORD` / `ADMIN_TOKEN`)
- Clerk mode:
  - `E2E_CLERK_EMAIL` + `E2E_CLERK_PASSWORD`
  - (or `CLERK_TEST_EMAIL` + `CLERK_TEST_PASSWORD`)

## Notes

- The config reuses already-running local servers when possible.
- If servers are not running, Playwright starts:
  - API on `3100`
  - HavaJava on `5174`
  - Three Squares on `5175`
- Payment iframe card entry is intentionally not forced in this suite; tests validate checkout and known payment fallback behavior.
