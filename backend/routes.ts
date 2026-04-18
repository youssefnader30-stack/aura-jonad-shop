// N4_Backend_Agent output — Next.js 15 App Router API
// File tree:
//   app/api/products/route.ts
//   app/api/products/[slug]/route.ts
//   app/api/search/route.ts
//   app/api/cart/route.ts
//   app/api/checkout/route.ts
//   app/api/orders/route.ts
//   app/api/reviews/route.ts
//   app/api/stripe/webhook/route.ts
//   app/api/admin/products/route.ts

// ---------- lib/supabase.ts ----------
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
export const sb = () => createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { cookies: { get: (n) => cookies().get(n)?.value } }
);
export const sbAdmin = () => createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  { cookies: { get: () => undefined } }
);

// ---------- app/api/products/route.ts ----------
export async function GET() {
  const { data, error } = await sb().from('products')
    .select('id,slug,name,price_cents,product_images(url)')
    .eq('active', true).limit(50);
  return Response.json(error ? { error } : data);
}

// ---------- app/api/products/[slug]/route.ts ----------
export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const { data } = await sb().from('products')
    .select('*, product_images(*), reviews(rating,body,created_at)')
    .eq('slug', params.slug).single();
  return Response.json(data);
}

// ---------- app/api/search/route.ts ----------
export async function GET(req: Request) {
  const u = new URL(req.url);
  const q = u.searchParams.get('q') ?? '';
  const cat = u.searchParams.get('cat');
  const min = Number(u.searchParams.get('min') ?? 0);
  const max = Number(u.searchParams.get('max') ?? 9_999_999);
  const sort = u.searchParams.get('sort') ?? 'created_at.desc';
  let qb = sb().from('products').select('*').eq('active', true)
    .gte('price_cents', min).lte('price_cents', max);
  if (q)   qb = qb.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
  if (cat) qb = qb.eq('category_id', cat);
  const [col, dir] = sort.split('.');
  const { data } = await qb.order(col, { ascending: dir === 'asc' }).limit(50);
  return Response.json(data);
}

// ---------- app/api/cart/route.ts ----------
export async function POST(req: Request) {
  const { product_id, qty } = await req.json();
  const s = sb();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return new Response('unauthorized', { status: 401 });
  let { data: cart } = await s.from('carts').select('id').eq('user_id', user.id).single();
  if (!cart) cart = (await s.from('carts').insert({ user_id: user.id }).select().single()).data;
  const { data: p } = await s.from('products').select('price_cents,stock').eq('id', product_id).single();
  if (!p || p.stock < qty) return new Response('out of stock', { status: 400 });
  await s.from('cart_items').upsert({ cart_id: cart!.id, product_id, qty, unit_price_cents: p.price_cents });
  return Response.json({ ok: true });
}

// ---------- app/api/checkout/route.ts ----------
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
export async function POST() {
  const s = sb();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return new Response('unauthorized', { status: 401 });
  const { data: cart } = await s.from('carts').select('id, cart_items(qty,unit_price_cents,products(name,id))').eq('user_id', user.id).single();
  if (!cart?.cart_items?.length) return new Response('empty cart', { status: 400 });
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: cart.cart_items.map((ci: any) => ({
      price_data: { currency: 'usd', unit_amount: ci.unit_price_cents,
        product_data: { name: ci.products.name } },
      quantity: ci.qty,
    })),
    success_url: `${process.env.APP_URL}/orders?s={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${process.env.APP_URL}/cart`,
    metadata: { user_id: user.id, cart_id: cart.id },
  });
  return Response.json({ url: session.url });
}

// ---------- app/api/stripe/webhook/route.ts ----------
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!;
  const body = await req.text();
  const evt = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  if (evt.type === 'checkout.session.completed') {
    const s: any = evt.data.object;
    const admin = sbAdmin();
    const { data: cart } = await admin.from('carts').select('id, cart_items(*,products(name))').eq('id', s.metadata.cart_id).single();
    const { data: order } = await admin.from('orders').insert({
      user_id: s.metadata.user_id, status: 'paid',
      total_cents: s.amount_total, stripe_session_id: s.id,
      stripe_payment_intent: s.payment_intent
    }).select().single();
    await admin.from('order_items').insert(cart!.cart_items.map((ci: any) => ({
      order_id: order!.id, product_id: ci.product_id,
      name_snapshot: ci.products.name, unit_price_cents: ci.unit_price_cents, qty: ci.qty
    })));
    await admin.from('cart_items').delete().eq('cart_id', cart!.id);
  }
  return Response.json({ received: true });
}

// ---------- app/api/reviews/route.ts ----------
export async function POST(req: Request) {
  const { product_id, rating, body } = await req.json();
  const s = sb();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return new Response('unauthorized', { status: 401 });
  const { error } = await s.from('reviews').upsert({ product_id, user_id: user.id, rating, body });
  return error ? new Response(error.message, { status: 400 }) : Response.json({ ok: true });
}

// ---------- app/api/admin/products/route.ts ----------
export async function POST(req: Request) {
  const s = sb();
  const { data: { user } } = await s.auth.getUser();
  const { data: admin } = await s.from('admins').select('user_id').eq('user_id', user?.id).single();
  if (!admin) return new Response('forbidden', { status: 403 });
  const payload = await req.json();
  const { data, error } = await s.from('products').insert(payload).select().single();
  return error ? new Response(error.message, { status: 400 }) : Response.json(data);
}
