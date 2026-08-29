import { Head, Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { FAQS } from './Welcome.data.jsx';

/**
 * The Help Center.
 *
 * /help-center used to re-render the Resources page — a blog listing — with a
 * route comment reading "Reusing Resources for now". This is the real thing:
 * the same fifteen questions the landing page answers, searchable and grouped,
 * with the routes to a human underneath.
 *
 * FAQS is imported rather than copied so the landing page and this page can
 * never drift into answering the same question two different ways.
 */

const SERIF = { fontFamily: "'EB Garamond', Georgia, serif" };

/* Which questions belong together. Matching is by the question text so the
   grouping survives edits to the answers; anything unmatched falls into
   "Everything else" rather than disappearing. */
const TOPICS = [
    { name: 'Getting started', test: /get started|what is publicationmart|prior writing experience|how long/i },
    { name: 'Writing with Smart Writer', test: /smart writer|ai-generated|misuse/i },
    { name: 'Your rights and royalties', test: /ownership|royalty|guarantee book sales/i },
    { name: 'Formats, printing and updates', test: /formats|print-on-demand|upload my own|update my book/i },
    { name: 'Marketing and support', test: /marketing/i },
];

function group(faqs) {
    const buckets = TOPICS.map((t) => ({ name: t.name, items: [] }));
    const rest = [];
    faqs.forEach((f) => {
        const i = TOPICS.findIndex((t) => t.test.test(f.question));
        if (i >= 0) buckets[i].items.push(f);
        else rest.push(f);
    });
    if (rest.length) buckets.push({ name: 'Everything else', items: rest });
    return buckets.filter((b) => b.items.length);
}

function Answer({ faq, open, onToggle }) {
    return (
        <div className="border-t border-linen">
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                className="w-full text-left py-5 flex items-start gap-5 group"
            >
                <span className="flex-1 text-[17.5px] leading-snug text-ink group-hover:text-oxblood transition-colors" style={SERIF}>
                    {faq.question}
                </span>
                <span
                    className="text-[20px] leading-none mt-0.5 shrink-0 text-oxblood transition-transform"
                    style={{ transform: open ? 'rotate(45deg)' : 'none', ...SERIF }}
                    aria-hidden="true"
                >
                    +
                </span>
            </button>
            <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows .35s cubic-bezier(.16,1,.3,1)' }}>
                <div style={{ overflow: 'hidden' }}>
                    <p className="pb-6 pr-8 text-[15px] leading-relaxed text-ink-soft max-w-[70ch]">
                        {faq.answer}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function HelpCenter() {
    // Tickets need an account, so a signed-out reader is offered the desk
    // first rather than being bounced into a login wall.
    const { auth } = usePage().props;
    const signedIn = !!auth?.user;
    const [q, setQ] = useState('');
    const [open, setOpen] = useState(null);

    const needle = q.trim().toLowerCase();
    const matches = useMemo(
        () =>
            needle
                ? FAQS.filter(
                      (f) =>
                          f.question.toLowerCase().includes(needle) ||
                          f.answer.toLowerCase().includes(needle),
                  )
                : FAQS,
        [needle],
    );
    const grouped = useMemo(() => group(matches), [matches]);

    const routes = [
        { name: 'How a book is made', desc: 'The six stages, start to finish.', href: route('how-to-publish') },
        { name: 'What you will earn', desc: 'Work out your royalty per copy.', href: route('royalties.calculator') },
        { name: 'Plans and pricing', desc: 'Both suites, every plan.', href: route('welcome') + '#pricing-section' },
        { name: 'Refunds and returns', desc: 'What we refund, and when.', href: route('refund-policy') },
    ];

    return (
        <>
            <Head title="Help Center – Answers for Authors | PublicationMart">
                <meta name="description" content="Answers to the questions authors ask most about publishing with PublicationMart — ownership, royalties, formats, Smart Writer, timelines and support." />
                <meta property="og:title" content="Help Center | PublicationMart" />
                <meta property="og:description" content="Search the answers, or open a support ticket and a person will reply." />
                <meta property="og:type" content="website" />
            </Head>

            <div className="min-h-screen bg-parchment text-ink pt-24 pb-24">
                <div className="max-w-4xl mx-auto px-6">

                    <p className="text-[11px] font-semibold uppercase tracking-[.22em] text-umber mb-4">
                        PublicationMart · Help Center
                    </p>
                    <h1 className="text-[clamp(2rem,5vw,3rem)] leading-[1.1] mb-5" style={SERIF}>
                        How can we help?
                    </h1>
                    <p className="text-[18px] leading-relaxed text-ink-soft max-w-[58ch] mb-9" style={SERIF}>
                        Fifteen answers to the questions authors ask most. If yours is not
                        here, a person at the desk will answer it.
                    </p>

                    {/* Search */}
                    <div className="relative max-w-xl mb-4">
                        <input
                            type="search"
                            value={q}
                            onChange={(e) => { setQ(e.target.value); setOpen(null); }}
                            placeholder="Search the answers — royalties, ISBN, formats…"
                            aria-label="Search help articles"
                            className="w-full bg-paper border border-linen rounded-full pl-12 pr-5 py-3.5 text-[15px] text-ink placeholder-taupe focus:outline-none focus:border-oxblood focus:ring-1 focus:ring-oxblood transition-colors"
                        />
                        <svg className="w-5 h-5 text-umber absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <p className="text-[13px] text-taupe mb-12" aria-live="polite">
                        {needle
                            ? `${matches.length} ${matches.length === 1 ? 'answer' : 'answers'} for “${q.trim()}”`
                            : `${FAQS.length} answers`}
                    </p>

                    {/* Answers */}
                    {matches.length > 0 ? (
                        grouped.map((g) => (
                            <section key={g.name} className="mb-12">
                                <div className="flex items-baseline gap-5 mb-1">
                                    <h2 className="text-[11px] font-semibold uppercase tracking-[.22em] text-oxblood whitespace-nowrap">
                                        {g.name}
                                    </h2>
                                    <span className="flex-1 h-px bg-linen" />
                                    <span className="text-[11px] text-taupe tabular-nums">{g.items.length}</span>
                                </div>
                                {g.items.map((f) => (
                                    <Answer
                                        key={f.question}
                                        faq={f}
                                        open={open === f.question}
                                        onToggle={() => setOpen(open === f.question ? null : f.question)}
                                    />
                                ))}
                                <div className="border-t border-linen" />
                            </section>
                        ))
                    ) : (
                        <div className="py-16 text-center border-y border-linen mb-12">
                            <p className="text-[20px] text-ink mb-2" style={SERIF}>
                                Nothing here matches “{q.trim()}”.
                            </p>
                            <p className="text-[14.5px] text-umber">
                                Ask the desk instead — we answer every message, and good
                                questions end up on this page.
                            </p>
                        </div>
                    )}

                    {/* Where to go next */}
                    <section className="mb-14">
                        <div className="flex items-baseline gap-5 mb-6">
                            <h2 className="text-[11px] font-semibold uppercase tracking-[.22em] text-umber whitespace-nowrap">
                                Read next
                            </h2>
                            <span className="flex-1 h-px bg-linen" />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1">
                            {routes.map((r) => (
                                <Link key={r.name} href={r.href} className="group block py-4 border-t border-linen">
                                    <span className="block text-[18px] text-ink group-hover:text-oxblood transition-colors" style={SERIF}>
                                        {r.name}
                                    </span>
                                    <span className="block text-[13.5px] text-umber mt-0.5">{r.desc}</span>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Still stuck */}
                    <section className="bg-paper border border-linen p-8 sm:p-10">
                        <h2 className="text-[24px] leading-snug mb-3" style={SERIF}>
                            Still stuck?
                        </h2>
                        <p className="text-[15px] leading-relaxed text-ink-soft max-w-[54ch] mb-7">
                            {signedIn
                                ? 'Open a ticket and it goes to a real person at the desk, with your account and your titles already in front of them.'
                                : 'Write to the desk and a person will answer. If you have an account, signing in lets you open a ticket you can track.'}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {signedIn ? (
                                <>
                                    <Link
                                        href={route('support.create')}
                                        className="inline-block px-7 py-3.5 text-[14px] font-bold rounded-sm bg-oxblood text-paper hover:bg-oxblood-deep transition-colors"
                                    >
                                        Open a support ticket
                                    </Link>
                                    <Link
                                        href={route('contact')}
                                        className="inline-block px-7 py-3.5 text-[14px] font-bold rounded-sm border border-linen text-ink hover:border-oxblood hover:text-oxblood transition-colors"
                                    >
                                        Write to the desk
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href={route('contact')}
                                        className="inline-block px-7 py-3.5 text-[14px] font-bold rounded-sm bg-oxblood text-paper hover:bg-oxblood-deep transition-colors"
                                    >
                                        Write to the desk
                                    </Link>
                                    <Link
                                        href={route('login')}
                                        className="inline-block px-7 py-3.5 text-[14px] font-bold rounded-sm border border-linen text-ink hover:border-oxblood hover:text-oxblood transition-colors"
                                    >
                                        Sign in to open a ticket
                                    </Link>
                                </>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
