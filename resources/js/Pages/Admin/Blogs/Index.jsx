import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ auth, blogs }) {
    const [search, setSearch] = useState('');

    // Client-side filtering
    const filteredBlogs = blogs.data.filter(blog =>
        blog.title.toLowerCase().includes(search.toLowerCase()) ||
        blog.author_name.toLowerCase().includes(search.toLowerCase()) ||
        (blog.author_email && blog.author_email.toLowerCase().includes(search.toLowerCase()))
    );

    const pendingCount = blogs.data.filter(b => b.status === 'pending').length;

    return (
        <>
            <Head title="Admin Studio Management" />

            <div className="min-h-screen bg-parchment text-ink font-sans selection:bg-indigo-500/30">
                {/* Background Ambient Glows */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-50 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px]"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-ink mb-2">Studio Submissions</h1>
                            <p className="text-umber">Review pending studio posts from users and guests.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href={route('admin.dashboard')} className="px-5 py-2.5 bg-paper hover:bg-paper border border-linen text-ink-soft rounded-xl transition-all text-sm font-bold flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Dashboard
                            </Link>
                        </div>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="p-5 bg-parchment/80 backdrop-blur border border-linen rounded-2xl">
                            <div className="text-umber text-xs font-bold uppercase tracking-wider mb-1">Total Pending</div>
                            <div className="text-2xl font-black text-ink">{blogs.data.length}</div>
                        </div>
                        <div className="p-5 bg-parchment/80 backdrop-blur border border-linen rounded-2xl">
                            <div className="text-umber text-xs font-bold uppercase tracking-wider mb-1">Needing Review</div>
                            <div className="text-2xl font-black text-yellow-800">{pendingCount}</div>
                        </div>
                    </div>

                    {/* Toolbar: Search */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-umber" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input
                                type="text"
                                placeholder="Search studio posts or authors..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-paper border border-linen rounded-xl py-3 pl-12 pr-4 text-ink placeholder-taupe focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Content Table / Grid */}
                    <div className="bg-parchment/60 backdrop-blur-xl border border-linen rounded-2xl overflow-hidden shadow-2xl">

                        {/* Desktop Table Header */}
                        <div className="hidden md:grid grid-cols-12 gap-4 p-5 bg-paper border-b border-linen text-xs font-bold text-umber uppercase tracking-wider">
                            <div className="col-span-5">Post Details</div>
                            <div className="col-span-3">Author Info</div>
                            <div className="col-span-2 text-center">Date</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>

                        {/* Inventory List */}
                        <div className="divide-y divide-linen">
                            {filteredBlogs.length > 0 ? (
                                filteredBlogs.map((blog) => (
                                    <div key={blog.id} className="md:grid md:grid-cols-12 md:gap-4 p-5 hover:bg-white/[0.02] transition-colors items-start group">

                                        {/* Col 1: Blog Info */}
                                        <div className="col-span-5 mb-4 md:mb-0">
                                            <div className="font-bold text-ink text-base leading-tight mb-2 group-hover:text-indigo-700 transition-colors">{blog.title}</div>
                                            <p className="text-umber text-sm line-clamp-2">{blog.excerpt}</p>
                                            <div className="mt-2 text-xs">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${blog.status === 'pending' ? 'bg-yellow-500/10 text-yellow-800 border border-yellow-500/20' :
                                                        blog.status === 'rejected' ? 'bg-red-500/10 text-red-800 border border-red-500/20' :
                                                            blog.status === 'approved' ? 'bg-green-500/10 text-green-700 border border-green-500/20' :
                                                                'bg-taupe/10 text-umber'
                                                    }`}>
                                                    {blog.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Col 2: Author Info */}
                                        <div className="col-span-3 text-sm text-umber mb-2 md:mb-0">
                                            <div className="font-bold text-ink mb-1">{blog.author_name}</div>
                                            <div className="text-xs text-umber">{blog.author_email || 'No email provided'}</div>
                                            {blog.user && (
                                                <div className="mt-1 inline-block bg-indigo-500/10 text-indigo-700 text-[10px] px-1.5 rounded border border-indigo-500/20">
                                                    Registered User
                                                </div>
                                            )}
                                        </div>

                                        {/* Col 3: Date */}
                                        <div className="col-span-2 text-left md:text-center text-sm text-umber mb-4 md:mb-0">
                                            {blog.created_at}
                                        </div>

                                        {/* Col 4: Actions */}
                                        <div className="col-span-2 flex items-center justify-end gap-2">
                                            {/* Preview Link */}
                                            <a
                                                href={route('blogs.show', blog.slug)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-1"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                View
                                            </a>

                                            {blog.status !== 'approved' && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        if (confirm(`Approve "${blog.title}" for publication?`)) {
                                                            router.post(route('admin.blogs.approve', blog.id));
                                                        }
                                                    }}
                                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-green-500/20"
                                                >
                                                    Approve
                                                </button>
                                            )}

                                            {blog.status !== 'rejected' && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        if (confirm(`Reject/Unpublish "${blog.title}"?`)) {
                                                            router.post(route('admin.blogs.reject', blog.id));
                                                        }
                                                    }}
                                                    className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-ink text-xs font-bold rounded-lg transition-all shadow-lg shadow-yellow-500/20"
                                                >
                                                    Reject
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    if (confirm(`Are you sure you want to PERMANENTLY delete "${blog.title}"? This cannot be undone.`)) {
                                                        router.delete(route('admin.blogs.destroy', blog.id));
                                                    }
                                                }}
                                                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-red-500/20"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-paper rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-umber" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                                    </div>
                                    <h3 className="text-ink font-bold text-lg mb-1">No pending submissions</h3>
                                    <p className="text-umber text-sm">All studio posts have been reviewed.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

