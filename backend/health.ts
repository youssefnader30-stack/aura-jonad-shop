// app/api/health/route.ts — consumed by N15_Health_Agent
import { sb } from '@/lib/supabase';
export async function GET() {
  const checks: Record<string, any> = { ts: new Date().toISOString() };
  try {
    const { error } = await sb().from('products').select('id').limit(1);
    checks.db = error ? { ok: false, error: error.message } : { ok: true };
  } catch (e: any) { checks.db = { ok: false, error: e.message }; }
  try {
    const r = await fetch('https://api.stripe.com/v1/balance', {
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` }
    });
    checks.stripe = { ok: r.ok, status: r.status };
  } catch (e: any) { checks.stripe = { ok: false, error: e.message }; }
  const ok = Object.values(checks).every((v: any) => v === undefined || v.ok !== false);
  return Response.json({ status: ok ? 200 : 503, checks }, { status: ok ? 200 : 503 });
}
