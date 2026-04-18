# Improvement Plan

## Phase 1: Stabilize Auth And Tenant Context

1. Unify application auth around one `requireAuth()` that returns `userId`, `tenantId`, `email`, `plan`, and `role`.
2. Remove hostname-based tenant resolution from authenticated dashboard flows.
3. Fix signup to create the matching application records (`tenants`, `users`) and compensate cleanly if provisioning fails.
4. Stop swallowing `redirect()` and other Next.js control-flow errors inside server actions.

## Phase 2: Make Multi-Tenant Isolation Consistent

1. Use authenticated tenant context for all dashboard reads and writes.
2. Audit direct `db` usage and move tenant-owned flows behind a safe access path.
3. Revisit the RLS model once the application-layer tenant flow is correct.

## Phase 3: Restore Delivery Confidence

1. Make `typecheck` deterministic with explicit Next.js type generation.
2. Add a real ESLint config so `pnpm lint` runs non-interactively.
3. Replace placeholder security and integration tests with executable coverage for signup, auth, and tenant isolation.

## Phase 4: Production Hardening

1. Protect admin access with an explicit authorization model.
2. Move generated PDFs to object storage instead of storing base64 in Postgres.
3. Finish missing product flows such as custom-domain resolution and password reset.
