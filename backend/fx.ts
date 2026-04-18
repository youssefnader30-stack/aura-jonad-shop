// Multi-currency display — USD stored, show in customer's currency via daily FX
// Free provider: exchangerate.host · fallback: Frankfurter
import { sbAdmin } from '@/lib/supabase';

type FxTable = Record<string, number>;   // { EUR: 0.93, GBP: 0.79, EGP: 48.5, ... }

let cache: { at: number; rates: FxTable } | null = null;

export async function getRates(): Promise<FxTable> {
  if (cache && Date.now() - cache.at < 6 * 3600_000) return cache.rates;
  const r = await fetch('https://api.frankfurter.app/latest?from=USD');
  const j = await r.json();
  cache = { at: Date.now(), rates: { USD: 1, ...j.rates } };
  return cache.rates;
}

export async function convert(amountUsdCents: number, toCurrency: string): Promise<number> {
  const rates = await getRates();
  const rate = rates[toCurrency.toUpperCase()] ?? 1;
  return Math.round(amountUsdCents * rate);
}

// Country → currency fallback
export const countryCurrency: Record<string, string> = {
  US: 'USD', CA: 'CAD', MX: 'MXN', GB: 'GBP', EU: 'EUR', EG: 'EGP',
  AE: 'AED', SA: 'SAR', AU: 'AUD', JP: 'JPY', IN: 'INR',
};
