import { Head, Link, usePage, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState } from 'react';

export default function Cart({ auth, book, format }) {
    const { app_url } = usePage().props;
    const [quantity, setQuantity] = useState(1);
    const [processing, setProcessing] = useState(false);

    // Calculate prices
    const unitPrice = format === 'audiobook'
        ? (book.selling_price ? parseFloat(book.selling_price) * 0.7 : 249) // Audiobook is typically cheaper
        : parseFloat(book.selling_price) || 399;

    const subtotal = unitPrice * quantity;
    const gst = subtotal * 0.18; // 18% GST
    const total = subtotal + gst;

    const handleCheckout = () => {
        setProcessing(true);
        // Redirect to payment gateway (placeholder for now)
        router.post(route('cart.checkout'), {
            book_id: book.id,
            format: format,
            quantity: quantity,
            amount: total,
        }, {
            onSuccess: () => {
                setProcessing(false);
            },
            onError: () => {
                alert('Checkout failed. Please try again.');
                setProcessing(false);
            }
        });
    };

    return (
        <>
            <Head title={`Cart - ${book.title}`} />

            <div className="min-h-screen bg-[#f0ece3] text-[#17150f] py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="mb-8">
                        <ol className="flex items-center gap-2 text-sm">
                            <li>
                                <Link href={route('welcome')} className="text-[#635c4e] hover:text-[#17150f] transition">
                                    Home
                                </Link>
                            </li>
                            <li className="text-[#635c4e]">/</li>
                            <li>
                                <Link href={route('book-store.index')} className="text-[#635c4e] hover:text-[#17150f] transition">
                                    Book Store
                                </Link>
                            </li>
                            <li className="text-[#635c4e]">/</li>
                            <li>
                                <Link href={route('book-store.show', book.id)} className="text-[#635c4e] hover:text-[#17150f] transition">
                                    {book.title}
                                </Link>
                            </li>
                            <li className="text-[#635c4e]">/</li>
                            <li className="text-indigo-700">Cart</li>
                        </ol>
                    </nav>

                    {/* Cart Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[#17150f] mb-2">Your Cart</h1>
                        <p className="text-[#635c4e]">Complete your purchase</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Cart Item Card */}
                            <div className="bg-[#f0ece3] rounded-2xl border border-[#d8d1c1] p-6">
                                <div className="flex gap-6">
                                    {/* Book Cover */}
                                    <div className="w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-[#faf8f3]">
                                        {book.cover_design_path ? (
                                            <img
                                                src={`${app_url}/storage/${book.cover_design_path}`}
                                                alt={book.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[#635c4e]">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Book Details */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-bold text-[#17150f]">{book.title}</h3>
                                                <p className="text-[#635c4e] text-sm">by {book.author_name}</p>
                                                <span className={`inline-block mt-2 px-3 py-1 text-xs font-bold rounded-full ${format === 'audiobook'
                                                    ? 'bg-purple-500/20 text-purple-700'
                                                    : 'bg-amber-500/20 text-amber-800'
                                                    }`}>
                                                    {format === 'audiobook' ? '🎧 Audiobook' : '📖 Hardcover'}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-[#17150f]">₹{unitPrice.toFixed(2)}</div>
                                                <div className="text-xs text-[#635c4e]">per unit</div>
                                            </div>
                                        </div>

                                        {/* Quantity Selector */}
                                        <div className="mt-4 flex items-center gap-4">
                                            <span className="text-[#635c4e] text-sm">Quantity:</span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 text-[#17150f] flex items-center justify-center transition"
                                                >
                                                    -
                                                </button>
                                                <span className="w-12 text-center text-[#17150f] font-bold">{quantity}</span>
                                                <button
                                                    onClick={() => setQuantity(quantity + 1)}
                                                    className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 text-[#17150f] flex items-center justify-center transition"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Back to Book */}
                            <Link
                                href={route('book-store.show', book.id)}
                                className="inline-flex items-center gap-2 text-[#635c4e] hover:text-[#17150f] transition text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Continue Shopping
                            </Link>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-[#f0ece3] rounded-2xl border border-[#d8d1c1] p-6 sticky top-8">
                                <h2 className="text-lg font-bold text-[#17150f] mb-4">Order Summary</h2>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between text-[#635c4e]">
                                        <span>Subtotal ({quantity} item{quantity > 1 ? 's' : ''})</span>
                                        <span className="text-[#17150f]">₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-[#635c4e]">
                                        <span>GST (18%)</span>
                                        <span className="text-[#17150f]">₹{gst.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-[#d8d1c1] pt-3 mt-3">
                                        <div className="flex justify-between text-[#17150f] font-bold text-lg">
                                            <span>Total</span>
                                            <span>₹{total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Checkout Button */}
                                <button
                                    onClick={handleCheckout}
                                    disabled={processing}
                                    className="w-full mt-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            Proceed to Payment
                                        </>
                                    )}
                                </button>

                                {/* Secure Checkout Badge */}
                                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#635c4e]">
                                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    Secure Checkout
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
