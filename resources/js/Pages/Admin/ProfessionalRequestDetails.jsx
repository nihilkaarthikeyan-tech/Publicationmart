import { Head, Link, router } from '@inertiajs/react';
import Icon from '@/Components/Icon';
import { useState } from 'react';

export default function ProfessionalRequestDetails({ serviceRequest }) {
    const [status, setStatus] = useState(serviceRequest.status);
    const [isUpdating, setIsUpdating] = useState(false);

    const serviceNames = {
        formatting: 'Professional Formatting',
        cover: 'Cover Design',
        full_package: 'Full Package',
    };

    const statusOptions = [
        { value: 'pending', label: 'Pending Review' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    const getStatusBadge = (status) => {
        const badges = {
            pending_upload: { label: 'Awaiting Upload', bg: 'bg-yellow-100', text: 'text-yellow-800' },
            pending: { label: 'Pending Review', bg: 'bg-blue-100', text: 'text-blue-800' },
            in_progress: { label: 'In Progress', bg: 'bg-indigo-100', text: 'text-indigo-800' },
            completed: { label: 'Completed', bg: 'bg-emerald-100', text: 'text-emerald-800' },
            cancelled: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-800' },
        };
        return badges[status] || badges.pending;
    };

    const handleStatusUpdate = () => {
        setIsUpdating(true);
        router.post(route('admin.professional.update-status', serviceRequest.id), {
            status: status,
        }, {
            onFinish: () => setIsUpdating(false),
        });
    };

    const badge = getStatusBadge(serviceRequest.status);

    return (
        <>
            <Head title={`Request #${serviceRequest.id} - Admin`} />
            <div className="min-h-screen bg-parchment">
                {/* Header */}
                <header className="bg-paper/90 backdrop-blur-md border-b border-linen sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route('admin.professional.index')}
                                className="text-umber hover:text-ink transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <h1 className="text-xl font-bold text-ink">
                                Request #{serviceRequest.id}
                            </h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
                                {badge.label}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-5xl mx-auto py-8 px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left Column - User & Payment Info */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* User Contact Card */}
                            <div className="bg-paper rounded-2xl border border-linen p-6">
                                <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Customer Details
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-taupe text-xs uppercase tracking-wider mb-1">Name</p>
                                        <p className="text-ink font-medium">{serviceRequest.user?.name || 'Unknown'}</p>
                                    </div>
                                    <div>
                                        <p className="text-taupe text-xs uppercase tracking-wider mb-1">Email</p>
                                        <a href={`mailto:${serviceRequest.user?.email}`} className="text-cyan-700 hover:underline">
                                            {serviceRequest.user?.email}
                                        </a>
                                    </div>
                                    {serviceRequest.user?.mobile_number && (
                                        <div>
                                            <p className="text-taupe text-xs uppercase tracking-wider mb-1">Phone</p>
                                            <a href={`tel:${serviceRequest.user?.mobile_number}`} className="text-emerald-700 hover:underline text-lg font-bold">
                                                <Icon name="phone" size={14} /> {serviceRequest.user?.mobile_number}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Quick Actions */}
                                <div className="mt-6 pt-4 border-t border-linen flex gap-2">
                                    {serviceRequest.user?.email && (
                                        <a
                                            href={`mailto:${serviceRequest.user.email}`}
                                            className="flex-1 py-2 bg-cyan-100 hover:bg-cyan-200 text-cyan-800 rounded-lg text-sm font-medium text-center transition-colors"
                                        >
                                            ✉️ Email
                                        </a>
                                    )}
                                    {serviceRequest.user?.mobile_number && (
                                        <a
                                            href={`tel:${serviceRequest.user.mobile_number}`}
                                            className="flex-1 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-sm font-medium text-center transition-colors"
                                        >
                                            <Icon name="phone" size={14} /> Call
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Payment Card */}
                            <div className="bg-paper rounded-2xl border border-linen p-6">
                                <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Payment Details
                                </h2>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-umber text-sm">Amount Paid</span>
                                        <span className="text-2xl font-black text-emerald-600">₹{serviceRequest.amount}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-umber text-sm">Payment ID</span>
                                        <span className="text-umber text-xs font-mono">{serviceRequest.payment_id || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-umber text-sm">Status</span>
                                        <span className="text-emerald-600 font-medium">
                                            {serviceRequest.payment_id ? '✓ Paid' : 'Pending'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-umber text-sm">Date</span>
                                        <span className="text-umber text-sm">
                                            {new Date(serviceRequest.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Service Details & Actions */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Service Details */}
                            <div className="bg-paper rounded-2xl border border-linen p-6">
                                <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Service Details
                                </h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-vellum rounded-xl p-4">
                                        <p className="text-taupe text-xs uppercase mb-1">Service Type</p>
                                        <p className="text-ink font-bold text-lg">{serviceNames[serviceRequest.service_type]}</p>
                                    </div>
                                    <div className="bg-vellum rounded-xl p-4">
                                        <p className="text-taupe text-xs uppercase mb-1">Book</p>
                                        <p className="text-ink font-medium">{serviceRequest.book?.title || 'Not linked'}</p>
                                    </div>
                                </div>

                                {/* User Notes */}
                                {serviceRequest.user_notes && (
                                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                        <p className="text-yellow-800 text-xs font-bold uppercase mb-2">Customer Notes</p>
                                        <p className="text-umber text-sm">{serviceRequest.user_notes}</p>
                                    </div>
                                )}

                                {/* Manuscript Download */}
                                {serviceRequest.manuscript_file && (
                                    <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-100 rounded-lg">
                                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-ink font-medium">Manuscript Uploaded</p>
                                                <p className="text-umber text-xs">Click to download</p>
                                            </div>
                                        </div>
                                        <a
                                            href={route('admin.professional.download-manuscript', serviceRequest.id)}
                                            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-bold transition-colors"
                                        >
                                            Download
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Status Update */}
                            <div className="bg-paper rounded-2xl border border-linen p-6">
                                <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Update Status
                                </h2>

                                <div className="flex gap-4 items-end">
                                    <div className="flex-1">
                                        <label className="block text-umber text-sm mb-2">New Status</label>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="w-full px-4 py-3 bg-paper border border-linen rounded-xl text-ink focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                        >
                                            {statusOptions.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        onClick={handleStatusUpdate}
                                        disabled={isUpdating || status === serviceRequest.status}
                                        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isUpdating ? 'Updating...' : 'Update Status'}
                                    </button>
                                </div>
                            </div>

                            {/* Upload Formatted File */}
                            {(serviceRequest.service_type === 'formatting' || serviceRequest.service_type === 'full_package') && (
                                <div className="bg-paper rounded-2xl border border-linen p-6">
                                    <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        Upload Formatted File
                                    </h2>

                                    <form
                                        action={route('admin.professional.upload-formatted', serviceRequest.id)}
                                        method="POST"
                                        encType="multipart/form-data"
                                        className="space-y-4"
                                    >
                                        <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.content} />
                                        <div className="border-2 border-dashed border-linen-deep rounded-xl p-6 text-center hover:border-emerald-500/50 transition-colors">
                                            <input
                                                type="file"
                                                name="formatted_file"
                                                accept=".doc,.docx,.pdf"
                                                className="block w-full text-sm text-umber file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200"
                                            />
                                            <p className="text-taupe text-xs mt-2">Upload the completed formatted file (DOC, DOCX, or PDF)</p>
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold rounded-xl transition-all"
                                        >
                                            Upload & Notify Customer
                                        </button>
                                    </form>

                                    {serviceRequest.formatted_file && (
                                        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                                            <span className="text-emerald-800 text-sm">✓ Formatted file uploaded</span>
                                            <a href={`/storage/${serviceRequest.formatted_file}`} target="_blank" className="text-emerald-700 hover:underline text-sm">
                                                View File
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

