# Setup Progress — 2026-04-18

## ✅ Done

| Service       | Status              | Detail                                                |
|---------------|---------------------|-------------------------------------------------------|
| Domain        | Registered          | aura-jonad.com (Spaceship, exp 2026-09-29)            |
| Cloudflare    | Free plan active    | Site added, nameservers issued                        |
| Nameservers   | Switched            | barbara.ns.cloudflare.com / jaziel.ns.cloudflare.com  |
| DNS propagation | ⏳ 5min–24h        | Cloudflare auto-detects; then site activates          |
| Supabase      | Project live        | rrrhgvasmkdeswfcuyck.supabase.co (EU-West, Free, Nano) |
| Paymob        | KYC submitted       | Awaiting 2–5 biz day review                           |
| Lemon Squeezy | Step 2/6            | Store created, needs identity + 2FA + product + discount |
| GitHub        | Account ready       | user: youssefnader30-stack                            |
| Legal pages   | Written             | refund-policy / terms / privacy (branded AuraJonad)   |

## 🔐 Captured Credentials
Stored in `.env.local` (gitignored). Missing items marked `REPLACE_ME`.

## ⏳ Next — needs 2-minute user action

1. **Supabase**
   - Open https://supabase.com/dashboard/project/rrrhgvasmkdeswfcuyck/settings/api-keys
   - Click the 👁 eye icon next to "default" secret → copy → paste into `.env.local` `SUPABASE_SERVICE_KEY=`
   - Settings → Database → Connection string → URI → copy → paste into `SUPABASE_DB_URL=`
     (use the pooled "Transaction" string; replace `[YOUR-PASSWORD]` with the password you set)

2. **GitHub repo**
   - Pick one: rename existing `youssefnader30-stack/inkstorm` → `aura-jonad-shop`, or create new
   - Tell me the repo name and I'll push the code

3. **Products you're selling**
   - I need a one-liner: what goes in the catalog? (e.g., "handmade leather bags", "print-on-demand shirts", "digital courses")
   - Determines seed data, image prompts, meta tags, SEO

## 🚧 Blocked

- Paymob keys (waiting KYC approval)
- Vercel deploy (waiting GitHub repo decision + supabase secret)
- DNS-dependent services (Resend domain auth, custom domain on Vercel) — wait ~1h after NS propagates

## 💰 Spent so far
- $10 (domain)
- $0 everything else
