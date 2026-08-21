import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';

const STATUS_COLORS = {
    open:        { bg: 'rgba(34,197,94,0.12)',  text: '#4ade80',  dot: '#22c55e' },
    in_progress: { bg: 'rgba(234,179,8,0.12)',  text: '#facc15',  dot: '#eab308' },
    closed:      { bg: 'rgba(100,116,139,0.12)',text: '#94a3b8',  dot: '#64748b' },
};
const PRIORITY_COLORS = {
    urgent: { bg: 'rgba(239,68,68,0.12)',  text: '#f87171' },
    normal: { bg: 'rgba(99,102,241,0.12)', text: '#818cf8' },
    low:    { bg: 'rgba(100,116,139,0.12)',text: '#94a3b8' },
};

export default function Dashboard({ tickets, stats, categories, filters, agent }) {
    const [search, setSearch]     = useState(filters.search ?? '');
    const [status, setStatus]     = useState(filters.status ?? '');
    const [priority, setPriority] = useState(filters.priority ?? '');
    const [category, setCategory] = useState(filters.category ?? '');

    const applyFilters = () => {
        router.get(route('agent.dashboard'), { search, status, priority, category }, { preserveState: true });
    };

    const clearFilters = () => {
        setSearch(''); setStatus(''); setPriority(''); setCategory('');
        router.get(route('agent.dashboard'));
    };

    const { post: doLogout, processing: loggingOut } = useForm();
    const logout = () => doLogout(route('agent.logout'));

    return (
        <>
            <Head title="Agent Dashboard — Support Portal" />
            <div style={s.page}>
                {/* Sidebar */}
                <aside style={s.sidebar}>
                    <div style={s.sidebarTop}>
                        <div style={s.logo}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            <span style={s.logoText}>Support Portal</span>
                        </div>
                        <div style={s.agentBadge}>
                            <div style={s.agentAvatar}>{agent.name.charAt(0).toUpperCase()}</div>
                            <div>
                                <p style={s.agentName}>{agent.name}</p>
                                <p style={s.agentRole}>Support Agent</p>
                            </div>
                        </div>
                    </div>
                    <nav style={s.nav}>
                        <div style={{ ...s.navItem, ...s.navItemActive }}>
                            <TicketIcon /> All Tickets
                        </div>
                    </nav>
                    <button onClick={logout} disabled={loggingOut} style={s.logoutBtn}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Sign Out
                    </button>
                </aside>

                {/* Main */}
                <main style={s.main}>
                    {/* Stats */}
                    <div style={s.statsGrid}>
                        {[
                            { label: 'Total',       value: stats.total,       color: '#6366f1' },
                            { label: 'Open',        value: stats.open,        color: '#22c55e' },
                            { label: 'In Progress', value: stats.in_progress, color: '#eab308' },
                            { label: 'Closed',      value: stats.closed,      color: '#64748b' },
                            { label: 'Urgent',      value: stats.urgent,      color: '#ef4444' },
                        ].map(stat => (
                            <div key={stat.label} style={s.statCard}>
                                <p style={{ ...s.statVal, color: stat.color }}>{stat.value}</p>
                                <p style={s.statLabel}>{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div style={s.filterBar}>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyFilters()}
                            placeholder="Search ticket#, subject, name, email…"
                            style={s.searchInput}
                        />
                        <select value={status} onChange={e => setStatus(e.target.value)} style={s.select}>
                            <option value="">All Status</option>
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="closed">Closed</option>
                        </select>
                        <select value={priority} onChange={e => setPriority(e.target.value)} style={s.select}>
                            <option value="">All Priority</option>
                            <option value="urgent">Urgent</option>
                            <option value="normal">Normal</option>
                            <option value="low">Low</option>
                        </select>
                        <select value={category} onChange={e => setCategory(e.target.value)} style={s.select}>
                            <option value="">All Category</option>
                            {Object.entries(categories).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                        <button onClick={applyFilters} style={s.filterBtn}>Apply</button>
                        {(search || status || priority || category) && (
                            <button onClick={clearFilters} style={s.clearBtn}>Clear</button>
                        )}
                    </div>

                    {/* Ticket Table */}
                    <div style={s.tableWrap}>
                        <table style={s.table}>
                            <thead>
                                <tr>
                                    {['Ticket #', 'Subject', 'User', 'Category', 'Status', 'Priority', 'Last Reply', 'Date'].map(h => (
                                        <th key={h} style={s.th}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} style={s.empty}>No tickets found.</td>
                                    </tr>
                                ) : tickets.data.map(ticket => (
                                    <tr key={ticket.id} style={s.tr} onClick={() => router.visit(route('agent.tickets.show', ticket.id))}>
                                        <td style={s.td}>
                                            <span style={s.ticketNum}>{ticket.ticket_number}</span>
                                        </td>
                                        <td style={s.td}>
                                            <Link href={route('agent.tickets.show', ticket.id)} style={s.subjectLink}>
                                                {ticket.subject}
                                            </Link>
                                        </td>
                                        <td style={s.td}>
                                            <div style={s.userCell}>
                                                <p style={s.userName}>{ticket.name}</p>
                                                <p style={s.userEmail}>{ticket.email}</p>
                                            </div>
                                        </td>
                                        <td style={s.td}>
                                            <span style={s.categoryBadge}>{ticket.category_label}</span>
                                        </td>
                                        <td style={s.td}>
                                            <StatusBadge status={ticket.status} label={ticket.status.replace('_', ' ')} />
                                        </td>
                                        <td style={s.td}>
                                            <PriorityBadge priority={ticket.priority} />
                                        </td>
                                        <td style={s.td}><span style={s.muted}>{ticket.last_reply_at ?? '—'}</span></td>
                                        <td style={s.td}><span style={s.muted}>{ticket.created_at}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {tickets.links && tickets.links.length > 3 && (
                        <div style={s.pagination}>
                            {tickets.links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    style={{
                                        ...s.pageBtn,
                                        ...(link.active ? s.pageBtnActive : {}),
                                        opacity: link.url ? 1 : 0.4,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}

function StatusBadge({ status, label }) {
    const c = STATUS_COLORS[status] ?? STATUS_COLORS.open;
    return (
        <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.dot}30`, ...badge }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, display: 'inline-block' }} />
            {label}
        </span>
    );
}
function PriorityBadge({ priority }) {
    const c = PRIORITY_COLORS[priority] ?? PRIORITY_COLORS.normal;
    return <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.text}30`, ...badge }}>{priority}</span>;
}
const badge = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' };
function TicketIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}

const s = {
    page:         { display: 'flex', minHeight: '100vh', background: '#060b14', fontFamily: "'Inter', -apple-system, sans-serif", color: '#e2e8f0' },
    sidebar:      { width: 240, background: 'rgba(15,23,42,0.95)', borderRight: '1px solid rgba(99,102,241,0.15)', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'sticky', top: 0, height: '100vh', flexShrink: 0 },
    sidebarTop:   { padding: '0 20px 24px', borderBottom: '1px solid rgba(99,102,241,0.1)', marginBottom: 16 },
    logo:         { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 },
    logoText:     { fontSize: 15, fontWeight: 700, background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    agentBadge:   { display: 'flex', alignItems: 'center', gap: 10 },
    agentAvatar:  { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 },
    agentName:    { fontSize: 13, fontWeight: 600, color: '#e2e8f0', margin: 0 },
    agentRole:    { fontSize: 11, color: '#64748b', margin: 0 },
    nav:          { flex: 1, padding: '0 12px' },
    navItem:      { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, fontSize: 14, color: '#64748b', cursor: 'pointer', transition: 'all 0.15s' },
    navItemActive: { background: 'rgba(99,102,241,0.12)', color: '#818cf8', fontWeight: 600 },
    logoutBtn:    { margin: '0 12px', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#f87171', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' },
    main:         { flex: 1, padding: '32px', overflowX: 'auto' },
    statsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 28 },
    statCard:     { background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 12, padding: '20px 16px' },
    statVal:      { fontSize: 30, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-1px' },
    statLabel:    { fontSize: 12, color: '#475569', margin: 0, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' },
    filterBar:    { display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
    searchInput:  { flex: 1, minWidth: 220, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: '9px 14px', color: '#e2e8f0', fontSize: 13, outline: 'none', fontFamily: 'inherit' },
    select:       { background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: '9px 12px', color: '#e2e8f0', fontSize: 13, outline: 'none', cursor: 'pointer', fontFamily: 'inherit' },
    filterBtn:    { padding: '9px 18px', borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
    clearBtn:     { padding: '9px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
    tableWrap:    { background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 14, overflow: 'hidden' },
    table:        { width: '100%', borderCollapse: 'collapse' },
    th:           { padding: '14px 16px', fontSize: 11, fontWeight: 700, color: '#475569', textAlign: 'left', borderBottom: '1px solid rgba(99,102,241,0.1)', textTransform: 'uppercase', letterSpacing: '0.6px', background: 'rgba(15,23,42,0.5)' },
    tr:           { cursor: 'pointer', transition: 'background 0.15s', borderBottom: '1px solid rgba(99,102,241,0.06)' },
    td:           { padding: '14px 16px', fontSize: 13, verticalAlign: 'middle' },
    empty:        { padding: '48px', textAlign: 'center', color: '#475569', fontSize: 14 },
    ticketNum:    { fontFamily: 'monospace', fontSize: 12, color: '#6366f1', fontWeight: 600 },
    subjectLink:  { color: '#e2e8f0', textDecoration: 'none', fontWeight: 500, fontSize: 13 },
    userCell:     { lineHeight: 1.4 },
    userName:     { margin: 0, fontWeight: 500, fontSize: 13 },
    userEmail:    { margin: 0, fontSize: 11, color: '#64748b' },
    categoryBadge:{ fontSize: 11, color: '#94a3b8', background: 'rgba(100,116,139,0.1)', padding: '2px 8px', borderRadius: 12 },
    muted:        { fontSize: 12, color: '#475569' },
    pagination:   { display: 'flex', gap: 6, marginTop: 20, justifyContent: 'center', flexWrap: 'wrap' },
    pageBtn:      { padding: '7px 12px', borderRadius: 7, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.15)', color: '#94a3b8', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' },
    pageBtnActive:{ background: 'rgba(99,102,241,0.2)', borderColor: '#6366f1', color: '#818cf8', fontWeight: 700 },
};
