# Zero-Budget Launch Plan 🇪🇬

## Principle
**Pay nothing upfront. Only pay a % of what you actually earn.**

---

## Stack Cost (monthly, zero-budget variant)

| Service          | Free tier sufficient? | When you'd pay |
|------------------|------------------------|----------------|
| Supabase         | ✅ Free tier (500 MB DB, 1GB storage, 50k MAU) | > 500 MB data or > 50k users |
| Vercel           | ✅ Hobby plan free | Commercial use technically needs Pro; start free for testing |
| n8n              | Self-host on free Oracle Cloud ARM VM (always-free) | Never |
| Resend           | ✅ 3k emails/mo free | > 3k emails |
| GitHub           | ✅ Free | Never |
| Cloudflare       | ✅ Free (CDN + DNS + domain ~$10/yr) | Optional Pro |
| GA4              | ✅ Free | Never |
| AWS S3 backups   | Free tier 5GB + 20k GET | Pennies/mo after |
| Paymob           | ✅ Free signup | Only % on sales |
| Lemon Squeezy    | ✅ Free signup | Only % on sales |
| Payoneer         | ✅ Free account + free card | $30/yr card maintenance after year 1 |

**Monthly fixed cost: ~$1 (domain amortized) + $0 infra = essentially free**

---

## Launch Sequence (no cost)

### Week 1 — Egypt first
```
Day 1  Register Paymob:    https://accept.paymob.com/portal2/en/register
       Upload: National ID + bank account (any Egyptian bank)
Day 2  Buy domain:         Namecheap, ~$10/yr (only spend required)
Day 3  Set up Supabase + Vercel + GitHub (all free)
Day 4  Deploy the code I wrote
Day 5  Test real EGP transaction with yourself
Week-end: accept first real customer
```

### Week 2 — International (Lemon Squeezy)
```
Day 1  Sign up Lemon Squeezy:  https://app.lemonsqueezy.com
       No company required
       Link Payoneer for payouts (or PayPal)
Day 2  Sign up Payoneer:        https://payoneer.com
       Order free Mastercard (arrives 10–14 days)
Day 3  Create your products in Lemon Squeezy dashboard
Day 4  Add "Pay internationally" button on site → LS checkout URL
Day 5  Test with international test card
```

### Money flow (zero-budget setup)
```
Egyptian buyer
   → Paymob checkout (EGP)
   → Your Egyptian bank (EGP, 1–3 days)

International buyer
   → Lemon Squeezy checkout (USD/EUR/any)
   → LS handles VAT/tax automatically
   → LS payout to Payoneer USD (~weekly, $0 or small fee)
   → Spend USD on Payoneer Mastercard in Egypt
     OR withdraw Payoneer → Egyptian bank (~2% fee)
```

---

## Fees Only (no monthly bills)

| Scenario              | Effective cost on $1,000 sales |
|-----------------------|--------------------------------|
| EGP via Paymob        | ~$28 (~2.75%)                   |
| USD via Lemon Squeezy | ~$55 (5% + $0.50/txn)           |
| Withdraw Payoneer→EG  | ~$20 (2%)                       |

**All fees are per-sale. Zero money out of your pocket before a sale.**

---

## When to Upgrade (NOT before revenue justifies it)

| Trigger | Upgrade to | Why |
|---------|-----------|-----|
| > 500 MB DB                 | Supabase Pro ($25/mo)      | Required |
| > 3k emails/mo              | Resend $20/mo              | Required |
| International > $2k/mo      | Stripe Atlas US LLC ($500) | Fees drop 5% → 2.9% |
| Complex automations > 5k/mo | n8n Cloud ($20)            | Convenience |

---

## What to Skip Until Money Comes In
```
❌ US LLC (Stripe Atlas) — $500
❌ Google Workspace email — use free Zoho Mail with your domain
❌ Vercel Pro — Hobby is fine while testing
❌ Supabase Pro — Free tier enough for early stage
❌ Paid n8n — self-host on Oracle Cloud free VM
❌ Wise Business — use free Payoneer
❌ Stripe Tax — Lemon Squeezy handles it free
```

---

## Bottom Line

You can go **live today** with:
- **$10** for a domain
- **0 EGP** for everything else
- Fees only when you actually make money

Start Egypt-first with Paymob. Add Lemon Squeezy for international. Upgrade only when revenue justifies each step.
