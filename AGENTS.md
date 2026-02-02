# AGENTS.md — Ordering Platform

## What This Is

Multi-tenant restaurant ordering SaaS platform. HavaJava 671 Café (Hagåtña, Guam) is the first tenant.

## Tech Stack

- **Backend:** Rails 7 API-only (Ruby 3.3+, PostgreSQL)
- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS v4 + Framer Motion
- **Payments:** Stripe
- **State Management:** Zustand (cart)
- **Icons:** Lucide React (NO emoji in UI — ever)

## Project Structure

```
ordering-platform/
├── ordering-platform-api/        # Rails API
│   ├── app/
│   │   ├── controllers/api/v1/   # Versioned API controllers
│   │   └── models/               # ActiveRecord models
│   ├── db/
│   │   ├── migrate/              # Database migrations
│   │   └── seeds.rb              # HavaJava menu seed data
│   └── config/routes.rb          # API routes
│
├── ordering-platform-web/        # React frontend
│   └── src/
│       ├── api/                  # API client
│       ├── components/           # UI components
│       │   ├── ui/               # Reusable primitives
│       │   ├── menu/             # Menu browsing
│       │   ├── cart/             # Cart management
│       │   └── order/            # Checkout + confirmation
│       ├── stores/               # Zustand stores
│       ├── types/                # TypeScript types
│       ├── utils/                # Helpers (price, branding)
│       └── pages/                # Page-level components
│
├── PRD.md                        # Product requirements
├── BUILD_PLAN.md                 # Phase build plan
└── .cursor/rules/                # Cursor IDE context
```

## Key Concepts

### Multi-Tenancy
Everything is scoped to a Restaurant (by slug). API routes: `/api/v1/restaurants/:slug/...`

### Modifier Groups
The core innovation. A single flexible model handles ALL menu customization:
- Size selection (Tall/Grande)
- Temperature (Hot/Iced)
- Sandwich builder (meat, cheese, veggies, dressing, bread, toasted)
- Smoothie fruits (pick exactly 2)
- Bagel toppings (optional add-ons with price)

Config: `required`, `min_select`, `max_select` control the behavior.

### Brand Tokens
Restaurant branding (colors, fonts) loads from API → applied as CSS custom properties at runtime. No hardcoded colors.

## Development

```bash
# Backend: localhost:3001
cd ordering-platform-api && bin/rails server -p 3001

# Frontend: localhost:5173 (proxies /api to :3001)
cd ordering-platform-web && npm run dev
```

## Rules

- Mobile-first. Every feature works on phones.
- 44px minimum touch targets.
- Framer Motion for animations.
- No emoji. Use Lucide React icons.
- Clean API responses with proper HTTP status codes.
- Seed data must match the real HavaJava menu exactly.
