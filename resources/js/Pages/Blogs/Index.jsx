import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';


export default function Index({ blogs }) {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showInfo, setShowInfo] = useState(false);

    // Filter logic
    const filteredBlogs = blogs.filter(blog => {
        const matchesSearch = blog.title.toLowerCase().includes(search.toLowerCase()) ||
            blog.excerpt.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['All', 'Fiction', 'Non-Fiction', 'Academic', 'Poetry'];

    return (
        <>
            <Head title="Book Studio – Author Insights, Writing Tips & Publishing Guides | PublicationMart">
                <meta name="description" content="Expert articles on writing, publishing, and book marketing. Join the PublicationMart community to share your knowledge and discover insights from fellow authors." />
                <meta property="og:title" content="Book Studio | PublicationMart" />
                <meta property="og:description" content="Expert advice on writing, publishing, and book marketing. A community-driven knowledge hub for authors." />
                <meta property="og:url" content="https://publicationmart.com/studio" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://publicationmart.com/images/logo_new.png" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content="Book Studio | PublicationMart" />
                <meta name="twitter:description" content="Writing tips, publishing guides, and author insights." />
            </Head>



            <div className="min-h-screen bg-[#f0ece3] text-[#17150f] font-sans selection:bg-purple-500 selection:text-[#17150f] pb-20 pt-24">

                {/* Hero Section - Redesigned */}
                <div className="px-6 text-center max-w-5xl mx-auto relative">

                    {/* Create Button (Top Right) */}
                    <div className="absolute top-0 right-0 hidden md:block">
                        <Link href={route('blogs.create')} className="bg-[#faf8f3] border border-[#d8d1c1] hover:border-[#7c7364] text-[#635c4e] hover:text-[#17150f] px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            Create Studio
                        </Link>
                    </div>

                    <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-500/30 text-purple-700 text-xs font-bold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                        Knowledge Hub
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                        Insights for <span className=" text-[#6e2530]">Authors</span>
                    </h1>
                    <p className="text-xl text-[#635c4e] mb-12 max-w-2xl mx-auto">
                        Expert advice on writing, publishing, and book marketing.
                    </p>

                    {/* Redesigned Search & Filter Bar */}
                    <div className="bg-[#faf8f3]/80 backdrop-blur-md border border-[#d8d1c1] rounded-2xl p-2 max-w-4xl mx-auto shadow-2xl shadow-purple-900/10 flex flex-col md:flex-row gap-2">

                        {/* Search Input */}
                        <div className="relative flex-grow group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#635c4e] group-focus-within:text-purple-500 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search by title or topic..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-transparent border-none text-[#17150f] placeholder-gray-500 focus:ring-0 pl-11 py-3"
                            />
                        </div>

                        {/* Divider */}
                        <div className="hidden md:block w-px bg-[#faf8f3] my-2"></div>

                        {/* Categories - Horizontal Scroll hidden but functional */}
                        <div className="flex gap-1 overflow-x-auto md:max-w-md items-center px-2 scrollbar-hide py-2 md:py-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-[#6e2530] text-[#faf8f3] shadow-md' : 'text-[#17150f]/80 hover:text-[#17150f] hover:bg-[#faf8f3]'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════ */}
                {/* BOOK STUDIO — COMMUNITY PUBLISHING MODEL INFO SECTION  */}
                {/* ═══════════════════════════════════════════════════════ */}
                <div className="max-w-6xl mx-auto px-6 mt-16 mb-8">
                    {/* Toggle Header */}
                    <button
                        onClick={() => setShowInfo(!showInfo)}
                        className="w-full group"
                    >
                        <div className="bg-gradient-to-r from-purple-900/40 via-[#faf8f3] to-purple-900/40 border border-violet-700/50 rounded-2xl p-6 flex items-center justify-between hover:border-purple-500/60 transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-900/40 shrink-0">
                                    <svg className="w-6 h-6 text-[#17150f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div className="text-left">
                                    <h2 className="text-lg md:text-xl font-bold text-[#17150f] group-hover:text-purple-700 transition-colors">
                                        Book Studio — Community Publishing Model
                                    </h2>
                                    <p className="text-sm text-[#635c4e] mt-0.5">Learn how our community-driven publishing platform works</p>
                                </div>
                            </div>
                            <div className={`w-8 h-8 rounded-full bg-[#faf8f3] border border-[#d8d1c1] flex items-center justify-center transition-transform duration-300 ${showInfo ? 'rotate-180' : ''}`}>
                                <svg className="w-4 h-4 text-[#635c4e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </button>

                    {/* Expandable Content */}
                    {showInfo && (
                        <div className="mt-4 space-y-6 animate-fadeIn">

                            {/* Mission Statement */}
                            <div className="bg-[#faf8f3]/60 border border-[#d8d1c1] rounded-2xl p-6 md:p-8">
                                <p className="text-[#4b443a] text-base leading-relaxed">
                                    Book Studio is a <span className="text-purple-700 font-semibold">community-driven publishing platform</span> built to grow. Our mission is to create a strong reader–author ecosystem by validating genuine audience interest before advancing to full-scale publishing opportunities.
                                </p>
                            </div>

                            {/* Community Launch Mode */}
                            <div className="bg-[#faf8f3]/60 border border-[#d8d1c1] rounded-2xl p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-purple-600/30 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-[#17150f]">Community Launch Mode</h3>
                                </div>
                                <p className="text-[#635c4e] text-sm mb-6">
                                    In this initial phase, authors can submit their work and launch a campaign to gather reader support and validate market interest before publication.
                                </p>

                                {/* How It Works Steps */}
                                <h4 className="text-sm font-bold text-purple-700 uppercase tracking-widest mb-4">How It Works</h4>
                                <div className="space-y-3">
                                    {[
                                        { step: 1, text: 'Authors submit their manuscript for review and approval.' },
                                        { step: 2, text: 'Once approved, the book is featured on the Book Studio campaign page.' },
                                        { step: 3, text: 'Readers can place a pre-order reservation to express interest in the book.' },
                                        { step: 4, text: 'Each reservation requires verified email confirmation to ensure authenticity.' },
                                        { step: 5, text: 'Live support progress is displayed publicly on the campaign page to encourage transparency and engagement.' },
                                    ].map(item => (
                                        <div key={item.step} className="flex items-start gap-3 bg-white/[0.03] rounded-xl p-3 border border-[#d8d1c1]">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5 shadow-md">
                                                {item.step}
                                            </div>
                                            <p className="text-[#4b443a] text-sm leading-relaxed">{item.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Milestone Structure */}
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Milestone 1 — 100 Reservations */}
                                <div className="bg-gradient-to-br from-[#faf8f3] to-[#f0ece3] border border-[#d8d1c1] rounded-2xl p-6 md:p-8 relative overflow-hidden group hover:border-[#7c7364] transition-all">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-all"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                                                <svg className="w-5 h-5 text-[#17150f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">Milestone 1</span>
                                                <h4 className="text-[#17150f] font-bold">100 Verified Reservations</h4>
                                            </div>
                                        </div>
                                        <p className="text-[#635c4e] text-sm mb-4">When a book reaches 100 verified support reservations:</p>
                                        <div className="space-y-2.5">
                                            <div className="flex items-center gap-2.5">
                                                <svg className="w-5 h-5 text-emerald-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                                <span className="text-[#4b443a] text-sm font-medium">The book advances to the publication stage</span>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <svg className="w-5 h-5 text-emerald-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                                <span className="text-[#4b443a] text-sm font-medium">Publication costs will be covered by the publisher</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Milestone 2 — 250 Sales */}
                                <div className="bg-gradient-to-br from-[#faf8f3] to-[#f0ece3] border border-[#d8d1c1] rounded-2xl p-6 md:p-8 relative overflow-hidden group hover:border-[#7c7364] transition-all">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-pink-600/10 rounded-full blur-3xl group-hover:bg-pink-600/20 transition-all"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                                                <svg className="w-5 h-5 text-[#17150f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-pink-700 uppercase tracking-widest">Milestone 2</span>
                                                <h4 className="text-[#17150f] font-bold">250 Sales Within 90 Days</h4>
                                            </div>
                                        </div>
                                        <p className="text-[#635c4e] text-sm mb-4">When a book reaches 250 verified sales within 90 days of its official launch:</p>
                                        <div className="space-y-2.5">
                                            <div className="flex items-center gap-2.5">
                                                <svg className="w-5 h-5 text-emerald-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                                <span className="text-[#4b443a] text-sm font-medium">Author receives a professionally developed website in their name</span>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <svg className="w-5 h-5 text-emerald-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                                <span className="text-[#4b443a] text-sm font-medium">Domain registration, hosting, and maintenance costs for the first year fully covered</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Featured Post (First Item) */}
                {filteredBlogs.length > 0 && (
                    <div className="max-w-7xl mx-auto px-6 mb-16 mt-16">
                        <Link href={route('blogs.show', filteredBlogs[0].slug)} className="group block relative rounded-3xl overflow-hidden aspect-[21/9] border border-[#d8d1c1]">
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-90"></div>
                            <img
                                src={filteredBlogs[0].image_path ? `/storage/${filteredBlogs[0].image_path}` : (filteredBlogs[0].image_url || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=2070')}
                                alt={filteredBlogs[0].title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute bottom-0 left-0 p-8 md:p-12 z-20 max-w-3xl">
                                <span className="inline-block px-3 py-1 bg-[#6e2530] text-white text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
                                    {filteredBlogs[0].category}
                                </span>
                                <h2 className="text-3xl md:text-5xl font-bold mb-4 group-hover:text-purple-700 transition-colors">
                                    {filteredBlogs[0].title}
                                </h2>
                                <p className="text-[#4b443a] text-lg line-clamp-2 mb-6">
                                    {filteredBlogs[0].excerpt}
                                </p>
                                <div className="flex items-center gap-3 text-sm font-bold text-[#17150f]">
                                    <img src={`https://ui-avatars.com/api/?name=${filteredBlogs[0].author_name}&background=random`} alt={filteredBlogs[0].author_name} className="w-8 h-8 rounded-full" />
                                    <span>{filteredBlogs[0].author_name}</span>
                                    <span className="text-[#635c4e]">•</span>
                                    <span className="text-[#635c4e]">{new Date(filteredBlogs[0].published_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </Link>
                    </div>
                )}

                {/* Grid for Rest */}
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredBlogs.slice(1).map(blog => (
                        <Link key={blog.id} href={route('blogs.show', blog.slug)} className="group bg-[#faf8f3] border border-[#d8d1c1] rounded-2xl overflow-hidden hover:border-[#7c7364] transition-colors flex flex-col h-full">
                            <div className="aspect-video relative overflow-hidden">
                                <img
                                    src={blog.image_path ? `/storage/${blog.image_path}` : (blog.image_url || 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&q=80&w=1000')}
                                    alt={blog.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 bg-[#faf8f3] backdrop-blur-md text-[#17150f] text-xs font-bold rounded-full border border-[#d8d1c1]">
                                        {blog.category}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-xl font-bold mb-3 group-hover:text-purple-700 transition-colors line-clamp-2">
                                    {blog.title}
                                </h3>
                                <p className="text-[#635c4e] text-sm mb-6 line-clamp-3 flex-grow">
                                    {blog.excerpt}
                                </p>
                                <div className="flex items-center justify-between text-xs text-[#635c4e] font-bold pt-4 border-t border-[#d8d1c1]">
                                    <span className="text-[#17150f]">{blog.author_name}</span>
                                    <span>{new Date(blog.published_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Empty State */}
                {filteredBlogs.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-[#635c4e] text-lg">No articles found matching your search.</p>
                    </div>
                )}

            </div>
        </>
    );
}
