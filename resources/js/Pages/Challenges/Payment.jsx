import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Payment({ enrollment, amount }) {
    const [processing, setProcessing] = useState(false);

    const handlePayment = (e) => {
        e.preventDefault();
        setProcessing(true);

        // Dummy payment - just submit to process
        router.post(route('challenges.process-payment', enrollment.id), {}, {
            onFinish: () => setProcessing(false)
        });
    };

    return (
        <>
            <Head title="Complete Payment - Poetry Challenge" />

            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md">

                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2 text-white font-bold text-xl">
                            <span className="text-2xl">📚</span>
                            Publication<span className="text-indigo-400">Mart</span>
                        </Link>
                    </div>

                    {/* Payment Card */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">

                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-white">Complete Your Payment</h1>
                            <p className="text-indigo-200 mt-1">Poetry Challenge Enrollment</p>
                        </div>

                        {/* Order Summary */}
                        <div className="p-6 space-y-4">

                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3">Enrollment Details</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Name</span>
                                        <span className="text-white font-medium">{enrollment.full_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Email</span>
                                        <span className="text-white font-medium">{enrollment.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Challenge</span>
                                        <span className="text-indigo-400 font-medium">{enrollment.challenge_type}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-xl p-4 border border-indigo-500/30">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Entry Fee</span>
                                    <span className="text-3xl font-black text-white">₹{amount}</span>
                                </div>
                            </div>

                            {/* Payment Button */}
                            <button
                                onClick={handlePayment}
                                disabled={processing}
                                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold text-lg rounded-xl shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Pay ₹{amount} Now
                                    </>
                                )}
                            </button>

                            {/* Demo Notice */}
                            <p className="text-center text-gray-500 text-xs">
                                🔒 This is a demo payment. No actual charges will be made.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-white/10 p-4 text-center">
                            <Link
                                href={route('challenges.index')}
                                className="text-gray-400 hover:text-white text-sm transition-colors"
                            >
                                ← Back to Enrollment Form
                            </Link>
                        </div>
                    </div>

                    {/* Security Badge */}
                    <div className="mt-6 flex items-center justify-center gap-4 text-gray-500 text-xs">
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Secure Payment
                        </span>
                        <span>•</span>
                        <span>SSL Encrypted</span>
                    </div>
                </div>
            </div>
        </>
    );
}
