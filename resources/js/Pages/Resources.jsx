import { Head, Link } from '@inertiajs/react';

export default function Resources() {
    return (
        <div className="min-h-screen bg-parchment text-ink font-sans selection:bg-indigo-500/30">
            <Head title="Author Resources - PublicationMart" />

            <div className="relative pt-32 pb-16">
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[128px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="text-emerald-700 font-bold tracking-widest text-xs uppercase mb-4 block">Knowledge Hub</span>
                        <h1 className="text-5xl md:text-6xl font-black mb-6">
                            Everything You Need to <span className=" text-oxblood">Succeed</span>
                        </h1>
                        <p className="text-xl text-umber">
                            Guides, tools, and insights to help you navigate the self-publishing journey with confidence.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Resource 1: Publishing Guide */}
                        <Link href="/how-to-publish" className="group bg-paper rounded-2xl p-8 border border-linen hover:border-emerald-500/30 transition-all hover:-translate-y-1">
                            <div className="h-48 rounded-xl bg-gradient-to-br from-violet-900/60 to-violet-800/40 mb-6 overflow-hidden relative">
                                <div className="absolute inset-0 bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors"></div>
                                <div className="absolute bottom-4 left-4">
                                    <span className="px-3 py-1 bg-paper backdrop-blur-md rounded-lg text-xs font-bold text-ink border border-linen">GUIDE</span>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 group-hover:text-emerald-700 transition-colors">How to Publish</h3>
                            <p className="text-umber mb-4">
                                A step-by-step walkthrough of the PublicationMart platform. Learn how to upload, format, and distribute your book in minutes.
                            </p>
                            <span className="text-emerald-700 font-bold text-sm">Start Learning →</span>
                        </Link>

                        {/* Resource 2: Royalty Calculator */}
                        <Link href="/royalties-calculator" className="group bg-paper rounded-2xl p-8 border border-linen hover:border-emerald-500/30 transition-all hover:-translate-y-1">
                            <div className="h-48 rounded-xl bg-gradient-to-br from-violet-900/60 to-violet-800/40 mb-6 overflow-hidden relative">
                                <div className="absolute inset-0 bg-indigo-500/20 group-hover:bg-indigo-500/30 transition-colors"></div>
                                <div className="absolute bottom-4 left-4">
                                    <span className="px-3 py-1 bg-paper backdrop-blur-md rounded-lg text-xs font-bold text-ink border border-linen">TOOL</span>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 group-hover:text-indigo-700 transition-colors">Royalty Calculator</h3>
                            <p className="text-umber mb-4">
                                Estimate your earnings before you publish. Input your book specifications to see exactly how much you'll make per sale.
                            </p>
                            <span className="text-indigo-700 font-bold text-sm">Calculate Now →</span>
                        </Link>

                        {/* Resource 3: FAQ / Help Center */}
                        <Link href="/help-center" className="group bg-paper rounded-2xl p-8 border border-linen hover:border-emerald-500/30 transition-all hover:-translate-y-1">
                            <div className="h-48 rounded-xl bg-gradient-to-br from-violet-900/60 to-violet-800/40 mb-6 overflow-hidden relative">
                                <div className="absolute inset-0 bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors"></div>
                                <div className="absolute bottom-4 left-4">
                                    <span className="px-3 py-1 bg-paper backdrop-blur-md rounded-lg text-xs font-bold text-ink border border-linen">SUPPORT</span>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 group-hover:text-purple-700 transition-colors">Help Center</h3>
                            <p className="text-umber mb-4">
                                Answers to common questions about account management, payment settings, ISBNs, and distribution channels.
                            </p>
                            <span className="text-purple-700 font-bold text-sm">Get Help →</span>
                        </Link>
                    </div>

                    {/* Blog Preview Section (Static for now) */}
                    <div className="mt-24">
                        <div className="flex justify-between items-end mb-10">
                            <h2 className="text-3xl font-bold">Latest from the Studio</h2>
                            <Link href={route('blogs.index')} className="text-umber hover:text-ink transition-colors">View All Articles</Link>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="border-b border-linen pb-8 hover:border-linen transition-colors">
                                    <span className="text-xs text-umber font-mono mb-2 block">Oct {10 + i}, 2025</span>
                                    <h3 className="text-xl font-bold mb-2 hover:text-indigo-700 transition-colors cursor-pointer">
                                        {i === 1 ? "Top 10 Book Marketing Strategies for 2026" :
                                            i === 2 ? "Understanding ISBNs: Do You Really Need One?" :
                                                "How AI is Revolutionizing the Writing Process"}
                                    </h3>
                                    <p className="text-umber text-sm line-clamp-3">
                                        Discover the latest insights and strategies to help you navigate the ever-changing landscape of modern publishing...
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

