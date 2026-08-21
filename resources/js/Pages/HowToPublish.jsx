import { Link, Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function HowToPublish({ auth }) {
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

            <div className="min-h-screen bg-[#1e1535] text-white selection:bg-indigo-500 selection:text-white overflow-x-hidden">

                {/* ═══ HERO SECTION ═══ */}
                <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    {/* Background Glows */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-indigo-600/15 blur-[150px] rounded-full pointer-events-none -z-10" />
                    <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

                    <div className="text-center mb-8 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
                            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                            Complete Publishing Guide
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
                            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                                How to Publish Your Book
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                with PublicationMart
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            Publishing your book has never been easier. Whether you're a first-time writer or an experienced author,
                            PublicationMart gives you the tools, guidance, and distribution network to turn your manuscript into a
                            professionally published book.
                        </p>
                        <p className="mt-6 text-base text-gray-500 italic">Here's how the process works.</p>
                    </div>
                </section>

                {/* ═══ STEPS TIMELINE ═══ */}
                <section className="relative pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
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
                            gradient="from-indigo-500 to-blue-600"
                            glowColor="indigo"
                        >
                            <p className="text-gray-400 mb-4">Use our <span className="text-indigo-300 font-semibold">Smart Writing</span> tool to:</p>
                            <ul className="space-y-2">
                                <BulletItem>Draft chapters effortlessly</BulletItem>
                                <BulletItem>Structure your book properly</BulletItem>
                                <BulletItem>Refine grammar and clarity</BulletItem>
                                <BulletItem>Generate supporting content and visuals</BulletItem>
                            </ul>
                            <p className="text-gray-500 text-sm mt-4 italic border-l-2 border-indigo-500/30 pl-3">
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
                            gradient="from-purple-500 to-pink-600"
                            glowColor="purple"
                        >
                            <p className="text-gray-400 mb-4">Our platform has a <span className="text-purple-300 font-semibold">DIY tool</span> which:</p>
                            <ul className="space-y-2">
                                <BulletItem color="purple">Formats your interior layout</BulletItem>
                                <BulletItem color="purple">Sets margins and trim sizes</BulletItem>
                                <BulletItem color="purple">Creates print-ready and eBook-ready files</BulletItem>
                                <BulletItem color="purple">Ensures publishing compliance standards</BulletItem>
                            </ul>
                            <p className="text-gray-500 text-sm mt-4 italic border-l-2 border-purple-500/30 pl-3">
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
                            gradient="from-emerald-500 to-teal-600"
                            glowColor="emerald"
                        >
                            <p className="text-gray-400 mb-4">Choose from:</p>
                            <ul className="space-y-2">
                                <BulletItem color="emerald">Custom-designed covers</BulletItem>
                                <BulletItem color="emerald">Template-based professional designs</BulletItem>
                                <BulletItem color="emerald">AI-assisted visual creation</BulletItem>
                            </ul>
                            <p className="text-gray-500 text-sm mt-4 italic border-l-2 border-emerald-500/30 pl-3">
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
                            gradient="from-amber-500 to-orange-600"
                            glowColor="amber"
                        >
                            <p className="text-gray-400 mb-4">We handle:</p>
                            <ul className="space-y-2">
                                <BulletItem color="amber">ISBN allocation</BulletItem>
                                <BulletItem color="amber">Metadata optimization</BulletItem>
                                <BulletItem color="amber">Category selection</BulletItem>
                                <BulletItem color="amber">Pricing setup</BulletItem>
                                <BulletItem color="amber">Author royalty configuration</BulletItem>
                            </ul>
                            <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span className="text-amber-300 text-sm font-medium">You retain 100% of your rights and royalties.</span>
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
                            gradient="from-cyan-500 to-blue-600"
                            glowColor="cyan"
                        >
                            <p className="text-gray-400 mb-4">Distribution includes:</p>
                            <ul className="space-y-2">
                                <BulletItem color="cyan">eBook publishing</BulletItem>
                                <BulletItem color="cyan">Paperback publishing</BulletItem>
                                <BulletItem color="cyan">Online marketplace listing</BulletItem>
                                <BulletItem color="cyan">Indian and international availability</BulletItem>
                            </ul>
                            <p className="text-gray-500 text-sm mt-4 italic border-l-2 border-cyan-500/30 pl-3">
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
                            gradient="from-rose-500 to-pink-600"
                            glowColor="rose"
                        >
                            <p className="text-gray-400 mb-4">You can enhance visibility with:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <BulletItem color="rose">Social media creatives</BulletItem>
                                <BulletItem color="rose">Amazon Ads management</BulletItem>
                                <BulletItem color="rose">Author interviews</BulletItem>
                                <BulletItem color="rose">Book trailers</BulletItem>
                                <BulletItem color="rose">PR coverage</BulletItem>
                                <BulletItem color="rose">Website creation</BulletItem>
                            </div>
                            <p className="text-gray-500 text-sm mt-4 italic border-l-2 border-rose-500/30 pl-3">
                                Choose marketing packages based on your goals.
                            </p>
                        </StepCard>

                    </div>
                </section>

                {/* ═══ CTA SECTION ═══ */}
                <section className="relative py-24 px-4 sm:px-6 lg:px-8">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-900/10 to-transparent pointer-events-none" />
                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        <div className="p-10 md:p-16 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm relative overflow-hidden">
                            {/* Glow decorations */}
                            <div className="absolute -top-20 -left-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
                            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />

                            <h2 className="text-3xl md:text-4xl font-black mb-4 relative">
                                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                    Ready to Publish Your Book?
                                </span>
                            </h2>
                            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto relative">
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
                                    className="inline-flex items-center px-8 py-4 text-lg font-semibold text-gray-300 transition-all bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:text-white hover:border-indigo-500/30 hover:scale-105 active:scale-95"
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
            <div className={`absolute left-6 md:left-1/2 w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black text-lg shadow-lg z-10 transform md:-translate-x-1/2 border-4 border-[#1e1535] ring-2 ring-white/10`}>
                {number}
            </div>

            {/* Left Spacer */}
            {isRight ? <div className="hidden md:block w-1/2" /> : null}

            {/* Content Card */}
            <div className={`w-full md:w-[46%] pl-24 md:pl-0 ${!isRight ? 'md:mr-auto md:pr-14' : 'md:ml-auto md:pl-14'}`}>
                <div className={`bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] p-7 rounded-2xl hover:bg-white/[0.06] hover:border-white/15 transition-all duration-500 relative overflow-hidden ${glowColors[glowColor] || ''}`}>
                    {/* Subtle corner glow */}
                    <div className={`absolute -top-12 ${isRight ? '-right-12' : '-left-12'} w-28 h-28 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />

                    {/* Header */}
                    <div className={`flex items-start gap-3 mb-2 ${!isRight ? 'md:flex-row-reverse md:text-right' : ''}`}>
                        <span className="text-3xl flex-shrink-0 mt-0.5">{icon}</span>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-xl font-bold text-white">{title}</h3>
                                {badge && (
                                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-300 border border-rose-500/20">
                                        {badge}
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
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
        <li className="flex items-start gap-3 text-gray-300 text-sm group/item">
            <span className={`w-1.5 h-1.5 rounded-full ${dotColors[color] || dotColors.indigo} mt-1.5 flex-shrink-0 group-hover/item:scale-150 transition-transform duration-300`} />
            <span className="group-hover/item:text-white transition-colors duration-300">{children}</span>
        </li>
    );
}

