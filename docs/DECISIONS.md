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

## Latte Stone Cookies Store

### 6. Separate Branding
**Decision:** Cookie store has its own theme within the Three Squares app

**Why:**
- Latte Stone Cookies has a separate Shopify store with different branding
- Gift-focused vs restaurant-focused messaging
- Different customer journey

**Implementation:**
- `cookie-theme.css` for cookie store pages
- Separate logo asset
- Can share navigation/cart with restaurant

### 7. Pickup Only for POC
**Decision:** Local pickup only initially, shipping later

**Why:**
- Simpler to implement
- Matches Three Squares restaurant model
- Can add shipping post-POC (similar to Hafaloha EasyPost)

**Future:** EasyPost integration for shipping

### 8. Product Scope for POC
**Decision:** Seed top 5-6 products with estimated prices

**Products to seed:**
- 2pc Box (~$5)
- 6pc Chocolate Dipped Assortment ($11 confirmed)
- 12pc Grand Assortment (~$22)
- 30pc Grand Assortment (~$50)
- 9pc Classic Tin (~$18)

**Out of scope for POC:**
- Full product catalog (need from client)
- Wedding favor custom orders
- Keepsakes/gifts
- Slingstone Cookies (different product line)

---

## Race Condition Protection

### 9. Optimistic Locking + Idempotency
**Decision:** Multi-layer protection against concurrent modifications

**Problem (from Shimizu Order Suite):**
- Double-charging customers on payment retries
- Staff overwriting each other's order updates
- Invalid status jumps (pending→ready skipping steps)

**Solution:**

| Layer | Implementation | Prevents |
|-------|---------------|----------|
| Optimistic Locking | `lock_version` column on orders | Concurrent updates |
| Idempotency Keys | `idempotency_key` column, passed to Stripe | Double-charging |
| Row-Level Locking | `SELECT FOR UPDATE` during transitions | Race during status change |
| Transition Validation | `SafeStatusTransitions` concern | Invalid state jumps |

**Status Flow:**
```
pending → confirmed → preparing → ready → completed
    ↓          ↓            ↓
 cancelled  cancelled   cancelled
```

**Key Code:**
- `app/models/concerns/safe_status_transitions.rb`
- `app/services/payment_service.rb`
- Order methods: `confirm!`, `start_preparing!`, `mark_ready!`, `complete!`, `cancel!`

**Error Handling:**
- `ActiveRecord::StaleObjectError` → "Order was modified, please refresh"
- `InvalidTransitionError` → "Cannot change status from X to Y"

---

*Add new decisions here as they're made.*
