// Shipping quotes — seed a few zones; integrate with EasyPost/Shippo later for live rates
import { sbAdmin } from '@/lib/supabase';

export async function quoteShipping(countryCode: string, subtotalCents: number): Promise<{ rateCents: number; zone: string } | null> {
  const s = sbAdmin();
  const { data } = await s.from('shipping_zones').select('*').contains('countries', [countryCode]).limit(1).single();
  if (!data) return null;
  const rate = subtotalCents >= (data.free_over_cents ?? Infinity) ? 0 : data.rate_cents;
  return { rateCents: rate, zone: data.name };
}

// Seed zones (run once)
export const seedZones = `
insert into shipping_zones (name, countries, rate_cents, free_over_cents) values
  ('Egypt',       array['EG'],                       5000,  100000),
  ('GCC',         array['SA','AE','KW','QA','BH','OM'], 2500, 15000),
  ('North America', array['US','CA','MX'],            2500, 15000),
  ('Europe',      array['GB','DE','FR','ES','IT','NL','BE','IE','PL','PT','SE','DK','FI','NO','AT'], 2800, 18000),
  ('Rest of world', array[]::text[],                  4000, 25000)
on conflict do nothing;
`;
