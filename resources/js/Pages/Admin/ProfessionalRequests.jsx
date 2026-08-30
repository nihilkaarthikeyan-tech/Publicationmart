import { Head, Link, router } from '@inertiajs/react';
import Icon from '@/Components/Icon';
import { useState } from 'react';

export default function ProfessionalRequests({ requests, currentStatus, stats }) {
    const statusFilters = [
        { value: 'all', label: 'All', count: stats.pending + stats.in_progress + stats.completed },
        { value: 'pending', label: 'Pending', count: stats.pending },
        { value: 'in_progress', label: 'In Progress', count: stats.in_progress },
        { value: 'completed', label: 'Completed', count: stats.completed },
    ];

    const getStatusBadge = (status) => {
        const badges = {
            pending_upload: { label: 'Awaiting Upload', bg: 'bg-yellow-500/20', text: 'text-yellow-800', border: 'border-yellow-500/30' },
            pending: { label: 'Pending Review', bg: 'bg-blue-500/20', text: 'text-blue-700', border: 'border-blue-500/30' },
            in_progress: { label: 'In Progress', bg: 'bg-indigo-500/20', text: 'text-indigo-700', border: 'border-indigo-500/30' },
            completed: { label: 'Completed', bg: 'bg-emerald-500/20', text: 'text-emerald-700', border: 'border-emerald-500/30' },
            cancelled: { label: 'Cancelled', bg: 'bg-red-500/20', text: 'text-red-700', border: 'border-red-500/30' },
        };
        return badges[status] || badges.pending;
    };

    const getServiceName = (type) => {
        const names = {
            formatting: 'Professional Formatting',
            cover: 'Cover Design',
            full_package: 'Full Package',
        };
        return names[type] || type;
    };

    return (
        <>
            <Head title="Professional Service Requests - Admin" />
            <div className="min-h-screen bg-parchment">
                {/* Header */}
                <header className="bg-paper/90 backdrop-blur-md border-b border-linen sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route('admin.dashboard')}
                                className="text-umber hover:text-ink transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <h1 className="text-xl font-bold text-ink flex items-center gap-2">
                                <Icon name="tools" size={24} />
                                Professional Service Requests
                            </h1>
                        </div>

                        {/* Stats Badge */}
                        {stats.pending > 0 && (
                            <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-4 py-1">
                                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
                                <span className="text-red-700 text-sm font-bold">{stats.pending} Pending</span>
                            </div>
                        )}
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto py-8 px-4">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl border border-blue-500/20 p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-umber text-sm">Pending Review</p>
                                    <p className="text-3xl font-bold text-ink mt-1">{stats.pending}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/20 p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-umber text-sm">In Progress</p>
                                    <p className="text-3xl font-bold text-ink mt-1">{stats.in_progress}</p>
                                </div>
                                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl border border-emerald-500/20 p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-umber text-sm">Completed</p>
                                    <p className="text-3xl font-bold text-ink mt-1">{stats.completed}</p>
                                </div>
                                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        {statusFilters.map((filter) => (
                            <Link
                                key={filter.value}
                                href={route('admin.professional.index', { status: filter.value })}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${currentStatus === filter.value
                                    ? 'bg-indigo-500 text-paper'
                                    : 'bg-paper text-umber hover:bg-vellum hover:text-ink'
                                    }`}
                            >
                                {filter.label}
                                <span className="ml-2 px-2 py-0.5 rounded-full bg-vellum text-xs">
                                    {filter.count}
                                </span>
                            </Link>
                        ))}
                    </div>

                    {/* Requests Table */}
                    <div className="bg-paper rounded-2xl border border-linen overflow-hidden">
                        {requests.data && requests.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-paper">
                                        <tr>
                                            <th className="text-left px-6 py-4 text-xs font-bold text-umber uppercase tracking-wider">User</th>
                                            <th className="text-left px-6 py-4 text-xs font-bold text-umber uppercase tracking-wider">Service</th>
                                            <th className="text-left px-6 py-4 text-xs font-bold text-umber uppercase tracking-wider">Book</th>
                                            <th className="text-left px-6 py-4 text-xs font-bold text-umber uppercase tracking-wider">Amount</th>
                                            <th className="text-left px-6 py-4 text-xs font-bold text-umber uppercase tracking-wider">Status</th>
                                            <th className="text-left px-6 py-4 text-xs font-bold text-umber uppercase tracking-wider">Date</th>
                                            <th className="text-left px-6 py-4 text-xs font-bold text-umber uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-linen">
                                        {requests.data.map((request) => {
                                            const badge = getStatusBadge(request.status);
                                            return (
                                                <tr key={request.id} className="hover:bg-paper transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="text-ink font-medium">{request.user?.name || 'Unknown'}</p>
                                                            <p className="text-umber text-xs">{request.user?.email}</p>
                                                            {request.user?.mobile_number && (
                                                                <p className="text-cyan-700 text-xs mt-0.5"><Icon name="phone" size={12} /> {request.user?.mobile_number}</p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-ink-soft">{getServiceName(request.service_type)}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-umber">{request.book?.title || 'Not linked'}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-emerald-700 font-bold">₹{request.amount}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text} border ${badge.border}`}>
                                                            {badge.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-umber text-sm">
                                                            {new Date(request.created_at).toLocaleDateString()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Link
                                                            href={route('admin.professional.show', request.id)}
                                                            className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-700 rounded-lg text-sm font-medium transition-colors"
                                                        >
                                                            View Details
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-16 text-center">
                                <div className="w-20 h-20 mx-auto bg-paper rounded-2xl flex items-center justify-center mb-4">
                                    <svg className="w-10 h-10 text-umber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <p className="text-umber">No service requests found</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {requests.links && requests.links.length > 3 && (
                        <div className="flex justify-center gap-2 mt-6">
                            {requests.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${link.active
                                        ? 'bg-indigo-500 text-paper'
                                        : link.url
                                            ? 'bg-paper text-umber hover:bg-vellum'
                                            : 'bg-paper text-umber cursor-not-allowed'
                                        }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}

