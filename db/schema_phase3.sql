-- Phase 3 additive migrations
create extension if not exists vector;

-- Loyalty
create table loyalty_points (
  user_id uuid primary key references auth.users(id) on delete cascade,
  points int not null default 0,
  updated_at timestamptz default now()
);
create table loyalty_ledger (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  order_id uuid references orders(id),
  delta int not null,
  reason text,
  created_at timestamptz default now(),
  unique (user_id, order_id)           -- idempotency
);
create table discount_codes (
  code text primary key,
  user_id uuid references auth.users(id),
  percent_off int check (percent_off between 1 and 100),
  expires_at timestamptz,
  used_at timestamptz
);

-- Cart recovery
create table cart_recovery_sends (
  cart_id uuid,
  stage int check (stage in (1,2,3)),  -- 1h / 24h / 72h
  sent_at timestamptz default now(),
  primary key (cart_id, stage)
);

-- Recommendations (pgvector)
alter table products add column if not exists embedding vector(1536);
create index if not exists idx_products_embedding on products using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Experiments
create table experiments (
  key text primary key,
  variants jsonb not null,            -- ["A","B"]
  started_at timestamptz default now(),
  stopped_at timestamptz
);
create table experiment_exposures (
  user_id uuid,
  key text references experiments(key),
  variant text,
  exposed_at timestamptz default now(),
  primary key (user_id, key)
);

-- Fraud
create table fraud_reviews (
  order_id uuid primary key references orders(id),
  score numeric check (score between 0 and 100),
  decision text check (decision in ('release','hold','block')),
  reasons jsonb,
  reviewed_at timestamptz default now()
);

-- Support
create table support_tickets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  subject text,
  body text,
  category text check (category in ('order','refund','shipping','product','other')),
  confidence numeric,
  status text check (status in ('new','assigned','resolved')) default 'new',
  created_at timestamptz default now()
);

-- Reorder
create table reorder_drafts (
  product_id uuid primary key references products(id),
  suggested_qty int not null,
  velocity_30d numeric,
  created_at timestamptz default now(),
  acted_on boolean default false
);
