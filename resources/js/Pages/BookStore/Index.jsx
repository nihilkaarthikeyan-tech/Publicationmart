import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import BookCard from './Components/BookCard';

export default function BookStoreIndex({ auth, books }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.genre.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

            {/* Dark Hero Section */}
            <div className="bg-[#1e1535] relative overflow-hidden pt-20 pb-12">
                <div className="absolute inset-0 bg-indigo-900/10"></div>
                {/* Abstract Shapes */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
                        Discover Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Great Read</span>
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
                        Explore independent voices and groundbreaking stories from our global community of authors.
                    </p>

                    {/* Search Bar */}
                    <div className="mt-10 max-w-xl mx-auto">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                            <div className="relative bg-[#2d2347] rounded-full flex items-center p-2 border border-violet-800/50 shadow-xl">
                                <svg className="w-5 h-5 text-gray-500 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                <input
                                    type="text"
                                    placeholder="Search by title, author, or genre..."
                                    className="w-full bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 px-4 py-2"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Book Grid - Dark Theme */}
            <div className="bg-[#1e1535] min-h-screen py-12 border-t border-violet-800/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {filteredBooks.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {filteredBooks.map((book) => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-32">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#2d2347] rounded-full mb-6 border border-violet-800/50 shadow-lg">
                                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No books found</h3>
                            <p className="text-gray-500">Try adjusting your search or check back later.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
