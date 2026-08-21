import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PaymentGateway({ book, plan, type }) {
    const { flash } = usePage().props;
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (flash?.error) {
            alert(flash.error);
        }
        if (flash?.success) {
            // Optional: alert(flash.success);
        }
    }, [flash]);
    const [paymentMethod, setPaymentMethod] = useState('card');

    // Dummy pricing based on plan
    const getPlanDetails = () => {
        // Special One-Time Service Plans (INR)
        if (type === 'formatting') return { price: 1499, books: 1, words: 'Unlimited', currency: '?' };
        if (type === 'cover') return { price: 499, books: 1, words: 'Unlimited', currency: '?' };
        if (type === 'cover') return { price: 499, books: 1, words: 'Unlimited', currency: '?' };
        // if (type === 'publishing') return { price: 4999, books: 1, words: 'Unlimited', currency: '?' }; // REMOVED to allow dynamic pro prices below

        const proPrices = {
            saver: { price: 1, books: 1, words: 'Unlimited' },
            standard: { price: 3499, books: 1, words: 'Unlimited' },
            pro: { price: 3999, books: 1, words: 'Unlimited' },
            enterprise: { price: 4499, books: 1, words: 'Unlimited' }
        };

        const premiumPrices = {
            starter: { price: 3299, books: 1, words: '50,000' },
            growth: { price: 7399, books: 3, words: '150,000' },
            professional: { price: 11499, books: 5, words: '250,000' },
            studio: { price: 21, books: 15, words: '750,000' }
        };

        const prices = type === 'premium' ? premiumPrices : proPrices;
        const details = prices[plan] || { price: 0, books: 0, words: '0' };
        return { ...details, currency: '?' };
    };

    const planDetails = getPlanDetails();

    const handlePayment = async () => {
        setIsProcessing(true);

        try {
            // TODO: Replace with actual payment gateway when merchant key is provided
            // For now, save plan info and navigate to AI Book Studio setup page

            // Save plan info to backend and initiate payment
            const response = await axios.post(route('ai-studio.save-plan', book.id), {
                plan_type: type,
                plan_name: plan
            });

            if (response.data.payment_url) {
                window.location.href = response.data.payment_url;
                return;
            }

            // Navigate based on type (only if no payment required)
            if (type === 'formatting') {
                // Redirect to Formatting Tool
                window.location.href = route('books.format', book.id);
                return;
            }

            if (type === 'cover') {
                // Redirect to Cover Creator
                window.location.href = route('books.cover-creator', book.id);
                return;
            }

            // Navigate to AI Book Studio - starts at Step 1 (Setup)
            router.visit(route('books.ai-studio', book.id) + '?step=1');
        } catch (error) {
            console.error('Error saving plan:', error);
            setIsProcessing(false);
            alert("Payment initiation failed. Please try again or contact support.");
        }
    };

    // Auto-process payment on test/staging domains (radinfotec.com, localhost)
    useEffect(() => {
        const host = window.location.hostname;
        const isTestDomain = host.includes('radinfotec') || host === 'localhost' || host === '127.0.0.1';
        if (isTestDomain) {
            handlePayment();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            <Head title="Payment - AI Book Studio" />
            <div className="min-h-screen bg-[#0f0a1e]">
                {/* Header */}
                <header className="bg-[#0d1220]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                        <Link
                            href={route(type === 'premium' ? 'ai-studio.premium-pricing' : 'ai-studio.pro-pricing', book.id)}
                            className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="font-medium">Back to Plans</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="font-bold text-white">Secure Payment</span>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-4xl mx-auto py-16 px-4 relative">
                    {/* Background Effects */}
                    <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[128px] pointer-events-none"></div>
                    <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-cyan-600/10 rounded-full blur-[128px] pointer-events-none"></div>

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Order Summary */}
                        <div className="bg-[#0d1220] rounded-2xl border border-white/10 p-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Order Summary
                            </h2>

                            <div className="space-y-4">
                                {/* Plan Info */}
                                <div className="bg-[#0a0f1a] rounded-xl p-4 border border-white/5">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-sm">Selected Plan</span>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${type === 'premium' ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-400/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'}`}>
                                            {type}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white capitalize">{plan}</h3>
                                </div>

                                {/* Book Info */}
                                <div className="bg-[#0a0f1a] rounded-xl p-4 border border-white/5">
                                    <div className="text-gray-400 text-sm mb-2">For Book</div>
                                    <h3 className="text-white font-medium">{book.title || 'Untitled Book'}</h3>
                                </div>

                                {/* Plan Details */}
                                <div className="space-y-3 pt-4 border-t border-white/10">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Number of Books</span>
                                        <span className="text-white font-semibold">{planDetails.books}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Word Credits</span>
                                        <span className="text-white font-semibold">{planDetails.words}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">AI Features</span>
                                        <span className="text-emerald-400 font-semibold text-sm">? Included</span>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="pt-4 border-t border-white/10">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-white">Total</span>
                                        <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                                            {planDetails.currency}{planDetails.price}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">One-time payment � No recurring fees</p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Form */}
                        <div className="bg-[#0d1220] rounded-2xl border border-white/10 p-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Payment Details
                            </h2>

                            {/* Secure Payment Notice */}
                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-6">
                                <div className="flex gap-3">
                                    <div className="shrink-0">
                                        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white text-sm mb-1">Secure Payment via PhonePe</h3>
                                        <p className="text-xs text-gray-400">
                                            You will be redirected to PhonePe's secure gateway to complete your payment.
                                            We support UPI, Credit/Debit Cards, and Net Banking.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Methods Icons (Visual Only) */}
                            <div className="flex justify-center gap-4 mb-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                                <span className="text-white text-xs border border-white/10 px-2 py-1 rounded">UPI</span>
                                <span className="text-white text-xs border border-white/10 px-2 py-1 rounded">Visa</span>
                                <span className="text-white text-xs border border-white/10 px-2 py-1 rounded">MasterCard</span>
                                <span className="text-white text-xs border border-white/10 px-2 py-1 rounded">RuPay</span>
                                <span className="text-white text-xs border border-white/10 px-2 py-1 rounded">NetBanking</span>
                            </div>

                            {/* Pay Button */}
                            <button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className="w-full mt-6 py-4 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold text-base rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Pay {planDetails.currency}{planDetails.price} Securely with PhonePe
                                    </>
                                )}
                            </button>

                            {/* Security Badge */}
                            <div className="mt-4 flex items-center justify-center gap-2 text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span className="text-xs">256-bit SSL Encrypted</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

