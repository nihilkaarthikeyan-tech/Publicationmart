import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function ProfessionalPayment({ book, serviceType, price, serviceRequestId = null, manuscriptUploaded = false }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');

    const serviceNames = {
        formatting: 'Professional Formatting',
        cover: 'Cover Design',
        full_package: 'Full Package',
    };

    // Cover design doesn't require manuscript upload
    const requiresUpload = serviceType !== 'cover';

    const handlePayment = async () => {
        setIsProcessing(true);

        router.post(route('professional.process-payment', book.id), {
            service_type: serviceType,
            payment_method: paymentMethod,
            service_request_id: serviceRequestId, // Pass existing request ID if manuscript was uploaded
        }, {
            onError: () => {
                alert('Payment failed. Please try again.');
                setIsProcessing(false);
            }
        });
    };

    return (
        <>
            <Head title={`Hire a Professional - ${serviceNames[serviceType]}`} />
            <div className="min-h-screen bg-[#17150f]">
                {/* Header */}
                <header className="bg-[#0d1220]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                        <Link
                            href={route('books.design', book.id)}
                            className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="font-medium">Back</span>
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
                                {/* Service Info */}
                                <div className="bg-[#0a0f1a] rounded-xl p-4 border border-white/5">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-sm">Service</span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                                            Professional
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white">{serviceNames[serviceType]}</h3>
                                </div>

                                {/* Book Info */}
                                <div className="bg-[#0a0f1a] rounded-xl p-4 border border-white/5">
                                    <div className="text-gray-400 text-sm mb-2">For Book</div>
                                    <h3 className="text-white font-medium">{book.title || 'Untitled Book'}</h3>
                                </div>

                                {/* What's Included */}
                                <div className="space-y-3 pt-4 border-t border-white/10">
                                    <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">What's Included</h4>
                                    <div className="space-y-2">
                                        {serviceType === 'formatting' && (
                                            <>
                                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Professional book formatting
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Amazon KDP-ready layout
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Table of Contents
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    3-5 business days delivery
                                                </div>
                                            </>
                                        )}
                                        {serviceType === 'cover' && (
                                            <>
                                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Custom cover design
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    2 revision rounds
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="pt-4 border-t border-white/10">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-white">Total</span>
                                        <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                                            ₹{price}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">One-time payment • No recurring fees</p>
                                </div>

                                {/* What Happens Next? */}
                                <div className="pt-4 border-t border-white/10">
                                    <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">What Happens Next?</h4>
                                    <div className="space-y-2">
                                        {requiresUpload ? (
                                            <>
                                                <div className="flex items-start gap-3">
                                                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                                                    <span className="text-sm text-gray-300">Upload your manuscript (DOCX/PDF)</span>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <span className="w-5 h-5 rounded-full bg-indigo-500/50 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                                                    <span className="text-sm text-gray-400">Our team formats your book</span>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <span className="w-5 h-5 rounded-full bg-indigo-500/30 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                                                    <span className="text-sm text-gray-400">Download your formatted file</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-start gap-3">
                                                    <span className="w-5 h-5 rounded-full bg-pink-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                                                    <span className="text-sm text-gray-300">Our team will contact you within 24hrs</span>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <span className="w-5 h-5 rounded-full bg-pink-500/50 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                                                    <span className="text-sm text-gray-400">Discuss your cover vision & requirements</span>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <span className="w-5 h-5 rounded-full bg-pink-500/30 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                                                    <span className="text-sm text-gray-400">Receive your custom cover design</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
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
                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
                                <div className="p-2 bg-indigo-500/20 rounded-lg shrink-0">
                                    <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm mb-1">Redirecting to PhonePe</h4>
                                    <p className="text-gray-400 text-xs">
                                        You will be redirected to PhonePe's secure gateway to complete your payment via UPI, Card, or Netbanking.
                                    </p>
                                </div>
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
                                        Pay ₹{price} Securely with PhonePe
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

