// app/api/leads/route.ts — email capture endpoint
// Inserts into Supabase "leads" table + sends Resend welcome email
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!          // server-only service key
);

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'AuraJonad <hello@aura-jonad.com>';

export async function POST(req: NextRequest) {
  try {
    // ── Parse input (JSON or form-encoded) ──
    const ct = req.headers.get('content-type') ?? '';
    let email: string | null = null;
    let source: string = 'unknown';

    if (ct.includes('application/json')) {
      const body = await req.json();
      email  = body.email;
      source = body.source ?? 'unknown';
    } else {
      const form = await req.formData();
      email  = form.get('email') as string | null;
      source = (form.get('source') as string) ?? 'unknown';
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // ── Upsert into leads table ──
    const { error: dbErr } = await supabase
      .from('leads')
      .upsert(
        { email: email.toLowerCase().trim(), source, subscribed_at: new Date().toISOString() },
        { onConflict: 'email' }
      );

    if (dbErr) {
      console.error('[leads] DB error:', dbErr.message);
      return NextResponse.json({ error: 'Could not save lead' }, { status: 502 });
    }

    // ── Send welcome email via Resend (non-blocking) ──
    if (RESEND_KEY) {
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: email,
          subject: 'Your 10 AI Automations are here 🤖',
          html: welcomeHtml(email),
        }),
      }).catch(err => console.error('[leads] Resend error:', err));
    }

    // ── Redirect if form POST, else JSON ──
    if (!ct.includes('application/json')) {
      return NextResponse.redirect(new URL('/?subscribed=1', req.url));
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[leads] Unexpected:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ── Minimal welcome email ──
function welcomeHtml(email: string) {
  return `
<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#0A0A0B;color:#F5F7FA;padding:40px 20px;">
<div style="max-width:520px;margin:0 auto;">
  <h1 style="font-size:24px;margin:0;">Welcome to AuraJonad</h1>
  <p style="color:#8A8F98;margin-top:12px;">Here's your free starter pack:</p>
  <a href="https://aura-jonad.com/dl/10-automations" style="display:inline-block;margin-top:16px;padding:12px 24px;border-radius:6px;background:linear-gradient(135deg,#00E0D1,#6A5CFF);color:#000;font-weight:600;text-decoration:none;">
    Download the PDF + Workflow
  </a>
  <p style="color:#8A8F98;font-size:13px;margin-top:24px;">
    You'll get occasional operator-only emails from us.<br/>
    <a href="https://aura-jonad.com/api/unsubscribe?email=${encodeURIComponent(email)}" style="color:#00E0D1;">Unsubscribe</a>
  </p>
</div>
</body></html>`;
}
