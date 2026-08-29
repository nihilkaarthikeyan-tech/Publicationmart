import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

export default function PremiumPricing({ book }) {
    const [selectedPlan, setSelectedPlan] = useState(null);

    const plans = [
        {
            name: 'Starter',
            originalPrice: 4699,
            discountedPrice: 3299,
            discount: 30,
            books: 1,
            perBook: 3299,
            words: '50,000',
            features: [
                'Advanced AI Writing',
                'AI Image Generation',
                'Auto Formatting',
                'Amazon-Ready*',
                'Priority Support',
                'Marketing Templates',
                'Cover Design Tools'
            ],
            popular: false
        },
        {
            name: 'Growth',
            originalPrice: 10499,
            discountedPrice: 7399,
            discount: 30,
            books: 3,
            perBook: 2466,
            words: '150,000',
            features: [
                'Advanced AI Writing',
                'AI Image Generation',
                'Auto Formatting',
                'Amazon-Ready*',
                'Priority Support',
                'Marketing Templates',
                'Cover Design Tools'
            ],
            popular: false
        },
        {
            name: 'Professional',
            originalPrice: 15999,
            discountedPrice: 11499,
            discount: 30,
            books: 5,
            perBook: 2300,
            words: '250,000',
            features: [
                'Advanced AI Writing',
                'AI Image Generation',
                'Auto Formatting',
                'Amazon-Ready*',
                'Priority Support',
                'Marketing Templates',
                'Cover Design Tools'
            ],
            popular: true
        },
        {
            name: 'Studio',
            originalPrice: 32999,
            discountedPrice: 22999,
            discount: 30,
            books: 15,
            perBook: 1533,
            words: '750,000',
            features: [
                'Advanced AI Writing',
                'AI Image Generation',
                'Auto Formatting',
                'Amazon-Ready*',
                'Priority Support',
                'Marketing Templates',
                'Cover Design Tools'
            ],
            popular: false
        }
    ];

    const handleSelectPlan = async (plan) => {
        const host = window.location.hostname;
        const isTestDomain = host.includes('radinfotec') || host === 'localhost' || host === '127.0.0.1';

        if (isTestDomain) {
            try {
                const response = await axios.post(route('ai-studio.save-plan', book.id), {
                    plan_type: 'premium',
                    plan_name: plan.name.toLowerCase()
                });
                if (response.data.payment_url) {
                    window.location.href = response.data.payment_url;
                    return;
                }
            } catch (e) {
                // Fall through to payment page on error
            }
        }

        router.visit(route('ai-studio.payment', { book: book.id, plan: plan.name.toLowerCase(), type: 'premium' }));
    };

    return (
        <>
            <Head title="Premium Plans - AI Studio" />
            <div className="min-h-screen bg-parchment">
                {/* TOP-LEFT BACK BUTTON - ALWAYS VISIBLE */}
                <Link
                    href={route('ai-studio.show', book.id)}
                    className="fixed top-4 left-4 z-[100] flex items-center gap-2 px-4 py-2 bg-paper/90 backdrop-blur-md border border-linen rounded-lg text-ink-soft hover:text-ink hover:bg-paper transition-all shadow-lg"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    <span className="text-sm font-medium">Back</span>
                </Link>

                {/* STEPPER HEADER - ALWAYS VISIBLE AT TOP CENTER */}
                <header className="bg-paper/90 backdrop-blur-md border-b border-linen sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-center">
                        {/* Progress Stepper - VISIBLE ON ALL SCREENS */}
                        <div className="flex items-center gap-1 md:gap-2 text-sm">
                            {['Setup', 'Outline', 'Structure', 'Write', 'Export'].map((label, i) => (
                                <div key={i} className="flex items-center gap-1 md:gap-2 text-umber">
                                    <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center border-2 transition-all text-xs md:text-sm border-linen-deep text-umber`}>
                                        {i + 1}
                                    </div>
                                    <span className="hidden md:inline text-xs font-semibold uppercase tracking-wider">
                                        {label}
                                    </span>
                                    {i < 4 && <div className="w-3 md:w-6 h-px mx-0.5 md:mx-1 bg-linen-deep" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Book Title Bar */}
                    <div className="h-12 border-t border-linen flex items-center justify-between px-6 bg-vellum/80">
                        <div className="flex items-center gap-2 pl-20 md:pl-24">
                            <span className="text-indigo-700">✨</span>
                            <span className="font-bold text-ink text-sm md:text-base truncate max-w-[120px] md:max-w-none">{book.title || 'AI Studio'}</span>
                            <span className="text-[10px] bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-400/30 font-bold uppercase tracking-wider">Premium Plans</span>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto py-16 px-4 relative">
                    {/* Background Effects */}
                    <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[128px] pointer-events-none"></div>
                    <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-600/15 rounded-full blur-[128px] pointer-events-none"></div>

                    {/* Header */}
                    <div className="text-center mb-12 relative z-10">
                        <span className="inline-block py-1 px-3 rounded-full bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border border-indigo-400/30 text-indigo-700 text-[10px] font-bold uppercase tracking-wider mb-4">
                            Premium Writing Plans
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold text-ink mb-4 tracking-tight">
                            Unlock <span className=" text-oxblood">Premium Power</span>
                        </h1>
                        <p className="text-base text-ink-soft max-w-xl mx-auto">
                            Experience advanced AI writing with stunning image generation for your bestseller.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`relative group ${plan.popular ? 'md:-translate-y-4' : ''}`}
                            >
                                {/* Popular badge and glow effect */}
                                {plan.popular && (
                                    <>
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                                            <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                                                Most Popular
                                            </span>
                                        </div>
                                    </>
                                )}

                                <div className={`relative bg-paper rounded-2xl h-full flex flex-col overflow-hidden border ${plan.popular ? 'border-indigo-500/50' : 'border-linen hover:border-cyan-500/30'} transition-all duration-300`}>
                                    <div className="p-6 flex flex-col h-full bg-paper">
                                        {/* Plan Name */}
                                        <h3 className={`text-xl font-bold mb-4 ${plan.popular ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400' : 'text-white'}`}>
                                            {plan.name}
                                        </h3>

                                        {/* Pricing */}
                                        <div className="mb-2">
                                            <span className="text-2xl font-bold text-umber line-through">₹{plan.originalPrice}</span>
                                        </div>
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className={`text-3xl font-bold ${plan.popular ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400' : 'text-cyan-700'}`}>
                                                ₹{plan.discountedPrice}
                                            </span>
                                            <span className="text-xs text-orange-800 font-bold">-{plan.discount}%</span>
                                        </div>

                                        {/* Books info */}
                                        <div className="mb-1">
                                            <span className="text-ink font-semibold">{plan.books} {plan.books === 1 ? 'Book' : 'Books'}</span>
                                        </div>
                                        <div className="text-xs text-umber mb-4">
                                            ₹{plan.perBook.toFixed(0)} per Book
                                        </div>

                                        {/* Words */}
                                        <div className="flex items-center gap-2 mb-4 py-2 border-t border-b border-linen">
                                            <svg className={`w-4 h-4 ${plan.popular ? 'text-cyan-700' : 'text-indigo-700'}`} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-ink font-semibold text-sm">{plan.words} WORDS</span>
                                        </div>

                                        {/* Features */}
                                        <div className="flex-1 space-y-3 mb-6">
                                            {plan.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <svg className={`w-4 h-4 flex-shrink-0 ${plan.popular ? 'text-cyan-700' : 'text-indigo-700'}`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="text-sm text-ink-soft">{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* CTA Button - DISABLED */}
                                        <button
                                            disabled
                                            className="w-full py-3 font-bold text-sm rounded-lg transition-all duration-300 bg-gray-100 text-umber border border-gray-700/30 cursor-not-allowed"
                                        >
                                            COMING SOON
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer note */}
                    <div className="text-center mt-12 relative z-10">
                        <p className="text-xs text-umber">* Amazon-Ready formatting for Kindle Direct Publishing</p>
                        <p className="text-xs text-indigo-700 mt-2">Premium includes all Pro features plus AI Image Generation</p>
                    </div>
                </main>
            </div>
        </>
    );
}


// Full-screen page: renders its own chrome, so the global Layout stays off.
PremiumPricing.layout = null;
