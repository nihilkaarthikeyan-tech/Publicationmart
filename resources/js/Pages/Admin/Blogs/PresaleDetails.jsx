import { Head, Link, router } from '@inertiajs/react';

export default function PresaleDetails({ auth, blog, bookings }) {
    return (
        <>
            <Head title={`Presale Details: ${blog.title}`} />

            <div className="min-h-screen bg-parchment text-ink font-sans selection:bg-oxblood/20">
                {/* Background Ambient Glows */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-oxblood/5 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-foil/10 rounded-full blur-[120px]"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Link href={route('admin.blogs.manage')} className="text-taupe hover:text-ink transition-colors text-sm font-bold flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                    Back to Submissions
                                </Link>
                                <span className="text-taupe">/</span>
                                <span className="text-oxblood text-xs font-bold uppercase tracking-wider border border-oxblood/20 bg-oxblood/10 px-2 py-0.5 rounded">Presale Details</span>
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-ink mb-2">{blog.title}</h1>
                            <p className="text-umber text-sm max-w-2xl">{blog.excerpt}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <a
                                href={route('blogs.show', blog.slug)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-2.5 bg-paper hover:bg-vellum border border-linen text-umber rounded-xl transition-all text-sm font-bold flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                View Live Page
                            </a>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="p-5 bg-paper border border-linen rounded-2xl">
                            <div className="text-taupe text-xs font-bold uppercase tracking-wider mb-1">Total Bookings</div>
                            <div className="text-2xl font-black text-ink">{bookings.length}</div>
                        </div>
                        <div className="p-5 bg-paper border border-linen rounded-2xl">
                            <div className="text-taupe text-xs font-bold uppercase tracking-wider mb-1">Total Copies Requested</div>
                            <div className="text-2xl font-black text-foil">
                                {bookings.reduce((sum, booking) => sum + booking.copies_count, 0)}
                            </div>
                        </div>
                        <div className="p-5 bg-paper border border-linen rounded-2xl">
                            <div className="text-taupe text-xs font-bold uppercase tracking-wider mb-1">Unique Interests</div>
                            <div className="text-2xl font-black text-blue-700">
                                {blog.access_attempts}
                            </div>
                        </div>
                    </div>

                    {/* Bookings Table */}
                    <div className="bg-paper border border-linen rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-5 border-b border-linen flex justify-between items-center">
                            <h3 className="text-lg font-bold text-ink">Booking List</h3>
                            <button
                                onClick={() => window.print()}
                                className="text-xs font-bold text-umber hover:text-ink uppercase tracking-wider flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                Print List
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-vellum text-xs font-bold text-umber uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Name/Email</th>
                                        <th className="px-6 py-4">Mobile</th>
                                        <th className="px-6 py-4 text-center">Copies</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-linen">
                                    {bookings.length > 0 ? (
                                        bookings.map((booking) => (
                                            <tr key={booking.id} className="hover:bg-vellum transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="text-ink font-bold text-sm">{booking.email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-umber text-sm">
                                                    {booking.mobile_number}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded border border-yellow-200">
                                                        {booking.copies_count}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {booking.is_verified ? (
                                                        <span className="text-green-700 text-xs font-bold uppercase tracking-wider">Verified</span>
                                                    ) : (
                                                        <span className="text-taupe text-xs font-bold uppercase tracking-wider">Pending</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right text-taupe text-sm">
                                                    {new Date(booking.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-taupe">
                                                No bookings yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

