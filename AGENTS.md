# AGENTS.md — Ordering Platform

Context file for AI assistants (Claude, Cursor, Copilot, etc.) working on this project.

---

## Project Overview

**Ordering Platform** is a multi-tenant restaurant ordering SaaS built as a monorepo. Each restaurant gets a customized frontend while sharing a common Rails API and React component library.

### Key Documents

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Monorepo structure, multi-tenancy, deployment |
| [PRD.md](./PRD.md) | Product requirements, features, data models |
| [BUILD_PLAN.md](./BUILD_PLAN.md) | Development phases, timeline, tasks |
| [docs/starter-app/](./docs/starter-app/) | Shimizu Technology standards & guides |

**Read these before making significant changes.**

---

## Repository Structure

```
ordering-platform/
├── api/                    # Rails 7 multi-tenant backend
├── packages/
│   └── shared/             # @shimizu/shared - React component library
├── frontends/
│   ├── _template/          # Starter for new clients
│   ├── havajava/           # HavaJava Café frontend
│   └── threesquares/       # Three Squares frontend
└── docs/
    └── starter-app/        # Development standards
```

---

## Current Tenants

| Tenant | Slug | Features |
|--------|------|----------|
| HavaJava Café | `havajava` | Core ordering, promotions, POS |
| Three Squares | `threesquares` | + Multi-location, catering, merchandise |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Rails 7 API, Ruby 3.3+, PostgreSQL |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4 |
| Payments | Stripe + Stripe Connect |
| Auth | Clerk (admin), Guest checkout (customers) |
| State | Zustand |
| Animation | Framer Motion |
| Icons | Lucide React |
| Package Manager | pnpm |

---

## Design Rules

### NO Emojis in UI
Use SVG icons only (Lucide React). Emojis render inconsistently across devices.

### Mobile-First
Design for phone screens first. Desktop is secondary.

### Component Library
Reusable components go in `packages/shared`. Frontend-specific components stay in their frontend.

### Feature Flags
Features are toggled per tenant via `config.ts`. Don't assume all tenants have all features.

---

## Development Workflow

### Local Setup
```bash
pnpm install              # Install all dependencies
cd api && rails server    # Start API on :3000
cd frontends/havajava && pnpm dev  # Start frontend on :5173
```

### Adding a Component to Shared
1. Create in `packages/shared/src/components/`
2. Export from `packages/shared/src/index.ts`
3. Import in frontends as `import { Component } from '@shimizu/shared'`

### Adding a New Frontend
1. Copy `frontends/_template` to `frontends/newclient`
2. Update `config.ts` with restaurant slug and features
3. Update `theme.css` with branding
4. Add custom pages as needed
5. Seed restaurant data in API

---

## API Patterns

### All endpoints are scoped by restaurant slug:
```
GET  /api/v1/restaurants/:slug/menu
POST /api/v1/restaurants/:slug/orders
GET  /api/v1/admin/orders (uses auth context)
```

### Restaurant lookup:
```ruby
@restaurant = Restaurant.find_by!(slug: params[:restaurant_slug])
```

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `MenuGrid.tsx` |
| Hooks | camelCase, `use` prefix | `useCart.ts` |
| Stores | camelCase, `Store` suffix | `cartStore.ts` |
| API services | camelCase, `Service` suffix | `orderService.ts` |
| CSS files | kebab-case | `menu-grid.css` |
| Rails models | singular | `menu_item.rb` |
| Rails controllers | plural | `orders_controller.rb` |

---

## Common Tasks

### Create a new menu item
1. API: POST `/api/v1/admin/menu_items`
2. Include `menu_category_id`, `name`, `base_price`

### Add a modifier group to an item
1. API: POST `/api/v1/admin/modifier_groups`
2. Include `menu_item_id`, `name`, `required`, `min_select`, `max_select`

### Deploy a frontend
1. Merge PR to main
2. GitHub Actions builds and deploys to Netlify
3. Each frontend has its own Netlify site

---

## Testing

### API
```bash
cd api && bundle exec rspec
```

### Frontend
```bash
cd frontends/havajava && pnpm test
```

---

## Troubleshooting

### "Restaurant not found"
- Check the slug in `config.ts` matches the database
- Ensure restaurant is seeded: `rails db:seed`

### Shared components not updating
- pnpm workspaces should auto-link, but try: `pnpm install`
- Check `@shimizu/shared` is in frontend's `package.json`

### CORS errors
- API must include frontend's origin in `allowed_origins`
- Check `config/initializers/cors.rb`

---

## Related Projects

- **Hafaloha Monorepo** (`~/work/hafaloha/`) — Single-tenant e-commerce for Hafaloha
- **Shimizu Order Suite** (`~/shimizu-technology/Order-Suite/`) — Legacy multi-tenant POS system

---

*Last updated: February 9, 2026*
