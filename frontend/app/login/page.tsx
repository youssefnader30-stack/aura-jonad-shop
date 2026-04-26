'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/dashboard');
    });
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const cleanEmail = email.toLowerCase().trim();

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      setMessage('Magic link sent. Open the email on this device to access your dashboard.');
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-[#F5F7FA]">
      <header className="border-b border-[#1F1F24] bg-[#0A0A0B]/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-sm font-semibold tracking-wide text-white">
            AuraJonad
          </Link>
          <Link href="/dashboard" className="text-sm text-[#00E0D1] hover:underline">
            Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-5xl items-center gap-10 px-6 py-12 md:grid-cols-[1fr_420px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#00E0D1]">
            Customer Portal
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight md:text-6xl">
            Access your purchased products.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[#8A8F98]">
            Enter the same email used at checkout. We will send a secure magic link,
            then match your dashboard to purchase records for that email.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-[#1F1F24] bg-[#111114] p-6 shadow-2xl">
          <div className="rounded-lg border border-[#1F1F24] bg-[#0A0A0B] px-4 py-3 text-sm text-[#8A8F98]">
            Magic link login only. No password required.
          </div>

          <label className="mt-6 block text-sm font-medium text-white" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-md border border-[#1F1F24] bg-[#0A0A0B] px-4 py-3 text-white outline-none transition focus:border-[#00E0D1]"
            placeholder="you@example.com"
          />

          {message && (
            <div className="mt-5 rounded-md border border-[#00E0D1]/30 bg-[#00E0D1]/10 px-4 py-3 text-sm text-[#00E0D1]">
              {message}
            </div>
          )}
          {error && (
            <div className="mt-5 rounded-md border border-[#FF4D6D]/30 bg-[#FF4D6D]/10 px-4 py-3 text-sm text-[#FF8EA2]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-md bg-gradient-to-r from-[#00E0D1] to-[#6A5CFF] px-4 py-3 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send magic link'}
          </button>

          <p className="mt-4 text-center text-xs leading-5 text-[#8A8F98]">
            Supabase Auth creates or reuses the auth user for this email.
          </p>
        </form>
      </section>
    </main>
  );
}
