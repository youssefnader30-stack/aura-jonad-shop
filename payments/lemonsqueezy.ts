// Lemon Squeezy — merchant of record, handles VAT/tax, payouts to Payoneer
// No company required. 5% + $0.50 per transaction.
// Docs: https://docs.lemonsqueezy.com
import { createHmac, timingSafeEqual } from 'crypto';

const API = 'https://api.lemonsqueezy.com/v1';
const KEY = process.env.LEMON_API_KEY!;
const STORE_ID = process.env.LEMON_STORE_ID!;
const WEBHOOK_SECRET = process.env.LEMON_WEBHOOK_SECRET!;

// Create a hosted checkout URL for an LS variant
export async function createLemonCheckout(variantId: string, email?: string, customData?: Record<string, any>) {
  const r = await fetch(`${API}/checkouts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KEY}`,
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: { email, custom: customData ?? {} },
          product_options: { redirect_url: `${process.env.APP_URL}/orders/success` },
        },
        relationships: {
          store:    { data: { type: 'stores', id: STORE_ID } },
          variant:  { data: { type: 'variants', id: variantId } },
        },
      },
    }),
  });
  const j = await r.json();
  return j.data.attributes.url as string;
}

// Webhook handler
export async function verifyLemonSignature(rawBody: string, signature: string): Promise<boolean> {
  const mine = createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest();
  const theirs = Buffer.from(signature, 'hex');
  return mine.length === theirs.length && timingSafeEqual(mine, theirs);
}

// app/api/lemon/webhook/route.ts
export async function webhookRoute(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get('x-signature') ?? '';
  if (!(await verifyLemonSignature(raw, sig))) return new Response('bad sig', { status: 400 });
  const event = JSON.parse(raw);
  if (event.meta?.event_name === 'order_created') {
    // TODO: mark order paid, using event.meta.custom_data.cart_id
  }
  return Response.json({ received: true });
}
