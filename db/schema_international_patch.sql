-- International sales configuration
alter table orders alter column currency set default 'USD';
alter table products alter column currency set default 'USD';

-- Multi-currency price storage (optional — display in customer's currency)
create table product_prices (
  product_id uuid references products(id) on delete cascade,
  currency text not null,
  price_cents int not null,
  primary key (product_id, currency)
);

-- Shipping zones for international
create table shipping_zones (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  countries text[] not null,                  -- ['US','CA','MX']
  rate_cents int not null,
  free_over_cents int                         -- free shipping threshold
);

-- Tax (Stripe Tax handles calc; we just store the line)
alter table orders add column if not exists tax_cents int default 0;
alter table orders add column if not exists shipping_cents int default 0;
alter table orders add column if not exists shipping_country text;
