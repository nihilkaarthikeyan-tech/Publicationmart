import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function ChallengeEnrollments({ enrollments, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [editingId, setEditingId] = useState(null);
    const [editStatus, setEditStatus] = useState('');
    const [editNotes, setEditNotes] = useState('');

    const handleFilter = (key, value) => {
        router.get(route('admin.challenge-enrollments.index'), {
            ...filters,
            search,
            [key]: value,
        }, { preserveState: true, replace: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        handleFilter('search', search);
    };

    const handleStatusEdit = (enrollment) => {
        setEditingId(enrollment.id);
        setEditStatus(enrollment.payment_status);
        setEditNotes(enrollment.admin_notes || '');
    };

    const handleStatusSave = (id) => {
        router.patch(route('admin.challenge-enrollments.update', id), {
            payment_status: editStatus,
            admin_notes: editNotes,
        }, {
            preserveState: true,
            onSuccess: () => setEditingId(null),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this enrollment?')) {
            router.delete(route('admin.challenge-enrollments.destroy', id));
        }
    };

    const statusColors = {
        pending: 'bg-yellow-500/15 text-yellow-800 border-yellow-500/30',
        paid: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
        failed: 'bg-red-500/15 text-red-700 border-red-500/30',
        refunded: 'bg-blue-500/15 text-blue-700 border-blue-500/30',
    };

    const challengeColors = {
        'Story Challenge': 'bg-orange-500/15 text-orange-800',
        'Poetry Challenge': 'bg-purple-500/15 text-purple-700',
        'Academic Challenge': 'bg-cyan-500/15 text-cyan-700',
    };

    const totalPaid = enrollments.data?.filter(e => e.payment_status === 'paid').length || 0;
    const totalPending = enrollments.data?.filter(e => e.payment_status === 'pending').length || 0;

    return (
        <>
            <Head title="Challenge Enrollments | Admin" />

            <div className="min-h-screen bg-parchment">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <Link
                                href={route('admin.dashboard')}
                                className="inline-flex items-center gap-2 text-umber hover:text-ink text-sm font-medium mb-3 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                Back to Dashboard
                            </Link>
                            <h1 className="text-3xl font-black text-ink flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                                </div>
                                Challenge Enrollments
                            </h1>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-3">
                            <div className="bg-paper border border-linen rounded-xl px-4 py-2 text-center">
                                <p className="text-2xl font-black text-ink">{enrollments.total || 0}</p>
                                <p className="text-xs text-umber">Total</p>
                            </div>
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2 text-center">
                                <p className="text-2xl font-black text-emerald-700">{totalPaid}</p>
                                <p className="text-xs text-emerald-500">Paid</p>
                            </div>
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2 text-center">
                                <p className="text-2xl font-black text-yellow-800">{totalPending}</p>
                                <p className="text-xs text-yellow-500">Pending</p>
                            </div>
                        </div>
                    </div>

                    {/* Filters Bar */}
                    <div className="bg-paper border border-linen rounded-2xl p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            {/* Search */}
                            <form onSubmit={handleSearch} className="flex-1 w-full">
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-umber" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Search by name, email, mobile..."
                                        className="w-full bg-paper border border-linen rounded-xl pl-10 pr-4 py-2.5 text-ink text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </form>

                            {/* Challenge Type Filter */}
                            <select
                                value={filters.challenge_type || 'all'}
                                onChange={e => handleFilter('challenge_type', e.target.value)}
                                className="bg-paper border border-linen rounded-xl px-4 py-2.5 text-ink text-sm focus:outline-none focus:border-indigo-500"
                            >
                                <option value="all">All Challenges</option>
                                <option value="Story Challenge">Story Challenge</option>
                                <option value="Poetry Challenge">Poetry Challenge</option>
                                <option value="Academic Challenge">Academic Challenge</option>
                            </select>

                            {/* Status Filter */}
                            <select
                                value={filters.status || 'all'}
                                onChange={e => handleFilter('status', e.target.value)}
                                className="bg-paper border border-linen rounded-xl px-4 py-2.5 text-ink text-sm focus:outline-none focus:border-indigo-500"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>
                    </div>

                    {/* Enrollments Table */}
                    <div className="bg-paper border border-linen rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-linen text-umber text-xs uppercase tracking-wider">
                                        <th className="px-6 py-4">Participant</th>
                                        <th className="px-4 py-4">Contact</th>
                                        <th className="px-4 py-4">City</th>
                                        <th className="px-4 py-4">Challenge</th>
                                        <th className="px-4 py-4">Fee</th>
                                        <th className="px-4 py-4">Status</th>
                                        <th className="px-4 py-4">Date</th>
                                        <th className="px-4 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {enrollments.data && enrollments.data.length > 0 ? (
                                        enrollments.data.map((enrollment) => (
                                            <tr key={enrollment.id} className="border-b border-linen hover:bg-paper transition-colors">
                                                {/* Name */}
                                                <td className="px-6 py-4">
                                                    <p className="text-ink font-semibold text-sm">{enrollment.full_name}</p>
                                                </td>

                                                {/* Contact */}
                                                <td className="px-4 py-4">
                                                    <p className="text-ink-soft text-sm">{enrollment.email}</p>
                                                    <p className="text-umber text-xs">{enrollment.mobile_number}</p>
                                                </td>

                                                {/* City */}
                                                <td className="px-4 py-4">
                                                    <p className="text-ink-soft text-sm">{enrollment.city}</p>
                                                </td>

                                                {/* Challenge Type */}
                                                <td className="px-4 py-4">
                                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${challengeColors[enrollment.challenge_type] || 'bg-gray-500/15 text-umber'}`}>
                                                        {enrollment.challenge_type}
                                                    </span>
                                                </td>

                                                {/* Fee */}
                                                <td className="px-4 py-4">
                                                    <p className="text-ink font-bold text-sm">₹{parseFloat(enrollment.entry_fee || 1999).toLocaleString()}</p>
                                                </td>

                                                {/* Status */}
                                                <td className="px-4 py-4">
                                                    {editingId === enrollment.id ? (
                                                        <div className="space-y-2 min-w-[180px]">
                                                            <select
                                                                value={editStatus}
                                                                onChange={e => setEditStatus(e.target.value)}
                                                                className="w-full bg-paper border border-linen rounded-lg px-3 py-1.5 text-ink text-xs focus:outline-none focus:border-indigo-500"
                                                            >
                                                                <option value="pending">Pending</option>
                                                                <option value="paid">Paid</option>
                                                                <option value="failed">Failed</option>
                                                                <option value="refunded">Refunded</option>
                                                            </select>
                                                            <textarea
                                                                value={editNotes}
                                                                onChange={e => setEditNotes(e.target.value)}
                                                                placeholder="Admin notes..."
                                                                className="w-full bg-paper border border-linen rounded-lg px-3 py-1.5 text-ink text-xs focus:outline-none focus:border-indigo-500 resize-none"
                                                                rows="2"
                                                            />
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleStatusSave(enrollment.id)}
                                                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingId(null)}
                                                                    className="px-3 py-1 bg-vellum hover:bg-vellum text-ink-soft text-xs font-bold rounded-lg transition-colors"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <button
                                                                onClick={() => handleStatusEdit(enrollment)}
                                                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer hover:opacity-80 transition-opacity ${statusColors[enrollment.payment_status] || statusColors.pending}`}
                                                            >
                                                                {enrollment.payment_status?.toUpperCase()}
                                                            </button>
                                                            {enrollment.admin_notes && (
                                                                <p className="text-umber text-xs mt-1 max-w-[150px] truncate" title={enrollment.admin_notes}>
                                                                    📝 {enrollment.admin_notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Date */}
                                                <td className="px-4 py-4">
                                                    <p className="text-umber text-xs">
                                                        {new Date(enrollment.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </p>
                                                    <p className="text-umber text-xs">
                                                        {new Date(enrollment.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDelete(enrollment.id)}
                                                        className="p-2 text-umber hover:text-red-700 hover:bg-red-500/10 rounded-lg transition-all"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-16 text-center">
                                                <div className="text-umber text-4xl mb-3">📭</div>
                                                <p className="text-umber font-medium">No enrollments found</p>
                                                <p className="text-umber text-sm mt-1">Challenge enrollments will appear here</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {enrollments.links && enrollments.links.length > 3 && (
                            <div className="px-6 py-4 border-t border-linen flex items-center justify-between">
                                <p className="text-umber text-sm">
                                    Showing {enrollments.from}-{enrollments.to} of {enrollments.total}
                                </p>
                                <div className="flex gap-1">
                                    {enrollments.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${link.active
                                                    ? 'bg-indigo-600 text-paper'
                                                    : link.url
                                                        ? 'bg-paper text-umber hover:bg-vellum hover:text-ink'
                                                        : 'text-umber cursor-not-allowed'
                                                }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            preserveState
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
