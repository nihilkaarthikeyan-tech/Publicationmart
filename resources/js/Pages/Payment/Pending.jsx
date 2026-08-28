import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Pending({ transactionId }) {
    const [checking, setChecking] = useState(false);

    // Banks can take a little while to confirm UPI/netbanking payments. Re-check
    // automatically so the customer lands on Success without doing anything.
    useEffect(() => {
        const timer = setInterval(() => {
            setChecking(true);
            router.reload({ only: [], onFinish: () => setChecking(false) });
        }, 15000);
        return () => clearInterval(timer);
    }, []);

    return (
        <>
            <Head title="Payment Processing" />

            <div className="min-h-screen bg-[#17150f] flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"></div>

                <div className="max-w-md w-full bg-[#0d1220]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative z-10 text-center shadow-2xl">

                    <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-amber-500/10">
                        <svg className="w-10 h-10 text-amber-400 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-3">Payment processing</h1>

                    <p className="text-gray-400 mb-6 leading-relaxed">
                        Your bank hasn't confirmed this payment yet. This usually takes
                        a minute or two. We're checking automatically — keep this page open.
                    </p>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-left">
                        <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Reference</div>
                        <div className="font-mono text-sm text-gray-200 break-all">{transactionId || 'N/A'}</div>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 text-left">
                        <p className="text-amber-300/90 text-sm">
                            If money has left your account, don't pay again — quote the
                            reference above and we'll confirm your order.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => { setChecking(true); router.reload({ onFinish: () => setChecking(false) }); }}
                            disabled={checking}
                            className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-bold rounded-xl transition-colors"
                        >
                            {checking ? 'Checking…' : 'Check status now'}
                        </button>

                        <Link
                            href="/support/create"
                            className="w-full px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-200 font-medium rounded-xl border border-white/10 transition-colors"
                        >
                            Contact support
                        </Link>

                        <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm mt-1 transition-colors">
                            Back to home
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
