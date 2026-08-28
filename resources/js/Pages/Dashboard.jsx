import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

/**
 * Author dashboard, set as the author's desk ledger.
 *
 * Every backend-driven feature of the previous dashboard is preserved:
 * alert priority (admin feedback > new user > referral), the six stats with
 * their exact value mapping, Continue Working (smart-writer sessions merged
 * with drafts, resume/delete), plan usage rings, the 6-month revenue chart,
 * transactions, the assets tabs with the front/back cover crop, the activity
 * feed, the referral modal with clipboard copy, and the assets drawer.
 */

const SERIF = { fontFamily: "'EB Garamond', Georgia, serif" };
const RUN = 'text-[11px] font-semibold uppercase tracking-[.18em] text-umber';

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

    const quotaTotal = (stats?.pagesUsed || 0) + (stats?.pagesRemaining || 0);
    const quotaPct = Math.min(100, ((stats?.pagesUsed || 0) / Math.max(1, quotaTotal)) * 100);

    return (
        <div className="min-h-screen font-sans" style={{ background: '#f0ece3' }}>
            <Head title="Author Dashboard" />

            <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

                {/* ═══ MASTHEAD — the cloth band across the desk ═══ */}
                <div className="rounded-xl overflow-hidden border border-oxblood-night"
                    style={{ background: 'linear-gradient(120deg, #6e2530 0%, #5a1e27 60%, #4d1a22 100%)', boxShadow: '0 14px 34px -14px rgba(77,26,34,.45)' }}>
                    <div className="px-7 py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-foil-light">The author's desk</p>
                            <h1 className="text-[clamp(1.7rem,3vw,2.3rem)] leading-tight text-[#f7f3ea] mt-1.5" style={SERIF}>
                                Welcome, {auth.user.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-[12.5px] text-cream/75">
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    System active
                                </span>
                                <span className="text-cream/30">·</span>
                                <span>{stats?.activePlan || 'Creator Bundle'}</span>
                                <span className="text-cream/30">·</span>
                                <span className="inline-flex items-center gap-2.5">
                                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                                        {stats?.pagesUsed || 0} / {quotaTotal} pages
                                    </span>
                                    <span className="inline-block w-28 h-1.5 bg-white/15 rounded-full overflow-hidden align-middle">
                                        <span className="block h-full rounded-full bg-foil-light transition-all duration-700" style={{ width: `${quotaPct}%` }} />
                                    </span>
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                            <Link href={route('book-store.index')}
                                className="px-5 py-2.5 text-[13px] font-semibold text-cream/90 border border-white/25 rounded-md hover:bg-white/10 hover:border-white/40 transition-colors">
                                Book Store
                            </Link>
                            <Link href={route('support.index')}
                                className="px-5 py-2.5 text-[13px] font-semibold text-cream/90 border border-white/25 rounded-md hover:bg-white/10 hover:border-white/40 transition-colors">
                                Support
                            </Link>
                            <Link href={route('books.create')}
                                className="px-6 py-2.5 text-[13px] font-bold text-oxblood-night bg-[#f7f3ea] hover:bg-white rounded-md transition-colors active:translate-y-px shadow-sm">
                                + Create New Book
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ═══ SMART ALERTS (priority unchanged) ═══ */}
                {activeAlert === 'admin' && adminFeedbackBook && (
                    <div className="bg-paper border border-red-300 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-in">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-md bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-red-800">Action required — revision requested</h3>
                                <p className="text-red-700 text-sm mt-1">Admin feedback on “{adminFeedbackBook.title}”</p>
                                <p className="text-red-600/90 text-xs mt-1.5 italic">“{adminFeedbackBook.admin_feedback}”</p>
                            </div>
                        </div>
                        <Link href={route('books.details', adminFeedbackBook.id)}
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-md transition-colors whitespace-nowrap self-start sm:self-auto">
                            Fix & Resubmit →
                        </Link>
                    </div>
                )}

                {activeAlert === 'welcome' && isNewUser && (
                    <div className="bg-paper rounded-lg border border-linen p-8 animate-slide-in">
                        <div className="text-center mb-8">
                            <p className={RUN}>Begin here</p>
                            <h3 className="text-[26px] text-ink mt-2" style={SERIF}>Start your publishing journey</h3>
                            <p className="text-umber text-sm mt-1.5">Transform your ideas into published books in three steps</p>
                        </div>
                        <ol className="grid grid-cols-1 md:grid-cols-3 gap-px bg-linen border border-linen rounded-md overflow-hidden">
                            {[
                                { n: 'I', title: 'Write', desc: 'Use AI or upload your manuscript' },
                                { n: 'II', title: 'Design', desc: 'Create stunning covers & format' },
                                { n: 'III', title: 'Publish', desc: 'Distribute & start earning' },
                            ].map((step) => (
                                <li key={step.n} className="p-5 text-center bg-parchment">
                                    <div className="text-[22px] text-foil mb-1" style={SERIF}>{step.n}</div>
                                    <h4 className="font-bold text-night mb-1">{step.title}</h4>
                                    <p className="text-xs text-umber">{step.desc}</p>
                                </li>
                            ))}
                        </ol>
                        <div className="mt-7 text-center">
                            <Link href={route('books.create')}
                                className="inline-block px-8 py-3 bg-oxblood hover:bg-oxblood-deep text-paper font-bold rounded-md transition-colors">
                                Create Your First Book →
                            </Link>
                        </div>
                    </div>
                )}

                {activeAlert === 'referral' && (
                    <div className="bg-paper border border-linen rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 animate-slide-in">
                        <div>
                            <h3 className="text-[15px] font-bold text-night">Refer & earn up to 10% commission</h3>
                            <p className="text-xs text-umber mt-0.5">Invite friends and earn rewards on their purchases</p>
                        </div>
                        <div className="flex items-center gap-5">
                            <div className="text-right">
                                <p className={RUN} style={{ fontSize: 10 }}>Your balance</p>
                                <p className="text-[22px] text-oxblood" style={{ ...SERIF, fontVariantNumeric: 'tabular-nums' }}>₹{auth.user.referral_balance || 0}</p>
                            </div>
                            <button onClick={() => setShowReferralModal(true)}
                                className="px-5 py-2.5 bg-oxblood hover:bg-oxblood-deep text-paper text-sm font-bold rounded-md transition-colors whitespace-nowrap">
                                Get Link →
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══ THE FIGURES — six stat cards, one accent family ═══ */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                    <StatCard label="Total Sales" value={`₹${stats?.totalRevenue || 0}`} icon="rupee" />
                    <StatCard label="Net Income" value={`₹${stats?.monthlyRevenue || 0}`} subLabel="This month" icon="trend" />
                    <StatCard label="Wallet Balance" value={`₹${Number(stats?.walletBalance || 0).toFixed(2)}`} icon="wallet" />
                    <StatCard label="Books Sold" value={stats?.totalSales || 0} icon="book" />
                    <StatCard label="Pages Used" value={stats?.pagesUsedThisMonth || stats?.pagesUsed || 0} subLabel="This month" icon="page" />
                    <StatCard label="Pages Left" value={stats?.pagesRemaining || 0} icon="stack" />
                </div>

                {/* ═══ MAIN LAYOUT ═══ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* CONTINUE WORKING */}
                        <Card title="Continue working"
                            action={<Link href={route('books.create')} className="text-xs text-oxblood hover:underline underline-offset-4 font-bold">See all →</Link>}>
                            <div className="divide-y divide-vellum">
                                {([...(smartWriterSessions || []), ...(activeDrafts || [])])
                                    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                                    .slice(0, 4)
                                    .map((proj, idx) => (
                                        <div key={idx} className="group px-5 py-4 hover:bg-parchment/70 transition-colors flex items-center gap-4">
                                            <div className="w-12 h-16 rounded-sm bg-[#efe9db] border border-linen flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                                                {proj.cover_design_path ?
                                                    <img src={`/storage/${proj.cover_design_path}`} className="w-full h-full object-cover" alt={proj.title} /> :
                                                    <svg className="w-5 h-5 text-taupe-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-[16px] text-ink truncate" style={SERIF}>{proj.title || 'Untitled Project'}</h4>
                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs mt-1">
                                                    {proj.session_token ? (
                                                        <span className="px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                                                            Smart Writer · {proj.plan_type}
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-sm bg-parchment text-ink-soft font-semibold border border-linen">{proj.plan_type || 'Draft'}</span>
                                                    )}
                                                    {proj.estimated_pages > 0 && (
                                                        <span className="text-umber" style={{ fontVariantNumeric: 'tabular-nums' }}>{proj.estimated_pages} pages</span>
                                                    )}
                                                    <span className="text-linen">·</span>
                                                    <span className="text-umber">Updated {proj.updated_at_human || 'recently'}</span>
                                                </div>
                                                {proj.max_pages > 0 && (
                                                    <div className="mt-2 max-w-xs">
                                                        <div className="flex justify-between text-[10px] mb-1">
                                                            <span className="text-umber">Progress</span>
                                                            <span className="text-ink-soft" style={{ fontVariantNumeric: 'tabular-nums' }}>{proj.estimated_pages}/{proj.max_pages} pages</span>
                                                        </div>
                                                        <div className="h-1.5 bg-vellum rounded-full overflow-hidden">
                                                            <div className="h-full bg-oxblood rounded-full transition-all"
                                                                style={{ width: `${Math.min(100, (proj.estimated_pages / proj.max_pages) * 100)}%` }}></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Link
                                                    href={proj.session_token ? route('guest-writer.studio', proj.session_token) : route('books.details', proj.id)}
                                                    className="px-4 py-2 bg-oxblood hover:bg-oxblood-deep text-paper text-[13px] font-bold rounded-md transition-colors whitespace-nowrap">
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
                                                        className="p-2 text-taupe-light hover:text-red-700 hover:bg-red-50 rounded-md border border-transparent hover:border-red-200 transition-colors"
                                                        title="Delete Project">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                {([...(smartWriterSessions || []), ...(activeDrafts || [])].length === 0) && (
                                    <div className="p-14 text-center">
                                        <p className="text-[18px] text-ink-soft mb-1" style={SERIF}>No active projects</p>
                                        <p className="text-xs text-umber mb-5">Your works-in-progress will appear here.</p>
                                        <Link href={route('books.create')} className="inline-block px-6 py-2.5 bg-oxblood hover:bg-oxblood-deep text-paper text-sm font-bold rounded-md transition-colors">
                                            Start Writing →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* PLAN USAGE TRACKER */}
                        {planUsage.length > 0 && (
                            <Card title="My plans & usage">
                                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {planUsage.map((plan) => (
                                        <div key={plan.id} className="relative rounded-md border border-linen bg-parchment p-5">
                                            <div className="absolute top-4 right-4">
                                                <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${plan.status === 'active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                                    plan.status === 'completed' ? 'bg-paper text-ink-soft border-linen' :
                                                        'bg-red-50 text-red-700 border-red-200'
                                                    }`}>
                                                    {plan.status}
                                                </span>
                                            </div>

                                            <div className="mb-4 pr-20">
                                                <p className={RUN} style={{ fontSize: 10 }}>{plan.tool}</p>
                                                <h4 className="text-[18px] text-ink mt-1 truncate" style={SERIF}>{plan.title}</h4>
                                                <p className="text-xs text-umber mt-0.5">
                                                    {plan.plan_name} Plan {plan.amount_paid > 0 && `· ₹${plan.amount_paid}`}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-5 mb-4">
                                                <div className="relative w-16 h-16 shrink-0">
                                                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                                                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ddd6c4" strokeWidth="3" />
                                                        <circle cx="18" cy="18" r="15.915" fill="none"
                                                            stroke={plan.status === 'active' ? '#6e2530' : plan.status === 'completed' ? '#7c7364' : '#dc2626'}
                                                            strokeWidth="3"
                                                            strokeDasharray={`${plan.usage_percent} ${100 - plan.usage_percent}`}
                                                            strokeLinecap="round" />
                                                    </svg>
                                                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-ink-soft" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                                        {plan.usage_percent}%
                                                    </span>
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-umber">Pages</span>
                                                        <span className="font-bold text-ink-soft" style={{ fontVariantNumeric: 'tabular-nums' }}>{plan.pages_used} / {plan.max_pages}</span>
                                                    </div>
                                                    <div className="h-1.5 bg-[#ddd6c4] rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full transition-all duration-500"
                                                            style={{
                                                                width: `${plan.usage_percent}%`,
                                                                background: plan.status === 'active' ? '#6e2530' : plan.status === 'completed' ? '#7c7364' : '#dc2626'
                                                            }}></div>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-umber">Images</span>
                                                        <span className="font-bold text-ink-soft" style={{ fontVariantNumeric: 'tabular-nums' }}>{plan.image_credits_used} / {plan.image_credits_limit}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-[10px] text-umber pt-3 border-t border-[#ddd6c4]">
                                                <span>Created {new Date(plan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                {plan.expires_at && (
                                                    <span className={plan.status === 'expired' ? 'text-red-600' : ''}>
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
                        <Card title="Revenue, last six months">
                            <div className="p-6">
                                <div className="h-56 flex items-end justify-between gap-4 border-b border-linen pb-px">
                                    {monthlyRevenueData.map((data, index) => {
                                        const maxRevenue = Math.max(...monthlyRevenueData.map(d => d.revenue)) || 1;
                                        const height = (data.revenue / maxRevenue) * 100;
                                        return (
                                            <div key={index} className="flex-1 flex flex-col items-center gap-0 group cursor-default h-full justify-end">
                                                <span className="text-xs text-ink-soft font-bold mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                                    ₹{data.revenue}
                                                </span>
                                                <div className="w-full max-w-[52px] rounded-t-sm transition-colors bg-oxblood group-hover:bg-oxblood-deep"
                                                    style={{ height: `${Math.max(height, 3)}%`, minHeight: '6px' }}>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {monthlyRevenueData.length === 0 && (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="text-center">
                                                <p className="text-[18px] text-ink-soft" style={SERIF}>No sales data yet</p>
                                                <p className="text-xs text-umber mt-1">Your first sale will start this chart.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {monthlyRevenueData.length > 0 && (
                                    <div className="flex justify-between gap-4 pt-2.5">
                                        {monthlyRevenueData.map((data, index) => (
                                            <span key={index} className="flex-1 text-center text-[10px] text-umber uppercase font-semibold tracking-[.14em]">{data.month}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* RECENT TRANSACTIONS */}
                        <Card title="Recent transactions">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-linen">
                                            <th className={`px-6 py-3.5 ${RUN}`} style={{ fontSize: 10 }}>Book title</th>
                                            <th className={`px-6 py-3.5 text-right ${RUN}`} style={{ fontSize: 10 }}>Amount</th>
                                            <th className={`px-6 py-3.5 ${RUN}`} style={{ fontSize: 10 }}>Channel</th>
                                            <th className={`px-6 py-3.5 text-right ${RUN}`} style={{ fontSize: 10 }}>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-vellum">
                                        {recentTransactions.map((txn) => (
                                            <tr key={txn.id} className="hover:bg-parchment/70 transition-colors">
                                                <td className="px-6 py-4 text-[15px] text-ink" style={SERIF}>{txn.book_title}</td>
                                                <td className="px-6 py-4 text-right font-bold text-emerald-800" style={{ fontVariantNumeric: 'tabular-nums' }}>₹{txn.amount}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-0.5 rounded-sm bg-parchment text-ink-soft text-xs font-semibold border border-linen">
                                                        {txn.sales_channel || 'Direct'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-umber text-xs" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                                    {new Date(txn.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                            </tr>
                                        ))}
                                        {recentTransactions.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="p-12 text-center">
                                                    <span className="text-umber text-sm">No transactions yet</span>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-8">

                        {/* ASSETS PANEL */}
                        <Card>
                            <div className="flex border-b border-linen">
                                <AssetTab label="Covers" active={activeAssetTab === 'covers'} onClick={() => setActiveAssetTab('covers')} />
                                <AssetTab label="Formatted" active={activeAssetTab === 'formatting'} onClick={() => setActiveAssetTab('formatting')} />
                                <AssetTab label="Drafts" active={activeAssetTab === 'drafts'} onClick={() => setActiveAssetTab('drafts')} />
                            </div>

                            <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {activeAssetTab === 'covers' && <CoversGrid books={books} compact />}
                                {activeAssetTab === 'formatting' && <FormattedList books={books} compact />}
                                {activeAssetTab === 'drafts' && <DraftsList books={books} compact />}
                            </div>

                            <div className="p-3 border-t border-linen">
                                <button onClick={() => setShowAssetsDrawer(true)}
                                    className="w-full py-2 text-center text-oxblood hover:underline underline-offset-4 text-sm font-bold transition-all">
                                    View all assets →
                                </button>
                            </div>
                        </Card>

                        {/* ACTIVITY FEED */}
                        <Card title="Activity">
                            <div className="px-5 py-2 max-h-80 overflow-y-auto custom-scrollbar divide-y divide-vellum">
                                {activityFeed.slice(0, 6).map((item, i) => (
                                    <div key={i} className="flex gap-3 items-start py-3.5">
                                        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border ${item.type === 'sale' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-parchment text-oxblood border-linen'}`}>
                                            {item.icon === 'currency-rupee' && <span className="text-[13px] font-bold">₹</span>}
                                            {item.icon === 'book' && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                                            {item.icon === 'sparkles' && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
                                            {item.icon === 'exclamation' && <span className="text-[13px] font-bold">!</span>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-night font-semibold truncate">{item.title}</p>
                                            <p className="text-xs text-umber truncate mt-0.5">{item.description}</p>
                                            <p className="text-[10px] text-taupe-light mt-1" style={{ fontVariantNumeric: 'tabular-nums' }}>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                ))}
                                {activityFeed.length === 0 && (
                                    <p className="text-xs text-umber text-center py-8 italic">No recent activity</p>
                                )}
                            </div>
                        </Card>

                    </div>
                </div>

            </div>

            {/* ═══ REFERRAL MODAL ═══ */}
            {showReferralModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowReferralModal(false)}>
                    <div className="relative bg-paper p-8 rounded-lg max-w-2xl w-full border border-linen shadow-2xl transform animate-scale-in max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowReferralModal(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#efe9db] hover:bg-[#e0d9c8] text-umber hover:text-ink transition-all z-10">✕</button>

                        <div className="text-center mb-8">
                            <p className={RUN}>Referral programme</p>
                            <h2 className="text-[30px] text-ink mt-2 mb-1" style={SERIF}>Refer & earn</h2>
                            <p className="text-umber text-sm">Share your link and earn 10% commission on every purchase</p>
                        </div>

                        <div className="grid grid-cols-3 divide-x divide-vellum border border-linen rounded-md mb-6 bg-parchment">
                            {[
                                ['Total referrals', referrals.length],
                                ['Total earned', `₹${auth.user.referral_balance || 0}`],
                                ['Commission', '10%'],
                            ].map(([l, v]) => (
                                <div key={l} className="p-4 text-center">
                                    <div className={RUN} style={{ fontSize: 10 }}>{l}</div>
                                    <div className="text-[26px] text-ink mt-1" style={{ ...SERIF, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
                                </div>
                            ))}
                        </div>

                        <div className="mb-6">
                            <label className={`block mb-2 ${RUN}`} style={{ fontSize: 10 }}>Your referral link</label>
                            <div className="bg-white p-3 rounded-md flex gap-2 border border-linen">
                                <code className="flex-1 text-sm text-ink-soft font-mono overflow-x-auto whitespace-nowrap custom-scrollbar py-1">{referralLink}</code>
                                <button onClick={handleCopyLink} className="px-5 py-2 bg-oxblood hover:bg-oxblood-deep text-paper text-xs font-bold rounded-md transition-colors shrink-0">
                                    {copySuccess || 'Copy'}
                                </button>
                            </div>
                        </div>

                        <div className="bg-parchment rounded-md p-5 mb-6 border border-linen">
                            <h3 className="text-sm font-bold text-ink-soft mb-3">How it works</h3>
                            <ol className="space-y-2 text-xs text-umber">
                                {['Share your unique referral link with friends', 'They sign up using your link and make a purchase', 'You earn 10% commission on their purchase amount', 'Earnings are credited to your referral balance instantly'].map((step, i) => (
                                    <li key={i} className="flex items-start gap-2.5">
                                        <span className="text-foil shrink-0 font-semibold" style={SERIF}>{['I', 'II', 'III', 'IV'][i]}.</span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        {referrals.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-ink-soft mb-3">Your referrals</h3>
                                <div className="bg-parchment rounded-md border border-linen overflow-hidden">
                                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                        {referrals.map((ref, i) => (
                                            <div key={ref.id} className={`p-3 flex items-center justify-between gap-3 ${i !== 0 ? 'border-t border-vellum' : ''}`}>
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="w-8 h-8 rounded-full bg-oxblood flex items-center justify-center shrink-0">
                                                        <span className="text-xs text-paper" style={SERIF}>{ref.name.charAt(0).toUpperCase()}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-night truncate">{ref.name}</p>
                                                        <p className="text-xs text-umber truncate">{ref.email}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-umber">{new Date(ref.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                                    <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-sm uppercase mt-1 border border-emerald-200">{ref.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {referrals.length === 0 && (
                            <div className="text-center py-8 bg-parchment rounded-md border border-linen">
                                <p className="text-[17px] text-ink-soft" style={SERIF}>No referrals yet</p>
                                <p className="text-umber text-xs mt-1">Share your link to start earning.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══ ASSETS DRAWER ═══ */}
            {showAssetsDrawer && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowAssetsDrawer(false)}>
                    <div className="h-full overflow-y-auto bg-parchment" onClick={e => e.stopPropagation()}>
                        <div className="max-w-7xl mx-auto p-8">
                            <div className="flex items-center justify-between mb-8 pb-6 border-b border-linen">
                                <div>
                                    <p className={RUN}>The archive</p>
                                    <h2 className="text-[30px] text-ink mt-1" style={SERIF}>My assets library</h2>
                                </div>
                                <button onClick={() => setShowAssetsDrawer(false)}
                                    className="w-11 h-11 flex items-center justify-center rounded-full bg-paper border border-linen hover:border-oxblood text-umber hover:text-oxblood transition-colors">
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-10">
                                <div>
                                    <h3 className="text-[22px] text-ink mb-4" style={SERIF}>Cover designs</h3>
                                    <CoversGrid books={books} />
                                </div>
                                <div>
                                    <h3 className="text-[22px] text-ink mb-4" style={SERIF}>Formatted books</h3>
                                    <FormattedList books={books} />
                                </div>
                                <div>
                                    <h3 className="text-[22px] text-ink mb-4" style={SERIF}>All drafts</h3>
                                    <DraftsList books={books} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(23, 21, 15, 0.04); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #d8d1c1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a49b8b; }

                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scale-in { from { transform: scale(0.97); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes slide-in { from { transform: translateY(-8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

                .animate-fade-in { animation: fade-in 0.25s ease-out; }
                .animate-scale-in { animation: scale-in 0.25s ease-out; }
                .animate-slide-in { animation: slide-in 0.35s ease-out; }
            `}</style>
        </div>
    );
}

// ═══ COMPONENTS ═══

// The single icon vocabulary for stat cards — one stroke weight, one colour.
const STAT_ICONS = {
    rupee: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 4h12M6 8h12M6 4c6 0 8 2 8 5s-2 5-8 5l7 6" />,
    trend: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 17l6-6 4 4 8-8m0 0h-5m5 0v5" />,
    wallet: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm13 5h.01M3 9h18" />,
    book: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.25v13m0-13C10.8 5.5 9.2 5 7.5 5S4.2 5.5 3 6.25v13c1.2-.75 2.8-1.25 4.5-1.25s3.3.5 4.5 1.25m0-13c1.2-.75 2.8-1.25 4.5-1.25s3.3.5 4.5 1.25v13c-1.2-.75-2.8-1.25-4.5-1.25s-3.3.5-4.5 1.25" />,
    page: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h4m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.6a1 1 0 01.7.3l5.4 5.4a1 1 0 01.3.7V19a2 2 0 01-2 2z" />,
    stack: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4l8 4-8 4-8-4 8-4zm-8 8l8 4 8-4M4 16l8 4 8-4" />,
};

// One stat card — cloth icon roundel, small-caps label, serif tabular figure.
function StatCard({ label, value, subLabel, icon }) {
    return (
        <div className="bg-paper border border-linen rounded-lg px-5 py-4 transition-all duration-200 hover:border-taupe-light hover:shadow-[0_8px_20px_-8px_rgba(23,21,15,.15)]">
            <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-md bg-oxblood/[0.08] border border-oxblood/15 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-oxblood" fill="none" viewBox="0 0 24 24" stroke="currentColor">{STAT_ICONS[icon] || STAT_ICONS.book}</svg>
                </span>
                <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-umber leading-tight">{label}</p>
            </div>
            <p className="text-[25px] leading-none text-ink" style={{ fontFamily: "'EB Garamond', Georgia, serif", fontVariantNumeric: 'tabular-nums' }}>{value}</p>
            {subLabel && <p className="text-[10px] text-taupe mt-1.5">{subLabel}</p>}
        </div>
    );
}

// Card Container — running-head title on a paper card.
function Card({ title, action, children }) {
    return (
        <div className="bg-paper rounded-lg border border-linen overflow-hidden">
            {title && (
                <div className="px-6 py-4 border-b border-linen flex items-center justify-between">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[.18em] text-ink-soft">{title}</h3>
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
            className={`flex-1 py-3 px-4 text-[11px] font-semibold uppercase tracking-[.14em] transition-colors border-b-2 ${active
                ? 'text-oxblood border-oxblood'
                : 'text-umber border-transparent hover:text-ink'
                }`}>
            {label}
        </button>
    );
}

// Empty State
const EmptyState = ({ msg }) => (
    <div className="h-32 flex flex-col items-center justify-center text-umber">
        <span className="text-xs">{msg}</span>
    </div>
);

// Covers Grid — Shows Front & Back from the full spread image
const CoversGrid = ({ books, compact }) => (
    <div className={`${compact ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}`}>
        {books.filter(b => b.cover_design_path).length > 0 ? books.filter(b => b.cover_design_path).map(book => (
            <div key={book.id} className="group">
                <p className="text-[15px] text-night truncate mb-2" style={{ fontFamily: "'EB Garamond', Georgia, serif" }} title={book.title}>{book.title}</p>
                <div className="flex gap-2">
                    {/* Front Cover (right ~48% of image) */}
                    <div className="flex-1 flex flex-col items-center">
                        <div className="aspect-[2/3] w-full bg-[#efe9db] rounded-sm overflow-hidden relative border border-linen hover:border-oxblood transition-colors shadow-sm">
                            <img
                                src={`/storage/${book.cover_design_path}`}
                                className="w-[208%] h-full object-cover"
                                style={{ objectPosition: 'right center' }}
                                alt={`${book.title} - Front`}
                            />
                        </div>
                        <span className="text-[9px] font-bold text-umber uppercase tracking-[.16em] mt-1.5">Front</span>
                    </div>
                    {/* Back Cover (left ~48% of image) */}
                    <div className="flex-1 flex flex-col items-center">
                        <div className="aspect-[2/3] w-full bg-[#efe9db] rounded-sm overflow-hidden relative border border-linen hover:border-oxblood transition-colors shadow-sm">
                            <img
                                src={`/storage/${book.cover_design_path}`}
                                className="w-[208%] h-full object-cover"
                                style={{ objectPosition: 'left center' }}
                                alt={`${book.title} - Back`}
                            />
                        </div>
                        <span className="text-[9px] font-bold text-umber uppercase tracking-[.16em] mt-1.5">Back</span>
                    </div>
                </div>
                {/* Download Button */}
                <a href={`/storage/${book.cover_design_path}`} download
                    className="mt-2 block w-full py-2 bg-oxblood hover:bg-oxblood-deep text-paper text-xs font-bold rounded-md text-center transition-colors">
                    Download Full Cover
                </a>
            </div>
        )) : <div className="col-span-full"><EmptyState msg="No covers designed yet" /></div>}
    </div>
);

// Formatted List
const FormattedList = ({ books, compact }) => (
    <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-3`}>
        {books.filter(b => b.formatting_data || b.interior_file).length > 0 ? books.filter(b => b.formatting_data || b.interior_file).map(book => (
            <div key={book.id} className="p-4 bg-parchment rounded-md border border-linen hover:border-taupe-light transition-colors">
                <div className="flex items-start justify-between mb-2">
                    <span className="text-[9px] uppercase tracking-[.16em] font-bold px-2 py-1 rounded-sm bg-paper text-ink-soft border border-linen">Formatted</span>
                    {book.interior_file && (
                        <a href={`/storage/${book.interior_file}`} className="w-8 h-8 flex items-center justify-center bg-paper text-oxblood rounded-md hover:bg-oxblood hover:text-paper transition-colors border border-linen" title="Download interior file">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </a>
                    )}
                </div>
                <p className="text-[15px] text-night truncate mb-1" style={{ fontFamily: "'EB Garamond', Georgia, serif" }} title={book.title}>{book.title}</p>
                <p className="text-xs text-umber mb-3" style={{ fontVariantNumeric: 'tabular-nums' }}>{book.num_pages || '?'} pages</p>
                <Link href={route('books.format', book.id)} className="block w-full text-center py-2 bg-oxblood hover:bg-oxblood-deep text-paper text-xs font-bold rounded-md transition-colors">
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
            <div key={book.id} className="p-4 bg-parchment rounded-md border border-linen hover:border-taupe-light transition-colors">
                <div className="flex items-start justify-between mb-2">
                    <span className="text-[9px] uppercase tracking-[.16em] font-bold px-2 py-1 rounded-sm bg-paper text-foil-deep border border-foil/40">Draft</span>
                </div>
                <p className="text-[15px] text-night truncate mb-1" style={{ fontFamily: "'EB Garamond', Georgia, serif" }} title={book.title}>{book.title}</p>
                <p className="text-xs text-umber mb-3">Updated {new Date(book.updated_at).toLocaleDateString()}</p>
                <Link href={route('books.details', book.id)} className="block w-full text-center py-2 bg-oxblood hover:bg-oxblood-deep text-paper text-xs font-bold rounded-md transition-colors">
                    Continue →
                </Link>
            </div>
        )) : <div className="col-span-full"><EmptyState msg="No drafts in progress" /></div>}
    </div>
);
