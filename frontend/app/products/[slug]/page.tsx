// app/products/[slug]/page.tsx — product detail page (static, from catalog JSON)
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import catalog from '../../../../catalog/products.json';

type Product = (typeof catalog.products)[number];

function find(slug: string): Product | undefined {
  return catalog.products.find(p => p.slug === slug);
}

// ── Static generation for all product slugs ──
export function generateStaticParams() {
  return catalog.products.map(p => ({ slug: p.slug }));
}

// ── Dynamic metadata per product ──
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = find(params.slug);
  if (!p) return { title: 'Product not found' };
  return {
    title: `${p.name} — AuraJonad`,
    description: p.tagline,
    openGraph: {
      title: p.name,
      description: p.description,
      siteName: 'AuraJonad',
      type: 'website',
    },
  };
}

// ── Checkout URL builder ──
function checkoutUrl(p: Product) {
  if (p.price_cents === 0) return '#free';                       // lead magnet → scroll to form
  if (p.kind === 'service') return 'mailto:support@aura-jonad.com?subject=' + encodeURIComponent(`Inquiry: ${p.name}`);
  // Digital paid → Lemon Squeezy (slug matching). Falls back to contact.
  return `https://aurajonad.lemonsqueezy.com/buy/${p.slug}`;
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const p = find(params.slug);
  if (!p) notFound();

  const price = p.price_cents === 0 ? 'Free' : `$${(p.price_cents / 100).toLocaleString()}`;
  const isService = p.kind === 'service';

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-[#F5F7FA] selection:bg-[#00E0D1] selection:text-black">
      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur bg-[#0A0A0B]/80 border-b border-[#1F1F24]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="AuraJonad" className="h-7" />
          </Link>
          <Link href="/#products" className="text-sm text-[#8A8F98] hover:text-white">
            ← Back to catalog
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#6A5CFF22_0%,_transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-6 pt-20 pb-16">
          <div className="flex items-center gap-3 text-sm">
            <span className="px-2 py-0.5 rounded-full border border-[#1F1F24] text-xs text-[#8A8F98] uppercase tracking-widest">
              {p.tier}
            </span>
            {isService && (
              <span className="px-2 py-0.5 rounded-full border border-[#FFB020]/40 text-xs text-[#FFB020] uppercase tracking-widest">
                Service
              </span>
            )}
          </div>
          <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight leading-[1.08]">
            {p.name}
          </h1>
          <p className="mt-4 text-lg md:text-xl text-[#8A8F98] max-w-2xl">{p.tagline}</p>

          <div className="mt-8 flex items-center gap-6">
            <span className="font-mono text-4xl">{price}</span>
            <a href={checkoutUrl(p)}
               className="px-8 py-3.5 rounded-md bg-gradient-to-r from-[#00E0D1] to-[#6A5CFF] text-black font-semibold text-lg">
              {p.cta}
            </a>
          </div>
        </div>
      </section>

      {/* DESCRIPTION */}
      <section className="border-t border-[#1F1F24] bg-[#0E0E10]">
        <div className="max-w-4xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold">What you get</h2>
            <p className="mt-4 text-[#8A8F98] leading-relaxed">{p.description}</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Includes</h2>
            <ul className="mt-4 space-y-3">
              {p.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-[#8A8F98]">
                  <span className="text-[#00E0D1] mt-0.5">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {p.deliverables && (
              <>
                <h3 className="mt-8 text-sm uppercase tracking-widest text-[#8A8F98]">Deliverables</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.deliverables.map((d, i) => (
                    <span key={i} className="px-3 py-1 rounded-full border border-[#1F1F24] text-xs text-[#8A8F98]">
                      {d}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* LEAD MAGNET FORM (only for free product) */}
      {p.price_cents === 0 && (
        <section id="free" className="max-w-4xl mx-auto px-6 py-16">
          <div className="rounded-2xl border border-[#00E0D1]/30 bg-gradient-to-br from-[#111114] to-[#0A0A0B] p-10">
            <h2 className="text-2xl font-bold">Get it now — free</h2>
            <form action="/api/leads" method="POST" className="mt-6 flex flex-col md:flex-row gap-3">
              <input name="email" type="email" required placeholder="you@company.com"
                     className="flex-1 px-4 py-3 rounded-md bg-[#0A0A0B] border border-[#1F1F24] text-white placeholder-[#8A8F98] focus:border-[#00E0D1] outline-none" />
              <input type="hidden" name="source" value={`product-${p.slug}`} />
              <button type="submit" className="px-6 py-3 rounded-md bg-gradient-to-r from-[#00E0D1] to-[#6A5CFF] text-black font-semibold">
                Send it to me
              </button>
            </form>
          </div>
        </section>
      )}

      {/* TRUST BAR */}
      <section className="border-t border-[#1F1F24]">
        <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm text-[#8A8F98]">
          <div><span className="text-white font-semibold">14-day</span> refund</div>
          <div><span className="text-white font-semibold">Lifetime</span> updates</div>
          <div><span className="text-white font-semibold">n8n</span> built-in</div>
          <div><span className="text-white font-semibold">Supabase</span> data layer</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#1F1F24]">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between gap-6 text-sm text-[#8A8F98]">
          <div>
            <img src="/logo.svg" alt="AuraJonad" className="h-6" />
            <div className="mt-3">© 2026 AuraJonad. Cairo, Egypt.</div>
          </div>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/refund-policy" className="hover:text-white">Refunds</Link>
            <a href="mailto:support@aura-jonad.com" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
