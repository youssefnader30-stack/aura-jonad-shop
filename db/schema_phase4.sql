-- Phase 4 — international ops tables
create table fx_rates (
  currency text primary key,
  rate_vs_usd numeric not null,
  updated_at timestamptz default now()
);

create table payouts (
  id text primary key,                    -- Stripe payout id
  amount_cents int not null,
  currency text not null,
  arrival_at timestamptz,
  status text,
  mercury_tx_id text,
  wise_transfer_id text,
  eg_credited_at timestamptz,
  created_at timestamptz default now()
);

create table returns (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id),
  reason text,
  rma_code text unique,
  label_url text,
  status text check (status in ('requested','label_sent','received','refunded','denied')) default 'requested',
  created_at timestamptz default now()
);

create table vat_thresholds (
  region text primary key,                -- 'EU_OSS','UK','US_<STATE>'
  threshold_cents_year int not null,
  ytd_cents int default 0,
  breached boolean default false
);

insert into vat_thresholds (region, threshold_cents_year) values
  ('EU_OSS', 1000000),      -- €10k
  ('UK',     8500000),      -- £85k
  ('US_CA',  50000000),     -- $500k
  ('US_NY',  50000000),
  ('US_TX',  50000000)
on conflict do nothing;
