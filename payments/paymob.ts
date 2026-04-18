// Paymob integration (Egypt) — replaces Stripe for Path A
// Docs: https://docs.paymob.com
import { sbAdmin } from '@/lib/supabase';

const API = 'https://accept.paymob.com/api';
const API_KEY = process.env.PAYMOB_API_KEY!;
const INTEGRATION_ID_CARD = process.env.PAYMOB_INTEGRATION_ID_CARD!;   // Visa/Mastercard/Meeza
const INTEGRATION_ID_WALLET = process.env.PAYMOB_INTEGRATION_ID_WALLET!; // Vodafone/Orange Cash
const INTEGRATION_ID_INSTALL = process.env.PAYMOB_INTEGRATION_ID_INSTALL!; // valU / aman / forsa
const IFRAME_ID = process.env.PAYMOB_IFRAME_ID!;
const HMAC = process.env.PAYMOB_HMAC!;

// 1) Auth → token
async function authToken() {
  const r = await fetch(`${API}/auth/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: API_KEY }),
  });
  const { token } = await r.json();
  return token as string;
}

// 2) Register order
async function registerOrder(token: string, amountCents: number, merchantOrderId: string, items: any[]) {
  const r = await fetch(`${API}/ecommerce/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: token,
      delivery_needed: false,
      amount_cents: amountCents,
      currency: 'EGP',
      merchant_order_id: merchantOrderId,
      items,
    }),
  });
  return await r.json();
}

// 3) Get payment key (per integration: card/wallet/installments)
async function paymentKey(token: string, amountCents: number, orderId: string, billing: any, integrationId: string) {
  const r = await fetch(`${API}/acceptance/payment_keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: token,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: orderId,
      billing_data: billing,
      currency: 'EGP',
      integration_id: Number(integrationId),
    }),
  });
  const { token: payToken } = await r.json();
  return payToken as string;
}

// PUBLIC: create a checkout session
export async function createCheckout(opts: {
  amountCents: number;
  merchantOrderId: string;
  items: any[];
  billing: { first_name: string; last_name: string; email: string; phone_number: string;
             city: string; country: 'EG'; street: string; apartment: string; floor: string;
             building: string; postal_code: string; shipping_method: string; state: string };
  method: 'card' | 'wallet' | 'installments';
}) {
  const token = await authToken();
  const order = await registerOrder(token, opts.amountCents, opts.merchantOrderId, opts.items);
  const integration = opts.method === 'wallet' ? INTEGRATION_ID_WALLET
                    : opts.method === 'installments' ? INTEGRATION_ID_INSTALL
                    : INTEGRATION_ID_CARD;
  const payToken = await paymentKey(token, opts.amountCents, order.id, opts.billing, integration);
  return {
    iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/${IFRAME_ID}?payment_token=${payToken}`,
    paymobOrderId: order.id,
  };
}

// HMAC verification for webhook (Paymob "transaction processed callback")
import { createHmac } from 'crypto';
export function verifyHmac(body: any): boolean {
  const keys = ['amount_cents','created_at','currency','error_occured','has_parent_transaction',
    'id','integration_id','is_3d_secure','is_auth','is_capture','is_refunded','is_standalone_payment',
    'is_voided','order.id','owner','pending','source_data.pan','source_data.sub_type','source_data.type','success'];
  const concat = keys.map(k => {
    const path = k.split('.');
    let v: any = body.obj; for (const p of path) v = v?.[p];
    return String(v);
  }).join('');
  const mine = createHmac('sha512', HMAC).update(concat).digest('hex');
  return mine === body.hmac;
}

// app/api/paymob/webhook/route.ts
export async function webhook(req: Request) {
  const url = new URL(req.url);
  const body = await req.json();
  const hmac = url.searchParams.get('hmac') ?? body.hmac;
  if (!verifyHmac({ ...body, hmac })) return new Response('bad hmac', { status: 400 });
  const tx = body.obj;
  if (tx.success && !tx.is_refunded) {
    const admin = sbAdmin();
    await admin.from('orders').update({
      status: 'paid',
      paymob_transaction_id: tx.id,
    }).eq('id', tx.order.merchant_order_id);
  }
  return Response.json({ received: true });
}
