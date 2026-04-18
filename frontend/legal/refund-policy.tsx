// app/refund-policy/page.tsx
export const metadata = { title: 'Refund Policy — AuraJonad' };

export default function RefundPolicy() {
  return (
    <article className="prose prose-invert max-w-3xl mx-auto py-10 px-6">
      <h1>Refund Policy</h1>
      <p><em>Last updated: 2026-04-18</em></p>

      <h2>1. Digital Products</h2>
      <p>We offer a <strong>14-day refund</strong> on digital products if you have not accessed the
      deliverable. "Accessed" means: downloaded a file, opened a Notion template via the shared link,
      redeemed a license key, or watched more than 25% of a video.</p>
      <p>After access, digital products are non-refundable. This is standard policy for digital goods
      and consistent with payment network and marketplace rules.</p>

      <h2>2. Services (Audits &amp; Done-For-You Builds)</h2>
      <p>Services are refundable in full <strong>until the first working session begins</strong> (typically
      the diagnostic Zoom call). After the first session, we cannot offer a refund because work has
      started, but we will deliver what was contracted or substitute an equivalent scope you agree to.</p>

      <h2>3. Technical Issues</h2>
      <p>If a file won't open, a workflow import fails, or a video won't play, contact us within
      <strong>48 hours</strong> with a screenshot. We'll fix it or issue a full refund, your choice.</p>

      <h2>4. Incorrect Purchases</h2>
      <p>If you bought the wrong product and have not accessed it, email us within 14 days and we'll
      swap it for the correct one or refund the difference.</p>

      <h2>5. How to Request</h2>
      <ol>
        <li>Email <a href="mailto:support@aura-jonad.com">support@aura-jonad.com</a> with your order number.</li>
        <li>We respond within 2 business days.</li>
        <li>Approved refunds are issued within <strong>5–7 business days</strong> to the original payment method.</li>
      </ol>

      <h2>6. Chargebacks</h2>
      <p>Please contact us first. Opening a chargeback without prior contact may result in loss of
      access to licensed products and future orders.</p>

      <h2>7. Contact</h2>
      <p>support@aura-jonad.com</p>
    </article>
  );
}
