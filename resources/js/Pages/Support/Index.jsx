import { Head, Link } from '@inertiajs/react';

const statusColors = {
    open:        'bg-emerald-100 text-emerald-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    closed:      'bg-gray-100 text-gray-500',
};

const priorityColors = {
    urgent: 'bg-red-100 text-red-700',
    normal: 'bg-blue-100 text-blue-700',
    low:    'bg-gray-100 text-gray-500',
};

export default function SupportIndex({ auth, tickets }) {
    return (
        <div className="min-h-screen font-sans" style={{ background: 'linear-gradient(135deg, #f0e6ff 0%, #e8eaff 25%, #f5f0ff 50%, #eef2ff 75%, #f8f5ff 100%)' }}>
            <Head title="My Support Tickets" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
                        <p className="text-gray-500 mt-1">Track and manage your support requests</p>
                    </div>
                    <Link
                        href={route('support.create')}
                        className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold shadow transition"
                    >
                        + New Ticket
                    </Link>
                </div>

                {/* Tickets List */}
                {tickets.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow p-12 text-center">
                        <div className="text-5xl mb-4">🎫</div>
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">No tickets yet</h2>
                        <p className="text-gray-400 mb-6">Need help? Submit a support ticket and our team will get back to you.</p>
                        <Link href={route('support.create')} className="px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition">
                            Create Your First Ticket
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tickets.map(ticket => (
                            <Link
                                key={ticket.id}
                                href={route('support.show', ticket.id)}
                                className="block bg-white rounded-2xl shadow hover:shadow-md transition p-5"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-mono text-violet-600 font-bold">{ticket.ticket_number}</span>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-xs text-gray-400">{ticket.category_label}</span>
                                        </div>
                                        <h3 className="font-semibold text-gray-900 truncate">{ticket.subject}</h3>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Created {ticket.created_at}
                                            {ticket.last_reply_at && <> &bull; Last reply {ticket.last_reply_at}</>}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${priorityColors[ticket.priority]}`}>
                                            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                                        </span>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[ticket.status]}`}>
                                            {ticket.status === 'in_progress' ? 'In Progress' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                <div className="mt-6 text-center">
                    <Link href={route('dashboard')} className="text-sm text-violet-600 hover:underline">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
