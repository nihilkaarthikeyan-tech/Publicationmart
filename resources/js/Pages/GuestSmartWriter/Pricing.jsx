import { Head, Link } from '@inertiajs/react';
import { useRef, useState, useEffect } from 'react';
import Layout from '@/Layouts/Layout';

export default function SmartWritingTool({ auth }) {
    const proGridRef = useRef(null);
    const premiumGridRef = useRef(null);
    const [activeTier, setActiveTier] = useState(null); // null | 'pro' | 'premium'

    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        setIsVisible(true);
    }, []);

    const scrollToPro = () => {
        setActiveTier('pro');
        setTimeout(() => proGridRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    };

    const scrollToPremium = () => {
        setActiveTier('premium');
        setTimeout(() => premiumGridRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    };

    const proPlans = [
        {
            id: 'saver',
            name: 'Saver',
            price: 2999,
            pages: '80-100',
            originalPrice: 4299,
            features: ['80 - 100 Pages', 'A-Z Writing Assist', 'Auto Formatting', 'Free ISBN Number', 'Global Distribution'],
        },
        {
            id: 'standard',
            name: 'Standard',
            price: 3499,
            pages: '100-150',
            originalPrice: 4999,
            features: ['100 - 150 Pages', 'A-Z Writing Assist', 'Auto Formatting', 'Free ISBN Number', 'Global Distribution'],
        },
        {
            id: 'pro',
            name: 'Pro',
            price: 3999,
            pages: '150-200',
            originalPrice: 5699,
            features: ['150 - 200 Pages', 'A-Z Writing Assist', 'Auto Formatting', 'Free ISBN Number', 'Global Distribution'],
            popular: true,
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 4499,
            pages: '200-250',
            originalPrice: 6499,
            features: ['200 - 250 Pages', 'A-Z Writing Assist', 'Auto Formatting', 'Free ISBN Number', 'Global Distribution'],
        },
    ];

    const premiumPlans = [
        {
            id: 'saver',
            name: 'Saver',
            price: 5999,
            pages: '80-100',
            originalPrice: 7999,
            features: ['80 - 100 Pages', 'Advanced Smart Writer Engine', 'Smart Writer Art Studio', 'Priority Support', 'Auto Formatting', 'Free ISBN Number', 'Global Distribution'],
        },
        {
            id: 'standard',
            name: 'Standard',
            price: 7499,
            pages: '100-150',
            originalPrice: 9999,
            features: ['100 - 150 Pages', 'Advanced Smart Writer Engine', 'Smart Writer Art Studio', 'Priority Support', 'Auto Formatting', 'Free ISBN Number', 'Global Distribution'],
        },
        {
            id: 'pro',
            name: 'Pro',
            price: 8999,
            pages: '150-200',
            originalPrice: 11999,
            features: ['150 - 200 Pages', 'Advanced Smart Writer Engine', 'Smart Writer Art Studio', 'Priority Support', 'Auto Formatting', 'Free ISBN Number', 'Global Distribution'],
            popular: true,
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 10999,
            pages: '200-250',
            originalPrice: 14999,
            features: ['200 - 250 Pages', 'Advanced Smart Writer Engine', 'Smart Writer Art Studio', 'Priority Support', 'Auto Formatting', 'Free ISBN Number', 'Global Distribution'],
        },
    ];

    return (
        <Layout>
            <Head title="Smart Writing Tool - PublicationMart" />

            <div className="min-h-screen bg-[#17150f] text-white font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">

                {/* ═══ HERO SECTION ═══ */}
                <section className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-indigo-600/15 blur-[150px] rounded-full pointer-events-none -z-10" />
                    <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

                    <div className={`text-center mb-12 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        {/* Badge */}
                        <div className="inline-flex items-center gap-3 px-5 py-2 mb-8 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-gray-300">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-r border-white/20 pr-3">IN INDIA'S FIRST</span>
                            <span className="flex items-center gap-2">
                                Smart Writer-Powered Book Writing &amp; Publishing Platform
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight leading-tight">
                            <span className="text-white">Turn Ideas into Books</span>
                            <br />
                            <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">— Automatically</span>
                        </h1>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                            The PublicationMart Smart Writing Tool helps authors transform ideas into structured manuscripts quickly and efficiently.
                        </p>
                    </div>

                    {/* ═══ PRO vs PREMIUM TIER CARDS ═══ */}
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

                        {/* PRO CARD */}
                        <div className="relative bg-white/[0.04] border border-white/10 rounded-3xl p-8 hover:border-indigo-500/30 hover:bg-white/[0.06] transition-all duration-300 group">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/5 to-transparent rounded-3xl pointer-events-none" />
                            <h3 className="text-2xl font-bold text-white mb-1">Pro</h3>
                            <p className="text-gray-400 text-sm mb-6">Perfect for getting started with Smart Writer</p>
                            <ul className="space-y-4 mb-8">
                                <TierFeature icon="✏️" title="Smart Writing Tool" desc="Generate chapters, outlines, and content effortlessly." />
                                <TierFeature icon="📄" title="Auto Formatting" desc="Professional book layout and structure." />
                                <TierFeature icon="📦" title="Amazon-Ready Export" desc="Export in KDP-ready formats." />
                            </ul>
                            <button
                                onClick={scrollToPro}
                                className="w-full py-3.5 border border-white/20 text-white font-bold rounded-xl hover:bg-white/10 transition-all text-sm tracking-wider uppercase"
                            >
                                View Pro Plans →
                            </button>
                        </div>

                        {/* PREMIUM CARD - DISABLED */}
                        <div className="relative bg-[#0d1a2a] border border-gray-700/40 rounded-3xl p-8 opacity-60 group overflow-hidden">
                            {/* Premium badge */}
                            <div className="absolute top-5 right-5">
                                <span className="bg-gray-700 text-gray-400 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                                    COMING SOON
                                </span>
                            </div>
                            <div className="absolute top-0 right-0 w-48 h-48 bg-gray-600/10 rounded-full blur-[60px] pointer-events-none" />

                            <h3 className="text-2xl font-bold text-gray-400 mb-1">Premium</h3>
                            <p className="text-gray-500 text-sm mb-6">Complete suite for professional authors</p>
                            <ul className="space-y-4 mb-8">
                                <TierFeature icon="🤖" title="Advanced Smart Writer Engine" desc="Superior models for bestseller-quality prose." color="gray" />
                                <TierFeature icon="🎨" title="Smart Writer Art Studio" desc="Stunning visuals for covers and headers." color="gray" />
                                <TierFeature icon="⭐" title="Priority Support" desc="Get help when you need it most." color="gray" />
                            </ul>
                            <button
                                disabled
                                className="w-full py-3.5 bg-gray-700/20 border border-gray-700/40 text-gray-500 font-bold rounded-xl cursor-not-allowed text-sm tracking-wider uppercase"
                            >
                                Coming Soon
                            </button>
                        </div>
                    </div>
                </section>

                {/* ═══ HOW IT WORKS ═══ */}
                <section className="relative pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black mb-4"><span className="text-white">From Idea to Manuscript</span> <span className="text-gray-500 font-normal">in Minutes</span></h2>
                        <p className="text-gray-400">Here is how the Smart Writing Tool accelerates your process.</p>
                    </div>
                    <div className="absolute left-6 md:left-1/2 top-32 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-purple-500/30 to-transparent md:-translate-x-1/2 transform" />
                    <div className="space-y-16 md:space-y-24">
                        <StepCard number="1" title="Instant First Draft" subtitle="Within 120 Seconds" icon="⚡" side="right" delay={100} gradient="from-indigo-500 to-purple-600" glowColor="indigo">
                            <p className="text-gray-400 mb-4">Simply enter your book idea, topic, or prompt — and the system generates:</p>
                            <ul className="space-y-2">
                                <BulletItem color="indigo">A structured content outline</BulletItem>
                                <BulletItem color="indigo">Suggested chapter breakdown</BulletItem>
                                <BulletItem color="indigo">Key themes and flow direction</BulletItem>
                            </ul>
                        </StepCard>
                        <StepCard number="2" title="Outline Review & Approval" subtitle="You Remain Fully in Control" icon="🛡️" side="left" delay={200} gradient="from-purple-500 to-pink-600" glowColor="purple">
                            <p className="text-gray-400 mb-4">Before the manuscript is developed, you can:</p>
                            <ul className="space-y-2">
                                <BulletItem color="purple">Review the proposed structure</BulletItem>
                                <BulletItem color="purple">Edit or rearrange chapters</BulletItem>
                                <BulletItem color="purple">Add or remove sections</BulletItem>
                                <BulletItem color="purple">Adjust tone and direction</BulletItem>
                            </ul>
                        </StepCard>
                        <StepCard number="3" title="Automatic Full Draft" subtitle="Ready for Review & Refinement" icon="🚀" side="right" delay={300} gradient="from-pink-500 to-rose-600" glowColor="rose">
                            <p className="text-gray-400 mb-4">Once approved, the system generates the complete manuscript. It expands chapters, maintains consistency, and ensures smooth flow.</p>
                            <p className="text-gray-500 text-sm mt-4 italic border-l-2 border-pink-500/30 pl-3">Within minutes, you receive a complete first draft ready for your review.</p>
                        </StepCard>
                    </div>
                </section>

                {/* ═══ WHO IT IS FOR ═══ */}
                <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-black mb-6">Built for Authors at Every Level</h2>
                                <p className="text-gray-400 mb-10 text-lg">The Smart Writing Tool simplifies the process and reduces the time required to complete your manuscript.</p>
                                <div className="space-y-6">
                                    <FeatureRow icon="✍️" title="First-time Writers" desc="Needing structure and guidance to start their journey." />
                                    <FeatureRow icon="💼" title="Busy Professionals" desc="Turning expertise into a book efficiently." />
                                    <FeatureRow icon="🚀" title="Content Creators" desc="Expanding into publishing with speed and quality." />
                                </div>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                                <div className="relative bg-[#0d1220] border border-orange-500/30 rounded-3xl p-8 md:p-10">
                                    <div className="absolute top-0 right-0 p-6 opacity-10 text-8xl grayscale pointer-events-none">⚠️</div>
                                    <h3 className="text-2xl font-bold text-orange-400 mb-4 flex items-center gap-3">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        Author Responsibility
                                    </h3>
                                    <p className="text-gray-300 mb-6 leading-relaxed">The Smart Writing Tool is designed to assist — not replace — the author. All AI-generated content serves as a foundation and must be:</p>
                                    <ul className="space-y-3 text-gray-400 mb-8">
                                        <li className="flex items-center gap-3"><span className="text-orange-500">✔</span> Carefully reviewed by you</li>
                                        <li className="flex items-center gap-3"><span className="text-orange-500">✔</span> Fact-checked (especially for non-fiction)</li>
                                        <li className="flex items-center gap-3"><span className="text-orange-500">✔</span> Edited for accuracy and originality</li>
                                        <li className="flex items-center gap-3"><span className="text-orange-500">✔</span> Aligned with your personal voice</li>
                                    </ul>
                                    <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20">
                                        <p className="text-xs text-orange-200 italic">"Publishing a book is a serious commitment. While AI accelerates writing, quality, credibility, and integrity depend on thoughtful human oversight."</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══ PRO PRICING GRID ═══ */}
                <div ref={proGridRef} className="pt-24 pb-16 relative z-10 border-t border-white/5 bg-[#17150f]">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">Pro Plans</span>
                            <h2 className="text-4xl font-black text-white mb-4">Select Your Pro Plan</h2>
                            <p className="text-gray-400 text-lg">Choose a plan based on your desired book length.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {proPlans.map((plan) => (
                                <PricingCard key={plan.id} plan={plan} tier="pro" accentClass="indigo" />
                            ))}
                        </div>
                        <div className="text-center mt-10">
                            <button onClick={scrollToPremium} className="text-sm text-gray-500 hover:text-cyan-400 transition-colors underline underline-offset-4">
                                Looking for more features? View Premium Plans →
                            </button>
                        </div>
                    </div>
                </div>

                {/* ═══ PREMIUM PRICING GRID - COMING SOON ═══ */}
                <div ref={premiumGridRef} className="pt-16 pb-32 relative z-10 bg-[#090e19]">
                    <div className="max-w-7xl mx-auto px-6">
                        {/* Premium Coming Soon Message */}
                        <div className="flex items-center justify-center mb-16">
                            <div className="text-center">
                                <span className="inline-block px-4 py-1.5 rounded-full bg-gray-700/20 border border-gray-700/40 text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Premium Plans</span>
                                <h2 className="text-4xl font-black text-gray-400 mb-2">Premium Plans Coming Soon</h2>
                                <p className="text-gray-500">We're preparing an enhanced experience. Stay tuned for premium features!</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </Layout>
    );
}

/* ═══ HELPER COMPONENTS ═══ */

function TierFeature({ icon, title, desc, color = 'indigo' }) {
    let checkColor = 'text-indigo-400';
    let titleColor = 'text-white';
    let descColor = 'text-gray-500';

    if (color === 'cyan') {
        checkColor = 'text-cyan-400';
    } else if (color === 'gray') {
        checkColor = 'text-gray-500';
        titleColor = 'text-gray-400';
        descColor = 'text-gray-600';
    }

    return (
        <li className="flex items-start gap-3">
            <span className={`mt-0.5 shrink-0 ${checkColor}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </span>
            <div>
                <span className={`font-bold text-sm ${titleColor}`}>{title}</span>
                <p className={`text-xs mt-0.5 ${descColor}`}>{desc}</p>
            </div>
        </li>
    );
}

function PricingCard({ plan, tier, accentClass }) {
    const isPremium = tier === 'premium';
    const borderColor = plan.popular
        ? (isPremium ? 'border-cyan-500/50' : 'border-indigo-500/50')
        : 'border-white/10';
    const btnClass = plan.popular
        ? (isPremium
            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/30'
            : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30')
        : (isPremium
            ? 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/50'
            : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-indigo-500/30 hover:text-indigo-400');
    const glowGradient = isPremium
        ? 'from-cyan-500 to-blue-500'
        : 'from-indigo-500 to-purple-500';
    const badgeColor = isPremium
        ? 'bg-cyan-500 text-white'
        : 'bg-indigo-500 text-white';

    return (
        <div className={`relative flex flex-col group ${plan.popular ? 'lg:-translate-y-4' : ''}`}>
            {plan.popular && (
                <>
                    <div className={`absolute -inset-[2px] bg-gradient-to-r ${glowGradient} rounded-[22px] blur opacity-75 group-hover:opacity-100 transition duration-1000`}></div>
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                        <span className={`${badgeColor} text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-xl`}>Most Popular</span>
                    </div>
                </>
            )}
            <div className={`relative flex flex-col h-full bg-[#0d1220] rounded-[20px] border ${borderColor} overflow-hidden transition-all duration-300 group-hover:border-${accentClass}-500/30 group-hover:transform group-hover:-translate-y-1 group-hover:shadow-2xl`}>
                <div className="p-8 pb-32 flex-1">
                    <h3 className="text-xl font-black text-white mb-4 uppercase tracking-wider">{plan.name}</h3>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-black text-white">₹{plan.price.toLocaleString('en-IN')}</span>
                        <span className="text-sm text-gray-500 line-through">₹{plan.originalPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="mb-8 p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className={`text-${accentClass}-400 text-sm font-bold flex items-center gap-2`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                            {plan.pages} Pages
                        </span>
                    </div>
                    <ul className="space-y-4">
                        {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                                <svg className={`w-5 h-5 text-${accentClass}-500 shrink-0 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                <span className="text-sm text-gray-400 font-medium group-hover:text-gray-300 transition-colors">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8 pt-0 bg-gradient-to-t from-[#0d1220] via-[#0d1220] to-transparent">
                    <Link
                        href={route('guest-writer.setup', { plan: plan.id, pages: plan.pages, tier })}
                        className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2 ${btnClass}`}
                    >
                        Start Writing →
                    </Link>
                </div>
            </div>
        </div>
    );
}

function StepCard({ number, title, subtitle, icon, side, delay, gradient, glowColor, children }) {
    const isRight = side === 'right';
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef();
    useEffect(() => {
        const observer = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) setIsVisible(true); }); }, { threshold: 0.15 });
        if (domRef.current) observer.observe(domRef.current);
        return () => observer.disconnect();
    }, []);
    const glowColors = { indigo: 'group-hover:shadow-[0_0_40px_rgba(99,102,241,0.15)]', purple: 'group-hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]', rose: 'group-hover:shadow-[0_0_40px_rgba(244,63,94,0.15)]' };
    return (
        <div ref={domRef} className={`flex flex-col md:flex-row items-start md:items-center relative group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 ease-out`} style={{ transitionDelay: `${delay}ms` }}>
            <div className={`absolute left-6 md:left-1/2 w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black text-lg shadow-lg z-10 transform md:-translate-x-1/2 border-4 border-[#17150f] ring-2 ring-white/10`}>{number}</div>
            {isRight ? <div className="hidden md:block w-1/2" /> : null}
            <div className={`w-full md:w-[46%] pl-24 md:pl-0 ${!isRight ? 'md:mr-auto md:pr-14' : 'md:ml-auto md:pl-14'}`}>
                <div className={`bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] p-8 rounded-2xl hover:bg-white/[0.06] hover:border-white/15 transition-all duration-500 relative overflow-hidden ${glowColors[glowColor] || ''}`}>
                    <div className={`absolute -top-12 ${isRight ? '-right-12' : '-left-12'} w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />
                    <div className={`flex items-start gap-3 mb-2 ${!isRight ? 'md:flex-row-reverse md:text-right' : ''}`}>
                        <span className="text-3xl flex-shrink-0 mt-0.5">{icon}</span>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
                            <p className="text-gray-500 text-sm font-mono">{subtitle}</p>
                        </div>
                    </div>
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4" />
                    <div className={`${!isRight ? 'md:text-left' : ''}`}>{children}</div>
                </div>
            </div>
            {!isRight ? <div className="hidden md:block w-1/2" /> : null}
            <div className={`hidden md:block absolute top-1/2 h-px bg-gradient-to-r from-white/5 to-white/10 w-14 ${isRight ? 'left-1/2' : 'right-1/2'}`} />
        </div>
    );
}

function BulletItem({ children, color = 'indigo' }) {
    const dotColors = { indigo: 'bg-indigo-400', purple: 'bg-purple-400', rose: 'bg-rose-400' };
    return (
        <li className="flex items-start gap-3 text-gray-300 text-sm group/item">
            <span className={`w-1.5 h-1.5 rounded-full ${dotColors[color] || dotColors.indigo} mt-1.5 flex-shrink-0 group-hover/item:scale-150 transition-transform duration-300`} />
            <span className="group-hover/item:text-white transition-colors duration-300">{children}</span>
        </li>
    );
}

function FeatureRow({ icon, title, desc }) {
    return (
        <div className="flex gap-5 p-4 rounded-2xl hover:bg-white/5 transition-colors duration-300 border border-transparent hover:border-white/5">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-xl backdrop-blur-sm">{icon}</div>
            <div>
                <h4 className="font-bold text-white text-lg">{title}</h4>
                <p className="text-sm text-gray-400 mt-1">{desc}</p>
            </div>
        </div>
    );
}
