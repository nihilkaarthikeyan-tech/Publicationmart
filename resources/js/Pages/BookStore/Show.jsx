import { Head, Link, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { PhysicalCover, STORE_CSS } from './Components/BookCard';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
});

const SERIF = { fontFamily: "'EB Garamond', Georgia, serif" };

/** A purchase format, set like an edition listed on the book's title page. */
function FormatCard({ name, availability, price, blurb, href, cta }) {
    return (
        <div className="bg-paper border border-linen p-6">
            <div className="flex items-baseline justify-between gap-4 mb-1">
                <h4 className="text-[20px] text-ink" style={SERIF}>{name}</h4>
                <span className="text-[22px] text-ink" style={SERIF}>{price}</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-foil-deep mb-3">{availability}</p>
            <p className="text-sm text-umber mb-5 leading-relaxed">{blurb}</p>
            <Link
                href={href}
                className="block w-full py-3 bg-oxblood hover:bg-oxblood-deep text-paper text-sm font-bold text-center rounded-sm transition-colors active:translate-y-px"
            >
                {cta}
            </Link>
        </div>
    );
}

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

    const coAuthors = (book.co_authors || []).filter(
        (ca) => ca && ca.trim() !== '' && ca.trim().toLowerCase() !== book.author_name?.toLowerCase()
    );

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

            <style dangerouslySetInnerHTML={{ __html: STORE_CSS }} />

            <div className="bg-parchment min-h-screen pt-16 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* BREADCRUMB & BACK */}
                    <nav className="flex items-center justify-between gap-6 mb-12">
                        <ol className="flex items-center gap-3 text-sm font-medium tracking-tight min-w-0">
                            <li>
                                <Link href={route('welcome')} className="text-umber hover:text-oxblood transition-colors">Home</Link>
                            </li>
                            <li className="text-linen select-none">/</li>
                            <li>
                                <Link href={route('book-store.index')} className="text-umber hover:text-oxblood transition-colors">Book Store</Link>
                            </li>
                            <li className="text-linen select-none">/</li>
                            <li className="text-oxblood font-semibold truncate max-w-[40ch]">{book.title}</li>
                        </ol>

                        {/* Admin Edit Button */}
                        {auth?.user?.is_admin && (
                            <Link
                                href={route('admin.books.show', book.id)}
                                className="shrink-0 flex items-center gap-2 px-4 py-2 bg-oxblood hover:bg-oxblood-deep text-paper font-bold rounded-sm transition-colors text-sm"
                            >
                                Edit Book
                            </Link>
                        )}
                    </nav>

                    {/* Main Layout Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16">

                        {/* LEFT COLUMN: the book itself, and how to buy it */}
                        <div className="lg:col-span-4">
                            <div className="group max-w-[340px] mx-auto lg:mx-0">
                                <PhysicalCover book={book} appUrl={app_url} clothIndex={1} />
                            </div>

                            {/* Editions */}
                            <div className="mt-12 space-y-4">
                                <div className="flex items-baseline gap-4">
                                    <h3 className="pm-store-run">Editions</h3>
                                    <span className="flex-1 h-px bg-linen" />
                                </div>

                                {book.selling_price > 0 && (
                                    <FormatCard
                                        name="Hardcover"
                                        availability="In stock — ships to your door"
                                        price={currencyFormatter.format(book.selling_price)}
                                        blurb="High-quality hardcover edition with premium paper texture. Ships to your doorstep."
                                        href={route('payment.checkout', { book: book.id, type: 'hardcover' })}
                                        cta="Buy Hardcover Now"
                                    />
                                )}

                                {book.ebook_price > 0 && (
                                    <FormatCard
                                        name="E-Book"
                                        availability="Instant download"
                                        price={currencyFormatter.format(book.ebook_price)}
                                        blurb="Read instantly on any device. Compatible with Kindle, Apple Books, and PDF readers."
                                        href={route('cart.show', { book: book.id, format: 'ebook' })}
                                        cta="Add to Cart"
                                    />
                                )}

                                {book.audio_price > 0 && (
                                    <FormatCard
                                        name="Audiobook"
                                        availability="Instant listening"
                                        price={currencyFormatter.format(book.audio_price)}
                                        blurb="Immersive narration. Listen on-the-go with high-quality audio streaming."
                                        href={route('cart.show', { book: book.id, format: 'audiobook' })}
                                        cta="Add to Cart"
                                    />
                                )}

                                {!book.selling_price && !book.ebook_price && !book.audio_price && (
                                    <div className="text-center py-8 text-umber">
                                        <p>Pricing not yet available for this book.</p>
                                    </div>
                                )}
                            </div>

                            {/* Marketplace availability */}
                            <div className="mt-12 space-y-4">
                                <div className="flex items-baseline gap-4">
                                    <h3 className="pm-store-run">Also available at</h3>
                                    <span className="flex-1 h-px bg-linen" />
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    <a
                                        href={book.amazon_link || '#'}
                                        target={book.amazon_link ? "_blank" : "_self"}
                                        rel="noopener noreferrer"
                                        onClick={e => !book.amazon_link && (e.preventDefault(), alert('Coming soon to Amazon!'))}
                                        className={`flex items-center justify-between px-5 py-4 bg-paper border border-linen hover:border-oxblood text-ink rounded-sm transition-colors group ${!book.amazon_link ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span className="font-bold tracking-tight">Amazon Store</span>
                                        <span className="text-umber group-hover:text-oxblood group-hover:translate-x-1 transition-all" aria-hidden="true">→</span>
                                    </a>
                                    <a
                                        href={book.google_books_link || '#'}
                                        target={book.google_books_link ? "_blank" : "_self"}
                                        rel="noopener noreferrer"
                                        onClick={e => !book.google_books_link && (e.preventDefault(), alert('Coming soon to Google Play!'))}
                                        className={`flex items-center justify-between px-5 py-4 bg-paper border border-linen hover:border-oxblood text-ink rounded-sm transition-colors group ${!book.google_books_link ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span className="font-bold tracking-tight">Google Books</span>
                                        <span className="text-umber group-hover:text-oxblood group-hover:translate-x-1 transition-all" aria-hidden="true">→</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: the title page */}
                        <div className="lg:col-span-8 space-y-14">

                            {/* Title & authors */}
                            <div>
                                <p className="pm-store-run mb-5" style={{ color: '#6e2530' }}>
                                    {book.genre || 'General Narrative'}
                                </p>

                                <h1 className="text-[clamp(2.4rem,5vw,4rem)] leading-[1.08] text-ink mb-4" style={SERIF}>
                                    {book.title}
                                </h1>
                                {book.subtitle && (
                                    <h2 className="text-2xl sm:text-3xl italic text-umber leading-relaxed" style={SERIF}>
                                        {book.subtitle}
                                    </h2>
                                )}

                                <div className="flex items-center gap-x-6 gap-y-4 pt-7 flex-wrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-full bg-oxblood text-paper flex items-center justify-center text-[17px]" style={SERIF}>
                                            {book.author_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-umber uppercase font-bold tracking-[.18em] mb-0.5">Written by</div>
                                            <div className="text-lg text-ink" style={SERIF}>{book.author_name}</div>
                                        </div>
                                    </div>

                                    {coAuthors.map((coAuthor, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-foil text-paper flex items-center justify-center text-[14px]" style={SERIF}>
                                                {coAuthor?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-[9px] text-umber uppercase font-bold tracking-[.18em] mb-0.5">Co-Author</div>
                                                <div className="text-base text-ink" style={SERIF}>{coAuthor}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Core facts, set as a colophon row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6">
                                {[
                                    { label: 'ISBN', value: book.isbn || 'Being allocated', dim: !book.isbn },
                                    { label: 'Length', value: `${book.num_pages || '—'} pages` },
                                    { label: 'Language', value: book.language || 'English' },
                                    { label: 'Published', value: formatDate(book.publication_date || book.published_at) }
                                ].map((stat, idx) => (
                                    <div key={idx} className="pt-4 border-t border-linen">
                                        <div className="pm-store-run mb-1.5" style={{ color: '#6e2530' }}>{stat.label}</div>
                                        <div className={`text-[15px] text-ink ${stat.dim ? 'opacity-50' : ''}`} style={SERIF}>
                                            {stat.value}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* About the book */}
                            {book.about_book && (
                                <div>
                                    <div className="flex items-baseline gap-4 mb-6">
                                        <h3 className="text-[26px] text-ink" style={SERIF}>About this book</h3>
                                        <span className="flex-1 h-px bg-linen" />
                                    </div>
                                    <p className="text-[17px] text-ink-soft leading-[1.85] whitespace-pre-line max-w-[70ch] border-l-2 border-oxblood/25 pl-6" style={SERIF}>
                                        {book.about_book}
                                    </p>
                                </div>
                            )}

                            {/* The colophon: technical specifications */}
                            <div>
                                <div className="flex items-baseline gap-4 mb-2">
                                    <h3 className="text-[26px] text-ink" style={SERIF}>The edition</h3>
                                    <span className="flex-1 h-px bg-linen" />
                                    <span className="pm-store-run">Retail quality</span>
                                </div>
                                <dl>
                                    {[
                                        { l: 'Binding Style', v: book.binding_type || 'Premium Hardback' },
                                        { l: 'Print Quality', v: book.printing_color === 'Color' ? 'High Fidelity Color' : 'Archival Black & White' },
                                        { l: 'Paper Grade', v: book.paper_type || 'Premium White Paper (80gsm)' },
                                        { l: 'Trim Dimensions', v: book.book_size || '6" x 9" Standard' },
                                        { l: 'Genre Category', v: book.genre || 'General Fiction' },
                                        { l: 'Shipping Weight', v: 'Approx. 450g' }
                                    ].map((spec, i) => (
                                        <div key={i} className="grid grid-cols-[minmax(120px,180px)_1fr] gap-6 py-3 border-t border-linen last:border-b">
                                            <dt className="pm-store-run pt-0.5">{spec.l}</dt>
                                            <dd className="text-[15px] text-ink" style={SERIF}>{spec.v}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>

                            {/* The author */}
                            {book.author_biography && (
                                <div className="bg-paper border border-linen p-8 sm:p-10">
                                    <div className="flex flex-col sm:flex-row gap-8 items-start">
                                        <div className="w-16 h-16 rounded-full bg-oxblood text-paper flex items-center justify-center text-[24px] shrink-0" style={SERIF}>
                                            {book.author_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                                                <h3 className="text-[24px] text-ink" style={SERIF}>About the author</h3>
                                                <span className="text-[9px] font-bold uppercase tracking-[.18em] px-2 py-0.5 border border-foil/50 text-foil-deep rounded-sm">Verified</span>
                                            </div>
                                            <p className="text-[17px] text-umber mb-4" style={SERIF}>{book.author_name}</p>
                                            <p className="text-[15.5px] text-ink-soft leading-relaxed italic" style={SERIF}>
                                                {book.author_biography}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Final conversion */}
                            <div className="border border-linen bg-paper p-10 sm:p-14 text-center">
                                <h3 className="text-[clamp(1.6rem,3.5vw,2.3rem)] text-ink mb-3" style={SERIF}>
                                    Ready for this journey?
                                </h3>
                                <p className="text-umber text-lg mb-8">Secure your physical copy or instant audiobook today.</p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <button
                                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                        className="px-9 py-4 bg-oxblood hover:bg-oxblood-deep text-paper font-bold rounded-sm transition-colors active:translate-y-px"
                                    >
                                        Explore Options
                                    </button>
                                    <Link
                                        href={route('book-store.index')}
                                        className="px-8 py-4 bg-transparent text-ink font-bold rounded-sm border border-linen hover:border-oxblood hover:text-oxblood transition-colors text-center"
                                    >
                                        View Collective
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Back Link */}
                    <div className="mt-20 text-center">
                        <Link
                            href={route('book-store.index')}
                            className="inline-flex items-center gap-3 text-umber hover:text-oxblood transition-colors group font-semibold"
                        >
                            <span className="transform group-hover:-translate-x-1.5 transition-transform" aria-hidden="true">←</span>
                            Explore Entire Publication Archive
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
