import { Head, Link } from '@inertiajs/react';

export default function Services() {
    return (
        <div className="min-h-screen bg-[#17150f] text-white font-sans selection:bg-indigo-500/30">
            <Head title="Publishing Services – Editing, Design, ISBN & Distribution | PublicationMart">
                <meta name="description" content="Professional book publishing services including manuscript editing, custom cover design, eBook conversion, ISBN allocation, and global distribution. Get expert help for your book." />
                <meta property="og:title" content="Professional Publishing Services | PublicationMart" />
                <meta property="og:description" content="Expert editing, stunning cover design, eBook conversion, and global distribution. Everything your book needs to succeed in the marketplace." />
                <meta property="og:url" content="https://publicationmart.com/services" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://publicationmart.com/images/logo_new.png" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content="Publishing Services | PublicationMart" />
                <meta name="twitter:description" content="Professional editing, cover design, eBook conversion, and global distribution services for authors." />
            </Head>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[128px]"></div>
                    <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[128px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
                        World-Class Solutions
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                        Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Publishing Services</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Beyond our AI tools, we offer premium services to ensure your book stands out in a crowded marketplace.
                    </p>
                </div>
            </div>

            {/* Services Grid */}
            <div className="py-20 bg-[#0a0b10]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Service 1: Professional Editing */}
                        <div className="bg-[#15161b] rounded-2xl p-8 border border-white/5 hover:border-indigo-500/30 transition-all group">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Professional Editing</h3>
                            <p className="text-gray-400 leading-relaxed mb-6">
                                Even users of AI need a human touch. Our team of expert editors reviews your manuscript for flow, tone, grammar, and consistency to ensure literary excellence.
                            </p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-2 text-sm text-gray-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Developmental Editing
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Copy Editing
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Proofreading
                                </li>
                            </ul>
                            <Link href="/contact" className="inline-flex items-center text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
                                Get a Quote <span className="ml-2">→</span>
                            </Link>
                        </div>

                        {/* Service 2: Premium Book Design */}
                        <div className="bg-[#15161b] rounded-2xl p-8 border border-white/5 hover:border-cyan-500/30 transition-all group">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Book Design</h3>
                            <p className="text-gray-400 leading-relaxed mb-6">
                                Don't judge a book by its cover? Readers do. Our award-winning designers create stunning covers and interior layouts that compete with top sellers.
                            </p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-2 text-sm text-gray-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span> Custom Cover Art
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span> Interior Typesetting
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span> Illustrations
                                </li>
                            </ul>
                            <Link href="/contact" className="inline-flex items-center text-cyan-400 font-bold hover:text-cyan-300 transition-colors">
                                View Portfolio <span className="ml-2">→</span>
                            </Link>
                        </div>

                        {/* Service 3: eBook Conversion */}
                        <div className="bg-[#15161b] rounded-2xl p-8 border border-white/5 hover:border-purple-500/30 transition-all group">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">eBook Conversion</h3>
                            <p className="text-gray-400 leading-relaxed mb-6">
                                Flawless formatting for Kindle, Apple Books, and Kobo. We manually code your eBook to ensure it looks perfect on every device, from phones to tablets.
                            </p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-2 text-sm text-gray-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Reflowable Layouts
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Fixed Layout Features
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Metadata Optimization
                                </li>
                            </ul>
                            <Link href="/contact" className="inline-flex items-center text-purple-400 font-bold hover:text-purple-300 transition-colors">
                                Start Conversion <span className="ml-2">→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-900/10"></div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl font-black mb-6">Need a Custom Solution?</h2>
                    <p className="text-xl text-gray-400 mb-8">
                        Every book is unique. Contact us today to discuss a tailored publishing package that meets your specific needs.
                    </p>
                    <Link href="/contact" className="inline-block px-10 py-5 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors">
                        Contact Our Team
                    </Link>
                </div>
            </div>
        </div>
    );
}

