import { Head, Link, router } from '@inertiajs/react';
import Icon from '@/Components/Icon';
import { useState } from 'react';

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

export default function AdminSupportIndex({ auth, tickets, stats, categories, filters }) {
    const [search, setSearch]     = useState(filters?.search || '');
    const [status, setStatus]     = useState(filters?.status || '');
    const [priority, setPriority] = useState(filters?.priority || '');
    const [category, setCategory] = useState(filters?.category || '');

    const applyFilters = () => {
        router.get(route('admin.support.index'), { search, status, priority, category }, { preserveState: true });
    };

    const resetFilters = () => {
        setSearch(''); setStatus(''); setPriority(''); setCategory('');
        router.get(route('admin.support.index'));
    };

    return (
        <div className="min-h-screen bg-parchment py-8">
            <Head title="Support Tickets – Admin" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-ink">Support Tickets</h1>
                        <p className="text-umber mt-1">Manage all customer support requests</p>
                    </div>
                    <Link href={route('admin.dashboard')} className="px-4 py-2 bg-vellum hover:bg-vellum text-ink rounded-xl text-sm transition border border-linen">
                        ← Admin Dashboard
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
                    {[
                        { label: 'Total',       value: stats.total,       color: 'from-purple-500 to-purple-600' },
                        { label: 'Open',        value: stats.open,        color: 'from-emerald-500 to-emerald-600' },
                        { label: 'In Progress', value: stats.in_progress, color: 'from-yellow-500 to-yellow-600' },
                        { label: 'Closed',      value: stats.closed,      color: 'from-gray-500 to-gray-600' },
                        { label: 'Urgent',      value: stats.urgent,      color: 'from-red-500 to-red-600' },
                    ].map(s => (
                        <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 text-ink`}>
                            <p className="text-ink/70 text-xs font-medium">{s.label}</p>
                            <p className="text-3xl font-bold mt-1">{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-vellum backdrop-blur rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-end">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search ticket, name, email..."
                        className="bg-vellum border border-linen rounded-xl px-4 py-2 text-ink placeholder-taupe text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 flex-1 min-w-[200px]"
                        onKeyDown={e => e.key === 'Enter' && applyFilters()}
                    />
                    <select value={status} onChange={e => setStatus(e.target.value)} className="bg-vellum border border-linen rounded-xl px-4 py-2 text-ink text-sm focus:outline-none">
                        <option value="">All Status</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="closed">Closed</option>
                    </select>
                    <select value={priority} onChange={e => setPriority(e.target.value)} className="bg-vellum border border-linen rounded-xl px-4 py-2 text-ink text-sm focus:outline-none">
                        <option value="">All Priority</option>
                        <option value="urgent">Urgent</option>
                        <option value="normal">Normal</option>
                        <option value="low">Low</option>
                    </select>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="bg-vellum border border-linen rounded-xl px-4 py-2 text-ink text-sm focus:outline-none">
                        <option value="">All Categories</option>
                        {Object.entries(categories).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                    <button onClick={applyFilters} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition">Filter</button>
                    <button onClick={resetFilters} className="px-4 py-2 bg-vellum hover:bg-vellum text-ink rounded-xl text-sm transition">Reset</button>
                </div>

                {/* Tickets Table */}
                <div className="bg-vellum backdrop-blur rounded-2xl overflow-hidden">
                    {tickets.data.length === 0 ? (
                        <div className="text-center py-16 text-umber">
                            <div className="mb-3 flex justify-center text-taupe"><Icon name="ticket" size={34} /></div>
                            <p>No tickets found.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-linen text-left">
                                    <th className="px-5 py-4 text-umber font-semibold">Ticket</th>
                                    <th className="px-5 py-4 text-umber font-semibold">From</th>
                                    <th className="px-5 py-4 text-umber font-semibold">Category</th>
                                    <th className="px-5 py-4 text-umber font-semibold">Priority</th>
                                    <th className="px-5 py-4 text-umber font-semibold">Status</th>
                                    <th className="px-5 py-4 text-umber font-semibold">Date</th>
                                    <th className="px-5 py-4 text-umber font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.data.map(ticket => (
                                    <tr key={ticket.id} className="border-b border-linen hover:bg-paper transition">
                                        <td className="px-5 py-4">
                                            <div className="font-mono text-violet-700 text-xs">{ticket.ticket_number}</div>
                                            <div className="text-ink font-medium mt-0.5 max-w-[220px] truncate">{ticket.subject}</div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="text-ink">{ticket.name}</div>
                                            <div className="text-umber text-xs">{ticket.email}</div>
                                        </td>
                                        <td className="px-5 py-4 text-ink-soft text-xs">{ticket.category_label}</td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${priorityColors[ticket.priority]}`}>
                                                {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[ticket.status]}`}>
                                                {ticket.status === 'in_progress' ? 'In Progress' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-umber text-xs">{ticket.created_at}</td>
                                        <td className="px-5 py-4">
                                            <Link
                                                href={route('admin.support.show', ticket.id)}
                                                className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold transition"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {tickets.last_page > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {tickets.links.map((link, i) => (
                            <button
                                key={i}
                                onClick={() => link.url && router.get(link.url)}
                                disabled={!link.url}
                                className={`px-3 py-1.5 rounded-lg text-sm ${link.active ? 'bg-violet-600 text-paper' : 'bg-vellum text-ink-soft hover:bg-vellum'} disabled:opacity-40 transition`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
