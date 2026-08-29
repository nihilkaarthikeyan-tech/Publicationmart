import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/* The waiting slip — the same stationery as the PAID receipt and the RETURNED
   slip, so the three payment outcomes read as one family. */
const PENDING_CSS = `
.pm-slip{position:relative;background:#fdfbf5;border:1px solid #d8d1c1;padding:20px 22px 18px;font-family:ui-monospace,Consolas,monospace;text-align:left}
.pm-slip-row{display:flex;justify-content:space-between;gap:14px;font-size:12.5px;color:#635c4e;padding:5px 0}
.pm-slip-row b{color:#17150f;font-weight:600;text-align:right}
.pm-awaiting{position:absolute;right:14px;top:12px;font-family:'Figtree',system-ui,sans-serif;font-size:11.5px;font-weight:800;letter-spacing:.18em;color:#856531;border:2.5px dashed #a07d3b;border-radius:4px;padding:4px 10px;opacity:.9;transform:rotate(-9deg)}
.pm-slip-tear{height:12px;background:#fdfbf5;border-left:1px solid #d8d1c1;border-right:1px solid #d8d1c1;
  -webkit-mask-image:radial-gradient(circle at 6px 12px,transparent 5px,#000 5.5px);mask-image:radial-gradient(circle at 6px 12px,transparent 5px,#000 5.5px);
  -webkit-mask-size:12px 12px;mask-size:12px 12px;-webkit-mask-repeat:repeat-x;mask-repeat:repeat-x}
`;

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
            <style dangerouslySetInnerHTML={{ __html: PENDING_CSS }} />

            <div className="min-h-screen bg-parchment flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"></div>

                <div className="max-w-md w-full bg-paper/80 backdrop-blur-xl border border-linen rounded-3xl p-8 relative z-10 text-center shadow-2xl">

                    <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-amber-500/10">
                        <svg className="w-10 h-10 text-amber-800 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-ink mb-3">Payment processing</h1>

                    <p className="text-umber mb-6 leading-relaxed">
                        Your bank hasn't confirmed this payment yet. This usually takes
                        a minute or two. We're checking automatically — keep this page open.
                    </p>

                    <div className="pm-slip mb-2">
                        <div className="pm-awaiting" aria-hidden="true">AWAITING</div>
                        <div className="pm-slip-row"><span>Reference</span><b className="break-all">{transactionId || 'N/A'}</b></div>
                        <div className="pm-slip-row"><span>Status</span><b>With your bank</b></div>
                    </div>
                    <div className="pm-slip-tear mb-6" aria-hidden="true" />

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 text-left">
                        <p className="text-amber-800/90 text-sm">
                            If money has left your account, don&rsquo;t pay again — quote the
                            reference above and we&rsquo;ll confirm your order. You can return
                            to this page at any time using the address in your browser bar.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => { setChecking(true); router.reload({ onFinish: () => setChecking(false) }); }}
                            disabled={checking}
                            className="w-full px-6 py-3 bg-oxblood hover:bg-oxblood-deep disabled:opacity-60 text-paper font-bold rounded-xl transition-colors"
                        >
                            {checking ? 'Checking…' : 'Check status now'}
                        </button>

                        <Link
                            href="/support/create"
                            className="w-full px-6 py-3 bg-paper hover:bg-vellum text-ink-soft font-medium rounded-xl border border-linen transition-colors"
                        >
                            Contact support
                        </Link>

                        <Link href="/" className="text-umber hover:text-ink-soft text-sm mt-1 transition-colors">
                            Back to home
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
