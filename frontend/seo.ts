// N18_SEO_Agent output
// app/sitemap.ts
import { sb } from '@/lib/supabase';
export default async function sitemap() {
  const { data } = await sb().from('products').select('slug,created_at').eq('active', true);
  const base = process.env.APP_URL!;
  return [
    { url: `${base}/`,     lastModified: new Date() },
    { url: `${base}/shop`, lastModified: new Date() },
    ...(data ?? []).map(p => ({ url: `${base}/p/${p.slug}`, lastModified: p.created_at })),
  ];
}

// app/robots.ts
export function robots() {
  return { rules: [{ userAgent: '*', allow: '/' }], sitemap: `${process.env.APP_URL}/sitemap.xml` };
}

// app/p/[slug]/page.tsx — JSON-LD Product schema
export function productJsonLd(p: any, avg: number, count: number) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    image: p.product_images?.map((i: any) => i.url),
    offers: { '@type': 'Offer', price: (p.price_cents/100).toFixed(2), priceCurrency: p.currency, availability: p.stock>0 ? 'InStock' : 'OutOfStock' },
    aggregateRating: count ? { '@type': 'AggregateRating', ratingValue: avg, reviewCount: count } : undefined,
  };
}
