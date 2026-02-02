# Build Plan — Ordering Platform

## Current Status

**Last Updated:** February 3, 2026

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: MVP | ✅ Complete | Menu, Cart, Orders, Stripe stub |
| Phase 2: Admin | ✅ Complete | Order queue, menu CRUD, restaurant settings |
| Phase 3: Polish | 🟡 In Progress | Notifications + Stripe Connect done |

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
- [x] Real-time order list for staff (polling every 8s)
- [x] Status update (pending → preparing → ready → completed, with cancel)
- [x] Sound notification for new orders (Web Audio API chime)
- [x] Visual pulse animation for new orders
- [x] Filter by status, search by customer name
- [x] Expand/collapse order details
- [x] Admin auth (X-Admin-Token header)
- [x] API: GET /api/v1/admin/orders, PATCH /api/v1/admin/orders/:id

### ORD-13: Menu Management
- [x] CRUD for categories, items, modifier groups, modifiers
- [x] Reorder categories and items (up/down with position persistence)
- [x] Toggle category active/hidden and item availability
- [x] Inline editing for names, prices, image URLs
- [x] Modifier group settings (required, min/max select)
- [x] Full CRUD API under /api/v1/admin/ namespace
- [ ] Image upload to S3 (future — currently URL input)

### ORD-14: Restaurant Settings
- [x] Business hours editor (7 days, open/close, closed toggle)
- [x] Contact info (name, phone, email, address, description)
- [x] Branding: color pickers + hex, font family, logo URL
- [x] Live branding preview (header + buttons)
- [x] API: GET/PATCH /api/v1/admin/restaurant
- [ ] Stripe Connect onboarding (future)

---

## Phase 3: Polish (ORD-15 through ORD-20)

### ORD-15: Order Notifications ✅
- [x] Email confirmation via Action Mailer (SMTP config via env vars)
- [x] Mobile-friendly HTML email with order details, modifiers, total
- [x] Webhook URL per restaurant (POST JSON on new orders)
- [x] Twilio SMS integration for "order ready" notifications
- [x] POST /api/v1/admin/orders/:id/notify_ready endpoint
- [x] "Notify Customer" button in admin order queue (with tooltip when SMS not configured)
- [x] Notification settings in Restaurant Settings (toggle, webhook, SMTP/SMS status)
- [x] notifications_enabled + webhook_url columns on restaurants

### ORD-16: Stripe Connect ✅
- [x] stripe_onboarding_complete column on restaurants
- [x] POST /api/v1/admin/stripe/connect — creates Connect account, returns onboarding URL
- [x] GET /api/v1/admin/stripe/status — check onboarding completion
- [x] Updated pay endpoint to use Connect (application_fee_amount + transfer_data)
- [x] Configurable platform fee via STRIPE_PLATFORM_FEE_PERCENT env var
- [x] "Connect Stripe" section in Restaurant Settings with full onboarding flow
- [x] Graceful "not configured" states when Stripe keys missing

### Remaining
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
