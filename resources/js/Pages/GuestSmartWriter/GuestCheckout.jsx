import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function GuestCheckout({ plan, price, pages }) {
    const { flash } = usePage().props;

    // Detect tier from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tier = urlParams.get('tier') || 'pro';
    const isPremium = tier === 'premium';

    const [paymentMethod, setPaymentMethod] = useState('phonepe');

    const { data, setData, post, processing, errors } = useForm({
        full_name: '',
        email: '',
        book_title: '',
        plan_type: plan,
        page_range: pages
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('guest-writer.process-payment'));
    };

    // Dynamic colors based on tier
    const accentColor = isPremium ? 'cyan' : 'indigo';
    const glowBg = isPremium ? 'bg-cyan-500/10' : 'bg-indigo-500/10';
    const glowBorder = isPremium ? 'border-cyan-500/20' : 'border-indigo-500/20';
    const accentText = isPremium ? 'text-cyan-700' : 'text-indigo-700';
    const buttonClass = isPremium
        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/30'
        : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-lg shadow-indigo-500/30';
    const focusBorder = isPremium ? 'focus:border-cyan-500' : 'focus:border-indigo-500';

    const premiumFeatures = [
        { label: 'Advanced Smart Writer Engine' },
        { label: 'Smart Writer Art Studio' },
        { label: 'Priority Support' },
        { label: 'Auto Formatting' },
        { label: 'Global Distribution' },
        { label: 'Standard 6x9 Size' },
    ];

    const proFeatures = [
        { label: 'A-Z Writing Assist' },
        { label: 'Auto Formatting' },
        { label: 'Global Distribution' },
        { label: 'Standard 6x9 Size' },
    ];

    const features = isPremium ? premiumFeatures : proFeatures;

    return (
        <>
            <Head title="Checkout - Start Writing" />

            <div className="min-h-screen bg-[#f0ece3] text-[#17150f] font-sans flex items-center justify-center p-4">

                {/* Background Blobs */}
                <div className={`fixed top-0 left-1/4 w-[500px] h-[500px] ${isPremium ? 'bg-cyan-600/10' : 'bg-indigo-600/10'} rounded-full blur-[128px] pointer-events-none`}></div>
                <div className={`fixed bottom-0 right-1/4 w-[500px] h-[500px] ${isPremium ? 'bg-blue-600/10' : 'bg-purple-600/10'} rounded-full blur-[128px] pointer-events-none`}></div>

                <div className="w-full max-w-5xl relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">

                    {/* Left Column: Plan Summary */}
                    <div className="space-y-8 lg:sticky lg:top-10">
                        <div>
                            <h1 className="text-4xl font-black text-[#17150f] mb-2 tracking-tight">Setup Your Book</h1>
                            <p className="text-[#635c4e]">Enter your details to create your writing workspace.</p>
                        </div>

                        <div className="bg-[#faf8f3] rounded-3xl border border-[#d8d1c1] p-8 relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 w-32 h-32 ${isPremium ? 'bg-cyan-500/10' : 'bg-indigo-500/10'} rounded-full blur-[40px] -mr-16 -mt-16`}></div>

                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-[#635c4e] text-sm font-medium uppercase tracking-wider">Selected Plan</h3>
                                {isPremium && (
                                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-700 border border-cyan-500/30">
                                        PREMIUM
                                    </span>
                                )}
                            </div>

                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-[#17150f] capitalize">{plan} Plan</h2>
                                    <p className={`${accentText} font-medium`}>{pages} Pages</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-[#17150f]">₹{Number(price).toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <div className="border-t border-[#d8d1c1] pt-6">
                                <ul className="space-y-3">
                                    {features.map((f, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-sm text-[#4b443a]">
                                            <svg className={`w-5 h-5 text-emerald-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            {f.label}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className={`${glowBg} border ${glowBorder} rounded-2xl p-6 flex gap-4 items-start`}>
                            <div className={`p-3 ${isPremium ? 'bg-cyan-500/20' : 'bg-indigo-500/20'} rounded-lg shrink-0`}>
                                <svg className={`w-6 h-6 ${accentText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-[#17150f] text-sm mb-1">Secure Payment via PhonePe</h4>
                                <p className="text-[#635c4e] text-xs leading-relaxed">Your payment is processed securely. We do not store your card details. Redirecting to secure gateway upon confirmation.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <div className="bg-[#faf8f3] rounded-3xl border border-[#d8d1c1] p-8 shadow-2xl">
                        <form onSubmit={submit} className="space-y-6">

                            {flash?.error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-700 p-4 rounded-xl text-sm">
                                    {flash.error}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-[#635c4e] uppercase tracking-widest mb-2">Book Title</label>
                                <input
                                    type="text"
                                    value={data.book_title}
                                    onChange={e => setData('book_title', e.target.value)}
                                    placeholder="e.g. The Future of AI"
                                    className={`w-full bg-[#faf8f3] border border-[#d8d1c1] rounded-xl px-4 py-4 text-[#17150f] placeholder-gray-600 focus:outline-none ${focusBorder} transition-all`}
                                />
                                {errors.book_title && <p className="text-red-700 text-xs mt-1">{errors.book_title}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-[#635c4e] uppercase tracking-widest mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={data.full_name}
                                        onChange={e => setData('full_name', e.target.value)}
                                        placeholder="John Doe"
                                        className={`w-full bg-[#faf8f3] border border-[#d8d1c1] rounded-xl px-4 py-4 text-[#17150f] placeholder-gray-600 focus:outline-none ${focusBorder} transition-all`}
                                    />
                                    {errors.full_name && <p className="text-red-700 text-xs mt-1">{errors.full_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#635c4e] uppercase tracking-widest mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        placeholder="john@example.com"
                                        className={`w-full bg-[#faf8f3] border border-[#d8d1c1] rounded-xl px-4 py-4 text-[#17150f] placeholder-gray-600 focus:outline-none ${focusBorder} transition-all`}
                                    />
                                    {errors.email && <p className="text-red-700 text-xs mt-1">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`w-full py-4 ${buttonClass} text-[#17150f] font-black text-lg rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-[#17150f]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Processing...
                                        </>
                                    ) : (
                                        `Pay ₹${Number(price).toLocaleString('en-IN')} & Start Writing`
                                    )}
                                </button>
                                <p className="text-center text-[#635c4e] text-xs mt-4">By continuing, you agree to our Terms of Service.</p>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </>
    );
}
