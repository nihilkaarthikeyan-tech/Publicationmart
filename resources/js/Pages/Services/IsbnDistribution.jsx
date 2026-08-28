import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function IsbnDistribution() {
    return (
        <>
            <Head title="ISBN & Global Distribution - PublicationMart" />

            <div className="bg-parchment text-ink selection:bg-emerald-500/30 overflow-hidden">
                {/* Hero Section */}
                <section className="relative pt-20 pb-16 px-6">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[700px] bg-emerald-600/10 blur-[130px] rounded-full -z-10" />

                    <div className="max-w-5xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs font-bold uppercase tracking-widest mb-6">
                            Global Identity & Reach
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                            Give Your Book a <br />
                            <span className=" text-oxblood">Global Identity.</span>
                        </h1>
                        <p className="text-xl text-umber max-w-3xl mx-auto leading-relaxed">
                            Reach Readers Worldwide. An ISBN gives your book a unique identity in the global publishing ecosystem, allowing it to be listed, tracked, and sold through recognized marketplaces.
                        </p>
                    </div>
                </section>

                {/* What is ISBN */}
                <section className="py-16 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="relative aspect-video rounded-3xl overflow-hidden border border-linen group">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-transparent" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center p-8 bg-paper backdrop-blur-md rounded-2xl border border-linen border-t-white/10">
                                        <div className="text-4xl font-black mb-2 tracking-widest text-ink/70">ISBN 978-X-XX-XXXXXX-X</div>
                                        <div className="text-emerald-700 font-bold tracking-tight">GLOBAL BOOK IDENTIFIER</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold">What Is an ISBN?</h2>
                                <p className="text-umber leading-relaxed">
                                    An ISBN (International Standard Book Number) is a unique identification number assigned to a book. It is a vital tool used by:
                                </p>
                                <ul className="grid grid-cols-2 gap-4">
                                    {[
                                        { icon: '🏪', label: 'Bookstores' },
                                        { icon: '🌐', label: 'Online Marketplaces' },
                                        { icon: '📚', label: 'Libraries' },
                                        { icon: '🚛', label: 'Distribution Networks' }
                                    ].map((item, i) => (
                                        <li key={i} className="p-4 rounded-xl bg-white/[0.03] border border-linen flex items-center gap-3">
                                            <span className="text-2xl">{item.icon}</span>
                                            <span className="font-semibold text-ink-soft">{item.label}</span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-sm text-umber italic">
                                    Having an ISBN makes your book officially recognized for sale and cataloging.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Support & Distribution */}
                <section className="py-20 px-6 bg-white/[0.01]">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* ISBN Support */}
                            <div className="p-10 rounded-[40px] bg-gradient-to-br from-[#0a1510] to-parchment border border-emerald-900/30">
                                <h3 className="text-2xl font-bold mb-8 text-emerald-700">ISBN Allocation Support</h3>
                                <p className="text-umber mb-6">Depending on your selected package, we assist with:</p>
                                <ul className="space-y-4">
                                    {[
                                        'ISBN assignment',
                                        'Proper metadata registration',
                                        'Linking ISBN to your book format (eBook or paperback)',
                                        'Publishing compliance setup'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-4 text-ink-soft">
                                            <div className="mt-1 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-8 p-4 rounded-xl bg-emerald-500/5 text-xs text-emerald-500 italic">
                                    The ISBN is issued specifically for your book edition and format.
                                </div>
                            </div>

                            {/* Distribution Setup */}
                            <div className="p-10 rounded-[40px] bg-gradient-to-br from-[#0a0b15] to-parchment border border-linen">
                                <h3 className="text-2xl font-bold mb-8 text-indigo-700">Global Distribution Setup</h3>
                                <p className="text-umber mb-6 font-medium">We help set up distribution across supported platforms:</p>
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        'Indian online marketplaces (Amazon, Flipkart)',
                                        'International online platforms',
                                        'eBook distribution channels',
                                        'Print-on-demand networks'
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-paper border border-linen group hover:bg-vellum transition-all">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500 group-hover:scale-150 transition-transform" />
                                            <span className="text-sm font-medium text-ink-soft">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Print-on-Demand Advantage */}
                <section className="py-24 px-6 relative overflow-hidden">
                    <div className="absolute top-1/2 left-0 w-full h-[500px] bg-indigo-600/5 blur-[100px] rounded-full -translate-y-1/2 pointer-events-none" />
                    <div className="max-w-5xl mx-auto relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4">Print-on-Demand Advantage</h2>
                            <p className="text-umber">For paperback editions, distribution typically operates through a print-on-demand model.</p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { title: 'Zero Inventory', desc: 'No bulk inventory required' },
                                { title: 'Order Driven', desc: 'Books printed when ordered' },
                                { title: 'Low Risk', desc: 'Reduced upfront risk' },
                                { title: 'Global Ship', desc: 'Global shipping capability' }
                            ].map((item, i) => (
                                <div key={i} className="p-6 rounded-3xl bg-parchment/80 backdrop-blur-sm border border-linen hover:border-taupe transition-all group">
                                    <div className="text-indigo-700 font-bold mb-2 group-hover:translate-x-1 transition-transform">{item.title}</div>
                                    <div className="text-sm text-umber leading-relaxed">{item.desc}</div>
                                </div>
                            ))}
                        </div>
                        <p className="mt-8 text-center text-sm text-umber max-w-2xl mx-auto leading-relaxed">
                            This allows authors to reach readers without managing stock or dealing with logistical headaches.
                        </p>
                    </div>
                </section>

                {/* Important Note */}
                <section className="py-20 px-6">
                    <div className="max-w-4xl mx-auto p-12 rounded-[40px] bg-amber-500/5 border border-amber-500/20">
                        <h3 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Important Note
                        </h3>
                        <p className="text-umber leading-relaxed mb-6">
                            Distribution setup does not guarantee sales. Book performance depends on factors such as content quality, marketing efforts, pricing strategy, and audience engagement.
                        </p>
                        <p className="text-amber-800 text-sm font-medium">
                            Marketing services are available separately in applicable packages.
                        </p>
                    </div>
                </section>

                {/* CTA */}
                <section className="pb-24 px-6 text-center">
                    <Link href={route('services')} className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black font-black rounded-full hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-2xl">
                        Explore Distribution Packages
                        <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </section>
            </div>
        </>
    );
}

