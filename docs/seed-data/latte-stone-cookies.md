# Latte Stone Cookies — Seed Data

**Compiled:** February 9, 2026
**Sources:** latte-stone-cookies.myshopify.com (actual Shopify store)

---

## Business Info

| Field | Value |
|-------|-------|
| Name | Latte Stone Cookies |
| Parent Company | Everything Guam, LLC / B&G Pacific |
| Email | sales@lattestonecookies.com |
| Instagram | @lattestonecookies (145 followers, 18 posts) |
| Shopify Store | latte-stone-cookies.myshopify.com |

**Tagline:** "Sharing Guam with the world, one cookie at a time."

**Order Methods:** DM, Email, or Website

---

## Confirmed Flavors (from Shopify)

| Flavor | Dipped Version |
|--------|----------------|
| Vanilla Shortbread | Vanilla dipped in Milk Chocolate |
| Chocolate Shortbread | Chocolate dipped in White Chocolate |
| Coconut Shortbread | Coconut dipped in Milk Chocolate |
| Mango Shortbread | Mango dipped in White Chocolate |
| Pineapple Shortbread | Pineapple dipped in Milk Chocolate |
| Passionfruit Shortbread | Passionfruit dipped in White Chocolate |

---

## Product Collections (from Shopify)

| Collection | Description |
|------------|-------------|
| Tropical Collection | Island-inspired flavors |
| Tin Collection | Cookies in decorative tins |
| Snack Bag Collection | Smaller bags for snacking |
| Fruit Collection | Fruit-flavored cookies |
| Artist Edition | Special artistic packaging/designs |
| Slingstone Cookies | Different shape - Chamorro slingstone |
| Keepsakes & Gifts | Puzzles, gifts, souvenirs |

---

## Actual Products (from Shopify store)

| Product | Quantity | Price | Notes |
|---------|----------|-------|-------|
| 2pc Box | 2 cookies | ~$4-5 | 1 vanilla, 1 chocolate |
| 6pc Chocolate Dipped Assortment | 6 cookies | **$11.00** | All dipped varieties |
| 8pc Fruit Assortment | 8 cookies | ~$14-15 | Fruit flavors |
| 9pc Classic Assortment (Tin) | 9 cookies | ~$18-20 | Latte stone shape tin |
| 10pc Coconut | 10 cookies | ~$16-18 | Single flavor |
| 10pc Mango Fruit | 10 cookies | ~$16-18 | Single flavor |
| 12pc Grand Assortment | 12 cookies | ~$20-22 | All flavors + dipped |
| 20pc Classic Assortment (Tin) | 20 cookies | ~$32-35 | Latte stone shape tin |
| 30pc Grand Assortment | 30 cookies | ~$45-50 | All flavors + dipped |
| 3pc Tin Chocolate Dipped | 3 cookies | ~$8-10 | Small gift tin |
| Classic Mini | Various | ~$6-8 | Mini-sized cookies |
| Holiday Box (10pc) | 10 cookies | ~$18-20 | Seasonal |

*Prices marked with ~ are estimates based on per-cookie pricing from the $11/6pc confirmed price (~$1.83/cookie)*

---

## Shipping vs Pickup

**Current online store behavior:**
- Shopify store implies shipping ("Share with loved ones around the world!")
- Full e-commerce checkout flow
- Likely ships to US mainland and internationally

**For POC:**
- Start with **local pickup only** at Three Squares locations
- Add shipping later (similar to Hafaloha EasyPost integration)

---

## Branding Analysis

**Observed from Shopify store:**
- Clean, modern design
- Focus on Guam/Pacific island imagery
- Latte stone iconography
- Gift-focused messaging

**Color scheme (from site):**
- Likely earth tones / tropical colors
- Different from Three Squares restaurant branding

**Recommendation:** Keep separate branding in the Cookie Store section, but within the Three Squares app. Similar to how a restaurant might have a gift shop with different vibes.

---

## Merchandise Model Mapping

```ruby
# MerchandiseCategories
- name: "Assortment Boxes"
  description: "Mixed flavor collections"
  position: 1
  
- name: "Single Flavors"
  description: "Boxes of one flavor"
  position: 2
  
- name: "Tin Collection"
  description: "Cookies in keepsake tins"
  position: 3
  
- name: "Gift Sets"
  description: "Special occasion packaging"
  position: 4

# Example MerchandiseItem
- category: "Assortment Boxes"
  name: "6pc Chocolate Dipped Assortment"
  description: "6 individually wrapped shortbread cookies dipped in chocolate. Includes vanilla, chocolate, coconut, mango, pineapple, and passionfruit."
  base_price: 11.00
  image_url: "[product image]"
  available: true
  
# MerchandiseVariants (for items with size options)
- item: "Classic Assortment Tin"
  variants:
    - name: "9pc"
      price: 18.00
    - name: "20pc"
      price: 35.00
```

---

## Questions for Client Confirmation

- [ ] Exact pricing for all products (we have $11 for 6pc, need others)
- [ ] Stock levels / availability for each product
- [ ] Seasonal items schedule (Holiday Box, etc.)
- [ ] Shipping: Do they want shipping in the app or keep it Shopify-only?
- [ ] Corporate/bulk order minimum quantities and pricing
- [ ] Product images (can we use their existing ones?)
- [ ] "Slingstone Cookies" - different product line, include or separate?
- [ ] "Keepsakes & Gifts" (puzzles, souvenirs) - include or out of scope?

---

## Implementation Notes

1. **Separate section confirmed** — They have an entirely separate Shopify store with its own branding
2. **Rich product line** — More complex than initially thought (6 flavors, dipped versions, tins, gift sets)
3. **Shipping exists** — They already ship, so we could integrate later
4. **For POC** — Seed top 5-6 products, keep it simple, expand later
