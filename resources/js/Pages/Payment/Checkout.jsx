import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

export default function Checkout({ auth, book, purchaseType = 'hardcover' }) {
    const { app_url } = usePage().props;
    const [isProcessing, setIsProcessing] = useState(false);
    const [pincodeError, setPincodeError] = useState('');
    const [isLoadingPincode, setIsLoadingPincode] = useState(false);

    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [couponMessage, setCouponMessage] = useState(null); // { type: 'success'|'error', text: '' }
    const [verifyingCoupon, setVerifyingCoupon] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    // Form State
    const [form, setForm] = useState({
        full_name: auth?.user?.name || '',
        email: auth?.user?.email || '',
        phone: auth?.user?.mobile_number || '',
        address: '',
        city: '',
        state: '',
        pincode: ''
    });

    const lookupPincode = async (code) => {
        if (!code || code.length !== 6) return;

        setIsLoadingPincode(true);
        setPincodeError('');

        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${code}`);
            const data = await response.json();

            if (data && data[0].Status === 'Success') {
                const details = data[0].PostOffice[0];
                setForm(prev => ({
                    ...prev,
                    city: details.District,
                    state: details.State,
                    pincode: code
                }));
            } else {
                setPincodeError('Invalid Pincode.');
                setForm(prev => ({ ...prev, city: '', state: '' }));
            }
        } catch (error) {
            console.error(error);
            setPincodeError('Could not validate.');
        } finally {
            setIsLoadingPincode(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        if (name === 'pincode') {
            if (value.length === 6) {
                lookupPincode(value);
            } else {
                setPincodeError('');
            }
        }
    };

    // Fix Math Logic: Ensure numbers are actually numbers
    const rawPrice = purchaseType === 'audio'
        ? Math.round((parseFloat(book.selling_price) || 0) * 0.7)
        : (parseFloat(book.selling_price) || 0);

    const basePrice = Number(rawPrice);
    // No GST for books
    const total = Math.max(0, Number(basePrice) - discount);

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        if (!couponCode.trim()) return;

        setVerifyingCoupon(true);
        setCouponMessage(null);
        setDiscount(0);
        setAppliedCoupon(null);

        try {
            const response = await axios.post(route('coupons.verify'), {
                code: couponCode,
                amount: basePrice
            });

            if (response.data.valid) {
                setDiscount(response.data.discount_amount);
                setAppliedCoupon(response.data.code);
                setCouponMessage({ type: 'success', text: response.data.message });
            }
        } catch (error) {
            console.error("Coupon Error", error);
            if (error.response && error.response.data) {
                setCouponMessage({ type: 'error', text: error.response.data.message || 'Invalid coupon.' });
            } else {
                setCouponMessage({ type: 'error', text: 'Could not verify coupon.' });
            }
            setDiscount(0);
            setAppliedCoupon(null);
        } finally {
            setVerifyingCoupon(false);
        }
    };

    const handlePayment = (e) => {
        e.preventDefault();

        // Basic Validation
        if (!form.full_name || !form.email || !form.phone || !form.address || !form.pincode) {
            alert("Please fill in all shipping details.");
            return;
        }

        setIsProcessing(true);
        router.post(route('payment.process', book.id), {
            // NOTE: amount is intentionally NOT sent — the server computes it
            // from the book price and re-validates the coupon. purchase_type
            // and coupon_code let the server reproduce the displayed total.
            payment_method: 'phonepe',
            purchase_type: purchaseType,
            coupon_code: appliedCoupon,
            shipping_details: {
                ...form,
                coupon_code: appliedCoupon
            }
        }, {
            onError: () => setIsProcessing(false),
            onFinish: () => setIsProcessing(false),
        });
    };

    const isTestDomain = window.location.hostname.includes('radinfotec') || window.location.hostname === 'localhost';

    return (
        <>
            <Head title={`Checkout - ${book.title}`} />

            <div className="min-h-screen bg-[#f0ece3] text-[#17150f] py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-black text-[#17150f] mb-2">Secure Checkout</h1>
                        <p className="text-[#635c4e]">Complete your {purchaseType === 'audio' ? 'Audiobook' : 'Hardcover'} purchase</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Shipping & Payment Details */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Shipping Details Form */}
                            <div className="bg-[#faf8f3] rounded-2xl border border-[#d8d1c1] p-6">
                                <h3 className="text-xl font-bold text-[#17150f] mb-6 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    Shipping Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-[#635c4e] uppercase">Full Name</label>
                                        <input type="text" name="full_name" value={form.full_name} onChange={handleChange} className="w-full bg-[#faf8f3] border border-[#d8d1c1] rounded-lg px-4 py-3 text-[#17150f] focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Enter full name" required />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-[#635c4e] uppercase">WhatsApp Number</label>
                                        <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full bg-[#faf8f3] border border-[#d8d1c1] rounded-lg px-4 py-3 text-[#17150f] focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="+91 99999 99999" required />
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-xs font-bold text-[#635c4e] uppercase">Email Address (For Invoice)</label>
                                        <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full bg-[#faf8f3] border border-[#d8d1c1] rounded-lg px-4 py-3 text-[#17150f] focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="name@example.com" required />
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-xs font-bold text-[#635c4e] uppercase">Full Address</label>
                                        <textarea name="address" value={form.address} onChange={handleChange} rows="2" className="w-full bg-[#faf8f3] border border-[#d8d1c1] rounded-lg px-4 py-3 text-[#17150f] focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Flat No, Street, Landmark" required></textarea>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-[#635c4e] uppercase">City</label>
                                        <input type="text" name="city" value={form.city} onChange={handleChange} className="w-full bg-[#faf8f3] border border-[#d8d1c1] rounded-lg px-4 py-3 text-[#17150f] focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="City" required />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-[#635c4e] uppercase">State</label>
                                        <input type="text" name="state" value={form.state} onChange={handleChange} className="w-full bg-[#faf8f3] border border-[#d8d1c1] rounded-lg px-4 py-3 text-[#17150f] focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="State" required />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-[#635c4e] uppercase flex justify-between">
                                            <span>Pincode</span>
                                            {isLoadingPincode && <span className="text-indigo-700 animate-pulse">Checking...</span>}
                                        </label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={form.pincode}
                                            onChange={handleChange}
                                            maxLength="6"
                                            className={`w-full bg-[#faf8f3] border rounded-lg px-4 py-3 text-[#17150f] focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${pincodeError ? 'border-red-500 focus:ring-red-500' : 'border-[#d8d1c1]'}`}
                                            placeholder="000000"
                                            required
                                        />
                                        {pincodeError && <p className="text-xs text-red-500 font-semibold">{pincodeError}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Secure Payment Box */}
                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 flex gap-4 items-start">
                                <div className="shrink-0 pt-1">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-[#17150f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-[#17150f] mb-1">Pay with PhonePe Secure Gateway</h2>
                                    <p className="text-sm text-[#635c4e]">
                                        You will be redirected to PhonePe to complete your payment securely. We do not store your card details.
                                    </p>
                                    <div className="flex gap-2 mt-3 opacity-60">
                                        <span className="bg-[#e7e1d4] px-2 py-1 rounded text-[10px] uppercase">UPI</span>
                                        <span className="bg-[#e7e1d4] px-2 py-1 rounded text-[10px] uppercase">Cards</span>
                                        <span className="bg-[#e7e1d4] px-2 py-1 rounded text-[10px] uppercase">NetBanking</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-[#faf8f3] rounded-2xl border border-[#d8d1c1] p-6 sticky top-8">
                                <h3 className="text-lg font-bold text-[#17150f] mb-6">Order Summary</h3>

                                {/* Book Info */}
                                <div className="flex gap-4 mb-6 pb-6 border-b border-[#d8d1c1]">
                                    <div className="w-20 h-28 bg-[#faf8f3] rounded-lg overflow-hidden flex-shrink-0">
                                        {book.cover_design_path ? (
                                            <img src={`${app_url}/storage/${book.cover_design_path}`} alt={book.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[#635c4e]">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[#17150f] font-semibold text-sm mb-1 line-clamp-2">{book.title}</h4>
                                        <p className="text-[#635c4e] text-xs">by {book.author_name}</p>
                                        <p className="text-indigo-700 text-xs mt-1 font-medium capitalize">{purchaseType} Edition</p>
                                    </div>
                                </div>

                                {/* Price Breakdown */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#635c4e]">Price ({purchaseType})</span>
                                        <span className="text-[#17150f]">₹{basePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    {/* Discount Show */}
                                    {discount > 0 && (
                                        <div className="flex justify-between text-sm text-green-700">
                                            <span>Coupon Discount</span>
                                            <span>- ₹{discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    )}

                                    <div className="border-t border-[#d8d1c1] pt-3">
                                        <div className="flex justify-between">
                                            <span className="text-[#17150f] font-bold">Total</span>
                                            <span className="text-2xl font-black text-[#6e2530]">
                                                ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Coupon Section */}
                                <div className="mb-6">
                                    <div className="relative flex">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            placeholder="Coupon Code"
                                            className="w-full bg-[#faf8f3] border border-[#d8d1c1] rounded-l-lg px-4 py-2 text-sm text-[#17150f] focus:outline-none focus:border-indigo-500 placeholder-gray-500 uppercase font-mono"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            disabled={verifyingCoupon || !couponCode.trim()}
                                            className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase rounded-r-lg transition-colors disabled:opacity-50"
                                        >
                                            {verifyingCoupon ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                    {couponMessage && (
                                        <p className={`text-xs mt-2 font-bold ${couponMessage.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                                            {couponMessage.text}
                                        </p>
                                    )}
                                </div>

                                {/* Pay Button */}
                                <button
                                    onClick={handlePayment}
                                    disabled={isProcessing}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                                >
                                    {isProcessing ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <span>{isTestDomain ? `TEST BYPASS — Complete Order` : `Proceed to Pay`}</span>
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </>
                                    )}
                                </button>

                                {/* Back Link */}
                                <Link
                                    href={route('book-store.show', { book: book.id })}
                                    className="block text-center mt-4 text-[#635c4e] hover:text-[#17150f] text-sm transition"
                                >
                                    ← Back to Book Details
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
