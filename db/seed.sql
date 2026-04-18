-- N16_Seed_Agent output — idempotent seed
insert into categories (slug, name) values
  ('apparel','Apparel'),('shoes','Shoes'),('accessories','Accessories')
on conflict (slug) do nothing;

insert into products (slug,name,description,price_cents,stock,category_id)
select s.slug, s.name, s.description, s.price_cents, s.stock,
       (select id from categories where slug = s.cat)
from (values
  ('tee-black','Essential Tee - Black','100% cotton crewneck.',2900,100,'apparel'),
  ('tee-white','Essential Tee - White','100% cotton crewneck.',2900,100,'apparel'),
  ('hoodie-grey','Heavyweight Hoodie','400gsm fleece, oversized fit.',7900,50,'apparel'),
  ('runner-01','Daily Runner','Lightweight mesh upper.',11900,40,'shoes'),
  ('trainer-02','Cross Trainer','Stable midsole for lifting.',13900,30,'shoes'),
  ('cap-classic','Classic Cap','6-panel, adjustable strap.',2500,80,'accessories'),
  ('tote-canvas','Canvas Tote','14oz canvas, reinforced handles.',3500,60,'accessories')
) as s(slug,name,description,price_cents,stock,cat)
on conflict (slug) do update set
  name = excluded.name, description = excluded.description,
  price_cents = excluded.price_cents, stock = excluded.stock;
