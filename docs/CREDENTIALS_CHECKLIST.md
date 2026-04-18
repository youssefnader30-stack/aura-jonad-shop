# CREDENTIALS CHECKLIST — Egypt Edition 🇪🇬

**Fill in as you go. Do NOT commit this file with values — use `.env` locally and secret managers in production.**

---

## Step 0 — Pick your money path

- [ ] **Path A** — Paymob (Egypt-only sales, recommended start)
- [ ] **Path B** — International processor via Payoneer (global sales, no LLC)
- [ ] **Path C** — US LLC + Stripe via Atlas (max flexibility, $500 setup)

---

## Step 1 — Identity & Domain

- [ ] **Domain** (Namecheap/Cloudflare, ~$10/yr)
      Name: ______________________
- [ ] **Google Workspace** ($6/user/mo) OR **Zoho Mail** (free tier)
      Email: orders@<domain>, support@<domain>, admin@<domain>
- [ ] **Egyptian National ID + address proof** (needed for Paymob/bank)

---

## Step 2 — Infrastructure

- [ ] **Supabase Pro** ($25/mo) — works in Egypt, pay by card
      NEXT_PUBLIC_SUPABASE_URL=
      NEXT_PUBLIC_SUPABASE_ANON_KEY=
      SUPABASE_SERVICE_KEY=
      SUPABASE_DB_URL=
- [ ] **Vercel Pro** ($20/mo) — works in Egypt, pay by card
      VERCEL_TOKEN=
- [ ] **Resend** (free tier 3k/mo) — works in Egypt
      RESEND_API_KEY=
- [ ] **AWS S3** (pennies/mo) for DB backups
      AWS_ACCESS_KEY_ID=
      AWS_SECRET_ACCESS_KEY=
      BACKUP_BUCKET=
- [ ] **n8n** — n8n Cloud Starter ($20/mo) OR self-host on Hetzner/Contabo ($5/mo)
      N8N_URL=
      N8N_API_KEY=
- [ ] **GA4** (free)
      GA4_MEASUREMENT_ID=
      GA4_API_SECRET=

---

## Step 3A — Paymob (Path A)

- [ ] Register: https://accept.paymob.com/portal2/en/register
- [ ] Upload: National ID (front/back), tax card, commercial register OR freelance permit
- [ ] Bank account: any Egyptian bank (CIB, QNB, NBE, Alex Bank, Banque Misr)
- [ ] Wait 2–5 business days for approval
- [ ] Create integrations in dashboard:
      - Online Card (Visa/MC/Meeza)
      - Mobile Wallet (Vodafone/Orange/Etisalat Cash)
      - Installments (valU / aman / forsa / Contact) — optional
- [ ] Copy credentials:
      PAYMOB_API_KEY=
      PAYMOB_INTEGRATION_ID_CARD=
      PAYMOB_INTEGRATION_ID_WALLET=
      PAYMOB_INTEGRATION_ID_INSTALL=
      PAYMOB_IFRAME_ID=
      PAYMOB_HMAC=
- [ ] Webhook URL: https://<domain>/api/paymob/webhook
- [ ] Test with Paymob test card then go live

Fees: ~2.75% + EGP 2 per transaction · Payout: 1–3 business days to your bank in EGP

---

## Step 3B — Payoneer + International Processor (Path B)

- [ ] Register Payoneer: payoneer.com (Egypt supported)
- [ ] Verify: National ID + proof of address (electric bill)
- [ ] Get virtual USD/EUR/GBP receiving accounts
- [ ] Register processor (pick one):
      - 2Checkout: 2checkout.com → Egypt supported
      - PayTabs: paytabs.com → MENA supported
- [ ] Link processor payouts → Payoneer
- [ ] Withdraw Payoneer → Egyptian bank (EGP) or use Payoneer Mastercard

Fees: 3.5–4.5% processor + 2% Payoneer FX · Payout: 2–5 days

---

## Step 3C — US LLC + Stripe (Path C)

- [ ] Form US LLC:
      - Stripe Atlas ($500): stripe.com/atlas (easiest — bundles everything)
      - Firstbase.io ($399)
      - doola ($297)
- [ ] Get EIN (Atlas handles)
- [ ] Open US business bank: Mercury (free) or Wise Business ($31)
- [ ] Activate Stripe under the LLC → STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
- [ ] Withdraw: Mercury/Wise → Egyptian bank (SWIFT) OR Payoneer
- [ ] Annual: file Form 5472 + 1120 (foreign-owned LLC) — use a CPA ~$400/yr

Fees: 2.9% + $0.30 Stripe · Payout: 2 days Stripe→Mercury, 1–3 days Mercury→EG

---

## Step 4 — .env file (template)

```env
# App
APP_URL=https://<your-domain>

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
SUPABASE_DB_URL=

# Payments — pick ONE block

## Path A — Paymob
PAYMOB_API_KEY=
PAYMOB_INTEGRATION_ID_CARD=
PAYMOB_INTEGRATION_ID_WALLET=
PAYMOB_INTEGRATION_ID_INSTALL=
PAYMOB_IFRAME_ID=
PAYMOB_HMAC=

## Path B / C — Stripe
# STRIPE_SECRET_KEY=
# STRIPE_WEBHOOK_SECRET=

# Email
RESEND_API_KEY=

# Analytics
GA4_MEASUREMENT_ID=
GA4_API_SECRET=

# Backups
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
BACKUP_BUCKET=
```

---

## Step 5 — Test with test cards

### Paymob test
Card: `5123 4567 8901 2346` · CVV `123` · Expiry `12/25` · OTP `123456`

### Stripe test (Path C only)
Card: `4242 4242 4242 4242` · any future expiry · any CVC

---

## Step 6 — Go Live Checklist

- [ ] All env vars set in Vercel + n8n + GitHub Secrets
- [ ] Webhook endpoint reachable (curl `/api/paymob/webhook` or `/api/stripe/webhook`)
- [ ] Test order end-to-end with real card
- [ ] Refund test works
- [ ] Payout schedule confirmed
- [ ] Tax registration (Egypt: VAT if >EGP 500k/yr revenue)
- [ ] Terms of Service + Privacy Policy live

---

## Money Flow Summary

| Path | Customer pays in | Lands in | Fees | Withdraw to EG |
|------|------------------|----------|------|----------------|
| A Paymob       | EGP              | Paymob balance   | ~2.75%       | 1–3 days, EGP bank |
| B 2Checkout→Payoneer | USD/EGP    | Payoneer USD     | 3.5%+2% FX   | 1–2 days, EGP bank or card |
| C Stripe (US LLC)    | USD/global | Stripe USD       | 2.9%+$0.30   | Stripe→Mercury→SWIFT or Payoneer |

---

## Recommendation — UPDATED for international sales

**Use Path C (US LLC + Stripe) — it's the only viable option for selling globally from Egypt.**

Fastest route:
```
1. Stripe Atlas  → $500 one-time → Delaware LLC + EIN + Stripe onboarding
2. Mercury bank  → free, online, 2 days
3. Wise Business → multi-currency + best FX to Egypt
4. Egyptian bank → CIB/QNB USD account (receive SWIFT) or via Wise EGP payout
```

Money route: **Stripe → Mercury → Wise → Egyptian bank** (or Payoneer card as backup)
First-year cost: **~$1,230** (recoverable after ~$42k revenue at 2.9% fees)
Year 2+: **~$800/yr fixed + 2.9% Stripe**
