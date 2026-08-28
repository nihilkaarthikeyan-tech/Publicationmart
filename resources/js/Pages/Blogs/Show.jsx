import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import { Share2, X, Copy, Mail, Twitter, Linkedin, Facebook, Send } from 'lucide-react'; // Added icons


export default function Show({ blog }) {
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied!');
        setIsShareOpen(false);
    };
    const [captchaQuestion, setCaptchaQuestion] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);

    const { data, setData, post, processing, errors, reset, wasSuccessful } = useForm({
        copies_count: 1,
        email: '',
        mobile_number: '',
        otp: '',
    });

    useEffect(() => {
        if (isBookingOpen) {
            fetchCaptcha();
            // Reset states when reopening
            setOtpSent(false);
            setCaptchaInput('');
            setData('otp', '');
        }
    }, [isBookingOpen]);

    const fetchCaptcha = async () => {
        try {
            const response = await axios.get(route('blogs.presale.captcha'));
            setCaptchaQuestion(response.data.question);
        } catch (error) {
            console.error("Failed to fetch captcha", error);
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!data.email) {
            alert("Please enter your email first.");
            return;
        }
        if (!captchaInput) {
            alert("Please solve the CAPTCHA.");
            return;
        }

        setSendingOtp(true);
        try {
            await axios.post(route('blogs.presale.otp'), {
                email: data.email,
                captcha: captchaInput,
                blog_id: blog.id
            });
            setOtpSent(true);
            alert("OTP sent to your email!");
        } catch (error) {
            alert(error.response?.data?.message || "Failed to send OTP.");
            fetchCaptcha(); // Refresh captcha on failure
            setCaptchaInput('');
        } finally {
            setSendingOtp(false);
        }
    };

    const handleBooking = (e) => {
        e.preventDefault();
        post(route('blogs.presale.book', blog.id), {
            onSuccess: () => {
                reset();
                setIsBookingOpen(false);
                alert('Presale booking submitted successfully!');
            }
        });
    };

    return (
        <>
            <Head title={blog.title} />

            <div className={`min-h-screen bg-parchment text-ink font-sans selection:bg-purple-500 selection:text-ink pb-20 pt-32 ${isBookingOpen ? 'overflow-hidden blur-sm' : ''}`}>

                {/* Article Header */}
                <div className="pb-10 px-6 max-w-4xl mx-auto text-center relative z-10">
                    {/* Share Studio Button - Top Right */}
                    <div className="absolute top-0 right-0 hidden md:block">
                        <button
                            onClick={() => setIsShareOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-50 backdrop-blur-md border border-gray-700/50 hover:border-taupe rounded-full text-ink-soft hover:text-ink transition-all group"
                        >
                            <Share2 className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-semibold uppercase tracking-wide">Share Studio</span>
                        </button>
                    </div>

                    <div className="flex justify-center gap-2 mb-6">
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-500/20 text-xs font-bold rounded-full uppercase tracking-wider">
                            {blog.category}
                        </span>
                        {blog.is_presale && (
                            <span className="px-3 py-1 bg-yellow-900/30 text-yellow-800 border border-yellow-500/20 text-xs font-bold rounded-full uppercase tracking-wider animate-pulse">
                                Presale Open
                            </span>
                        )}

                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
                        {blog.title}
                    </h1>

                    {blog.is_presale && (
                        <div className="mb-8">
                            <div className="flex flex-wrap justify-center gap-4 mb-8">
                                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-700 text-sm font-bold shadow-lg shadow-blue-900/20 backdrop-blur-sm">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    {blog.access_attempts} Views
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-full text-orange-800 text-sm font-bold shadow-lg shadow-orange-900/20 backdrop-blur-sm">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>
                                    {blog.presale_bookings_count || 0} People Pre-booked!
                                </div>
                            </div>
                            <br />
                            <button
                                onClick={() => setIsBookingOpen(true)}
                                className="px-8 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-ink font-bold rounded-xl shadow-lg shadow-orange-900/20 transform hover:scale-105 transition-all duration-200"
                            >
                                Book Presale Copies
                            </button>
                        </div>
                    )}

                    <div className="flex items-center justify-center gap-4">
                        <img src={`https://ui-avatars.com/api/?name=${blog.author_name}&background=random`} alt={blog.author_name} className="w-12 h-12 rounded-full border-2 border-black" />
                        <div className="text-left">
                            <div className="text-ink font-bold">{blog.author_name}</div>
                            <div className="text-umber text-sm">
                                {blog.published_at ? new Date(blog.published_at).toLocaleDateString() : <span className="text-yellow-500 font-bold uppercase text-xs">Draft Preview</span>}
                            </div>
                        </div>
                    </div>
                </div>





                {/* Featured Image */}
                <div className="max-w-5xl mx-auto px-6 mb-16">
                    <div className="rounded-3xl overflow-hidden aspect-[21/9] border border-gray-800 shadow-2xl shadow-purple-900/10">
                        <img
                            src={blog.image_path ? `/storage/${blog.image_path}` : (blog.image_url || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=2070')}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Article Content */}
                <article className="max-w-3xl mx-auto px-6 prose prose-invert prose-lg prose-purple text-justify hyphens-auto">
                    <div dangerouslySetInnerHTML={{ __html: blog.content }}></div>
                </article>

                {/* Back Button */}
                <div className="max-w-3xl mx-auto px-6 mt-20 pt-10 border-t border-gray-800 flex justify-between items-center">
                    <Link href={route('blogs.index')} className="text-umber hover:text-ink font-bold flex items-center gap-2 transition-colors">
                        ← Back to Book Studio
                    </Link>
                </div>
            </div >

            {/* Booking Modal */}


            {/* Share Modal */}
            {
                isShareOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                        <div className="absolute inset-0 bg-paper backdrop-blur-sm" onClick={() => setIsShareOpen(false)}></div>
                        <div className="relative bg-paper border border-gray-700 p-8 rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-200">
                            <button onClick={() => setIsShareOpen(false)} className="absolute top-4 right-4 text-umber hover:text-ink">
                                <X className="w-5 h-5" />
                            </button>

                            <h3 className="text-xl font-bold text-ink mb-6 text-center">Share this Article</h3>

                            <div className="grid grid-cols-4 gap-4 mb-6">
                                {/* WhatsApp */}
                                <a
                                    href={`https://wa.me/?text=${encodeURIComponent(blog.title + ' - ' + shareUrl)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center group-hover:bg-green-500 group-hover:text-black transition-all text-green-500">
                                        <Send className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs text-umber group-hover:text-ink">WhatsApp</span>
                                </a>

                                {/* Twitter/X */}
                                <a
                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(shareUrl)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-blue-400/10 border border-blue-400/20 flex items-center justify-center group-hover:bg-blue-400 group-hover:text-black transition-all text-blue-700">
                                        <Twitter className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs text-umber group-hover:text-ink">Twitter</span>
                                </a>

                                {/* LinkedIn */}
                                <a
                                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-blue-700/10 border border-blue-700/20 flex items-center justify-center group-hover:bg-blue-700 group-hover:text-white transition-all text-blue-700">
                                        <Linkedin className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs text-umber group-hover:text-ink">LinkedIn</span>
                                </a>

                                {/* Email */}
                                <a
                                    href={`mailto:?subject=${encodeURIComponent(blog.title)}&body=${encodeURIComponent('Check this out: ' + shareUrl)}`}
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-gray-500/10 border border-gray-500/20 flex items-center justify-center group-hover:bg-gray-500 group-hover:text-black transition-all text-umber">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs text-umber group-hover:text-ink">Email</span>
                                </a>
                            </div>

                            {/* Copy Link */}
                            <div className="flex items-center gap-2 bg-parchment border border-gray-700 rounded-lg p-2 pl-3">
                                <input
                                    type="text"
                                    readOnly
                                    value={shareUrl}
                                    className="bg-transparent border-none text-umber text-sm flex-1 focus:ring-0 truncate"
                                />
                                <button
                                    onClick={handleCopy}
                                    className="p-2 bg-paper hover:bg-gray-700 rounded-md text-ink-soft transition-colors"
                                    title="Copy to clipboard"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                isBookingOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <div className="absolute inset-0 bg-paper backdrop-blur-sm" onClick={() => setIsBookingOpen(false)}></div>
                        <div className="relative bg-paper border border-gray-700 p-8 rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                            <button onClick={() => setIsBookingOpen(false)} className="absolute top-4 right-4 text-umber hover:text-ink">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>

                            <h2 className="text-2xl font-bold text-ink mb-2">Book Presale Copies</h2>
                            <p className="text-umber text-sm mb-6">Reserve your copies of "{blog.title}" before the official launch.</p>

                            <form onSubmit={handleBooking} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-umber uppercase tracking-widest mb-1">Number of Copies</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={data.copies_count}
                                        onChange={e => setData('copies_count', e.target.value)}
                                        className="w-full bg-parchment border border-gray-600 rounded-lg px-4 py-3 text-ink focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
                                    />
                                    {errors.copies_count && <div className="text-red-500 text-xs mt-1">{errors.copies_count}</div>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-umber uppercase tracking-widest mb-1">Email Details</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className="w-full bg-parchment border border-gray-600 rounded-lg px-4 py-3 text-ink focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
                                        placeholder="your@email.com"
                                    />
                                    {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                                </div>

                                {!otpSent && (
                                    <div className="bg-gray-100 p-4 rounded-xl border border-gray-700/50">
                                        <label className="block text-xs font-bold text-umber uppercase tracking-widest mb-2">
                                            Prove you are human: <span className="text-ink text-lg ml-2">{captchaQuestion}</span>
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                value={captchaInput}
                                                onChange={e => setCaptchaInput(e.target.value)}
                                                className="w-full bg-parchment border border-gray-600 rounded-lg px-4 py-2 text-ink focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
                                                placeholder="Answer"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleSendOtp}
                                                disabled={sendingOtp || !captchaInput || !data.email}
                                                className="whitespace-nowrap px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 rounded-lg font-bold text-sm transition-colors"
                                            >
                                                {sendingOtp ? 'Sending...' : 'Send OTP'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {otpSent && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="block text-xs font-bold text-green-700 uppercase tracking-widest mb-1">
                                            Enter Verification OTP
                                        </label>
                                        <input
                                            type="text"
                                            value={data.otp}
                                            onChange={e => setData('otp', e.target.value)}
                                            className="w-full bg-parchment border border-green-500/50 rounded-lg px-4 py-3 text-ink focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                                            placeholder="6-digit OTP"
                                        />
                                        <div className="text-green-500 text-xs mt-1 flex justify-between">
                                            <span>OTP sent to {data.email}</span>
                                            <button type="button" onClick={() => { setOtpSent(false); fetchCaptcha(); }} className="text-umber hover:text-ink underline">Resend?</button>
                                        </div>
                                        {errors.otp && <div className="text-red-500 text-xs mt-1">{errors.otp}</div>}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-umber uppercase tracking-widest mb-1">Mobile Number</label>
                                    <input
                                        type="tel"
                                        value={data.mobile_number}
                                        onChange={e => setData('mobile_number', e.target.value)}
                                        className="w-full bg-parchment border border-gray-600 rounded-lg px-4 py-3 text-ink focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
                                        placeholder="+1 234 567 8900"
                                    />
                                    {errors.mobile_number && <div className="text-red-500 text-xs mt-1">{errors.mobile_number}</div>}
                                </div>

                                <button
                                    disabled={processing || !otpSent || !data.otp}
                                    className="w-full py-3.5 bg-yellow-600 hover:bg-yellow-500 text-ink font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                                >
                                    {processing ? 'Submitting...' : 'Confirm Booking'}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
        </>
    );
}
