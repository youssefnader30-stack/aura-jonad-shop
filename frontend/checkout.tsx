// app/checkout/page.tsx — Stripe Elements checkout (international)
'use client';
import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, AddressElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  useEffect(() => {
    fetch('/api/checkout/intent', { method: 'POST' })
      .then(r => r.json())
      .then(d => setClientSecret(d.clientSecret));
  }, []);
  if (!clientSecret) return <div>Loading…</div>;
  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
      <CheckoutForm />
    </Elements>
  );
}

function CheckoutForm() {
  const stripe = useStripe(); const elements = useElements();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!stripe || !elements) return;
    setBusy(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/orders/success` },
    });
    if (error) { setErr(error.message ?? 'payment failed'); setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="max-w-xl mx-auto space-y-6 py-8">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <section>
        <h2 className="text-sm font-medium mb-2 text-neutral-600">Shipping address</h2>
        <AddressElement options={{ mode: 'shipping', allowedCountries: [] /* all */ }} />
      </section>
      <section>
        <h2 className="text-sm font-medium mb-2 text-neutral-600">Payment</h2>
        <PaymentElement options={{ layout: 'tabs' }} />
      </section>
      {err && <div className="text-red-600 text-sm">{err}</div>}
      <button disabled={!stripe || busy} className="w-full bg-black text-white py-3 rounded-lg disabled:opacity-50">
        {busy ? 'Processing…' : 'Pay now'}
      </button>
    </form>
  );
}
