// app/page.tsx — AuraJonad landing
import Link from 'next/link';

const PRODUCTS = [
  { slug:'free-10-automations',       name:'10 AI Automations',          tagline:'5 hours/week back, for free.',               price:'$0',    tier:'Free',   cta:'Get it free' },
  { slug:'ai-automation-starter-kit', name:'Automation Starter Kit',     tagline:'7 n8n workflows. 20-min walkthrough.',       price:'$27',   tier:'Entry',  cta:'Grab the kit' },
  { slug:'business-ops-prompt-vault', name:'Ops Prompt Vault',           tagline:'80 prompts. 5 departments. No fluff.',       price:'$47',   tier:'Core',   cta:'Unlock' },
  { slug:'chatbot-in-a-box',          name:'Chatbot-in-a-Box',           tagline:'RAG chatbot. Deploy in 1 hour.',             price:'$97',   tier:'Core',   cta:'Ship it' },
  { slug:'freelancer-ops-stack',      name:'Freelancer Ops Stack',       tagline:'Your whole freelance biz, automated.',       price:'$147',  tier:'Core',   cta:'Install' },
  { slug:'automation-audit-dfy',      name:'Audit + DFY Build',          tagline:'60-min audit + 1 custom workflow in 7 days.', price:'$497',  tier:'Service', cta:'Book an audit', featured:true },
  { slug:'ai-automation-transformation', name:'Full Transformation',    tagline:'Audit + 5 workflows + 90 days support.',     price:'$1,497',tier:'Service', cta:'Apply' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0A0B] text-[#F5F7FA] selection:bg-[#00E0D1] selection:text-black">
      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur bg-[#0A0A0B]/80 border-b border-[#1F1F24]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="AuraJonad" className="h-7" />
          </Link>
          <nav className="hidden md:flex gap-7 text-sm text-[#8A8F98]">
            <a href="#products" className="hover:text-white">Products</a>
            <a href="#services" className="hover:text-white">Services</a>
            <a href="#method"   className="hover:text-white">Method</a>
            <a href="#faq"      className="hover:text-white">FAQ</a>
          </nav>
          <Link href="#products" className="px-4 py-2 rounded-md bg-gradient-to-r from-[#00E0D1] to-[#6A5CFF] text-black font-semibold text-sm">
            Start
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#6A5CFF22_0%,_transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-block px-3 py-1 rounded-full border border-[#1F1F24] text-xs text-[#8A8F98] mb-6">
            <span className="text-[#00E0D1]">●</span> &nbsp; Built for operators, not theorists
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            Automate the boring.
            <br />
            <span className="bg-gradient-to-r from-[#00E0D1] to-[#6A5CFF] bg-clip-text text-transparent">
              Scale the genius.
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-[#8A8F98] max-w-2xl mx-auto">
            AI automation systems, prompt vaults, and done-for-you builds.
            <br />
            Everything we sell, we run in our own company first.
          </p>
          <div className="mt-10 flex flex-col md:flex-row gap-3 justify-center">
            <Link href="#products" className="px-6 py-3 rounded-md bg-gradient-to-r from-[#00E0D1] to-[#6A5CFF] text-black font-semibold">
              See the catalog
            </Link>
            <Link href="#free" className="px-6 py-3 rounded-md border border-[#1F1F24] text-white hover:bg-[#111114]">
              Start free → 10 automations
            </Link>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF STRIP */}
      <section className="border-y border-[#1F1F24] bg-[#0E0E10]">
        <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm text-[#8A8F98]">
          <div><div className="text-white font-semibold text-2xl">n8n</div>built-in</div>
          <div><div className="text-white font-semibold text-2xl">Supabase</div>data layer</div>
          <div><div className="text-white font-semibold text-2xl">14-day</div>refund</div>
          <div><div className="text-white font-semibold text-2xl">Lifetime</div>updates</div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">The catalog</h2>
        <p className="mt-3 text-[#8A8F98]">One price ladder. Buy where you are.</p>

        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRODUCTS.map(p => (
            <div key={p.slug}
                 className={`group relative rounded-xl border border-[#1F1F24] bg-[#111114] p-6 transition hover:border-[#00E0D1]/50 ${p.featured ? 'md:col-span-2 lg:col-span-1 ring-1 ring-[#00E0D1]/40' : ''}`}>
              {p.featured && <span className="absolute -top-2 right-4 px-2 py-0.5 text-[10px] tracking-widest uppercase rounded bg-gradient-to-r from-[#00E0D1] to-[#6A5CFF] text-black font-semibold">Most booked</span>}
              <div className="text-xs uppercase tracking-widest text-[#8A8F98]">{p.tier}</div>
              <div className="mt-1 text-xl font-semibold">{p.name}</div>
              <div className="mt-2 text-sm text-[#8A8F98]">{p.tagline}</div>
              <div className="mt-6 flex items-end justify-between">
                <div className="font-mono text-2xl">{p.price}</div>
                <Link href={`/products/${p.slug}`} className="text-[#00E0D1] text-sm font-medium group-hover:underline">
                  {p.cta} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* METHOD */}
      <section id="method" className="border-t border-[#1F1F24] bg-[#0E0E10]">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <h2 className="text-4xl font-bold tracking-tight">How we build</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              { n:'01', t:'We run it first', b:'Every workflow we sell runs in AuraJonad before it ships. No theoretical templates.' },
              { n:'02', t:'Real ops, real outputs', b:'Prompts tested on real customer data. Workflows sized for small-team reality.' },
              { n:'03', t:'Ship in hours', b:'Import JSON, configure env, done. Most kits deploy in one afternoon.' },
            ].map(m => (
              <div key={m.n} className="rounded-xl border border-[#1F1F24] p-6 bg-[#111114]">
                <div className="font-mono text-[#00E0D1] text-sm">{m.n}</div>
                <div className="mt-3 text-xl font-semibold">{m.t}</div>
                <div className="mt-2 text-sm text-[#8A8F98]">{m.b}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FREE LEAD MAGNET */}
      <section id="free" className="max-w-4xl mx-auto px-6 py-24">
        <div className="rounded-2xl border border-[#00E0D1]/30 bg-gradient-to-br from-[#111114] to-[#0A0A0B] p-10">
          <div className="text-xs uppercase tracking-widest text-[#00E0D1]">Free</div>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">10 AI Automations Saving 5 Hrs/Week</h2>
          <p className="mt-3 text-[#8A8F98]">5-page PDF, 1 importable n8n workflow, 5 cold-email openers. Delivered to your inbox.</p>
          <form action="/api/leads" method="POST" className="mt-6 flex flex-col md:flex-row gap-3">
            <input name="email" type="email" required placeholder="you@company.com"
                   className="flex-1 px-4 py-3 rounded-md bg-[#0A0A0B] border border-[#1F1F24] text-white placeholder-[#8A8F98] focus:border-[#00E0D1] outline-none" />
            <input type="hidden" name="source" value="hero-free" />
            <button type="submit" className="px-6 py-3 rounded-md bg-gradient-to-r from-[#00E0D1] to-[#6A5CFF] text-black font-semibold">
              Send it to me
            </button>
          </form>
          <p className="mt-3 text-xs text-[#8A8F98]">No spam. Unsubscribe in 1 click.</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-[#1F1F24] bg-[#0E0E10]">
        <div className="max-w-3xl mx-auto px-6 py-24">
          <h2 className="text-4xl font-bold tracking-tight">FAQ</h2>
          <div className="mt-8 space-y-4">
            {[
              { q:'Do these workflows actually work?', a:'Yes. Every workflow ships from the AuraJonad production stack. Bugs get fixed in your version as we fix them in ours.' },
              { q:'What if I\'ve never used n8n?', a:'Every kit includes a setup walkthrough. If you can click "Import JSON" and paste an API key, you\'re fine.' },
              { q:'Can I use these for client work?', a:'Yes. Your license covers using our templates in your own and your clients\' businesses. You cannot resell the files themselves.' },
              { q:'Refunds?', a:'14 days on digital products if you haven\'t accessed the download. Services refundable until the first session.' },
              { q:'Team/agency pricing?', a:'Email support@aura-jonad.com. We sell team licenses on request.' },
            ].map((f, i) => (
              <details key={i} className="group rounded-xl border border-[#1F1F24] bg-[#111114] p-5">
                <summary className="cursor-pointer font-medium flex justify-between items-center">
                  {f.q}
                  <span className="text-[#8A8F98] group-open:rotate-45 transition">+</span>
                </summary>
                <p className="mt-3 text-sm text-[#8A8F98]">{f.a}</p>
              </details>
            ))}
          </div>
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
            <Link href="/terms"          className="hover:text-white">Terms</Link>
            <Link href="/privacy"        className="hover:text-white">Privacy</Link>
            <Link href="/refund-policy"  className="hover:text-white">Refunds</Link>
            <a    href="mailto:support@aura-jonad.com" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
