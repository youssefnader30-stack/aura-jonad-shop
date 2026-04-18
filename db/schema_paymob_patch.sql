-- Patch orders table to support Paymob alongside Stripe
alter table orders add column if not exists paymob_order_id text;
alter table orders add column if not exists paymob_transaction_id text;
alter table orders add column if not exists payment_provider text check (payment_provider in ('stripe','paymob')) default 'paymob';
alter table orders alter column currency set default 'EGP';
create index if not exists idx_orders_paymob_tx on orders(paymob_transaction_id);
