import { Head, Link } from '@inertiajs/react';

export default function Failure({ error }) {
    return (
        <>
            <Head title="Payment Failed" />

            <div className="min-h-screen bg-[#17150f] flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[100px]"></div>

                <div className="max-w-md w-full bg-[#0d1220]/80 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 relative z-10 text-center shadow-2xl">

                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-red-500/10">
                        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-black text-white mb-2">Payment Failed</h1>
                    <p className="text-gray-400 mb-8">We couldn't process your payment. Please try again or contact support.</p>

                    {error && (
                        <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20 mb-8 text-left">
                            <p className="text-xs text-red-400 uppercase font-bold tracking-wider mb-1">Error Details</p>
                            <p className="text-red-200 text-sm font-mono break-all">
                                {JSON.stringify(error)}
                            </p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <button
                            onClick={() => window.history.back()}
                            className="block w-full py-3.5 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all transform hover:-translate-y-0.5"
                        >
                            Try Again
                        </button>

                        <Link
                            href="/contact"
                            className="block w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold rounded-xl transition-all"
                        >
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

