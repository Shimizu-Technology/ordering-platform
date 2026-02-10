# Deployment Stack (Canonical)

Version: 1.0  
Date: February 10, 2026

## Canonical Stack

The production deployment stack for this project is:

- **API:** Render
- **Frontends:** Netlify (one site per tenant frontend)
- **Database:** Neon PostgreSQL

This is the default and supported deployment path for the Ordering Platform.

## Services and Responsibilities

### API (Render)

- Deploy the Rails API from `api/`.
- Use one API service for all tenants.
- Connect to Neon via `DATABASE_URL`.
- Configure Stripe, Clerk, Resend, and Twilio env vars in Render.

### Frontends (Netlify)

- Deploy each tenant frontend as a separate Netlify site:
  - `frontends/havajava`
  - `frontends/threesquares`
- Both sites point to the shared API URL via `VITE_API_URL`.
- Configure custom domains per tenant when ready.

### Database (Neon)

- Use a single PostgreSQL instance/cluster for the platform.
- Keep tenant isolation in application data model (`restaurant_id`, slug scoping).
- Use SSL-enabled Neon connection strings in all environments.

## Environment Variable Baseline

### API (Render)

- `RAILS_ENV=production`
- `DATABASE_URL` (Neon)
- `RAILS_MASTER_KEY`
- `STRIPE_SECRET_KEY` (platform fallback)
- `STRIPE_WEBHOOK_SECRET` (or tenant-specific strategy)
- `CLERK_JWKS_URL`
- `CLERK_ISSUER`
- `RESEND_API_KEY`
- `MAILER_FROM_EMAIL`
- `TWILIO_*` vars
- `RESTAURANT_SETUP_TOKEN` (required for onboarding endpoint protection)

### Frontends (Netlify per tenant)

- `VITE_API_URL`
- `VITE_STRIPE_PUBLISHABLE_KEY` (tenant/site appropriate)
- `VITE_CLERK_PUBLISHABLE_KEY` (if tenant uses Clerk)
- `VITE_IMGIX_DOMAIN` (optional but recommended)

## Routing and Domains

- API: `https://api.<platform-domain>`
- HavaJava frontend: `https://order.havajava.com`
- Three Squares frontend: `https://order.threesquares.com`

Use CORS allowlists on API to include all active frontend domains.

## CI/CD Expectations

- Root workflow: `.github/workflows/pr-checks.yml`
- Required quality gate script: `./scripts/gate.sh`
- Gate must include:
  - API lint/security checks
  - shared package checks
  - both frontends typecheck/lint/build

## Non-Canonical Config Notes

- `api/config/deploy.yml` is Kamal scaffold output and is **not** the active deployment path for this project.
- Keep it only if explicitly needed for future experiments; otherwise remove in a follow-up cleanup PR.

## Staging Promotion Checklist

- Deploy API to Render staging.
- Deploy both frontends to Netlify staging/preview sites.
- Verify key flows:
  - Place order (both tenants)
  - Stripe payment intent + webhook transitions
  - Admin order status transitions
  - Tenant isolation (`restaurant_slug` required on admin calls)
- Verify DB migrations and rollback plan before production promotion.
