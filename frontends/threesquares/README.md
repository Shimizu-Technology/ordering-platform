# Three Squares by B&G Pacific

Online ordering frontend for Three Squares Restaurant + Latte Stone Cookies.

## Features

- **Restaurant Ordering** — Breakfast, lunch, dinner menu
- **Multi-Location** — Chalan San Antonio + Donki
- **Catering** — Quote requests for events
- **Merchandise** — Latte Stone Cookies store

## Branding

- **Colors:** Forest green (#1B4332), Gold (#FFD700), Teal (#2D6A4F)
- **Font:** Montserrat (headings), DM Sans (body)
- **Cookie Store:** Separate theme with Playfair Display headings

See `src/styles/theme.css` for full token definitions.

## Development

```bash
# Install dependencies (from monorepo root)
pnpm install

# Start dev server
pnpm --filter @shimizu/threesquares dev

# Build for production
pnpm --filter @shimizu/threesquares build
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
VITE_API_URL=http://localhost:3000/api/v1
VITE_RESTAURANT_SLUG=threesquares
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Feature Flags

This frontend expects the restaurant to have these features enabled:

```json
{
  "catering": true,
  "multi_location": true,
  "merchandise": true,
  "pos": true,
  "rewards": false
}
```
