import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

export default function ProPricing({ book }) {
    const [selectedPlan, setSelectedPlan] = useState(null);

    const plans = [
        {
            name: 'Saver',
            originalPrice: 4299,
            discountedPrice: 2999,
            discount: 30,
            books: 1,
            pages: '80 - 100 Pages',
            features: [
                'A-Z Writing Assist',
                'Auto Formatting',
                'Free ISBN Number',
                'Global Distribution',
                'Standard 6x9 Size'
            ],
            popular: false
        },
        {
            name: 'Standard',
            originalPrice: 4999,
            discountedPrice: 3499,
            discount: 30,
            books: 1,
            pages: '100 - 150 Pages',
            features: [
                'A-Z Writing Assist',
                'Auto Formatting',
                'Free ISBN Number',
                'Global Distribution',
                'Standard 6x9 Size'
            ],
            popular: false
        },
        {
            name: 'Pro',
            originalPrice: 5699,
            discountedPrice: 3999,
            discount: 30,
            books: 1,
            pages: '150 - 200 Pages',
            features: [
                'A-Z Writing Assist',
                'Auto Formatting',
                'Free ISBN Number',
                'Global Distribution',
                'Standard 6x9 Size'
            ],
            popular: true
        },
        {
            name: 'Enterprise',
            originalPrice: 6499,
            discountedPrice: 4499,
            discount: 30,
            books: 1,
            pages: '200 - 250 Pages',
            features: [
                'A-Z Writing Assist',
                'Auto Formatting',
                'Free ISBN Number',
                'Global Distribution',
                'Standard 6x9 Size'
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
                    plan_type: 'publishing',
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

        router.visit(route('ai-studio.payment', { book: book.id, plan: plan.name.toLowerCase(), type: 'publishing' }));
    };

    return (
        <>
            <Head title="Pro Plans - AI Book Studio" />
            <div className="min-h-screen bg-[#17150f]">
                {/* TOP-LEFT BACK BUTTON - ALWAYS VISIBLE */}
                <Link
                    href={route('ai-studio.show', book.id)}
                    className="fixed top-4 left-4 z-[100] flex items-center gap-2 px-4 py-2 bg-[#0d1220]/90 backdrop-blur-md border border-white/10 rounded-lg text-gray-300 hover:text-white hover:bg-[#0d1220] transition-all shadow-lg"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    <span className="text-sm font-medium">Back</span>
                </Link>

                {/* STEPPER HEADER - ALWAYS VISIBLE AT TOP CENTER */}
                <header className="bg-[#0d1220]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-center">
                        {/* Progress Stepper - VISIBLE ON ALL SCREENS */}
                        <div className="flex items-center gap-1 md:gap-2 text-sm">
                            {['Setup', 'Outline', 'Structure', 'Write', 'Export'].map((label, i) => (
                                <div key={i} className="flex items-center gap-1 md:gap-2 text-gray-500">
                                    <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center border-2 transition-all text-xs md:text-sm border-gray-600/50 text-gray-500`}>
                                        {i + 1}
                                    </div>
                                    <span className="hidden md:inline text-xs font-semibold uppercase tracking-wider">
                                        {label}
                                    </span>
                                    {i < 4 && <div className="w-3 md:w-6 h-px mx-0.5 md:mx-1 bg-gray-700" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Book Title Bar */}
                    <div className="h-12 border-t border-white/5 flex items-center justify-between px-6 bg-[#0a0f1a]/80">
                        <div className="flex items-center gap-2 pl-20 md:pl-24">
                            <span className="text-indigo-400">✨</span>
                            <span className="font-bold text-white text-sm md:text-base truncate max-w-[120px] md:max-w-none">{book.title || 'AI Studio'}</span>
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-400/30 font-bold uppercase tracking-wider">Pro Plans</span>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto py-16 px-4 relative">
                    {/* Background Effects */}
                    <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[128px] pointer-events-none"></div>
                    <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[128px] pointer-events-none"></div>

                    {/* Header */}
                    <div className="text-center mb-12 relative z-10">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">INDIA'S NEXT GEN</span>
                            <span className="text-gray-400 text-xs">| AI-Powered Book Writing & Publishing Platform 🟢</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight leading-tight">
                            Turn Ideas into Books<br />
                            <span className="relative inline-block mt-2">
                                —— Automatically
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-500 blur-sm opacity-50"></div>
                            </span>
                        </h1>
                        <p className="text-gray-400 max-w-xl mx-auto mt-6">
                            Select a plan based on your desired book length. 6x9 Standard Size included.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`relative group ${plan.popular ? 'lg:-translate-y-4' : ''}`}
                            >
                                {/* Popular badge and glow effect */}
                                {plan.popular && (
                                    <>
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                                            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                                                Most Popular
                                            </span>
                                        </div>
                                    </>
                                )}

                                <div className={`relative bg-[#0d1220] rounded-2xl h-full flex flex-col overflow-hidden border ${plan.popular ? 'border-indigo-500/50' : 'border-white/10 hover:border-indigo-500/30'} transition-all duration-300`}>
                                    <div className="p-8 flex flex-col h-full bg-[#0a0f1a]">
                                        {/* Plan Name */}
                                        <h3 className="text-xl font-bold text-white mb-1">
                                            {plan.name}
                                        </h3>

                                        {/* Pricing */}
                                        <div className="flex items-center gap-2 mb-1 mt-4">
                                            <span className="text-gray-500 line-through text-sm">₹{plan.originalPrice}</span>
                                            <span className="text-4xl font-bold text-white">₹{plan.discountedPrice}</span>
                                        </div>
                                        <div className="text-xs text-emerald-400 font-medium mb-6">
                                            Save {plan.discount}%
                                        </div>

                                        {/* Pages info - KEY CHANGE */}
                                        <div className="flex items-center gap-3 mb-6 bg-white/5 py-2 px-3 rounded-lg border border-white/5">
                                            <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                            </div>
                                            <span className="text-gray-300 font-semibold text-sm">{plan.pages}</span>
                                        </div>

                                        {/* Features */}
                                        <div className="flex-1 space-y-4 mb-8">
                                            {plan.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                                                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-sm text-gray-400 font-medium">{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* CTA Button */}
                                        <button
                                            onClick={() => handleSelectPlan(plan)}
                                            className={`w-full py-4 text-xs font-bold rounded-lg tracking-widest uppercase transition-all duration-300 ${plan.popular
                                                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/20'
                                                : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                                                }`}
                                        >
                                            Start Writing
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </>
    );
}

