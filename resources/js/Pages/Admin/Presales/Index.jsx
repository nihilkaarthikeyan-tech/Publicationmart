import { Head, Link } from '@inertiajs/react';

export default function Index({ presales }) {
    return (
        <>
            <Head title="Presale Management" />

            <div className="min-h-screen bg-parchment text-ink font-sans selection:bg-indigo-500/30">
                {/* Background Ambient Glows */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-50 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px]"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-ink mb-2">Presale Management</h1>
                            <p className="text-umber">Track interest and bookings for upcoming studios.</p>
                        </div>
                        <Link href={route('admin.dashboard')} className="px-5 py-2.5 bg-paper hover:bg-paper border border-linen text-ink-soft rounded-xl transition-all text-sm font-bold flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Dashboard
                        </Link>
                    </div>

                    <div className="bg-parchment/60 backdrop-blur-xl border border-linen rounded-2xl overflow-hidden shadow-2xl">
                        <div className="grid grid-cols-12 gap-4 p-5 bg-paper border-b border-linen text-xs font-bold text-umber uppercase tracking-wider">
                            <div className="col-span-5">Studio Title</div>
                            <div className="col-span-2 text-center">Bookings</div>
                            <div className="col-span-2 text-center">Interest</div>
                            <div className="col-span-1 text-center">Status</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>

                        <div className="divide-y divide-linen">
                            {presales.data.length > 0 ? (
                                presales.data.map((presale) => (
                                    <div key={presale.id} className="grid grid-cols-12 gap-4 p-5 hover:bg-white/[0.02] transition-colors items-center">
                                        <div className="col-span-5">
                                            <div className="font-bold text-ink text-base mb-1">{presale.title}</div>
                                            <div className="text-xs text-umber">by {presale.author_name}</div>
                                        </div>
                                        <div className="col-span-2 text-center">
                                            <div className="text-xl font-bold text-yellow-800">{presale.bookings_count}</div>
                                            <div className="text-[10px] text-umber uppercase tracking-wider">Orders</div>
                                        </div>
                                        <div className="col-span-2 text-center">
                                            <div className="text-xl font-bold text-blue-700">{presale.access_attempts}</div>
                                            <div className="text-[10px] text-umber uppercase tracking-wider">Views</div>
                                        </div>
                                        <div className="col-span-1 text-center">
                                            <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded border ${presale.status === 'approved' ? 'bg-green-500/10 text-green-700 border-green-500/20' :
                                                presale.status === 'pending' ? 'bg-yellow-500/10 text-yellow-800 border-yellow-500/20' :
                                                    'bg-red-500/10 text-red-800 border-red-500/20'
                                                }`}>
                                                {presale.status}
                                            </span>
                                        </div>
                                        <div className="col-span-2 text-right">
                                            <Link
                                                href={route('admin.blogs.presale-bookings', presale.id)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/20"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-umber">No presales found.</div>
                            )}
                        </div>
                    </div>
                    {/* Pagination if needed */}
                </div>
            </div>
        </>
    );
}

