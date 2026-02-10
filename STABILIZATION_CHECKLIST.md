# Stabilization Checklist

Version: 1.0  
Date: February 10, 2026  
Owner: Shimizu Technology

## Purpose

Stabilize the Ordering Platform for reliable production operation across:

- `havajava` (simple coffee shop ordering)
- `threesquares` (restaurant + multi-location + catering + Latte Stone Cookies module)

This plan prioritizes correctness, tenant safety, deployment reliability, and clear documentation before broader refactoring.

## Locked Decisions

- **Tenant model:** Keep `threesquares` as one tenant with multiple modules (restaurant ordering, catering, cookies/merchandise).
- **Deployment stack:** Standardize on Render (API), Netlify (frontends), Neon (Postgres).
- **Payments:** Direct Stripe keys per restaurant for now (no Stripe Connect dependency for launch).
- **Execution order:** Stabilize critical flows first, then continue shared component extraction.

## Priority Legend

- `P0` Critical: can cause payment/data/security incidents.
- `P1` High: major reliability or launch blocker.
- `P2` Medium: important quality and maintainability improvements.
- `P3` Low: polish and follow-up hardening.

## Tags

- `owner`: API, Frontend, DevOps, Docs, QA
- `effort`: S (0.5-1 day), M (1-2 days), L (3-5 days)
- `status`: Todo, In Progress, Done

---

## Phase 1 - Critical Stabilization (P0)

Target: close all P0s before any production launch.

### 1) Fix Stripe webhook order state handling

- **Priority:** `P0`
- **Tags:** `owner:API` `effort:S` `status:Done`
- **Context:** Webhook updates use `payment_status`, but orders use `status`.
- **Scope:**
  - Update webhook handlers to use valid order fields.
  - Align with `PaymentService` (`confirm_payment`, `handle_failure`).
  - Ensure idempotent webhook behavior.
- **Definition of Done:**
  - `payment_intent.succeeded` transitions pending orders to confirmed exactly once.
  - `payment_intent.payment_failed` transitions eligible pending orders to cancelled.
  - No reference to nonexistent `payment_status` remains.
  - Manual Stripe CLI webhook test passes in local/staging.

### 2) Enforce idempotent PaymentIntent creation in `orders#pay`

- **Priority:** `P0`
- **Tags:** `owner:API` `effort:S` `status:Done`
- **Context:** `orders#pay` currently creates Stripe intents directly without idempotency options.
- **Scope:**
  - Route payment intent creation through `PaymentService` or equivalent idempotent path.
  - Ensure restaurant-specific Stripe keys are used.
- **Definition of Done:**
  - Payment creation uses `order.idempotency_key` on Stripe request options.
  - Duplicate `pay` requests for same order do not create duplicate intents/charges.
  - Staging test with repeated requests confirms stable behavior.

### 3) Protect onboarding endpoints (`restaurants#create`, `restaurants#setup`)

- **Priority:** `P0`
- **Tags:** `owner:API` `effort:M` `status:Done`
- **Context:** Current routing/controller shape allows public write operations for tenant onboarding.
- **Scope:**
  - Require authenticated super admin or internal service token.
  - Return unauthorized/forbidden on non-privileged calls.
  - Keep public `restaurants#show` endpoint available.
- **Definition of Done:**
  - Unauthenticated create/setup calls fail with 401/403.
  - Authorized internal/admin flow works end-to-end.
  - Access policy documented in this repo.

### 4) Remove silent admin tenant fallback

- **Priority:** `P0`
- **Tags:** `owner:API` `effort:S` `status:Done`
- **Context:** Admin base controller falls back to first active restaurant when slug missing.
- **Scope:**
  - Require explicit `restaurant_slug` for admin requests (or infer from auth context only).
  - Return clear 400/404 when missing or invalid.
- **Definition of Done:**
  - No admin request defaults to first active restaurant.
  - Cross-tenant accidental data exposure path is eliminated.

---

## Phase 2 - Reliability and Launch Readiness (P1)

Target: pass launch gate for staging and production rollout.

### 5) Fix admin order state updates to use safe transitions

- **Priority:** `P1`
- **Tags:** `owner:API` `effort:S` `status:Done`
- **Context:** Admin updates directly mutate `status` and can bypass locking/transition guards.
- **Scope:**
  - Replace direct updates with model transition methods (`confirm!`, `start_preparing!`, etc.).
  - Preserve cancellation inventory restoration behavior.
- **Definition of Done:**
  - Invalid transitions are rejected consistently.
  - Concurrent status updates are protected by existing transition locking behavior.

### 6) Fix admin pagination runtime risk

- **Priority:** `P1`
- **Tags:** `owner:API` `effort:S` `status:Done`
- **Context:** Controllers call `.page/.per` without pagination gem.
- **Scope:**
  - Add Kaminari (or remove `.page/.per` and use `offset/limit` consistently).
- **Definition of Done:**
  - Refund and inventory list endpoints paginate without runtime errors.
  - Pagination metadata remains clear and documented.

### 7) Align CI with monorepo root

- **Priority:** `P1`
- **Tags:** `owner:DevOps` `effort:M` `status:Done`
- **Context:** Workflow files currently under `api/.github/workflows`; root workflows are missing.
- **Scope:**
  - Add root `.github/workflows/pr-checks.yml`.
  - Run API checks and frontend checks from correct working directories.
  - Include `havajava` and `threesquares`.
- **Definition of Done:**
  - PR to `main` triggers checks from repo root.
  - CI blocks merges on failed lint/types/build.

### 8) Expand gate script coverage to both frontends

- **Priority:** `P1`
- **Tags:** `owner:DevOps` `effort:S` `status:Done`
- **Context:** `scripts/gate.sh` currently validates only `havajava` for frontend checks.
- **Scope:**
  - Add typecheck/lint/build for `threesquares`.
  - Keep output concise and actionable.
- **Definition of Done:**
  - Gate script fails if either frontend fails typecheck/lint/build.
  - Script remains runnable locally and in CI.

### 9) Standardize deployment configuration (Render + Netlify + Neon)

- **Priority:** `P1`
- **Tags:** `owner:DevOps` `effort:M` `status:Done`
- **Context:** Repo has Kamal scaffold while primary intended stack is Render/Netlify/Neon.
- **Scope:**
  - Add root deployment docs and environment matrix for Render/Netlify/Neon.
  - Add frontend `netlify.toml` files if needed.
  - Add or document Render service config pattern.
  - Mark Kamal config as unused or remove it.
- **Definition of Done:**
  - One canonical deployment path is documented and tested in staging.
  - A new teammate can deploy API + both frontends using docs alone.

---

## Phase 3 - Product Consistency and UX Hardening (P1/P2)

Target: close expectation gaps between documented features and user experience.

### 10) Decide and implement Three Squares payment mode for launch

- **Priority:** `P1`
- **Tags:** `owner:Product+Frontend+API` `effort:M` `status:Done`
- **Decision needed:**
  - Option A: Online payment enabled for Three Squares now.
  - Option B: Counter-pay only for initial launch with explicit docs and UI copy.
- **Definition of Done:**
  - Decision is documented.
  - UI, docs, and backend behavior all match the chosen mode.

### 11) Complete merchandise checkout strategy

- **Priority:** `P1`
- **Tags:** `owner:Product+API+Frontend` `effort:L` `status:Done`
- **Context:** Cookie store cart exists, checkout currently not implemented.
- **Scope options:**
  - Option A: Keep Shopify as source-of-truth and deep-link for checkout.
  - Option B: Full native checkout in platform (requires order item model expansion).
- **Current decision:** Option A implemented (Shopify handoff checkout in Cookie Store cart).
- **Definition of Done:**
  - End-to-end checkout path is live and testable.
  - Inventory and fulfillment responsibilities are clearly defined.
  - Docs reflect actual architecture.

### 12) Cart and payment failure UX resilience

- **Priority:** `P2`
- **Tags:** `owner:Frontend` `effort:M` `status:Done`
- **Scope:**
  - Persist cart state per tenant.
  - Improve retry/restore flows after payment setup failure.
  - Avoid clearing cart before successful payment confirmation when applicable.
- **Definition of Done:**
  - Refresh does not unexpectedly wipe active carts.
  - Payment recoverability is clear and user-friendly.

---

## Phase 4 - Documentation and Operational Readiness (P2)

Target: remove ambiguity and improve handoff quality.

### 13) Refresh core docs to match current architecture

- **Priority:** `P2`
- **Tags:** `owner:Docs` `effort:M` `status:Done`
- **Scope:**
  - Update root `README.md` to current monorepo structure and setup.
  - Reconcile `PRD.md`, `ARCHITECTURE.md`, `BUILD_PLAN.md` with implementation status.
  - Remove or clearly annotate stale assumptions.
- **Definition of Done:**
  - No major contradiction between docs and code paths.
  - New contributors can trust docs as source-of-truth.

### 14) Create production runbook + incident checklist

- **Priority:** `P2`
- **Tags:** `owner:DevOps+QA` `effort:S` `status:Todo`
- **Scope:**
  - Add release checklist (migrations, env vars, smoke tests, rollback).
  - Add payment incident triage steps (webhook failures, stuck orders, refund mismatch).
- **Definition of Done:**
  - Runbook exists and is usable during a production issue.

---

## Two-Week Rollout Plan (Render + Netlify + Neon)

### Week 1 - Core Safety and Correctness

Day 1-2:
- Task 1, 2 (webhook + idempotent payment intent path)
- Task 4 (admin tenant fallback removal)

Day 3:
- Task 3 (onboarding endpoint protection)
- Task 5 (safe status transitions in admin updates)

Day 4:
- Task 6 (pagination reliability)
- Task 8 (gate script includes both frontends)

Day 5:
- Task 7 (root CI workflows)
- Stage validation run: gate + manual payment + order status flows

### Week 2 - Deploy + Product Alignment

Day 1-2:
- Task 9 (deployment standardization for Render/Netlify/Neon)
- Staging deployment of API + both frontends

Day 3:
- Task 10 decision + implementation (Three Squares payment mode)

Day 4-5:
- Task 11 scoping decision and first implementation milestone
- Task 13 docs refresh + Task 14 runbook
- Final launch readiness review

---

## Launch Gate (Must Pass Before Production)

- [ ] All `P0` items complete and verified.
- [ ] CI runs from repo root and blocks on failures.
- [ ] `scripts/gate.sh` passes for API + shared + both frontends.
- [ ] Staging deployment validated on Render/Netlify/Neon.
- [ ] Payment success/failure webhook paths verified with Stripe test events.
- [ ] Tenant isolation verified on admin routes.
- [ ] Documentation updated to match real behavior.

---

## Ownership Matrix

- **API:** Payments, auth/authorization, transitions, pagination
- **Frontend:** Checkout UX, cart resilience, tenant UI consistency
- **DevOps:** CI, deployment configs, environment wiring, release process
- **Docs:** Architecture/plan consistency, setup accuracy, runbooks
- **QA:** End-to-end validation across tenants and critical flows

---

## Notes

- This checklist is intentionally execution-focused and should be updated as tasks move to Done.
- If scope pressure increases, prioritize all `P0` and first six `P1` items before any new features.
