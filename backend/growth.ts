// Phase 3 growth modules
import { sbAdmin } from '@/lib/supabase';
import { sendOrderConfirmation } from './emails';
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY!);

// ---- Loyalty (idempotent per order) ----
export async function awardLoyalty(userId: string, orderId: string, totalCents: number) {
  const delta = Math.floor(totalCents / 100);
  const s = sbAdmin();
  const { error } = await s.from('loyalty_ledger').insert({ user_id: userId, order_id: orderId, delta, reason: 'purchase' });
  if (error?.code === '23505') return; // already awarded
  await s.rpc('increment_points', { u: userId, d: delta });
  const { data: pts } = await s.from('loyalty_points').select('points').eq('user_id', userId).single();
  if (pts && pts.points >= 500) {
    const code = `LOY-${crypto.randomUUID().slice(0,8).toUpperCase()}`;
    await s.from('discount_codes').insert({ code, user_id: userId, percent_off: 10,
      expires_at: new Date(Date.now()+90*864e5).toISOString() });
    await s.rpc('deduct_points', { u: userId, d: 500 });
  }
}

// ---- Cart recovery scheduler (called by cron) ----
export async function runCartRecovery() {
  const s = sbAdmin();
  const stages = [
    { stage: 1, hours: 1  },
    { stage: 2, hours: 24 },
    { stage: 3, hours: 72 },
  ];
  for (const { stage, hours } of stages) {
    const cutoff = new Date(Date.now() - hours*36e5).toISOString();
    const { data } = await s.rpc('abandoned_carts', { before: cutoff, stage });
    for (const row of data ?? []) {
      await resend.emails.send({
        from: 'cart@shop.example.com', to: row.email,
        subject: stage === 3 ? 'Last chance — your cart' : 'Forget something?',
        html: `<p>You left items in your cart. <a href="${process.env.APP_URL}/cart">Resume checkout</a>.</p>`,
      });
      await s.from('cart_recovery_sends').insert({ cart_id: row.cart_id, stage });
    }
  }
}

// ---- Fraud screening ----
export function fraudScore(o: any): { score: number; reasons: string[] } {
  const reasons: string[] = []; let score = o.stripe_radar_score ?? 0;
  if (o.billing_country !== o.shipping_country) { score += 15; reasons.push('country_mismatch'); }
  if (/(^|@)(mailinator|tempmail|guerrilla)/.test(o.email)) { score += 20; reasons.push('disposable_email'); }
  if (o.orders_last_hour > 2) { score += 25; reasons.push('velocity'); }
  if (o.total_cents > 100000) { score += 10; reasons.push('high_value'); }
  return { score: Math.min(100, score), reasons };
}

// ---- Experiment allocation (deterministic) ----
import { createHash } from 'crypto';
export function variantFor(userId: string, key: string, variants: string[]): string {
  const h = createHash('md5').update(`${userId}:${key}`).digest('hex').slice(0,8);
  return variants[parseInt(h,16) % variants.length];
}

// ---- Reorder suggestion ----
export async function computeReorders() {
  const s = sbAdmin();
  const { data: low } = await s.from('products').select('id,stock').lte('stock', 5);
  for (const p of low ?? []) {
    const { data: v } = await s.rpc('velocity_30d', { pid: p.id });
    const qty = Math.max(10, Math.ceil((v ?? 1) * 14)); // 14-day cover
    await s.from('reorder_drafts').upsert({ product_id: p.id, suggested_qty: qty, velocity_30d: v });
  }
}
