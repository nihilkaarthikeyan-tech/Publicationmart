import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function BookPreview({ auth, book }) {
    const [isMounted, setIsMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const getCoverUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http') || path.startsWith('//')) {
            return `${path}?t=${new Date().getTime()}`;
        }
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        const storagePath = cleanPath.startsWith('storage/') ? cleanPath : `storage/${cleanPath}`;
        return `/${storagePath}?t=${new Date().getTime()}`;
    };

    const handleProceed = () => {
        router.visit(route('books.details', { book: book.id, previewed: 1 }));
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📖' },
        { id: 'author', label: 'About Author', icon: '✍️' },
        { id: 'details', label: 'Product Details', icon: '📋' },
        { id: 'pricing', label: 'Pricing & Order', icon: '💰' },
    ];

    const sellingPrice = parseFloat(book.selling_price) || 0;
    const printingCost = parseFloat(book.printing_cost) || 0;
    const authorCost = parseFloat(book.author_cost) || 0;
    const royalty = Math.max(0, sellingPrice - authorCost);

    return (
        <>
            <Head title={`Preview: ${book.title}`} />

            <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 font-sans selection:bg-blue-200 selection:text-blue-900">

                {/* Top Navigation */}
                <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            <div className="flex items-center gap-3">
                                <Link
                                    href={route('books.details', book.id)}
                                    className="p-2 -ml-2 text-[#635c4e] hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </Link>
                                <div className="h-6 w-px bg-slate-200" />
                                <div>
                                    <h1 className="text-sm font-bold text-slate-800 tracking-tight">Book Preview</h1>
                                    <p className="text-[11px] text-[#635c4e]">Review before publishing</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${book.status === 'published'
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                    : 'bg-blue-50 text-blue-600 border-blue-200'
                                    }`}>
                                    {book.status === 'published' ? '● Published' : '◉ Draft Preview'}
                                </span>
                            </div>
                        </div>
                    </div>
                </nav>

                <main className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32 transition-all duration-700 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

                    {/* Hero Section */}
                    <div className="grid lg:grid-cols-12 gap-12 mb-16">

                        {/* Left: Book Cover */}
                        <div className="lg:col-span-4 flex justify-center">
                            <div className="relative group">
                                {/* Shadow & Glow */}
                                <div className="absolute -inset-4 bg-gradient-to-br from-blue-200/40 via-sky-200/30 to-indigo-200/40 rounded-2xl blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* Book Container */}
                                <div className="relative">
                                    {/* Book spine shadow */}
                                    <div className="absolute left-0 top-2 bottom-2 w-3 bg-gradient-to-r from-slate-400/30 to-transparent rounded-l-sm z-10" />

                                    <div className="relative w-60 sm:w-72 aspect-[2/3] rounded-xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] border border-[#d8d1c1] transform group-hover:scale-[1.02] transition-transform duration-500">
                                        {book.cover_design_path ? (
                                            <img
                                                src={getCoverUrl(book.cover_design_path)}
                                                alt={book.title}
                                                className="w-full h-full object-cover object-right"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center text-[#635c4e] p-8 text-center">
                                                <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                                <span className="font-medium text-sm">Cover Pending</span>
                                            </div>
                                        )}
                                        {/* Shine overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Book Info */}
                        <div className="lg:col-span-8 flex flex-col justify-center">
                            <div className="text-center lg:text-left">
                                {/* Genre & Language Tags */}
                                <div className="flex flex-wrap items-center gap-2 justify-center lg:justify-start mb-5">
                                    {book.genre && (
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-xs font-bold uppercase tracking-wider">
                                            {book.genre}
                                        </span>
                                    )}
                                    {book.language && (
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-xs font-bold uppercase tracking-wider">
                                            {book.language}
                                        </span>
                                    )}
                                    <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wider">
                                        PublicationMart
                                    </span>
                                </div>

                                {/* Title */}
                                <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight mb-3 tracking-tight">
                                    {book.title || 'Untitled Book'}
                                </h1>

                                {/* Subtitle */}
                                {book.subtitle && (
                                    <p className="text-xl text-[#635c4e] font-light mb-6 max-w-2xl mx-auto lg:mx-0">
                                        {book.subtitle}
                                    </p>
                                )}

                                {/* Author */}
                                <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
                                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-[2px] shadow-lg shadow-blue-200">
                                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-sm">
                                            {book.author_name?.charAt(0) || 'A'}
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-slate-800 font-bold text-sm">{book.author_name || 'Anonymous'}</div>
                                        <div className="text-blue-500 text-[10px] uppercase font-bold tracking-widest">Author</div>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        { label: 'Format', value: book.book_size || 'Standard', color: 'from-blue-50 to-indigo-50 border-blue-100' },
                                        { label: 'Pages', value: book.num_pages || '—', color: 'from-blue-50 to-indigo-50 border-blue-100' },
                                        { label: 'Binding', value: book.binding_type || 'Softcover', color: 'from-amber-50 to-orange-50 border-amber-100' },
                                        { label: 'Price', value: `₹${book.selling_price || '—'}`, color: 'from-emerald-50 to-green-50 border-emerald-100', highlight: true },
                                    ].map((stat, idx) => (
                                        <div key={idx} className={`bg-gradient-to-br ${stat.color} p-4 rounded-2xl border hover:shadow-md transition-shadow`}>
                                            <div className="text-[#635c4e] text-[10px] uppercase font-bold tracking-widest mb-1">{stat.label}</div>
                                            <div className={`font-black text-lg ${stat.highlight ? 'text-emerald-600' : 'text-slate-800'}`}>{stat.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Section */}
                    <div className="max-w-5xl mx-auto">
                        {/* Tab Bar */}
                        <div className="sticky top-16 bg-white/90 backdrop-blur-xl z-30 pt-2 pb-0 -mx-4 px-4 border-b border-slate-200/60">
                            <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-5 py-3.5 text-sm font-semibold tracking-wide transition-all relative whitespace-nowrap rounded-t-xl ${activeTab === tab.id
                                            ? 'text-blue-700 bg-blue-50/60'
                                            : 'text-[#635c4e] hover:text-[#635c4e] hover:bg-slate-50'
                                            }`}
                                    >
                                        <span className="mr-1.5">{tab.icon}</span>
                                        {tab.label}
                                        {activeTab === tab.id && (
                                            <div className="absolute bottom-0 left-2 right-2 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[400px] py-10">

                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <div className="animate-fade-in">
                                    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8 sm:p-10">
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">Book Description</h3>
                                        <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-6" />
                                        <div className="prose prose-slate max-w-none text-[#635c4e] leading-relaxed text-[15px]">
                                            {book.about_book ? (
                                                <div className="whitespace-pre-line">
                                                    {book.about_book}
                                                </div>
                                            ) : (
                                                <p className="italic text-[#635c4e]">No description provided yet.</p>
                                            )}
                                        </div>

                                        {/* Keywords / Tags */}
                                        {book.keywords && (
                                            <div className="mt-8 pt-6 border-t border-slate-100">
                                                <h4 className="text-xs font-bold text-[#635c4e] uppercase tracking-widest mb-3">Keywords</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {(typeof book.keywords === 'string' ? book.keywords.split(',') : book.keywords || []).map((kw, i) => (
                                                        <span key={i} className="px-3 py-1 bg-slate-100 text-[#635c4e] rounded-full text-xs font-medium">
                                                            {kw.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Author Tab */}
                            {activeTab === 'author' && (
                                <div className="animate-fade-in">
                                    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8 sm:p-10">
                                        <div className="flex flex-col md:flex-row gap-8 items-start">
                                            <div className="flex-shrink-0">
                                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[3px] shadow-xl shadow-blue-200/50">
                                                    <div className="w-full h-full rounded-[13px] bg-white flex items-center justify-center text-blue-600 text-3xl font-black">
                                                        {book.author_name?.charAt(0)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-2xl font-bold text-slate-800 mb-1">{book.author_name}</h3>
                                                <div className="text-blue-500 text-xs font-bold uppercase tracking-widest mb-5">About the Author</div>
                                                <div className="w-10 h-0.5 bg-slate-200 rounded-full mb-5" />
                                                <div className="prose prose-slate text-[#635c4e] text-[15px] leading-relaxed">
                                                    {book.author_biography || (
                                                        <p className="italic text-[#635c4e]">The author hasn't added a biography yet.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Product Details Tab */}
                            {activeTab === 'details' && (
                                <div className="animate-fade-in">
                                    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                                        <div className="p-8 pb-4">
                                            <h3 className="text-xl font-bold text-slate-800 mb-1">Product Details</h3>
                                            <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
                                        </div>
                                        <div className="divide-y divide-slate-100">
                                            {[
                                                { label: 'Publisher', value: 'PublicationMart', icon: '🏢' },
                                                { label: 'Language', value: book.language || 'English', icon: '🌐' },
                                                { label: 'Print Length', value: `${book.num_pages || 0} pages`, icon: '📄' },
                                                { label: 'Dimensions', value: book.book_size, icon: '📐' },
                                                { label: 'Binding', value: book.binding_type || 'Softcover', icon: '📚' },
                                                { label: 'Paper Quality', value: book.paper_type, icon: '🪶' },
                                                { label: 'Print Color', value: book.printing_color || 'B/W', icon: '🎨' },
                                                { label: 'ISBN-13', value: book.isbn || 'Pending Assignment', icon: '🔖' },
                                                { label: 'Publication Date', value: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }), icon: '📅' },
                                            ].map((row, idx) => (
                                                <div key={idx} className="px-8 py-4 flex items-center justify-between hover:bg-blue-50/20 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg">{row.icon}</span>
                                                        <span className="text-sm font-medium text-[#635c4e]">{row.label}</span>
                                                    </div>
                                                    <span className="text-sm text-slate-800 font-semibold">{row.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Pricing & Order Tab */}
                            {activeTab === 'pricing' && (
                                <div className="animate-fade-in">
                                    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8 sm:p-10">
                                        <h3 className="text-xl font-bold text-slate-800 mb-1">Pricing Breakdown</h3>
                                        <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-8" />

                                        <div className="max-w-lg mx-auto space-y-4">
                                            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-200/60">
                                                <div>
                                                    <p className="text-xs text-[#635c4e] uppercase font-bold tracking-widest mb-1">Selling Price</p>
                                                    <p className="text-2xl font-black text-slate-800">₹{sellingPrice.toFixed(2)}</p>
                                                </div>
                                                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-xl">💵</div>
                                            </div>

                                            <div className="flex items-center justify-between p-5 bg-red-50/50 rounded-2xl border border-red-100">
                                                <div>
                                                    <p className="text-xs text-[#635c4e] uppercase font-bold tracking-widest mb-1">Author Cost (Min. Price)</p>
                                                    <p className="text-xl font-bold text-red-500">- ₹{authorCost.toFixed(2)}</p>
                                                    <p className="text-[10px] text-[#635c4e] mt-0.5">Includes printing cost ₹{printingCost.toFixed(2)} + platform fee</p>
                                                </div>
                                                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-xl">🖨️</div>
                                            </div>

                                            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                                            <div className="flex items-center justify-between p-5 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 shadow-sm">
                                                <div>
                                                    <p className="text-xs text-emerald-600 uppercase font-bold tracking-widest mb-1">Your Royalty Per Copy</p>
                                                    <p className="text-3xl font-black text-emerald-600">₹{royalty.toFixed(2)}</p>
                                                </div>
                                                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl">🎉</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </main>

                {/* Sticky Bottom Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200/60 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-40">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="hidden sm:flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-800">Ready to Publish?</div>
                                    <div className="text-xs text-[#635c4e]">Preview confirms content & layout matches your expectations.</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <Link
                                    href={route('books.details', book.id)}
                                    className="px-6 py-3 rounded-xl border border-slate-200 text-[#635c4e] font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all w-full sm:w-auto text-center"
                                >
                                    Back
                                </Link>
                                <button
                                    onClick={handleProceed}
                                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-200 transform active:scale-95 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
                                >
                                    <span>Proceed to Publish</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.4s ease-out;
                }
            `}</style>
        </>
    );
}
