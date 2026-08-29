import { Head, Link, useForm, router } from '@inertiajs/react';

const statusColors = {
    open:        'bg-emerald-900/30 text-emerald-700',
    in_progress: 'bg-yellow-900/30 text-yellow-800',
    closed:      'bg-vellum text-umber',
};

const priorityColors = {
    urgent: 'bg-red-900/30 text-red-700',
    normal: 'bg-blue-900/30 text-blue-700',
    low:    'bg-vellum text-umber',
};

export default function AdminSupportShow({ auth, ticket, statuses, priorities }) {
    const replyForm = useForm({ message: '', attachment: null });
    const statusForm = useForm({
        status:      ticket.status,
        priority:    ticket.priority,
        admin_notes: ticket.admin_notes || '',
    });

    const handleReply = (e) => {
        e.preventDefault();
        replyForm.post(route('admin.support.reply', ticket.id), {
            forceFormData: true,
            onSuccess: () => replyForm.reset(),
        });
    };

    const handleStatusUpdate = (e) => {
        e.preventDefault();
        statusForm.patch(route('admin.support.update-status', ticket.id));
    };

    const handleDelete = () => {
        if (confirm('Delete this ticket permanently?')) {
            router.delete(route('admin.support.destroy', ticket.id));
        }
    };

    return (
        <div className="min-h-screen bg-parchment py-8">
            <Head title={`Ticket ${ticket.ticket_number} – Admin`} />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Back */}
                <Link href={route('admin.support.index')} className="text-sm text-umber hover:text-ink transition">
                    ← All Tickets
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">

                    {/* Left: Conversation */}
                    <div className="lg:col-span-2 space-y-4">

                        {/* Ticket Header */}
                        <div className="bg-vellum backdrop-blur rounded-2xl p-5">
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono text-violet-700 font-bold">{ticket.ticket_number}</span>
                                        <span className="text-umber">•</span>
                                        <span className="text-xs text-umber">{ticket.category_label}</span>
                                    </div>
                                    <h1 className="text-xl font-bold text-ink">{ticket.subject}</h1>
                                    <p className="text-xs text-umber mt-1">
                                        From <span className="text-ink-soft">{ticket.name}</span> ({ticket.email}) &bull; {ticket.created_at}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${priorityColors[ticket.priority]}`}>
                                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                                    </span>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[ticket.status]}`}>
                                        {ticket.status === 'in_progress' ? 'In Progress' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Original Message */}
                        <div className="bg-vellum backdrop-blur rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full bg-ink-soft flex items-center justify-center text-ink font-bold text-sm">
                                    {ticket.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <span className="font-semibold text-ink text-sm">{ticket.name}</span>
                                    <span className="text-xs text-umber ml-2">{ticket.created_at}</span>
                                </div>
                            </div>
                            <p className="text-ink-soft text-sm leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
                            {ticket.attachment_path && (
                                <a href={`/storage/${ticket.attachment_path}`} target="_blank" className="inline-flex items-center gap-1 mt-3 text-xs text-violet-700 hover:underline">
                                    📎 View Attachment
                                </a>
                            )}
                        </div>

                        {/* Replies */}
                        {ticket.replies.map(reply => (
                            <div key={reply.id} className={`rounded-2xl p-5 ${reply.is_admin ? 'bg-violet-100 border border-linen' : 'bg-vellum backdrop-blur'}`}>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${reply.is_admin ? 'bg-violet-600 text-paper' : 'bg-ink-soft text-ink'}`}>
                                        {reply.is_admin ? '🛡' : reply.author_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-ink text-sm">{reply.author_name}</span>
                                        {reply.is_admin && <span className="ml-1 text-xs bg-violet-600 text-white px-2 py-0.5 rounded-full">Support</span>}
                                        <span className="text-xs text-umber ml-2">{reply.created_at}</span>
                                    </div>
                                </div>
                                <p className="text-ink-soft text-sm leading-relaxed whitespace-pre-wrap">{reply.message}</p>
                                {reply.attachment_path && (
                                    <a href={`/storage/${reply.attachment_path}`} target="_blank" className="inline-flex items-center gap-1 mt-3 text-xs text-violet-700 hover:underline">
                                        📎 View Attachment
                                    </a>
                                )}
                            </div>
                        ))}

                        {/* Admin Reply Box */}
                        <div className="bg-vellum backdrop-blur rounded-2xl p-5">
                            <h3 className="font-semibold text-ink mb-4">Reply to User</h3>
                            <form onSubmit={handleReply} encType="multipart/form-data" className="space-y-3">
                                <textarea
                                    value={replyForm.data.message}
                                    onChange={e => replyForm.setData('message', e.target.value)}
                                    rows={5}
                                    className="w-full bg-vellum border border-linen rounded-xl px-4 py-3 text-ink placeholder-taupe text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                                    placeholder="Type your reply to the user..."
                                />
                                {replyForm.errors.message && <p className="text-red-700 text-xs">{replyForm.errors.message}</p>}
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                    onChange={e => replyForm.setData('attachment', e.target.files[0])}
                                    className="text-sm text-umber border border-linen rounded-lg px-3 py-2 w-full bg-paper"
                                />
                                <button
                                    type="submit"
                                    disabled={replyForm.processing}
                                    className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl shadow transition disabled:opacity-50 text-sm"
                                >
                                    {replyForm.processing ? 'Sending...' : 'Send Reply to User'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right: Ticket Controls */}
                    <div className="space-y-4">

                        {/* Update Status/Priority */}
                        <div className="bg-vellum backdrop-blur rounded-2xl p-5">
                            <h3 className="font-semibold text-ink mb-4">Ticket Controls</h3>
                            <form onSubmit={handleStatusUpdate} className="space-y-3">
                                <div>
                                    <label className="text-xs text-umber font-semibold uppercase mb-1 block">Status</label>
                                    <select
                                        value={statusForm.data.status}
                                        onChange={e => statusForm.setData('status', e.target.value)}
                                        className="w-full bg-vellum border border-linen rounded-xl px-4 py-2.5 text-ink text-sm focus:outline-none"
                                    >
                                        {Object.entries(statuses).map(([key, label]) => (
                                            <option key={key} value={key} className="bg-paper">{label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-umber font-semibold uppercase mb-1 block">Priority</label>
                                    <select
                                        value={statusForm.data.priority}
                                        onChange={e => statusForm.setData('priority', e.target.value)}
                                        className="w-full bg-vellum border border-linen rounded-xl px-4 py-2.5 text-ink text-sm focus:outline-none"
                                    >
                                        {Object.entries(priorities).map(([key, label]) => (
                                            <option key={key} value={key} className="bg-paper">{label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-umber font-semibold uppercase mb-1 block">Internal Notes</label>
                                    <textarea
                                        value={statusForm.data.admin_notes}
                                        onChange={e => statusForm.setData('admin_notes', e.target.value)}
                                        rows={3}
                                        className="w-full bg-vellum border border-linen rounded-xl px-4 py-2.5 text-ink placeholder-taupe text-sm focus:outline-none resize-none"
                                        placeholder="Internal notes (not visible to user)..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={statusForm.processing}
                                    className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm transition disabled:opacity-50"
                                >
                                    {statusForm.processing ? 'Updating...' : 'Update Ticket'}
                                </button>
                            </form>
                        </div>

                        {/* User Info */}
                        {ticket.user && (
                            <div className="bg-vellum backdrop-blur rounded-2xl p-5">
                                <h3 className="font-semibold text-ink mb-3 text-sm">User Account</h3>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold">
                                        {ticket.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-ink font-medium text-sm">{ticket.user.name}</p>
                                        <p className="text-umber text-xs">{ticket.user.email}</p>
                                    </div>
                                </div>
                                <Link
                                    href={route('admin.users.dashboard', ticket.user.id)}
                                    className="mt-3 block text-center text-xs py-2 bg-vellum hover:bg-vellum text-ink-soft rounded-lg transition"
                                >
                                    View User Dashboard
                                </Link>
                            </div>
                        )}

                        {/* Danger Zone */}
                        <div className="bg-red-900/20 border border-red-800/30 rounded-2xl p-5">
                            <h3 className="font-semibold text-red-700 mb-3 text-sm">Danger Zone</h3>
                            <button
                                onClick={handleDelete}
                                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition"
                            >
                                Delete Ticket
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
