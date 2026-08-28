import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function EbookPrintPublishing() {
    return (
        <>
            <Head title="eBook & Print Publishing - PublicationMart" />

            <div className="bg-[#17150f] text-white selection:bg-purple-500/30 overflow-hidden">
                {/* Hero Section */}
                <section className="relative pt-20 pb-16 px-6">
                    <div className="absolute top-0 right-1/2 translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full -z-10" />

                    <div className="max-w-5xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest mb-6">
                            Multi-Format Publishing
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                            Publish Digitally. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Publish in Print.</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            Reach Readers Everywhere. PublicationMart enables authors to publish their books in both eBook and paperback formats through a streamlined, guided publishing process.
                        </p>
                    </div>
                </section>

                {/* Main Content Sections */}
                <section className="py-20 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* eBook Publishing */}
                            <div className="group p-8 rounded-[32px] bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 hover:border-purple-500/30 transition-all duration-500">
                                <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-8 group-hover:scale-110 transition-transform duration-500">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h3 className="text-3xl font-bold mb-4">eBook Publishing</h3>
                                <p className="text-gray-400 mb-6">Make your book accessible to digital readers worldwide. eBooks allow instant global availability without printing costs.</p>
                                <ul className="space-y-4">
                                    {[
                                        'Conversion to marketplace-ready eBook format',
                                        'Metadata setup (title, description, keywords, categories)',
                                        'Pricing configuration',
                                        'Author royalty setup',
                                        'Online listing support'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-gray-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                                            <span className="text-sm">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Print Publishing */}
                            <div className="group p-8 rounded-[32px] bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 hover:border-pink-500/30 transition-all duration-500">
                                <div className="w-16 h-16 rounded-2xl bg-pink-500/20 flex items-center justify-center text-pink-400 mb-8 group-hover:scale-110 transition-transform duration-500">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <h3 className="text-3xl font-bold mb-4">Print Publishing (Paperback)</h3>
                                <p className="text-gray-400 mb-6">For authors who want a physical presence, we support print-ready publishing through print-on-demand systems. Books are printed only when ordered.</p>
                                <ul className="space-y-4">
                                    {[
                                        'Interior layout compatibility check',
                                        'Cover size alignment with selected trim size',
                                        'Print-ready file generation',
                                        'Marketplace listing support',
                                        'On-demand printing model (no bulk inventory required)'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-gray-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0" />
                                            <span className="text-sm">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Distribution Section */}
                <section className="py-20 px-6 bg-white/[0.02]">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">Global Distribution Support</h2>
                            <p className="text-gray-400">Once published, your book can be made available through supported online marketplaces.</p>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-6">
                            {[
                                { title: 'Indian Online Platforms', desc: 'Amazon.in, Flipkart, and more.' },
                                { title: 'International Marketplaces', desc: 'Amazon US, UK, Europe, etc.' },
                                { title: 'Print-on-Demand Networks', desc: 'Global shipping to readers.' }
                            ].map((item, i) => (
                                <div key={i} className="p-6 rounded-2xl bg-[#0a0b10] border border-white/5 text-center">
                                    <h4 className="font-bold mb-2 text-purple-400">{item.title}</h4>
                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-xs text-gray-600 mt-8 italic">(Availability depends on package level.)</p>
                    </div>
                </section>

                {/* Rights & Ownership */}
                <section className="py-24 px-6">
                    <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-white/10 p-10 md:p-16 relative overflow-hidden">
                        <div className="absolute -top-12 -right-12 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

                        <h2 className="text-3xl font-bold mb-8 text-center">Author Ownership & Control</h2>
                        <div className="grid gap-6">
                            {[
                                'You retain 100% copyright',
                                'You maintain full ownership of your content',
                                'Royalty settings remain transparent',
                                'You control pricing decisions'
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-lg font-medium text-gray-200">{item}</span>
                                </div>
                            ))}
                        </div>
                        <p className="mt-12 text-gray-400 text-center leading-relaxed italic">
                            We provide the publishing infrastructure — you remain the author and rights holder.
                        </p>
                    </div>
                </section>

                {/* CTA */}
                <section className="pb-24 px-6 text-center">
                    <Link href={route('services')} className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black font-black rounded-full hover:bg-gray-200 transition-all hover:scale-105">
                        Start Your Publishing Journey
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </section>
            </div>
        </>
    );
}

