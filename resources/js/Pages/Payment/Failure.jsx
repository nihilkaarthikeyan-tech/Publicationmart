import { Head, Link } from '@inertiajs/react';

/* The quiet twin of the paid receipt: nothing was taken, so the slip is
   stamped RETURNED rather than dressed up as an error. */
const RETURNED_CSS = `
.pm-slip{position:relative;background:#fdfbf5;border:1px solid #d8d1c1;padding:20px 22px 18px;font-family:ui-monospace,Consolas,monospace;text-align:left}
.pm-slip-row{display:flex;justify-content:space-between;gap:14px;font-size:12.5px;color:#635c4e;padding:5px 0}
.pm-slip-row b{color:#17150f;font-weight:600}
/* The slip rests stamped: if the animation never runs — reduced motion, a
   background tab, an engine that skips it — the stamp is still there. The
   keyframes only animate it into that resting state. */
.pm-returned{position:absolute;right:14px;top:12px;font-family:'Figtree',system-ui,sans-serif;font-size:12px;font-weight:800;letter-spacing:.18em;color:#9c4038;border:2.5px solid #9c4038;border-radius:4px;padding:4px 10px;opacity:.9;transform:rotate(-11deg);animation:pmReturned .55s cubic-bezier(.16,1,.3,1)}
@keyframes pmReturned{0%{opacity:0;transform:rotate(-24deg) scale(2.4)}70%{opacity:1;transform:rotate(-8deg) scale(.94)}100%{opacity:.9;transform:rotate(-11deg) scale(1)}}
.pm-slip-tear{height:12px;background:#fdfbf5;border-left:1px solid #d8d1c1;border-right:1px solid #d8d1c1;
  -webkit-mask-image:radial-gradient(circle at 6px 12px,transparent 5px,#000 5.5px);mask-image:radial-gradient(circle at 6px 12px,transparent 5px,#000 5.5px);
  -webkit-mask-size:12px 12px;mask-size:12px 12px;-webkit-mask-repeat:repeat-x;mask-repeat:repeat-x}
@media (prefers-reduced-motion:reduce){.pm-returned{animation:none;opacity:.9;transform:rotate(-11deg) scale(1)}}
`;

export default function Failure({ error }) {
    // The gateway sends anything from a string to an empty array. Only show a
    // reason line when there is something a person can actually read — the old
    // page printed a bare "[]" when the gateway said nothing.
    const reason = (() => {
        if (!error) return null;
        if (typeof error === 'string') return error.trim() || null;
        if (Array.isArray(error)) return error.filter(Boolean).join(', ') || null;
        if (typeof error === 'object') {
            const msg = error.message || error.error || error.description;
            if (msg) return String(msg);
            const body = JSON.stringify(error);
            return body === '{}' ? null : body;
        }
        return String(error);
    })();

    return (
        <>
            <Head title="Payment Failed" />
            <style dangerouslySetInnerHTML={{ __html: RETURNED_CSS }} />

            <div className="min-h-screen bg-parchment flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[100px]"></div>

                <div className="max-w-md w-full bg-paper/80 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 relative z-10 text-center shadow-2xl">

                    <h1 className="text-3xl font-black text-ink mb-2">The payment was returned</h1>
                    <p className="text-umber mb-8">
                        Nothing was charged. Your order is still waiting — try again, or write to us and we will take it from here.
                    </p>

                    {/* Plate VI (the twin) — the returned slip */}
                    <div className="mb-8">
                        <div className="pm-slip">
                            <div className="pm-returned" aria-hidden="true">RETURNED</div>
                            <div className="pm-slip-row"><span>Status</span><b>Not completed</b></div>
                            <div className="pm-slip-row"><span>Amount charged</span><b>₹0.00</b></div>
                            {reason && (
                                <div className="pm-slip-row" style={{ display: 'block' }}>
                                    <span className="block mb-1">Reason</span>
                                    <b className="break-all text-[11.5px]" style={{ color: '#9c4038' }}>{reason}</b>
                                </div>
                            )}
                        </div>
                        <div className="pm-slip-tear" aria-hidden="true" />
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => window.history.back()}
                            className="block w-full py-3.5 bg-oxblood hover:bg-oxblood-deep text-paper font-bold rounded-xl shadow-lg shadow-oxblood/20 transition-all transform hover:-translate-y-0.5"
                        >
                            Try the payment again
                        </button>

                        <Link
                            href="/contact"
                            className="block w-full py-3.5 bg-paper hover:bg-vellum border border-linen text-ink-soft font-semibold rounded-xl transition-all"
                        >
                            Write to the desk
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

