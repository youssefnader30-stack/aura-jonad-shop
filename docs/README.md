# Modern Ecommerce — Build Output

**Stack:** Next.js 15 · Tailwind · shadcn/ui · Supabase (Postgres+Auth+Storage) · Stripe · Vercel
**Build ID:** ecom-v1.0.0 · **Date:** 2026-04-18 · **QA:** PASS

## Artifacts
| Path | Agent | Purpose |
|------|-------|---------|
| `n8n/ecom_workflow.json` | — | Importable n8n workflow |
| `db/schema.sql`          | N3 DB_Agent | Postgres schema + RLS |
| `backend/routes.ts`      | N4 Backend_Agent | API routes |
| `frontend/pages.tsx`     | N5 Frontend_Agent | Storefront UI |
| `payments/stripe.ts`     | N6 Payments_Agent | Stripe helpers |
| `admin/admin.tsx`        | N8 Admin_Agent | /admin dashboard |
| `qa/qa_report.md`        | N10 QA_Agent | Validation report |
| `docs/.env.example`      | — | Required env vars |
| `docs/DEPLOY.md`         | N11 Deploy_Agent | Runbook |

## Features shipped
Cart · Checkout · Stripe · User auth · Profiles · Orders · Admin CRUD · Inventory · Search (pg_trgm) · Category/price filters · Reviews (1/user/product) · RLS-secured data

## To run locally
```bash
pnpm i
supabase start && supabase db push
pnpm dev
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
