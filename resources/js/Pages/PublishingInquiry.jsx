import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function PublishingInquiry({ selectedPlan }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        whatsapp: '',
        book_type: '',
        book_title: '',
        interested_plan: selectedPlan || '',
        terms_accepted: false,
    });

    const [submitted, setSubmitted] = useState(false);

    const plans = [
        { value: 'silver', label: 'Silver – ₹11,999', subtitle: 'Professional Publishing Starter' },
        { value: 'gold', label: 'Gold – ₹17,999', subtitle: 'Publishing + Starter Promotion' },
        { value: 'diamond', label: 'Diamond – ₹39,999', subtitle: 'Brand Visibility Package' },
        { value: 'platinum', label: 'Platinum – ₹99,999', subtitle: 'Growth Acceleration Package' },
        { value: 'prestige', label: 'Prestige – ₹1,49,999', subtitle: 'Market Expansion Package' },
        { value: 'signature', label: 'Signature – ₹1,99,999', subtitle: 'Elite Author Positioning' },
    ];

    const bookTypes = [
        { value: 'fiction', label: 'Fiction' },
        { value: 'non-fiction', label: 'Non-Fiction' },
        { value: 'textbook', label: 'Text Book' },
        { value: 'other', label: 'Other' },
    ];

    function handleSubmit(e) {
        e.preventDefault();
        post(route('publishing-inquiry.store'), {
            onSuccess: () => {
                setSubmitted(true);
                reset();
            },
        });
    }

    // Layout = null means it uses the default Layout from app.jsx
    return (
        <>
            <Head title="Publishing Inquiry | PublicationMart" />

            <div className="min-h-screen bg-[#0a0b0f] pt-8 pb-24">
                {/* Hero Header */}
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                    <div className="text-center">
                        <Link
                            href={route('welcome')}
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm font-medium mb-8 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                            Back to Home
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                            Start Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Publishing Journey</span>
                        </h1>
                        <p className="text-lg text-gray-400 max-w-xl mx-auto">
                            Fill out the form below and our publishing team will contact you within 24 hours to discuss your project.
                        </p>
                    </div>
                </div>

                {/* Success Message */}
                {submitted && (
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center">
                            <div className="text-4xl mb-3">🎉</div>
                            <h3 className="text-xl font-bold text-emerald-400 mb-2">Inquiry Submitted Successfully!</h3>
                            <p className="text-gray-400">Thank you for your interest. Our publishing team will reach out to you within 24 hours.</p>
                            <Link
                                href={route('welcome')}
                                className="inline-block mt-4 px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 transition-all"
                            >
                                Return to Home
                            </Link>
                        </div>
                    </div>
                )}

                {/* Form */}
                {!submitted && (
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                        <form onSubmit={handleSubmit} className="bg-[#15161b] rounded-3xl border border-white/5 p-8 md:p-10 space-y-8">

                            {/* Personal Information Section */}
                            <div>
                                <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-black">1</span>
                                    Personal Information
                                </h2>
                                <p className="text-gray-500 text-sm ml-10 mb-6">Tell us about yourself</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">Full Name <span className="text-red-400">*</span></label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all outline-none"
                                            placeholder="Your full name"
                                        />
                                        {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name}</p>}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address <span className="text-red-400">*</span></label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all outline-none"
                                            placeholder="your@email.com"
                                        />
                                        {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
                                    </div>

                                    {/* Phone with Country Code */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">Phone Number <span className="text-red-400">*</span></label>
                                        <input
                                            type="tel"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all outline-none"
                                            placeholder="+91 98765 43210"
                                        />
                                        {errors.phone && <p className="text-red-400 text-xs mt-1.5">{errors.phone}</p>}
                                    </div>

                                    {/* WhatsApp */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">WhatsApp Number</label>
                                        <input
                                            type="tel"
                                            value={data.whatsapp}
                                            onChange={e => setData('whatsapp', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all outline-none"
                                            placeholder="+91 98765 43210 (if different)"
                                        />
                                        {errors.whatsapp && <p className="text-red-400 text-xs mt-1.5">{errors.whatsapp}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-white/5"></div>

                            {/* Book Details Section */}
                            <div>
                                <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-black">2</span>
                                    Book Details
                                </h2>
                                <p className="text-gray-500 text-sm ml-10 mb-6">Tell us about your book</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Book Type */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">Book Type <span className="text-red-400">*</span></label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {bookTypes.map(type => (
                                                <button
                                                    key={type.value}
                                                    type="button"
                                                    onClick={() => setData('book_type', type.value)}
                                                    className={`py-2.5 px-4 rounded-xl text-sm font-semibold transition-all border ${data.book_type === type.value
                                                            ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                                                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                                                        }`}
                                                >
                                                    {type.label}
                                                </button>
                                            ))}
                                        </div>
                                        {errors.book_type && <p className="text-red-400 text-xs mt-1.5">{errors.book_type}</p>}
                                    </div>

                                    {/* Book Title */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">Book Title <span className="text-red-400">*</span></label>
                                        <input
                                            type="text"
                                            value={data.book_title}
                                            onChange={e => setData('book_title', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all outline-none"
                                            placeholder="Working title of your book"
                                        />
                                        {errors.book_title && <p className="text-red-400 text-xs mt-1.5">{errors.book_title}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-white/5"></div>

                            {/* Plan Selection Section */}
                            <div>
                                <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-black">3</span>
                                    Select Your Plan
                                </h2>
                                <p className="text-gray-500 text-sm ml-10 mb-6">Choose the plan that best fits your needs</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {plans.map(plan => (
                                        <button
                                            key={plan.value}
                                            type="button"
                                            onClick={() => setData('interested_plan', plan.value)}
                                            className={`p-4 rounded-xl text-left transition-all border ${data.interested_plan === plan.value
                                                    ? 'bg-purple-600/15 border-purple-500/50 ring-1 ring-purple-500/30'
                                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className={`font-bold text-sm ${data.interested_plan === plan.value ? 'text-purple-300' : 'text-white'}`}>
                                                        {plan.label}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{plan.subtitle}</p>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${data.interested_plan === plan.value
                                                        ? 'border-purple-500 bg-purple-500'
                                                        : 'border-white/20'
                                                    }`}>
                                                    {data.interested_plan === plan.value && (
                                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                {errors.interested_plan && <p className="text-red-400 text-xs mt-1.5">{errors.interested_plan}</p>}
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-white/5"></div>

                            {/* Terms & Submit */}
                            <div className="space-y-6">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={data.terms_accepted}
                                        onChange={e => setData('terms_accepted', e.target.checked)}
                                        className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                                    />
                                    <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                        I agree to the{' '}
                                        <Link href={route('terms-and-conditions')} className="text-purple-400 hover:text-purple-300 underline" target="_blank">
                                            Terms and Conditions
                                        </Link>{' '}
                                        and{' '}
                                        <Link href={route('privacy-policy')} className="text-purple-400 hover:text-purple-300 underline" target="_blank">
                                            Privacy Policy
                                        </Link>
                                    </span>
                                </label>
                                {errors.terms_accepted && <p className="text-red-400 text-xs">{errors.terms_accepted}</p>}

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-4 rounded-xl font-bold text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            Submit Inquiry
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </>
    );
}
