// app/api/blast/early-access/route.ts
// ONE-TIME blast: sends 30% discount to all early-access leads
// Trigger: POST /api/blast/early-access with Authorization header
// Usage: call once when Lemon Squeezy is verified
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const RESEND_KEY = process.env.RESEND_API_KEY!;
const FROM_EMAIL = 'AuraJonad <hello@aura-jonad.com>';
const BLAST_SECRET = process.env.BLAST_SECRET || 'aurajonad_blast_2026';

// Lemon Squeezy checkout URLs — replace with your actual product checkout links
const CHECKOUT_LINKS: Record<string, { name: string; price: string; discounted: string; url: string }> = {
  'ai-automation-starter-kit': {
    name: 'AI Automation Starter Kit',
    price: '$27',
    discounted: '$18.90',
    url: 'https://aurajonad.lemonsqueezy.com/buy/ai-automation-starter-kit?discount=EARLYBIRD30',
  },
  'business-ops-prompt-vault': {
    name: 'Business Ops Prompt Vault',
    price: '$47',
    discounted: '$32.90',
    url: 'https://aurajonad.lemonsqueezy.com/buy/business-ops-prompt-vault?discount=EARLYBIRD30',
  },
  'chatbot-in-a-box': {
    name: 'Chatbot-in-a-Box',
    price: '$97',
    discounted: '$67.90',
    url: 'https://aurajonad.lemonsqueezy.com/buy/chatbot-in-a-box?discount=EARLYBIRD30',
  },
  'freelancer-ops-stack': {
    name: 'Freelancer Ops Stack',
    price: '$147',
    discounted: '$102.90',
    url: 'https://aurajonad.lemonsqueezy.com/buy/freelancer-ops-stack?discount=EARLYBIRD30',
  },
};

export async function POST(req: NextRequest) {
  // ── Auth check ──
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${BLAST_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Fetch all early-access leads ──
  const { data: leads, error } = await supabase
    .from('leads')
    .select('email, interested_product')
    .eq('tag', 'early_access_30off');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!leads || leads.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No early-access leads found' });
  }

  // ── Send emails ──
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const lead of leads) {
    const product = lead.interested_product ? CHECKOUT_LINKS[lead.interested_product] : null;

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: lead.email,
          subject: 'Checkout is open — your 30% discount is inside 🔥',
          html: blastHtml(lead.email, product),
        }),
      });

      if (res.ok) {
        sent++;
      } else {
        failed++;
        errors.push(`${lead.email}: ${res.status}`);
      }
    } catch (err: any) {
      failed++;
      errors.push(`${lead.email}: ${err.message}`);
    }

    // Rate limit: 2 emails/sec to stay within Resend free tier
    await new Promise(r => setTimeout(r, 500));
  }

  // ── Mark leads as blasted ──
  await supabase
    .from('leads')
    .update({ tag: 'early_access_blasted' })
    .eq('tag', 'early_access_30off');

  return NextResponse.json({ sent, failed, total: leads.length, errors: errors.slice(0, 10) });
}

function blastHtml(
  email: string,
  product: { name: string; price: string; discounted: string; url: string } | null
) {
  // Build product-specific or all-products block
  const productBlock = product
    ? `
      <div style="margin-top:20px;padding:20px;border-radius:8px;border:1px solid #00E0D133;background:#111114;">
        <div style="font-size:18px;font-weight:600;color:#F5F7FA;">${product.name}</div>
        <div style="margin-top:8px;color:#8A8F98;">
          <span style="text-decoration:line-through;">${product.price}</span>
          <span style="color:#00E0D1;font-weight:700;font-size:20px;margin-left:8px;">${product.discounted}</span>
        </div>
        <a href="${product.url}" style="display:inline-block;margin-top:16px;padding:14px 28px;border-radius:6px;background:linear-gradient(135deg,#00E0D1,#6A5CFF);color:#000;font-weight:700;text-decoration:none;font-size:16px;">
          Claim your 30% off →
        </a>
      </div>`
    : `
      <div style="margin-top:20px;">
        ${Object.values(CHECKOUT_LINKS).map(p => `
          <div style="margin-bottom:16px;padding:16px;border-radius:8px;border:1px solid #1F1F24;background:#111114;">
            <div style="font-weight:600;color:#F5F7FA;">${p.name}</div>
            <div style="margin-top:4px;color:#8A8F98;">
              <span style="text-decoration:line-through;">${p.price}</span>
              <span style="color:#00E0D1;font-weight:700;margin-left:8px;">${p.discounted}</span>
            </div>
            <a href="${p.url}" style="display:inline-block;margin-top:10px;padding:10px 20px;border-radius:6px;background:linear-gradient(135deg,#00E0D1,#6A5CFF);color:#000;font-weight:600;text-decoration:none;font-size:14px;">
              Get it now →
            </a>
          </div>
        `).join('')}
      </div>`;

  return `
<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#0A0A0B;color:#F5F7FA;padding:40px 20px;">
<div style="max-width:520px;margin:0 auto;">
  <h1 style="font-size:26px;margin:0;">You made it in early.</h1>
  <p style="color:#8A8F98;margin-top:16px;font-size:16px;line-height:1.6;">
    Checkout is now open.<br/>
    Here's your 30% discount — <strong style="color:#F5F7FA;">expires in 24 hours.</strong>
  </p>

  ${productBlock}

  <div style="margin-top:28px;padding:16px;border-radius:8px;background:#1A0A0A;border:1px solid #FF4D4D33;">
    <div style="color:#FF6B6B;font-size:13px;font-weight:600;">⏰ This won't be extended.</div>
    <div style="color:#8A8F98;font-size:13px;margin-top:4px;">
      After 24 hours, prices go back to full. No exceptions.
    </div>
  </div>

  <p style="color:#8A8F98;font-size:13px;margin-top:28px;">
    — The AuraJonad team<br/><br/>
    <a href="https://aura-jonad.com/api/unsubscribe?email=${encodeURIComponent(email)}" style="color:#00E0D1;font-size:12px;">Unsubscribe</a>
  </p>
</div>
</body></html>`;
}
