# Project Decisions Log

Key decisions made during planning and development. Reference this when questions come up.

---

## February 9, 2026 — Pre-Build Planning

### 1. Staging Environment
**Decision:** One staging environment with both tenants (HavaJava + Three Squares)
- Single API deployment on Render (staging)
- Both frontend apps connect to same staging API
- Simpler to manage, easier to test cross-tenant features

### 2. Domains
**Decision:** Shimizu Technology will set up and manage domains
- Clients don't have their own domains currently
- We'll register/configure domains on their behalf
- Format TBD (likely `order.havajava.com` style once we set up)
- For staging: use Netlify preview URLs or `*.netlify.app` subdomains

### 3. Stripe Integration
**Decision:** Direct Stripe API credentials per restaurant (NOT Stripe Connect for now)

**How it works:**
- Each restaurant provides their own Stripe API keys (publishable + secret)
- Keys stored securely (env vars or encrypted in DB)
- Payments go directly to the restaurant's Stripe account
- No platform fee for now

**Why not Stripe Connect:**
- Connect requires creating a Stripe App
- More complex OAuth flow
- Overkill for initial launch

**Future:** Can migrate to Stripe Connect later for seamless onboarding (OAuth) and platform fees.

**Implementation:**
```ruby
# Restaurant model
stripe_publishable_key :string
stripe_secret_key :string (encrypted)
stripe_webhook_secret :string (encrypted)
```

### 4. Authentication
**Decision:** Use Clerk (following starter-app/CLERK_AUTH_SETUP_GUIDE.md)

**Why Clerk over WorkOS:**
- Team is more familiar with Clerk
- Already used in other projects (Hafaloha, Cornerstone)
- WorkOS is good but can evaluate later

**Implementation:**
- Clerk for admin/staff authentication
- Guest checkout for customers (no auth required)
- Follow the Clerk setup guide in starter-app docs

### 5. Testing Strategy
**Decision:** Follow starter-app/TESTING_GUIDE.md with gate script

**Immediate:**
- Create `scripts/gate.sh` that runs lint + types + build
- Add as part of monorepo restructure

**Incremental:**
- Add request specs for new API endpoints
- Add model specs for business logic (order totals, promotions)
- Add E2E tests for critical flows (ordering, checkout)

**CI:**
- Gate runs on every PR
- Block merge if gate fails

---

## Architecture Decisions

### Monorepo Package Manager
**Decision:** pnpm with workspaces
- Better for monorepos than npm
- Faster installs, disk-efficient
- Native workspace support

### Shared Components
**Decision:** Start simple, formalize later
- Phase 1: Simple `packages/shared/` folder with direct imports
- Phase 2: Proper npm package with versioning (if needed)

### Feature Flags
**Decision:** JSON column on Restaurant model
```ruby
features: { 
  catering: true, 
  multi_location: true, 
  merchandise: true,
  pos: true,
  rewards: false 
}
```
- Simple, flexible
- No separate feature flag service needed
- Can gate features in both API and frontend

---

*Add new decisions here as they're made.*
