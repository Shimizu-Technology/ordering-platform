# Build Plan — Ordering Platform

## Current Status

**Last Updated:** February 3, 2026

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: MVP | ✅ Complete | Menu, Cart, Orders, Stripe stub |
| Phase 2: Admin | ⬜ Not Started | Order queue, menu CRUD |
| Phase 3: Polish | ⬜ Not Started | Notifications, analytics |

---

## Phase 1: MVP (ORD-1 through ORD-8)

### ORD-1: Project Scaffolding
- [x] Rails 7 API-only app (ordering-platform-api/)
- [x] React app with Vite + TypeScript + Tailwind + Framer Motion (ordering-platform-web/)
- [x] Monorepo structure in one GitHub repo
- [x] AGENTS.md, PRD.md, BUILD_PLAN.md
- [x] .cursor/rules/ files (project.mdc, backend.mdc, frontend.mdc)

### ORD-2: Multi-tenant Restaurant Model
- [x] Restaurant model with all fields
- [x] HavaJava seed with real data (name, address, hours, branding)
- [x] Slug-based lookup
- [x] Branding token system (CSS custom properties)

### ORD-3: Menu System Data Models
- [x] MenuCategory model with position, active
- [x] MenuItem model with base_price, available
- [x] ModifierGroup model with required, min/max_select
- [x] Modifier model with price_adjustment, default_selected
- [x] Proper associations, validations, scopes

### ORD-4: HavaJava Menu Seeding
- [x] Espresso Drinks (9 items, size + temperature modifiers)
- [x] Ice-Blended Drinks (9 items, size + fruit/flavor modifiers)
- [x] Iced Tea Coolers (5 items, size modifiers)
- [x] Hot Beverages (5 items, size modifiers)
- [x] Grab and Go (bagel w/ flavor+topping modifiers, 2 wraps)
- [x] Breakfast Sandwiches (1 item w/ meat choice)
- [x] Custom Sandwiches (1 item, 8 modifier groups: meat, cheese, veggies, dressing, bread, toasted, drink, eat in/to go)
- [x] Pastries (9 items)
- [x] Retail (2 items, gift certificate w/ amount modifier)
- [x] Total: 44 items, 51 modifier groups, 135 modifiers

### ORD-5: Menu API Endpoints
- [x] GET /api/v1/restaurants/:slug — Restaurant info + branding
- [x] GET /api/v1/restaurants/:slug/menu — Full menu with nested includes
- [x] Proper JSON serialization
- [x] CORS configuration

### ORD-6: Cart + Order Models
- [x] Order model with status workflow
- [x] OrderItem with quantity, unit_price, subtotal
- [x] OrderItemModifier with captured price_adjustment
- [x] Total calculation logic

### ORD-7: Order API Endpoints
- [x] POST /api/v1/restaurants/:slug/orders — Create with items + modifiers
- [x] GET /api/v1/restaurants/:slug/orders/:id — Order status
- [x] Proper validation and error handling

### ORD-8: Stripe Payment Integration
- [x] POST /api/v1/restaurants/:slug/orders/:id/pay — Create PaymentIntent
- [x] Stripe gem configured (functional when key provided)
- [ ] Webhook handler for payment confirmation (Phase 2)

### Frontend (Bonus — completed in Phase 1)
- [x] Menu browsing with category navigation
- [x] Item detail sheet with modifier selection (radio/checkbox)
- [x] Cart with quantity management
- [x] Checkout form with guest info
- [x] Order confirmation page
- [x] Framer Motion animations throughout
- [x] Dynamic brand token system
- [x] Zustand cart store

---

## Phase 2: Admin Dashboard (ORD-12 through ORD-14)

### ORD-12: Order Queue
- [ ] Real-time order list for staff
- [ ] Status update (pending → confirmed → preparing → ready → completed)
- [ ] Sound notification for new orders

### ORD-13: Menu Management
- [ ] CRUD for categories, items, modifier groups, modifiers
- [ ] Drag-and-drop reordering
- [ ] Image upload to S3

### ORD-14: Restaurant Settings
- [ ] Business info, hours, branding editor
- [ ] Stripe Connect onboarding

---

## Phase 3: Polish (ORD-15 through ORD-20)

- [ ] Email notifications (order confirmation, status updates)
- [ ] SMS notifications via ClickSend
- [ ] Stripe Connect (per-restaurant accounts)
- [ ] Analytics dashboard
- [ ] Customer accounts (repeat orders)
- [ ] Promo/discount system
- [ ] Multi-tenant onboarding wizard

---

## Timeline

| Phase | Duration |
|-------|----------|
| Phase 1 | Week 1 (Complete) |
| Phase 2 | Week 2-3 |
| Phase 3 | Week 4+ |
