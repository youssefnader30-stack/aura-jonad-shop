// N6_Payments_Agent output
// Stripe config + helpers. Checkout session + webhook are in backend/routes.ts.
import Stripe from 'stripe';
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export const toCheckoutLineItems = (items: { name: string; price_cents: number; qty: number }[]) =>
  items.map(i => ({
    price_data: { currency: 'usd', unit_amount: i.price_cents, product_data: { name: i.name } },
    quantity: i.qty,
  }));

export const WEBHOOK_EVENTS = [
  'checkout.session.completed',
  'charge.refunded',
  'payment_intent.payment_failed',
];
