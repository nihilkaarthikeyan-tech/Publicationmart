import { Head, Link, router, useForm } from '@inertiajs/react';
import Icon from '@/Components/Icon';
import { useState } from 'react';

export default function PublishingInquiries({ inquiries, filters }) {
    const [expandedRow, setExpandedRow] = useState(null);
    const [statusForm, setStatusForm] = useState({ id: null, status: '', admin_notes: '' });

    const planColors = {
        silver: 'bg-taupe/20 text-ink-soft',
        gold: 'bg-yellow-500/20 text-yellow-800',
        diamond: 'bg-cyan-500/20 text-cyan-700',
        platinum: 'bg-indigo-500/20 text-indigo-700',
        prestige: 'bg-purple-500/20 text-purple-700',
        signature: 'bg-pink-500/20 text-pink-700',
    };

    const statusColors = {
        'new': 'bg-blue-500/20 text-blue-700',
        'contacted': 'bg-yellow-500/20 text-yellow-800',
        'in-progress': 'bg-purple-500/20 text-purple-700',
        'completed': 'bg-emerald-500/20 text-emerald-700',
        'cancelled': 'bg-red-500/20 text-red-700',
    };

    const planLabels = {
        silver: 'Silver – ₹11,999',
        gold: 'Gold – ₹17,999',
        diamond: 'Diamond – ₹39,999',
        platinum: 'Platinum – ₹99,999',
        prestige: 'Prestige – ₹1,49,999',
        signature: 'Signature – ₹1,99,999',
    };

    function handleFilter(key, value) {
        router.get(route('admin.publishing-inquiries.index'), {
            ...filters,
            [key]: value,
        }, { preserveState: true, preserveScroll: true });
    }

    function handleSearch(e) {
        if (e.key === 'Enter') {
            handleFilter('search', e.target.value);
        }
    }

    function handleUpdateStatus(inquiry) {
        router.patch(route('admin.publishing-inquiries.update', inquiry.id), {
            status: statusForm.status || inquiry.status,
            admin_notes: statusForm.admin_notes || inquiry.admin_notes || '',
        }, {
            preserveScroll: true,
            onSuccess: () => setStatusForm({ id: null, status: '', admin_notes: '' }),
        });
    }

    function handleDelete(inquiry) {
        if (confirm(`Delete inquiry from "${inquiry.name}"?`)) {
            router.delete(route('admin.publishing-inquiries.destroy', inquiry.id), {
                preserveScroll: true,
            });
        }
    }

    const stats = {
        total: inquiries.total,
        new: inquiries.data?.filter(i => i.status === 'new').length || 0,
    };

    return (
        <>
            <Head title="Publishing Inquiries | Admin" />

            <div className="min-h-screen bg-parchment py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Link href={route('admin.dashboard')} className="text-umber hover:text-ink transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                </Link>
                                <h1 className="text-2xl font-black text-ink">Publishing Inquiries</h1>
                                {stats.new > 0 && (
                                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                                        {stats.new} New
                                    </span>
                                )}
                            </div>
                            <p className="text-umber text-sm">Manage inquiries from the Premium Suite pricing section</p>
                        </div>
                        <div className="mt-4 md:mt-0 text-sm text-umber">
                            Total: <span className="text-ink font-bold">{inquiries.total}</span> inquiries
                        </div>
                    </div>

                    {/* Filters Bar */}
                    <div className="bg-paper rounded-2xl border border-linen p-4 mb-6 flex flex-wrap gap-3 items-center">
                        {/* Search */}
                        <div className="flex-1 min-w-[200px]">
                            <input
                                type="text"
                                defaultValue={filters.search}
                                onKeyDown={handleSearch}
                                placeholder="Search name, email, phone, title..."
                                className="w-full bg-paper border border-linen rounded-xl px-4 py-2.5 text-ink text-sm placeholder-taupe focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={filters.status}
                            onChange={e => handleFilter('status', e.target.value)}
                            className="bg-paper border border-linen rounded-xl px-4 py-2.5 text-ink text-sm focus:border-purple-500 outline-none cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        {/* Plan Filter */}
                        <select
                            value={filters.plan}
                            onChange={e => handleFilter('plan', e.target.value)}
                            className="bg-paper border border-linen rounded-xl px-4 py-2.5 text-ink text-sm focus:border-purple-500 outline-none cursor-pointer"
                        >
                            <option value="all">All Plans</option>
                            <option value="silver">Silver</option>
                            <option value="gold">Gold</option>
                            <option value="diamond">Diamond</option>
                            <option value="platinum">Platinum</option>
                            <option value="prestige">Prestige</option>
                            <option value="signature">Signature</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="bg-paper rounded-2xl border border-linen overflow-hidden">
                        {inquiries.data?.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="mb-3 flex justify-center text-taupe"><Icon name="inbox" size={34} /></div>
                                <p className="text-umber font-semibold">No inquiries found</p>
                                <p className="text-umber text-sm mt-1">Inquiries from the Premium Suite form will appear here</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-linen">
                                            <th className="text-left text-xs font-bold text-umber uppercase tracking-wider px-6 py-4">Name & Contact</th>
                                            <th className="text-left text-xs font-bold text-umber uppercase tracking-wider px-6 py-4">Book</th>
                                            <th className="text-left text-xs font-bold text-umber uppercase tracking-wider px-6 py-4">Plan</th>
                                            <th className="text-left text-xs font-bold text-umber uppercase tracking-wider px-6 py-4">Status</th>
                                            <th className="text-left text-xs font-bold text-umber uppercase tracking-wider px-6 py-4">Date</th>
                                            <th className="text-right text-xs font-bold text-umber uppercase tracking-wider px-6 py-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inquiries.data?.map((inquiry) => (
                                            <tr key={inquiry.id} className="border-b border-linen hover:bg-white/[0.02] transition-colors">
                                                {/* Name & Contact */}
                                                <td className="px-6 py-4">
                                                    <p className="text-ink font-semibold text-sm">{inquiry.name}</p>
                                                    <p className="text-umber text-xs mt-0.5">{inquiry.email}</p>
                                                    <p className="text-umber text-xs">{inquiry.phone}</p>
                                                    {inquiry.whatsapp && (
                                                        <p className="text-emerald-500/70 text-xs flex items-center gap-1 mt-0.5">
                                                            <Icon name="mobile" size={15} /> {inquiry.whatsapp}
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Book */}
                                                <td className="px-6 py-4">
                                                    <p className="text-ink text-sm font-medium">{inquiry.book_title}</p>
                                                    <span className="inline-block mt-1 text-xs bg-paper text-umber px-2 py-0.5 rounded-md capitalize">{inquiry.book_type}</span>
                                                </td>

                                                {/* Plan */}
                                                <td className="px-6 py-4">
                                                    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full capitalize ${planColors[inquiry.interested_plan] || ''}`}>
                                                        {inquiry.interested_plan}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4">
                                                    {statusForm.id === inquiry.id ? (
                                                        <div className="space-y-2 min-w-[180px]">
                                                            <select
                                                                value={statusForm.status || inquiry.status}
                                                                onChange={e => setStatusForm({ ...statusForm, status: e.target.value })}
                                                                className="w-full bg-paper border border-linen rounded-lg px-3 py-1.5 text-ink text-xs focus:border-purple-500 outline-none"
                                                            >
                                                                <option value="new">New</option>
                                                                <option value="contacted">Contacted</option>
                                                                <option value="in-progress">In Progress</option>
                                                                <option value="completed">Completed</option>
                                                                <option value="cancelled">Cancelled</option>
                                                            </select>
                                                            <textarea
                                                                value={statusForm.admin_notes}
                                                                onChange={e => setStatusForm({ ...statusForm, admin_notes: e.target.value })}
                                                                placeholder="Admin notes..."
                                                                rows={2}
                                                                className="w-full bg-paper border border-linen rounded-lg px-3 py-1.5 text-ink text-xs placeholder-taupe focus:border-purple-500 outline-none resize-none"
                                                            />
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleUpdateStatus(inquiry)}
                                                                    className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-colors"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={() => setStatusForm({ id: null, status: '', admin_notes: '' })}
                                                                    className="px-3 py-1 bg-paper hover:bg-vellum text-umber text-xs font-bold rounded-lg transition-colors"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setStatusForm({ id: inquiry.id, status: inquiry.status, admin_notes: inquiry.admin_notes || '' })}
                                                            className={`inline-block text-xs font-bold px-3 py-1 rounded-full capitalize cursor-pointer hover:opacity-80 transition-opacity ${statusColors[inquiry.status] || ''}`}
                                                        >
                                                            {inquiry.status}
                                                        </button>
                                                    )}
                                                    {inquiry.admin_notes && statusForm.id !== inquiry.id && (
                                                        <p className="text-umber text-xs mt-1 italic max-w-[200px] truncate" title={inquiry.admin_notes}>
                                                            <Icon name="manuscript" size={14} /> {inquiry.admin_notes}
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Date */}
                                                <td className="px-6 py-4 text-umber text-xs">
                                                    {new Date(inquiry.created_at).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                    <br />
                                                    <span className="text-umber">
                                                        {new Date(inquiry.created_at).toLocaleTimeString('en-IN', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDelete(inquiry)}
                                                        className="text-umber hover:text-red-700 transition-colors p-1"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {inquiries.last_page > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-linen">
                                <p className="text-umber text-sm">
                                    Showing {inquiries.from}-{inquiries.to} of {inquiries.total}
                                </p>
                                <div className="flex gap-2">
                                    {inquiries.links?.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${link.active
                                                    ? 'bg-purple-600 text-paper'
                                                    : link.url
                                                        ? 'bg-paper text-umber hover:bg-vellum hover:text-ink'
                                                        : 'bg-paper text-umber cursor-not-allowed'
                                                }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
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
