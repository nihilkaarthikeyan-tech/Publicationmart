import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';

/* The receipt, and the stamp that lands on it. */
const RECEIPT_CSS = `
.pm-receipt{position:relative;background:#fdfbf5;border:1px solid #d8d1c1;padding:20px 22px 18px;font-family:ui-monospace,Consolas,monospace;text-align:left}
.pm-receipt-row{display:flex;justify-content:space-between;gap:14px;font-size:12.5px;color:#635c4e;padding:5px 0}
.pm-receipt-row b{color:#17150f;font-weight:600}
.pm-receipt-rule{height:1px;background:#d8d1c1;margin:9px 0}
.pm-receipt-total{font-size:15px;color:#17150f;font-weight:700}
/* The receipt rests stamped: if the animation never runs — reduced motion, a
   background tab, an engine that skips it — PAID is still on the slip. The
   keyframes only animate it into that resting state. */
.pm-paid{position:absolute;right:14px;top:12px;font-family:'Figtree',system-ui,sans-serif;font-size:13px;font-weight:800;letter-spacing:.2em;color:#6e2530;border:2.5px solid #6e2530;border-radius:4px;padding:4px 12px;opacity:.92;transform:rotate(-12deg);animation:pmPaid .55s cubic-bezier(.16,1,.3,1)}
@keyframes pmPaid{0%{opacity:0;transform:rotate(-24deg) scale(2.6)}70%{opacity:1;transform:rotate(-9deg) scale(.94)}100%{opacity:.92;transform:rotate(-12deg) scale(1)}}
/* the tear edge along the bottom of the slip */
.pm-receipt-tear{height:12px;background:#fdfbf5;border-left:1px solid #d8d1c1;border-right:1px solid #d8d1c1;
  -webkit-mask-image:radial-gradient(circle at 6px 12px,transparent 5px,#000 5.5px);mask-image:radial-gradient(circle at 6px 12px,transparent 5px,#000 5.5px);
  -webkit-mask-size:12px 12px;mask-size:12px 12px;-webkit-mask-repeat:repeat-x;mask-repeat:repeat-x}
@media (prefers-reduced-motion:reduce){.pm-paid{animation:none;opacity:.92;transform:rotate(-12deg) scale(1)}}
`;

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
            <style dangerouslySetInnerHTML={{ __html: RECEIPT_CSS }} />

            <div className="min-h-screen bg-parchment flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]"></div>

                <div className="max-w-md w-full bg-paper/80 backdrop-blur-xl border border-linen rounded-3xl p-8 relative z-10 text-center shadow-2xl">

                    <h1 className="text-3xl font-black text-ink mb-2">Payment received</h1>
                    <p className="text-umber mb-8">Your order is with the press. Here is your receipt.</p>

                    {/* Plate VI — the receipt, with the stamp that lands on it */}
                    <div className="mb-2">
                        <div className="pm-receipt">
                            <div className="pm-paid" aria-hidden="true">PAID</div>
                            <div className="pm-receipt-row">
                                <span>Receipt</span>
                                <b>{transactionId}</b>
                            </div>
                            <div className="pm-receipt-row">
                                <span>Date</span>
                                <b>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</b>
                            </div>
                            <div className="pm-receipt-rule" />
                            <div className="pm-receipt-row pm-receipt-total">
                                <span>Amount paid</span>
                                <b>₹{amount}</b>
                            </div>
                        </div>
                        <div className="pm-receipt-tear" aria-hidden="true" />
                        <p className="text-[10px] uppercase tracking-[.2em] text-foil-deep font-bold mt-3">
                            PublicationMart Press
                        </p>
                    </div>

                    <div className="mb-8" />

                    {/* Guest vs User Logic */}
                    <div className="space-y-4">
                        {!auth.user ? (
                            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-4 text-left">
                                <h3 className="text-indigo-700 font-bold text-sm mb-1 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    What happens next?
                                </h3>
                                <p className="text-ink-soft text-sm leading-relaxed">
                                    We have received your order details properly. Our team will verify and dispatch your book to the provided address shortly.
                                </p>
                                <div className="mt-3 text-xs text-umber bg-paper p-2 rounded border border-linen font-mono">
                                    Please take a screenshot of this page or save your Order ID for reference.
                                </div>
                            </div>
                        ) : (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-emerald-700 text-sm font-medium">
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
                                className="block w-full py-3.5 border border-linen text-ink-soft font-semibold rounded-xl transition-all bg-paper hover:bg-vellum"
                            >
                                {auth.user ? 'Return Home' : 'Continue Shopping'}
                            </Link>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-linen flex items-center justify-center gap-2 text-xs text-umber">
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

