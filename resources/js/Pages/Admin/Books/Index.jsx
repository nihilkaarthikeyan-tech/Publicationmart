import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ auth, books }) {
    const [search, setSearch] = useState('');

    // Client-side filtering (safe for current data volume)
    const filteredBooks = books.data.filter(book =>
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author_name.toLowerCase().includes(search.toLowerCase()) ||
        (book.user && book.user.name.toLowerCase().includes(search.toLowerCase()))
    );

    // Calculate stats dynamiclly from current page data (or pass real stats later)
    const pendingCount = books.data.filter(b => b.status === 'pending').length;

    return (
        <>
            <Head title="Admin Book Management" />

            <div className="min-h-screen bg-parchment text-ink font-sans selection:bg-indigo-500/30">
                {/* Background Ambient Glows */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-50 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px]"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-ink mb-2">Book Management</h1>
                            <p className="text-umber">Monitor, approve, and manage the publication inventory.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href={route('admin.dashboard')} className="px-5 py-2.5 bg-paper hover:bg-paper border border-linen text-ink-soft rounded-xl transition-all text-sm font-bold flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Dashboard
                            </Link>
                            {/* Potential 'Add Book' button for admin could go here */}
                        </div>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="p-5 bg-parchment/80 backdrop-blur border border-linen rounded-2xl">
                            <div className="text-umber text-xs font-bold uppercase tracking-wider mb-1">Total Books (Page)</div>
                            <div className="text-2xl font-black text-ink">{books.data.length}</div>
                        </div>
                        <div className="p-5 bg-parchment/80 backdrop-blur border border-linen rounded-2xl">
                            <div className="text-umber text-xs font-bold uppercase tracking-wider mb-1">Pending Review</div>
                            <div className="text-2xl font-black text-yellow-800">{pendingCount}</div>
                        </div>
                    </div>

                    {/* Toolbar: Search & Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-umber" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input
                                type="text"
                                placeholder="Search books, authors, or users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-paper border border-linen rounded-xl py-3 pl-12 pr-4 text-ink placeholder-taupe focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Content Table / Grid */}
                    <div className="bg-parchment/60 backdrop-blur-xl border border-linen rounded-2xl overflow-hidden shadow-2xl">

                        {/* Desktop Table Header */}
                        <div className="hidden md:grid grid-cols-12 gap-4 p-5 bg-paper border-b border-linen text-xs font-bold text-umber uppercase tracking-wider">
                            <div className="col-span-4">Book Details</div>
                            <div className="col-span-2">Author</div>
                            <div className="col-span-2 text-center">Status</div>
                            <div className="col-span-2 text-center">Price (INR)</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>

                        {/* Inventory List */}
                        <div className="divide-y divide-linen">
                            {filteredBooks.length > 0 ? (
                                filteredBooks.map((book) => (
                                    <div key={book.id} className="md:grid md:grid-cols-12 md:gap-4 p-5 hover:bg-white/[0.02] transition-colors items-center group">

                                        {/* Mobile Header (Shows only on small screens) */}
                                        <div className="md:hidden flex justify-between items-start mb-4">
                                            <div className="font-bold text-ink text-lg">{book.title}</div>
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${book.status === 'approved' ? 'bg-green-500/10 text-green-700 border border-green-500/20' :
                                                    book.status === 'pending' ? 'bg-yellow-500/10 text-yellow-800 border border-yellow-500/20' :
                                                        'bg-taupe/10 text-umber border border-taupe/20'
                                                }`}>
                                                {book.status || 'Draft'}
                                            </span>
                                        </div>

                                        {/* Col 1: Book Info */}
                                        <div className="col-span-4 mb-4 md:mb-0">
                                            <div className="hidden md:block font-bold text-ink text-base leading-tight mb-1 group-hover:text-indigo-700 transition-colors w-full truncate" title={book.title}>{book.title}</div>
                                            {book.user && (
                                                <div className="flex items-center gap-2 text-sm text-umber">
                                                    <div className="w-5 h-5 rounded-full bg-vellum flex items-center justify-center text-[10px] text-ink font-bold">
                                                        {book.user.name.charAt(0)}
                                                    </div>
                                                    <span className="truncate">{book.user.name}</span>
                                                    <span className="text-umber text-xs">({book.user.email})</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Col 2: Author Name */}
                                        <div className="col-span-2 text-sm text-umber mb-2 md:mb-0">
                                            <span className="md:hidden font-bold text-umber uppercase text-[10px] mr-2">Pen Name:</span>
                                            {book.author_name}
                                        </div>

                                        {/* Col 3: Status (Desktop) */}
                                        <div className="hidden md:flex col-span-2 justify-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${book.status === 'approved' ? 'bg-green-500/10 text-green-700 border border-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.1)]' :
                                                    book.status === 'pending' ? 'bg-yellow-500/10 text-yellow-800 border border-yellow-500/20' :
                                                        'bg-taupe/10 text-umber border border-taupe/20'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${book.status === 'approved' ? 'bg-green-400' :
                                                        book.status === 'pending' ? 'bg-yellow-400 animate-pulse' :
                                                            'bg-taupe-light'
                                                    }`}></span>
                                                {book.status || 'Draft'}
                                            </span>
                                        </div>

                                        {/* Col 4: Price */}
                                        <div className="col-span-2 text-left md:text-center text-sm mb-4 md:mb-0">
                                            <span className="md:hidden font-bold text-umber uppercase text-[10px] mr-2">Price:</span>
                                            <span className="text-ink font-mono font-medium bg-paper px-2 py-1 rounded">₹{book.selling_price || '0.00'}</span>
                                        </div>

                                        {/* Col 5: Actions */}
                                        <div className="col-span-2 flex items-center justify-end gap-2">
                                            <Link
                                                href={route('admin.books.show', book.id)}
                                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/20"
                                            >
                                                Manage
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (confirm(`Are you sure you want to PERMANENTLY DELETE "${book.title}"?`)) {
                                                        router.delete(route('admin.books.destroy', book.id), {
                                                            preserveScroll: true,
                                                        });
                                                    }
                                                }}
                                                className="p-1.5 text-umber hover:text-red-700 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Delete Book"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-paper rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-umber" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                    </div>
                                    {search ? (
                                        <>
                                            <h3 className="text-ink font-bold text-lg mb-1">No matches found</h3>
                                            <p className="text-umber text-sm">Try adjusting your search terms.</p>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="text-ink font-bold text-lg mb-1">No books inventory</h3>
                                            <p className="text-umber text-sm">It's quiet in here.</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Pagination Footer */}
                        {books.links && books.links.length > 3 && (
                            <div className="p-4 border-t border-linen flex justify-center gap-1">
                                {books.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        disabled={!link.url}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${link.active ? 'bg-indigo-600 text-paper shadow-lg' :
                                                !link.url ? 'text-umber cursor-not-allowed' :
                                                    'text-umber hover:bg-paper hover:text-ink'
                                            }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

