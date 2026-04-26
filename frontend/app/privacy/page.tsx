// app/privacy/page.tsx
export const metadata = { title: 'Privacy Policy — AuraJonad' };

export default function Privacy() {
  return (
    <article className="prose prose-invert max-w-3xl mx-auto py-10 px-6">
      <h1>Privacy Policy</h1>
      <p><em>Last updated: 2026-04-18</em></p>

      <h2>1. Who This Applies To</h2>
      <p>This policy covers visitors, leads, and customers of aura-jonad.com. AuraJonad is the data
      controller. For international customers, Lemon Squeezy acts as a separate data controller for
      payment and tax data — see their privacy policy for that scope.</p>

      <h2>2. Data We Collect</h2>
      <ul>
        <li><strong>Account data:</strong> name, email, password hash, country.</li>
        <li><strong>Order data:</strong> items purchased, purchase timestamp, license keys issued,
        download/access logs, booking times for services.</li>
        <li><strong>Payment data:</strong> processed by Paymob (Egypt) or Lemon Squeezy (international).
        We never see or store full card numbers. We receive last-4, brand, country, and a tokenized
        reference only.</li>
        <li><strong>Lead data:</strong> email and source tag (from free lead magnets and newsletter forms).</li>
        <li><strong>Support data:</strong> messages you send us, chat transcripts, screenshots you attach.</li>
        <li><strong>Technical data:</strong> IP address, device, browser, pages viewed, event actions
        (via GA4 and, if enabled, Meta Pixel).</li>
      </ul>

      <h2>3. How We Use It</h2>
      <ul>
        <li>Deliver digital products (license keys, signed download URLs, Notion shares).</li>
        <li>Schedule and run service calls (audits, builds).</li>
        <li>Send order receipts, license delivery, and service onboarding emails.</li>
        <li>With your consent, send marketing emails, product updates, and launch notifications.</li>
        <li>Improve the website, measure funnel performance, and fix bugs.</li>
        <li>Detect fraud, abuse, chargebacks, and comply with legal requests.</li>
      </ul>

      <h2>4. Who We Share With</h2>
      <ul>
        <li><strong>Paymob</strong> — payment processing for Egypt.</li>
        <li><strong>Lemon Squeezy</strong> — merchant of record for international orders (handles VAT and sales tax).</li>
        <li><strong>Supabase, Vercel, Cloudflare, Resend</strong> — infrastructure, hosting, email delivery.</li>
        <li><strong>Google Analytics 4 / Meta</strong> — analytics and ad measurement, if you consent to non-essential cookies.</li>
        <li><strong>Notion, Loom, Zoom</strong> — delivery of specific product components (templates, walkthroughs, calls).</li>
        <li><strong>Authorities</strong> — only if legally required.</li>
      </ul>
      <p>We never sell your personal data.</p>

      <h2>5. Cookies &amp; Tracking</h2>
      <p>Essential cookies power login, cart, and checkout. Analytics cookies (GA4) and marketing pixels
      (Meta) only load after you accept non-essential cookies in our banner. You can withdraw consent
      at any time via the cookie settings link in the footer.</p>

      <h2>6. Your Rights</h2>
      <p>You can request access, correction, export, or deletion of your data, or object to processing,
      by emailing <a href="mailto:privacy@aura-jonad.com">privacy@aura-jonad.com</a>. We respond within
      30 days. EU/UK residents have rights under GDPR; California residents have rights under CCPA.</p>

      <h2>7. Data Retention</h2>
      <p>Account and purchase records are kept for 7 years to comply with Egyptian commercial and tax
      law and to honor lifetime-license obligations. Lead emails are kept until you unsubscribe.
      Analytics data is retained per GA4 defaults (14 months).</p>

      <h2>8. Security</h2>
      <p>HTTPS everywhere, encrypted database at rest, row-level security, signed short-lived URLs for
      digital deliveries, and scoped staff access. No system is 100% secure; if a breach affects your
      data, we will notify you and the appropriate authority within 72 hours.</p>

      <h2>9. International Transfers</h2>
      <p>Your data is processed outside Egypt (Supabase EU, Vercel, Lemon Squeezy US, Paymob Egypt).
      We rely on standard contractual clauses and vendor DPAs to protect it.</p>

      <h2>10. Children</h2>
      <p>We do not knowingly collect data from anyone under 18 and do not market to minors.</p>

      <h2>11. Changes</h2>
      <p>We may update this policy. Material changes are emailed to registered users and posted here
      with a new "Last updated" date.</p>

      <h2>12. Contact</h2>
      <p>privacy@aura-jonad.com</p>
    </article>
  );
}
