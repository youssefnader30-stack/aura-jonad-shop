// app/api/leads/route.ts — email capture endpoint
// Inserts into Supabase "leads" table + sends Resend welcome/early-access email
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'AuraJonad <hello@aura-jonad.com>';

// Map source tags to product names for email copy
const PRODUCT_NAMES: Record<string, string> = {
  'early-access-ai-automation-starter-kit': 'AI Automation Starter Kit',
  'early-access-business-ops-prompt-vault': 'Business Ops Prompt Vault',
  'early-access-chatbot-in-a-box': 'Chatbot-in-a-Box',
  'early-access-freelancer-ops-stack': 'Freelancer Ops Stack',
};

export async function POST(req: NextRequest) {
  try {
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

    const cleanEmail = email.toLowerCase().trim();
    const isEarlyAccess = source.startsWith('early-access-');
    const interestedProduct = isEarlyAccess ? source.replace('early-access-', '') : null;

    // ── Upsert into leads table ──
    const { error: dbErr } = await supabase
      .from('leads')
      .upsert(
        {
          email: cleanEmail,
          source,
          interested_product: interestedProduct,
          tag: isEarlyAccess ? 'early_access_30off' : 'free_lead',
          subscribed_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      );

    if (dbErr) {
      console.error('[leads] DB error:', dbErr.message);
      // Fallback: try without extra columns if leads table doesn't have them yet
      const { error: dbErr2 } = await supabase
        .from('leads')
        .upsert(
          { email: cleanEmail, source, subscribed_at: new Date().toISOString() },
          { onConflict: 'email' }
        );
      if (dbErr2) {
        console.error('[leads] DB fallback error:', dbErr2.message);
        return NextResponse.json({ error: 'Could not save lead' }, { status: 502 });
      }
    }

    // ── Send appropriate email via Resend ──
    if (RESEND_KEY) {
      const productName = PRODUCT_NAMES[source];
      const emailPayload = isEarlyAccess && productName
        ? {
            from: FROM_EMAIL,
            to: cleanEmail,
            subject: `You're on the priority list — 30% off ${productName} 🔥`,
            html: earlyAccessHtml(cleanEmail, productName),
          }
        : {
            from: FROM_EMAIL,
            to: cleanEmail,
            subject: 'Your 10 AI Automations are here 🤖',
            html: welcomeHtml(cleanEmail),
          };

      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload),
      }).catch(err => console.error('[leads] Resend error:', err));
    }

    // ── Redirect based on source ──
    if (!ct.includes('application/json')) {
      const redirectUrl = isEarlyAccess
        ? `/?early_access=1&product=${interestedProduct}`
        : '/?subscribed=1';
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
    return NextResponse.json({ ok: true, early_access: isEarlyAccess });
  } catch (err) {
    console.error('[leads] Unexpected:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ── Free lead magnet email ──
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

// ── Early access email with discount promise ──
function earlyAccessHtml(email: string, productName: string) {
  return `
<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#0A0A0B;color:#F5F7FA;padding:40px 20px;">
<div style="max-width:520px;margin:0 auto;">
  <h1 style="font-size:24px;margin:0;">You're on the priority list 🔥</h1>
  <p style="color:#8A8F98;margin-top:12px;">
    You've locked in <strong style="color:#00E0D1;">30% off</strong> the <strong style="color:#F5F7FA;">${productName}</strong>.
  </p>
  <p style="color:#8A8F98;margin-top:8px;">
    We're launching checkout in the next 24–48 hours. The moment it's live, you'll get an email with your exclusive discount code.
  </p>
  <div style="margin-top:24px;padding:16px;border-radius:8px;border:1px solid #00E0D133;background:#111114;">
    <div style="font-size:12px;color:#00E0D1;text-transform:uppercase;letter-spacing:2px;">What happens next</div>
    <p style="color:#8A8F98;font-size:14px;margin-top:8px;">
      1. We verify our payment processor (24–48h)<br/>
      2. You get your 30% discount code via email<br/>
      3. You grab ${productName} at the lowest price it'll ever be
    </p>
  </div>
  <p style="color:#8A8F98;font-size:13px;margin-top:24px;">
    Reply to this email if you have questions. We read everything.<br/><br/>
    — The AuraJonad team<br/>
    <a href="https://aura-jonad.com/api/unsubscribe?email=${encodeURIComponent(email)}" style="color:#00E0D1;font-size:12px;">Unsubscribe</a>
  </p>
</div>
</body></html>`;
}
