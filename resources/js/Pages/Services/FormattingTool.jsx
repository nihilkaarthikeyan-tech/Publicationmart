import React, { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';

export default function FormattingToolLanding() {
    return (
        <>
            <Head title="DIY Book Formatting Tool - PublicationMart" />

            <div className="bg-[#0f0a1e] text-white selection:bg-indigo-500/30 overflow-hidden">
                {/* Hero Section */}
                <section className="relative pt-20 pb-16 px-6">
                    <div className="absolute top-0 right-1/4 w-[800px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full -z-10" />

                    <div className="max-w-5xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
                            Professional Formatting
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                            Format Your Book Professionally — <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">On Your Terms.</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            PublicationMart’s DIY Formatting Tool empowers authors to format their manuscripts easily using a guided, step-by-step system.
                            No design software. No technical expertise required.
                        </p>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div className="order-2 md:order-1 relative">
                                {/* Decorative UI mockup element */}
                                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[40px] blur-2xl -z-10" />
                                <div className="bg-[#0a0b10] border border-white/10 rounded-3xl p-8 shadow-2xl">
                                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500/40" />
                                            <div className="w-3 h-3 rounded-full bg-amber-500/40" />
                                            <div className="w-3 h-3 rounded-full bg-emerald-500/40" />
                                        </div>
                                        <div className="px-3 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Formatting Engine v2.4</div>
                                    </div>
                                    <div className="space-y-6">
                                        {[
                                            { label: 'Trim Size', value: '6" x 9" Standard' },
                                            { label: 'Typography', value: 'Classic Serif' },
                                            { label: 'Margins', value: 'Optimized for Print' },
                                            { label: 'TOC', value: 'Auto-generated' }
                                        ].map((stat, i) => (
                                            <div key={i} className="flex justify-between items-center group">
                                                <span className="text-gray-500 text-sm group-hover:text-gray-400 transition-colors">{stat.label}</span>
                                                <span className="text-indigo-400 font-bold bg-indigo-400/5 px-2 py-0.5 rounded text-xs">{stat.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-white/5">
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full w-[85%] bg-gradient-to-r from-indigo-500 to-cyan-400" />
                                        </div>
                                        <div className="mt-2 text-[10px] text-gray-500 text-right font-medium">PREPARING PRINT-READY PDF</div>
                                    </div>
                                </div>
                            </div>

                            <div className="order-1 md:order-2 space-y-8">
                                <h2 className="text-3xl font-bold">What You Can Do</h2>
                                <p className="text-gray-400">The tool simplifies formatting while allowing full customization of the reading experience.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        'Select trim size',
                                        'Choose font styles',
                                        'Adjust spacing & margins',
                                        'Style chapter titles',
                                        'Insert page numbers',
                                        'Generate Table of Contents',
                                        'Preview before export'
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all">
                                            <svg className="w-5 h-5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                                            </svg>
                                            <span className="text-sm font-medium text-gray-300">{item}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 inline-block text-sm text-indigo-300 italic">
                                    "You stay in control while the platform ensures publishing standards are met."
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Standards Section */}
                <section className="py-20 px-6 bg-white/[0.01]">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12">
                            {/* Standards */}
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-white mb-6">Built-In Publishing Standards</h3>
                                <p className="text-gray-400">As you format, the system works in the background:</p>
                                <ul className="space-y-4">
                                    {[
                                        'Guides you with recommended layout settings',
                                        'Prevents common formatting errors',
                                        'Maintains consistent alignment and spacing',
                                        'Prepares print-ready and eBook-ready files'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-gray-300">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                                            <span className="text-sm leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-xs text-gray-500 italic mt-4">
                                    This ensures your book meets marketplace requirements on the first try.
                                </p>
                            </div>

                            {/* Review Section */}
                            <div className="p-8 rounded-3xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10">
                                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </span>
                                    Review Before You Publish
                                </h3>
                                <p className="text-sm text-gray-500 mb-6">Since formatting is author-controlled, we recommend:</p>
                                <div className="space-y-4 mb-8">
                                    {[
                                        'Carefully reviewing chapter breaks',
                                        'Checking alignment and spacing',
                                        'Verifying page numbering',
                                        'Ensuring images appear correctly'
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-600 font-black pt-6 border-t border-white/5">
                                    Final approval and responsibility remain with the author.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Authors Love It */}
                <section className="py-20 px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-12">Why Authors Love It</h2>
                        <div className="grid sm:grid-cols-2 gap-4 text-left">
                            {[
                                { title: 'No Designers Needed', desc: 'No need for expensive layouts' },
                                { title: 'Zero Learning Curve', desc: 'No complex software like InDesign' },
                                { title: 'Creative Control', desc: 'Full control over every page' },
                                { title: 'Fast Delivery', desc: 'Faster publishing turnaround' }
                            ].map((benefit, i) => (
                                <div key={i} className="p-6 rounded-2xl bg-[#0a0b10] border border-white/5 hover:border-indigo-500/20 transition-all flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-200">{benefit.title}</div>
                                        <div className="text-xs text-gray-500">{benefit.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-24 px-6 text-center">
                    <div className="max-w-4xl mx-auto p-12 rounded-[40px] bg-gradient-to-br from-indigo-600/20 via-transparent to-transparent border border-white/10 relative overflow-hidden backdrop-blur-sm">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
                        <h2 className="text-3xl md:text-4xl font-black mb-6">Format it yourself — <br /><span className="text-indigo-400">professionally and confidently.</span></h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                            <Link href={route('books.create')} className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-full transition-all hover:scale-105 shadow-[0_0_30px_rgba(79,70,229,0.4)]">
                                Use Formatting Tool
                            </Link>
                            <Link href={route('professional.payment', { book: 'new' })} className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-full border border-white/10 transition-all">
                                Hire a Professional
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

