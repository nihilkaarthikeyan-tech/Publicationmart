import { Head, Link, router } from '@inertiajs/react';

export default function Dashboard({ auth, user, analytics, books, backUrl, backLabel }) {
    return (
        <>
            <Head title={`${user.name}'s Dashboard`} />

            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold mr-4">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-[#17150f]">{user.name}'s Dashboard</h1>
                                    <p className="text-[#635c4e] mt-1">{user.email}</p>
                                </div>
                            </div>
                            <Link
                                href={backUrl || route('admin.users.index')}
                                className="px-5 py-2.5 bg-[#e7e1d4] hover:bg-[#e7e1d4] text-[#17150f] rounded-xl transition-all border border-[#d8d1c1] flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                {backLabel || 'Back to Users'}
                            </Link>
                        </div>
                    </div>

                    {/* Analytics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                            <h3 className="text-blue-700 text-sm font-medium">Total Books</h3>
                            <p className="text-4xl font-bold mt-2">{analytics.totalBooks}</p>
                            <div className="mt-2 text-blue-700 text-sm">
                                {analytics.publishedBooks} published, {analytics.pendingBooks} pending
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-[#17150f]">
                            <h3 className="text-green-700 text-sm font-medium">Total Sales</h3>
                            <p className="text-4xl font-bold mt-2">{analytics.totalSales}</p>
                            <div className="mt-2 text-green-700 text-sm">copies sold</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                            <h3 className="text-purple-700 text-sm font-medium">Total Revenue</h3>
                            <p className="text-4xl font-bold mt-2">₹{analytics.totalRevenue?.toFixed(2) || '0.00'}</p>
                            <div className="mt-2 text-purple-700 text-sm">gross earnings</div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-6 text-white">
                            <h3 className="text-orange-800 text-sm font-medium">Total Royalty</h3>
                            <p className="text-4xl font-bold mt-2">₹{analytics.totalRoyalty?.toFixed(2) || '0.00'}</p>
                            <div className="mt-2 text-orange-800 text-sm">author earnings</div>
                        </div>
                    </div>

                    {/* Sales Channel Breakdown */}
                    <div className="bg-[#e7e1d4] backdrop-blur-xl rounded-2xl border border-[#d8d1c1] p-6 mb-8">
                        <h2 className="text-xl font-bold text-[#17150f] mb-6">Sales Channel Breakdown</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-[#faf8f3] rounded-xl p-4 text-center">
                                <div className="w-3 h-3 bg-orange-500 rounded-full mx-auto mb-2"></div>
                                <h4 className="text-[#17150f] font-bold">Amazon</h4>
                                <p className="text-2xl font-bold text-orange-800">{analytics.breakdown?.amazon?.quantity || 0}</p>
                                <p className="text-[#635c4e] text-sm">₹{analytics.breakdown?.amazon?.revenue?.toFixed(2) || '0.00'}</p>
                            </div>
                            <div className="bg-[#faf8f3] rounded-xl p-4 text-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2"></div>
                                <h4 className="text-[#17150f] font-bold">Google Play</h4>
                                <p className="text-2xl font-bold text-blue-700">{analytics.breakdown?.google?.quantity || 0}</p>
                                <p className="text-[#635c4e] text-sm">₹{analytics.breakdown?.google?.revenue?.toFixed(2) || '0.00'}</p>
                            </div>
                            <div className="bg-[#faf8f3] rounded-xl p-4 text-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                                <h4 className="text-[#17150f] font-bold">Direct Sales</h4>
                                <p className="text-2xl font-bold text-green-700">{analytics.breakdown?.direct?.quantity || 0}</p>
                                <p className="text-[#635c4e] text-sm">₹{analytics.breakdown?.direct?.revenue?.toFixed(2) || '0.00'}</p>
                            </div>
                            <div className="bg-[#faf8f3] rounded-xl p-4 text-center">
                                <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-2"></div>
                                <h4 className="text-[#17150f] font-bold">International</h4>
                                <p className="text-2xl font-bold text-purple-700">{analytics.breakdown?.other?.quantity || 0}</p>
                                <p className="text-[#635c4e] text-sm">₹{analytics.breakdown?.other?.revenue?.toFixed(2) || '0.00'}</p>
                            </div>
                        </div>
                    </div>

                    {/* User's Books */}
                    <div className="bg-[#e7e1d4] backdrop-blur-xl rounded-2xl border border-[#d8d1c1] overflow-hidden">
                        <div className="p-6 border-b border-[#d8d1c1]">
                            <h2 className="text-xl font-bold text-[#17150f]">{user.name}'s Books</h2>
                        </div>

                        {books && books.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[#faf8f3]">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#635c4e] uppercase tracking-wider">Title</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#635c4e] uppercase tracking-wider">Author Name</th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-[#635c4e] uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-[#635c4e] uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-[#635c4e] uppercase tracking-wider">Created</th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-[#635c4e] uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#d8d1c1]">
                                        {books.map((book) => (
                                            <tr key={book.id} className="hover:bg-[#faf8f3] transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="text-[#17150f] font-medium">{book.title}</p>
                                                </td>
                                                <td className="px-6 py-4 text-[#4b443a]">{book.author_name}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${book.status === 'approved'
                                                        ? 'bg-green-500/20 text-green-700'
                                                        : book.status === 'pending'
                                                            ? 'bg-yellow-500/20 text-yellow-800'
                                                            : 'bg-gray-500/20 text-[#635c4e]'
                                                        }`}>
                                                        {book.status || 'Draft'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center text-[#17150f] font-medium">
                                                    ₹{book.selling_price || 0}
                                                </td>
                                                <td className="px-6 py-4 text-center text-[#635c4e] text-sm">
                                                    {new Date(book.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link
                                                            href={route('admin.books.show', book.id)}
                                                            className="inline-flex items-center px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-all"
                                                        >
                                                            View
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                if (confirm(`Delete "${book.title}"? This cannot be undone.`)) {
                                                                    router.delete(route('admin.books.destroy', book.id), {
                                                                        preserveScroll: true,
                                                                    });
                                                                }
                                                            }}
                                                            className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-[#e7e1d4] rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-[#635c4e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h3 className="text-[#17150f] font-medium">No books yet</h3>
                                <p className="text-[#635c4e] text-sm mt-1">This author hasn't created any books</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
}
