import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Review({ auth, book }) {
    const { post, processing } = useForm();
    const [showPopup, setShowPopup] = useState(false);

    const submit = () => {
        post(route('books.publish', book.id));
    };

    const handleConfirm = () => {
        setShowPopup(true);
        setTimeout(() => {
            submit();
        }, 2000);
    };

    return (
        <>
            <Head title="Final Review - Step 4" />

            <div className="min-h-screen relative overflow-hidden">
                {/* Split Background - Dark Left, Light Right */}
                <div className="absolute inset-0 bg-gradient-to-br from-oxblood-deep via-oxblood to-oxblood-night" />
                <div className="absolute inset-0 bg-gradient-to-l from-slate-50 via-slate-50/98 to-transparent" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 5% 100%)' }} />

                {/* Decorative elements */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-20 left-32 w-80 h-80 bg-indigo-500/15 rounded-full blur-[120px]" />

                <div className="relative py-8 lg:py-12">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                        {/* Progress Steps */}
                        <div className="mb-8">
                            <div className="flex items-center justify-center lg:justify-end">
                                <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-white/50">
                                    {/* All Steps Complete */}
                                    {[1, 2, 3].map((step, idx) => (
                                        <div key={step} className="flex items-center">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500 text-white font-bold text-sm shadow">
                                                ✓
                                            </div>
                                            <span className="ml-2 text-xs font-semibold text-umber hidden sm:inline">
                                                {step === 1 ? 'Basic Info' : step === 2 ? 'Design' : 'Details'}
                                            </span>
                                            <div className="w-8 h-0.5 bg-emerald-400 rounded ml-3"></div>
                                        </div>
                                    ))}

                                    {/* Step 4 - Active */}
                                    <div className="flex items-center">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white font-bold text-sm shadow-lg ring-2 ring-emerald-200 animate-pulse">
                                            4
                                        </div>
                                        <span className="ml-2 text-xs font-bold text-ink hidden sm:inline">Review</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Card */}
                        <div className="bg-white rounded-[1.75rem] shadow-2xl shadow-ink/10 overflow-hidden border border-vellum/80">
                            {/* Header */}
                            <div className="relative px-8 py-6 bg-gradient-to-br from-oxblood-deep via-oxblood to-oxblood-night overflow-hidden">
                                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                                <div className="relative flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <Link
                                            href={route('books.details', book.id)}
                                            className="p-2 -ml-2 bg-white/10 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
                                            title="Go Back"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </Link>
                                        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                                            <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h1 className="text-xl font-bold text-white tracking-tight">Final Review</h1>
                                            <p className="text-taupe text-sm">Review everything before submission 🎉</p>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                                        <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Step</span>
                                        <span className="text-sm font-black text-white">4</span>
                                        <span className="text-[11px] font-medium text-umber">of 4</span>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 md:p-10">

                                {/* Summary Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                                    {/* PREVIEW BLOCK - NEW */}
                                    {book.cover_design_path && (
                                        <div className="md:col-span-2 bg-paper p-6 rounded-2xl border-2 border-vellum flex flex-col sm:flex-row gap-8 items-center justify-center">
                                            {/* Cover Image */}
                                            <div className="relative group shadow-2xl rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                                                <img
                                                    src={book.cover_design_path.startsWith('http') ? book.cover_design_path : `/storage/${book.cover_design_path}`}
                                                    alt="Book Cover"
                                                    className="w-40 sm:w-48 h-auto object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <a href={book.cover_design_path.startsWith('http') ? book.cover_design_path : `/storage/${book.cover_design_path}`} target="_blank" className="text-white text-xs font-bold uppercase tracking-widest border border-white px-3 py-1 rounded hover:bg-white hover:text-black transition-colors">View Full</a>
                                                </div>
                                            </div>

                                            {/* Quick Specs Side */}
                                            <div className="text-center sm:text-left space-y-4">
                                                <div>
                                                    <h3 className="text-2xl font-black text-ink leading-tight">{book.title}</h3>
                                                    {book.subtitle && <p className="text-lg text-umber font-medium italic">{book.subtitle}</p>}
                                                    <p className="text-sm font-bold text-purple-600 mt-1 uppercase tracking-wider">By {book.author_name}</p>
                                                </div>

                                                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                                    <span className="px-3 py-1 bg-white border border-linen rounded-full text-xs font-bold text-umber">{book.book_size}</span>
                                                    <span className="px-3 py-1 bg-white border border-linen rounded-full text-xs font-bold text-umber">{book.printing_color}</span>
                                                    <span className="px-3 py-1 bg-white border border-linen rounded-full text-xs font-bold text-umber">{book.paper_type}</span>
                                                </div>

                                                {book.interior_file && (
                                                    <a
                                                        href={book.interior_file.startsWith('http') ? book.interior_file : `/storage/${book.interior_file}`}
                                                        target="_blank"
                                                        className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                        Preview Manuscript File
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Basic Information */}
                                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-2xl border-2 border-purple-100">
                                        <div className="flex items-center mb-4">
                                            <div className="p-2 bg-purple-500 rounded-lg mr-3">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                            </div>
                                            <h3 className="font-bold text-ink text-lg">Basic Information</h3>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <span className="text-xs text-umber uppercase tracking-wide">Title</span>
                                                <p className="font-semibold text-ink">{book.title}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-umber uppercase tracking-wide">Author</span>
                                                <p className="font-semibold text-ink">{book.author_name}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <span className="text-xs text-umber uppercase tracking-wide">Language</span>
                                                    <p className="font-medium text-night">{book.language}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-umber uppercase tracking-wide">Genre</span>
                                                    <p className="font-medium text-night">{book.genre}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Design Specifications */}
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-100">
                                        <div className="flex items-center mb-4">
                                            <div className="p-2 bg-blue-500 rounded-lg mr-3">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                                </svg>
                                            </div>
                                            <h3 className="font-bold text-ink text-lg">Design</h3>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="bg-white p-3 rounded-lg">
                                                    <span className="text-xs text-umber">Size</span>
                                                    <p className="font-bold text-ink text-sm">{book.book_size}</p>
                                                </div>
                                                <div className="bg-white p-3 rounded-lg">
                                                    <span className="text-xs text-umber">Color</span>
                                                    <p className="font-bold text-ink text-sm">{book.printing_color}</p>
                                                </div>
                                                <div className="bg-white p-3 rounded-lg">
                                                    <span className="text-xs text-umber">Paper</span>
                                                    <p className="font-bold text-ink text-sm">{book.paper_type}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                                                    <span className="text-xs text-umber">Interior</span>
                                                    {book.interior_file ? (
                                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">✓ Uploaded</span>
                                                    ) : (
                                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">Missing</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                                                    <span className="text-xs text-umber">Cover</span>
                                                    {book.cover_design_path ? (
                                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">✓ Uploaded</span>
                                                    ) : (
                                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">Missing</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pricing */}
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-100 md:col-span-2">
                                        <div className="flex items-center mb-4">
                                            <div className="p-2 bg-green-500 rounded-lg mr-3">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="font-bold text-ink text-lg">Pricing & Revenue</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-white p-4 rounded-xl">
                                                <span className="text-xs text-umber uppercase tracking-wide">Selling Price</span>
                                                <p className="text-2xl font-bold text-ink mt-1">₹{book.selling_price}</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl">
                                                <span className="text-xs text-umber uppercase tracking-wide">Printing Cost</span>
                                                <p className="text-xl font-semibold text-red-600 mt-1">- ₹{book.printing_cost}</p>
                                            </div>
                                            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-xl text-white">
                                                <span className="text-xs text-green-100 uppercase tracking-wide">Your Royalty</span>
                                                <p className="text-2xl font-bold mt-1">₹{(parseFloat(book.selling_price || 0) - parseFloat(book.author_cost || 0)).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description Preview */}
                                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-2xl border-2 border-vellum md:col-span-2">
                                        <div className="flex items-center mb-4">
                                            <div className="p-2 bg-ink-soft rounded-lg mr-3">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                                </svg>
                                            </div>
                                            <h3 className="font-bold text-ink text-lg">About the Book</h3>
                                        </div>
                                        <p className="text-sm text-ink-soft leading-relaxed italic">
                                            {book.about_book ? (book.about_book.length > 200 ? book.about_book.substring(0, 200) + '...' : book.about_book) : 'No description provided'}
                                        </p>
                                    </div>

                                </div>

                                {/* Info Box */}
                                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h4 className="text-sm font-bold text-blue-900">What happens next?</h4>
                                            <p className="text-sm text-blue-700 mt-1">
                                                After submission, your book will be reviewed by our admin team. You'll be notified via email once it's approved and published to the store. You can track the status in your dashboard.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between pt-6 border-t">
                                    <Link
                                        href={route('books.details', book.id)}
                                        className="flex items-center text-umber hover:text-ink font-semibold transition-colors"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Edit Details
                                    </Link>

                                    <button
                                        onClick={handleConfirm}
                                        disabled={processing || showPopup}
                                        className="flex items-center px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing || showPopup ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Confirm & Submit for Approval
                                            </>
                                        )}
                                    </button>

                                    {/* Bottom Back Button */}
                                    <Link
                                        href={route('books.details', book.id)}
                                        className="flex items-center justify-center px-6 py-3 bg-white border-2 border-linen text-umber font-bold rounded-xl hover:bg-paper hover:border-linen-deep transition-all"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        ← Go Back to Edit
                                    </Link>
                                </div>

                            </div>
                        </div>

                        {/* Help Text */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-umber">
                                Questions? <a href="#" className="text-violet-600 hover:text-violet-700 font-semibold">Contact Support</a>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Success Popup */}
                {showPopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center transform scale-100 animate-bounce-in">
                            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-3xl font-bold text-ink mb-3">Submitted Successfully!</h3>
                            <p className="text-umber mb-6 leading-relaxed">
                                Your book details have been successfully submitted to the admin for approval. You can track the status in your dashboard.
                            </p>
                            <div className="w-full bg-linen rounded-full h-3 mb-3 overflow-hidden">
                                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                            </div>
                            <p className="text-sm text-umber font-medium">Redirecting to dashboard...</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
