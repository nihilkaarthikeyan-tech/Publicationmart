import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import BookCard, { PhysicalCover } from './Components/BookCard';

/* The store's physical-book treatment: spine shading, page block, shadow,
   and a lift-and-tilt when the reader reaches for a book. */
const STORE_CSS = `
.pm-covwrap{perspective:900px}
.pm-cov{border-radius:3px 7px 7px 3px;box-shadow:0 12px 24px rgba(23,21,15,.16),0 3px 7px rgba(23,21,15,.10);transform-origin:left center;transition:transform .45s cubic-bezier(.16,1,.3,1),box-shadow .45s cubic-bezier(.16,1,.3,1)}
.pm-cov::before{content:"";position:absolute;left:0;top:0;bottom:0;width:9px;background:linear-gradient(90deg,rgba(0,0,0,.30),rgba(0,0,0,.05) 70%,rgba(255,255,255,.14));z-index:2;pointer-events:none}
.pm-cov::after{content:"";position:absolute;top:3px;bottom:3px;right:-5px;width:5px;background:repeating-linear-gradient(to bottom,#f5f0e4 0 2px,#dcd4c0 2px 3px);border-radius:0 2px 2px 0}
.group:hover .pm-cov,a:hover>.pm-covwrap>.pm-cov{transform:rotateY(-8deg) translateY(-6px);box-shadow:0 26px 44px rgba(23,21,15,.24),0 6px 14px rgba(23,21,15,.13)}
.pm-store-run{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#7c7364;font-weight:600}
@media (prefers-reduced-motion:reduce){.pm-cov{transition:none}}
`;

/** One book on the front table — displayed large, like the newest titles
 *  laid out at the entrance of a bookshop. */
function FrontTableBook({ book, i }) {
    const { app_url } = usePage().props;
    return (
        <div className="group">
            <Link href={route('book-store.show', book.id)} className="block">
                <PhysicalCover book={book} appUrl={app_url} clothIndex={i} />
                <div className="mt-6">
                    <h3
                        className="text-[20px] leading-snug line-clamp-2 text-[#17150f] group-hover:text-[#6e2530] transition-colors"
                        style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                    >
                        {book.title}
                    </h3>
                    <p className="text-[13px] text-[#635c4e] mt-1 line-clamp-1">{book.author_name}</p>
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-lg font-bold text-[#17150f]">₹{book.selling_price}</span>
                        <span className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#6e2530] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                            View this book →
                        </span>
                    </div>
                </div>
            </Link>
            {(book.amazon_link || book.google_books_link) && (
                <p className="mt-2 text-[11px] text-[#7c7364]">
                    Also at{' '}
                    {book.amazon_link && (
                        <a href={book.amazon_link} target="_blank" rel="noopener noreferrer"
                           className="font-semibold text-[#6e2530] hover:underline underline-offset-2">Amazon</a>
                    )}
                    {book.amazon_link && book.google_books_link && ' · '}
                    {book.google_books_link && (
                        <a href={book.google_books_link} target="_blank" rel="noopener noreferrer"
                           className="font-semibold text-[#6e2530] hover:underline underline-offset-2">Google Books</a>
                    )}
                </p>
            )}
        </div>
    );
}

export default function BookStoreIndex({ auth, books }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.genre.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Controller sends books newest-first, so the front table is simply the
    // first four. While searching, the table steps aside and results lead.
    const frontTable = books.slice(0, 4);
    const shelfBooks = searchQuery ? filteredBooks : books.slice(4);

    return (
        <>
            <Head title="Book Store – Buy Books Online from Indian Authors | PublicationMart">
                <meta name="description" content="Discover and buy books from independent Indian authors. Browse fiction, non-fiction, poetry, and academic titles. Hardcover, eBook, and audiobook formats available." />
                <meta property="og:title" content="Book Store | PublicationMart" />
                <meta property="og:description" content="Explore independent voices and groundbreaking stories from our global community of authors. Buy hardcover, eBook, and audiobooks." />
                <meta property="og:url" content="https://publicationmart.com/book-store" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://publicationmart.com/images/logo_new.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Book Store | PublicationMart" />
                <meta name="twitter:description" content="Buy books from independent authors. Fiction, non-fiction, poetry, and more." />
            </Head>

            <style dangerouslySetInnerHTML={{ __html: STORE_CSS }} />

            {/* Hero */}
            <div className="bg-[#f0ece3] relative overflow-hidden pt-20 pb-12 border-b border-[#d8d1c1]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1
                        className="text-4xl md:text-6xl text-[#17150f] tracking-tight mb-6"
                        style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                    >
                        Discover your next <em className="text-[#6e2530]">great read.</em>
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-[#635c4e]">
                        Explore independent voices and groundbreaking stories from our global community of authors.
                    </p>

                    {/* Search Bar */}
                    <div className="mt-10 max-w-xl mx-auto">
                        <div className="relative bg-[#faf8f3] rounded-full flex items-center p-2 border border-[#d8d1c1] shadow-lg focus-within:border-[#6e2530] transition-colors">
                            <svg className="w-5 h-5 text-[#635c4e] ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            <input
                                type="text"
                                placeholder="Search by title, author, or genre..."
                                className="w-full bg-transparent border-none text-[#17150f] placeholder-[#7c7364] focus:ring-0 px-4 py-2"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[#f0ece3] min-h-screen pb-16">
                {/* ── The front table: newest titles, displayed large ── */}
                {!searchQuery && frontTable.length > 0 && (
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
                        <div className="flex items-baseline gap-6 mb-10">
                            <span className="pm-store-run whitespace-nowrap">New arrivals</span>
                            <div className="flex-1 h-px bg-[#d8d1c1]" />
                            <span className="pm-store-run" style={{ color: '#a07d3b' }}>Fresh from the press</span>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                            {frontTable.map((book, i) => (
                                <FrontTableBook key={book.id} book={book} i={i} />
                            ))}
                        </div>
                    </section>
                )}

                {/* ── The shelves: everything else ── */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
                    <div className="flex items-baseline gap-6 mb-10">
                        <span className="pm-store-run whitespace-nowrap">
                            {searchQuery ? `Results for “${searchQuery}”` : 'The full catalogue'}
                        </span>
                        <div className="flex-1 h-px bg-[#d8d1c1]" />
                        <span className="pm-store-run">
                            {(searchQuery ? filteredBooks : books).length.toLocaleString('en-IN')} titles
                        </span>
                    </div>

                    {shelfBooks.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
                            {shelfBooks.map((book, i) => (
                                <BookCard key={book.id} book={book} clothIndex={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-32">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#faf8f3] rounded-full mb-6 border border-[#d8d1c1] shadow-lg">
                                <svg className="w-8 h-8 text-[#635c4e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-[#17150f] mb-2">No books found</h3>
                            <p className="text-[#635c4e]">Try adjusting your search or check back later.</p>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}
