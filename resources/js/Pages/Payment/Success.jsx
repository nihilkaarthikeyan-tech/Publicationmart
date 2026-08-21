import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Success({ auth, transaction }) {

    const transactionId = transaction.transaction_id || 'N/A';
    const amount = transaction.amount || '0.00';

    // Meta Pixel: Track Purchase on payment success
    useEffect(() => {
        if (typeof window.fbq === 'function') {
            fbq('track', 'Purchase', {
                value: parseFloat(amount),
                currency: 'INR',
            });
        }
    }, []);

    return (
        <>
            <Head title="Payment Successful" />

            <div className="min-h-screen bg-[#0f0a1e] flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]"></div>

                <div className="max-w-md w-full bg-[#0d1220]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative z-10 text-center shadow-2xl">

                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-emerald-500/10 animate-bounce">
                        <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-black text-white mb-2">Payment Successful!</h1>
                    <p className="text-gray-400 mb-8">Thank you for your purchase. Your transaction has been completed securely.</p>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-500 text-sm font-medium">Transaction ID</span>
                            <span className="text-white font-mono text-sm">{transactionId}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-sm font-medium">Amount Paid</span>
                            <span className="text-emerald-400 font-bold text-lg">₹{amount}</span>
                        </div>
                    </div>

                    {/* Guest vs User Logic */}
                    <div className="space-y-4">
                        {!auth.user ? (
                            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-4 text-left">
                                <h3 className="text-indigo-400 font-bold text-sm mb-1 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    What happens next?
                                </h3>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    We have received your order details properly. Our team will verify and dispatch your book to the provided address shortly.
                                </p>
                                <div className="mt-3 text-xs text-gray-500 bg-black/20 p-2 rounded border border-white/5 font-mono">
                                    Please take a screenshot of this page or save your Order ID for reference.
                                </div>
                            </div>
                        ) : (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-emerald-400 text-sm font-medium">
                                You can track this order in your Dashboard under "My Purchases".
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-3">
                            {auth.user && (
                                <Link
                                    href={route('dashboard')}
                                    className="block w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5"
                                >
                                    Go to Dashboard
                                </Link>
                            )}

                            <Link
                                href="/"
                                className={`block w-full py-3.5 border border-white/10 text-gray-300 font-semibold rounded-xl transition-all ${!auth.user ? 'bg-white hover:bg-gray-50 text-gray-900 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'bg-white/5 hover:bg-white/10'}`}
                            >
                                {auth.user ? 'Return Home' : 'Continue Shopping'}
                            </Link>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Secure Payment Processed via PublicationMart
                    </div>
                </div>
            </div>
        </>
    );
}

