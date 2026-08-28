import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Careers() {
    return (
        <>
            <Head title="Careers - Join Our Team | PublicationMart" />

            <div className="bg-parchment text-ink selection:bg-indigo-500/30 min-h-[70vh] flex flex-col items-center justify-center relative overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 blur-[150px] rounded-full -z-10" />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/5 blur-[100px] rounded-full -z-10" />

                <section className="max-w-4xl mx-auto px-6 text-center py-24 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in">
                        Join PublicationMart
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-tight">
                        Shape the Future of <br />
                        <span className=" text-oxblood">Digital Publishing.</span>
                    </h1>

                    <div className="p-10 md:p-16 rounded-[48px] bg-white/[0.02] border border-linen backdrop-blur-xl relative group hover:bg-white/[0.04] transition-all duration-700">
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                        <p className="text-xl md:text-2xl text-ink-soft leading-relaxed mb-10">
                            We are always looking for passionate creators, developers, and publishing experts to join our growing team.
                        </p>

                        <div className="space-y-6">
                            <div className="inline-block p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/20">
                                <p className="text-lg font-medium text-ink mb-4">Interested in working with us?</p>
                                <a
                                    href="mailto:info@publicationmart.com"
                                    className="text-2xl md:text-3xl font-black text-indigo-700 hover:text-indigo-700 transition-colors break-all"
                                >
                                    info@publicationmart.com
                                </a>
                            </div>

                            <p className="text-umber text-sm max-w-md mx-auto leading-relaxed">
                                Send your resume to the email above. We will contact you once suitable vacancies arise.
                            </p>
                        </div>
                    </div>

                    {/* Floating Decorative Elements */}
                    <div className="mt-20 flex justify-center gap-8 grayscale opacity-20 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                        <div className="flex flex-col items-center">
                            <span className="text-4xl">👨💻</span>
                            <span className="text-[10px] font-bold mt-2 tracking-widest uppercase">Tech</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-4xl">🎨</span>
                            <span className="text-[10px] font-bold mt-2 tracking-widest uppercase">Design</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-4xl">📖</span>
                            <span className="text-[10px] font-bold mt-2 tracking-widest uppercase">Content</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-4xl">🚀</span>
                            <span className="text-[10px] font-bold mt-2 tracking-widest uppercase">Growth</span>
                        </div>
                    </div>
                </section>

                <style>{`
                    @keyframes fade-in {
                        from { opacity: 0; transform: translateY(-10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in {
                        animation: fade-in 1s ease-out forwards;
                    }
                `}</style>
            </div>
        </>
    );
}

