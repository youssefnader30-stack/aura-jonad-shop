-- ============================================================
-- AuraJonad full schema v2 — DIGITAL PRODUCTS + SERVICES
-- Combines core + phase3 (loyalty/fraud/reco) + phase4 (international ops)
-- Digital-first: license keys, signed-URL downloads, service bookings
-- ============================================================

create extension if not exists pg_trgm;
create extension if not exists "uuid-ossp";
create extension if not exists vector;

-- ============================================================
-- CORE
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamptz default now()
);

create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('admin','superadmin')) default 'admin'
);

create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  parent_id uuid references categories(id)
);

-- products: kind drives delivery path
--   digital = file/license auto-delivered
--   service = booking + human delivery
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  tagline text,
  description text,
  bullets jsonb default '[]'::jsonb,
  price_cents int not null check (price_cents >= 0),
  currency text default 'USD',
  kind text not null check (kind in ('digital','service')) default 'digital',
  tier text check (tier in ('lead-magnet','entry','core','upsell','anchor')),
  file_url text,                               -- for digital: master file location (private bucket)
  license_template text,                       -- optional license key template
  service_duration_days int,                   -- for service: SLA
  active boolean default true,
  created_at timestamptz default now()
);
alter table products add column if not exists category_id uuid references categories(id);
create index if not exists idx_products_trgm on products using gin (name gin_trgm_ops, description gin_trgm_ops);

create table if not exists product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  url text not null,
  position int default 0
);

-- cart
create table if not exists carts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);
create table if not exists cart_items (
  id uuid primary key default uuid_generate_v4(),
  cart_id uuid references carts(id) on delete cascade,
  product_id uuid references products(id),
  qty int not null check (qty > 0),
  unit_price_cents int not null,
  unique (cart_id, product_id)
);

-- orders — no shipping, digital first
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  status text check (status in ('pending','paid','fulfilled','refunded','disputed','cancelled')) default 'pending',
  total_cents int not null,
  currency text default 'USD',
  gateway text check (gateway in ('paymob','lemonsqueezy','stripe','free')) default 'lemonsqueezy',
  gateway_session_id text unique,
  gateway_payment_id text,
  customer_email text not null,
  created_at timestamptz default now()
);
create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  name_snapshot text not null,
  unit_price_cents int not null,
  qty int not null
);

-- reviews
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  user_id uuid references auth.users(id),
  rating int check (rating between 1 and 5),
  body text,
  created_at timestamptz default now(),
  unique (product_id, user_id)
);

-- ============================================================
-- DIGITAL DELIVERY
-- ============================================================
create table if not exists licenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  product_id uuid references products(id),
  order_id uuid references orders(id),
  license_key text unique not null,
  issued_at timestamptz default now(),
  expires_at timestamptz,                      -- null = lifetime
  revoked boolean default false
);
create index if not exists idx_licenses_user on licenses(user_id);

create table if not exists digital_deliveries (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id),
  product_id uuid references products(id),
  file_url text,                               -- signed URL
  download_token text unique,
  max_downloads int default 5,
  downloaded_count int default 0,
  expires_at timestamptz,                      -- token expiry (30 days post-purchase)
  created_at timestamptz default now()
);

create table if not exists service_bookings (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id),
  product_id uuid references products(id),
  user_id uuid references auth.users(id),
  scheduled_at timestamptz,
  meeting_url text,
  deliverable_url text,
  sla_days int,
  status text check (status in ('awaiting_booking','scheduled','in_progress','delivered','cancelled')) default 'awaiting_booking',
  created_at timestamptz default now()
);

-- lead magnet capture (no account required)
create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  source text,                                 -- 'lead-magnet','hero','exit-intent'
  product_slug text,
  ip text,
  user_agent text,
  created_at timestamptz default now(),
  unique (email, source)
);

-- ============================================================
-- RLS
-- ============================================================
alter table profiles            enable row level security;
alter table admins              enable row level security;
alter table categories          enable row level security;
alter table products            enable row level security;
alter table product_images      enable row level security;
alter table carts               enable row level security;
alter table cart_items          enable row level security;
alter table orders              enable row level security;
alter table order_items         enable row level security;
alter table reviews             enable row level security;
alter table licenses            enable row level security;
alter table digital_deliveries  enable row level security;
alter table service_bookings    enable row level security;
alter table leads               enable row level security;

-- public read policies
drop policy if exists p_products_public   on products;
drop policy if exists p_categories_public on categories;
drop policy if exists p_images_public     on product_images;
drop policy if exists p_reviews_public    on reviews;
create policy p_products_public   on products       for select using (active = true);
create policy p_categories_public on categories     for select using (true);
create policy p_images_public     on product_images for select using (true);
create policy p_reviews_public    on reviews        for select using (true);

-- owner policies
drop policy if exists p_own_profile     on profiles;
drop policy if exists p_own_cart        on carts;
drop policy if exists p_own_cart_items  on cart_items;
drop policy if exists p_own_orders      on orders;
drop policy if exists p_own_order_items on order_items;
drop policy if exists p_own_licenses    on licenses;
drop policy if exists p_own_deliveries  on digital_deliveries;
drop policy if exists p_own_bookings    on service_bookings;
drop policy if exists p_write_reviews   on reviews;
drop policy if exists p_edit_reviews    on reviews;
create policy p_own_profile     on profiles          for all    using (auth.uid() = id);
create policy p_own_cart        on carts             for all    using (auth.uid() = user_id);
create policy p_own_cart_items  on cart_items        for all    using (exists(select 1 from carts c where c.id=cart_id and c.user_id=auth.uid()));
create policy p_own_orders      on orders            for select using (auth.uid() = user_id);
create policy p_own_order_items on order_items       for select using (exists(select 1 from orders o where o.id=order_id and o.user_id=auth.uid()));
create policy p_own_licenses    on licenses          for select using (auth.uid() = user_id);
create policy p_own_deliveries  on digital_deliveries for select using (exists(select 1 from orders o where o.id=order_id and o.user_id=auth.uid()));
create policy p_own_bookings    on service_bookings  for all    using (auth.uid() = user_id);
create policy p_write_reviews   on reviews           for insert with check (auth.uid() = user_id);
create policy p_edit_reviews    on reviews           for update using (auth.uid() = user_id);

-- admin bypass (read+write all)
drop policy if exists p_admin_products on products;
drop policy if exists p_admin_orders   on orders;
drop policy if exists p_admin_licenses on licenses;
drop policy if exists p_admin_leads    on leads;
create policy p_admin_products on products for all using (exists(select 1 from admins where user_id = auth.uid()));
create policy p_admin_orders   on orders   for all using (exists(select 1 from admins where user_id = auth.uid()));
create policy p_admin_licenses on licenses for all using (exists(select 1 from admins where user_id = auth.uid()));
create policy p_admin_leads    on leads    for all using (exists(select 1 from admins where user_id = auth.uid()));

-- ============================================================
-- PHASE 3 — loyalty / discounts / cart recovery / experiments / fraud / support / reco
-- ============================================================
create table if not exists loyalty_points (
  user_id uuid primary key references auth.users(id) on delete cascade,
  points int not null default 0,
  updated_at timestamptz default now()
);
create table if not exists loyalty_ledger (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  order_id uuid references orders(id),
  delta int not null,
  reason text,
  created_at timestamptz default now(),
  unique (user_id, order_id)
);
create table if not exists discount_codes (
  code text primary key,
  user_id uuid references auth.users(id),
  percent_off int check (percent_off between 1 and 100),
  expires_at timestamptz,
  used_at timestamptz
);
create table if not exists cart_recovery_sends (
  cart_id uuid,
  stage int check (stage in (1,2,3)),
  sent_at timestamptz default now(),
  primary key (cart_id, stage)
);

alter table products add column if not exists embedding vector(1536);
create index if not exists idx_products_embedding on products using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create table if not exists experiments (
  key text primary key,
  variants jsonb not null,
  started_at timestamptz default now(),
  stopped_at timestamptz
);
create table if not exists experiment_exposures (
  user_id uuid,
  key text references experiments(key),
  variant text,
  exposed_at timestamptz default now(),
  primary key (user_id, key)
);

create table if not exists fraud_reviews (
  order_id uuid primary key references orders(id),
  score numeric check (score between 0 and 100),
  decision text check (decision in ('release','hold','block')),
  reasons jsonb,
  reviewed_at timestamptz default now()
);

create table if not exists support_tickets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  subject text,
  body text,
  category text check (category in ('order','refund','delivery','product','other')),
  confidence numeric,
  status text check (status in ('new','assigned','resolved')) default 'new',
  created_at timestamptz default now()
);

alter table loyalty_points       enable row level security;
alter table loyalty_ledger       enable row level security;
alter table discount_codes       enable row level security;
alter table cart_recovery_sends  enable row level security;
alter table experiments          enable row level security;
alter table experiment_exposures enable row level security;
alter table fraud_reviews        enable row level security;
alter table support_tickets      enable row level security;

drop policy if exists p_own_loyalty   on loyalty_points;
drop policy if exists p_own_ledger    on loyalty_ledger;
drop policy if exists p_own_discount  on discount_codes;
drop policy if exists p_own_ticket    on support_tickets;
drop policy if exists p_own_exposure  on experiment_exposures;
create policy p_own_loyalty  on loyalty_points       for select using (auth.uid() = user_id);
create policy p_own_ledger   on loyalty_ledger       for select using (auth.uid() = user_id);
create policy p_own_discount on discount_codes       for select using (auth.uid() = user_id);
create policy p_own_ticket   on support_tickets      for all    using (auth.uid() = user_id);
create policy p_own_exposure on experiment_exposures for select using (auth.uid() = user_id);

-- ============================================================
-- PHASE 4 — FX + payouts + disputes
-- ============================================================
create table if not exists fx_rates (
  currency text primary key,
  rate_vs_usd numeric not null,
  updated_at timestamptz default now()
);

create table if not exists payouts (
  id text primary key,
  amount_cents int not null,
  currency text not null,
  arrival_at timestamptz,
  status text,
  gateway text,
  eg_credited_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists disputes (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id),
  reason text,
  gateway_dispute_id text unique,
  status text check (status in ('opened','evidence_submitted','won','lost')) default 'opened',
  created_at timestamptz default now()
);

create table if not exists vat_thresholds (
  region text primary key,
  threshold_cents_year int not null,
  ytd_cents int default 0,
  breached boolean default false
);
insert into vat_thresholds (region, threshold_cents_year) values
  ('EU_OSS', 1000000),
  ('UK',     8500000),
  ('US_CA',  50000000)
on conflict do nothing;

alter table fx_rates       enable row level security;
alter table payouts        enable row level security;
alter table disputes       enable row level security;
alter table vat_thresholds enable row level security;

-- ============================================================
-- CATEGORIES + PRODUCT SEED (AuraJonad launch catalog)
-- ============================================================
insert into categories (slug, name) values
  ('automation', 'Automation Systems'),
  ('prompts',    'Prompt Systems'),
  ('chatbots',   'AI Chatbots'),
  ('ops',        'Business Ops'),
  ('services',   'Done-For-You')
on conflict (slug) do nothing;

insert into products (slug, name, tagline, description, bullets, price_cents, currency, kind, tier, category_id)
select v.slug, v.name, v.tagline, v.description, v.bullets::jsonb, v.price_cents, 'USD', v.kind, v.tier,
       (select id from categories where slug = v.cat)
from (values
  ('free-10-automations',      '10 AI Automations Saving 5 Hrs/Week',           'Free 5-page PDF + 1 importable n8n workflow.',
   '10 real time-sinks, each automated step-by-step. Includes a lead-capture n8n workflow you can import today.',
   '["10 real use-cases","1 ready n8n workflow","5 cold-email openers"]',
   0,     'digital', 'lead-magnet', 'automation'),
  ('ai-automation-starter-kit','AI Automation Starter Kit',                     '7 n8n workflows that run your busywork.',
   'Seven production workflows: lead capture, follow-up, invoice, support triage, weekly reporting, content repurposing, competitive scraping. JSON + 20-min Loom.',
   '["7 n8n JSON workflows","20-min walkthrough","Setup checklist","Lifetime updates"]',
   2700,  'digital', 'entry',       'automation'),
  ('business-ops-prompt-vault','Business Ops Prompt Vault',                     '80 battle-tested prompts. No fluff.',
   'Notion database of 80 prompts across sales, ops, content, HR, finance. Each with sample output and tuning notes.',
   '["80 prompts, 5 departments","Notion DB, filter/tag","Tuning notes","Monthly updates"]',
   4700,  'digital', 'core',        'prompts'),
  ('chatbot-in-a-box',         'Chatbot-in-a-Box',                              'Deploy a RAG chatbot in one hour.',
   'n8n orchestration, Supabase pgvector schema, KB ingestor, 60-min build-along video. Works on Telegram/WhatsApp/Web.',
   '["n8n + Supabase schema","Multi-channel","RAG KB","Build-along video"]',
   9700,  'digital', 'core',        'chatbots'),
  ('freelancer-ops-stack',     'Freelancer Ops Stack',                          'Your freelance business, automated.',
   'Notion CRM + proposal + invoice + client portal. Six n8n automations tying them together. 45-min setup course.',
   '["Notion workspace","6 automations","Client portal","45-min course"]',
   14700, 'digital', 'core',        'ops'),
  ('automation-audit-dfy',     'Automation Audit + Done-For-You Build',         '60-min diagnostic. 1 custom workflow. 7-day delivery.',
   'We map your 3 biggest time-sinks on a Zoom, then build one custom n8n workflow end-to-end within 7 days. 30 days support.',
   '["60-min Zoom audit","1 custom workflow","Handover + docs","30 days support"]',
   49700, 'service', 'upsell',      'services'),
  ('ai-automation-transformation','AI Automation Transformation',                'Rewire your business. 5 workflows. 90 days support.',
   'Full audit, 5 custom workflows across sales/ops/delivery/support/reporting, team training, 90 days of hands-on support.',
   '["Full ops audit","5 custom workflows","Team training","90 days support"]',
   149700,'service', 'anchor',      'services')
) as v(slug, name, tagline, description, bullets, price_cents, kind, tier, cat)
on conflict (slug) do nothing;

-- ============================================================
-- VERIFY
-- ============================================================
select
  (select count(*) from pg_tables where schemaname='public') as table_count,
  (select count(*) from products) as product_count,
  (select count(*) from categories) as category_count;
