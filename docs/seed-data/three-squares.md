# Three Squares / B&G Pacific — Seed Data

**Compiled:** February 9, 2026
**Sources:** bgpacific.com, research doc, TripAdvisor, Yelp, Facebook

---

## Restaurant Info

### Main Location (Chalan San Antonio)
| Field | Value |
|-------|-------|
| Name | Three Squares Restaurant |
| Slug | `threesquares` |
| Address | 416 Chalan San Antonio, Tamuning, GU 96913 |
| Phone | (671) 646-2652 |
| WhatsApp | (671) 864-6656 |
| Email | sales@bgpacific.com |
| Website | bgpacific.com |

**Hours:**
- Monday: Closed
- Tuesday-Saturday: 8:00 AM - 8:00 PM (last order 7:30 PM)
- Sunday: 8:00 AM - 5:00 PM (last order 4:30 PM)

### Donki Location (Inside Don Quijote)
| Field | Value |
|-------|-------|
| Name | Three Squares at Donki |
| Address | Inside Don Quijote, Tamuning |
| Phone | TBD |

**Hours:**
- Monday-Sunday: 10:00 AM - 10:00 PM

---

## Branding

| Element | Value |
|---------|-------|
| Primary Color | #1B4332 (Forest green) |
| Secondary Color | #FFD700 (Gold) |
| Accent Color | #2D6A4F (Teal green) |
| Tagline | "Good Food, Good Mood, Good Service" |
| Font | TBD - suggest Montserrat or similar |

---

## Features Enabled

```json
{
  "catering": true,
  "multi_location": true,
  "merchandise": true,
  "pos": true,
  "rewards": false
}
```

---

## Menu Categories

### 1. Breakfast (8am-11am)

| Item | Price | Description |
|------|-------|-------------|
| French Toast, Bacon & Eggs | $12.95 | Classic breakfast combo |
| Stack O' Cakes | $8.95 | Pancake stack |
| French Toast Only | $9.95 | |
| Waffles | $9.95 | |
| Chicken & Waffles | $14.95 | Signature item |
| Loco Moco | $13.95 | Rice, hamburger patty, egg, gravy |
| Corned Beef Hash | $12.95 | With eggs |
| Breakfast Mini Bento | $9.95 | Grab-n-go option |

**Modifiers for breakfast:**
- Egg Style: Scrambled / Over Easy / Over Medium / Over Hard / Sunny Side Up
- Add Bacon: +$3.00
- Add Sausage: +$3.00
- Pancakes or Toast: Choose one

---

### 2. Starters

| Item | Price | Description |
|------|-------|-------------|
| The Local Sampler | $21.95 | Tinala katne, chicken kelaguen, lumpia, titiyas |
| Tinala Katne Appetizer | $14.50 | Cured beef |
| Tinala Katne Fries | $8.95 | Loaded fries with tinala katne |
| Smoked Pork Appetizer | $12.95 | |
| Three Squares Nachos | $10.95 | |
| Chicken Kelaguen | $9.95 | Traditional Chamorro dish |
| Fried Lumpia | $4.95 | Filipino spring rolls |
| Soup of the Day | $5.95 | Ask server |

---

### 3. Main Dishes

| Item | Price | Description |
|------|-------|-------------|
| Famous Fried Chicken | $15.95 | Signature item - highly praised |
| Pot Roast | $16.95 | Slow-cooked with vegetables |
| Meatloaf | $14.95 | Homestyle with gravy |
| BBQ Kalbi Shortribs | $18.95 | Korean-style marinated ribs |
| Teriyaki Chicken | $14.95 | |
| Tinaktak (Beef) | $15.95 | Coconut milk beef stew |
| Tinaktak (Veggie) | $13.95 | Vegetarian version |
| Estufao | $15.95 | Chamorro braised pork |
| Grilled Salmon | $17.95 | |
| Teriyaki Salmon | $17.95 | |
| Salmon Tinaktak | $18.95 | Salmon in coconut milk |
| Philly Cheese Steak | $14.95 | Sandwich |
| Bleu Cheese Burger | $13.95 | |
| Cheeseburger | $11.95 | |

**Modifiers for mains:**
- Side Choice: Rice / Mashed Potatoes / Fries / Side Salad
- Protein Temp (for salmon): Medium / Medium-Well / Well Done

---

### 4. Desserts

| Item | Price | Description |
|------|-------|-------------|
| Bread Pudding Ala Mode | $7.95 | With ice cream |
| Fried Banana with Ice Cream | $6.95 | |
| Coconut Banana Cake | $6.95 | Highly praised |
| Latiya Cake | $7.95 | Traditional Chamorro dessert (may require advance order) |

---

### 5. Beverages

| Item | Price | Description |
|------|-------|-------------|
| Soft Drinks | $2.95 | Coke, Sprite, etc. |
| Iced Tea | $2.95 | |
| Calamansi Tea | $3.50 | Local citrus tea (complimentary with meal per reviews) |
| Coffee | $2.95 | |
| Fresh Juice | $4.95 | |

---

## Catering Menu

### Party Platters

| Item | Small (10-15) | Large (20-30) |
|------|---------------|---------------|
| BBQ Kalbi Shortribs | $75.00 | $140.00 |
| Chicken Kelaguen | $45.00 | $85.00 |
| Three Squares Fried Chicken | $55.00 | $100.00 |
| Tinala Katne | $50.00 | $95.00 |
| Whole Fried Parrot Fish | $65.00 | $120.00 |
| Seafood Kaddo (soup) | $40.00 | $75.00 |
| Banana Donuts | $35.00 | $65.00 |

### Bulk Bentos

| Item | Price Each | Min Order |
|------|------------|-----------|
| Standard Bento | $12.95 | 10 |
| Mini Bento | $8.95 | 15 |
| Breakfast Mini Bento | $9.95 | 10 |
| Tinala Katne Mini Bento | $10.95 | 10 |

### Cocktail Buffet Items

| Item | Price |
|------|-------|
| Kelaguen Poppers | $45.00/tray |
| Charcuterie Board | $65.00 |
| Mini Salad Cups | $35.00/dozen |
| Canapes (assorted) | $55.00/tray |

### Special Items (2-3 days notice)

| Item | Price |
|------|-------|
| Roast Pig Carving | Market price |
| Shish Kabobs | $4.50 each (min 20) |
| Sushi Platter | $75.00 |
| Latiya Cake (full) | $45.00 |

---

## Catering Inquiry Form Fields

For the catering inquiry system:

```
- customer_name (required)
- email (required)
- phone (required)
- company_name (optional)
- event_date (required)
- event_time (required)
- event_type: dropdown
  - Corporate Meeting
  - Wedding
  - Birthday Party
  - Fiesta/Family Gathering
  - Government/Official Event
  - Other
- guest_count (required, number)
- budget_range: dropdown
  - Under $500
  - $500 - $1,000
  - $1,000 - $2,500
  - $2,500 - $5,000
  - $5,000+
- service_type: multi-select
  - Party Platters
  - Bulk Bentos
  - Full Buffet Service
  - Cocktail Reception
  - Private Room at Restaurant
- location: dropdown
  - Delivery
  - Pickup from Chalan San Antonio
  - On-site at Three Squares (private room)
- special_requests (text area)
- dietary_restrictions (text area)
```

---

## Notes

1. **Complimentary items:** Reviews mention complimentary starter salads and calamansi tea — may want to note this in the UI

2. **Signature items:** Famous Fried Chicken, Chicken & Waffles, Coconut Banana Cake are most mentioned in reviews

3. **Peak times:** Can get very busy — consider order-ahead for pickup

4. **HUBZone certified:** May have government clients with specific requirements

5. **Two locations:** Main location has full menu; Donki location may have limited menu (need to confirm)
