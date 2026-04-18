# n8n Self-Host — AuraJonad

Stack: **n8n + Postgres + Cloudflare Tunnel** via Docker Compose. Public HTTPS via Cloudflare (free), no open ports.

## Hosting Options

| Option | Cost | Setup | Uptime |
|---|---|---|---|
| Your laptop | $0 | 10 min | Only when on |
| Hetzner CX11 VPS | €4.15/mo | 20 min | 99.9% |
| Oracle free tier | $0 | 30 min | 99.9% |

Pick one. **Recommend Hetzner CX11** — cheap, fast, clean Docker host.

## Prereqs
- Docker + Docker Compose installed
- Domain on Cloudflare (already done: aura-jonad.com ✓)
- 3 random secrets (generate with `openssl rand -hex 32`)

## Setup Steps

### 1. Create Cloudflare Tunnel
1. Cloudflare dashboard → **Zero Trust** → **Networks** → **Tunnels**
2. **Create a tunnel** → name: `aurajonad-n8n` → **Cloudflared**
3. Copy the token shown (long `eyJ...` string)
4. On the next screen add public hostname:
   - Subdomain: `n8n`
   - Domain: `aura-jonad.com`
   - Service: `HTTP` → `http://n8n:5678`
5. Save.

### 2. Configure env
```bash
cd infra/n8n
cp .env.example .env
# Generate secrets:
openssl rand -hex 32   # paste into N8N_ENCRYPTION_KEY
openssl rand -hex 32   # paste into N8N_JWT_SECRET
# Strong DB + basic-auth passwords (20+ chars each)
# Paste Cloudflare token into CF_TUNNEL_TOKEN
```

### 3. Launch
```bash
docker compose up -d
docker compose logs -f n8n
```
First boot ~30s. Visit **https://n8n.aura-jonad.com** → basic-auth prompt → n8n UI.

### 4. Import workflows
Workflows live in `./workflows/*.json` (mounted into container at `/workflows`). Import via UI:
- **Workflows** → **Import from File** → pick each JSON from `ecom-build/n8n/`:
  - `ecom_workflow.json`
  - `ecom_phase2_ops.json`
  - `ecom_phase3_growth.json`
  - `ecom_phase4_international.json`

### 5. Wire credentials
Create these in n8n under **Credentials**:
| Name | Type | Source |
|---|---|---|
| Supabase (service) | HTTP Header Auth | `apikey` = SUPABASE_SERVICE_KEY |
| Resend | HTTP Header Auth | `Authorization: Bearer re_...` |
| Paymob | HTTP Header Auth | (after KYC approved) |
| LemonSqueezy | HTTP Header Auth | `Authorization: Bearer ...` |
| OpenAI | OpenAI API | `sk-...` |

### 6. Activate 1 workflow (smoke test)
Activate only the **lead-capture** workflow first. Trigger by POSTing:
```bash
curl -X POST https://n8n.aura-jonad.com/webhook/lead-capture \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","source":"smoke"}'
```
Expected: 200 OK + row in Supabase `leads` + email sent via Resend.

## Ops

- **Backup**: Postgres volume `pgdata` + n8n volume `n8ndata`. Dump nightly via `pg_dump` cron.
- **Updates**: `docker compose pull && docker compose up -d` every 2 weeks.
- **Logs**: `docker compose logs --tail 200 n8n`
- **Tunnel health**: `docker compose logs cloudflared`

## Security

- n8n UI hidden behind basic auth + Cloudflare Access (optional email-OTP)
- No ports exposed to host except 127.0.0.1:5678 (loopback only)
- Encryption key rotated = all stored credentials must be re-entered (don't lose it)
- Add Cloudflare WAF rule: block `*.aura-jonad.com` from countries you don't operate in
