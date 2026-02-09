# Latte Stone Cookies — Seed Data

**Compiled:** February 9, 2026
**Sources:** lattestonecookies.com (Shopify), Instagram, JP Superstore listing

---

## Business Info

| Field | Value |
|-------|-------|
| Name | Latte Stone Cookies |
| Parent Company | Everything Guam, LLC / B&G Pacific |
| Email | sales@lattestonecookies.com |
| Instagram | @lattestonecookies |
| Website | latte-stone-cookies.myshopify.com |

**Tagline:** "Sharing Guam with the world, one cookie at a time."

---

## Product Overview

Artisan shortbread cookies shaped like Guam's iconic latte stones. Handcrafted on Guam in small batches. Popular as:
- Souvenirs/gifts
- Wedding favors
- Corporate gifts
- Thank you gifts
- Birthday presents

---

## Product Catalog

### Cookie Flavors

| Flavor | Status | Notes |
|--------|--------|-------|
| Vanilla (Classic) | Available | Original flavor since 2014 |
| Chocolate | Available | Original flavor since 2014 |
| Coconut | Available | Island flavor |
| Mango | Available | Tropical flavor |
| Ube | TBD | Purple yam - popular Filipino flavor |
| Calamansi | TBD | Local citrus |

### Package Sizes

| Package | Cookie Count | Price (est.) |
|---------|--------------|--------------|
| Single Box | 6 cookies | $12.00 |
| Double Box | 12 cookies | $22.00 |
| Gift Box | 18 cookies | $30.00 |
| Party Pack | 24 cookies | $38.00 |
| Bulk (corporate) | 50+ | Custom pricing |

### Gift Sets

| Set | Contents | Price (est.) |
|-----|----------|--------------|
| Sampler Box | 2 each of 3 flavors | $15.00 |
| Island Collection | All available flavors | $28.00 |
| Wedding Favor Box | 2 cookies, custom ribbon | $5.00 each |

---

## Merchandise Model Structure

Since this is separate from the restaurant menu, we'll use the merchandise system:

```ruby
# MerchandiseCategory
- name: "Cookies"
  position: 1
- name: "Gift Sets"
  position: 2
- name: "Bulk/Corporate"
  position: 3

# MerchandiseItem (example)
- name: "Vanilla Shortbread Cookies"
  category: "Cookies"
  description: "Classic vanilla shortbread in latte stone shape. 6 cookies per box."
  base_price: 12.00
  image_url: "..."

# MerchandiseVariant
- item: "Vanilla Shortbread Cookies"
  variants:
    - name: "6-pack"
      price_adjustment: 0
      stock_quantity: 50
    - name: "12-pack"
      price_adjustment: 10.00
      stock_quantity: 30
    - name: "24-pack"
      price_adjustment: 26.00
      stock_quantity: 20
```

---

## Implementation Notes

### Option A Confirmed: Separate Store Section

Based on research:
1. Latte Stone Cookies has its own Shopify store (separate from B&G Pacific)
2. Different branding/marketing focus (gifts, souvenirs vs restaurant food)
3. Different fulfillment (can ship, unlike hot food)
4. Different customer journey (browsing gifts vs ordering lunch)

**Recommendation:** 
- Separate "Cookies" or "Gift Shop" navigation item
- Dedicated CookieStorePage component
- Uses MerchandiseItem/MerchandiseVariant models
- Can share cart with restaurant items OR separate cart

### Shipping Consideration

Unlike restaurant orders (pickup only), cookies can be shipped. Options:
1. **Phase 1:** Local pickup only (at Three Squares or Donki)
2. **Phase 2:** Add shipping integration (calculate rates, USPS/FedEx)

For POC, recommend Phase 1 (pickup only) to keep scope manageable.

### Corporate/Bulk Orders

They mention "corporate gift orders, bulk quantities, special arrangements" — similar to catering, could be:
1. Simple inquiry form (like catering)
2. Or just a note to email sales@lattestonecookies.com

For POC, recommend simple inquiry form or email link.

---

## Branding (Separate from Three Squares?)

Latte Stone Cookies may have different branding:
- Their own logo (latte stone shape)
- Different color palette?
- Gift-focused imagery

**Question for Leon:** Should the cookie store section have its own look, or match Three Squares branding?

---

## UI Flow

```
Three Squares Homepage
├── Menu (restaurant ordering)
├── Catering (inquiry form)
└── Cookie Shop (merchandise store)
    ├── Browse by category
    ├── Product detail with variants
    ├── Add to cart
    ├── Checkout (pickup location)
    └── Order confirmation
```

---

## Data Needed from Client

Before we can fully seed:
1. Complete flavor list with availability
2. Exact pricing per package size
3. Product images
4. Any seasonal/limited items
5. Whether they want shipping or pickup-only
6. Corporate order minimums

For POC, we can use placeholder data and refine after meeting with them.
