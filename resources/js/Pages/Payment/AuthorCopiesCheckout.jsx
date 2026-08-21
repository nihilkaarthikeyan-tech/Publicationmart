import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/Components/InputError';

export default function AuthorCopiesCheckout({ book, copies, costs, auth }) {
    const [couponCode, setCouponCode] = useState('');
    const [verifyingCoupon, setVerifyingCoupon] = useState(false);
    const [couponMessage, setCouponMessage] = useState(null);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        book_id: book.id,
        copies: copies,
        billing_name: auth?.user?.name || '',
        billing_email: auth?.user?.email || '',
        shipping_address: book.author_address || '',
        city: '',
        state: '',
        pincode: '',
        contact_number: auth?.user?.mobile_number || '',
        coupon_code: '',
        discount_amount: 0
    });

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setVerifyingCoupon(true);
        setCouponMessage(null);

        try {
            const response = await fetch(route('coupons.verify'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    code: couponCode,
                    amount: costs.publishing_fee, // Discount typically applies to package fee
                    book_id: book.id
                })
            });

            const resData = await response.json();

            if (response.ok && resData.valid) {
                setAppliedCoupon({
                    code: resData.code,
                    discount_percentage: resData.discount_percentage
                });
                setDiscountAmount(resData.discount_amount);
                setData(prev => ({
                    ...prev,
                    coupon_code: resData.code,
                    discount_amount: resData.discount_amount
                }));
                setCouponMessage({ type: 'success', text: resData.message });
            } else {
                setCouponMessage({ type: 'error', text: resData.message || 'Invalid coupon.' });
                setAppliedCoupon(null);
                setDiscountAmount(0);
                setData(prev => ({
                    ...prev,
                    coupon_code: '',
                    discount_amount: 0
                }));
            }
        } catch (error) {
            console.error(error);
            setCouponMessage({ type: 'error', text: 'Could not verify coupon.' });
        } finally {
            setVerifyingCoupon(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setDiscountAmount(0);
        setData(prev => ({
            ...prev,
            coupon_code: '',
            discount_amount: 0
        }));
        setCouponMessage(null);
    };

    const submitPayment = (e) => {
        e.preventDefault();
        post(route('payment.author_copies.process'));
    };

    const getCoverUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `/storage/${path}`;
    };

    const coverUrl = getCoverUrl(book.cover_design_path);

    // Parse address for display
    const addressParts = book.author_address ? book.author_address.split('\n').filter(Boolean) : [];

    const isTestDomain = window.location.hostname.includes('radinfotec') || window.location.hostname === 'localhost';

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
            <Head title="Order Summary — PublicationMart" />

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        href={route('books.details', book.id)}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors group"
                    >
                        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        <span className="font-medium text-sm">Back to Details</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-emerald-600 font-semibold text-xs uppercase tracking-wider">Secure Checkout</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
                {/* Page Title */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Order Summary</h1>
                    <p className="text-slate-500 text-sm">Review everything before you publish</p>
                </div>

                <form onSubmit={submitPayment} className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                    {/* LEFT COLUMN — Book & Order Details (3/5 width) */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Book Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6">
                                <div className="flex gap-6">
                                    {/* Cover Image */}
                                    <div className="w-28 flex-shrink-0">
                                        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-slate-100 border border-slate-100 shadow-lg shadow-black/5">
                                            {coverUrl ? (
                                                <img src={coverUrl} alt="Book Cover" className="w-full h-full object-cover object-right" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-slate-400">
                                                    <svg className="w-8 h-8 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Book Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[9px] font-bold uppercase tracking-wider">{book.genre || 'General'}</span>
                                            {book.language && <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[9px] font-bold uppercase tracking-wider">{book.language}</span>}
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-900 mb-0.5 truncate">{book.title || 'Untitled'}</h2>
                                        {book.subtitle && <p className="text-slate-500 text-sm mb-2 truncate">{book.subtitle}</p>}
                                        <p className="text-slate-400 text-sm">by <span className="text-slate-800 font-medium">{book.author_name}</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Specs Grid */}
                            <div className="border-t border-slate-100 grid grid-cols-4 divide-x divide-slate-100">
                                {[
                                    { label: 'Format', value: book.book_size || '6x9' },
                                    { label: 'Pages', value: book.num_pages || '—' },
                                    { label: 'Binding', value: book.binding_type || 'Soft Binding' },
                                    { label: 'Paper', value: book.paper_type || 'White' },
                                ].map((spec, i) => (
                                    <div key={i} className="p-3 text-center">
                                        <div className="text-slate-400 text-[9px] uppercase font-bold tracking-wider mb-0.5">{spec.label}</div>
                                        <div className="text-slate-700 font-semibold text-xs truncate">{spec.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pricing Breakdown */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                Pricing Breakdown
                            </h3>
                            <div className="space-y-3">
                                {/* Cost per Copy */}
                                <div className="flex justify-between items-center py-2">
                                    <div>
                                        <span className="text-slate-500 text-sm">Cost per Copy</span>
                                        <span className="text-slate-400 text-xs ml-1">(Author Price)</span>
                                    </div>
                                    <span className="text-slate-900 font-semibold">₹{costs.per_copy.toFixed(2)}</span>
                                </div>

                                {/* Quantity */}
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-slate-500 text-sm">Author Copies</span>
                                    <span className="text-slate-900 font-semibold">× {copies}</span>
                                </div>

                                {/* Copies Subtotal */}
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-slate-500 text-sm">Copies Subtotal</span>
                                    <span className="text-slate-900 font-semibold">₹{(costs.per_copy * copies).toFixed(2)}</span>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-slate-100"></div>

                                {/* Publishing Package Fee */}
                                {costs.publishing_fee > 0 && (
                                    <div className="flex justify-between items-center py-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-emerald-600 text-sm font-medium">Publishing Package Fee</span>
                                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-600 text-[9px] font-bold uppercase">One-time</span>
                                        </div>
                                        <span className="text-emerald-600 font-bold">₹{costs.publishing_fee.toFixed(2)}</span>
                                    </div>
                                )}

                                {/* What's included in publishing fee */}
                                {costs.publishing_fee > 0 && (
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">Publishing Package Includes</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                'ISBN Assignment',
                                                'Amazon Listing',
                                                'Google Books Listing',
                                                'Print-on-Demand Setup',
                                                'Author Dashboard',
                                                'Royalty Tracking',
                                                'Distribution Network',
                                                'Lifetime Support',
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center gap-1.5">
                                                    <svg className="w-3 h-3 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                                    <span className="text-slate-600 text-xs">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Coupon Section */}
                                <div className="py-4 border-t border-slate-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Publishing Fee Coupon</h4>
                                    </div>
                                    {!appliedCoupon ? (
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <input
                                                    type="text"
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                    placeholder="Enter code"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none uppercase font-medium placeholder:normal-case"
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleApplyCoupon}
                                                disabled={verifyingCoupon || !couponCode}
                                                className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                                            >
                                                {verifyingCoupon ? (
                                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                ) : 'Apply'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex justify-between items-center animate-in fade-in zoom-in duration-300">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                                </div>
                                                <div>
                                                    <p className="text-emerald-700 text-xs font-bold leading-none mb-1">{appliedCoupon.code}</p>
                                                    <p className="text-emerald-600/70 text-[10px] uppercase tracking-wider font-bold">{appliedCoupon.discount_percentage}% Fee Discount Applied</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={removeCoupon}
                                                className="text-slate-400 hover:text-red-500 p-2 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    )}
                                    {couponMessage && (
                                        <p className={`text-[11px] mt-2 font-medium flex items-center gap-1 ${couponMessage.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {couponMessage.type === 'success' ? (
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                            ) : (
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            )}
                                            {couponMessage.text}
                                        </p>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="border-t border-slate-100"></div>

                                {/* Discount Display */}
                                {discountAmount > 0 && (
                                    <div className="flex justify-between items-center py-2 animate-in slide-in-from-top-2 duration-300">
                                        <span className="text-emerald-600 text-sm font-medium">Fee Discount</span>
                                        <span className="text-emerald-600 font-bold">-₹{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}

                                {/* Total */}
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-lg font-bold text-slate-900">Total Amount</span>
                                    <div className="text-right">
                                        <span className="text-3xl font-black text-slate-900 block">
                                            ₹{(costs.total - discountAmount).toFixed(2)}
                                        </span>
                                        {discountAmount > 0 && (
                                            <span className="text-[10px] text-slate-400 line-through">₹{costs.total.toFixed(2)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dispatch Address Form */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                Dispatch Address
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Street Address</label>
                                    <textarea
                                        rows="3"
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-slate-400"
                                        value={data.shipping_address}
                                        onChange={e => setData('shipping_address', e.target.value)}
                                        placeholder="Flat/House No, Street, Landmark"
                                        required
                                    />
                                    <InputError message={errors.shipping_address} className="mt-1" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">City</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-slate-400"
                                        value={data.city}
                                        onChange={e => setData('city', e.target.value)}
                                        placeholder="City"
                                        required
                                    />
                                    <InputError message={errors.city} className="mt-1" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">State</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-slate-400"
                                        value={data.state}
                                        onChange={e => setData('state', e.target.value)}
                                        placeholder="State"
                                        required
                                    />
                                    <InputError message={errors.state} className="mt-1" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Pincode</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-slate-400"
                                        value={data.pincode}
                                        onChange={e => setData('pincode', e.target.value)}
                                        placeholder="e.g. 110001"
                                        required
                                    />
                                    <InputError message={errors.pincode} className="mt-1" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Contact Number</label>
                                    <input
                                        type="tel"
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-slate-400"
                                        value={data.contact_number}
                                        onChange={e => setData('contact_number', e.target.value)}
                                        placeholder="+91..."
                                        required
                                    />
                                    <InputError message={errors.contact_number} className="mt-1" />
                                </div>
                            </div>
                        </div>

                        {/* Selling Price & Royalty Info */}
                        {book.selling_price > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Your Book Pricing
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center">
                                        <div className="text-slate-500 text-[9px] uppercase font-bold tracking-wider mb-1">Selling Price</div>
                                        <div className="text-slate-900 font-bold text-lg">₹{book.selling_price}</div>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center">
                                        <div className="text-slate-500 text-[9px] uppercase font-bold tracking-wider mb-1">Author Cost (Minimum Price)</div>
                                        <div className="text-orange-600 font-bold text-lg">₹{costs.per_copy.toFixed(2)}</div>
                                    </div>
                                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-center">
                                        <div className="text-emerald-600 text-[9px] uppercase font-bold tracking-wider mb-1">Your Royalty</div>
                                        <div className="text-emerald-700 font-bold text-lg">₹{Math.max(0, book.selling_price - costs.per_copy).toFixed(0)}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN — Payment Form (2/5 width) */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-20">
                            <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                Payment
                            </h3>

                            {/* PhonePe Notice */}
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                                <div className="flex gap-3 items-start">
                                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    <div>
                                        <p className="text-blue-900 text-xs font-semibold mb-0.5">Secure Payment via PhonePe</p>
                                        <p className="text-blue-700/80 text-[11px] leading-relaxed">UPI, Credit/Debit Cards, Net Banking supported</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Methods Visual */}
                            <div className="flex flex-wrap justify-center gap-2 mb-6">
                                {['UPI', 'Visa', 'MasterCard', 'RuPay', 'Net Banking'].map(m => (
                                    <span key={m} className="text-slate-500 text-[10px] border border-slate-200 px-2 py-1 rounded-md font-medium">{m}</span>
                                ))}
                            </div>

                            {/* Billing Form */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Billing Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-slate-400"
                                        value={data.billing_name}
                                        onChange={e => setData('billing_name', e.target.value)}
                                        placeholder="Full name for invoice"
                                        required
                                    />
                                    <InputError message={errors.billing_name} className="mt-1" />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Email Address</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder-slate-400"
                                        value={data.billing_email}
                                        onChange={e => setData('billing_email', e.target.value)}
                                        placeholder="email@example.com"
                                        required
                                    />
                                    <InputError message={errors.billing_email} className="mt-1" />
                                </div>

                                {/* Order Total Recap */}
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mt-4">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-slate-500 text-xs">Author Copies ({copies}×)</span>
                                        <span className="text-slate-700 text-xs font-medium">₹{(costs.per_copy * copies).toFixed(2)}</span>
                                    </div>
                                    {costs.publishing_fee > 0 && (
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-slate-500 text-xs">Publishing Fee</span>
                                            <span className="text-slate-700 text-xs font-medium">₹{costs.publishing_fee.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between items-center">
                                        <span className="text-slate-900 text-sm font-bold">Pay Now</span>
                                        <div className="text-right">
                                            <span className="text-slate-900 text-lg font-black block">₹{(costs.total - discountAmount).toFixed(2)}</span>
                                            {discountAmount > 0 && (
                                                <span className="text-emerald-600 text-[10px] font-bold tracking-tight">SAVED ₹{discountAmount.toFixed(0)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Pay Button */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                            {isTestDomain ? `TEST BYPASS — Complete Order (₹${(costs.total - discountAmount).toFixed(0)})` : `Pay ₹${(costs.total - discountAmount).toFixed(2)} Securely`}
                                        </>
                                    )}
                                </button>

                                {/* Security Badge */}
                                <div className="flex items-center justify-center gap-2 text-slate-400 pt-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    <span className="text-[10px] font-medium">256-bit SSL • Secured by PhonePe</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Back Link */}
                <div className="text-center mt-10">
                    <Link href={route('books.details', book.id)} className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
                        ← Cancel and return to details
                    </Link>
                </div>
            </main>
        </div >
    );
}
