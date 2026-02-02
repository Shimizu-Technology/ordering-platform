# Product Requirements Document — Ordering Platform

**Version:** 1.0
**Date:** February 2026

---

## Executive Summary

A multi-tenant online ordering platform for restaurants. HavaJava 671 Café in Hagåtña, Guam is the first tenant. The platform enables customers to browse menus, customize items with modifier groups, and place orders with optional Stripe payment processing.

## Guiding Principles

### 1. Mobile-First
Every feature must work beautifully on a phone. Desktop is a bonus, not the target.

### 2. Easy for Restaurants to Use
New restaurants should be onboardable in 48 hours or less.

### 3. Flexible Modifier System
The modifier group model must handle ANY customization — from drink sizes to full sandwich builders.

### 4. Multi-Tenant by Default
Never build single-tenant features. Everything is scoped to a restaurant.

---

## Business Information

| Field | Value |
|-------|-------|
| **Company** | Shimizu Technology |
| **First Tenant** | HavaJava 671 Café |
| **Address** | 148 Aspinall Ave Suite 102, Hagåtña, Guam 96910 |
| **Phone** | 671-477-0600 |

### Pricing Model

| Tier | Monthly | Includes |
|------|---------|----------|
| Starter | $99/mo | Online ordering, menu management, basic dashboard |
| Pro | $149/mo | + SMS notifications, analytics, priority support |
| Custom | $199+/mo | + Custom domain, advanced features, API access |

---

## Technical Architecture

| Layer | Technology |
|-------|------------|
| Backend | Rails 7 API-only, Ruby 3.3+, PostgreSQL |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4, Framer Motion |
| Payments | Stripe |
| Auth | Clerk (admin), Guest checkout (customers) |
| State | Zustand |
| Icons | Lucide React |

---

## User Roles

| Role | Description |
|------|-------------|
| Customer | Browse menu, place orders (guest checkout) |
| Staff | View order queue, update order status (Phase 2) |
| Admin | Manage menu, settings, view analytics (Phase 2) |

---

## Data Model

### Restaurant (Tenant)
name, slug, logo_url, phone, address, description, hours (JSON), stripe_account_id, primary_color, secondary_color, accent_color, font_family, active, subdomain

### Menu System
- **MenuCategory:** name, position, active, restaurant_id
- **MenuItem:** name, description, base_price, image_url, available, position, menu_category_id
- **ModifierGroup:** name, required, min_select, max_select, position, menu_item_id
- **Modifier:** name, price_adjustment, default_selected, position, modifier_group_id

### Orders
- **Order:** customer_name, phone, email, order_type, status, total, stripe_payment_intent_id, special_instructions, restaurant_id
- **OrderItem:** order_id, menu_item_id, quantity, unit_price, subtotal, special_instructions
- **OrderItemModifier:** order_item_id, modifier_id, price_adjustment

---

## Modifier Group System

| Use Case | Config | Example |
|----------|--------|---------|
| Drink size | required, pick 1 | Tall ($0) / Grande (+$0.55) |
| Hot/Cold | required, pick 1 | Hot / Iced |
| Sandwich meat | required, pick 1 | Pastrami / Turkey / Ham |
| Cheese | optional, pick 0-1 | American / Swiss (+$0.60) |
| Veggies | optional, pick any | Lettuce / Tomato / Red Onion |
| Smoothie fruits | required, pick 2 | Strawberry / Banana / Mango |
| Bagel toppings | optional, pick any | Butter / Jam / Cream Cheese (+$0.85) |

---

## Phase Roadmap

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | MVP — Menu + Cart + Orders | In Progress |
| 2 | Admin Dashboard | Planned |
| 3 | Polish + Notifications | Planned |
