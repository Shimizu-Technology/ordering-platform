# Shimizu Technology — Starter App Guides

This folder contains standard guides and best practices used across all Shimizu Technology projects. Reference these when building new features or onboarding to the codebase.

---

## Guide Index

### Core Development

| Guide | Description |
|-------|-------------|
| [AI_DEVELOPMENT_WORKFLOW.md](./AI_DEVELOPMENT_WORKFLOW.md) | Working with AI coding assistants (Claude, Cursor, Copilot) |
| [CURSOR_RULES_SETUP.md](./CURSOR_RULES_SETUP.md) | Setting up Cursor rules for consistent AI assistance |
| [PROJECT_PLANNING_GUIDE.md](./PROJECT_PLANNING_GUIDE.md) | How to plan and structure new projects |
| [TESTING_GUIDE.md](./TESTING_GUIDE.md) | Testing strategies, tools, and patterns |
| [CI_CD_GUIDE.md](./CI_CD_GUIDE.md) | Continuous integration and deployment setup |

### Frontend

| Guide | Description |
|-------|-------------|
| [FRONTEND_DESIGN_GUIDE.md](./FRONTEND_DESIGN_GUIDE.md) | UI/UX standards, component patterns, accessibility |
| [FRONTEND_DESIGN_SKILL.md](./FRONTEND_DESIGN_SKILL.md) | Quick reference for frontend design decisions |
| [PWA_SETUP_GUIDE.md](./PWA_SETUP_GUIDE.md) | Progressive Web App configuration |
| [SEO_SETUP_GUIDE.md](./SEO_SETUP_GUIDE.md) | Search engine optimization setup |
| [ANALYTICS_SETUP_GUIDE.md](./ANALYTICS_SETUP_GUIDE.md) | Analytics and tracking integration |

### Backend

| Guide | Description |
|-------|-------------|
| [BACKGROUND_JOBS_GUIDE.md](./BACKGROUND_JOBS_GUIDE.md) | Sidekiq, job processing, queues |
| [CACHING_GUIDE.md](./CACHING_GUIDE.md) | Redis caching strategies |
| [WEBSOCKETS_GUIDE.md](./WEBSOCKETS_GUIDE.md) | Action Cable, real-time features |
| [ERROR_MONITORING_GUIDE.md](./ERROR_MONITORING_GUIDE.md) | Sentry, error tracking, alerting |

### Integrations

| Guide | Description |
|-------|-------------|
| [STRIPE_SETUP_GUIDE.md](./STRIPE_SETUP_GUIDE.md) | Payment processing with Stripe |
| [CLERK_AUTH_SETUP_GUIDE.md](./CLERK_AUTH_SETUP_GUIDE.md) | Authentication with Clerk |
| [AWS_S3_SETUP_GUIDE.md](./AWS_S3_SETUP_GUIDE.md) | File storage with AWS S3 |
| [EMAIL_SETUP_GUIDE.md](./EMAIL_SETUP_GUIDE.md) | Email delivery (SendGrid, etc.) |

### Deployment

| Guide | Description |
|-------|-------------|
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Deploying to Render, Netlify, etc. |
| [MOBILE_APP_DEPLOYMENT_GUIDE.MD](./MOBILE_APP_DEPLOYMENT_GUIDE.MD) | iOS and Android app deployment |

### Specialized

| Guide | Description |
|-------|-------------|
| [VIDEO_EXTRACTION_GUIDE.md](./VIDEO_EXTRACTION_GUIDE.md) | Video processing and extraction |

---

## Key Principles

### 1. Mobile-First
Design for phones first, then enhance for desktop.

### 2. No Emojis in UI
Use SVG icons (Lucide React). Emojis render inconsistently.

### 3. TypeScript Everywhere
Frontend code must be TypeScript. No `any` types without justification.

### 4. Test Critical Paths
At minimum: order flow, payment, auth. Target 80%+ coverage.

### 5. Accessibility Matters
WCAG 2.1 AA compliance. Keyboard navigation, screen reader support.

---

## Quick Links

- **Frontend Design:** Start with [FRONTEND_DESIGN_GUIDE.md](./FRONTEND_DESIGN_GUIDE.md)
- **New Project:** Start with [PROJECT_PLANNING_GUIDE.md](./PROJECT_PLANNING_GUIDE.md)
- **Deployment:** Start with [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Payments:** Start with [STRIPE_SETUP_GUIDE.md](./STRIPE_SETUP_GUIDE.md)

---

*Maintained by Shimizu Technology*
