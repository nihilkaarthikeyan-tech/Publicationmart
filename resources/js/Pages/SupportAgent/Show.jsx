import { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';

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

export default function Show({ ticket, statuses, priorities, agent }) {
    const [statusVal, setStatusVal]     = useState(ticket.status);
    const [priorityVal, setPriorityVal] = useState(ticket.priority);
    const [notes, setNotes]             = useState(ticket.admin_notes ?? '');

    const replyForm = useForm({ message: '', attachment: null });
    const statusForm = useForm();

    const submitReply = (e) => {
        e.preventDefault();
        replyForm.post(route('agent.tickets.reply', ticket.id), {
            forceFormData: true,
            onSuccess: () => replyForm.reset(),
        });
    };

    const updateStatus = () => {
        statusForm.patch(route('agent.tickets.status', ticket.id), {
            data: { status: statusVal, priority: priorityVal, admin_notes: notes },
        });
    };

    const sc = STATUS_COLORS[ticket.status] ?? STATUS_COLORS.open;
    const pc = PRIORITY_COLORS[ticket.priority] ?? PRIORITY_COLORS.normal;

    return (
        <>
            <Head title={`#${ticket.ticket_number} — Support Portal`} />
            <div style={s.page}>
                {/* Sidebar */}
                <aside style={s.sidebar}>
                    <div style={s.sidebarTop}>
                        <div style={s.logo}>
                            <SupportIcon />
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
                        <Link href={route('agent.dashboard')} style={s.navItem}>
                            <TicketIcon /> All Tickets
                        </Link>
                    </nav>
                    <button onClick={() => router.post(route('logout'))} style={s.logoutBtn}>
                        <LogoutIcon /> Sign Out
                    </button>
                </aside>

                {/* Main */}
                <main style={s.main}>
                    {/* Breadcrumb */}
                    <div style={s.breadcrumb}>
                        <Link href={route('agent.dashboard')} style={s.breadLink}>← All Tickets</Link>
                        <span style={s.breadSep}>/</span>
                        <span style={s.breadCurrent}>{ticket.ticket_number}</span>
                    </div>

                    <div style={s.layout}>
                        {/* Left — Thread */}
                        <div style={s.threadCol}>
                            {/* Original ticket */}
                            <div style={s.ticketHeader}>
                                <h1 style={s.subject}>{ticket.subject}</h1>
                                <div style={s.metaRow}>
                                    <span style={{ ...s.badge, background: sc.bg, color: sc.text }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot, display: 'inline-block' }}/>
                                        {ticket.status.replace('_', ' ')}
                                    </span>
                                    <span style={{ ...s.badge, background: pc.bg, color: pc.text }}>{ticket.priority}</span>
                                    <span style={s.metaMuted}>{ticket.category_label}</span>
                                    <span style={s.metaMuted}>{ticket.created_at}</span>
                                </div>
                            </div>

                            {/* Original message */}
                            <div style={s.message}>
                                <div style={s.msgHeader}>
                                    <div style={{ ...s.avatar, background: '#1e3a5f' }}>
                                        {ticket.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={s.msgAuthor}>{ticket.name}</p>
                                        <p style={s.msgEmail}>{ticket.email}</p>
                                    </div>
                                    <span style={s.userTag}>User</span>
                                </div>
                                <p style={s.msgBody}>{ticket.message}</p>
                                {ticket.attachment_path && (
                                    <a href={`/storage/${ticket.attachment_path}`} target="_blank" style={s.attachLink}>📎 View Attachment</a>
                                )}
                            </div>

                            {/* Replies thread */}
                            {ticket.replies.map(reply => (
                                <div key={reply.id} style={reply.is_admin ? { ...s.message, ...s.messageAdmin } : s.message}>
                                    <div style={s.msgHeader}>
                                        <div style={{ ...s.avatar, background: reply.is_admin ? '#2a0e12' : '#1e3a5f' }}>
                                            {reply.author_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p style={s.msgAuthor}>{reply.author_name}</p>
                                            <p style={s.msgTime}>{reply.created_at}</p>
                                        </div>
                                        {reply.is_admin && <span style={s.agentTag}>Support Team</span>}
                                    </div>
                                    <p style={s.msgBody}>{reply.message}</p>
                                    {reply.attachment_path && (
                                        <a href={`/storage/${reply.attachment_path}`} target="_blank" style={s.attachLink}>📎 View Attachment</a>
                                    )}
                                </div>
                            ))}

                            {/* Reply Box */}
                            {ticket.status !== 'closed' ? (
                                <form onSubmit={submitReply} style={s.replyForm}>
                                    <h3 style={s.replyTitle}>Reply as Support Team</h3>
                                    <textarea
                                        value={replyForm.data.message}
                                        onChange={e => replyForm.setData('message', e.target.value)}
                                        placeholder="Type your reply here… This will be sent to the user via email."
                                        rows={5}
                                        required
                                        style={s.textarea}
                                    />
                                    {replyForm.errors.message && <p style={s.errText}>{replyForm.errors.message}</p>}
                                    <div style={s.replyBottom}>
                                        <label style={s.fileLabel}>
                                            📎 Attach file
                                            <input type="file" onChange={e => replyForm.setData('attachment', e.target.files[0])} style={{ display: 'none' }} />
                                        </label>
                                        {replyForm.data.attachment && (
                                            <span style={s.fileName}>{replyForm.data.attachment.name}</span>
                                        )}
                                        <button type="submit" disabled={replyForm.processing} style={s.replyBtn}>
                                            {replyForm.processing ? 'Sending…' : 'Send Reply'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div style={s.closedNote}>
                                    🔒 This ticket is closed. Update the status to reopen it.
                                </div>
                            )}
                        </div>

                        {/* Right — Controls */}
                        <aside style={s.controlCol}>
                            {/* User info */}
                            <div style={s.infoCard}>
                                <h3 style={s.cardTitle}>User Info</h3>
                                <p style={s.infoRow}><span style={s.infoLabel}>Name</span><span style={s.infoVal}>{ticket.name}</span></p>
                                <p style={s.infoRow}><span style={s.infoLabel}>Email</span><span style={s.infoVal}>{ticket.email}</span></p>
                                {ticket.user && (
                                    <p style={s.infoRow}><span style={s.infoLabel}>Account</span><span style={{ ...s.infoVal, color: '#818cf8' }}>Registered User</span></p>
                                )}
                            </div>

                            {/* Controls */}
                            <div style={s.infoCard}>
                                <h3 style={s.cardTitle}>Manage Ticket</h3>

                                <label style={s.controlLabel}>Status</label>
                                <select value={statusVal} onChange={e => setStatusVal(e.target.value)} style={s.controlSelect}>
                                    {Object.entries(statuses).map(([k, v]) => (
                                        <option key={k} value={k}>{v}</option>
                                    ))}
                                </select>

                                <label style={{ ...s.controlLabel, marginTop: 14 }}>Priority</label>
                                <select value={priorityVal} onChange={e => setPriorityVal(e.target.value)} style={s.controlSelect}>
                                    {Object.entries(priorities).map(([k, v]) => (
                                        <option key={k} value={k}>{v}</option>
                                    ))}
                                </select>

                                <label style={{ ...s.controlLabel, marginTop: 14 }}>Internal Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Private notes visible only to agents…"
                                    rows={3}
                                    style={{ ...s.textarea, fontSize: 12 }}
                                />

                                <button onClick={updateStatus} disabled={statusForm.processing} style={s.updateBtn}>
                                    {statusForm.processing ? 'Saving…' : 'Save Changes'}
                                </button>
                            </div>
                        </aside>
                    </div>
                </main>
            </div>
        </>
    );
}

function SupportIcon() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
function TicketIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
function LogoutIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}

const s = {
    page:         { display: 'flex', minHeight: '100vh', background: '#060b14', fontFamily: "'Inter', -apple-system, sans-serif", color: '#e2e8f0' },
    sidebar:      { width: 240, background: 'rgba(15,23,42,0.95)', borderRight: '1px solid rgba(99,102,241,0.15)', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'sticky', top: 0, height: '100vh', flexShrink: 0 },
    sidebarTop:   { padding: '0 20px 24px', borderBottom: '1px solid rgba(99,102,241,0.1)', marginBottom: 16 },
    logo:         { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, color: 'rgba(129,140,248,0.9)' },
    logoText:     { fontSize: 15, fontWeight: 700, background: 'linear-gradient(135deg, #818cf8, #cba75c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    agentBadge:   { display: 'flex', alignItems: 'center', gap: 10 },
    agentAvatar:  { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #ad5b67)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 },
    agentName:    { fontSize: 13, fontWeight: 600, color: '#e2e8f0', margin: 0 },
    agentRole:    { fontSize: 11, color: '#64748b', margin: 0 },
    nav:          { flex: 1, padding: '0 12px' },
    navItem:      { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, fontSize: 14, color: '#64748b', cursor: 'pointer', textDecoration: 'none', transition: 'all 0.15s' },
    logoutBtn:    { margin: '0 12px', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#f87171', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' },
    main:         { flex: 1, padding: '32px', maxWidth: 'calc(100vw - 240px)' },
    breadcrumb:   { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 },
    breadLink:    { color: '#6366f1', textDecoration: 'none', fontSize: 14, fontWeight: 500 },
    breadSep:     { color: '#334155', fontSize: 14 },
    breadCurrent: { fontSize: 14, color: '#64748b', fontFamily: 'monospace' },
    layout:       { display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' },
    threadCol:    { display: 'flex', flexDirection: 'column', gap: 16 },
    ticketHeader: { background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 14, padding: '24px' },
    subject:      { margin: '0 0 14px', fontSize: 22, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.3 },
    metaRow:      { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
    badge:        { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' },
    metaMuted:    { fontSize: 12, color: '#475569' },
    message:      { background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(99,102,241,0.1)', borderRadius: 14, padding: '20px' },
    messageAdmin: { borderColor: 'rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.04)' },
    msgHeader:    { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 },
    avatar:       { width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff', flexShrink: 0 },
    msgAuthor:    { margin: 0, fontWeight: 600, fontSize: 14, color: '#e2e8f0' },
    msgEmail:     { margin: 0, fontSize: 11, color: '#64748b' },
    msgTime:      { margin: 0, fontSize: 11, color: '#64748b' },
    userTag:      { marginLeft: 'auto', fontSize: 11, padding: '2px 8px', borderRadius: 12, background: 'rgba(30,58,95,0.6)', color: '#60a5fa', fontWeight: 600 },
    agentTag:     { marginLeft: 'auto', fontSize: 11, padding: '2px 8px', borderRadius: 12, background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontWeight: 600 },
    msgBody:      { margin: 0, fontSize: 14, color: '#cbd5e1', lineHeight: 1.7, whiteSpace: 'pre-wrap' },
    attachLink:   { display: 'inline-block', marginTop: 10, fontSize: 12, color: '#6366f1', textDecoration: 'none' },
    replyForm:    { background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14, padding: '24px' },
    replyTitle:   { margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#e2e8f0' },
    textarea:     { width: '100%', background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '12px 14px', color: '#e2e8f0', fontSize: 14, resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
    errText:      { fontSize: 12, color: '#f87171', margin: '6px 0 0' },
    replyBottom:  { display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, flexWrap: 'wrap' },
    fileLabel:    { fontSize: 13, color: '#6366f1', cursor: 'pointer', fontWeight: 500 },
    fileName:     { fontSize: 12, color: '#64748b' },
    replyBtn:     { marginLeft: 'auto', padding: '10px 24px', borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #ad5b67)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' },
    closedNote:   { background: 'rgba(100,116,139,0.08)', border: '1px dashed rgba(100,116,139,0.3)', borderRadius: 12, padding: '20px 24px', fontSize: 14, color: '#64748b', textAlign: 'center' },
    controlCol:   { display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 },
    infoCard:     { background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 14, padding: '20px' },
    cardTitle:    { margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' },
    infoRow:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 10px', fontSize: 13 },
    infoLabel:    { color: '#475569' },
    infoVal:      { color: '#e2e8f0', fontWeight: 500 },
    controlLabel: { display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.3px' },
    controlSelect:{ width: '100%', background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: '9px 12px', color: '#e2e8f0', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
    updateBtn:    { marginTop: 16, width: '100%', padding: '11px', borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #ad5b67)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
};
