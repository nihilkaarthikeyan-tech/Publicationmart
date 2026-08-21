import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ auth, books }) {
    const [search, setSearch] = useState('');

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author_name.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = (book) => {
        if (confirm(`Are you sure you want to PERMANENTLY DELETE "${book.title}"? This action cannot be undone.`)) {
            router.delete(route('books.destroy', book.id));
        }
    };

    return (
        <>
            <Head title="My Publications" />

            <div className="min-h-screen bg-[#0f0a1e] text-white font-sans selection:bg-indigo-500/30">
                {/* Background Ambient Glows */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px]"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-white mb-2">My Publications</h1>
                            <p className="text-gray-400">Manage your books, track status, and update details.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href={route('dashboard')} className="px-5 py-2.5 bg-[#15161b] hover:bg-[#1e2029] border border-white/10 text-gray-300 rounded-xl transition-all text-sm font-bold flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Dashboard
                            </Link>
                            <Link href={route('books.create')} className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                Publish New Book
                            </Link>
                        </div>
                    </div>

                    {/* Toolbar: Search */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input
                                type="text"
                                placeholder="Search your books by title or author name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-[#15161b] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Content List */}
                    <div className="bg-[#15161b]/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">

                        {/* Table Header */}
                        <div className="hidden md:grid grid-cols-12 gap-4 p-5 bg-white/5 border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <div className="col-span-5">Book Details</div>
                            <div className="col-span-2 text-center">Status</div>
                            <div className="col-span-2 text-center">Step</div>
                            <div className="col-span-3 text-right">Actions</div>
                        </div>

                        {/* Inventory List */}
                        <div className="divide-y divide-white/5">
                            {filteredBooks.length > 0 ? (
                                filteredBooks.map((book) => (
                                    <div key={book.id} className="md:grid md:grid-cols-12 md:gap-4 p-5 hover:bg-white/[0.02] transition-colors items-center group">

                                        {/* Row Start: Title & Basic Info */}
                                        <div className="col-span-5 mb-4 md:mb-0">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 border border-white/5">
                                                    {book.cover_design_path ? (
                                                        <img src={`${auth.app_url || ''}/storage/${book.cover_design_path}`} alt={book.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-white font-bold text-base md:text-lg leading-tight truncate group-hover:text-indigo-400 transition-colors" title={book.title}>
                                                        {book.title}
                                                    </h4>
                                                    <p className="text-gray-500 text-sm truncate">by {book.author_name}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="col-span-2 flex justify-start md:justify-center mb-4 md:mb-0">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${book.step_completed >= 4
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${book.step_completed >= 4 ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`}></span>
                                                {book.step_completed >= 4 ? 'Published' : 'Draft'}
                                            </span>
                                        </div>

                                        {/* Step Progress */}
                                        <div className="col-span-2 text-center hidden md:block">
                                            <div className="text-xs text-gray-500 mb-1">Progress</div>
                                            <div className="w-full bg-gray-800 h-1.5 rounded-full max-w-[80px] mx-auto overflow-hidden">
                                                <div
                                                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${(book.step_completed / 4) * 100}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase">{book.step_completed}/4 Steps</div>
                                        </div>

                                        {/* Actions */}
                                        <div className="col-span-3 flex items-center justify-end gap-3">
                                            <Link
                                                href={route('books.details', book.id)}
                                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-all border border-white/10 flex items-center gap-2"
                                            >
                                                {book.step_completed >= 4 ? 'Manage' : 'Continue'}
                                            </Link>

                                            <button
                                                onClick={() => handleDelete(book)}
                                                className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                                title="Delete Publication"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-20 text-center flex flex-col items-center justify-center">
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                        <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                    </div>
                                    <h3 className="text-white font-black text-xl mb-2">No publications yet</h3>
                                    <p className="text-gray-500 mb-8 max-w-sm">Ready to share your story with the world? Start your first publication now.</p>
                                    <Link href={route('books.create')} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95">
                                        Publish Your First Book
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

