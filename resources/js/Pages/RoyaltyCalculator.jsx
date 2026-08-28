import { Head } from '@inertiajs/react';

import { useState, useEffect } from 'react';

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
        <div className="min-h-screen bg-[#f0ece3] text-[#17150f] selection:bg-indigo-500 selection:text-[#17150f]">
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
                    <p className="text-[#635c4e] max-w-2xl mx-auto">
                        Estimate your earnings per book sold on Amazon and other major retailers.
                    </p>
                </div>

                <div className="max-w-2xl mx-auto bg-[#f0ece3] rounded-3xl border border-[#d8d1c1] p-8 md:p-12 shadow-2xl relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    {/* Glow Effect */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />

                    {/* Format Toggle */}
                    <div className="space-y-2 mb-10">
                        <label className="text-sm font-medium text-[#635c4e]">Book Format</label>
                        <div className="grid grid-cols-3 gap-2 bg-[#faf8f3] p-1.5 rounded-xl">
                            {['Paperback', 'Hardcover', 'Ebook'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFormat(type)}
                                    className={`py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${format === type
                                        ? 'bg-indigo-600 text-[#17150f] shadow-lg'
                                        : 'text-[#635c4e] hover:text-[#17150f] hover:bg-[#faf8f3]'
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
                            <label className="text-sm font-medium text-[#635c4e]">List Price (₹)</label>
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
                        <div className="flex justify-between text-xs text-[#635c4e] px-1">
                            <span>₹100</span>
                            <span>₹5000</span>
                        </div>
                    </div>

                    {/* Page Count Slider */}
                    <div className="mb-12 space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-[#635c4e]">Page Count</label>
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
                        <div className="flex justify-between text-xs text-[#635c4e] px-1">
                            <span>24</span>
                            <span>1000</span>
                        </div>
                    </div>

                    <div className="border-t border-[#d8d1c1] my-8" />

                    {/* Result */}
                    <div className="text-center">
                        <p className="text-xs font-bold text-[#635c4e] uppercase tracking-widest mb-2">
                            Estimated Royalty Per Sale
                        </p>
                        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                            {royalty > 0 ? `₹${royalty.toFixed(2)}` : '₹0.00'}
                        </div>
                        {royalty <= 0 && (
                            <p className="text-red-400 text-sm mt-2">
                                Price too low for this page count.
                            </p>
                        )}
                    </div>
                </div>
            </div>


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

