# Traballo — System Context & Instructions

This file provides the foundational context, architectural patterns, and development mandates for the **Traballo** project.

## Project Overview
Traballo is a multi-tenant SaaS platform designed for French-speaking artisans (France, Belgium, Luxembourg). It allows them to manage their entire digital presence and business operations from a single dashboard.

- **Core Value**: All-in-one business pack (Website + Invoicing + AI Assistant + Appointments).
- **Target Audience**: Solo artisans and small teams (plumbers, electricians, cleaners, etc.).
- **Compliance**: Ready for 2026/2027 e-invoicing regulations (Factur-X, PEPPOL).

### Key Technologies
- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS 4.0 + shadcn/ui
- **Auth**: Supabase Auth
- **AI**: Anthropic Claude 3.5/3.7 (via AI SDK)
- **Email/Payments**: Resend / Stripe
- **Deployment**: Vercel (multi-tenant subdomain routing)

---

## Architectural Patterns

### 1. Multi-Tenant Routing (`middleware.ts`)
The application uses hostname-based routing:
- `app.traballo.pro` → Dashboard for artisans (`/dashboard/*`)
- `admin.traballo.pro` → Platform super-admin (`/admin/*`)
- `[slug].traballo.pro` → Public artisan website (`/sites/[slug]/*`)
- `custom.domain` → Resolved to an artisan site via DB lookup

### 2. Tenant Isolation & Security
- **RLS Mandatory**: Every table MUST have a `tenant_id` column and an associated RLS policy.
- **Session Context**: Use `getTenantDb(tenantId)` from `src/lib/db/tenant.ts` to ensure all queries are scoped to the current tenant using `SET LOCAL app.current_tenant_id`.
- **Validation**: Use Zod for all inputs and environment variables.
- **Secrets**: Never expose `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, or `STRIPE_SECRET_KEY` to the client.

### 3. Data Flow
- **Server Actions**: Preferred for mutations. Suffix files with `Action.ts`.
- **Result Pattern**: Use `Result<T, E>` from `src/lib/result.ts` for error handling in business logic.
- **TDD**: Write tests in `tests/integration/actions/` before implementing the corresponding action.

---

## Development Workflow

### Key Commands
```bash
pnpm dev           # Start development server
pnpm build         # Production build
pnpm test          # Run all tests (Vitest)
pnpm check         # Typecheck + Lint + Test (Pre-commit)
pnpm db:generate   # Generate Drizzle migrations
pnpm db:migrate    # Apply Drizzle migrations
pnpm supabase:start # Start local Supabase environment
```

### Coding Standards
- **TypeScript**: `strict: true` is non-negotiable. Always type async returns.
- **Naming**: 
  - Components: `PascalCase.tsx`
  - Functions/Hooks: `camelCase.ts`
  - Constants: `SCREAMING_SNAKE_CASE`
- **TDD Requirement**: Every feature or bug fix must start with a failing test case in `tests/`.
- **Git**: Commit after every significant step (migration, feature, fix). Proposed messages should focus on "why" rather than just "what".

---

## Directory Structure
- `src/app`: Next.js routes organized by domain (dashboard, public, admin, api).
- `src/components`: UI components (shared, dashboard-specific, site-specific).
- `src/db`: Drizzle schema and migrations.
- `src/lib`: Core utilities (auth, db, ai, pdf, email).
- `tests`: Integration, security (isolation), and E2E tests.

## Critical Files
- `traballo-prd.md`: Full Product Requirements Document.
- `CLAUDE.md`: Main project memory and git rules.
- `src/db/schema/index.ts`: Source of truth for the database model.
- `middleware.ts`: Multi-tenant routing logic.
