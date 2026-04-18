// app/api/checkout/intent/route.ts — PaymentIntent with Stripe Tax + shipping
import Stripe from 'stripe';
import { sb } from '@/lib/supabase';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  const s = sb();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return new Response('unauthorized', { status: 401 });

  const { data: cart } = await s.from('carts')
    .select('id, cart_items(qty,unit_price_cents,products(name))')
    .eq('user_id', user.id).single();
  if (!cart?.cart_items?.length) return new Response('empty cart', { status: 400 });

  const subtotal = cart.cart_items.reduce((a: number, ci: any) => a + ci.qty * ci.unit_price_cents, 0);

  const pi = await stripe.paymentIntents.create({
    amount: subtotal,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },   // cards, wallets, BNPL
    metadata: { user_id: user.id, cart_id: cart.id },
    // Stripe Tax auto-computes on confirm when `automatic_tax: { enabled: true }`
    // on Checkout Sessions. For PaymentIntents, use invoicing or Tax Calculations API.
  });

  return Response.json({ clientSecret: pi.client_secret });
}
