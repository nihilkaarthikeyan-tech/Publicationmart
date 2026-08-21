import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Payment({ plan, pages, price }) {
    const { data, setData, post, processing, errors } = useForm({
        plan_type: plan,
        page_range: pages,
        email: '',
        full_name: '',
        book_title: '',
    });

    const [paymentMethod, setPaymentMethod] = useState('card');

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('guest-writer.process-payment'));
    };

    return (
        <>
            <Head title="Secure Checkout - PublicationMart" />

            <div className="min-h-screen bg-[#0f0a1e] text-white p-4 lg:p-10 font-sans">
                {/* Back Link */}
                <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center">
                    <Link href={route('guest-writer.pricing')} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm transition-colors">
                        ← Back to Plans
                    </Link>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <span className="text-indigo-500">🔒</span> Secure Payment
                    </div>
                </div>

                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">

                    {/* Left Column: Order Summary */}
                    <div className="bg-[#0f1016] border border-white/10 rounded-3xl p-8 shadow-2xl">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="text-indigo-400 text-lg">📄</span>
                            <h2 className="text-xl font-bold text-white">Order Summary</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-[#0a0b10] rounded-xl p-4 border border-white/5 flex justify-between items-center group hover:border-indigo-500/30 transition-all">
                                <div>
                                    <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Selected Plan</div>
                                    <div className="text-white font-bold capitalize text-lg">{plan} Writer</div>
                                </div>
                                <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold uppercase border border-indigo-500/30">
                                    {plan}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                                    For Book <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.book_title}
                                    onChange={e => setData('book_title', e.target.value)}
                                    className="w-full bg-[#0a0b10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition placeholder-gray-600"
                                    placeholder="Enter your book title..."
                                    required
                                />
                                {errors.book_title && <div className="text-red-500 text-xs mt-1 ml-1">{errors.book_title}</div>}
                            </div>

                            <div className="pt-6 border-t border-white/10 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Number of Books</span>
                                    <span className="text-white font-bold">1</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Page Limit</span>
                                    <span className="text-white font-bold">{pages} Pages</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">AI Features</span>
                                    <span className="text-emerald-400 font-bold flex items-center gap-1">✓ Included</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                                <div>
                                    <div className="text-2xl font-black text-white">₹{price}</div>
                                    <div className="text-xs text-gray-500 mt-1">One-time payment • No recurring fees</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Payment Details */}
                    <div className="bg-[#0f1016] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-8">
                            <span className="text-cyan-400 text-lg">💳</span>
                            <h2 className="text-xl font-bold text-white">Payment Details</h2>
                        </div>

                        {/* Payment Tabs */}
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            <button onClick={() => setPaymentMethod('card')} className={`py-3 rounded-xl border text-sm font-bold transition-all flex flex-col items-center gap-1 ${paymentMethod === 'card' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20' : 'bg-[#0a0b10] border-white/10 text-gray-500 hover:text-gray-300'}`}>
                                <span className="text-lg">💳</span> Card
                            </button>
                            <button onClick={() => setPaymentMethod('upi')} className={`py-3 rounded-xl border text-sm font-bold transition-all flex flex-col items-center gap-1 ${paymentMethod === 'upi' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20' : 'bg-[#0a0b10] border-white/10 text-gray-500 hover:text-gray-300'}`}>
                                <span className="text-lg">₹</span> UPI
                            </button>
                            <button onClick={() => setPaymentMethod('bank')} className={`py-3 rounded-xl border text-sm font-bold transition-all flex flex-col items-center gap-1 ${paymentMethod === 'bank' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20' : 'bg-[#0a0b10] border-white/10 text-gray-500 hover:text-gray-300'}`}>
                                <span className="text-lg">🏦</span> Bank
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Card Number</label>
                                    <input type="text" className="w-full bg-[#0a0b10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition placeholder-gray-600" placeholder="1234 5678 9012 3456" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Expiry</label>
                                        <input type="text" className="w-full bg-[#0a0b10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition placeholder-gray-600" placeholder="MM/YY" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">CVV</label>
                                        <input type="text" className="w-full bg-[#0a0b10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition placeholder-gray-600" placeholder="123" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Cardholder Name</label>
                                    <input type="text" className="w-full bg-[#0a0b10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition placeholder-gray-600" placeholder="John Doe" />
                                </div>

                                {/* Actual Data Collection Fields (Hidden or integrated if this were real, but showing as 'Billing Details' for now) */}
                                <div className="pt-4 border-t border-white/10 mt-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Billing Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Full Name <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={data.full_name}
                                                onChange={e => setData('full_name', e.target.value)}
                                                className="w-full bg-[#0a0b10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                                                placeholder="Your Full Name"
                                                required
                                            />
                                            {errors.full_name && <div className="text-red-500 text-xs mt-1 ml-1">{errors.full_name}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Email Address <span className="text-red-500">*</span></label>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                className="w-full bg-[#0a0b10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                                                placeholder="receipts@example.com"
                                                required
                                            />
                                            {errors.email && <div className="text-red-500 text-xs mt-1 ml-1">{errors.email}</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-4 mt-6 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold text-lg rounded-xl shadow-lg shadow-indigo-900/20 transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {processing ? 'Processing...' : (
                                    <>
                                        <span className="text-lg">🔒</span>
                                        Pay ₹{price} Securely
                                    </>
                                )}
                            </button>

                            <p className="text-center text-[10px] text-gray-500 flex items-center justify-center gap-1">
                                <span>🛡️</span> 256-bit SSL Encrypted • 100% Safe & Secure
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

