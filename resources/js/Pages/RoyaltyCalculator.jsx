import { Head } from '@inertiajs/react';

import { useState, useEffect } from 'react';

const rupees = (n) =>
    '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* The result printed as a statement, torn off a ledger pad. */
const LEDGER_CSS = `
.pm-ledger{max-width:360px;margin:0 auto;background:#fdfbf5;border:1px solid #d8d1c1;border-bottom:0;padding:22px 26px 16px;font-family:'EB Garamond',Georgia,serif}
.pm-ledger-head{margin:0;text-align:center;font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:#6e2530;font-weight:700}
.pm-ledger-sub{margin:4px 0 14px;text-align:center;font-size:12px;color:#a49b8b;font-family:'Figtree',system-ui,sans-serif}
.pm-ledger-row{display:flex;justify-content:space-between;gap:16px;font-size:15px;color:#4b443a;padding:8px 0;border-bottom:1px dotted #d8d1c1;font-variant-numeric:tabular-nums}
.pm-ledger-total{border-bottom:0;padding-top:12px;font-size:19px;color:#17150f;font-weight:600}
.pm-ledger-total span:last-child{color:#6e2530}
.pm-ledger-proj{border-bottom:0;border-top:1px solid #d8d1c1;margin-top:8px;font-size:13.5px;color:#635c4e}
.pm-ledger-note{margin:10px 0 2px;font-size:13px;line-height:1.5;color:#9c4038;font-family:'Figtree',system-ui,sans-serif}
/* the perforated edge the slip tears off along */
.pm-ledger-tear{max-width:360px;margin:0 auto;height:13px;background:#fdfbf5;border-left:1px solid #d8d1c1;border-right:1px solid #d8d1c1;
  -webkit-mask-image:radial-gradient(circle at 6px 13px,transparent 5px,#000 5.5px);mask-image:radial-gradient(circle at 6px 13px,transparent 5px,#000 5.5px);
  -webkit-mask-size:12px 13px;mask-size:12px 13px;-webkit-mask-repeat:repeat-x;mask-repeat:repeat-x}
`;

export default function RoyaltyCalculator({ auth }) {
    const [format, setFormat] = useState('Paperback');
    const [listPrice, setListPrice] = useState(499);
    const [pageCount, setPageCount] = useState(250);
    const [royalty, setRoyalty] = useState(0);

    // Backend derived logic (from Details.jsx and PaymentController)
    // Printing Cost = (Pages * 1.5) + 60
    // Author Cost (Base COst) = Printing Cost * 1.4
    // Royalty = List Price - Author Cost
    useEffect(() => {
        const calculateRoyalty = () => {
            if (format === 'Ebook') {
                // Ebook logic (Assumed: No printing cost, just platform fee?)
                // Usually 70% of list price
                setRoyalty(listPrice * 0.70);
                return;
            }

            // Paperback / Hardcover Logic
            // Note: Hardcover usually has higher base cost, but using same logic for now as simplified in existing backend
            const printingCost = (pageCount * 1.5) + 60;
            const authorCost = printingCost * 1.4;

            // Allow negative or zero if price is too low
            const calculated = Math.max(0, listPrice - authorCost);
            setRoyalty(calculated);
        };

        calculateRoyalty();
    }, [listPrice, pageCount, format]);

    return (
        <div className="min-h-screen bg-parchment text-ink selection:bg-indigo-500 selection:text-ink">
            <Head title="Royalty Calculator – Estimate Your Book Earnings | PublicationMart">
                <meta name="description" content="Calculate how much you can earn per book sale. Estimate royalties for paperback, hardcover, and eBook formats with our free royalty calculator." />
                <meta property="og:title" content="Royalty Calculator | PublicationMart" />
                <meta property="og:description" content="Free royalty calculator for authors. Estimate your earnings per book sale on Amazon and other retailers." />
                <meta property="og:url" content="https://publicationmart.com/royalty-calculator" />
                <meta property="og:type" content="website" />
            </Head>


            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-16 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        Royalty Calculator
                    </h1>
                    <p className="text-umber max-w-2xl mx-auto">
                        Estimate your earnings per book sold on Amazon and other major retailers.
                    </p>
                </div>

                <div className="max-w-2xl mx-auto bg-parchment rounded-3xl border border-linen p-8 md:p-12 shadow-2xl relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    {/* Glow Effect */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />

                    {/* Format Toggle */}
                    <div className="space-y-2 mb-10">
                        <label className="text-sm font-medium text-umber">Book Format</label>
                        <div className="grid grid-cols-3 gap-2 bg-paper p-1.5 rounded-xl">
                            {['Paperback', 'Hardcover', 'Ebook'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFormat(type)}
                                    className={`py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${format === type
                                        ? 'bg-oxblood text-paper shadow-lg'
                                        : 'text-umber hover:text-ink hover:bg-paper'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* List Price Slider */}
                    <div className="mb-10 space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-umber">List Price (₹)</label>
                            <span className="text-xl font-bold">₹{listPrice}</span>
                        </div>
                        <input
                            type="range"
                            min="100"
                            max="5000"
                            step="10"
                            value={listPrice}
                            onChange={(e) => setListPrice(Number(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                        />
                        <div className="flex justify-between text-xs text-umber px-1">
                            <span>₹100</span>
                            <span>₹5000</span>
                        </div>
                    </div>

                    {/* Page Count Slider */}
                    <div className="mb-12 space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-umber">Page Count</label>
                            <span className="text-xl font-bold">{pageCount} pages</span>
                        </div>
                        <input
                            type="range"
                            min="24"
                            max="1000"
                            step="1"
                            value={pageCount}
                            onChange={(e) => setPageCount(Number(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                        />
                        <div className="flex justify-between text-xs text-umber px-1">
                            <span>24</span>
                            <span>1000</span>
                        </div>
                    </div>

                    <div className="border-t border-linen my-8" />

                    {/* Plate IV — the result, printed as a royalty statement.
                        The arithmetic is unchanged; only its form is. The
                        deduction is shown as what it is: list price less what
                        reaches you. */}
                    <div className="pm-ledger" aria-live="polite">
                        <p className="pm-ledger-head">Royalty Statement</p>
                        <p className="pm-ledger-sub">
                            {format} · {format === 'Ebook' ? 'no print cost' : `${pageCount} pages`}
                        </p>

                        <div className="pm-ledger-row">
                            <span>List price</span>
                            <span>{rupees(listPrice)}</span>
                        </div>
                        <div className="pm-ledger-row">
                            <span>{format === 'Ebook' ? 'Platform share' : 'Print & platform'}</span>
                            <span>− {rupees(listPrice - royalty)}</span>
                        </div>
                        <div className="pm-ledger-row pm-ledger-total">
                            <span>Yours per copy</span>
                            <span>{rupees(royalty)}</span>
                        </div>

                        {royalty > 0 ? (
                            <div className="pm-ledger-row pm-ledger-proj">
                                <span>× 100 copies a month</span>
                                <span>{rupees(royalty * 100)}</span>
                            </div>
                        ) : (
                            <p className="pm-ledger-note">
                                At this price the print cost is not covered. Raise the
                                list price, or reduce the page count.
                            </p>
                        )}
                    </div>
                    <div className="pm-ledger-tear" aria-hidden="true" />
                    <p className="text-center text-[11px] text-taupe mt-3">
                        An estimate on today’s print rates — your real statement is issued monthly.
                    </p>
                </div>
            </div>


            <style dangerouslySetInnerHTML={{ __html: LEDGER_CSS }} />

            <style jsx global>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
}

