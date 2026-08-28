import { Head, Link, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
});

export default function Show({ auth, book }) {
    const { app_url } = usePage().props;

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <>
            <Head>
                <title>{`${book.title} | Book Store`}</title>
                <meta name="description" content={book.about_book ? book.about_book.substring(0, 160) : `Check out ${book.title} by ${book.author_name} on PublicationMart.`} />

                {/* Open Graph / Facebook / WhatsApp */}
                <meta property="og:type" content="book" />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:title" content={book.title} />
                <meta property="og:description" content={book.about_book ? book.about_book.substring(0, 300) + '...' : `Read ${book.title} by ${book.author_name}.`} />
                <meta property="og:image" content={book.cover_design_path ? `${app_url}/storage/${book.cover_design_path}` : `${app_url}/images/default-book-cover.jpg`} />
                <meta property="book:author" content={book.author_name} />
                <meta property="book:isbn" content={book.isbn} />
                <meta property="book:release_date" content={book.publication_date || book.published_at} />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={book.title} />
                <meta name="twitter:description" content={book.about_book ? book.about_book.substring(0, 200) : `Discover ${book.title} on PublicationMart.`} />
                <meta name="twitter:image" content={book.cover_design_path ? `${app_url}/storage/${book.cover_design_path}` : `${app_url}/images/default-book-cover.jpg`} />

                {/* Structured Data (JSON-LD) for Google Rich Snippets */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Book",
                        "name": book.title,
                        "author": {
                            "@type": "Person",
                            "name": book.author_name
                        },
                        "isbn": book.isbn,
                        "datePublished": book.publication_date || book.published_at,
                        "image": book.cover_design_path ? `${app_url}/storage/${book.cover_design_path}` : null,
                        "description": book.about_book,
                        "genre": book.genre,
                        "numberOfPages": book.num_pages,
                        "offers": {
                            "@type": "Offer",
                            "price": book.selling_price || book.ebook_price || '0.00',
                            "priceCurrency": "INR",
                            "availability": "https://schema.org/InStock",
                            "url": window.location.href
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "PublicationMart"
                        }
                    })}
                </script>
            </Head>

            {/* PREMIUN BACKGROUND SYSTEM */}
            <div className="fixed inset-0 z-0 bg-[#f0ece3] overflow-hidden pointer-events-none">
                {/* Grain Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')` }}></div>

                {/* Shifting Aurora Glows */}
                <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-indigo-600/15 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-900/5 rounded-full blur-[160px]"></div>

                {/* Animated Light Beams */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-white/10 to-transparent rotate-[15deg] transform-gpu animate-beam"></div>
                    <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-white/5 to-transparent rotate-[15deg] transform-gpu animate-beam" style={{ animationDelay: '3s' }}></div>
                </div>
            </div>

            <div className="relative z-10 min-h-screen pt-20 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* BREADCRUMB & BACK */}
                    <nav className="flex items-center justify-between mb-12">
                        <ol className="flex items-center gap-3 text-sm font-medium tracking-tight">
                            <li>
                                <Link href={route('welcome')} className="text-[#635c4e] hover:text-[#17150f] transition-all flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                    Home
                                </Link>
                            </li>
                            <li className="text-gray-700 select-none">/</li>
                            <li>
                                <Link href={route('book-store.index')} className="text-[#635c4e] hover:text-[#17150f] transition-all">Book Store</Link>
                            </li>
                            <li className="text-gray-700 select-none">/</li>
                            <li className="text-indigo-700 font-bold bg-indigo-500/10 px-3 py-1 rounded-full">{book.title}</li>
                        </ol>

                        {/* Admin Edit Button */}
                        {auth?.user?.is_admin && (
                            <Link
                                href={route('admin.books.show', book.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Book
                            </Link>
                        )}
                    </nav>

                    {/* Main Layout Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16">

                        {/* LEFT COLUMN: Visual & Conversion (4-cols) */}
                        <div className="lg:col-span-4">
                            {/* Book Cover with 3D shadow and glow */}
                            <div className="group relative">
                                <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                <div className="relative bg-[#0f1118] rounded-[2rem] overflow-hidden border border-[#d8d1c1] shadow-[0_22px_70px_4px_rgba(0,0,0,0.56)] transform transition-transform duration-500 group-hover:scale-[1.01]">
                                    {book.cover_design_path ? (
                                        <div className="aspect-[2/3] w-full relative overflow-hidden bg-[#1a1c26]">
                                            {/* Blurred Background for Ambience - Handles variable aspect ratios elegantly */}
                                            <div
                                                className="absolute inset-0 bg-cover bg-center blur-xl opacity-50 scale-125 saturate-150"
                                                style={{ backgroundImage: `url('${app_url}/storage/${book.cover_design_path}')` }}
                                            ></div>

                                            {/* Main Image - Fully Visible */}
                                            <img
                                                src={`${app_url}/storage/${book.cover_design_path}`}
                                                alt={book.title}
                                                className="relative z-10 w-full h-full object-contain shadow-2xl drop-shadow-2xl transform transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                    ) : (
                                        <div className="aspect-[2/3] flex flex-col items-center justify-center text-[#635c4e] bg-[#12141c]">
                                            <svg className="w-20 h-20 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                            <span className="text-sm uppercase tracking-widest font-bold opacity-30">Cover Unavailable</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Purchase Format Cards - Redesigned to look like premium options */}
                            <div className="mt-10 space-y-5">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#635c4e] px-2 flex items-center gap-2">
                                    Choose Your Format
                                    <span className="flex-1 h-px bg-gradient-to-r from-gray-500/30 to-transparent"></span>
                                </h3>

                                {/* Hardcover Card (Standard Selling Price) */}
                                {book.selling_price > 0 && (
                                    <div className="group relative bg-[#12141d]/80 backdrop-blur-md border border-[#d8d1c1] rounded-3xl p-6 hover:bg-[#161925] transition-all duration-300">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                                                    <svg className="w-6 h-6 text-[#17150f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                                </div>
                                                <div>
                                                    <h4 className="font-extrabold text-[#17150f] text-lg">Hardcover</h4>
                                                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold uppercase tracking-wider">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                                        In Stock
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl sm:text-3xl font-black text-[#17150f] glow-text">
                                                    {currencyFormatter.format(book.selling_price)}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-[#635c4e] mb-5 leading-relaxed">High-quality hardcover edition with premium paper texture. Ships to your doorstep.</p>

                                        <Link
                                            href={route('payment.checkout', { book: book.id, type: 'hardcover' })}
                                            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black rounded-2xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 text-base"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                            Buy Hardcover Now
                                        </Link>
                                    </div>
                                )}

                                {/* E-Book Card - Only show if price is set */}
                                {book.ebook_price > 0 && (
                                    <div className="group relative bg-[#12141d]/80 backdrop-blur-md border border-[#d8d1c1] rounded-3xl p-6 hover:bg-[#161925] transition-all duration-300">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                                                    <svg className="w-6 h-6 text-[#17150f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                </div>
                                                <div>
                                                    <h4 className="font-extrabold text-[#17150f] text-lg">E-Book</h4>
                                                    <div className="flex items-center gap-1.5 text-xs text-blue-700 font-bold uppercase tracking-wider">
                                                        Instant Download
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl sm:text-3xl font-black text-[#17150f] glow-text">
                                                    {currencyFormatter.format(book.ebook_price)}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-[#635c4e] mb-5 leading-relaxed">Read instantly on any device. Compatible with Kindle, Apple Books, and PDF readers.</p>

                                        <Link
                                            href={route('cart.show', { book: book.id, format: 'ebook' })}
                                            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black rounded-2xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 text-base"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                            Add to Cart
                                        </Link>
                                    </div>
                                )}

                                {/* Audiobook Card - Only show if price is set */}
                                {book.audio_price > 0 && (
                                    <div className="group relative bg-[#12141d]/80 backdrop-blur-md border border-[#d8d1c1] rounded-3xl p-6 hover:bg-[#161925] transition-all duration-300">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                                                    <svg className="w-6 h-6 text-[#17150f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                                </div>
                                                <div>
                                                    <h4 className="font-extrabold text-[#17150f] text-lg">Audiobook</h4>
                                                    <div className="flex items-center gap-1.5 text-xs text-purple-700 font-bold uppercase tracking-wider">
                                                        Instant Listening
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl sm:text-3xl font-black text-[#17150f] glow-text">
                                                    {currencyFormatter.format(book.audio_price)}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-[#635c4e] mb-5 leading-relaxed">Immersive narration. Listen on-the-go with high-quality audio streaming.</p>

                                        <Link
                                            href={route('cart.show', { book: book.id, format: 'audiobook' })}
                                            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black rounded-2xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20 text-base"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                            Add to Cart
                                        </Link>
                                    </div>
                                )}

                                {/* No formats available message */}
                                {!book.selling_price && !book.ebook_price && !book.audio_price && (
                                    <div className="text-center py-8 text-[#635c4e]">
                                        <p>Pricing not yet available for this book.</p>
                                    </div>
                                )}
                            </div>

                            {/* Store Links with improved visuals */}
                            <div className="mt-12 space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#635c4e] px-2 flex items-center gap-2">
                                    Marketplace Availability
                                    <span className="flex-1 h-px bg-gradient-to-r from-gray-500/30 to-transparent"></span>
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <a
                                        href={book.amazon_link || '#'}
                                        target={book.amazon_link ? "_blank" : "_self"}
                                        onClick={e => !book.amazon_link && (e.preventDefault(), alert('Coming soon to Amazon!'))}
                                        className={`flex items-center justify-between px-6 py-5 bg-[#232f3e] hover:bg-[#2b3a4a] text-[#17150f] rounded-2xl transition-all border border-[#d8d1c1] active:scale-95 group ${!book.amazon_link ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <svg className="w-8 h-8 fill-current text-[#ff9900]" viewBox="0 0 24 24"><path d="M12.915 15.82a6.837 6.837 0 01-5.074-2.221c-.244-.24-.132-.572.18-.544 1.393.111 2.808.016 4.195-.12.441-.044.821-.4.86-.843.08-1.04-.152-2.091-.689-3.024-.265-.461-.643-.843-1.121-1.096a.222.222 0 01-.1-.3c.04-.083.116-.14.204-.15.864-.176 1.748-.152 2.601.07a.978.978 0 01.737.766c.35 1.541.258 3.14-.263 4.63-.16.48-.564.845-1.054.945-.478.1-.963.16-1.455.187H12v.023l.915-.023zm-7.6-6.136c-.461 0-.825.138-1.092.414-.242.247-.406.602-.492 1.066a.2.2 0 00.191.231.196.196 0 00.203-.133c.125-.436.315-.747.57-.932.257-.184.512-.276.766-.276.512 0 .86.29.1 1.637-.17.3-.289.658-.356 1.074a.194.194 0 00.316.177c1.378-1.144 1.666-3.13.684-2.887a2.642 2.642 0 00-.89-.374zM24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12zm-3.87 6.02a.389.389 0 00-.332-.01l-.248.115c-3.232 1.554-6.845 2.215-10.435 1.956-6.402-.451-1.428-2.67-1.428-2.67l-.147-.078a.4.4 0 00-.476.126l-.273.34a.401.401 0 00.1.557c.188.13 2.08 1.488 4.793 1.9 4.341.66 9.176-.757 12.316-2.229a.399.399 0 00.13-.557z" /></svg>
                                            <span className="font-bold tracking-tight">Amazon Store</span>
                                        </div>
                                        <svg className="w-5 h-5 text-[#635c4e] group-hover:text-[#17150f] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </a>
                                    <a
                                        href={book.google_books_link || '#'}
                                        target={book.google_books_link ? "_blank" : "_self"}
                                        onClick={e => !book.google_books_link && (e.preventDefault(), alert('Coming soon to Google Play!'))}
                                        className={`flex items-center justify-between px-6 py-5 bg-[#3c4043] hover:bg-[#4a4f54] text-[#17150f] rounded-2xl transition-all border border-[#d8d1c1] active:scale-95 group ${!book.google_books_link ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <svg className="w-8 h-8" viewBox="0 0 24 24"><path fill="#EA4335" d="M3 20.4V3.6a1.8 1.8 0 0 1 2.842-1.487l13.784 8.783a1.8 1.8 0 0 1 0 2.977l-13.784 8.785A1.8 1.8 0 0 1 3 21.176v-.777z" /><path fill="#FBBC04" d="M3 20.4l10.975-6.985a1.8 1.8 0 0 0 0-2.83L3 3.6v16.8z" /><path fill="#4285F4" d="M3 13.5l14.826-9.435a1.8 1.8 0 0 1 2.842 1.487l-10.975 6.985-6.693.963z" /><path fill="#34A853" d="M3 10.5l6.693.963L20.668 4.482a1.8 1.8 0 0 1 0 2.977l-13.784 8.784-3.884-2.434V10.5z" /></svg>
                                            <span className="font-bold tracking-tight">Google Books</span>
                                        </div>
                                        <svg className="w-5 h-5 text-[#635c4e] group-hover:text-[#17150f] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Content & Social Proof (8-cols) */}
                        <div className="lg:col-span-8 space-y-12">

                            {/* Title & Headline Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-700 text-xs font-black rounded-full uppercase tracking-widest border border-indigo-500/20 shadow-sm shadow-indigo-500/5">
                                        {book.genre || 'General Narrative'}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <h1 className="text-5xl sm:text-7xl font-black text-[#17150f] leading-[1.1] tracking-tighter">
                                        {book.title}
                                    </h1>
                                    {book.subtitle && (
                                        <h2 className="text-2xl sm:text-3xl font-medium text-[#635c4e] italic leading-relaxed">
                                            {book.subtitle}
                                        </h2>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 pt-2 flex-wrap">
                                    <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 shadow-xl shadow-indigo-500/10">
                                        <div className="w-full h-full rounded-[1.1rem] bg-[#f0ece3] flex items-center justify-center font-black text-indigo-700 text-xl">
                                            {book.author_name?.charAt(0)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-[#635c4e] uppercase font-black tracking-widest leading-none mb-1">Written by</div>
                                        <div className="text-xl font-bold text-[#17150f] hover:text-indigo-700 transition-colors cursor-pointer">{book.author_name}</div>
                                    </div>

                                    {/* Co-Authors / Contributors - Filter out main author if accidentally included */}
                                    {book.co_authors && book.co_authors.filter(ca => ca && ca.trim() !== '' && ca.trim().toLowerCase() !== book.author_name?.toLowerCase()).length > 0 && (
                                        <>
                                            <div className="text-[#635c4e] text-2xl font-light">&</div>
                                            {book.co_authors
                                                .filter(ca => ca && ca.trim() !== '' && ca.trim().toLowerCase() !== book.author_name?.toLowerCase())
                                                .map((coAuthor, index) => (
                                                    <div key={index} className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 p-0.5 shadow-lg shadow-emerald-500/10">
                                                            <div className="w-full h-full rounded-[0.6rem] bg-[#f0ece3] flex items-center justify-center font-bold text-emerald-700 text-sm">
                                                                {coAuthor?.charAt(0)}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] text-[#635c4e] uppercase font-black tracking-widest leading-none mb-0.5">Co-Author</div>
                                                            <div className="text-base font-semibold text-[#17150f]">{coAuthor}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Core Stats Overview */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'ISBN Identifier', value: book.isbn || '000-0-00-000000-0', mono: true, hl: !!book.isbn },
                                    { label: 'Length', value: `${book.num_pages || '---'} Pages` },
                                    { label: 'Release Language', value: book.language || 'English' },
                                    { label: 'Published On', value: formatDate(book.publication_date || book.published_at) }
                                ].map((stat, idx) => (
                                    <div key={idx} className="bg-[#12141d]/40 border border-[#d8d1c1] p-5 rounded-3xl group hover:border-[#7c7364] transition-all">
                                        <div className="text-xs text-[#635c4e] font-black uppercase tracking-widest mb-2 select-none">{stat.label}</div>
                                        <div className={`text-[#17150f] font-bold text-base ${stat.mono ? 'font-mono tracking-tight' : ''} ${!stat.hl && stat.label === 'ISBN Identifier' ? 'opacity-30' : ''}`}>
                                            {stat.value}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Detailed Specs with modern table look */}
                            <div className="bg-[#12141d]/40 border border-[#d8d1c1] rounded-[2.5rem] overflow-hidden">
                                <div className="px-8 py-6 border-b border-[#d8d1c1] flex items-center justify-between bg-white/[0.02]">
                                    <h3 className="text-lg font-black text-[#17150f] tracking-tight">Technical Specifications</h3>
                                    <div className="px-3 py-1 bg-[#faf8f3] rounded-full text-[10px] font-black uppercase text-[#635c4e]">Retail Quality</div>
                                </div>
                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                    {[
                                        { l: 'Binding Style', v: book.binding_type || 'Premium Hardback' },
                                        { l: 'Print Quality', v: book.printing_color === 'Color' ? 'High Fidelity Color' : 'Archival Black & White' },
                                        { l: 'Paper Grade', v: book.paper_type || 'Premium White Paper (80gsm)' },
                                        { l: 'Trim Dimensions', v: book.book_size || '6" x 9" Standard' },
                                        { l: 'Genre Category', v: book.genre || 'General Fiction' },
                                        { l: 'Shipping Weight', v: 'Approx. 450g' }
                                    ].map((spec, i) => (
                                        <div key={i} className="flex items-center justify-between py-1 group">
                                            <span className="text-[#635c4e] font-medium text-sm group-hover:text-[#635c4e] transition-colors">{spec.l}</span>
                                            <span className="text-[#17150f] font-bold text-sm tracking-tight">{spec.v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Book Content Summary */}
                            {book.about_book && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-2xl font-black text-[#17150f] tracking-tighter italic px-2">Narrative Overview</h3>
                                        <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent"></div>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-transparent opacity-20 hidden md:block"></div>
                                        <p className="md:pl-8 text-lg text-[#635c4e] leading-[1.8] font-medium whitespace-pre-line selection:bg-indigo-500/30">
                                            {book.about_book}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Author Section with Bio */}
                            {book.author_biography && (
                                <div className="bg-[#12141d]/40 border border-[#d8d1c1] rounded-[2.5rem] p-8 sm:p-12 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-indigo-500/10 transition-all duration-700"></div>

                                    <div className="flex flex-col md:flex-row gap-10 items-center md:items-start relative z-10">
                                        <div className="relative">
                                            <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 border border-[#d8d1c1] shadow-2xl">
                                                <svg className="w-12 h-12 text-indigo-700 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border-4 border-[#12141d] shadow-lg">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="space-y-4 text-center md:text-left">
                                            <div>
                                                <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                                                    <h3 className="text-2xl font-black text-[#17150f] tracking-tight">Meet the Author</h3>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded-md">Verified</span>
                                                </div>
                                                <p className="text-xl font-bold text-[#635c4e]">{book.author_name}</p>
                                            </div>

                                            <div className="relative">
                                                <svg className="absolute -top-4 -left-6 w-12 h-12 text-[#17150f]/5 pointer-events-none" fill="currentColor" viewBox="0 0 32 32">
                                                    <path d="M10 8c-3.3 0-6 2.7-6 6 0 2.2 1.2 4.1 3 5.1-.6 1.3-2 3.4-3.5 4.9C3 24.5 2.4 25.1 2 25.4L3.4 27c.4-.3 1.1-.9 1.6-1.4 2.1-2.1 4-5.1 4.8-7.2.1-.3.2-.6.2-1 0-3.3-2.7-6-6-6zm14 0c-3.3 0-6 2.7-6 6 0 2.2 1.2 4.1 3 5.1-.6 1.3-2 3.4-3.5 4.9-.5.5-1.1 1.1-1.5 1.4L17.4 27c.4-.3 1.1-.9 1.6-1.4 2.1-2.1 4-5.1 4.8-7.2.1-.3.2-.6.2-1 0-3.3-2.7-6-6-6z" />
                                                </svg>
                                                <p className="text-[#635c4e] leading-relaxed text-lg font-medium relative z-10 italic">
                                                    {book.author_biography}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Final Conversion CTA with glassmorphism */}
                            <div className="relative group p-10 sm:p-16 rounded-[3.5rem] overflow-hidden border border-[#d8d1c1] shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent"></div>
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700"></div>

                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                                    <div className="text-center md:text-left space-y-3">
                                        <h3 className="text-4xl font-black text-[#17150f] tracking-tighter">Ready for this journey?</h3>
                                        <p className="text-[#635c4e] text-lg sm:text-xl font-medium max-w-md">Secure your physical copy or instant audiobook today.</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                        <button
                                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                            className="px-10 py-5 bg-white text-black font-black rounded-2xl hover:bg-gray-200 transition-all transform active:scale-95 shadow-xl shadow-white/5"
                                        >
                                            Explore Options
                                        </button>
                                        <Link
                                            href={route('book-store.index')}
                                            className="px-8 py-5 bg-[#faf8f3] text-[#17150f] font-bold rounded-2xl border border-[#d8d1c1] hover:bg-[#e7e1d4] transition-all text-center"
                                        >
                                            View Collective
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Back Link with minimal design */}
                    <div className="mt-24 text-center">
                        <Link
                            href={route('book-store.index')}
                            className="inline-flex items-center gap-4 text-[#635c4e] hover:text-[#17150f] transition-all group font-bold"
                        >
                            <svg className="w-6 h-6 transform group-hover:-translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Explore Entire Publication Archive
                        </Link>
                    </div>
                </div>
            </div >

            {/* Premium Style Injector */}
            < style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;300;400;500;700;900&display=swap');
                
                body {
                    font-family: 'Outfit', sans-serif;
                }
                @keyframes beam {
                    0% { transform: translateY(-100%) rotate(15deg); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateY(100%) rotate(15deg); opacity: 0; }
                }
                .animate-beam {
                    animation: beam 8s linear infinite;
                }

                .glow-text {
                    text-shadow: 0 0 15px rgba(255,255,255,0.2);
                }

                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.15; transform: scale(1); }
                    50% { opacity: 0.1; transform: scale(1.05); }
                }

                /* Custom Scrollbar */
                ::-webkit-scrollbar {
                    width: 6px;
                }
                ::-webkit-scrollbar-track {
                    background: #17150f;
                }
                ::-webkit-scrollbar-thumb {
                    background: #1e2130;
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #2d3247;
                }
            `}
            } />
        </>
    );
}

