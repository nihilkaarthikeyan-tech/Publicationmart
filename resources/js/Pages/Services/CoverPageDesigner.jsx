import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function CoverPageDesigner() {
    return (
        <>
            <Head title="DIY Cover Page Designer - PublicationMart" />

            <div className="bg-[#17150f] text-white selection:bg-indigo-500/30 overflow-hidden">
                {/* Hero Section */}
                <section className="relative pt-20 pb-16 px-6">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full -z-10" />

                    <div className="max-w-5xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
                            DIY Design Tool
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                            Design Your Book Cover <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Your Way.</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            Your book cover is the first impression readers see. With PublicationMart’s DIY Cover Page Designer,
                            you can create a professional-looking cover without needing graphic design skills.
                        </p>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 px-6 relative">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-bold mb-4">What You Can Do</h2>
                                    <p className="text-gray-400 mb-6 font-medium">Take control of your book’s visual identity using an easy, guided design tool built specifically for authors.</p>
                                    <ul className="space-y-4">
                                        {[
                                            'Choose from professionally designed templates',
                                            'Customize title, subtitle, and author name',
                                            'Select fonts and typography styles',
                                            'Adjust text alignment and placement',
                                            'Upload your own images',
                                            'Use built-in design elements and backgrounds',
                                            'Preview front cover layout before finalizing'
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-gray-300">
                                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 italic text-gray-400">
                                    "You stay creative, while the tool ensures structure."
                                </div>
                            </div>

                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                                <div className="relative bg-[#0a0b10] border border-white/10 rounded-2xl p-8 space-y-6">
                                    <h3 className="text-2xl font-bold text-white">Built for Publishing Standards</h3>
                                    <p className="text-gray-400">The system helps you maintain quality and compliance:</p>
                                    <div className="space-y-4">
                                        {[
                                            'Maintain correct cover dimensions',
                                            'Align text within safe zones',
                                            'Adjust for various book sizes',
                                            'Prepare marketplace-ready cover files'
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span className="text-sm font-medium text-gray-200">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-4">
                                        This reduces the risk of cover rejection during publishing.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Responsibility & Benefits */}
                <section className="py-20 px-6 bg-white/[0.01]">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Author Responsibility */}
                            <div className="p-8 rounded-3xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10">
                                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <span className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </span>
                                    Author Responsibility
                                </h3>
                                <p className="text-gray-400 mb-6 text-sm">Since this is a DIY tool, authors should:</p>
                                <ul className="space-y-4 mb-8">
                                    {[
                                        'Review spelling and typography carefully',
                                        'Ensure image quality and resolution are high',
                                        'Confirm visual alignment and balance',
                                        'Verify branding consistency'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-xs text-gray-500 font-medium pt-4 border-t border-white/5">
                                    Final approval remains with the author before publishing.
                                </p>
                            </div>

                            {/* Why Use the DIY Cover Designer? */}
                            <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-500/5 to-transparent border border-indigo-500/10">
                                <h3 className="text-2xl font-bold mb-6 text-indigo-400">Why Use the DIY Cover Designer?</h3>
                                <div className="grid gap-4">
                                    {[
                                        'No need for external design software',
                                        'No expensive graphic designer required',
                                        'Full creative freedom',
                                        'Fast and simple customization'
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 group hover:bg-indigo-500/10 transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="font-bold text-gray-200">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-24 px-6 text-center">
                    <div className="max-w-4xl mx-auto p-12 rounded-[32px] bg-gradient-to-b from-white/[0.03] to-transparent border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Designing Your Vision</h2>
                        <p className="text-gray-400 mb-10 text-lg">Create a cover that captures the essence of your story today.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href={route('books.create')} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                                Use DIY Designer
                            </Link>
                            <Link href={route('contact')} className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-full border border-white/10 transition-all">
                                Hire a Designer instead
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

