// N5_Frontend_Agent output — Next.js 15 + Tailwind + shadcn/ui
// File tree:
//   app/layout.tsx
//   app/page.tsx            (home)
//   app/shop/page.tsx       (catalog + filters)
//   app/p/[slug]/page.tsx   (PDP + reviews)
//   app/cart/page.tsx
//   app/checkout/page.tsx
//   app/account/page.tsx
//   app/orders/page.tsx
//   components/ProductCard.tsx
//   components/CartButton.tsx

// ---------- app/layout.tsx ----------
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body className="min-h-screen bg-white text-neutral-900">
      <header className="border-b px-6 py-4 flex justify-between">
        <a href="/" className="font-semibold">SHOP</a>
        <nav className="flex gap-4">
          <a href="/shop">Shop</a><a href="/cart">Cart</a><a href="/account">Account</a>
        </nav>
      </header>
      <main className="max-w-6xl mx-auto p-6">{children}</main>
    </body></html>
  );
}

// ---------- app/shop/page.tsx ----------
'use client';
import { useEffect, useState } from 'react';
export default function Shop() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState(''); const [min, setMin] = useState(''); const [max, setMax] = useState('');
  useEffect(() => {
    const u = new URL('/api/search', location.origin);
    if (q) u.searchParams.set('q', q);
    if (min) u.searchParams.set('min', String(+min*100));
    if (max) u.searchParams.set('max', String(+max*100));
    fetch(u).then(r => r.json()).then(setItems);
  }, [q, min, max]);
  return (
    <div className="grid grid-cols-12 gap-6">
      <aside className="col-span-3 space-y-4">
        <input className="border w-full p-2 rounded" placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} />
        <div className="flex gap-2">
          <input className="border p-2 rounded w-1/2" placeholder="min $" value={min} onChange={e=>setMin(e.target.value)} />
          <input className="border p-2 rounded w-1/2" placeholder="max $" value={max} onChange={e=>setMax(e.target.value)} />
        </div>
      </aside>
      <section className="col-span-9 grid grid-cols-3 gap-6">
        {items.map(p => (
          <a key={p.id} href={`/p/${p.slug}`} className="border rounded-lg p-3 hover:shadow">
            <div className="aspect-square bg-neutral-100 rounded mb-3" />
            <div className="font-medium">{p.name}</div>
            <div className="text-sm text-neutral-500">${(p.price_cents/100).toFixed(2)}</div>
          </a>
        ))}
      </section>
    </div>
  );
}

// ---------- app/p/[slug]/page.tsx ----------
import { sb } from '@/lib/supabase';
export default async function PDP({ params }: { params: { slug: string } }) {
  const { data: p } = await sb().from('products')
    .select('*, product_images(url), reviews(rating,body,created_at)')
    .eq('slug', params.slug).single();
  if (!p) return <div>Not found</div>;
  const avg = p.reviews?.length ? (p.reviews.reduce((a:any,r:any)=>a+r.rating,0)/p.reviews.length).toFixed(1) : '—';
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="aspect-square bg-neutral-100 rounded-xl" />
      <div>
        <h1 className="text-2xl font-semibold">{p.name}</h1>
        <div className="text-neutral-500 mt-1">★ {avg} · {p.reviews?.length ?? 0} reviews</div>
        <div className="text-xl mt-3">${(p.price_cents/100).toFixed(2)}</div>
        <p className="mt-4 text-neutral-700">{p.description}</p>
        <form action={`/api/cart`} method="post" className="mt-6">
          <input type="hidden" name="product_id" value={p.id} />
          <button className="bg-black text-white px-6 py-3 rounded-lg">Add to cart</button>
        </form>
      </div>
    </div>
  );
}

// ---------- app/cart/page.tsx ----------
// Fetches /api/cart → renders lines → POST /api/checkout → redirect to Stripe URL.

// ---------- app/orders/page.tsx ----------
// Server component reading from Supabase with RLS.
