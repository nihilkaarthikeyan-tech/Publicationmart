import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, admins, stats }) {
    return (
        <>
            <Head title="Admin Management" />

            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white">Admin Management</h1>
                                <p className="text-gray-400 mt-1">View and manage all sub-administrators</p>
                            </div>
                            <Link
                                href={route('admin.dashboard')}
                                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/5 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl">
                            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Admins</h3>
                            <p className="text-3xl font-black text-white mt-2">{stats.totalAdmins || 0}</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl">
                            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Admins with Live Books</h3>
                            <p className="text-3xl font-black text-emerald-400 mt-2">
                                {stats.activePublishing || 0}
                            </p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl">
                            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Live Books in Store</h3>
                            <p className="text-3xl font-black text-indigo-400 mt-2">
                                {stats.totalBooks || 0}
                            </p>
                        </div>
                    </div>

                    {/* Admins Table */}
                    <div className="bg-[#0f1118]/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-xl font-black text-white tracking-tight">System Administrators</h2>
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                RELIABLE ACCESS
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Profile</th>
                                        <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Email Address</th>
                                        <th className="px-8 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Books Added</th>
                                        <th className="px-8 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Approved</th>
                                        <th className="px-8 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Account Created</th>
                                        <th className="px-8 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {admins.data?.map((admin) => (
                                        <tr key={admin.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-400 font-black border border-white/10 group-hover:scale-110 transition-transform shadow-lg">
                                                        {admin.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold text-lg">{admin.name}</p>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 opacity-60">System Admin</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-gray-400 font-medium">
                                                {admin.email}
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20">
                                                    {admin.books_count}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                                                    {admin.published_books_count}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-center text-gray-500 text-sm">
                                                {new Date(admin.created_at).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <Link
                                                    href={route('admin.admins.dashboard', admin.id)}
                                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white text-sm font-bold rounded-xl transition-all border border-indigo-600/20 hover:border-indigo-500 shadow-indigo-500/10 shadow-lg"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                    </svg>
                                                    View Stats
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {admins.links && admins.links.length > 3 && (
                            <div className="p-8 border-t border-white/5 flex justify-center gap-3">
                                {admins.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-5 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all border ${link.active
                                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                                            : link.url
                                                ? 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                                                : 'bg-white/5 border-white/5 text-gray-600 cursor-not-allowed'
                                            }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {(!admins.data || admins.data.length === 0) && (
                            <div className="p-20 text-center">
                                <div className="w-24 h-24 mx-auto mb-6 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10 group animate-pulse">
                                    <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-white text-xl font-black tracking-tight">No administrators found</h3>
                                <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">Try adding more admin users to the system to manage them here.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            <style>{`
                body {
                    background-color: #17150f;
                }
            `}</style>
        </>
    );
}

