'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabaseClient';

type Purchase = {
  id: string;
  email: string;
  product_name: string;
  product_id: string;
  gumroad_order_id: string;
  purchased_at: string;
  download_url: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setLoading(true);
      setError('');

      const { data: sessionData } = await supabase.auth.getSession();
      const activeSession = sessionData.session;

      if (!activeSession?.user.email) {
        router.replace('/login');
        return;
      }

      const cleanEmail = activeSession.user.email.toLowerCase();

      const { data, error: purchaseError } = await supabase
        .from('purchases')
        .select('id,email,product_name,product_id,gumroad_order_id,purchased_at,download_url')
        .eq('email', cleanEmail)
        .order('purchased_at', { ascending: false });

      if (!mounted) return;

      setSession(activeSession);

      if (purchaseError) {
        setError(purchaseError.message);
      } else {
        setPurchases((data ?? []) as Purchase[]);
      }

      setLoading(false);
    }

    loadDashboard();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!nextSession) router.replace('/login');
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  const email = useMemo(() => session?.user.email ?? '', [session]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-[#F5F7FA]">
      <header className="border-b border-[#1F1F24] bg-[#0A0A0B]/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-sm font-semibold tracking-wide text-white">
            AuraJonad
          </Link>
          <div className="flex items-center gap-4">
            {email && <span className="hidden text-sm text-[#8A8F98] sm:inline">{email}</span>}
            <button
              onClick={handleLogout}
              className="rounded-md border border-[#1F1F24] px-3 py-2 text-sm text-white hover:bg-[#111114]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col justify-between gap-6 border-b border-[#1F1F24] pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#00E0D1]">
              Customer Dashboard
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">My Products</h1>
            <p className="mt-3 max-w-2xl text-[#8A8F98]">
              Products shown here match purchase rows where the purchase email equals your logged-in email.
            </p>
          </div>
          <Link href="/#products" className="rounded-md bg-[#111114] px-4 py-3 text-sm font-medium text-[#00E0D1] hover:underline">
            Browse catalog
          </Link>
        </div>

        {loading && (
          <div className="mt-10 rounded-xl border border-[#1F1F24] bg-[#111114] p-6 text-[#8A8F98]">
            Loading purchased products...
          </div>
        )}

        {!loading && error && (
          <div className="mt-10 rounded-xl border border-[#FF4D6D]/30 bg-[#FF4D6D]/10 p-6 text-[#FF9BAD]">
            {error}
          </div>
        )}

        {!loading && !error && purchases.length === 0 && (
          <div className="mt-10 rounded-xl border border-[#1F1F24] bg-[#111114] p-8">
            <h2 className="text-2xl font-semibold">No products found for this email</h2>
            <p className="mt-3 max-w-2xl text-[#8A8F98]">
              Use the same email you used on Gumroad. If the purchase was recent, wait for
              the n8n purchase workflow to insert the row, then refresh.
            </p>
          </div>
        )}

        {!loading && !error && purchases.length > 0 && (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {purchases.map((purchase) => (
              <article key={purchase.id} className="rounded-xl border border-[#1F1F24] bg-[#111114] p-6">
                <div className="text-xs uppercase tracking-[0.18em] text-[#8A8F98]">
                  {purchase.product_id}
                </div>
                <h2 className="mt-3 text-2xl font-semibold">{purchase.product_name}</h2>
                <p className="mt-2 text-sm text-[#8A8F98]">
                  Gumroad order: {purchase.gumroad_order_id}
                </p>
                <p className="mt-1 text-sm text-[#8A8F98]">
                  Purchased {new Date(purchase.purchased_at).toLocaleDateString()}
                </p>
                {purchase.download_url ? (
                  <a
                    href={purchase.download_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-gradient-to-r from-[#00E0D1] to-[#6A5CFF] px-4 py-3 font-semibold text-black hover:opacity-90"
                  >
                    Download
                  </a>
                ) : (
                  <div className="mt-6 rounded-md border border-[#1F1F24] px-4 py-3 text-center text-sm text-[#8A8F98]">
                    Download link pending
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
