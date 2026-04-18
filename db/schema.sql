-- ============================================================
-- Ecommerce Schema (PostgreSQL / Supabase)
-- Author: N3_DB_Agent
-- ============================================================
create extension if not exists pg_trgm;
create extension if not exists "uuid-ossp";

-- USERS handled by Supabase auth.users
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamptz default now()
);

create table admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('admin','superadmin')) default 'admin'
);

create table categories (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  parent_id uuid references categories(id)
);

create table products (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  price_cents int not null check (price_cents >= 0),
  currency text default 'USD',
  stock int not null default 0,
  category_id uuid references categories(id),
  active boolean default true,
  created_at timestamptz default now()
);
create index idx_products_trgm on products using gin (name gin_trgm_ops, description gin_trgm_ops);
create index idx_products_category on products(category_id);

create table product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  url text not null,
  position int default 0
);

create table carts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);
create table cart_items (
  id uuid primary key default uuid_generate_v4(),
  cart_id uuid references carts(id) on delete cascade,
  product_id uuid references products(id),
  qty int not null check (qty > 0),
  unit_price_cents int not null,
  unique (cart_id, product_id)
);

create table orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  status text check (status in ('pending','paid','shipped','delivered','cancelled','refunded')) default 'pending',
  total_cents int not null,
  currency text default 'USD',
  stripe_session_id text unique,
  stripe_payment_intent text,
  shipping_address jsonb,
  created_at timestamptz default now()
);
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  name_snapshot text not null,
  unit_price_cents int not null,
  qty int not null
);

create table reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  user_id uuid references auth.users(id),
  rating int check (rating between 1 and 5),
  body text,
  created_at timestamptz default now(),
  unique (product_id, user_id)
);

-- ============================================================
-- RLS
-- ============================================================
alter table profiles      enable row level security;
alter table carts         enable row level security;
alter table cart_items    enable row level security;
alter table orders        enable row level security;
alter table order_items   enable row level security;
alter table reviews       enable row level security;

create policy "own profile"   on profiles    for all using (auth.uid() = id);
create policy "own cart"      on carts       for all using (auth.uid() = user_id);
create policy "own cartitems" on cart_items  for all using (exists(select 1 from carts c where c.id=cart_id and c.user_id=auth.uid()));
create policy "own orders"    on orders      for select using (auth.uid() = user_id);
create policy "own orderitems"on order_items for select using (exists(select 1 from orders o where o.id=order_id and o.user_id=auth.uid()));
create policy "read reviews"  on reviews     for select using (true);
create policy "write reviews" on reviews     for insert with check (auth.uid() = user_id);
create policy "edit reviews"  on reviews     for update using (auth.uid() = user_id);

-- Public read
create policy "public products"   on products        for select using (active = true);
create policy "public categories" on categories      for select using (true);
create policy "public images"     on product_images  for select using (true);

-- Admin bypass
create policy "admin all products" on products for all
  using (exists(select 1 from admins where user_id = auth.uid()));
