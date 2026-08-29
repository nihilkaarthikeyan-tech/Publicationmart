import { Link, Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

/* Plate V — the book assembles beside the steps as the reader scrolls. */
const ASSEMBLY_CSS = `
.pm-asm{position:relative;width:150px;aspect-ratio:2/3;margin:0 auto}
.pm-asm-l{position:absolute;inset:0;border-radius:2px 5px 5px 2px;transition:opacity .55s cubic-bezier(.16,1,.3,1),transform .55s cubic-bezier(.16,1,.3,1)}
/* loose sheets, still scattered */
.pm-asm-p1{background:#fdfbf5;border:1px solid #d8d1c1;transform:rotate(-7deg) translate(-9px,5px);box-shadow:0 6px 16px rgba(23,21,15,.10)}
.pm-asm-p2{background:#fdfbf5;border:1px solid #d8d1c1;transform:rotate(5deg) translate(7px,-3px);box-shadow:0 6px 16px rgba(23,21,15,.10)}
.pm-asm-p3{background:#fdfbf5;border:1px solid #d8d1c1;box-shadow:0 8px 20px rgba(23,21,15,.12)}
/* squared up at the gathering stage */
.pm-asm[data-stage="1"] .pm-asm-p1,.pm-asm[data-stage="2"] .pm-asm-p1,.pm-asm[data-stage="3"] .pm-asm-p1,.pm-asm[data-stage="4"] .pm-asm-p1{transform:rotate(-1.5deg) translate(-3px,2px)}
.pm-asm[data-stage="1"] .pm-asm-p2,.pm-asm[data-stage="2"] .pm-asm-p2,.pm-asm[data-stage="3"] .pm-asm-p2,.pm-asm[data-stage="4"] .pm-asm-p2{transform:rotate(1.5deg) translate(3px,-1px)}
/* the case wraps the block */
.pm-asm-case{background:linear-gradient(155deg,#6e2530,#4d1a22);box-shadow:inset 0 0 0 1px rgba(0,0,0,.25),0 14px 30px rgba(23,21,15,.25);opacity:0;transform:scale(.94)}
.pm-asm[data-stage="2"] .pm-asm-case,.pm-asm[data-stage="3"] .pm-asm-case,.pm-asm[data-stage="4"] .pm-asm-case{opacity:1;transform:none}
.pm-asm-case::before{content:"";position:absolute;inset:11px;border:1px solid rgba(160,125,59,.5);border-radius:1px}
.pm-asm-case::after{content:"";position:absolute;left:0;top:0;bottom:0;width:9px;background:linear-gradient(90deg,rgba(0,0,0,.32),rgba(0,0,0,.04))}
/* the foil title presses on */
.pm-asm-title{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 18px;opacity:0;transform:scale(1.35)}
.pm-asm[data-stage="3"] .pm-asm-title,.pm-asm[data-stage="4"] .pm-asm-title{opacity:1;transform:none}
.pm-asm-title span{font-family:'EB Garamond',Georgia,serif;color:#e8cf8e;font-size:14px;line-height:1.35}
.pm-asm-title small{margin-top:9px;font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:rgba(232,207,142,.65);font-weight:700}
/* the finished book stands up */
.pm-asm[data-stage="4"]{transform:perspective(900px) rotateY(-13deg) translateY(-6px);transition:transform .6s cubic-bezier(.16,1,.3,1)}
.pm-asm-label{margin-top:20px;text-align:center;font-size:10px;letter-spacing:.2em;text-transform:uppercase;font-weight:700;color:#635c4e}
.pm-asm-label b{display:block;font-family:'EB Garamond',Georgia,serif;font-size:17px;letter-spacing:0;text-transform:none;color:#6e2530;font-weight:500;margin-top:5px}
/* The phone version: a slim bar, so nothing is covered up. Display is set
   inside the media query, never on the bare class — this stylesheet loads
   after Tailwind and a bare .pm-asmbar{display:flex} would beat lg:hidden
   at equal specificity, leaving the bar on desktop too. */
.pm-asmbar{display:none}
@media (max-width:1023.98px){
  .pm-asmbar{position:sticky;bottom:0;z-index:30;display:flex;align-items:center;gap:12px;padding:10px 16px;background:rgba(250,248,243,.94);backdrop-filter:blur(8px);border-top:1px solid #d8d1c1}
}
.pm-asmbar-book{width:20px;height:28px;border-radius:1px 3px 3px 1px;flex:0 0 auto;background:#fdfbf5;border:1px solid #d8d1c1;transition:background .5s,border-color .5s}
.pm-asmbar[data-stage="2"] .pm-asmbar-book,.pm-asmbar[data-stage="3"] .pm-asmbar-book,.pm-asmbar[data-stage="4"] .pm-asmbar-book{background:linear-gradient(155deg,#6e2530,#4d1a22);border-color:#4d1a22}
.pm-asmbar-t{flex:1;min-width:0;font-family:'EB Garamond',Georgia,serif;font-size:14px;color:#17150f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pm-asmbar-n{font-size:10px;letter-spacing:.18em;text-transform:uppercase;font-weight:700;color:#a49b8b;flex:0 0 auto}
.pm-asmbar-rule{position:absolute;left:0;bottom:0;height:2px;background:#6e2530;transition:width .5s cubic-bezier(.16,1,.3,1)}
@media (prefers-reduced-motion:reduce){.pm-asm-l,.pm-asm,.pm-asmbar-rule,.pm-asmbar-book{transition:none}}
`;

const ASSEMBLY_STAGES = [
    { label: 'Loose sheets', note: 'A manuscript, written' },
    { label: 'Gathered', note: 'Squared and formatted' },
    { label: 'Bound', note: 'The case goes on' },
    { label: 'Titled', note: 'Foil, ISBN, registered' },
    { label: 'Published', note: 'On the shelves worldwide' },
];

/**
 * The book being made, beside the steps that describe making it. One
 * rAF-throttled scroll listener maps progress through the steps section to a
 * stage, so it moves with the reader rather than on a timer. On phones the
 * same state drives a slim bar instead of a column, so nothing is covered.
 */
function AssemblingBook({ sectionRef }) {
    const [stage, setStage] = useState(0);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;
        let raf = 0;
        const measure = () => {
            const r = section.getBoundingClientRect();
            const travel = r.height - window.innerHeight * 0.5;
            if (travel <= 0) return;
            const p = Math.min(Math.max((window.innerHeight * 0.5 - r.top) / travel, 0), 1);
            setStage(Math.min(Math.floor(p * ASSEMBLY_STAGES.length), ASSEMBLY_STAGES.length - 1));
        };
        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(measure);
        };
        // Measure once synchronously: a reader who lands mid-page (a shared
        // link, a restored scroll position) sees the right stage before the
        // first frame, rather than an unbuilt book until they scroll.
        measure();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            cancelAnimationFrame(raf);
        };
    }, [sectionRef]);

    const s = ASSEMBLY_STAGES[stage];

    return (
        <>
            {/* Desktop: the book builds in the margin, beside the steps */}
            <div className="hidden lg:block sticky top-32" aria-hidden="true">
                <div className="pm-asm" data-stage={stage}>
                    <div className="pm-asm-l pm-asm-p1" />
                    <div className="pm-asm-l pm-asm-p2" />
                    <div className="pm-asm-l pm-asm-p3" />
                    <div className="pm-asm-l pm-asm-case" />
                    <div className="pm-asm-l pm-asm-title">
                        <span>Your Title Here</span>
                        <small>PublicationMart</small>
                    </div>
                </div>
                <p className="pm-asm-label">
                    {s.label}
                    <b>{s.note}</b>
                </p>
            </div>

            {/* Phone: the same progress as a slim bar that covers nothing */}
            <div className="pm-asmbar relative" data-stage={stage} aria-hidden="true">
                <span className="pm-asmbar-book" />
                <span className="pm-asmbar-t">{s.note}</span>
                <span className="pm-asmbar-n">{stage + 1}/{ASSEMBLY_STAGES.length}</span>
                <span className="pm-asmbar-rule" style={{ width: `${((stage + 1) / ASSEMBLY_STAGES.length) * 100}%` }} />
            </div>
        </>
    );
}

export default function HowToPublish({ auth }) {
    const stepsRef = useRef(null);

    return (
        <>
            <Head title="How to Publish Your Book Online in India – Step-by-Step Guide | PublicationMart">
                <meta name="description" content="Complete step-by-step guide to self-publishing your book in India. Learn how to write, format, design covers, get ISBN, and distribute globally with PublicationMart." />
                <meta property="og:title" content="How to Publish Your Book | PublicationMart" />
                <meta property="og:description" content="From manuscript to marketplace in 6 simple steps. Write, format, design, publish, and market your book with our AI-powered platform." />
                <meta property="og:url" content="https://publicationmart.com/how-to-publish" />
                <meta property="og:type" content="article" />
                <meta property="og:image" content="https://publicationmart.com/images/logo_new.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="How to Publish Your Book | PublicationMart" />
                <meta name="twitter:description" content="Complete guide to self-publishing your book in India. AI-powered tools, global distribution." />
            </Head>

            <style dangerouslySetInnerHTML={{ __html: ASSEMBLY_CSS }} />

            <div className="min-h-screen bg-parchment text-ink selection:bg-indigo-500 selection:text-paper overflow-x-hidden">

                {/* ═══ HERO SECTION ═══ */}
                <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    {/* Background Glows */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-indigo-600/15 blur-[150px] rounded-full pointer-events-none -z-10" />
                    <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

                    <div className="text-center mb-8 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 text-sm font-medium">
                            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                            Complete Publishing Guide
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
                            <span className=" text-ink">
                                How to Publish Your Book
                            </span>
                            <br />
                            <span className=" text-oxblood">
                                with PublicationMart
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-umber max-w-3xl mx-auto leading-relaxed">
                            Publishing your book has never been easier. Whether you're a first-time writer or an experienced author,
                            PublicationMart gives you the tools, guidance, and distribution network to turn your manuscript into a
                            professionally published book.
                        </p>
                        <p className="mt-6 text-base text-umber italic">Here's how the process works.</p>
                    </div>
                </section>

                {/* ═══ STEPS TIMELINE — the book assembles alongside (Plate V) ═══ */}
                <section ref={stepsRef} className="relative pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto lg:grid lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-x-12">
                    <AssemblingBook sectionRef={stepsRef} />

                    <div className="relative">
                    {/* Central Line */}
                    <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-purple-500/30 to-transparent md:-translate-x-1/2 transform" />

                    <div className="space-y-16 md:space-y-24">

                        {/* ─── STEP 1 ─── */}
                        <StepCard
                            number="1"
                            title="Start Writing Your Manuscript"
                            subtitle="Every great book begins with an idea."
                            icon="✍️"
                            side="right"
                            delay={100}
                            gradient="from-oxblood to-oxblood-night"
                            glowColor="indigo"
                        >
                            <p className="text-umber mb-4">Use our <span className="text-indigo-700 font-semibold">Smart Writer</span> tool to:</p>
                            <ul className="space-y-2">
                                <BulletItem>Draft chapters effortlessly</BulletItem>
                                <BulletItem>Structure your book properly</BulletItem>
                                <BulletItem>Refine grammar and clarity</BulletItem>
                                <BulletItem>Generate supporting content and visuals</BulletItem>
                            </ul>
                            <p className="text-umber text-sm mt-4 italic border-l-2 border-indigo-500/30 pl-3">
                                You can write from scratch or upload your completed manuscript.
                            </p>
                        </StepCard>

                        {/* ─── STEP 2 ─── */}
                        <StepCard
                            number="2"
                            title="Format Your Book Professionally"
                            subtitle="A professionally formatted book improves readability and credibility."
                            icon="📖"
                            side="left"
                            delay={200}
                            gradient="from-foil to-[#7d6027]"
                            glowColor="purple"
                        >
                            <p className="text-umber mb-4">Our platform has a <span className="text-purple-700 font-semibold">DIY tool</span> which:</p>
                            <ul className="space-y-2">
                                <BulletItem color="purple">Formats your interior layout</BulletItem>
                                <BulletItem color="purple">Sets margins and trim sizes</BulletItem>
                                <BulletItem color="purple">Creates print-ready and eBook-ready files</BulletItem>
                                <BulletItem color="purple">Ensures publishing compliance standards</BulletItem>
                            </ul>
                            <p className="text-umber text-sm mt-4 italic border-l-2 border-purple-500/30 pl-3">
                                No technical knowledge required.
                            </p>
                        </StepCard>

                        {/* ─── STEP 3 ─── */}
                        <StepCard
                            number="3"
                            title="Design Your Cover"
                            subtitle="Readers judge books by their covers."
                            icon="🎨"
                            side="right"
                            delay={300}
                            gradient="from-[#2f4f45] to-[#20362d]"
                            glowColor="emerald"
                        >
                            <p className="text-umber mb-4">Choose from:</p>
                            <ul className="space-y-2">
                                <BulletItem color="emerald">Custom-designed covers</BulletItem>
                                <BulletItem color="emerald">Template-based professional designs</BulletItem>
                                <BulletItem color="emerald">AI-assisted visual creation</BulletItem>
                            </ul>
                            <p className="text-umber text-sm mt-4 italic border-l-2 border-emerald-500/30 pl-3">
                                We ensure your cover meets marketplace requirements for both print and digital formats.
                            </p>
                        </StepCard>

                        {/* ─── STEP 4 ─── */}
                        <StepCard
                            number="4"
                            title="ISBN & Publishing Setup"
                            subtitle="An ISBN gives your book a unique identity worldwide."
                            icon="🔑"
                            side="left"
                            delay={400}
                            gradient="from-[#7a6224] to-[#584618]"
                            glowColor="amber"
                        >
                            <p className="text-umber mb-4">We handle:</p>
                            <ul className="space-y-2">
                                <BulletItem color="amber">ISBN allocation</BulletItem>
                                <BulletItem color="amber">Metadata optimization</BulletItem>
                                <BulletItem color="amber">Category selection</BulletItem>
                                <BulletItem color="amber">Pricing setup</BulletItem>
                                <BulletItem color="amber">Author royalty configuration</BulletItem>
                            </ul>
                            <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <svg className="w-5 h-5 text-amber-800 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span className="text-amber-800 text-sm font-medium">You retain 100% of your rights and royalties.</span>
                            </div>
                        </StepCard>

                        {/* ─── STEP 5 ─── */}
                        <StepCard
                            number="5"
                            title="Global Distribution"
                            subtitle="Once approved, your book becomes available through major online platforms."
                            icon="🚀"
                            side="right"
                            delay={500}
                            gradient="from-[#2b3a56] to-[#1c2739]"
                            glowColor="cyan"
                        >
                            <p className="text-umber mb-4">Distribution includes:</p>
                            <ul className="space-y-2">
                                <BulletItem color="cyan">eBook publishing</BulletItem>
                                <BulletItem color="cyan">Paperback publishing</BulletItem>
                                <BulletItem color="cyan">Online marketplace listing</BulletItem>
                                <BulletItem color="cyan">Indian and international availability</BulletItem>
                            </ul>
                            <p className="text-umber text-sm mt-4 italic border-l-2 border-cyan-500/30 pl-3">
                                Your book reaches readers across the globe.
                            </p>
                        </StepCard>

                        {/* ─── STEP 6 ─── */}
                        <StepCard
                            number="6"
                            title="Marketing & Growth"
                            subtitle="Publishing is just the beginning."
                            icon="📈"
                            side="left"
                            delay={600}
                            badge="Optional"
                            gradient="from-[#8c3541] to-[#6a222d]"
                            glowColor="rose"
                        >
                            <p className="text-umber mb-4">You can enhance visibility with:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <BulletItem color="rose">Social media creatives</BulletItem>
                                <BulletItem color="rose">Amazon Ads management</BulletItem>
                                <BulletItem color="rose">Author interviews</BulletItem>
                                <BulletItem color="rose">Book trailers</BulletItem>
                                <BulletItem color="rose">PR coverage</BulletItem>
                                <BulletItem color="rose">Website creation</BulletItem>
                            </div>
                            <p className="text-umber text-sm mt-4 italic border-l-2 border-rose-500/30 pl-3">
                                Choose marketing packages based on your goals.
                            </p>
                        </StepCard>

                    </div>
                    </div>
                </section>

                {/* ═══ CTA SECTION ═══ */}
                <section className="relative py-24 px-4 sm:px-6 lg:px-8">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-900/10 to-transparent pointer-events-none" />
                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        <div className="p-10 md:p-16 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-linen backdrop-blur-sm relative overflow-hidden">
                            {/* Glow decorations */}
                            <div className="absolute -top-20 -left-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
                            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />

                            <h2 className="text-3xl md:text-4xl font-black mb-4 relative">
                                <span className=" text-ink">
                                    Ready to Publish Your Book?
                                </span>
                            </h2>
                            <p className="text-umber text-lg mb-8 max-w-2xl mx-auto relative">
                                Join thousands of authors who have successfully published their books with PublicationMart. Start your publishing journey today.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
                                <Link
                                    href="/publish"
                                    className="inline-flex items-center px-8 py-4 text-lg font-bold text-white transition-all bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:from-indigo-500 hover:to-purple-500 shadow-[0_0_25px_rgba(79,70,229,0.4)] hover:shadow-[0_0_40px_rgba(79,70,229,0.6)] hover:scale-105 active:scale-95 group"
                                >
                                    Start Publishing Now
                                    <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                                <Link
                                    href="/smart-writer"
                                    className="inline-flex items-center px-8 py-4 text-lg font-semibold text-ink-soft transition-all bg-paper border border-linen rounded-full hover:bg-vellum hover:text-ink hover:border-indigo-500/30 hover:scale-105 active:scale-95"
                                >
                                    Try Smart Writer
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══ GLOBAL STYLES ═══ */}
                <style>{`
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(30px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in-up {
                        animation: fadeInUp 0.8s ease-out forwards;
                        opacity: 0;
                    }
                `}</style>
            </div>
        </>
    );
}

/* ═══════════════════════════════════════════════════
   STEP CARD COMPONENT
   ═══════════════════════════════════════════════════ */
function StepCard({ number, title, subtitle, icon, side, delay, badge, gradient, glowColor, children }) {
    const isRight = side === 'right';
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) setIsVisible(true);
                });
            },
            { threshold: 0.15 }
        );
        if (domRef.current) observer.observe(domRef.current);
        return () => observer.disconnect();
    }, []);

    const glowColors = {
        indigo: 'group-hover:shadow-[0_0_40px_rgba(99,102,241,0.15)]',
        purple: 'group-hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]',
        emerald: 'group-hover:shadow-[0_0_40px_rgba(52,211,153,0.15)]',
        amber: 'group-hover:shadow-[0_0_40px_rgba(245,158,11,0.15)]',
        cyan: 'group-hover:shadow-[0_0_40px_rgba(34,211,238,0.15)]',
        rose: 'group-hover:shadow-[0_0_40px_rgba(244,63,94,0.15)]',
    };

    return (
        <div
            ref={domRef}
            className={`flex flex-col md:flex-row items-start md:items-center relative group
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
                transition-all duration-1000 ease-out`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {/* Number Circle */}
            <div className={`absolute left-6 md:left-1/2 w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-paper font-black text-lg shadow-lg z-10 transform md:-translate-x-1/2 border-4 border-parchment ring-2 ring-linen`}>
                {number}
            </div>

            {/* Left Spacer */}
            {isRight ? <div className="hidden md:block w-1/2" /> : null}

            {/* Content Card */}
            <div className={`w-full md:w-[46%] pl-24 md:pl-0 ${!isRight ? 'md:mr-auto md:pr-14' : 'md:ml-auto md:pl-14'}`}>
                <div className={`bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] p-7 rounded-2xl hover:bg-white/[0.06] hover:border-linen transition-all duration-500 relative overflow-hidden ${glowColors[glowColor] || ''}`}>
                    {/* Subtle corner glow */}
                    <div className={`absolute -top-12 ${isRight ? '-right-12' : '-left-12'} w-28 h-28 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />

                    {/* Header */}
                    <div className={`flex items-start gap-3 mb-2 ${!isRight ? 'md:flex-row-reverse md:text-right' : ''}`}>
                        <span className="text-3xl flex-shrink-0 mt-0.5">{icon}</span>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-xl font-bold text-ink">{title}</h3>
                                {badge && (
                                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 border border-rose-500/20">
                                        {badge}
                                    </span>
                                )}
                            </div>
                            <p className="text-umber text-sm mt-1">{subtitle}</p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className={`w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4`} />

                    {/* Content */}
                    <div className={`${!isRight ? 'md:text-left' : ''}`}>
                        {children}
                    </div>
                </div>
            </div>

            {/* Right Spacer */}
            {!isRight ? <div className="hidden md:block w-1/2" /> : null}

            {/* Connecting lines */}
            <div className={`hidden md:block absolute top-1/2 h-px bg-gradient-to-r from-white/5 to-white/10 w-14 ${isRight ? 'left-1/2' : 'right-1/2'}`} />
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   BULLET ITEM COMPONENT
   ═══════════════════════════════════════════════════ */
function BulletItem({ children, color = 'indigo' }) {
    const dotColors = {
        indigo: 'bg-indigo-400',
        purple: 'bg-purple-400',
        emerald: 'bg-emerald-400',
        amber: 'bg-amber-400',
        cyan: 'bg-cyan-400',
        rose: 'bg-rose-400',
    };

    return (
        <li className="flex items-start gap-3 text-ink-soft text-sm group/item">
            <span className={`w-1.5 h-1.5 rounded-full ${dotColors[color] || dotColors.indigo} mt-1.5 flex-shrink-0 group-hover/item:scale-150 transition-transform duration-300`} />
            <span className="group-hover/item:text-ink transition-colors duration-300">{children}</span>
        </li>
    );
}

