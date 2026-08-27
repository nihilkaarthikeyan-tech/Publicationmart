import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { PRO_PLANS, PREMIUM_PLANS, FAQS } from './Welcome.data.jsx';

/**
 * PublicationMart — landing page.
 *
 * Direction: an independent publishing house, not a SaaS dashboard. The page
 * is set like printed matter — EB Garamond (the typeface of scholarly books),
 * uncoated paper stock, printer's ink, oxblood binding cloth as the accent.
 * Sections are marked with running heads in letterspaced small caps, the way
 * a book marks its pages, rather than the monospace labels that signal "tech".
 *
 * The audience is real: most of the catalogue is academic and technical work
 * by university faculty, frequently with four or five co-authors.
 *
 * Functionality preserved from the previous page:
 *   • Guest Smart Writing Tool — usable WITHOUT an account
 *     (guest-writer.pricing, or dashboard when signed in)
 *   • Both pricing suites, all 8 plans, original prices and features
 *     - Saver / Optimizer  -> guest-writer.pricing
 *     - Silver / Gold / all Premium -> publishing-inquiry.create?plan=<name>
 *   • The full 15-question FAQ
 *   • "India's Next Gen AI-Powered Book Writing & Publishing Platform"
 */

const CSS = `
:root{
  --stock:#f0ece3;      /* uncoated book paper */
  --stock-2:#e7e1d4;
  --stock-3:#faf8f3;    /* title page */
  --ink:#17150f;        /* printer's ink */
  --ink-2:#4b443a;
  --ink-3:#7c7364;
  --rule:#d8d1c1;
  --cloth:#6e2530;      /* library binding cloth */
  --foil:#a07d3b;       /* aged gold foil */
}
.pm{background:var(--stock);color:var(--ink);font-family:'Figtree',ui-sans-serif,system-ui,sans-serif}
.pm-serif{font-family:'EB Garamond',Georgia,'Times New Roman',serif}
.pm-run{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--ink-3);font-weight:600}
.pm-rule{height:1px;background:var(--rule)}
.pm a:focus-visible,.pm button:focus-visible{outline:2px solid var(--cloth);outline-offset:3px;border-radius:2px}

@keyframes pmRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.pm-rise{animation:pmRise .7s cubic-bezier(.2,.7,.3,1) both}
@media (prefers-reduced-motion:reduce){.pm-rise{animation:none}.pm *{transition:none!important}}

.pm-spine{position:relative;border-radius:2px 4px 4px 2px;box-shadow:0 16px 34px rgba(23,21,15,.20),0 2px 6px rgba(23,21,15,.12);transition:transform .35s cubic-bezier(.2,.7,.3,1)}
.pm-spine::after{content:"";position:absolute;left:0;top:0;bottom:0;width:9px;background:linear-gradient(90deg,rgba(0,0,0,.30),rgba(0,0,0,.04))}
.pm-stack:hover .pm-spine{transform:translateY(-5px)}

/* the plan the house recommends gets the cloth binding */
.pm-plan-featured{background:var(--ink);color:var(--stock-3)}
.pm-plan-featured .pm-run{color:var(--foil)}
`;

const CLOTHS = [
    'linear-gradient(155deg,#2f4f45,#20362d)',
    'linear-gradient(155deg,#6e2530,#4d1a22)',
    'linear-gradient(155deg,#2b3a56,#1c2739)',
    'linear-gradient(155deg,#7a6224,#584618)',
];

function Spine({ title, i }) {
    return (
        <div
            className="pm-spine absolute w-[150px] h-[226px] overflow-hidden"
            style={{
                background: CLOTHS[i % CLOTHS.length],
                left: `${i * 60}px`,
                top: `${[26, 12, 30, 18][i % 4]}px`,
                transform: `rotate(${[-6, 2, 8, -3][i % 4]}deg)`,
                zIndex: 10 - i,
            }}
        >
            <div className="pm-serif text-[#f2ecdd] text-[12px] leading-snug px-4 pt-7 pr-3">{title}</div>
            <div className="absolute bottom-5 left-4 right-3 pt-2" style={{ borderTop: '1px solid rgba(242,236,221,.28)' }}>
                <span className="pm-run" style={{ color: 'rgba(242,236,221,.6)', fontSize: 9 }}>PublicationMart</span>
            </div>
        </div>
    );
}

function RunningHead({ label, folio }) {
    return (
        <div className="flex items-baseline gap-6 mb-8">
            <span className="pm-run whitespace-nowrap">{label}</span>
            <div className="pm-rule flex-1" />
            {folio && <span className="pm-run" style={{ color: 'var(--foil)' }}>{folio}</span>}
        </div>
    );
}

/** Plans that are a guided/managed service go to the enquiry form. */
const isManagedPlan = (name) =>
    ['silver', 'gold'].includes(String(name).toLowerCase());

function PlanCard({ plan, suite, guestHref }) {
    const managed = suite === 'premium' || isManagedPlan(plan.name);
    const href = managed
        ? `${route('publishing-inquiry.create')}?plan=${String(plan.name).toLowerCase()}`
        : guestHref;

    return (
        <div
            className={`flex flex-col p-7 ${plan.popular ? 'pm-plan-featured' : ''}`}
            style={{
                border: `1px solid ${plan.popular ? 'var(--ink)' : 'var(--rule)'}`,
                background: plan.popular ? 'var(--ink)' : 'var(--stock-3)',
            }}
        >
            {plan.popular && (
                <span className="pm-run mb-4" style={{ color: 'var(--foil)' }}>
                    Recommended
                </span>
            )}

            <h3 className="pm-serif text-[26px] leading-none mb-1.5">{plan.name}</h3>
            <p className="text-[12.5px] mb-6" style={{ color: plan.popular ? 'rgba(240,236,227,.62)' : 'var(--ink-3)' }}>
                {plan.subtitle}
            </p>

            <p className="pm-serif text-[34px] leading-none mb-7">
                ₹{Number(plan.price).toLocaleString('en-IN')}
            </p>

            <div className="pm-rule mb-5" style={plan.popular ? { background: 'rgba(240,236,227,.18)' } : undefined} />

            <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                    <li
                        key={f}
                        className="text-[13.5px] leading-snug pl-4 relative"
                        style={{ color: plan.popular ? 'rgba(240,236,227,.85)' : 'var(--ink-2)' }}
                    >
                        <span className="absolute left-0 top-[7px] w-[5px] h-[5px] rounded-full"
                              style={{ background: plan.popular ? 'var(--foil)' : 'var(--cloth)' }} />
                        {f}
                    </li>
                ))}
            </ul>

            <Link
                href={href}
                className="block text-center text-[13.5px] font-semibold py-3 rounded-sm transition-opacity hover:opacity-85"
                style={
                    plan.popular
                        ? { background: 'var(--stock-3)', color: 'var(--ink)' }
                        : { background: 'var(--ink)', color: 'var(--stock-3)' }
                }
            >
                {managed ? `Enquire about ${plan.name}` : `Start with ${plan.name}`}
            </Link>
        </div>
    );
}

export default function Welcome({ auth, featuredBooks = [], platformStats = { publishedBooks: 0, totalAuthors: 0 } }) {
    const [loaded, setLoaded] = useState(false);
    const [suite, setSuite] = useState('pro');
    const [openFaq, setOpenFaq] = useState(null);

    useEffect(() => setLoaded(true), []);

    // The writing tool is open to visitors with no account — preserved exactly.
    const guestHref = auth?.user ? route('dashboard') : route('guest-writer.pricing');

    const spines = (featuredBooks || []).slice(0, 4);
    const shelf = (featuredBooks || []).slice(0, 6);
    const published = platformStats?.publishedBooks ?? 0;

    const plans = suite === 'pro' ? PRO_PLANS : PREMIUM_PLANS;

    const stages = [
        { n: 'I', t: 'Write', d: 'Draft in the Smart Writing Tool, or bring a manuscript you have already finished.' },
        { n: 'II', t: 'Format', d: 'Interior typesetting to print standards — margins, running heads, folios, contents.' },
        { n: 'III', t: 'Design', d: 'A cover built for the shelf and the thumbnail, because readers meet it as both.' },
        { n: 'IV', t: 'Register', d: 'Your ISBN is allocated and the title catalogued under your name as author.' },
        { n: 'V', t: 'Distribute', d: 'Listed with Amazon, Apple, Google and more than fifty stores worldwide.' },
    ];

    return (
        <div className="pm min-h-screen">
            <Head title="PublicationMart — AI-Powered Book Writing & Publishing, India" />
            <style dangerouslySetInnerHTML={{ __html: CSS }} />

            {/* ── masthead ─────────────────────────────────── */}
            <header className="border-b sticky top-0 z-40" style={{ borderColor: 'var(--rule)', background: 'rgba(240,236,227,.93)', backdropFilter: 'blur(8px)' }}>
                <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-[72px]">
                    <Link href="/" className="pm-serif text-[22px] font-bold tracking-tight whitespace-nowrap shrink-0">
                        Publication<span style={{ color: 'var(--cloth)' }}>Mart</span>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-7 mx-8">
                        <Link href={guestHref} className="pm-run hover:text-[color:var(--ink)] transition-colors">Write</Link>
                        <a href="#plans" className="pm-run hover:text-[color:var(--ink)] transition-colors">Plans</a>
                        <Link href={route('book-store.index')} className="pm-run hover:text-[color:var(--ink)] transition-colors">Catalogue</Link>
                        <a href="#faq" className="pm-run hover:text-[color:var(--ink)] transition-colors">Questions</a>
                        <Link href={route('contact')} className="pm-run hover:text-[color:var(--ink)] transition-colors">Contact</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        {auth?.user ? (
                            <Link href={route('dashboard')} className="text-[13px] font-semibold px-5 py-2.5 rounded-sm whitespace-nowrap"
                                  style={{ background: 'var(--ink)', color: 'var(--stock-3)' }}>
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="text-[13px] font-medium hidden sm:inline whitespace-nowrap">Sign in</Link>
                                <Link href={route('register')} className="text-[13px] font-semibold px-5 py-2.5 rounded-sm whitespace-nowrap"
                                      style={{ background: 'var(--ink)', color: 'var(--stock-3)' }}>
                                    Create account
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* ── title page ───────────────────────────────── */}
            <section style={{ background: 'var(--stock-3)', borderBottom: '1px solid var(--rule)' }}>
                <div className="max-w-6xl mx-auto px-6 py-20 md:py-24 grid md:grid-cols-[1.08fr_.92fr] gap-14 items-center">
                    <div className={loaded ? 'pm-rise' : 'opacity-0'}>
                        <p className="pm-run mb-7" style={{ color: 'var(--cloth)' }}>
                            India&rsquo;s next-gen AI book writing &amp; publishing house
                        </p>

                        <h1 className="pm-serif font-medium leading-[1.04] tracking-tight text-[clamp(2.5rem,5.8vw,4rem)] mb-7">
                            Your manuscript deserves to become{' '}
                            <em style={{ color: 'var(--cloth)' }}>a real book.</em>
                        </h1>

                        <p className="pm-serif text-[19px] leading-relaxed max-w-[47ch] mb-9" style={{ color: 'var(--ink-2)' }}>
                            Write with AI assistance, typeset to print standards, and publish
                            worldwide with your own ISBN. You keep the copyright, and 100% of
                            the royalty.
                        </p>

                        <div className="flex flex-wrap gap-3">
                            <Link href={guestHref} className="text-[14px] font-semibold px-7 py-3.5 rounded-sm"
                                  style={{ background: 'var(--ink)', color: 'var(--stock-3)' }}>
                                Start writing — no account needed
                            </Link>
                            <Link href={route('book-store.index')} className="text-[14px] font-semibold px-7 py-3.5 rounded-sm"
                                  style={{ border: '1px solid var(--rule)', color: 'var(--ink)' }}>
                                Browse the catalogue
                            </Link>
                        </div>

                        <div className="mt-10 pt-6" style={{ borderTop: '1px solid var(--rule)' }}>
                            <p className="text-[13.5px]" style={{ color: 'var(--ink-3)' }}>
                                <strong style={{ color: 'var(--ink-2)' }}>{published.toLocaleString('en-IN')}</strong> titles published
                                <span className="mx-3" style={{ color: 'var(--rule)' }}>·</span>
                                <strong style={{ color: 'var(--ink-2)' }}>100%</strong> author royalty
                                <span className="mx-3" style={{ color: 'var(--rule)' }}>·</span>
                                ISBN included
                            </p>
                        </div>
                    </div>

                    <div className={`relative h-[290px] hidden md:block ${loaded ? 'pm-rise' : 'opacity-0'}`} style={{ animationDelay: '.12s' }}>
                        <div className="pm-stack absolute inset-0">
                            {(spines.length ? spines : [{ id: 'a', title: 'A book published with PublicationMart' }])
                                .map((b, i) => <Spine key={b.id ?? i} title={b.title} i={i} />)}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── catalogue ────────────────────────────────── */}
            {shelf.length > 0 && (
                <section className="max-w-6xl mx-auto px-6 py-20">
                    <RunningHead label="From the catalogue" folio="I" />
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-9">
                        {shelf.map((b) => (
                            <article key={b.id}>
                                <div className="pm-rule mb-4" />
                                <h3 className="pm-serif text-[20px] leading-snug mb-2">
                                    <Link href={`/book-store/${b.id}`} className="hover:underline decoration-1 underline-offset-4">
                                        {b.title}
                                    </Link>
                                </h3>
                                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--ink-3)' }}>{b.author_name}</p>
                            </article>
                        ))}
                    </div>
                    <div className="mt-12">
                        <Link href={route('book-store.index')} className="pm-run hover:opacity-70" style={{ color: 'var(--cloth)' }}>
                            See every title →
                        </Link>
                    </div>
                </section>
            )}

            {/* ── how a book is made ───────────────────────── */}
            <section style={{ background: 'var(--stock-3)', borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
                <div className="max-w-6xl mx-auto px-6 py-20">
                    <RunningHead label="How a book is made" folio="II" />
                    <h2 className="pm-serif text-[clamp(1.9rem,4vw,2.6rem)] leading-tight max-w-[20ch] mb-14">
                        Five stages, and we handle all of them.
                    </h2>
                    <ol className="grid md:grid-cols-5 gap-x-8 gap-y-10">
                        {stages.map((s) => (
                            <li key={s.n}>
                                <div className="pm-serif text-[26px] mb-3" style={{ color: 'var(--foil)' }}>{s.n}</div>
                                <div className="pm-rule mb-4" />
                                <h3 className="pm-serif text-[19px] mb-2">{s.t}</h3>
                                <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--ink-3)' }}>{s.d}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* ── who we publish ───────────────────────────── */}
            <section className="max-w-6xl mx-auto px-6 py-20">
                <RunningHead label="Who we publish" folio="III" />
                <div className="grid md:grid-cols-2 gap-14 items-start">
                    <div>
                        <h2 className="pm-serif text-[clamp(1.9rem,4vw,2.6rem)] leading-tight mb-6">
                            Most of our authors teach for a living.
                        </h2>
                        <p className="pm-serif text-[18px] leading-relaxed mb-5" style={{ color: 'var(--ink-2)' }}>
                            Textbooks, monographs and technical titles — often written by four
                            or five colleagues at once. The process is built around that:
                            multiple named authors, departmental affiliations, and
                            citation-ready formatting.
                        </p>
                        <p className="pm-serif text-[18px] leading-relaxed" style={{ color: 'var(--ink-2)' }}>
                            No agent. No proposal. No waiting on a commissioning editor.
                        </p>
                    </div>
                    <dl className="grid gap-px" style={{ background: 'var(--rule)', border: '1px solid var(--rule)' }}>
                        {[
                            ['Copyright', 'Stays entirely yours. We claim nothing.'],
                            ['Royalty', 'You keep 100% as per marketplace payouts.'],
                            ['ISBN', 'Allocated and registered to your title.'],
                            ['Reach', 'Amazon, Apple, Google and 50+ stores.'],
                        ].map(([k, v]) => (
                            <div key={k} className="px-6 py-5" style={{ background: 'var(--stock)' }}>
                                <dt className="pm-run mb-1.5" style={{ color: 'var(--cloth)' }}>{k}</dt>
                                <dd className="pm-serif text-[17px]" style={{ color: 'var(--ink-2)' }}>{v}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* ── plans ────────────────────────────────────── */}
            <section id="plans" style={{ background: 'var(--stock-3)', borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
                <div className="max-w-6xl mx-auto px-6 py-20">
                    <RunningHead label="Plans" folio="IV" />

                    <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
                        <h2 className="pm-serif text-[clamp(1.9rem,4vw,2.6rem)] leading-tight max-w-[16ch]">
                            Publish it yourself, or let us do it.
                        </h2>

                        <div className="flex" style={{ border: '1px solid var(--rule)' }} role="tablist" aria-label="Plan suites">
                            {[
                                ['pro', 'Self-publishing'],
                                ['premium', 'Managed & promoted'],
                            ].map(([key, label]) => (
                                <button
                                    key={key}
                                    role="tab"
                                    aria-selected={suite === key}
                                    onClick={() => setSuite(key)}
                                    className="px-6 py-3 text-[12.5px] font-semibold transition-colors"
                                    style={
                                        suite === key
                                            ? { background: 'var(--ink)', color: 'var(--stock-3)' }
                                            : { background: 'transparent', color: 'var(--ink-3)' }
                                    }
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {plans.map((p) => (
                            <PlanCard key={p.name} plan={p} suite={suite} guestHref={guestHref} />
                        ))}
                    </div>

                    <p className="mt-9 text-[13.5px]" style={{ color: 'var(--ink-3)' }}>
                        Need something different?{' '}
                        <Link href={route('contact')} className="underline underline-offset-4" style={{ color: 'var(--cloth)' }}>
                            Tell us what you have in mind
                        </Link>
                        .
                    </p>
                </div>
            </section>

            {/* ── questions ────────────────────────────────── */}
            <section id="faq" className="max-w-6xl mx-auto px-6 py-20">
                <RunningHead label="Questions" folio="V" />
                <div className="grid md:grid-cols-[.8fr_1.2fr] gap-12">
                    <h2 className="pm-serif text-[clamp(1.9rem,4vw,2.6rem)] leading-tight">
                        Before you begin.
                    </h2>

                    <div>
                        {FAQS.map((faq, i) => {
                            const open = openFaq === i;
                            return (
                                <div key={faq.question} style={{ borderTop: '1px solid var(--rule)' }}>
                                    <button
                                        onClick={() => setOpenFaq(open ? null : i)}
                                        aria-expanded={open}
                                        className="w-full text-left py-5 flex items-start gap-5"
                                    >
                                        <span className="pm-serif text-[18px] leading-snug flex-1">{faq.question}</span>
                                        <span
                                            className="pm-serif text-[20px] leading-none mt-0.5 shrink-0 transition-transform"
                                            style={{ color: 'var(--cloth)', transform: open ? 'rotate(45deg)' : 'none' }}
                                            aria-hidden="true"
                                        >
                                            +
                                        </span>
                                    </button>
                                    {open && (
                                        <p className="pb-6 pr-10 text-[14.5px] leading-relaxed" style={{ color: 'var(--ink-2)' }}>
                                            {faq.answer}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                        <div className="pm-rule" />
                    </div>
                </div>
            </section>

            {/* ── closing ──────────────────────────────────── */}
            <section style={{ background: 'var(--ink)' }}>
                <div className="max-w-6xl mx-auto px-6 py-20 text-center">
                    <p className="pm-run mb-7" style={{ color: 'var(--foil)' }}>Begin</p>
                    <h2 className="pm-serif font-medium text-[clamp(2rem,5vw,3.2rem)] leading-tight max-w-[22ch] mx-auto mb-8"
                        style={{ color: 'var(--stock-3)' }}>
                        The manuscript is the hard part. <em>You have already done it.</em>
                    </h2>
                    <Link href={guestHref} className="inline-block text-[14px] font-semibold px-8 py-4 rounded-sm"
                          style={{ background: 'var(--stock-3)', color: 'var(--ink)' }}>
                        Start writing — no account needed
                    </Link>
                    <p className="mt-6 text-[13px]" style={{ color: 'rgba(240,236,227,.5)' }}>
                        Free to begin · No commitment until you publish
                    </p>
                </div>
            </section>

            {/* ── colophon ─────────────────────────────────── */}
            <footer className="max-w-6xl mx-auto px-6 py-14">
                <div className="pm-rule mb-8" />
                <div className="grid sm:grid-cols-[1.4fr_1fr_1fr] gap-10">
                    <div>
                        <p className="pm-serif text-[19px] font-bold mb-2">
                            Publication<span style={{ color: 'var(--cloth)' }}>Mart</span>
                        </p>
                        <p className="text-[13px] leading-relaxed max-w-[34ch]" style={{ color: 'var(--ink-3)' }}>
                            An AI-powered writing and publishing house for academic and
                            independent authors, based in India.
                        </p>
                    </div>
                    <div>
                        <p className="pm-run mb-3">Publishing</p>
                        <ul className="space-y-2 text-[13.5px]" style={{ color: 'var(--ink-3)' }}>
                            <li><Link href={guestHref} className="hover:text-[color:var(--ink)]">Smart Writing Tool</Link></li>
                            <li><a href="#plans" className="hover:text-[color:var(--ink)]">Plans &amp; pricing</a></li>
                            <li><Link href="/royalties-calculator" className="hover:text-[color:var(--ink)]">Royalties</Link></li>
                        </ul>
                    </div>
                    <div>
                        <p className="pm-run mb-3">More</p>
                        <ul className="space-y-2 text-[13.5px]" style={{ color: 'var(--ink-3)' }}>
                            <li><Link href={route('book-store.index')} className="hover:text-[color:var(--ink)]">Catalogue</Link></li>
                            <li><a href="#faq" className="hover:text-[color:var(--ink)]">Questions</a></li>
                            <li><Link href={route('contact')} className="hover:text-[color:var(--ink)]">Contact</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="pm-rule mt-10 mb-5" />
                <div className="flex flex-wrap items-center justify-between gap-3 text-[12px]" style={{ color: 'var(--ink-3)' }}>
                    <span>© {new Date().getFullYear()} PublicationMart</span>
                    <span className="flex gap-5">
                        <Link href="/privacy-policy" className="hover:text-[color:var(--ink)]">Privacy</Link>
                        <Link href="/terms" className="hover:text-[color:var(--ink)]">Terms</Link>
                    </span>
                </div>
            </footer>
        </div>
    );
}
