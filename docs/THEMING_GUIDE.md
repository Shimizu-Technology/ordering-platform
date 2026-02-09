# Theming Guide — Ordering Platform

**Version:** 1.0
**Last Updated:** February 9, 2026
**Purpose:** Document each tenant's brand identity and how to implement it

---

## Overview

Each tenant in the Ordering Platform gets their own frontend with custom branding. This guide documents:
1. Each client's brand identity (colors, fonts, feel)
2. How the theming system works
3. Implementation checklist for new tenants

**Reference:** Follow [FRONTEND_DESIGN_GUIDE.md](./starter-app/FRONTEND_DESIGN_GUIDE.md) for all design decisions.

---

## How Theming Works

### 1. CSS Custom Properties (Runtime)

The API returns branding settings per restaurant. The frontend applies them as CSS custom properties:

```typescript
// frontends/[tenant]/src/utils/branding.ts
export function applyBranding(branding: Branding): void {
  const root = document.documentElement;
  root.style.setProperty('--brand-primary', branding.primary_color);
  root.style.setProperty('--brand-secondary', branding.secondary_color);
  root.style.setProperty('--brand-accent', branding.accent_color);
  root.style.setProperty('--brand-font', `'${branding.font_family}', sans-serif`);
}
```

### 2. Base Theme File (Build Time)

Each frontend has its own CSS that sets defaults and extends the brand tokens:

```
frontends/
├── havajava/
│   └── src/
│       └── styles/
│           └── theme.css      # HavaJava defaults
├── threesquares/
│   └── src/
│       └── styles/
│           ├── theme.css      # Three Squares defaults
│           └── cookies.css    # Latte Stone Cookies sub-theme
```

### 3. Restaurant Branding (Database)

Stored in the `restaurants` table:

```ruby
# api/app/models/restaurant.rb
# branding JSON column:
{
  "primary_color": "#1B4332",
  "secondary_color": "#FFD700", 
  "accent_color": "#2D6A4F",
  "font_family": "DM Sans",
  "logo_url": "https://...",
  "favicon_url": "https://..."
}
```

---

## Tenant Branding

---

### HavaJava Café

**Identity:** Guam's oldest specialty coffee shop (est. 1995). Warm, welcoming, local institution. Gourmet coffee in a comfortable setting.

**Tagline:** "Guam's longest-brewing coffee shop"

#### Brand Elements

| Element | Value | Notes |
|---------|-------|-------|
| **Primary Color** | `#5C4033` | Warm coffee brown |
| **Secondary Color** | `#FFF8DC` | Cream/cornsilk |
| **Accent Color** | `#D2691E` | Cinnamon/chocolate |
| **Font** | `DM Sans` | Clean, friendly, approachable |
| **Logo** | TBD | Need from client |

#### Visual Feel

- **Warm & Inviting** — Coffee shop cozy vibes
- **Local Heritage** — 30+ years serving Guam
- **Simple & Clean** — Menu-focused, not overwhelming
- **Photography** — Coffee drinks, fresh pastries, deli sandwiches

#### Color Palette (CSS)

```css
/* frontends/havajava/src/styles/theme.css */
:root {
  /* Brand Colors */
  --brand-primary: #5C4033;     /* Coffee brown */
  --brand-secondary: #FFF8DC;   /* Cream */
  --brand-accent: #D2691E;      /* Cinnamon */
  
  /* Derived Colors */
  --brand-primary-light: #8B7355;
  --brand-primary-dark: #3D2817;
  --brand-secondary-light: #FFFEF5;
  --brand-accent-light: #E89B5E;
  
  /* Semantic Colors */
  --surface-primary: #FDFBF7;   /* Warm white */
  --surface-secondary: #F5EDE0; /* Warm gray */
  --text-primary: #2D2017;      /* Dark brown */
  --text-secondary: #6B5A4D;    /* Muted brown */
  
  /* Typography */
  --font-heading: 'DM Sans', sans-serif;
  --font-body: 'DM Sans', sans-serif;
}
```

#### Social Media / References

- **Facebook:** facebook.com/havajavacafe
- **Instagram:** @havajavacafeguam
- **Yelp:** yelp.com/biz/hava-java-cafe-hagåtña
- **Location:** 148 Aspinall Ave, Suite 102, Hagåtña, GU 96910
- **Hours:** Mon-Sat 6:30am-6pm, Sun 7:30am-5pm

#### UI Notes

- Simple, menu-focused interface
- No catering, no multi-location
- Emphasize coffee drinks and quick ordering
- Mobile-first (most orders from phones)

---

### Three Squares by B&G Pacific

**Identity:** Local-style comfort food with a modern twist. Family-friendly, reliable, quality food for everyday meals and special events.

**Tagline:** "Good Food, Good Mood, Good Service"

**Parent Company:** B&G Pacific LLC (woman-owned, HUBZone certified)

#### Brand Elements

| Element | Value | Notes |
|---------|-------|-------|
| **Primary Color** | `#1B4332` | Forest green |
| **Secondary Color** | `#FFD700` | Gold/yellow |
| **Accent Color** | `#2D6A4F` | Teal green |
| **Font** | `Montserrat` | Bold, confident, modern |
| **Logo** | TBD | Need from client |

#### Visual Feel

- **Bold & Confident** — Strong color contrast (green/gold)
- **Island Comfort** — Guam-style food, local ingredients
- **Family-Focused** — Platters, catering, gatherings
- **Professional** — Corporate catering, HUBZone certified
- **Photography** — Hearty food portions, family platters, catering setups

#### Color Palette (CSS)

```css
/* frontends/threesquares/src/styles/theme.css */
:root {
  /* Brand Colors */
  --brand-primary: #1B4332;     /* Forest green */
  --brand-secondary: #FFD700;   /* Gold */
  --brand-accent: #2D6A4F;      /* Teal green */
  
  /* Derived Colors */
  --brand-primary-light: #40916C;
  --brand-primary-dark: #0F2D1F;
  --brand-secondary-light: #FFE44D;
  --brand-accent-light: #52B788;
  
  /* Semantic Colors */
  --surface-primary: #FAFAFA;
  --surface-secondary: #F0F4F0; /* Slight green tint */
  --text-primary: #1A1A1A;
  --text-secondary: #4A4A4A;
  
  /* Typography */
  --font-heading: 'Montserrat', sans-serif;
  --font-body: 'DM Sans', sans-serif;
}
```

#### Social Media / References

- **Website:** bgpacific.com
- **Facebook:** facebook.com/threesquaresguam, facebook.com/bgpacific
- **Email:** sales@bgpacific.com
- **Phone:** (671) 646-2652
- **WhatsApp:** (671) 864-6656

#### Locations

1. **Main (Chalan San Antonio):** 416 Chalan San Antonio, Tamuning, GU 96913
   - Hours: Tue-Sat 8am-8pm, Sun 8am-5pm, Mon closed
   
2. **Donki Location:** Inside Don Quijote, Tamuning
   - Hours: Daily 10am-10pm

#### UI Notes

- Multi-location picker at start
- Prominent catering section
- Family platter focus
- Bento/grab-n-go section
- Menu organized by meal time (Breakfast, Lunch, Dinner)

---

### Latte Stone Cookies

**Identity:** Artisan shortbread cookies in the iconic Latte Stone shape. Proudly sharing Guam's culture with the world through premium baked goods.

**Tagline:** "Sharing Guam with the world, one cookie at a time."

**Note:** This is a sub-brand within the Three Squares app, with its own distinct visual identity.

#### Brand Elements

| Element | Value | Notes |
|---------|-------|-------|
| **Primary Color** | `#8B4513` | Saddle brown (cookie color) |
| **Secondary Color** | `#F5DEB3` | Wheat/tan |
| **Accent Color** | `#2E8B57` | Sea green (tropical) |
| **Font** | `Playfair Display` | Elegant, artisan, gift-worthy |
| **Logo** | Latte Stone silhouette | Iconic Chamorro symbol |

#### Visual Feel

- **Artisan & Premium** — Handcrafted, small-batch quality
- **Gift-Worthy** — Beautiful packaging, special occasions
- **Tropical Pacific** — Island imagery, Guam pride
- **Cultural Heritage** — Latte stone symbolism, Chamorro tradition
- **Photography** — Elegant cookie arrangements, gift boxes, tropical settings

#### Color Palette (CSS)

```css
/* frontends/threesquares/src/styles/cookies.css */
.cookie-store {
  /* Brand Colors */
  --brand-primary: #8B4513;     /* Cookie brown */
  --brand-secondary: #F5DEB3;   /* Wheat */
  --brand-accent: #2E8B57;      /* Sea green */
  
  /* Derived Colors */
  --brand-primary-light: #A0522D;
  --brand-primary-dark: #654321;
  --brand-secondary-light: #FFF8DC;
  --brand-accent-light: #66CDAA;
  
  /* Semantic Colors */
  --surface-primary: #FFFAF5;   /* Warm cream */
  --surface-secondary: #F5EBE0;
  --text-primary: #3D2914;
  --text-secondary: #6B5344;
  
  /* Typography - more elegant for gift products */
  --font-heading: 'Playfair Display', serif;
  --font-body: 'DM Sans', sans-serif;
}
```

#### Collections

| Collection | Description |
|------------|-------------|
| Tropical Collection | Island-inspired flavors (coconut, mango, pineapple, passionfruit) |
| Tin Collection | Cookies in keepsake decorative tins |
| Snack Bag Collection | Smaller bags for snacking |
| Fruit Collection | Fruit-flavored varieties |
| Artist Edition | Special artistic packaging/designs |
| Slingstone Cookies | Different shape (Chamorro slingstone) |
| Keepsakes & Gifts | Puzzles, souvenirs, gift items |

#### Flavors

| Flavor | Dipped Version |
|--------|----------------|
| Vanilla Shortbread | Vanilla dipped in Milk Chocolate |
| Chocolate Shortbread | Chocolate dipped in White Chocolate |
| Coconut Shortbread | Coconut dipped in Milk Chocolate |
| Mango Shortbread | Mango dipped in White Chocolate |
| Pineapple Shortbread | Pineapple dipped in Milk Chocolate |
| Passionfruit Shortbread | Passionfruit dipped in White Chocolate |

#### Social Media / References

- **Website:** latte-stone-cookies.myshopify.com, lattestonecookies.com
- **Instagram:** @lattestonecookies
- **Email:** sales@lattestonecookies.com

#### UI Notes

- Distinct section within Three Squares app
- Product-focused grid layout
- Emphasis on gifting (weddings, corporate, holidays)
- Beautiful product photography
- Collection-based navigation
- Pickup at Three Squares locations (shipping later)

---

## Implementation Checklist

### For Each New Tenant

- [ ] **Research**
  - [ ] Visit their website, social media, physical location
  - [ ] Document colors, fonts, photography style
  - [ ] Understand their brand voice and values
  - [ ] Get logo files (SVG preferred)

- [ ] **Design Tokens**
  - [ ] Define primary, secondary, accent colors
  - [ ] Choose font (from approved list in FRONTEND_DESIGN_GUIDE)
  - [ ] Create derived colors (light/dark variants)
  - [ ] Define semantic colors (surfaces, text, borders)

- [ ] **Theme File**
  - [ ] Create `frontends/[tenant]/src/styles/theme.css`
  - [ ] Set CSS custom properties
  - [ ] Import in main entry point

- [ ] **Database Seed**
  - [ ] Add branding JSON to restaurant record
  - [ ] Include logo_url, favicon_url

- [ ] **Assets**
  - [ ] Add logo to `public/` or use URL
  - [ ] Add favicon
  - [ ] Add any tenant-specific images

- [ ] **Verification**
  - [ ] Test on desktop and mobile
  - [ ] Check color contrast (WCAG AA)
  - [ ] Verify fonts load correctly
  - [ ] Compare to reference (client's existing site)

---

## Font Recommendations

**Approved fonts** (per FRONTEND_DESIGN_GUIDE):

| Font | Vibe | Best For |
|------|------|----------|
| DM Sans | Clean, friendly | General purpose, tech, casual |
| Montserrat | Bold, modern | Strong brands, headlines |
| Playfair Display | Elegant, refined | Luxury, gifts, artisan |
| Sora | Geometric, contemporary | Modern brands |
| General Sans | Versatile, neutral | Any brand |
| Space Grotesk | Technical, unique | Distinctive brands |

**Never use:** Inter, Roboto, Arial, system-ui (generic/overused)

---

## Color Accessibility

Always verify color contrast ratios:

| Element | Minimum Ratio (WCAG AA) |
|---------|------------------------|
| Body text | 4.5:1 |
| Large text (18px+) | 3:1 |
| UI components | 3:1 |

**Tools:**
- WebAIM Contrast Checker: webaim.org/resources/contrastchecker/
- Coolors Contrast Checker: coolors.co/contrast-checker

---

## Questions for Clients

When onboarding a new tenant, ask:

1. **Brand Assets**
   - Logo files (SVG, PNG, different versions)
   - Brand colors (hex codes if available)
   - Existing brand guidelines document

2. **Visual Preferences**
   - Show 3-4 design direction options
   - Preferred photography style
   - Competitors they like/dislike

3. **Content**
   - Tagline / slogan
   - About text
   - Contact information
   - Social media links

---

## Related Documents

- [FRONTEND_DESIGN_GUIDE.md](./starter-app/FRONTEND_DESIGN_GUIDE.md) — Design principles and anti-patterns
- [FRONTEND_DESIGN_SKILL.md](./starter-app/FRONTEND_DESIGN_SKILL.md) — AI workflow for design
- [seed-data/three-squares.md](./seed-data/three-squares.md) — Three Squares menu data
- [seed-data/latte-stone-cookies.md](./seed-data/latte-stone-cookies.md) — Cookie product data

---

*Guide maintained by Jerry | Last updated: February 9, 2026*
