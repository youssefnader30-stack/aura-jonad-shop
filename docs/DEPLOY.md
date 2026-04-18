# Deploy Runbook — N11_Deploy_Agent

## Steps
1. `supabase db push` → applies `db/schema.sql`
2. Create Storage bucket `product-images` (public read)
3. `vercel --prod` → binds env vars from `.env.example`
4. Register webhook: `stripe listen --forward-to $APP_URL/api/stripe/webhook`
   and copy signing secret → `STRIPE_WEBHOOK_SECRET`
5. Seed admin: `insert into admins(user_id,role) values ('<uuid>','superadmin');`

## Post-deploy checks
- [ ] `/api/products` returns 200
- [ ] Stripe webhook test event → 200
- [ ] Create order with test card 4242 4242 4242 4242
- [ ] Admin dashboard loads for admin user only

## URLs (example)
- App:    https://shop.vercel.app
- Admin:  https://shop.vercel.app/admin
- DB:     https://app.supabase.com/project/<id>
