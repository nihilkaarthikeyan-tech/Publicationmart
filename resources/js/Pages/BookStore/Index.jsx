import { Head, Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import BookCard, { PhysicalCover, STORE_CSS } from './Components/BookCard';

/** A small edition of a book for the genre shelf rails. */
function RailBook({ book, i }) {
    const { app_url } = usePage().props;
    return (
        <Link href={route('book-store.show', book.id)} className="group block w-[136px]">
            <PhysicalCover book={book} appUrl={app_url} clothIndex={i} />
            <h4
                className="mt-4 text-[14px] leading-snug line-clamp-2 text-[#17150f] group-hover:text-[#6e2530] transition-colors"
                style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                title={book.title}
            >
                {book.title}
            </h4>
            <p className="text-[12px] font-bold text-[#17150f] mt-1">₹{book.selling_price}</p>
        </Link>
    );
}

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

    // Subject shelves. The genre column is no help here — nearly the whole
    // catalogue is filed under one word ("academic") — so books are shelved
    // by subject read from their titles, the way an academic bookshop sorts
    // its tables. Purely a browsing aid: matching is first-hit, unmatched
    // books simply stay in the full catalogue below, and nothing is hidden.
    const genreShelves = useMemo(() => {
        const SUBJECTS = [
            ['Computing & AI', /\b(ai|artificial intelligence|machine learning|deep learning|data (science|analytics|mining)|computer|computing|software|programming|python|java\b|iot|cyber|network|cloud|algorithm|operating system|database|blockchain|web)\b/i],
            ['Electronics & Engineering', /\b(vlsi|electronic|electrical|circuit|embedded|micro ?controller|microprocessor|signal|semiconductor|mechanical|civil|engineering|robotic|automation|power system|renewable|energy)\b/i],
            ['Mathematics & Physical Sciences', /\b(math|mathematic|statistic|physics|chemistry|chemical|quantum|calculus|algebra|geometry|material science)\b/i],
            ['Life Sciences & Medicine', /\b(bio\w*|health|medical|medicine|nursing|pharma\w*|plant|agricultur\w*|environment\w*|ecolog\w*|disease|anatomy|clinical|food|nutrition|genetic)\b/i],
            ['Business & Management', /\b(business|management|marketing|finance|financial|econom\w*|entrepreneur\w*|leadership|accounting|commerce|banking)\b/i],
            ['Society, Education & Letters', /\b(education|teaching|pedagog\w*|history|culture|society|social|psycholog\w*|philosoph\w*|literature|language|english|poetry|law|yoga)\b/i],
        ];
        const shelves = new Map(SUBJECTS.map(([name]) => [name, []]));
        books.forEach((b) => {
            const genre = (b.genre || '').trim().toLowerCase();
            // A real (non-academic) genre is its own shelf — Fiction, Poetry…
            if (genre && genre !== 'academic' && genre !== 'general') {
                const label = genre.charAt(0).toUpperCase() + genre.slice(1);
                if (!shelves.has(label)) shelves.set(label, []);
                shelves.get(label).push(b);
                return;
            }
            const hit = SUBJECTS.find(([, re]) => re.test(b.title));
            if (hit) shelves.get(hit[0]).push(b);
        });
        return [...shelves.entries()]
            .filter(([, list]) => list.length >= 3)
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 6);
    }, [books]);

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
                            <span className="pm-store-run" style={{ color: '#856531' }}>Fresh from the press</span>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                            {frontTable.map((book, i) => (
                                <FrontTableBook key={book.id} book={book} i={i} />
                            ))}
                        </div>
                    </section>
                )}

                {/* ── The subject shelves: browse by genre, walk the rails ── */}
                {!searchQuery && genreShelves.length > 0 && (
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
                        <div className="flex items-baseline gap-6 mb-2">
                            <span className="pm-store-run whitespace-nowrap">Browse the shelves</span>
                            <div className="flex-1 h-px bg-[#d8d1c1]" />
                            <span className="pm-store-run hidden sm:inline">Shelved by subject · slide along each shelf →</span>
                        </div>
                        {genreShelves.map(([genre, list]) => (
                            <div key={genre} className="mt-10">
                                <div className="flex items-baseline gap-4 mb-6">
                                    <h3
                                        className="text-[22px] text-[#17150f]"
                                        style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                                    >
                                        {genre}
                                    </h3>
                                    <span className="pm-store-run">{list.length} titles</span>
                                </div>
                                <div className="pm-rail">
                                    {list.slice(0, 12).map((book, i) => (
                                        <RailBook key={book.id} book={book} i={i} />
                                    ))}
                                </div>
                                <div className="pm-shelfboard" aria-hidden="true" />
                            </div>
                        ))}
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
