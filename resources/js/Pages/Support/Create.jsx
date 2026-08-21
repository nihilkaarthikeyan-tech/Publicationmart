import { Head, useForm, Link } from '@inertiajs/react';

export default function SupportCreate({ auth, categories, auth_user }) {
    const { data, setData, post, processing, errors } = useForm({
        name:       auth_user?.name  || '',
        email:      auth_user?.email || '',
        category:   'general',
        subject:    '',
        message:    '',
        attachment: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('support.store'), {
            forceFormData: true,
        });
    };

    return (
        <div className="min-h-screen font-sans" style={{ background: 'linear-gradient(135deg, #f0e6ff 0%, #e8eaff 25%, #f5f0ff 50%, #eef2ff 75%, #f8f5ff 100%)' }}>
            <Head title="New Support Ticket" />

            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

                {/* Header */}
                <div className="mb-8">
                    <Link href={route('support.index')} className="text-sm text-violet-600 hover:underline">← My Tickets</Link>
                    <h1 className="text-3xl font-bold text-gray-900 mt-3">Create Support Ticket</h1>
                    <p className="text-gray-500 mt-1">Describe your issue and we'll get back to you within 24–48 hours.</p>
                </div>

                <div className="bg-white rounded-2xl shadow p-8">
                    <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                placeholder="John Doe"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                placeholder="you@example.com"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                            <select
                                value={data.category}
                                onChange={e => setData('category', e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                            >
                                {Object.entries(categories).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                            <input
                                type="text"
                                value={data.subject}
                                onChange={e => setData('subject', e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                placeholder="Brief description of your issue"
                            />
                            {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
                            <textarea
                                value={data.message}
                                onChange={e => setData('message', e.target.value)}
                                rows={6}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                                placeholder="Describe your issue in detail..."
                            />
                            {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                        </div>

                        {/* Attachment */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Attachment <span className="font-normal text-gray-400">(optional – jpg, png, pdf, doc, max 5MB)</span>
                            </label>
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                onChange={e => setData('attachment', e.target.files[0])}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none text-sm text-gray-600"
                            />
                            {errors.attachment && <p className="text-red-500 text-xs mt-1">{errors.attachment}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow transition disabled:opacity-50"
                        >
                            {processing ? 'Submitting...' : 'Submit Ticket'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
