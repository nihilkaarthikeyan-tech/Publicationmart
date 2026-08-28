import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import CreateCouponModal from './Components/CreateCouponModal';
import OrderDetailsModal from './Components/OrderDetailsModal';

/**
 * Admin dashboard — the press's control desk.
 *
 * Every operational feature of the previous dashboard is preserved: the
 * Echo real-time approvals channel with browser notifications and the 10s
 * polling fallback, the live approvals badge, both modals, the eleven
 * management destinations (coupons gated to the main admin), the platform
 * ledger with per-channel breakdown, AI writing stats, the shipping-orders
 * and challenge-enrolment tables, revenue chart, top books, recent books
 * and transactions, and the pending-approvals list with readiness chips.
 */

const SERIF = { fontFamily: "'EB Garamond', Georgia, serif" };
const NUM = { fontVariantNumeric: 'tabular-nums' };
const TH = 'pb-3 text-[10px] font-semibold uppercase tracking-[.16em] text-umber';

// One status-chip vocabulary for the whole surface.
function StatusChip({ value }) {
    const v = String(value || '').toLowerCase();
    const tone = ['paid', 'completed', 'approved', 'active', 'shipped'].includes(v)
        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
        : ['pending', 'processing', 'draft'].includes(v)
            ? 'bg-amber-50 text-amber-800 border-amber-300'
            : ['failed', 'rejected', 'cancelled', 'expired'].includes(v)
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-parchment text-ink-soft border-linen';
    return (
        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${tone}`}>
            {value}
        </span>
    );
}

// Card with the running-head title used across the whole site.
function Panel({ title, action, children, className = '' }) {
    return (
        <div className={`bg-paper border border-linen rounded-lg overflow-hidden ${className}`}>
            {title && (
                <div className="px-6 py-4 border-b border-linen flex items-center justify-between gap-4">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[.18em] text-ink-soft">{title}</h3>
                    {action}
                </div>
            )}
            {children}
        </div>
    );
}

// The four sales channels wear the four book cloths from the landing shelf.
const CHANNELS = [
    { key: 'amazon', label: 'Amazon', cloth: '#7a6224' },
    { key: 'other', label: 'International', cloth: '#2b3a56' },
    { key: 'google', label: 'Google Play Books', cloth: '#2f4f45' },
    { key: 'direct', label: 'Direct Sales', cloth: '#6e2530' },
];

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

    const navLinks = [
        { label: 'Professional Requests', href: route('admin.professional.index') },
        { label: 'Manage Users', href: route('admin.users.index') },
        { label: 'Manage Admins', href: route('admin.admins.index') },
        { label: 'Support Tickets', href: route('admin.support.index') },
        { label: 'Challenge Videos', href: route('admin.challenge-settings.index') },
        { label: 'Certificates', href: route('admin.certificates.index') },
        { label: 'Publishing Inquiries', href: route('admin.publishing-inquiries.index') },
        { label: 'Book Studio Approvals', href: route('admin.blogs.manage') },
        { label: 'Presale Management', href: route('admin.presales.index') },
        { label: 'Challenge Enrollments', href: route('admin.challenge-enrollments.index') },
    ];

    return (
        <>
            <Head title="Admin Dashboard" />

            {/* MODALS */}
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

            <div className="min-h-screen bg-parchment">
                {/* Real-time new submission alert */}
                {newSubmissionAlert && (
                    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
                        <div className="bg-oxblood text-[#f7f3ea] px-6 py-3 rounded-md shadow-xl flex items-center gap-2.5 font-semibold text-sm border border-oxblood-night">
                            <span className="w-2 h-2 rounded-full bg-foil-light animate-pulse" />
                            New book submission received
                        </div>
                    </div>
                )}

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9">

                    {/* ═══ HEADER ═══ */}
                    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 mb-6 border-b border-linen">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-oxblood">The control desk</p>
                            <h1 className="text-[clamp(1.7rem,3vw,2.3rem)] leading-tight text-ink mt-1" style={SERIF}>Admin Dashboard</h1>
                            <p className="text-[13px] text-umber mt-1.5">Platform analytics — welcome back, {auth.user.name}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href={route('admin.books.create')}
                                className="px-5 py-2.5 text-[13px] font-semibold text-ink-soft border border-linen rounded-md hover:border-oxblood hover:text-oxblood transition-colors bg-paper"
                            >
                                + Publish New Book
                            </Link>
                            <Link
                                href={route('admin.approvals.index')}
                                className="relative px-6 py-2.5 text-[13px] font-bold text-[#f7f3ea] bg-oxblood hover:bg-oxblood-deep rounded-md transition-colors active:translate-y-px"
                            >
                                Approvals Queue
                                {liveStats.awaitingApproval > 0 && (
                                    <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 bg-amber-400 text-[#3a2c07] text-[11px] font-black rounded-full flex items-center justify-center shadow-md border border-amber-500/50" style={NUM}>
                                        {liveStats.awaitingApproval}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>

                    {/* ═══ MANAGEMENT TOOLBAR ═══ */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        {navLinks.slice(0, 4).map((l) => (
                            <Link key={l.label} href={l.href}
                                className="px-4 py-2 text-[12.5px] font-semibold text-ink-soft bg-paper border border-linen rounded-md hover:border-oxblood hover:text-oxblood transition-colors">
                                {l.label}
                            </Link>
                        ))}
                        {isMainAdmin && (
                            <button
                                onClick={() => setShowCouponModal(true)}
                                className="px-4 py-2 text-[12.5px] font-semibold text-ink-soft bg-paper border border-linen rounded-md hover:border-oxblood hover:text-oxblood transition-colors"
                            >
                                Manage Coupons
                            </button>
                        )}
                        {navLinks.slice(4).map((l) => (
                            <Link key={l.label} href={l.href}
                                className="px-4 py-2 text-[12.5px] font-semibold text-ink-soft bg-paper border border-linen rounded-md hover:border-oxblood hover:text-oxblood transition-colors">
                                {l.label}
                            </Link>
                        ))}
                    </div>

                    {/* ═══ THE PLATFORM LEDGER ═══ */}
                    <div className="bg-paper border border-linen rounded-lg mb-6 overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            {/* Left: the two big figures */}
                            <div className="px-8 py-8 flex flex-col justify-center gap-7 border-b lg:border-b-0 lg:border-r border-linen">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-umber mb-1.5">Total author payouts</p>
                                    <p className="text-[42px] leading-none text-ink" style={{ ...SERIF, ...NUM }}>
                                        ₹{stats.totalAuthorRevenue ? parseFloat(stats.totalAuthorRevenue).toLocaleString() : '0.00'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-umber mb-1.5">Total quantity sold</p>
                                    <p className="text-[42px] leading-none text-ink" style={{ ...SERIF, ...NUM }}>{stats.totalSales || 0}</p>
                                </div>
                            </div>

                            {/* Right: channel breakdown keyed by the four book cloths */}
                            <div className="px-8 py-8">
                                <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-umber mb-5">Sales by channel</p>
                                <div className="space-y-4">
                                    {CHANNELS.map((ch) => (
                                        <div key={ch.key} className="flex items-center justify-between gap-4 py-2 border-b border-vellum last:border-b-0">
                                            <span className="flex items-center gap-3 text-[14px] text-ink-soft">
                                                <span className="w-3 h-3 rounded-[2px]" style={{ background: ch.cloth }} />
                                                {ch.label}
                                            </span>
                                            <span className="text-[20px] text-ink" style={{ ...SERIF, ...NUM }}>
                                                {stats.breakdown?.[ch.key]?.quantity || 0}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ═══ STAT CARDS ═══ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-paper border border-linen rounded-lg p-5 hover:border-taupe-light transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-umber">Total Revenue</p>
                                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm" style={NUM}>
                                    +{stats.revenueGrowth}%
                                </span>
                            </div>
                            <p className="text-[28px] leading-none text-ink" style={{ ...SERIF, ...NUM }}>₹{stats.totalRevenue.toLocaleString()}</p>
                            <p className="text-[11px] text-taupe mt-2" style={NUM}>Commission: ₹{stats.platformCommission.toLocaleString()}</p>
                        </div>

                        <div className="relative bg-paper border border-linen rounded-lg p-5 hover:border-oxblood transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-umber">Total Books</p>
                                <span className="text-[11px] font-bold text-ink-soft bg-parchment border border-linen px-2 py-0.5 rounded-sm" style={NUM}>
                                    {stats.publishedBooks} published
                                </span>
                            </div>
                            <p className="text-[28px] leading-none text-ink" style={{ ...SERIF, ...NUM }}>{stats.totalBooks}</p>
                            <p className="text-[11px] text-taupe mt-2" style={NUM}>Pending: {stats.pendingBooks}</p>
                            <Link href={route('admin.books.index')} className="absolute inset-0 z-10 rounded-lg" aria-label="View all books"></Link>
                        </div>

                        <div className="bg-paper border border-linen rounded-lg p-5 hover:border-taupe-light transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-umber">Total Authors</p>
                                <span className="text-[11px] font-bold text-ink-soft bg-parchment border border-linen px-2 py-0.5 rounded-sm" style={NUM}>
                                    +{stats.newAuthorsThisMonth} this month
                                </span>
                            </div>
                            <p className="text-[28px] leading-none text-ink" style={{ ...SERIF, ...NUM }}>{stats.totalAuthors}</p>
                            <p className="text-[11px] text-taupe mt-2" style={NUM}>Active: {stats.activeAuthors}</p>
                        </div>

                        <div className="bg-paper border border-linen rounded-lg p-5 hover:border-taupe-light transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-umber">Total Sales</p>
                                <span className="text-[11px] font-bold text-ink-soft bg-parchment border border-linen px-2 py-0.5 rounded-sm" style={NUM}>
                                    {stats.salesToday} today
                                </span>
                            </div>
                            <p className="text-[28px] leading-none text-ink" style={{ ...SERIF, ...NUM }}>{stats.totalSales}</p>
                            <p className="text-[11px] text-taupe mt-2" style={NUM}>This month: {stats.salesThisMonth}</p>
                        </div>
                    </div>

                    {/* ═══ AI WRITING ACTIVITY ═══ */}
                    {aiWritingStats && (
                        <Panel
                            title="AI writing activity — platform-wide"
                            action={
                                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-sm" style={NUM}>
                                    {aiWritingStats.activeToday} active today
                                </span>
                            }
                            className="mb-6"
                        >
                            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-vellum">
                                <div className="p-5 text-center">
                                    <p className="text-[26px] text-ink" style={{ ...SERIF, ...NUM }}>{aiWritingStats.totalAiBooks}</p>
                                    <p className="text-[11px] text-umber mt-1 uppercase tracking-[.12em] font-semibold">AI Books</p>
                                </div>
                                <div className="p-5 text-center">
                                    <p className="text-[26px] text-oxblood" style={{ ...SERIF, ...NUM }}>{aiWritingStats.totalPagesGenerated.toLocaleString()}</p>
                                    <p className="text-[11px] text-umber mt-1 uppercase tracking-[.12em] font-semibold">Pages Generated</p>
                                </div>
                                <div className="p-5 text-center">
                                    <p className="text-[26px] text-emerald-800" style={{ ...SERIF, ...NUM }}>{aiWritingStats.activeToday}</p>
                                    <p className="text-[11px] text-umber mt-1 uppercase tracking-[.12em] font-semibold">Active Today</p>
                                </div>
                                <div className="p-5">
                                    <p className="text-[10px] text-umber font-semibold mb-2 uppercase tracking-[.14em]">Plan breakdown</p>
                                    <div className="space-y-1">
                                        {[['Saver', 'saver'], ['Standard', 'standard'], ['Pro', 'pro'], ['Enterprise', 'enterprise']].map(([label, key]) => (
                                            <div key={key} className="flex justify-between items-center">
                                                <span className="text-umber text-xs">{label}</span>
                                                <span className="text-ink text-sm font-bold" style={NUM}>{aiWritingStats.planBreakdown?.[key] || 0}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Panel>
                    )}

                    {/* ═══ LATEST PLATFORM ORDERS (SHIPPING) ═══ */}
                    <Panel
                        title="Latest platform orders — shipping required"
                        action={<span className="text-[11px] text-umber font-semibold uppercase tracking-[.12em]">Direct store sales</span>}
                        className="mb-6"
                    >
                        <div className="overflow-x-auto px-6 pb-5 pt-4">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-linen">
                                        <th className={`${TH} pl-1`}>Order ID</th>
                                        <th className={TH}>Customer</th>
                                        <th className={TH}>Book</th>
                                        <th className={TH}>Shipping Details</th>
                                        <th className={`${TH} text-right`}>Amount</th>
                                        <th className={`${TH} text-right`}>Status</th>
                                        <th className={`${TH} text-right pr-1`}>Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {latestPlatformOrders && latestPlatformOrders.length > 0 ? (
                                        latestPlatformOrders.map((order) => (
                                            <tr key={order.id} className="border-b border-vellum hover:bg-parchment/70 transition-colors">
                                                <td className="py-4 pl-1 font-mono text-xs text-ink-soft">{order.transaction_id.slice(-8)}</td>
                                                <td className="py-4 text-ink font-medium">{order.customer_name}</td>
                                                <td className="py-4 text-ink-soft truncate max-w-[200px]">{order.book_title}</td>
                                                <td className="py-4 text-umber text-xs min-w-[250px] max-w-[350px] leading-relaxed">
                                                    {order.pys_shipping_details ? (
                                                        <div className="bg-parchment p-2.5 rounded-md border border-linen">
                                                            <div className="font-bold text-ink mb-0.5">{order.pys_shipping_details.full_name}</div>
                                                            <div className="text-oxblood mb-1">{order.pys_shipping_details.phone} • {order.pys_shipping_details.email}</div>
                                                            <div className="whitespace-normal break-words text-ink-soft">
                                                                {order.pys_shipping_details.address}, {order.pys_shipping_details.city} - {order.pys_shipping_details.pincode}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="italic opacity-60">No shipping info</span>
                                                    )}
                                                </td>
                                                <td className="py-4 text-right font-bold text-ink" style={NUM}>₹{order.amount.toFixed(2)}</td>
                                                <td className="py-4 text-right"><StatusChip value={order.status} /></td>
                                                <td className="py-4 text-right pr-1">
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="px-3 py-1.5 bg-oxblood hover:bg-oxblood-deep text-[#f7f3ea] rounded-md text-xs font-bold transition-colors"
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="py-8 text-center text-umber text-sm">No recent store orders found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Panel>

                    {/* ═══ CHALLENGE ENROLLMENTS ═══ */}
                    <Panel
                        title="Recent challenge enrollments"
                        action={<span className="text-[11px] text-umber font-semibold uppercase tracking-[.12em]">Contest entries</span>}
                        className="mb-6"
                    >
                        <div className="overflow-x-auto px-6 pb-5 pt-4">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-linen">
                                        <th className={`${TH} pl-1`}>Date</th>
                                        <th className={TH}>Challenge Type</th>
                                        <th className={TH}>Participant</th>
                                        <th className={TH}>Contact</th>
                                        <th className={TH}>City</th>
                                        <th className={`${TH} text-right`}>Fee</th>
                                        <th className={`${TH} text-right pr-1`}>Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {challengeEnrollments && challengeEnrollments.length > 0 ? (
                                        challengeEnrollments.map((entry) => (
                                            <tr key={entry.id} className="border-b border-vellum hover:bg-parchment/70 transition-colors">
                                                <td className="py-4 pl-1 font-mono text-umber text-xs">{entry.date}</td>
                                                <td className="py-4">
                                                    <span className="bg-parchment border border-linen px-2 py-1 rounded-sm text-xs text-ink-soft font-semibold">{entry.type}</span>
                                                </td>
                                                <td className="py-4 text-ink font-medium">{entry.name}</td>
                                                <td className="py-4 text-umber text-xs">
                                                    <div>{entry.email}</div>
                                                    <div>{entry.mobile}</div>
                                                </td>
                                                <td className="py-4 text-ink-soft">{entry.city}</td>
                                                <td className="py-4 text-right font-bold text-ink" style={NUM}>₹{entry.fee}</td>
                                                <td className="py-4 text-right pr-1"><StatusChip value={entry.status} /></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="py-8 text-center text-umber text-sm">No enrollments yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Panel>

                    {/* ═══ CHARTS ROW ═══ */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <Panel
                            title="Revenue trend"
                            action={
                                <select
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value)}
                                    className="bg-white border border-linen rounded-md px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-oxblood/25 focus:border-oxblood"
                                >
                                    <option value="7days">Last 7 Days</option>
                                    <option value="30days">Last 30 Days</option>
                                    <option value="6months">Last 6 Months</option>
                                </select>
                            }
                        >
                            <div className="p-6">
                                <div className="flex items-end gap-3 h-48 border-b border-linen">
                                    {monthlyRevenue.map((month, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                                            <div className="text-xs text-ink-soft font-bold mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity" style={NUM}>
                                                ₹{month.revenue.toLocaleString()}
                                            </div>
                                            <div
                                                className="w-full max-w-[44px] bg-oxblood group-hover:bg-oxblood-deep rounded-t-sm transition-colors"
                                                style={{ height: `${(month.revenue / Math.max(...monthlyRevenue.map(m => m.revenue), 1)) * 100}%`, minHeight: '5px' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3 pt-2">
                                    {monthlyRevenue.map((month, i) => (
                                        <span key={i} className="flex-1 text-center text-[10px] text-umber uppercase font-semibold tracking-[.12em]">{month.month}</span>
                                    ))}
                                </div>
                            </div>
                        </Panel>

                        <Panel title="Top performing books">
                            <div className="p-4 space-y-1">
                                {topBooks.map((book, index) => (
                                    <div key={book.id} className="flex items-center gap-4 px-3 py-3 rounded-md hover:bg-parchment/80 transition-colors border-b border-vellum last:border-b-0">
                                        <span className="shrink-0 w-7 text-[18px] text-foil" style={SERIF}>
                                            {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][index] || index + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-[15px] text-ink truncate" style={SERIF}>{book.title}</h4>
                                            <p className="text-umber text-xs">{book.author_name}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-ink font-bold text-sm" style={NUM}>₹{book.total_revenue.toLocaleString()}</p>
                                            <p className="text-umber text-xs" style={NUM}>{book.sales_count} sales</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    </div>

                    {/* ═══ RECENT ACTIVITY ═══ */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Panel
                            title="Recent books"
                            action={
                                <Link href={route('admin.books.index')} className="text-xs text-oxblood hover:underline underline-offset-4 font-bold">
                                    View all →
                                </Link>
                            }
                        >
                            <div className="px-4 py-2">
                                {recentBooks.map(book => (
                                    <Link
                                        key={book.id}
                                        href={route('admin.books.show', book.id)}
                                        className="flex items-center gap-3 px-3 py-3.5 rounded-md hover:bg-parchment/80 transition-colors border-b border-vellum last:border-b-0"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-[15px] text-ink truncate" style={SERIF}>{book.title}</h4>
                                            <p className="text-umber text-xs">{book.author_name}</p>
                                        </div>
                                        <StatusChip value={book.status} />
                                    </Link>
                                ))}
                            </div>
                        </Panel>

                        <Panel
                            title="Recent transactions"
                            action={<span className="text-[11px] text-umber font-semibold uppercase tracking-[.12em]">Your sales</span>}
                        >
                            <div className="px-4 py-2">
                                {recentTransactions && recentTransactions.length > 0 ? (
                                    recentTransactions.map(transaction => (
                                        <div key={transaction.id} className="flex items-center gap-3 px-3 py-3.5 rounded-md hover:bg-parchment/80 transition-colors border-b border-vellum last:border-b-0">
                                            <span className="shrink-0 w-3 h-3 rounded-[2px]"
                                                style={{ background: (CHANNELS.find(c => c.key === transaction.sales_channel) || CHANNELS[3]).cloth }}
                                                title={transaction.sales_channel || 'direct'} />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-[15px] text-ink truncate" style={SERIF}>{transaction.book_title}</h4>
                                                <p className="text-umber text-xs" style={NUM}>{new Date(transaction.created_at).toLocaleDateString()} • {transaction.quantity || 1} copies</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-ink font-bold text-sm" style={NUM}>₹{parseFloat(transaction.amount || 0).toLocaleString()}</p>
                                                <StatusChip value={transaction.payment_status} />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-umber text-sm">No transactions yet</div>
                                )}
                            </div>
                        </Panel>
                    </div>

                    {/* ═══ PENDING BOOKS FOR APPROVAL ═══ */}
                    {displayPendingBooks && displayPendingBooks.length > 0 && (
                        <div className="mt-6 bg-paper border border-amber-400 rounded-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-amber-300 bg-amber-50/60 flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-[11px] font-semibold uppercase tracking-[.18em] text-amber-900">Pending books for approval</h3>
                                    <p className="text-xs text-umber mt-0.5">Books submitted by users awaiting your review</p>
                                </div>
                                <span className="bg-amber-400 text-[#3a2c07] px-3 py-1 rounded-sm text-sm font-bold" style={NUM}>
                                    {displayPendingBooks.length} pending
                                </span>
                            </div>
                            <div className="px-4 py-2">
                                {displayPendingBooks.map(book => (
                                    <Link
                                        key={book.id}
                                        href={route('admin.books.show', book.id)}
                                        className="flex items-center gap-4 px-3 py-4 rounded-md hover:bg-parchment/80 transition-colors group border-b border-vellum last:border-b-0"
                                    >
                                        <div className="shrink-0 h-14 w-11 bg-oxblood rounded-sm flex items-center justify-center text-[#f7f3ea] text-lg shadow-sm" style={SERIF}>
                                            {book.title.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-[16px] text-ink truncate" style={SERIF}>{book.title}</h4>
                                            <p className="text-umber text-sm">by {book.author_name}</p>
                                            {book.user && (
                                                <p className="text-taupe text-xs mt-0.5">
                                                    Submitted by: {book.user.name} ({book.user.email})
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1.5 items-end shrink-0">
                                            <div className="flex gap-1.5">
                                                {[
                                                    ['ISBN', book.has_isbn],
                                                    ['Price', book.has_price],
                                                    ['Cover', book.has_cover],
                                                ].map(([label, ok]) => (
                                                    <span key={label} className={`px-2 py-0.5 rounded-sm text-[10px] font-bold border ${ok ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                        {ok ? '✓' : '✗'} {label}
                                                    </span>
                                                ))}
                                            </div>
                                            <span className="text-taupe text-xs" style={NUM}>
                                                {new Date(book.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <span className="shrink-0 text-oxblood font-bold text-sm group-hover:translate-x-1 transition-transform">
                                            Review →
                                        </span>
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
