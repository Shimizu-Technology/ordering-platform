# Product Requirements Document — Ordering Platform

**Version:** 2.0
**Date:** February 9, 2026
**Status:** Active Development

---

## Executive Summary

A **multi-tenant restaurant ordering platform** built as a monorepo. Each restaurant gets a fully customized frontend while sharing a common Rails API and React component library.

### Current Tenants

| Restaurant | Type | Key Features |
|------------|------|--------------|
| **HavaJava Café** | Coffee shop | Online ordering, promotions |
| **Three Squares / B&G Pacific** | Restaurant + Catering | Multi-location, catering quotes, cookie store |

---

## Guiding Principles

### 1. One Repo, Full Context
Everything in a monorepo so AI code review tools (CodeRabbit, Greptile) have complete visibility on every PR.

### 2. Shared Core, Custom Shell
Common functionality in `packages/shared`; each client gets a unique frontend in `frontends/`.

### 3. Mobile-First
Every feature must work beautifully on a phone. Desktop is secondary.

### 4. Feature Flexibility
Clients only use (and pay for) the features they need. Feature flags per tenant.

### 5. Custom Domains
Each client gets their own domain (order.havajava.com, not havajava.shimizu-tech.com).

### 6. Augment, Don't Replace
Works alongside existing POS systems (KwickPOS, Revel, Clover). We handle online orders; they keep their in-person systems.

### 7. 48-Hour Onboarding
New restaurants should be deployable within 48 hours using the `_template` frontend.

---

## Business Information

| Field | Value |
|-------|-------|
| **Company** | Shimizu Technology |
| **Platform** | Ordering Platform (SaaS) |

### Pricing Model

| Tier | Monthly | Features |
|------|---------|----------|
| **Starter** | $99/mo | Core ordering, notifications, basic dashboard |
| **Pro** | $149/mo | + Analytics, promotions, SMS notifications |
| **Business** | $249/mo | + Multi-location, catering, merchandise store |
| **Enterprise** | Custom | + POS integration, custom features, SLA |

- Setup fee: $0-500 (waived for early customers)
- Stripe fees: Passed through to restaurant
- Platform fee: Optional 1-2% per transaction (via Stripe Connect)

---

## Technical Architecture

### Monorepo Structure

```
ordering-platform/
├── api/                    # Rails 7 multi-tenant backend
├── packages/
│   └── shared/             # @shimizu/shared React components
├── frontends/
│   ├── _template/          # Starter for new clients
│   ├── havajava/           # HavaJava custom frontend
│   └── threesquares/       # Three Squares custom frontend
└── docs/
    └── starter-app/        # Shimizu Technology standards & guides
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Rails 7 API-only, Ruby 3.3+, PostgreSQL |
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS v4, Framer Motion |
| **Payments** | Stripe + Stripe Connect |
| **Auth** | Clerk (admin), Guest checkout (customers) |
| **State** | Zustand |
| **Icons** | Lucide React (NO emojis in UI — SVGs only) |
| **Package Manager** | pnpm (monorepo workspaces) |
| **Deployment** | Render (API), Netlify (frontends) |

### Design Standards

All frontends follow [FRONTEND_DESIGN_GUIDE.md](./docs/starter-app/FRONTEND_DESIGN_GUIDE.md):
- Consistent component patterns
- Responsive design (mobile-first)
- Accessibility (WCAG 2.1 AA)
- Performance (Core Web Vitals)

---

## User Roles

| Role | Description | Access |
|------|-------------|--------|
| **Customer** | Browse menu, place orders | Guest checkout (no account required) |
| **Staff** | View orders, update status, create orders | Restaurant-specific login |
| **Admin** | Manage menu, settings, analytics | Restaurant-specific login |
| **Super Admin** | Manage all restaurants (Shimizu Tech) | Platform-wide access |

---

## Feature Matrix

| Feature | Description | HavaJava | Three Squares |
|---------|-------------|:--------:|:-------------:|
| **Core Ordering** | Menu, cart, checkout | ✅ | ✅ |
| **Guest Checkout** | Order without account | ✅ | ✅ |
| **Order Management** | Staff dashboard | ✅ | ✅ |
| **Notifications** | Email + SMS confirmations | ✅ | ✅ |
| **Stripe Payments** | Online payment | ✅ | ✅ |
| **Promotions** | Happy hour, discounts | ✅ | ✅ |
| **Simple POS** | Staff order creation | ✅ | ✅ |
| **Multi-Location** | Choose pickup location | ❌ | ✅ |
| **Catering** | Quote requests, platters | ❌ | ✅ |
| **Merchandise** | Separate product store | ❌ | ✅ |
| **Bulk/Corporate** | Corporate account inquiries | ❌ | ✅ |
| **Rewards** | Loyalty points | 🟡 Phase 2 | 🟡 Phase 2 |
| **Inventory** | Stock tracking | 🟡 Phase 2 | 🟡 Phase 2 |
| **POS Integration** | KwickPOS, Revel, Clover | 🟡 Phase 3 | 🟡 Phase 3 |

---

## Data Models

### Core Models

#### Restaurant (Tenant)
```
name, slug, phone, email, address, description
logo_url, primary_color, secondary_color, accent_color, font_family
hours (JSON), timezone
stripe_account_id, stripe_onboarding_complete
features (JSON): { catering, multi_location, merchandise, rewards }
notifications_enabled, webhook_url
active, setup_complete
```

#### Location (Multi-location support)
```
restaurant_id, name, address, phone
hours (JSON), active
```

#### Menu System
- **MenuCategory:** restaurant_id, name, position, active
- **MenuItem:** category_id, name, description, base_price, image_url, available, position
- **ModifierGroup:** menu_item_id, name, required, min_select, max_select, position
- **Modifier:** modifier_group_id, name, price_adjustment, default_selected, position

#### Orders
- **Order:** restaurant_id, location_id, order_number, customer_name, phone, email, order_type, status, total, stripe_payment_intent_id, special_instructions
- **OrderItem:** order_id, menu_item_id, quantity, unit_price, subtotal
- **OrderItemModifier:** order_item_id, modifier_id, price_adjustment

### Extended Models (Business Tier)

#### Catering
- **CateringInquiry:** restaurant_id, customer_name, email, phone, event_date, event_type, guest_count, budget, notes, status

#### Merchandise (Latte Stone Cookies)

Based on actual Shopify store research (latte-stone-cookies.myshopify.com):

- **MerchandiseCategory:** restaurant_id, name, description, position, active
  - Examples: "Assortment Boxes", "Single Flavors", "Tin Collection", "Gift Sets"
  
- **MerchandiseItem:** category_id, name, description, base_price, image_url, available, position
  - Examples: "6pc Chocolate Dipped Assortment" ($11.00), "12pc Grand Assortment", "30pc Grand Assortment"
  
- **MerchandiseVariant:** item_id, name, sku, price_adjustment, stock_quantity, available
  - For items with size options (e.g., Classic Assortment Tin in 9pc or 20pc)

**Product Lines Discovered:**
- 6 cookie flavors: Vanilla, Chocolate, Coconut, Mango, Pineapple, Passionfruit
- Each flavor available plain or chocolate-dipped
- Collections: Tropical, Tin, Snack Bag, Fruit, Artist Edition, Slingstone
- Also sells keepsakes/gifts (puzzles, souvenirs) — TBD if in scope

**Branding Note:** Latte Stone Cookies has separate branding from Three Squares restaurant. The cookie store section will have its own theme within the Three Squares app.

**Fulfillment:** 
- POC: Local pickup only (at Three Squares locations)
- Future: Add shipping (similar to Hafaloha's EasyPost integration)

---

## Order Flow

### Customer Flow
```
1. Customer visits order.havajava.com
2. Browses menu by category
3. Selects item → Modifier sheet opens
4. Configures modifiers (size, extras, etc.)
5. Adds to cart
6. Repeats for additional items
7. Opens cart → Reviews order
8. Proceeds to checkout
9. Enters contact info (name, phone, email)
10. Pays via Stripe
11. Receives confirmation (screen + email/SMS)
12. Waits for "Ready" notification
13. Picks up order
```

### Staff Flow
```
1. New order notification (sound + visual)
2. Staff views order in dashboard
3. Marks as "In Progress"
4. Prepares order
5. Marks as "Ready" → Customer notified
6. Customer arrives
7. Staff verifies and marks "Completed"
```

---

## Modifier Group System

| Use Case | Config | Example |
|----------|--------|---------|
| Drink size | required, pick 1 | Tall ($0) / Grande (+$0.55) |
| Temperature | required, pick 1 | Hot / Iced |
| Sandwich meat | required, pick 1 | Pastrami / Turkey / Ham |
| Cheese | optional, pick 0-1 | American / Swiss (+$0.60) |
| Veggies | optional, pick any | Lettuce / Tomato / Red Onion |
| Smoothie fruits | required, pick exactly 2 | Strawberry / Banana / Mango |
| Bagel toppings | optional, pick any | Butter / Jam / Cream Cheese (+$0.85) |
| Bread | required, pick 1 | White / Wheat / Baguette |

---

## POS Integration Strategy

Both HavaJava (KwickPOS) and Three Squares (Revel/Clover) have existing POS systems.

### Phase 1: Separate Systems (Current)
- Online orders → Our platform
- In-person orders → Their POS
- Staff checks two systems
- Manual end-of-day reconciliation

### Phase 2: Basic Integration (Future)
- Push completed orders to POS via API
- Unified reporting
- Requires POS API access

### Phase 3: Deep Integration (Future)
- Real-time inventory sync
- Unified menu management
- Single source of truth

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Order conversion rate | > 60% (cart → completed) |
| Average order time | < 3 minutes |
| Order accuracy | > 99% |
| Staff adoption | 100% within 1 week |
| Customer satisfaction | > 4.5/5 rating |
| Platform uptime | 99.9% |

---

## Related Documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Technical architecture & monorepo structure
- [BUILD_PLAN.md](./BUILD_PLAN.md) — Development phases & timeline
- [docs/starter-app/](./docs/starter-app/) — Shimizu Technology standards & guides

---

*Document maintained by Shimizu Technology | Last updated: February 9, 2026*
