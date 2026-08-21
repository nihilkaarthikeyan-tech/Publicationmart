import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Dashboard({ auth, books, stats, monthlyRevenueData = [], recentTransactions = [], referrals = [], smartWriterSessions = [], activeDrafts = [], activityFeed = [], planUsage = [] }) {
    const [showReferralModal, setShowReferralModal] = useState(false);
    const [activeAssetTab, setActiveAssetTab] = useState('covers');
    const [showAssetsDrawer, setShowAssetsDrawer] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');

    const referralLink = `${auth.app_url || window.location.origin}?REFERRALCODE=${auth.user.referral_code}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(referralLink).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    // Alert Priority Logic
    const adminFeedbackBook = books.find(b => b.admin_feedback && b.status === 'draft');
    const isNewUser = books.length === 0;
    const activeAlert = adminFeedbackBook ? 'admin' : (isNewUser ? 'welcome' : 'referral');

    return (
        <div className="min-h-screen font-sans" style={{ background: 'linear-gradient(135deg, #f0e6ff 0%, #e8eaff 25%, #f5f0ff 50%, #eef2ff 75%, #f8f5ff 100%)' }}>
            <Head title="Author Dashboard" />

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* ═══ WELCOME HEADER ═══ */}
                <div className="rounded-3xl p-6 sm:p-8" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 40%, #5b21b6 100%)', boxShadow: '0 10px 40px -10px rgba(124, 58, 237, 0.4)' }}>
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg shrink-0">
                                    <span className="text-2xl">✨</span>
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                                        Welcome, {auth.user.name}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-200 text-xs font-bold uppercase tracking-wider border border-emerald-400/30 flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                            System Active
                                        </span>
                                        <span className="px-3 py-1 rounded-full bg-white/15 text-white/90 text-xs font-bold border border-white/20">
                                            {stats?.activePlan || 'Creator Bundle'}
                                        </span>
                                        <span className="px-3 py-1 rounded-full bg-white/15 text-white/90 text-xs font-bold border border-white/20">
                                            {stats?.pagesRemaining || 0} pages left
                                        </span>
                                    </div>

                                    {/* Page Quota Bar */}
                                    <div className="mt-4 max-w-md">
                                        <div className="flex justify-between text-xs mb-1.5">
                                            <span className="text-white/60 font-medium">Page Quota Usage</span>
                                            <span className="font-bold text-white">
                                                {stats?.pagesUsed || 0} / {(stats?.pagesUsed || 0) + (stats?.pagesRemaining || 0)}
                                            </span>
                                        </div>
                                        <div className="h-2.5 bg-white/15 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-white/80 to-emerald-300 rounded-full transition-all duration-700"
                                                style={{ width: `${Math.min(100, ((stats?.pagesUsed || 0) / Math.max(1, (stats?.pagesUsed || 0) + (stats?.pagesRemaining || 0))) * 100)}%` }}>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <Link href={route('books.create')}
                                className="group px-8 py-4 bg-white text-violet-700 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden text-center">
                                <span className="flex items-center justify-center gap-2 text-sm whitespace-nowrap">
                                    <span className="text-xl">+</span> Create New Book
                                </span>
                            </Link>
                            <Link href={route('book-store.index')}
                                className="px-8 py-4 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 text-center backdrop-blur-sm shadow-lg">
                                <span className="flex items-center justify-center gap-2 text-sm whitespace-nowrap">
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                    Store
                                </span>
                            </Link>
                            <Link href={route('support.index')}
                                className="px-8 py-4 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 text-center backdrop-blur-sm shadow-lg">
                                <span className="flex items-center justify-center gap-2 text-sm whitespace-nowrap">
                                    <svg className="w-4 h-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    Support
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ═══ SMART ALERTS ═══ */}
                {activeAlert === 'admin' && adminFeedbackBook && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm animate-slide-in">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 rounded-xl shrink-0">
                                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-red-800 flex items-center gap-2">
                                    ⚠️ Action Required: Revision Requested
                                </h3>
                                <p className="text-red-600 text-sm mt-1">Admin feedback on "{adminFeedbackBook.title}"</p>
                                <p className="text-red-500 text-xs mt-2 italic">"{adminFeedbackBook.admin_feedback}"</p>
                            </div>
                        </div>
                        <Link href={route('books.details', adminFeedbackBook.id)}
                            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-all shadow-md whitespace-nowrap">
                            Fix & Resubmit →
                        </Link>
                    </div>
                )}

                {activeAlert === 'welcome' && isNewUser && (
                    <div className="bg-white rounded-2xl border border-violet-100 p-6 shadow-sm animate-slide-in">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                🚀 Start Your Publishing Journey
                            </h3>
                            <p className="text-gray-500">Transform your ideas into published books in 3 simple steps</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { icon: '✍️', title: '1. Write', desc: 'Use AI or upload your manuscript', color: 'bg-violet-50 border-violet-100' },
                                { icon: '🎨', title: '2. Design', desc: 'Create stunning covers & format', color: 'bg-purple-50 border-purple-100' },
                                { icon: '📚', title: '3. Publish', desc: 'Distribute & start earning', color: 'bg-pink-50 border-pink-100' },
                            ].map((step, i) => (
                                <div key={i} className={`p-4 rounded-xl border text-center ${step.color}`}>
                                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white flex items-center justify-center text-2xl shadow-sm">{step.icon}</div>
                                    <h4 className="font-bold text-gray-800 mb-1">{step.title}</h4>
                                    <p className="text-xs text-gray-500">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 text-center">
                            <Link href={route('books.create')}
                                className="inline-block px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105">
                                Create Your First Book →
                            </Link>
                        </div>
                    </div>
                )}

                {activeAlert === 'referral' && (
                    <div className="rounded-2xl overflow-hidden shadow-sm animate-slide-in" style={{ background: 'linear-gradient(135deg, #f5f3ff, #ede9fe, #faf5ff)' }}>
                        <div className="p-5 flex items-center justify-between gap-6 border border-violet-200 rounded-2xl">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shrink-0">
                                    <span className="text-2xl">🎁</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-bold text-gray-800 mb-1">Refer & Earn up to 10% Commission</h3>
                                    <p className="text-xs text-gray-500">Invite friends and earn rewards on their purchases</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Your Balance</p>
                                    <p className="text-2xl font-bold text-violet-700">₹{auth.user.referral_balance || 0}</p>
                                </div>
                                <button onClick={() => setShowReferralModal(true)}
                                    className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl shadow-md transition-all transform hover:scale-105 whitespace-nowrap">
                                    Get Link →
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ STAT CARDS ═══ */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <StatCard label="Total Sales" value={`₹${stats?.totalRevenue || 0}`} icon="💰" color="violet" />
                    <StatCard label="Net Income" value={`₹${stats?.monthlyRevenue || 0}`} subLabel="This Month" icon="📈" color="emerald" />
                    <StatCard label="Wallet Balance" value={`₹${Number(stats?.walletBalance || 0).toFixed(2)}`} icon="👛" color="blue" />
                    <StatCard label="Books Sold" value={stats?.totalSales || 0} icon="📚" color="blue" />
                    <StatCard label="Pages Used" value={stats?.pagesUsedThisMonth || stats?.pagesUsed || 0} subLabel="This Month" icon="📄" color="amber" />
                    <StatCard label="Pages Left" value={stats?.pagesRemaining || 0} icon="🔋" color="teal" />
                </div>

                {/* ═══ MAIN LAYOUT ═══ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* CONTINUE WORKING */}
                        <Card title="Continue Working"
                            action={<Link href={route('books.create')} className="text-xs text-violet-600 hover:text-violet-700 font-bold">See All →</Link>}>
                            <div className="divide-y divide-gray-100">
                                {([...(smartWriterSessions || []), ...(activeDrafts || [])])
                                    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                                    .slice(0, 4)
                                    .map((proj, idx) => (
                                        <div key={idx} className="group p-4 hover:bg-violet-50/50 transition-all duration-300 flex items-center gap-4 rounded-xl">
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 border border-violet-200/50 flex items-center justify-center shrink-0 overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
                                                {proj.cover_design_path ?
                                                    <img src={`/storage/${proj.cover_design_path}`} className="w-full h-full object-cover" alt={proj.title} /> :
                                                    <span className="text-2xl">📝</span>
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-800 truncate">{proj.title || 'Untitled Project'}</h4>
                                                <div className="flex items-center gap-2 text-xs mt-1.5">
                                                    {proj.session_token ? (
                                                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold border border-emerald-200 flex items-center gap-1">
                                                            ✓ Smart Writer ({proj.plan_type})
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 font-medium border border-violet-200">{proj.plan_type || 'Draft'}</span>
                                                    )}
                                                    {proj.estimated_pages > 0 && (
                                                        <span className="text-gray-400">{proj.estimated_pages} pages</span>
                                                    )}
                                                    <span className="text-gray-300">•</span>
                                                    <span className="text-gray-400">Updated {proj.updated_at_human || 'recently'}</span>
                                                </div>
                                                {/* Progress Bar */}
                                                {proj.max_pages > 0 && (
                                                    <div className="mt-2">
                                                        <div className="flex justify-between text-[10px] mb-1">
                                                            <span className="text-gray-400">Progress</span>
                                                            <span className="text-gray-500">{proj.estimated_pages}/{proj.max_pages} pages</span>
                                                        </div>
                                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all"
                                                                style={{ width: `${Math.min(100, (proj.estimated_pages / proj.max_pages) * 100)}%` }}></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                                                <Link
                                                    href={proj.session_token ? route('guest-writer.studio', proj.session_token) : route('books.details', proj.id)}
                                                    className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl shadow-md transform hover:scale-105 transition-all whitespace-nowrap">
                                                    Resume →
                                                </Link>
                                                {!proj.session_token && (
                                                    <button
                                                        onClick={() => {
                                                            if (confirm(`Are you sure you want to delete "${proj.title || 'Untitled Project'}"? This action cannot be undone.`)) {
                                                                router.delete(route('books.destroy', proj.id), {
                                                                    preserveScroll: true,
                                                                });
                                                            }
                                                        }}
                                                        className="p-2.5 bg-red-50 hover:bg-red-500 text-red-400 hover:text-white rounded-xl border border-red-200 hover:border-red-500 transition-all transform hover:scale-105"
                                                        title="Delete Project">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                {([...(smartWriterSessions || []), ...(activeDrafts || [])].length === 0) && (
                                    <div className="p-12 text-center">
                                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-violet-50 flex items-center justify-center">
                                            <span className="text-4xl opacity-50">📚</span>
                                        </div>
                                        <p className="text-gray-400 mb-3">No active projects</p>
                                        <Link href={route('books.create')} className="inline-block px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-lg transition-all">
                                            Start Writing →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* PLAN USAGE TRACKER */}
                        {planUsage.length > 0 && (
                            <Card title="📊 My Plans & Usage">
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {planUsage.map((plan) => (
                                        <div key={plan.id} className="relative rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all duration-300 group overflow-hidden"
                                            style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 50%, #ede9fe 100%)' }}>
                                            {/* Status Badge */}
                                            <div className="absolute top-4 right-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${plan.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                                                    plan.status === 'completed' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                                                        'bg-red-50 text-red-500 border border-red-200'
                                                    }`}>
                                                    {plan.status}
                                                </span>
                                            </div>

                                            {/* Tool & Plan Name */}
                                            <div className="mb-4">
                                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-violet-100 text-violet-600 mb-2 inline-block">
                                                    {plan.tool}
                                                </span>
                                                <h4 className="text-lg font-bold text-gray-800 mt-1">{plan.title}</h4>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {plan.plan_name} Plan {plan.amount_paid > 0 && `• ₹${plan.amount_paid}`}
                                                </p>
                                            </div>

                                            {/* Usage Ring */}
                                            <div className="flex items-center gap-5 mb-4">
                                                <div className="relative w-16 h-16 shrink-0">
                                                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                                                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                                                        <circle cx="18" cy="18" r="15.915" fill="none"
                                                            stroke={plan.status === 'active' ? '#7c3aed' : plan.status === 'completed' ? '#3b82f6' : '#ef4444'}
                                                            strokeWidth="3"
                                                            strokeDasharray={`${plan.usage_percent} ${100 - plan.usage_percent}`}
                                                            strokeLinecap="round" />
                                                    </svg>
                                                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-700">
                                                        {plan.usage_percent}%
                                                    </span>
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-gray-500">Pages</span>
                                                        <span className="font-bold text-gray-700">{plan.pages_used} / {plan.max_pages}</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full transition-all duration-500"
                                                            style={{
                                                                width: `${plan.usage_percent}%`,
                                                                background: plan.status === 'active' ? 'linear-gradient(90deg, #7c3aed, #a855f7)' :
                                                                    plan.status === 'completed' ? 'linear-gradient(90deg, #3b82f6, #60a5fa)' : '#ef4444'
                                                            }}></div>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-gray-500">Images</span>
                                                        <span className="font-bold text-gray-700">{plan.image_credits_used} / {plan.image_credits_limit}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div className="flex items-center justify-between text-[10px] text-gray-400 pt-3 border-t border-gray-100">
                                                <span>Created {new Date(plan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                {plan.expires_at && (
                                                    <span className={plan.status === 'expired' ? 'text-red-400' : ''}>
                                                        Expires {new Date(plan.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* REVENUE TRENDS */}
                        <Card title="Revenue Trends (Last 6 Months)">
                            <div className="p-6">
                                <div className="h-56 flex items-end justify-between gap-3">
                                    {monthlyRevenueData.map((data, index) => {
                                        const maxRevenue = Math.max(...monthlyRevenueData.map(d => d.revenue)) || 1;
                                        const height = (data.revenue / maxRevenue) * 100;
                                        return (
                                            <div key={index} className="flex-1 flex flex-col items-center gap-3 group cursor-pointer">
                                                <div className="relative w-full flex flex-col items-center">
                                                    <span className="text-xs text-gray-500 font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        ₹{data.revenue}
                                                    </span>
                                                    <div className="w-full rounded-t-xl shadow-sm group-hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                                                        style={{
                                                            height: `${Math.max(height, 5)}%`,
                                                            minHeight: '12px',
                                                            background: 'linear-gradient(to top, #7c3aed, #a78bfa, #c4b5fd)'
                                                        }}>
                                                    </div>
                                                </div>
                                                <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">{data.month}</span>
                                            </div>
                                        );
                                    })}
                                    {monthlyRevenueData.length === 0 && (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                            <div className="text-center">
                                                <span className="text-3xl opacity-30 block mb-2">📈</span>
                                                No sales data yet
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* RECENT TRANSACTIONS */}
                        <Card title="Recent Transactions (Last 5)">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider font-bold">
                                        <tr>
                                            <th className="px-6 py-4">Book Title</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Channel</th>
                                            <th className="px-6 py-4 text-right">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {recentTransactions.map((txn) => (
                                            <tr key={txn.id} className="hover:bg-violet-50/30 transition-all group">
                                                <td className="px-6 py-4 text-gray-800 font-medium">{txn.book_title}</td>
                                                <td className="px-6 py-4 text-emerald-600 font-bold">₹{txn.amount}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 rounded-full bg-violet-50 text-violet-600 text-xs font-medium border border-violet-100">
                                                        {txn.sales_channel || 'Direct'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-gray-400 text-xs">
                                                    {new Date(txn.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                            </tr>
                                        ))}
                                        {recentTransactions.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="p-12 text-center">
                                                    <span className="text-gray-400 text-sm">No transactions yet</span>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-6">

                        {/* ASSETS PANEL */}
                        <Card>
                            <div className="flex border-b border-gray-100">
                                <AssetTab label="🎨 Covers" active={activeAssetTab === 'covers'} onClick={() => setActiveAssetTab('covers')} />
                                <AssetTab label="📝 Formatted" active={activeAssetTab === 'formatting'} onClick={() => setActiveAssetTab('formatting')} />
                                <AssetTab label="📋 Drafts" active={activeAssetTab === 'drafts'} onClick={() => setActiveAssetTab('drafts')} />
                            </div>

                            <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {activeAssetTab === 'covers' && <CoversGrid books={books} compact />}
                                {activeAssetTab === 'formatting' && <FormattedList books={books} compact />}
                                {activeAssetTab === 'drafts' && <DraftsList books={books} compact />}
                            </div>

                            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                                <button onClick={() => setShowAssetsDrawer(true)}
                                    className="w-full py-2 text-center text-violet-600 hover:text-violet-700 text-sm font-bold transition-all">
                                    View All Assets →
                                </button>
                            </div>
                        </Card>

                        {/* ACTIVITY FEED */}
                        <Card title="🔔 Activity Feed">
                            <div className="p-4 space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                                {activityFeed.slice(0, 6).map((item, i) => (
                                    <div key={i} className="flex gap-3 items-start p-3 rounded-xl hover:bg-violet-50/50 transition-all">
                                        <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm ${item.type === 'sale' ? 'bg-emerald-50 text-emerald-500' : 'bg-violet-50 text-violet-500'
                                            }`}>
                                            {item.icon === 'currency-rupee' && '₹'}
                                            {item.icon === 'book' && '📖'}
                                            {item.icon === 'sparkles' && '✨'}
                                            {item.icon === 'exclamation' && '⚠️'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-800 font-medium truncate">{item.title}</p>
                                            <p className="text-xs text-gray-400 truncate mt-0.5">{item.description}</p>
                                            <p className="text-[10px] text-gray-300 mt-1">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                ))}
                                {activityFeed.length === 0 && (
                                    <p className="text-xs text-gray-400 text-center py-8 italic">No recent activity</p>
                                )}
                            </div>
                        </Card>

                    </div>
                </div>

            </div>

            {/* ═══ REFERRAL MODAL ═══ */}
            {showReferralModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowReferralModal(false)}>
                    <div className="relative bg-white p-8 rounded-3xl max-w-2xl w-full border border-gray-200 shadow-2xl transform animate-scale-in max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowReferralModal(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all z-10">✕</button>

                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <span className="text-4xl">🎁</span>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Refer & Earn</h2>
                            <p className="text-gray-500 text-sm">Share your link and earn 10% commission on every purchase</p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <div className="bg-violet-50 p-4 rounded-xl border border-violet-100 text-center">
                                <div className="text-xs text-violet-400 uppercase tracking-wider font-bold mb-2">Total Referrals</div>
                                <div className="text-3xl font-bold text-violet-700">{referrals.length}</div>
                            </div>
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                                <div className="text-xs text-emerald-400 uppercase tracking-wider font-bold mb-2">Total Earned</div>
                                <div className="text-3xl font-bold text-emerald-600">₹{auth.user.referral_balance || 0}</div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                                <div className="text-xs text-blue-400 uppercase tracking-wider font-bold mb-2">Commission</div>
                                <div className="text-3xl font-bold text-blue-600">10%</div>
                            </div>
                        </div>

                        {/* Referral Link */}
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Referral Link</label>
                            <div className="bg-gray-50 p-4 rounded-xl flex gap-2 border border-gray-200">
                                <code className="flex-1 text-sm text-gray-600 font-mono overflow-x-auto whitespace-nowrap custom-scrollbar py-1">{referralLink}</code>
                                <button onClick={handleCopyLink} className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-all shrink-0 shadow-md">
                                    {copySuccess || '📋 Copy'}
                                </button>
                            </div>
                        </div>

                        {/* How It Works */}
                        <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <span className="text-lg">💡</span> How It Works
                            </h3>
                            <div className="space-y-2 text-xs text-gray-600">
                                {['Share your unique referral link with friends', 'They sign up using your link and make a purchase', 'You earn 10% commission on their purchase amount', 'Earnings are credited to your referral balance instantly'].map((step, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <span className="text-violet-500 shrink-0">{i + 1}.</span>
                                        <span>{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Referral List */}
                        {referrals.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <span className="text-lg">👥</span> Your Referrals
                                </h3>
                                <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                        {referrals.map((ref, i) => (
                                            <div key={ref.id} className={`p-3 flex items-center justify-between gap-3 ${i !== 0 ? 'border-t border-gray-100' : ''}`}>
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="w-8 h-8 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center shrink-0">
                                                        <span className="text-xs font-bold text-violet-600">{ref.name.charAt(0).toUpperCase()}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-800 truncate">{ref.name}</p>
                                                        <p className="text-xs text-gray-400 truncate">{ref.email}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-400">{new Date(ref.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                                    <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase mt-1 border border-emerald-200">{ref.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {referrals.length === 0 && (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                                    <span className="text-3xl opacity-50">👥</span>
                                </div>
                                <p className="text-gray-500 text-sm">No referrals yet</p>
                                <p className="text-gray-400 text-xs mt-1">Share your link to start earning!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══ ASSETS DRAWER ═══ */}
            {showAssetsDrawer && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowAssetsDrawer(false)}>
                    <div className="h-full overflow-y-auto bg-white/95 backdrop-blur-xl" onClick={e => e.stopPropagation()}>
                        <div className="max-w-7xl mx-auto p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-bold text-gray-800">
                                    My Assets Library
                                </h2>
                                <button onClick={() => setShowAssetsDrawer(false)}
                                    className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all">
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        🎨 Cover Designs
                                    </h3>
                                    <CoversGrid books={books} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        📝 Formatted Books
                                    </h3>
                                    <FormattedList books={books} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        📋 All Drafts
                                    </h3>
                                    <DraftsList books={books} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(124, 58, 237, 0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(124, 58, 237, 0.2); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(124, 58, 237, 0.4); }
                
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes slide-in { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
                .animate-scale-in { animation: scale-in 0.3s ease-out; }
                .animate-slide-in { animation: slide-in 0.4s ease-out; }
            `}</style>
        </div>
    );
}

// ═══ COMPONENTS ═══

// Stat Card
function StatCard({ label, value, subLabel, icon, color }) {
    const colors = {
        violet: { bg: 'bg-violet-50', border: 'border-violet-100', accent: 'bg-violet-100 text-violet-600' },
        emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', accent: 'bg-emerald-100 text-emerald-600' },
        blue: { bg: 'bg-blue-50', border: 'border-blue-100', accent: 'bg-blue-100 text-blue-600' },
        amber: { bg: 'bg-amber-50', border: 'border-amber-100', accent: 'bg-amber-100 text-amber-600' },
        teal: { bg: 'bg-teal-50', border: 'border-teal-100', accent: 'bg-teal-100 text-teal-600' },
    };
    const c = colors[color] || colors.violet;

    return (
        <div className={`group ${c.bg} border ${c.border} rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer`}>
            <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
                <div className={`w-10 h-10 rounded-xl ${c.accent} flex items-center justify-center text-xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500`}>
                    {icon}
                </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">{value}</p>
            {subLabel && <p className="text-xs text-gray-400">{subLabel}</p>}
        </div>
    );
}

// Card Container
function Card({ title, action, children }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            {title && (
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
                    {action}
                </div>
            )}
            {children}
        </div>
    );
}

// Asset Tab
function AssetTab({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 py-3 px-4 text-xs font-bold transition-all duration-300 ${active
                ? 'text-violet-700 bg-violet-50 border-b-2 border-violet-500'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}>
            {label}
        </button>
    );
}

// Empty State
const EmptyState = ({ msg }) => (
    <div className="h-32 flex flex-col items-center justify-center text-gray-400">
        <div className="w-14 h-14 mb-2 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-2xl opacity-30">📂</span>
        </div>
        <span className="text-xs">{msg}</span>
    </div>
);

// Covers Grid — Shows Front & Back from the full spread image
const CoversGrid = ({ books, compact }) => (
    <div className={`${compact ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}`}>
        {books.filter(b => b.cover_design_path).length > 0 ? books.filter(b => b.cover_design_path).map(book => (
            <div key={book.id} className="group">
                <p className="text-sm font-bold text-gray-700 truncate mb-2" title={book.title}>{book.title}</p>
                <div className="flex gap-2">
                    {/* Front Cover (right ~48% of image) */}
                    <div className="flex-1 flex flex-col items-center">
                        <div className="aspect-[2/3] w-full bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200 hover:border-violet-300 transition-all transform hover:scale-105 hover:shadow-lg">
                            <img
                                src={`/storage/${book.cover_design_path}`}
                                className="w-[208%] h-full object-cover"
                                style={{ objectPosition: 'right center' }}
                                alt={`${book.title} - Front`}
                            />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1.5">Front</span>
                    </div>
                    {/* Back Cover (left ~48% of image) */}
                    <div className="flex-1 flex flex-col items-center">
                        <div className="aspect-[2/3] w-full bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200 hover:border-violet-300 transition-all transform hover:scale-105 hover:shadow-lg">
                            <img
                                src={`/storage/${book.cover_design_path}`}
                                className="w-[208%] h-full object-cover"
                                style={{ objectPosition: 'left center' }}
                                alt={`${book.title} - Back`}
                            />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1.5">Back</span>
                    </div>
                </div>
                {/* Download Button */}
                <a href={`/storage/${book.cover_design_path}`} download
                    className="mt-2 block w-full py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg text-center transition-all shadow-sm">
                    ⬇ Download Full Cover
                </a>
            </div>
        )) : <div className="col-span-full"><EmptyState msg="No covers designed yet" /></div>}
    </div>
);

// Formatted List
const FormattedList = ({ books, compact }) => (
    <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-3`}>
        {books.filter(b => b.formatting_data || b.interior_file).length > 0 ? books.filter(b => b.formatting_data || b.interior_file).map(book => (
            <div key={book.id} className="group p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-violet-200 transition-all hover:shadow-md">
                <div className="flex items-start justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-violet-50 text-violet-600 border border-violet-100">Formatted</span>
                    {book.interior_file && (
                        <a href={`/storage/${book.interior_file}`} className="w-8 h-8 flex items-center justify-center bg-violet-50 text-violet-500 rounded-lg hover:bg-violet-600 hover:text-white transition-all border border-violet-100">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </a>
                    )}
                </div>
                <p className="text-sm font-bold text-gray-800 truncate mb-2" title={book.title}>{book.title}</p>
                <p className="text-xs text-gray-400 mb-3">{book.num_pages || '?'} pages</p>
                <Link href={route('books.format', book.id)} className="block w-full text-center py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-all">
                    Open Editor
                </Link>
            </div>
        )) : <div className="col-span-full"><EmptyState msg="No formatted books yet" /></div>}
    </div>
);

// Drafts List
const DraftsList = ({ books, compact }) => (
    <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-3`}>
        {books.filter(b => b.step_completed < 5).length > 0 ? books.filter(b => b.step_completed < 5).map(book => (
            <div key={book.id} className="group p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-violet-200 transition-all hover:shadow-md">
                <div className="flex items-start justify-between mb-2">
                    <span className="px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-amber-50 text-amber-600 border border-amber-200">Draft</span>
                </div>
                <p className="text-sm font-bold text-gray-800 truncate mb-2" title={book.title}>{book.title}</p>
                <p className="text-xs text-gray-400 mb-3">Updated {new Date(book.updated_at).toLocaleDateString()}</p>
                <Link href={route('books.details', book.id)} className="block w-full text-center py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-all">
                    Continue →
                </Link>
            </div>
        )) : <div className="col-span-full"><EmptyState msg="No drafts in progress" /></div>}
    </div>
);
