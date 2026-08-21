import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import CreateCouponModal from './Coupons/CreateCouponModal';
import OrderDetailsModal from './Orders/OrderDetailsModal';

export default function AdminDashboard({ auth, stats, recentBooks, topBooks, recentTransactions, monthlyRevenue, pendingBooks = [], coupons = [], isMainAdmin = false, aiWritingStats = null, latestPlatformOrders = [], challengeEnrollments = [] }) {
    const [timeRange, setTimeRange] = useState('30days');
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [displayPendingBooks, setDisplayPendingBooks] = useState(pendingBooks);
    const [newSubmissionAlert, setNewSubmissionAlert] = useState(false);
    const [liveStats, setLiveStats] = useState(stats);



    // Real-time updates via Pusher/Echo
    useEffect(() => {
        if (!window.Echo) {
            // Fallback: Poll every 10 seconds
            const interval = setInterval(() => {
                router.reload({ only: ['pendingBooks', 'stats'], preserveState: true });
            }, 10000);
            return () => clearInterval(interval);
        }

        // Listen for new book submissions
        const channel = window.Echo.channel('admin-approvals');

        channel.listen('.book-submitted', (event) => {
            console.log('📚 New submission in dashboard:', event);

            // Add to pending books list
            setDisplayPendingBooks(prev => [event, ...prev.slice(0, 9)]);

            // Update live stats
            setLiveStats(prev => ({
                ...prev,
                awaitingApproval: (prev.awaitingApproval || 0) + 1
            }));

            // Show alert
            setNewSubmissionAlert(true);
            setTimeout(() => setNewSubmissionAlert(false), 5000);

            // Browser notification
            if (Notification.permission === 'granted') {
                new Notification('New Book Submission!', {
                    body: `"${event.title}" by ${event.author_name} needs review`,
                    icon: '/favicon.ico'
                });
            }
        });

        // Request notification permission
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        return () => {
            channel.stopListening('.book-submitted');
        };
    }, []);

    // Sync when props change
    useEffect(() => {
        setDisplayPendingBooks(pendingBooks);
    }, [pendingBooks]);

    useEffect(() => {
        setLiveStats(stats);
    }, [stats]);

    return (
        <>
            <Head title="Admin Dashboard" />

            {/* COUPON MODAL */}
            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}

            {showCouponModal && (
                <CreateCouponModal
                    onClose={() => setShowCouponModal(false)}
                    coupons={coupons}
                />
            )}

            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                {/* Real-time new submission alert */}
                {newSubmissionAlert && (
                    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full shadow-2xl shadow-orange-500/50 flex items-center gap-2 font-bold">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            New book submission received! 🎉
                        </div>
                    </div>
                )}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* Header & Controls */}
                    <div className="mb-8 space-y-6">
                        {/* Top Row: Title & Primary Actions */}
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                            <div>
                                <h1 className="text-4xl font-black text-white mb-2">Admin Dashboard</h1>
                                <p className="text-gray-400">Your Books Analytics - Welcome back, {auth.user.name}</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                {/* APPROVALS QUEUE */}
                                <Link
                                    href={route('admin.approvals.index')}
                                    className="relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Approvals Queue
                                    {liveStats.awaitingApproval > 0 && (
                                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-white text-orange-600 text-xs font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
                                            {liveStats.awaitingApproval}
                                        </span>
                                    )}
                                </Link>

                                {/* PUBLISH NEW BOOK */}
                                <Link
                                    href={route('admin.books.create')}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                    </svg>
                                    Publish New Book
                                </Link>
                            </div>
                        </div>

                        {/* Secondary Navigation Bar */}
                        <div className="flex flex-wrap items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-2xl">
                            <Link
                                href={route('admin.professional.index')}
                                className="flex-1 min-w-[max-content] inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-transparent hover:bg-white/5 text-gray-300 hover:text-white font-medium rounded-xl transition-all border border-transparent hover:border-white/10 text-sm"
                            >
                                <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                Professional Requests
                            </Link>

                            <div className="w-px h-6 bg-white/10 hidden md:block"></div>

                            <Link
                                href={route('admin.users.index')}
                                className="flex-1 min-w-[max-content] inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-transparent hover:bg-white/5 text-gray-300 hover:text-white font-medium rounded-xl transition-all border border-transparent hover:border-white/10 text-sm"
                            >
                                <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                Manage Users
                            </Link>

                            <Link
                                href={route('admin.admins.index')}
                                className="flex-1 min-w-[max-content] inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-transparent hover:bg-white/5 text-gray-300 hover:text-white font-medium rounded-xl transition-all border border-transparent hover:border-white/10 text-sm"
                            >
                                <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                Manage Admins
                            </Link>

                            <div className="w-px h-6 bg-white/10 hidden md:block"></div>



                            {/* ── Support Tickets ── */}
                            <Link
                                href={route('admin.support.index')}
                                className="flex-1 min-w-[max-content] inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-transparent hover:bg-white/5 text-teal-400/90 hover:text-teal-300 font-medium rounded-xl transition-all border border-transparent hover:border-teal-500/20 text-sm"
                            >
                                <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                                Support Tickets
                            </Link>

                            <div className="w-px h-6 bg-white/10 hidden md:block"></div>

                            {isMainAdmin && (
                                <button
                                    onClick={() => setShowCouponModal(true)}
                                    className="flex-1 min-w-[max-content] inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-transparent hover:bg-white/5 text-amber-500/90 hover:text-amber-400 font-medium rounded-xl transition-all border border-transparent hover:border-amber-500/20 text-sm"
                                >
                                    <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                    Manage Coupons
                                </button>
                            )}

                            <Link
                                href={route('admin.challenge-settings.index')}
                                className="flex-1 min-w-[max-content] inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-transparent hover:bg-white/5 text-gray-300 hover:text-white font-medium rounded-xl transition-all border border-transparent hover:border-white/10 text-sm"
                            >
                                <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Challenge Videos
                            </Link>

                            <Link
                                href={route('admin.certificates.index')}
                                className="flex-1 min-w-[max-content] inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-transparent hover:bg-white/5 text-gray-300 hover:text-white font-medium rounded-xl transition-all border border-transparent hover:border-white/10 text-sm"
                            >
                                <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                Certificates
                            </Link>

                            <div className="w-px h-6 bg-white/10 hidden md:block"></div>

                            <Link
                                href={route('admin.publishing-inquiries.index')}
                                className="flex-1 min-w-[max-content] inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-transparent hover:bg-white/5 text-purple-400/90 hover:text-purple-300 font-medium rounded-xl transition-all border border-transparent hover:border-purple-500/20 text-sm"
                            >
                                <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                Publishing Inquiries
                            </Link>

                            <div className="w-px h-6 bg-white/10 hidden md:block"></div>

                            <Link
                                href={route('admin.blogs.manage')}
                                className="flex-1 min-w-[max-content] inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-transparent hover:bg-white/5 text-rose-400/90 hover:text-rose-300 font-medium rounded-xl transition-all border border-transparent hover:border-rose-500/20 text-sm"
                            >
                                <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                Book Studio Approvals
                            </Link>

                            <Link
                                href={route('admin.presales.index')}
                                className="flex-1 min-w-[max-content] inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-transparent hover:bg-white/5 text-amber-400/90 hover:text-amber-300 font-medium rounded-xl transition-all border border-transparent hover:border-amber-500/20 text-sm"
                            >
                                <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Presale Management
                            </Link>

                            <Link
                                href={route('admin.challenge-enrollments.index')}
                                className="flex-1 min-w-[max-content] inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-transparent hover:bg-white/5 text-indigo-400/90 hover:text-indigo-300 font-medium rounded-xl transition-all border border-transparent hover:border-indigo-500/20 text-sm"
                            >
                                <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                                Challenge Enrollments
                            </Link>
                        </div>
                    </div>

                    {/* Real-Time Analytics Overview (Global) */}
                    <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 rounded-3xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
                        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20"></div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                            {/* Left Side: Big Metrics */}
                            <div className="flex flex-col justify-center space-y-8">
                                <div>
                                    <h2 className="text-5xl font-bold mb-2">₹{stats.totalAuthorRevenue ? parseFloat(stats.totalAuthorRevenue).toLocaleString() : '0.00'}</h2>
                                    <p className="text-gray-300 text-lg">Total Author Payouts</p>
                                </div>
                                <div>
                                    <h2 className="text-5xl font-bold mb-2">{stats.totalSales || 0}</h2>
                                    <p className="text-gray-300 text-lg">Total Quantity Sold</p>
                                </div>
                                {/* Progress/Status Bar Placeholder - from image */}
                                <div className="w-full h-12 border border-gray-600 rounded-none mt-4"></div>
                            </div>

                            {/* Right Side: Channel Breakdown */}
                            <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                                {/* Amazon */}
                                <div className="flex justify-between items-center group">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
                                        <span className="text-gray-300 group-hover:text-white transition-colors">Amazon</span>
                                    </div>
                                    <span className="text-2xl font-bold text-white">{stats.breakdown?.amazon?.quantity || 0}</span>
                                </div>

                                {/* International */}
                                <div className="flex justify-between items-center group">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
                                        <span className="text-gray-300 group-hover:text-white transition-colors">International</span>
                                    </div>
                                    <span className="text-2xl font-bold text-white">{stats.breakdown?.other?.quantity || 0}</span>
                                </div>

                                {/* Google Play Books */}
                                <div className="flex justify-between items-center group">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                                        <span className="text-gray-300 group-hover:text-white transition-colors">Google Play Books</span>
                                    </div>
                                    <span className="text-2xl font-bold text-white">{stats.breakdown?.google?.quantity || 0}</span>
                                </div>

                                {/* Direct Sales */}
                                <div className="flex justify-between items-center group">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                                        <span className="text-gray-300 group-hover:text-white transition-colors">Direct Sales</span>
                                    </div>
                                    <span className="text-2xl font-bold text-white">{stats.breakdown?.direct?.quantity || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Total Revenue */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                            <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-6 group-hover:border-green-500/50 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-semibold text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                                        +{stats.revenueGrowth}%
                                    </span>
                                </div>
                                <h3 className="text-gray-400 text-sm font-medium mb-1">Total Revenue</h3>
                                <p className="text-3xl font-black text-white">₹{stats.totalRevenue.toLocaleString()}</p>
                                <p className="text-xs text-gray-500 mt-2">Commission: ₹{stats.platformCommission.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Total Books */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                            <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-6 group-hover:border-blue-500/50 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
                                        {stats.publishedBooks} Published
                                    </span>
                                </div>
                                <h3 className="text-gray-400 text-sm font-medium mb-1">Total Books</h3>
                                <p className="text-3xl font-black text-white">{stats.totalBooks}</p>
                                <p className="text-xs text-gray-500 mt-2">Pending: {stats.pendingBooks}</p>
                                <Link href={route('admin.books.index')} className="absolute inset-0 z-10" aria-label="View all books"></Link>
                            </div>
                        </div>

                        {/* Total Authors */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                            <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-6 group-hover:border-purple-500/50 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">
                                        +{stats.newAuthorsThisMonth} this month
                                    </span>
                                </div>
                                <h3 className="text-gray-400 text-sm font-medium mb-1">Total Authors</h3>
                                <p className="text-3xl font-black text-white">{stats.totalAuthors}</p>
                                <p className="text-xs text-gray-500 mt-2">Active: {stats.activeAuthors}</p>
                            </div>
                        </div>

                        {/* Total Sales */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-amber-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                            <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-6 group-hover:border-orange-500/50 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-semibold text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full">
                                        {stats.salesToday} today
                                    </span>
                                </div>
                                <h3 className="text-gray-400 text-sm font-medium mb-1">Total Sales</h3>
                                <p className="text-3xl font-black text-white">{stats.totalSales}</p>
                                <p className="text-xs text-gray-500 mt-2">This month: {stats.salesThisMonth}</p>
                            </div>
                        </div>
                    </div>

                    {/* AI Writing Activity Section */}
                    {aiWritingStats && (
                        <div className="bg-gradient-to-br from-indigo-900/30 to-cyan-900/30 backdrop-blur-xl rounded-2xl border border-indigo-500/20 p-6 mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">AI Writing Activity</h3>
                                        <p className="text-gray-400 text-sm">Platform-wide Smart Writer statistics</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30">
                                    {aiWritingStats.activeToday} active today
                                </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {/* Total AI Books */}
                                <div className="bg-white/5 rounded-xl p-4 text-center">
                                    <p className="text-3xl font-bold text-white">{aiWritingStats.totalAiBooks}</p>
                                    <p className="text-gray-400 text-sm mt-1">AI Books</p>
                                </div>

                                {/* Pages Generated */}
                                <div className="bg-white/5 rounded-xl p-4 text-center">
                                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                                        {aiWritingStats.totalPagesGenerated.toLocaleString()}
                                    </p>
                                    <p className="text-gray-400 text-sm mt-1">Pages Generated</p>
                                </div>

                                {/* Active Today */}
                                <div className="bg-white/5 rounded-xl p-4 text-center">
                                    <p className="text-3xl font-bold text-emerald-400">{aiWritingStats.activeToday}</p>
                                    <p className="text-gray-400 text-sm mt-1">Active Today</p>
                                </div>

                                {/* Plan Breakdown */}
                                <div className="bg-white/5 rounded-xl p-4">
                                    <p className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Plan Breakdown</p>
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 text-xs">Saver</span>
                                            <span className="text-white text-sm font-bold">{aiWritingStats.planBreakdown?.saver || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 text-xs">Standard</span>
                                            <span className="text-white text-sm font-bold">{aiWritingStats.planBreakdown?.standard || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 text-xs">Pro</span>
                                            <span className="text-white text-sm font-bold">{aiWritingStats.planBreakdown?.pro || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 text-xs">Enterprise</span>
                                            <span className="text-white text-sm font-bold">{aiWritingStats.planBreakdown?.enterprise || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* LATEST PLATFORM ORDERS (NEW SECTION FOR SHIPPING) */}
                    <div className="bg-gradient-to-br from-emerald-900/10 to-teal-900/10 backdrop-blur-xl rounded-2xl border border-emerald-500/20 p-6 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                Latest Platform Orders (Shipping Required)
                            </h3>
                            <span className="text-emerald-400 text-sm">Direct Store Sales</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/10 text-gray-400 text-sm">
                                        <th className="pb-3 pl-2">Order ID</th>
                                        <th className="pb-3">Customer</th>
                                        <th className="pb-3">Book</th>
                                        <th className="pb-3">Shipping Details</th>
                                        <th className="pb-3 text-right">Amount</th>
                                        <th className="pb-3 text-right">Status</th>
                                        <th className="pb-3 text-right pr-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {/* Map ONLY if we have platform orders props */}
                                    {latestPlatformOrders && latestPlatformOrders.length > 0 ? (
                                        latestPlatformOrders.map((order) => (
                                            <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-4 pl-2 font-mono text-gray-300">{order.transaction_id.slice(-8)}</td>
                                                <td className="py-4 text-white font-medium">{order.customer_name}</td>
                                                <td className="py-4 text-gray-300 truncate max-w-[200px]">{order.book_title}</td>
                                                <td className="py-4 text-gray-400 text-xs min-w-[250px] max-w-[350px] leading-relaxed">
                                                    {order.pys_shipping_details ? (
                                                        <div className="bg-emerald-500/5 p-2.5 rounded-lg border border-emerald-500/10">
                                                            <div className="font-bold text-white mb-0.5">{order.pys_shipping_details.full_name}</div>
                                                            <div className="text-emerald-400/80 mb-1">{order.pys_shipping_details.phone} • {order.pys_shipping_details.email}</div>
                                                            <div className="whitespace-normal break-words text-gray-300">
                                                                {order.pys_shipping_details.address}, {order.pys_shipping_details.city} - {order.pys_shipping_details.pincode}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="italic opacity-50">No shipping info</span>
                                                    )}
                                                </td>
                                                <td className="py-4 text-right font-bold text-white">₹{order.amount.toFixed(2)}</td>
                                                <td className="py-4 text-right">
                                                    <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs font-bold uppercase">
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right pr-2">
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold transition-colors"
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="py-6 text-center text-gray-500 italic">No recent store orders found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* LATEST CHALLENGE ENROLLMENTS */}
                    <div className="bg-gradient-to-br from-purple-900/10 to-indigo-900/10 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                                Recent Challenge Enrollments
                            </h3>
                            <span className="text-purple-400 text-sm">Contest Entries</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/10 text-gray-400 text-sm">
                                        <th className="pb-3 pl-2">Date</th>
                                        <th className="pb-3">Challenge Type</th>
                                        <th className="pb-3">Participant</th>
                                        <th className="pb-3">Contact</th>
                                        <th className="pb-3">City</th>
                                        <th className="pb-3 text-right">Fee</th>
                                        <th className="pb-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {challengeEnrollments && challengeEnrollments.length > 0 ? (
                                        challengeEnrollments.map((entry) => (
                                            <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-4 pl-2 font-mono text-gray-400 text-xs">{entry.date}</td>
                                                <td className="py-4 text-white font-medium">
                                                    <span className="bg-white/5 border border-white/10 px-2 py-1 rounded text-xs">{entry.type}</span>
                                                </td>
                                                <td className="py-4 text-white">{entry.name}</td>
                                                <td className="py-4 text-gray-400 text-xs">
                                                    <div>{entry.email}</div>
                                                    <div>{entry.mobile}</div>
                                                </td>
                                                <td className="py-4 text-gray-300">{entry.city}</td>
                                                <td className="py-4 text-right font-bold text-white">₹{entry.fee}</td>
                                                <td className="py-4 text-right">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${entry.status === 'paid' || entry.status === 'completed'
                                                        ? 'bg-green-500/10 text-green-400'
                                                        : 'bg-yellow-500/10 text-yellow-400'
                                                        }`}>
                                                        {entry.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="py-6 text-center text-gray-500 italic">No enrollments yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Revenue Chart */}
                        <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">Revenue Trend</h3>
                                <select
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="7days">Last 7 Days</option>
                                    <option value="30days">Last 30 Days</option>
                                    <option value="6months">Last 6 Months</option>
                                </select>
                            </div>
                            {/* Simple Bar Chart Visualization */}
                            <div className="flex items-end gap-2 h-48">
                                {monthlyRevenue.map((month, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                        <div
                                            className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg transition-all hover:from-indigo-400 hover:to-purple-400 relative group"
                                            style={{ height: `${(month.revenue / Math.max(...monthlyRevenue.map(m => m.revenue))) * 100}%` }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                ₹{month.revenue.toLocaleString()}
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500">{month.month}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Books */}
                        <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                            <h3 className="text-xl font-bold text-white mb-6">Top Performing Books</h3>
                            <div className="space-y-4">
                                {topBooks.map((book, index) => (
                                    <div key={book.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                            #{index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-semibold text-sm truncate">{book.title}</h4>
                                            <p className="text-gray-400 text-xs">by {book.author_name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-bold text-sm">₹{book.total_revenue.toLocaleString()}</p>
                                            <p className="text-gray-500 text-xs">{book.sales_count} sales</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Books */}
                        <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">Recent Books</h3>
                                <Link href={route('admin.books.index')} className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold">
                                    View All →
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {recentBooks.map(book => (
                                    <Link
                                        key={book.id}
                                        href={route('admin.books.show', book.id)}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-semibold text-sm truncate">{book.title}</h4>
                                            <p className="text-gray-400 text-xs">{book.author_name}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${book.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                                            book.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                                                'bg-gray-500/10 text-gray-400'
                                            }`}>
                                            {book.status}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
                                <span className="text-indigo-400 text-sm font-semibold">Your Sales</span>
                            </div>
                            <div className="space-y-3">
                                {recentTransactions && recentTransactions.length > 0 ? (
                                    recentTransactions.map(transaction => (
                                        <div key={transaction.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${transaction.sales_channel === 'amazon' ? 'bg-orange-500/20 text-orange-400' :
                                                transaction.sales_channel === 'google' ? 'bg-blue-500/20 text-blue-400' :
                                                    transaction.sales_channel === 'direct' ? 'bg-green-500/20 text-green-400' :
                                                        'bg-purple-500/20 text-purple-400'
                                                }`}>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white font-semibold text-sm truncate">{transaction.book_title}</h4>
                                                <p className="text-gray-400 text-xs">{new Date(transaction.created_at).toLocaleDateString()} • {transaction.quantity || 1} copies</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white font-bold text-sm">₹{parseFloat(transaction.amount || 0).toLocaleString()}</p>
                                                <span className={`text-xs ${transaction.payment_status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                    {transaction.payment_status}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No transactions yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pending Books for Approval - Full Width Section */}
                    {displayPendingBooks && displayPendingBooks.length > 0 && (
                        <div className="mt-8 bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl rounded-2xl border border-orange-500/30 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Pending Books for Approval</h3>
                                        <p className="text-sm text-gray-400">Books submitted by users awaiting your review</p>
                                    </div>
                                </div>
                                <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm font-bold">
                                    {displayPendingBooks.length} Pending
                                </span>
                            </div>
                            <div className="grid gap-4">
                                {displayPendingBooks.map(book => (
                                    <Link
                                        key={book.id}
                                        href={route('admin.books.show', book.id)}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
                                    >
                                        <div className="flex-shrink-0 h-14 w-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white font-bold shadow text-lg">
                                            {book.title.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-semibold text-base truncate">{book.title}</h4>
                                            <p className="text-gray-400 text-sm">by {book.author_name}</p>
                                            {book.user && (
                                                <p className="text-gray-500 text-xs mt-1">
                                                    Submitted by: {book.user.name} ({book.user.email})
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1 items-end">
                                            <div className="flex gap-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${book.has_isbn ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {book.has_isbn ? '✓ ISBN' : '✗ No ISBN'}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${book.has_price ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {book.has_price ? '✓ Price' : '✗ No Price'}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${book.has_cover ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {book.has_cover ? '✓ Cover' : '✗ No Cover'}
                                                </span>
                                            </div>
                                            <span className="text-gray-500 text-xs">
                                                {new Date(book.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <span className="text-orange-400 group-hover:text-orange-300 font-semibold text-sm">
                                                Review →
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}
