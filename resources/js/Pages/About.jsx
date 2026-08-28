import React from 'react';
import { Head } from '@inertiajs/react';

export default function About() {
    return (
        <div className="min-h-screen bg-[#1c1912] text-white font-sans selection:bg-purple-500 selection:text-white pt-24 pb-20">
            <Head title="About PublicationMart – India's AI-Powered Self-Publishing Platform">
                <meta name="description" content="Learn about PublicationMart, India's leading self-publishing platform. We empower authors with AI-powered tools, professional editing, ISBN, printing, and global distribution services." />
                <meta property="og:title" content="About PublicationMart – India's Self-Publishing Platform" />
                <meta property="og:description" content="Revolutionizing the publishing industry by bridging traditional craftsmanship with modern AI technology. Publish your book globally with PublicationMart." />
                <meta property="og:url" content="https://publicationmart.com/about" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://publicationmart.com/images/logo_new.png" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content="About PublicationMart" />
                <meta name="twitter:description" content="India's AI-powered self-publishing platform for authors. 100% ownership, global distribution, professional tools." />
            </Head>

            <div className="max-w-7xl mx-auto px-6">

                {/* Hero Section */}
                <div className="text-center py-20 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
                        We Are <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">PublicationMart</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Revolutionizing the publishing industry by bridging the gap between traditional craftsmanship and modern AI technology.
                    </p>
                </div>

                {/* Creative Grid / Bento Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
                    {/* Mission */}
                    <div className="bg-[#262019] border border-violet-800/50 rounded-3xl p-10 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                To empower every author, researcher, and storyteller with the tools they need to share their voice with the world. We believe that great ideas shouldn't get lost in the complexities of publishing. Whether you're a first-time novelist or a seasoned academic, we provide the platform to launch your work globally.
                            </p>
                        </div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-all"></div>
                    </div>

                    {/* Vision */}
                    <div className="bg-[#262019] border border-violet-800/50 rounded-3xl p-10 relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold mb-4">The Future of Writing</h2>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                We are pioneering <span className="text-white">AI-Assisted Publishing</span>. Our new AI Book Studio helps authors outline, draft, and format their books in record time, without losing their unique creative touch. We are building an ecosystem where technology serves creativity, not replaces it.
                            </p>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/20 transition-all"></div>
                    </div>
                </div>

                {/* Team / Culture Section */}
                <div className="text-center mb-24">
                    <h2 className="text-3xl font-bold mb-12">Driven by Passion, Powered by Tech</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { title: 'Global Distribution', icon: '🌍' },
                            { title: 'Smart Formatting', icon: '⚡' },
                            { title: 'Expert Support', icon: '🤝' },
                            { title: 'Royalties Transparency', icon: '💎' }
                        ].map((item, i) => (
                            <div key={i} className="bg-[#262019] border border-violet-800/50 rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300">
                                <div className="text-4xl mb-4">{item.icon}</div>
                                <h3 className="font-bold text-gray-200">{item.title}</h3>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-900 to-indigo-900 px-6 py-20 text-center">
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to start your journey?</h2>
                        <p className="text-purple-200 mb-8 max-w-xl mx-auto">
                            Join thousands of authors who have trusted PublicationMart.
                        </p>
                        <a href="/register" className="inline-block bg-white text-purple-900 font-bold py-4 px-10 rounded-full hover:bg-gray-100 transition-colors shadow-xl">
                            Start Publishing Now
                        </a>
                    </div>
                    {/* Abstract Shapes */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-30">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full mix-blend-overlay blur-xl"></div>
                        <div className="absolute bottom-10 right-10 w-40 h-40 bg-indigo-500 rounded-full mix-blend-overlay blur-xl"></div>
                    </div>
                </div>

            </div>
        </div>
    );
}
