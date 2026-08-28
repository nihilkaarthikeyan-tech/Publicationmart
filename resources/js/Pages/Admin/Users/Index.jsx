import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, users }) {
    return (
        <>
            <Head title="User Management" />

            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-ink">User Management</h1>
                                <p className="text-umber mt-1">View and manage all registered authors</p>
                            </div>
                            <Link
                                href={route('admin.dashboard')}
                                className="px-4 py-2 bg-vellum hover:bg-vellum text-ink rounded-xl transition-all"
                            >
                                ← Back to Dashboard
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-vellum backdrop-blur-xl rounded-2xl p-6 border border-linen">
                            <h3 className="text-umber text-sm font-medium">Total Authors</h3>
                            <p className="text-3xl font-bold text-ink mt-2">{users.total || users.data?.length || 0}</p>
                        </div>
                        <div className="bg-vellum backdrop-blur-xl rounded-2xl p-6 border border-linen">
                            <h3 className="text-umber text-sm font-medium">Active Authors</h3>
                            <p className="text-3xl font-bold text-green-700 mt-2">
                                {users.data?.filter(u => u.published_books_count > 0).length || 0}
                            </p>
                        </div>
                        <div className="bg-vellum backdrop-blur-xl rounded-2xl p-6 border border-linen">
                            <h3 className="text-umber text-sm font-medium">Total Books</h3>
                            <p className="text-3xl font-bold text-purple-700 mt-2">
                                {users.data?.reduce((acc, u) => acc + u.books_count, 0) || 0}
                            </p>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-vellum backdrop-blur-xl rounded-2xl border border-linen overflow-hidden">
                        <div className="p-6 border-b border-linen">
                            <h2 className="text-xl font-bold text-ink">All Authors</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-paper">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-umber uppercase tracking-wider">Author</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-umber uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-umber uppercase tracking-wider">Total Books</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-umber uppercase tracking-wider">Published</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-umber uppercase tracking-wider">Joined</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-umber uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-linen">
                                    {users.data?.map((user) => (
                                        <tr key={user.id} className="hover:bg-paper transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <p className="text-ink font-medium">{user.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-ink-soft">{user.email}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-3 py-1 bg-blue-500/20 text-blue-700 rounded-full text-sm font-medium">
                                                    {user.books_count}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-3 py-1 bg-green-500/20 text-green-700 rounded-full text-sm font-medium">
                                                    {user.published_books_count}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-umber text-sm">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Link
                                                    href={route('admin.users.dashboard', user.id)}
                                                    className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-all"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    View Dashboard
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {users.links && (
                            <div className="p-6 border-t border-linen flex justify-center gap-2">
                                {users.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${link.active
                                            ? 'bg-purple-600 text-ink'
                                            : link.url
                                                ? 'bg-vellum text-ink-soft hover:bg-vellum'
                                                : 'bg-paper text-umber cursor-not-allowed'
                                            }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {(!users.data || users.data.length === 0) && (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-vellum rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-umber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-ink font-medium">No authors yet</h3>
                                <p className="text-umber text-sm mt-1">Authors will appear here when they register</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
}
