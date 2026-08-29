import { Head, useForm, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const statusColors = {
    open:        'bg-emerald-100 text-emerald-700',
    in_progress: 'bg-yellow-100 text-yellow-800',
    closed:      'bg-gray-100 text-umber',
};

const priorityColors = {
    urgent: 'bg-red-100 text-red-700',
    normal: 'bg-blue-100 text-blue-700',
    low:    'bg-gray-100 text-umber',
};

export default function SupportShow({ auth, ticket }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        message:    '',
        attachment: null,
    });

    const handleReply = (e) => {
        e.preventDefault();
        post(route('support.reply', ticket.id), {
            forceFormData: true,
            onSuccess: () => reset(),
        });
    };

    const handleClose = () => {
        if (confirm('Close this ticket?')) {
            router.post(route('support.close', ticket.id));
        }
    };

    return (
        <div className="min-h-screen font-sans" style={{ background: 'linear-gradient(135deg, #f0e6ff 0%, #e8eaff 25%, #f5f0ff 50%, #eef2ff 75%, #f8f5ff 100%)' }}>
            <Head title={`Ticket ${ticket.ticket_number}`} />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

                {/* Back */}
                <Link href={route('support.index')} className="text-sm text-violet-600 hover:underline">← My Tickets</Link>

                {/* Ticket Header */}
                <div className="bg-white rounded-2xl shadow p-6 mt-4 mb-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono text-violet-600 font-bold">{ticket.ticket_number}</span>
                                <span className="text-ink-soft">•</span>
                                <span className="text-xs text-umber">{ticket.category_label}</span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">{ticket.subject}</h1>
                            <p className="text-xs text-umber mt-1">Opened {ticket.created_at}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${priorityColors[ticket.priority]}`}>
                                {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                            </span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[ticket.status]}`}>
                                {ticket.status === 'in_progress' ? 'In Progress' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                            </span>
                            {ticket.status !== 'closed' && (
                                <button
                                    onClick={handleClose}
                                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-umber rounded-full text-xs font-semibold transition"
                                >
                                    Close Ticket
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Conversation Thread */}
                <div className="space-y-4">

                    {/* Original Message */}
                    <div className="bg-white rounded-2xl shadow p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm">
                                {auth.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <span className="font-semibold text-gray-800 text-sm">{auth.user.name}</span>
                                <span className="text-xs text-umber ml-2">{ticket.created_at}</span>
                            </div>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
                        {ticket.attachment_path && (
                            <a
                                href={`/storage/${ticket.attachment_path}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 mt-3 text-xs text-violet-600 hover:underline"
                            >
                                📎 View Attachment
                            </a>
                        )}
                    </div>

                    {/* Replies */}
                    {ticket.replies.map(reply => (
                        <div
                            key={reply.id}
                            className={`rounded-2xl shadow p-5 ${reply.is_admin ? 'bg-violet-50 border border-violet-100' : 'bg-white'}`}
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${reply.is_admin ? 'bg-violet-600 text-paper' : 'bg-violet-100 text-violet-700'}`}>
                                    {reply.is_admin ? '🛡' : reply.author_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-800 text-sm">{reply.author_name}</span>
                                    {reply.is_admin && <span className="ml-1 text-xs bg-violet-600 text-white px-2 py-0.5 rounded-full">Support</span>}
                                    <span className="text-xs text-umber ml-2">{reply.created_at}</span>
                                </div>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{reply.message}</p>
                            {reply.attachment_path && (
                                <a
                                    href={`/storage/${reply.attachment_path}`}
                                    target="_blank"
                                    className="inline-flex items-center gap-1 mt-3 text-xs text-violet-600 hover:underline"
                                >
                                    📎 View Attachment
                                </a>
                            )}
                        </div>
                    ))}
                </div>

                {/* Reply Form */}
                {ticket.status !== 'closed' ? (
                    <div className="bg-white rounded-2xl shadow p-6 mt-4">
                        <h3 className="font-semibold text-gray-800 mb-4">Add a Reply</h3>
                        <form onSubmit={handleReply} encType="multipart/form-data" className="space-y-4">
                            <div>
                                <textarea
                                    value={data.message}
                                    onChange={e => setData('message', e.target.value)}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none text-sm"
                                    placeholder="Type your reply..."
                                />
                                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                            </div>
                            <div>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                    onChange={e => setData('attachment', e.target.files[0])}
                                    className="text-sm text-umber border border-gray-200 rounded-lg px-3 py-2 w-full"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl shadow transition disabled:opacity-50 text-sm"
                            >
                                {processing ? 'Sending...' : 'Send Reply'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 mt-4 text-center">
                        <p className="text-umber text-sm">This ticket is closed.</p>
                        <Link href={route('support.create')} className="mt-2 inline-block text-violet-600 hover:underline text-sm font-medium">
                            Open a new ticket →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
