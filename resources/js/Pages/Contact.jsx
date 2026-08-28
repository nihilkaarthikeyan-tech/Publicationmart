import React from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function Contact() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });

    return (
        <div className="min-h-screen bg-[#1c1912] text-white font-sans selection:bg-indigo-500 selection:text-white pt-24 pb-20">
            <Head title="Contact PublicationMart – Get Publishing Help Today">
                <meta name="description" content="Contact PublicationMart for publishing support, technical help, or partnership inquiries. Email: editor.publicationmart@gmail.com | Phone: +91 76049 57084 | Coimbatore, India." />
                <meta property="og:title" content="Contact PublicationMart" />
                <meta property="og:description" content="Have questions about publishing? Need help with our tools? Contact our team for publishing support." />
                <meta property="og:url" content="https://publicationmart.com/contact" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://publicationmart.com/images/logo_new.png" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content="Contact PublicationMart" />
                <meta name="twitter:description" content="Get publishing help today. Email, phone, or send us a message." />
            </Head>

            <div className="max-w-7xl mx-auto px-6">

                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                        Get in Touch
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Have questions about publishing? Need help with our tools? We're here to help you succeed.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Info & FAQ */}
                    <div className="lg:col-span-5 space-y-8">

                        {/* Contact Info Card */}
                        <div className="bg-[#262019] border border-violet-800/50 rounded-3xl p-8 hover:border-violet-600/50 transition-colors duration-300">
                            <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                                <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                                Contact Information
                            </h2>

                            <div className="space-y-8">
                                {/* Email */}
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-900/20 flex items-center justify-center text-indigo-400 shrink-0">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Email</div>
                                        <a href="mailto:editor.publicationmart@gmail.com" className="text-white hover:text-indigo-400 transition text-lg">
                                            editor.publicationmart@gmail.com
                                        </a>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-900/20 flex items-center justify-center text-indigo-400 shrink-0">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Address</div>
                                        <p className="text-gray-300 leading-relaxed text-sm">
                                            RLK Enterprises, Rademics Research Institute,<br />
                                            4/975-A, Sathy Road, Ganeshapuram,<br />
                                            Sarkarsamakulam, Coimbatore,<br />
                                            Tamilnadu – 641107, India.
                                        </p>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-900/20 flex items-center justify-center text-indigo-400 shrink-0">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Phone</div>
                                        <a href="tel:+917604957084" className="text-white hover:text-indigo-400 transition text-lg">
                                            +91 76049 57084
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Card */}
                        <div className="bg-gradient-to-br from-[#2e2720] to-[#262019] border border-violet-700/40 rounded-3xl p-8 relative overflow-hidden group">
                            {/* Decorative Glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-600/20 transition-all duration-500"></div>

                            <h3 className="text-xl font-bold mb-3 text-white">FAQ</h3>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                Check our Frequently Asked Questions for quick answers to common questions about formatting, royalties, and distribution.
                            </p>
                            <a href="#" className="inline-flex items-center text-indigo-400 font-bold text-sm hover:text-indigo-300 transition-colors group-hover:translate-x-1 duration-300">
                                Visit Help Center <span className="ml-2">→</span>
                            </a>
                        </div>
                    </div>

                    {/* Right Column: Contact Form */}
                    <div className="lg:col-span-7">
                        <div className="bg-[#262019] border border-violet-800/50 rounded-3xl p-8 md:p-10 h-full">
                            <h2 className="text-2xl font-bold mb-8">Send us a message</h2>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                post(route('contact.store'), {
                                    onSuccess: () => {
                                        reset();
                                        alert('Message sent successfully!');
                                        // Meta Pixel: Track contact form submission
                                        if (typeof window.fbq === 'function') {
                                            fbq('track', 'Lead');
                                            fbq('track', 'Contact');
                                        }
                                    }
                                });
                            }} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Name</label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            className="w-full bg-[#241f16] border border-violet-700/50 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition placeholder-violet-400/40"
                                            placeholder="Your name"
                                        />
                                        {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            className="w-full bg-[#241f16] border border-violet-700/50 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition placeholder-violet-400/40"
                                            placeholder="you@example.com"
                                        />
                                        {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Subject</label>
                                    <div className="relative">
                                        <select
                                            value={data.subject}
                                            onChange={e => setData('subject', e.target.value)}
                                            className="w-full bg-[#241f16] border border-violet-700/50 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition appearance-none"
                                        >
                                            <option>General Inquiry</option>
                                            <option>Publishing Support</option>
                                            <option>Technical Issue</option>
                                            <option>Partnership</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Message</label>
                                    <textarea
                                        value={data.message}
                                        onChange={e => setData('message', e.target.value)}
                                        className="w-full bg-[#241f16] border border-violet-700/50 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition placeholder-violet-400/40 min-h-[160px]"
                                        placeholder="How can we help you?"
                                    ></textarea>
                                    {errors.message && <div className="text-red-500 text-xs mt-1">{errors.message}</div>}
                                </div>

                                <button
                                    disabled={processing}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/20 transform hover:scale-[1.01] transition-all duration-200"
                                >
                                    {processing ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
