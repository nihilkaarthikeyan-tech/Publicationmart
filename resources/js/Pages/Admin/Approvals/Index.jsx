
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';

export default function ApprovalQueue({ auth, books, dbError }) {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // all, missing_isbn, ready, has_cover, no_cover, has_price, no_price
    const [sortBy, setSortBy] = useState('newest'); // oldest, newest
    const [displayBooks, setDisplayBooks] = useState(books.data || []);
    const [newSubmissionNotif, setNewSubmissionNotif] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('connecting'); // connecting, connected, disconnected, fallback

    // Listen for real-time updates via Echo/Pusher
    useEffect(() => {
        if (!window.Echo) {
            console.log('Echo not available, using polling fallback');
            setConnectionStatus('fallback');

            // Fallback: Poll for updates every 30 seconds
            const pollInterval = setInterval(() => {
                router.reload({ only: ['books'], preserveState: true });
            }, 30000);

            return () => clearInterval(pollInterval);
        }

        // Pusher channel for real-time admin notifications
        const channel = window.Echo.channel('admin-approvals');

        // Listen for new book submissions (use dot prefix for Laravel event naming)
        channel.listen('.book-submitted', (event) => {
            console.log('📚 New book submission received:', event);

            // Add new book to top of list
            setDisplayBooks(prev => [event, ...prev]);

            // Show notification
            setNewSubmissionNotif(true);
            setTimeout(() => setNewSubmissionNotif(false), 5000);

            // Browser notification (if permission granted)
            if (Notification.permission === 'granted') {
                new Notification('New Book Submission!', {
                    body: `"${event.title}" by ${event.author_name}`,
                    icon: '/favicon.ico'
                });
            }
        });

        // Track connection status
        if (window.Echo.connector && window.Echo.connector.pusher) {
            const pusher = window.Echo.connector.pusher;

            pusher.connection.bind('connected', () => {
                console.log('✅ Pusher connected');
                setConnectionStatus('connected');
            });

            pusher.connection.bind('disconnected', () => {
                console.log('❌ Pusher disconnected');
                setConnectionStatus('disconnected');
            });

            pusher.connection.bind('error', (err) => {
                console.error('Pusher error:', err);
                setConnectionStatus('disconnected');
            });

            // Check initial state
            if (pusher.connection.state === 'connected') {
                setConnectionStatus('connected');
            }
        }

        // Request notification permission
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        return () => {
            channel.stopListening('.book-submitted');
        };
    }, []);

    // Sync displayBooks when books prop changes (from polling or navigation)
    useEffect(() => {
        if (books.data) {
            setDisplayBooks(books.data);
        }
    }, [books.data]);

    // Filter options
    const filterOptions = [
        { value: 'all', label: 'All Submissions', icon: '📚' },
        { value: 'ready', label: 'Ready to Publish', icon: '✅' },
        { value: 'missing_isbn', label: 'Missing ISBN', icon: '🏷️' },
        { value: 'no_cover', label: 'No Cover', icon: '🖼️' },
        { value: 'has_cover', label: 'Has Cover', icon: '✨' },
        { value: 'no_price', label: 'No Price Set', icon: '💰' },
        { value: 'has_price', label: 'Price Set', icon: '💵' },
    ];

    // Client-side filtering with advanced filters
    const filteredBooks = useMemo(() => {
        let result = displayBooks;

        // Apply search filter
        if (search) {
            result = result.filter(book =>
                book.title.toLowerCase().includes(search.toLowerCase()) ||
                book.author_name.toLowerCase().includes(search.toLowerCase()) ||
                (book.user && book.user.name.toLowerCase().includes(search.toLowerCase()))
            );
        }

        // Apply category filter
        switch (filter) {
            case 'missing_isbn':
                result = result.filter(book => !book.isbn);
                break;
            case 'ready':
                result = result.filter(book => book.isbn && book.cover_design_path && book.selling_price > 0);
                break;
            case 'has_cover':
                result = result.filter(book => book.cover_design_path);
                break;
            case 'no_cover':
                result = result.filter(book => !book.cover_design_path);
                break;
            case 'has_price':
                result = result.filter(book => book.selling_price > 0);
                break;
            case 'no_price':
                result = result.filter(book => !book.selling_price || book.selling_price <= 0);
                break;
            default:
                // 'all' - no additional filtering
                break;
        }

        // Apply sorting
        result = [...result].sort((a, b) => {
            const dateA = new Date(a.updated_at || a.created_at);
            const dateB = new Date(b.updated_at || b.created_at);
            return sortBy === 'oldest' ? dateA - dateB : dateB - dateA;
        });

        return result;
    }, [displayBooks, search, filter, sortBy]);

    return (
        <>
            <Head title="Approvals Queue" />

            <div className="min-h-screen bg-parchment text-ink font-sans selection:bg-orange-500/30">
                {/* Background Ambient Glows - Orange theme for Approvals */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-900/10 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/10 rounded-full blur-[120px]"></div>
                </div>

                {/* Real-Time Notification */}
                {newSubmissionNotif && (
                    <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full shadow-2xl shadow-orange-500/50 flex items-center gap-2 font-bold">
                            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            New book submission received! 🎉
                        </div>
                    </div>
                )}

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-800 text-xs font-bold border border-orange-500/20 uppercase tracking-wider">
                                    Action Required
                                </span>
                                {/* Real-time connection status */}
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${connectionStatus === 'connected'
                                    ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20'
                                    : connectionStatus === 'fallback'
                                        ? 'bg-blue-500/10 text-blue-700 border-blue-500/20'
                                        : 'bg-yellow-500/10 text-yellow-800 border-yellow-500/20'
                                    }`}>
                                    <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected'
                                        ? 'bg-emerald-400 animate-pulse'
                                        : connectionStatus === 'fallback'
                                            ? 'bg-blue-400'
                                            : 'bg-yellow-400'
                                        }`}></span>
                                    {connectionStatus === 'connected' ? 'LIVE' : connectionStatus === 'fallback' ? 'POLLING' : 'CONNECTING...'}
                                </span>
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-ink mb-2">Approvals Queue</h1>
                            <p className="text-umber">Review and publish pending book submissions.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href={route('admin.dashboard')} className="px-5 py-2.5 bg-paper hover:bg-paper border border-linen text-ink-soft rounded-xl transition-all text-sm font-bold flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Dashboard
                            </Link>
                        </div>
                    </div>

                    {/* DB Error Banner */}
                    {dbError && (
                        <div className="mb-8 p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 text-rose-700">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-black text-rose-700 uppercase tracking-wider">Database issue</div>
                                    <div className="text-sm text-rose-700/90 mt-1">{dbError}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Queue Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="p-5 bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-2xl">
                            <div className="text-orange-800 text-xs font-bold uppercase tracking-wider mb-1">Pending Approval</div>
                            <div className="text-3xl font-black text-ink">{books.total}</div>
                        </div>
                        <div className="p-5 bg-parchment/80 backdrop-blur border border-linen rounded-2xl">
                            <div className="text-umber text-xs font-bold uppercase tracking-wider mb-1">Missing ISBN</div>
                            <div className="text-2xl font-black text-rose-700">
                                {books.data.filter(b => !b.isbn).length}
                            </div>
                        </div>
                        <div className="p-5 bg-parchment/80 backdrop-blur border border-linen rounded-2xl">
                            <div className="text-umber text-xs font-bold uppercase tracking-wider mb-1">Ready to Publish</div>
                            <div className="text-2xl font-black text-emerald-700">
                                {books.data.filter(b => b.isbn && b.cover_design_path && b.selling_price).length}
                            </div>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="space-y-4 mb-6">
                        {/* Search and Sort Row */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-umber" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                <input
                                    type="text"
                                    placeholder="Search by title, author, or user..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-paper border border-linen rounded-xl py-3 pl-12 pr-4 text-ink placeholder-gray-500 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all outline-none"
                                />
                            </div>

                            {/* Sort Dropdown */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-umber uppercase tracking-wider font-bold whitespace-nowrap">Sort:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-paper border border-linen rounded-xl py-3 px-4 text-ink text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all outline-none cursor-pointer"
                                >
                                    <option value="oldest">Oldest First (FIFO)</option>
                                    <option value="newest">Newest First</option>
                                </select>
                            </div>
                        </div>

                        {/* Filter Pills Row */}
                        <div className="flex flex-wrap gap-2">
                            {filterOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setFilter(option.value)}
                                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === option.value
                                        ? 'bg-orange-700 text-paper shadow-lg shadow-orange-700/30'
                                        : 'bg-paper text-umber border border-linen hover:border-orange-500/50 hover:text-orange-800'
                                        }`}
                                >
                                    <span>{option.icon}</span>
                                    <span>{option.label}</span>
                                    {option.value !== 'all' && (
                                        <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] ${filter === option.value ? 'bg-vellum' : 'bg-paper'
                                            }`}>
                                            {option.value === 'missing_isbn' && books.data.filter(b => !b.isbn).length}
                                            {option.value === 'ready' && books.data.filter(b => b.isbn && b.cover_design_path && b.selling_price > 0).length}
                                            {option.value === 'no_cover' && books.data.filter(b => !b.cover_design_path).length}
                                            {option.value === 'has_cover' && books.data.filter(b => b.cover_design_path).length}
                                            {option.value === 'no_price' && books.data.filter(b => !b.selling_price || b.selling_price <= 0).length}
                                            {option.value === 'has_price' && books.data.filter(b => b.selling_price > 0).length}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Active Filter Info */}
                        {(filter !== 'all' || search) && (
                            <div className="flex items-center justify-between bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3">
                                <div className="flex items-center gap-2 text-sm text-orange-800">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    <span>
                                        Showing <strong>{filteredBooks.length}</strong> of {books.data.length} submissions
                                        {filter !== 'all' && <span> • Filter: <strong>{filterOptions.find(o => o.value === filter)?.label}</strong></span>}
                                        {search && <span> • Search: <strong>"{search}"</strong></span>}
                                    </span>
                                </div>
                                <button
                                    onClick={() => { setFilter('all'); setSearch(''); }}
                                    className="text-xs text-orange-800 hover:text-orange-800 font-bold uppercase tracking-wider"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    <div className="bg-parchment/60 backdrop-blur-xl border border-linen rounded-2xl overflow-hidden shadow-2xl">
                        <div className="hidden md:grid grid-cols-12 gap-4 p-5 bg-paper border-b border-linen text-xs font-bold text-umber uppercase tracking-wider">
                            <div className="col-span-5">Book Details</div>
                            <div className="col-span-3">Checklist</div>
                            <div className="col-span-2">Submitted</div>
                            <div className="col-span-2 text-right">Action</div>
                        </div>

                        <div className="divide-y divide-linen">
                            {filteredBooks.length > 0 ? (
                                filteredBooks.map((book) => (
                                    <div key={book.id} className="md:grid md:grid-cols-12 md:gap-4 p-5 hover:bg-white/[0.02] transition-colors items-center group">

                                        {/* Mobile Header */}
                                        <div className="md:hidden flex justify-between items-start mb-4">
                                            <div className="font-bold text-ink text-lg">{book.title}</div>
                                            <span className="text-xs text-umber">{new Date(book.updated_at || book.created_at).toLocaleDateString()}</span>
                                        </div>

                                        {/* Col 1: Details */}
                                        <div className="col-span-5 mb-4 md:mb-0">
                                            <div className="font-bold text-ink text-base leading-tight mb-1 group-hover:text-orange-800 transition-colors w-full truncate">{book.title}</div>
                                            <div className="text-sm text-umber mb-1">by <span className="text-ink-soft">{book.author_name}</span></div>
                                            {book.user && (
                                                <div className="text-xs text-umber">User: {book.user.name} ({book.user.email})</div>
                                            )}
                                        </div>

                                        {/* Col 2: Checklist Flags */}
                                        <div className="col-span-3 flex flex-wrap gap-2 mb-4 md:mb-0">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${book.isbn ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20' : 'bg-red-500/10 text-red-800 border-red-500/20'}`}>
                                                {book.isbn ? 'ISBN OK' : 'No ISBN'}
                                            </span>
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${book.cover_design_path ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20' : 'bg-red-500/10 text-red-800 border-red-500/20'}`}>
                                                {book.cover_design_path ? 'Cover OK' : 'No Cover'}
                                            </span>
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${book.selling_price > 0 ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20' : 'bg-red-500/10 text-red-800 border-red-500/20'}`}>
                                                {book.selling_price > 0 ? 'Price OK' : 'No Price'}
                                            </span>
                                        </div>

                                        {/* Col 3: Date */}
                                        <div className="col-span-2 text-sm text-umber mb-2 md:mb-0">
                                            {new Date(book.updated_at || book.created_at).toLocaleDateString()}
                                            <div className="text-xs text-umber">{new Date(book.updated_at || book.created_at).toLocaleTimeString()}</div>
                                        </div>

                                        {/* Col 4: Action */}
                                        <div className="col-span-2 flex items-center justify-end">
                                            <Link
                                                href={route('admin.books.show', book.id)}
                                                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white text-sm font-bold rounded-lg shadow-lg shadow-orange-500/20 transition-all transform hover:scale-105"
                                            >
                                                Review Now
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-16 text-center">
                                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-ink mb-2">All Caught Up!</h3>
                                    <p className="text-umber">There are no pending submissions awaiting approval.</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {books.links && books.links.length > 3 && (
                            <div className="p-4 border-t border-linen flex justify-center gap-1">
                                {books.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        disabled={!link.url}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${link.active ? 'bg-orange-700 text-paper shadow' :
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

