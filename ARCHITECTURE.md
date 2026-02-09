# Ordering Platform — Architecture

**Version:** 2.0
**Last Updated:** February 9, 2026
**Status:** Planned (restructure in progress)

---

## Overview

A multi-tenant restaurant ordering platform built as a **monorepo**. Each restaurant gets their own customized frontend while sharing a common backend API and component library.

### Design Principles

1. **One Repo, Full Context** — Everything lives in one monorepo so code review tools (CodeRabbit, Greptile) have complete visibility.
2. **Shared Core, Custom Shell** — Common functionality in a shared library; each client gets a unique frontend.
3. **Feature Flexibility** — Clients only use (and pay for) the features they need.
4. **Custom Domains** — Each client gets their own domain (order.havajava.com, not havajava.shimizu.tech).
5. **Augment, Don't Replace** — Works alongside existing POS systems (KwickPOS, Revel, Clover).

---

## Repository Structure

```
ordering-platform/
│
├── api/                              # Rails 7 API (multi-tenant)
│   ├── app/
│   │   ├── controllers/
│   │   │   └── api/v1/
│   │   │       ├── restaurants/      # Scoped by restaurant
│   │   │       │   ├── menu_controller.rb
│   │   │       │   ├── orders_controller.rb
│   │   │       │   ├── catering_controller.rb
│   │   │       │   └── ...
│   │   │       └── admin/            # Restaurant admin endpoints
│   │   ├── models/
│   │   │   ├── restaurant.rb         # Tenant model
│   │   │   ├── menu_category.rb
│   │   │   ├── menu_item.rb
│   │   │   ├── modifier_group.rb
│   │   │   ├── modifier.rb
│   │   │   ├── order.rb
│   │   │   ├── location.rb           # Multi-location support
│   │   │   ├── catering_inquiry.rb   # Catering quotes
│   │   │   └── ...
│   │   └── services/
│   │       ├── order_notification_service.rb
│   │       └── ...
│   ├── db/
│   │   ├── migrate/
│   │   └── seeds/
│   │       ├── havajava.rb           # HavaJava menu seed
│   │       ├── threesquares.rb       # Three Squares menu seed
│   │       └── ...
│   ├── config/
│   └── Gemfile
│
├── packages/                         # Shared code
│   │
│   └── shared/                       # @shimizu/shared npm package
│       ├── package.json
│       ├── tsconfig.json
│       ├── src/
│       │   ├── index.ts              # Public exports
│       │   │
│       │   ├── components/           # Reusable UI components
│       │   │   ├── menu/
│       │   │   │   ├── MenuGrid.tsx
│       │   │   │   ├── MenuItemCard.tsx
│       │   │   │   ├── MenuItemDetail.tsx
│       │   │   │   ├── ModifierSelector.tsx
│       │   │   │   └── CategoryNav.tsx
│       │   │   ├── cart/
│       │   │   │   ├── CartDrawer.tsx
│       │   │   │   ├── CartItem.tsx
│       │   │   │   └── CartSummary.tsx
│       │   │   ├── checkout/
│       │   │   │   ├── CheckoutForm.tsx
│       │   │   │   ├── PaymentForm.tsx
│       │   │   │   └── OrderConfirmation.tsx
│       │   │   ├── orders/
│       │   │   │   ├── OrderStatus.tsx
│       │   │   │   └── OrderHistory.tsx
│       │   │   ├── admin/
│       │   │   │   ├── OrderQueue.tsx
│       │   │   │   ├── OrderCard.tsx
│       │   │   │   ├── MenuManager.tsx
│       │   │   │   └── SettingsPanel.tsx
│       │   │   ├── catering/
│       │   │   │   ├── CateringForm.tsx
│       │   │   │   ├── PlattersBuilder.tsx
│       │   │   │   └── QuoteRequest.tsx
│       │   │   ├── locations/
│       │   │   │   └── LocationPicker.tsx
│       │   │   ├── pos/
│       │   │   │   ├── POSOrderBuilder.tsx
│       │   │   │   └── QuickAdd.tsx
│       │   │   └── ui/
│       │   │       ├── Button.tsx
│       │   │       ├── Input.tsx
│       │   │       ├── Modal.tsx
│       │   │       └── ...
│       │   │
│       │   ├── hooks/
│       │   │   ├── useCart.ts
│       │   │   ├── useMenu.ts
│       │   │   ├── useOrders.ts
│       │   │   ├── useRestaurant.ts
│       │   │   └── useAuth.ts
│       │   │
│       │   ├── stores/
│       │   │   ├── cartStore.ts      # Zustand store
│       │   │   ├── orderStore.ts
│       │   │   └── authStore.ts
│       │   │
│       │   ├── services/
│       │   │   ├── api.ts            # API client
│       │   │   ├── menuService.ts
│       │   │   ├── orderService.ts
│       │   │   └── paymentService.ts
│       │   │
│       │   ├── types/
│       │   │   ├── menu.ts
│       │   │   ├── order.ts
│       │   │   ├── restaurant.ts
│       │   │   └── ...
│       │   │
│       │   └── utils/
│       │       ├── formatters.ts
│       │       ├── validators.ts
│       │       └── constants.ts
│       │
│       └── styles/
│           └── base.css              # Base styles (can be overridden)
│
├── frontends/                        # Client-specific frontends
│   │
│   ├── _template/                    # Starter template for new clients
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── index.html
│   │   ├── netlify.toml
│   │   ├── public/
│   │   │   └── favicon.ico
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── config.ts             # Feature flags, API config
│   │   │   ├── theme.css             # Brand colors, fonts
│   │   │   ├── global.css
│   │   │   ├── assets/
│   │   │   │   └── logo.svg
│   │   │   └── pages/
│   │   │       ├── HomePage.tsx
│   │   │       ├── MenuPage.tsx
│   │   │       ├── CheckoutPage.tsx
│   │   │       ├── OrderStatusPage.tsx
│   │   │       └── admin/
│   │   │           └── DashboardPage.tsx
│   │   └── README.md
│   │
│   ├── havajava/                     # HavaJava Café
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── netlify.toml              # Deploy config for order.havajava.com
│   │   ├── src/
│   │   │   ├── config.ts             # { catering: false, multiLocation: false }
│   │   │   ├── theme.css             # HavaJava brand colors
│   │   │   ├── assets/
│   │   │   │   ├── logo.svg
│   │   │   │   └── hero.jpg
│   │   │   └── pages/
│   │   │       ├── HomePage.tsx      # Custom landing page
│   │   │       ├── MenuPage.tsx
│   │   │       └── ...
│   │   └── README.md
│   │
│   └── threesquares/                 # Three Squares / B&G Pacific
│       ├── package.json
│       ├── vite.config.ts
│       ├── netlify.toml              # Deploy config for order.threesquares.com
│       ├── src/
│       │   ├── config.ts             # { catering: true, multiLocation: true, merchandise: true }
│       │   ├── theme.css             # Three Squares brand colors
│       │   ├── assets/
│       │   └── pages/
│       │       ├── HomePage.tsx
│       │       ├── MenuPage.tsx
│       │       ├── CateringPage.tsx      # Unique to Three Squares
│       │       ├── CookieStorePage.tsx   # Latte Stone Cookies
│       │       └── ...
│       └── README.md
│
├── .github/
│   └── workflows/
│       ├── api-deploy.yml            # Deploy API to Render
│       ├── frontend-deploy.yml       # Deploy frontends to Netlify
│       └── pr-checks.yml             # Lint, test, CodeRabbit
│
├── pnpm-workspace.yaml               # Monorepo workspace config
├── package.json                      # Root package.json
├── turbo.json                        # Turborepo config (optional)
├── ARCHITECTURE.md                   # This document
├── AGENTS.md                         # AI assistant context
└── README.md                         # Getting started
```

---

## Multi-Tenancy Model

### Backend (Rails API)

Every request is scoped to a restaurant:

```ruby
# All API routes are prefixed with restaurant slug
# GET /api/v1/restaurants/:slug/menu
# POST /api/v1/restaurants/:slug/orders

class Api::V1::Restaurants::MenuController < ApplicationController
  before_action :set_restaurant
  
  def index
    @categories = @restaurant.menu_categories
                             .includes(menu_items: :modifier_groups)
                             .where(active: true)
    render json: @categories
  end
  
  private
  
  def set_restaurant
    @restaurant = Restaurant.find_by!(slug: params[:restaurant_slug])
  end
end
```

### Frontend

Each frontend is configured with its restaurant slug:

```typescript
// frontends/havajava/src/config.ts
export const config = {
  restaurantSlug: 'havajava',
  apiUrl: 'https://api.shimizu-order.com',
  
  features: {
    catering: false,
    multiLocation: false,
    merchandise: false,
    rewards: false,
    pos: true,
  },
  
  branding: {
    name: 'HavaJava Café',
    tagline: "Guam's Oldest Specialty Coffee Shop",
  },
};
```

---

## Feature System

Features are controlled at two levels:

### 1. Backend (Restaurant model)

```ruby
# db/schema.rb
create_table "restaurants" do |t|
  t.string "name"
  t.string "slug"
  t.jsonb "features", default: {}
  # features: { catering: true, multi_location: true, merchandise: true }
end
```

### 2. Frontend (config.ts)

Each frontend only includes pages/components for enabled features:

```typescript
// frontends/threesquares/src/App.tsx
import { config } from './config';
import { MenuPage, CheckoutPage } from '@shimizu/shared';
import { CateringPage } from './pages/CateringPage';
import { CookieStorePage } from './pages/CookieStorePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      
      {config.features.catering && (
        <Route path="/catering" element={<CateringPage />} />
      )}
      {config.features.merchandise && (
        <Route path="/cookies" element={<CookieStorePage />} />
      )}
    </Routes>
  );
}
```

---

## Available Features

| Feature | Description | HavaJava | Three Squares |
|---------|-------------|:--------:|:-------------:|
| **Core Ordering** | Menu browsing, cart, checkout | ✅ | ✅ |
| **Order Management** | Staff dashboard, status updates | ✅ | ✅ |
| **Notifications** | Email/SMS confirmations | ✅ | ✅ |
| **Stripe Payments** | Online payment processing | ✅ | ✅ |
| **Guest Checkout** | Order without account | ✅ | ✅ |
| **Promotions** | Happy hour, discounts | ✅ | ✅ |
| **Multi-Location** | Choose pickup location | ❌ | ✅ |
| **Catering** | Quote requests, party platters | ❌ | ✅ |
| **Merchandise** | Separate product store | ❌ | ✅ |
| **Bulk/Corporate** | Corporate account inquiries | ❌ | ✅ |
| **Simple POS** | Staff order creation | ✅ | ✅ |
| **Rewards** | Loyalty points (Phase 2) | 🟡 | 🟡 |
| **Inventory** | Stock tracking (Phase 2) | 🟡 | 🟡 |

---

## Custom Domains

Each frontend deploys to its own custom domain:

| Frontend | Domain | Netlify Site |
|----------|--------|--------------|
| havajava | order.havajava.com | shimizu-havajava |
| threesquares | order.threesquares.com | shimizu-threesquares |

### DNS Setup (Client does this)

```
# Client's DNS
order.havajava.com  CNAME  shimizu-havajava.netlify.app
```

### Netlify Config

```toml
# frontends/havajava/netlify.toml
[build]
  command = "pnpm build"
  publish = "dist"
  base = "frontends/havajava"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Styling & Theming

Each frontend has complete control over its appearance:

### Theme Variables (CSS Custom Properties)

```css
/* frontends/havajava/src/theme.css */
:root {
  /* Brand Colors */
  --color-primary: #4A2C2A;       /* Coffee brown */
  --color-secondary: #D4A574;     /* Cream */
  --color-accent: #8B4513;        /* Saddle brown */
  
  /* Typography */
  --font-heading: 'Playfair Display', serif;
  --font-body: 'Open Sans', sans-serif;
  
  /* Layout */
  --header-height: 72px;
  --max-width: 1200px;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
}
```

```css
/* frontends/threesquares/src/theme.css */
:root {
  --color-primary: #1B4332;       /* Forest green */
  --color-secondary: #FFD700;     /* Gold */
  --color-accent: #2D6A4F;        /* Teal green */
  
  --font-heading: 'Montserrat', sans-serif;
  --font-body: 'Roboto', sans-serif;
  
  /* Different layout */
  --header-height: 80px;
  --max-width: 1400px;
}
```

### Component Styling

Shared components use CSS variables, so they automatically adapt:

```tsx
// packages/shared/src/components/ui/Button.tsx
export function Button({ children, variant = 'primary' }) {
  return (
    <button className={`btn btn-${variant}`}>
      {children}
    </button>
  );
}
```

```css
/* packages/shared/styles/base.css */
.btn-primary {
  background: var(--color-primary);
  color: white;
}
```

When HavaJava uses `<Button>`, it's brown. When Three Squares uses it, it's green.

---

## Adding a New Client

### Step-by-Step Process

1. **Copy the template:**
   ```bash
   cp -r frontends/_template frontends/newclient
   ```

2. **Update config:**
   ```typescript
   // frontends/newclient/src/config.ts
   export const config = {
     restaurantSlug: 'newclient',
     features: { ... },
     branding: { ... },
   };
   ```

3. **Customize theme:**
   ```css
   /* frontends/newclient/src/theme.css */
   :root {
     --color-primary: #...;
   }
   ```

4. **Add custom pages** (if needed)

5. **Seed backend data:**
   ```ruby
   # api/db/seeds/newclient.rb
   restaurant = Restaurant.create!(
     name: 'New Client',
     slug: 'newclient',
     features: { catering: false }
   )
   # Add menu items...
   ```

6. **Create Netlify site** and configure domain

7. **Deploy!**

**Target: New client live in 48 hours or less.**

---

## Deployment

### API (Render)

Single Rails app serving all tenants:

```yaml
# render.yaml
services:
  - type: web
    name: ordering-platform-api
    env: ruby
    buildCommand: bundle install && rails db:migrate
    startCommand: rails server
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: ordering-platform-db
```

### Frontends (Netlify)

Each frontend is a separate Netlify site:

```yaml
# .github/workflows/frontend-deploy.yml
name: Deploy Frontends

on:
  push:
    branches: [main]
    paths:
      - 'frontends/**'
      - 'packages/shared/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        frontend: [havajava, threesquares]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm --filter @shimizu/${{ matrix.frontend }} build
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=frontends/${{ matrix.frontend }}/dist
        env:
          NETLIFY_SITE_ID: ${{ secrets[format('NETLIFY_SITE_{0}', matrix.frontend)] }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

---

## Development Workflow

### Local Setup

```bash
# Clone repo
git clone https://github.com/Shimizu-Technology/ordering-platform.git
cd ordering-platform

# Install dependencies
pnpm install

# Start API
cd api && rails db:setup && rails server

# Start a frontend (in another terminal)
cd frontends/havajava && pnpm dev
```

### Working on Shared Components

```bash
# Changes to packages/shared are automatically picked up
# by frontends in dev mode (pnpm workspace linking)

# To test in a specific frontend:
cd frontends/havajava
pnpm dev
```

### Creating a PR

1. Create feature branch
2. Make changes (API, shared, or specific frontend)
3. Push and create PR
4. CodeRabbit/Greptile review with full repo context
5. Merge to main → auto-deploy

---

## POS Integration Strategy

Both HavaJava (KwickPOS) and Three Squares (Revel/Clover) have existing POS systems.

### Phase 1: Separate Systems (Now)
- Online orders go to our platform
- In-person orders stay in their POS
- Staff checks two systems
- Manual end-of-day reconciliation

### Phase 2: Basic Integration (Future)
- Push completed online orders to their POS via API
- Unified end-of-day reporting
- Requires POS API access (Clover API, Revel API)

### Phase 3: Deep Integration (Future)
- Real-time inventory sync
- Unified menu management
- Single source of truth

---

## Pricing Model

| Tier | Monthly | Features |
|------|---------|----------|
| **Starter** | $99/mo | Core ordering, notifications, basic dashboard |
| **Pro** | $149/mo | + Analytics, promotions, SMS notifications |
| **Business** | $249/mo | + Multi-location, catering, merchandise store |
| **Enterprise** | Custom | + POS integration, custom features, SLA |

- Setup fee: $0-500 (waived for first customers)
- Stripe fees: Passed through to restaurant
- Platform fee: Optional 1-2% per transaction (via Stripe Connect)

---

## Current Tenants

| Tenant | Slug | Status | Features |
|--------|------|--------|----------|
| HavaJava Café | `havajava` | POC | Core ordering, promotions |
| Three Squares | `threesquares` | POC | Core + catering + multi-location + cookies |

---

## Roadmap

### Week 1 (Current)
- [ ] Restructure repo to monorepo
- [ ] Extract shared components
- [ ] Create HavaJava frontend
- [ ] Create Three Squares frontend
- [ ] Deploy both POCs

### Week 2
- [ ] Catering quote system
- [ ] Multi-location picker
- [ ] Cookie/merchandise store
- [ ] Simple POS mode

### Week 3
- [ ] Polish and bug fixes
- [ ] Production deploy
- [ ] Client handoff

### Future
- [ ] Rewards/loyalty system
- [ ] Inventory tracking
- [ ] POS integrations
- [ ] Mobile apps

---

## Related Documents

- [PRD.md](./PRD.md) — Product requirements
- [BUILD_PLAN.md](./BUILD_PLAN.md) — Development phases
- [AGENTS.md](./AGENTS.md) — AI assistant context

---

*Document maintained by Jerry | Last reviewed: February 9, 2026*
