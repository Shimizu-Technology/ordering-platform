# Ordering Platform

A multi-tenant restaurant ordering SaaS platform. Built by [Shimizu Technology](https://shimizu-technology.com).

**First tenant:** HavaJava 671 Café — Hagåtña, Guam

## Architecture

```
ordering-platform/
├── ordering-platform-api/    # Rails 7 API-only (Ruby 3.3+)
├── ordering-platform-web/    # React + Vite + TypeScript + Tailwind + Framer Motion
├── AGENTS.md                 # AI agent context
├── PRD.md                    # Product Requirements Document
├── BUILD_PLAN.md             # Phase-by-phase build plan
└── .cursor/rules/            # Cursor IDE rules
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Rails 7 API-only, Ruby 3.3+ |
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS v4, Framer Motion |
| **Database** | PostgreSQL 17 |
| **Payments** | Stripe |
| **State** | Zustand (client-side cart) |
| **Icons** | Lucide React (no emoji in UI) |

## Getting Started

### Prerequisites

- Ruby 3.2+ (via rbenv)
- Node.js 20+ and npm
- PostgreSQL 14+
- Git

### Backend Setup

```bash
cd ordering-platform-api

# Install dependencies
bundle install

# Set up database
cp .env.example .env  # Edit with your DB credentials
bin/rails db:create
bin/rails db:migrate
bin/rails db:seed     # Seeds HavaJava restaurant + full menu

# Start the server
bin/rails server -p 3001
```

### Frontend Setup

```bash
cd ordering-platform-web

# Install dependencies
npm install

# Start dev server (proxies API to localhost:3001)
npm run dev
```

Visit `http://localhost:5173/havajava` to see the menu.

### Verify API

```bash
# Restaurant info
curl http://localhost:3001/api/v1/restaurants/havajava | jq .

# Full menu with modifiers
curl http://localhost:3001/api/v1/restaurants/havajava/menu | jq .

# Place an order
curl -X POST http://localhost:3001/api/v1/restaurants/havajava/orders \
  -H "Content-Type: application/json" \
  -d '{
    "order": {
      "customer_name": "Test User",
      "phone": "671-555-0100",
      "order_type": "pickup",
      "items": [
        {
          "menu_item_id": 1,
          "quantity": 1,
          "modifier_ids": [1, 3]
        }
      ]
    }
  }' | jq .
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/restaurants/:slug` | Restaurant info + branding |
| `GET` | `/api/v1/restaurants/:slug/menu` | Full menu with categories, items, modifier groups, modifiers |
| `POST` | `/api/v1/restaurants/:slug/orders` | Create order with items + modifiers |
| `GET` | `/api/v1/restaurants/:slug/orders/:id` | Order status and details |
| `POST` | `/api/v1/restaurants/:slug/orders/:id/pay` | Create Stripe PaymentIntent |

## Data Model

```
Restaurant (tenant)
├── MenuCategory → MenuItem → ModifierGroup → Modifier
└── Order → OrderItem → OrderItemModifier
```

The modifier group system is the key innovation — it handles everything from drink sizes to full sandwich builders with a single flexible model:

- **Drink size:** Required, pick 1 (Tall / Grande)
- **Hot/Cold:** Required, pick 1
- **Sandwich meat:** Required, pick 1
- **Cheese:** Optional, pick 0-1 (+$0.60 each)
- **Veggies:** Optional, pick any
- **Smoothie fruits:** Required, pick exactly 2

## Seeded Data

The seed file includes the complete HavaJava 671 Café menu:
- **9 categories** (Espresso, Ice-Blended, Iced Tea, Hot Beverages, Grab & Go, Breakfast, Custom Sandwiches, Pastries, Retail)
- **44 menu items**
- **51 modifier groups**
- **135 modifiers**

## Design System

The platform uses a dynamic brand token system. Colors, fonts, and branding are loaded from the API and applied as CSS custom properties at runtime. Each restaurant tenant can have its own look and feel without code changes.

### Design Rules
- No emoji in UI — Lucide React icons only
- Mobile-first, 44px minimum touch targets
- Framer Motion for all animations
- Brand tokens via CSS custom properties (not hardcoded)
