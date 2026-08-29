import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import PremiumBackground from '@/Components/PremiumBackground';
import axios from 'axios';

export default function ChallengeIndex({ challengeSettings = {} }) {
    const [selectedChallenge, setSelectedChallenge] = useState('Story Challenge');

    const { data, setData, post, processing, errors } = useForm({
        challenge_type: 'Story Challenge',
        full_name: '',
        email: '',
        mobile_number: '',
        city: '',
        coupon_code: '',
    });

    // Coupon state
    const [couponInput, setCouponInput] = useState('');
    const [couponApplied, setCouponApplied] = useState(null); // { code, discount_percentage, discount_amount, final_amount }
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');
    const entryFee = 1999;

    const handleApplyCoupon = async () => {
        if (!couponInput.trim()) {
            setCouponError('Please enter a coupon code.');
            return;
        }
        setCouponLoading(true);
        setCouponError('');
        setCouponSuccess('');
        try {
            const res = await axios.post(route('coupons.verify'), {
                code: couponInput.trim().toUpperCase(),
                amount: entryFee,
            });
            if (res.data.valid) {
                const discountAmt = Math.round((entryFee * res.data.discount_percentage) / 100);
                setCouponApplied({
                    code: res.data.code,
                    discount_percentage: res.data.discount_percentage,
                    discount_amount: discountAmt,
                    final_amount: entryFee - discountAmt,
                });
                setData('coupon_code', res.data.code);
                setCouponSuccess(res.data.message || 'Coupon applied!');
            }
        } catch (err) {
            setCouponError(err.response?.data?.message || 'Invalid coupon code.');
            setCouponApplied(null);
            setData('coupon_code', '');
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setCouponApplied(null);
        setCouponInput('');
        setCouponError('');
        setCouponSuccess('');
        setData('coupon_code', '');
    };

    const handleChallengeSelect = (challenge) => {
        setSelectedChallenge(challenge);
        setData('challenge_type', challenge);

        // Smooth scroll to enrollment form
        document.getElementById('enrollment-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('challenges.store'));
    };

    const challenges = [
        {
            id: 'story',
            title: 'Story Challenge',
            icon: '📖',
            desc: 'A structured creative writing program where authors craft a complete story using linear or non-linear narrative techniques and publish it as a book through our professional publishing platform.',
            rules: [
                'Duration: 22 Days',
                'Language – English, Tamil & Hindi',
                'ISBN-Based Publication',
                'Minimum pages – 30'
            ],
            eligibility: 'Open to registered authors worldwide. Participants must submit original, unpublished work and adhere to platform quality and ethical standards.',
            benefits: [
                { icon: '📘', text: 'Get your own published book' },
                { icon: '🏆', text: "Overcome writer's block" },
                { icon: '📚', text: 'Publish in paperback & eBook' },
                { icon: '📜', text: 'Free author copy & publishing certificate' },
                { icon: '💰', text: 'Earn 100% royalty' },
                { icon: '🎁', text: 'Free bonuses worth ₹8,500' },
            ]
        },
        {
            id: 'poetry',
            title: 'Poetry Challenge',
            icon: '✒️',
            desc: 'Write one poem each day for 22 days and transform your collection into a published poetry book. Build your voice, shape your themes, and release your work through our DIY publishing platform.',
            rules: [
                'Duration: 22 Days',
                'Language – English, Tamil & Hindi',
                'ISBN-Based Publication',
                'Minimum pages – 30'
            ],
            eligibility: 'Open to registered authors worldwide. Participants must submit original, unpublished work and adhere to platform quality and ethical standards.',
            benefits: [
                { icon: '📗', text: 'Get your own poetry journal' },
                { icon: '🏆', text: 'Overcome writer\'s block' },
                { icon: '📚', text: 'Publish in paperback & eBook' },
                { icon: '📜', text: 'Free author copy & publishing certificate' },
                { icon: '💰', text: 'Earn 100% royalty' },
                { icon: '🎁', text: 'Free bonuses worth ₹8,500' },
            ]
        },
        {
            id: 'academic',
            title: 'Academic Challenge',
            icon: '🔬',
            desc: 'A structured 22-day publishing program for academic authors. Develop your single-author book one chapter per day and publish with ISBN through our professional DIY platform.',
            rules: [
                'Duration: 22 Days',
                'Language – English, Tamil & Hindi',
                'ISBN-Based Publication',
                'Minimum pages – 30'
            ],
            eligibility: 'Open to registered authors worldwide. Participants must submit original, unpublished work and adhere to platform quality and ethical standards.',
            benefits: [
                { icon: '📕', text: 'Get your own academic book' },
                { icon: '🏆', text: "Structured daily writing plan" },
                { icon: '📚', text: 'Publish in paperback & eBook' },
                { icon: '📜', text: 'Free author copy & publishing certificate' },
                { icon: '💰', text: 'Earn 100% royalty' },
                { icon: '🎁', text: 'Free bonuses worth ₹8,500' },
            ]
        }
    ];

    const currentChallenge = challenges.find(c => c.title === selectedChallenge);


    return (
        <div className="min-h-screen bg-parchment text-ink font-sans selection:bg-purple-500 selection:text-paper pb-20">
            {/* <PremiumBackground /> */}
            <Head title="Writing Challenges" />

            {/* Hero Section */}
            <div className="pt-20 px-6 max-w-7xl mx-auto text-center">
                <div className="inline-block px-4 py-1.5 rounded-full bg-purple-50 border border-purple-500/30 text-purple-700 text-xs font-bold tracking-wider mb-6">
                    • Live Challenges 2026
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6 text-ink">
                    Showcase Your <br />
                    <span className=" text-oxblood">Creative Genius</span>
                </h1>
                <p className="text-umber max-w-2xl mx-auto mb-8 text-lg">
                    Join our prestigious writing challenges and get a chance to be published, win awards, and reach a global audience.
                </p>

                <button
                    onClick={() => document.getElementById('enrollment-form')?.scrollIntoView({ behavior: 'smooth' })}
                    className="mb-16 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-full shadow-lg shadow-indigo-500/20 transform hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto"
                >
                    <span>Join Challenge</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </button>

                {/* Challenge Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
                    {challenges.map((challenge) => (
                        <div
                            key={challenge.id}
                            onClick={() => handleChallengeSelect(challenge.title)}
                            className={`
                                relative p-8 rounded-2xl text-left transition-all duration-500 cursor-pointer border group hover:-translate-y-2 backdrop-blur-sm
                                ${selectedChallenge === challenge.title
                                    ? 'bg-indigo-100 border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.25)]'
                                    : 'bg-paper border-linen hover:border-taupe hover:bg-vellum'}
                            `}
                        >
                            <div className={`
                                w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-6 transition-all duration-300
                                ${selectedChallenge === challenge.title ? 'bg-indigo-600 text-paper shadow-lg shadow-indigo-500/40' : 'bg-vellum text-umber group-hover:bg-vellum'}
                            `}>
                                {challenge.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-700 transition-colors">{challenge.title}</h3>
                            <p className="text-sm text-umber leading-relaxed mb-8 min-h-[60px]">
                                {challenge.desc}
                            </p>
                            <span className={`text-xs font-bold tracking-wider uppercase transition-colors ${selectedChallenge === challenge.title ? 'text-indigo-700' : 'text-umber is-active'}`}>
                                {selectedChallenge === challenge.title ? 'Selected' : 'Click to Select'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>



            {/* Details Section */}
            <div className="max-w-7xl mx-auto px-6 mb-24">
                <div key={selectedChallenge} className="bg-paper border border-linen rounded-3xl p-8 md:p-12 animate-fade-in-up transition-all duration-500 backdrop-blur-md shadow-2xl shadow-indigo-900/20">
                    <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold tracking-widest rounded mb-6 uppercase">
                        Guidelines
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Left: Overview */}
                        <div>
                            <h2 className="text-3xl font-bold mb-6">
                                Challenge <span className="text-indigo-700">Overview</span>
                            </h2>
                            <p className="text-umber mb-8 leading-relaxed">
                                The 2026 Creative Publishing Challenge invites authors to commit to a focused 22-day creation journey. Participants will develop original work through a structured daily submission model and transform their ideas into a professionally published book.
                            </p>

                            <ul className="space-y-4">
                                {currentChallenge.rules.map((rule, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-ink-soft">
                                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-700 text-xs">✓</span>
                                        {rule}
                                    </li>
                                ))}
                            </ul>

                            {/* Eligibility Box - Moved Here */}
                            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border border-linen rounded-2xl p-8 hover:border-indigo-500/30 transition-colors duration-300 backdrop-blur-md mt-8">
                                <div className="text-xs font-bold text-indigo-700 uppercase tracking-widest mb-4">Eligibility</div>
                                <p className="text-ink-soft leading-relaxed font-light">
                                    {currentChallenge.eligibility}
                                </p>
                            </div>
                        </div>

                        {/* Right: Video Section ONLY */}
                        <div className="space-y-6">
                            {/* Video Section */}
                            <div className="bg-indigo-50 border border-linen rounded-2xl p-2 hover:border-indigo-500/30 transition-colors duration-300 overflow-hidden shadow-2xl backdrop-blur-sm">
                                {challengeSettings[selectedChallenge] && (challengeSettings[selectedChallenge].video_url || challengeSettings[selectedChallenge].video_file) ? (
                                    challengeSettings[selectedChallenge].video_type === 'url' ? (
                                        <div className="relative pt-[177.77%]"> {/* 9:16 Aspect Ratio for "Shorts" style */}
                                            <iframe
                                                src={challengeSettings[selectedChallenge].video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                                                className="absolute inset-0 w-full h-full rounded-xl"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    ) : (
                                        <div className="relative rounded-xl overflow-hidden bg-paper">
                                            <video
                                                controls
                                                className="w-full h-auto rounded-xl"
                                                src={challengeSettings[selectedChallenge].video_file}
                                                poster={challengeSettings[selectedChallenge].video_thumbnail}
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                    )
                                ) : (
                                    /* Premium Placeholder when no video is set */
                                    <div className="relative aspect-[9/16] rounded-2xl overflow-hidden group">
                                        {/* Dynamic Animated Background */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 animate-gradient-xy"></div>

                                        {/* Floating Blobs */}
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-pink-500/30 transition-all duration-700"></div>
                                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-indigo-500/30 transition-all duration-700"></div>

                                        {/* Glassmorphic Overlay Content */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 backdrop-blur-[2px]">
                                            <div className="relative">
                                                {/* Pulsing Ring */}
                                                <div className="absolute inset-0 bg-vellum rounded-full blur-xl animate-pulse"></div>

                                                {/* Icon Container */}
                                                <div className="relative w-20 h-20 bg-gradient-to-br from-white/10 to-white/5 border border-linen rounded-full flex items-center justify-center mb-6 shadow-2xl backdrop-blur-md group-hover:scale-110 transition-transform duration-500">
                                                    <svg className="w-8 h-8 text-ink drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                            </div>

                                            <h4 className="text-2xl font-black mb-2 text-center text-ink">
                                                Visual Experience
                                            </h4>

                                            <div className="flex items-center gap-2 bg-paper border border-linen rounded-full px-4 py-1.5 backdrop-blur-md">
                                                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                                                <span className="text-indigo-700 text-xs font-bold tracking-wide uppercase">Coming Soon</span>
                                            </div>

                                            <p className="text-umber text-sm text-center mt-6 leading-relaxed max-w-[80%] opacity-80">
                                                We are crafting an immersive walkthrough for this challenge. Stay tuned.
                                            </p>
                                        </div>

                                        {/* Decorative Border Gradient */}
                                        <div className="absolute inset-0 border border-linen rounded-2xl"></div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ HOW IT WORKS & DELIVERABLES ═══ */}
            <div className="max-w-7xl mx-auto px-6 mb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left: How it works */}
                    <div className="lg:col-span-12">
                        <div className="mb-16">
                            <h2 className="text-3xl font-bold mb-8 text-ink border-l-4 border-indigo-500 pl-4">How does this work?</h2>

                            <div className="space-y-6 text-ink-soft leading-relaxed text-lg bg-indigo-50 border border-linen p-8 rounded-3xl backdrop-blur-md shadow-xl">
                                <p>
                                    All writers who register for the <span className="text-indigo-700 font-bold">{selectedChallenge}</span> will be given a portal on which they can write
                                    {selectedChallenge === 'Poetry Challenge' ? ' at least one poem ' : ' at least one chapter '}
                                    daily for 22 days.
                                    {selectedChallenge === 'Poetry Challenge'
                                        ? " There are no limitations on the poem's theme. On different days, you can write in different themes. There is no maximum limit to how many poems you write in 22 days."
                                        : " There are no limitations on the theme. You can shape your story or subject as you see fit. There is no maximum limit to how much you write in 22 days."
                                    }
                                </p>
                                <p className="flex items-start gap-3">
                                    <span className="text-2xl">⏳</span>
                                    <span>You will be provided with extra time in case you're not able to write on any particular day.</span>
                                </p>
                            </div>
                        </div>

                        {/* Right: What You Get */}
                        <div>
                            <h2 className="text-3xl font-bold mb-8 text-ink border-l-4 border-purple-500 pl-4">
                                Here's what you'll get after you've completed the challenge:
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* Certificate */}
                                <div className="bg-indigo-50 border border-linen rounded-2xl p-6 hover:border-indigo-500/50 transition-colors shadow-lg shadow-indigo-500/5 backdrop-blur-sm">
                                    <h3 className="text-lg font-bold text-indigo-700 mb-3 flex items-center gap-2">
                                        📜 Publishing Certificate
                                    </h3>
                                    <p className="text-umber text-sm leading-relaxed">We will send a digital publishing Certificate to each participating writer.</p>
                                </div>

                                {/* Book Publishing Intro */}
                                <div className="bg-indigo-50 border border-linen rounded-2xl p-6 hover:border-indigo-500/50 transition-colors shadow-lg shadow-indigo-500/5 backdrop-blur-sm">
                                    <h3 className="text-lg font-bold text-indigo-700 mb-3 flex items-center gap-2">
                                        📚 Book Publishing
                                    </h3>
                                    <p className="text-umber text-sm leading-relaxed">
                                        We'll publish what you write during this month as your own book as part of the Writing Challenge.
                                    </p>
                                </div>
                            </div>

                            {/* Detailed Kit List */}
                            <div className="bg-paper border border-linen rounded-3xl p-8 md:p-10 relative overflow-hidden backdrop-blur-md shadow-2xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -z-10"></div>

                                <h3 className="text-xl font-bold text-ink mb-6">Complete Publishing Kit Details:</h3>
                                <ul className="space-y-4 text-ink-soft">
                                    {[
                                        'ISBN number & barcode allocation.',
                                        "Book's interior layouts & design will be created as per your choice.",
                                        'You\'ll be given access to a cover creator tool that comes with hundreds of cover designs among which you can choose your cover. Additionally, you can also upload your own cover design.',
                                        'Book will be published as paperback and eBook.',
                                        'The book will be sold & distributed via PublicationMart Bookstore. You will have the option to purchase Amazon and Flipkart distribution addon.',
                                        'The author will receive one complimentary copy as well.',
                                        'On an annual basis, a royalty equal to 80% of the profit on sale would be paid.',
                                        "The author retains complete ownership of the book's copyrights and content.",
                                        'Once the challenge is completed, a publishing agreement will be shared.'
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex gap-4 items-start group">
                                            <span className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-700 text-xs shrink-0 mt-0.5 group-hover:bg-indigo-500 group-hover:text-white transition-colors">✓</span>
                                            <span className="leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* ═══ BOOK MARKETING STUDIO ═══ */}
                        <div className="mt-12 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-2xl p-8 hover:border-indigo-500/60 transition-colors relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
                            <h3 className="text-xl font-bold text-ink mb-4 flex items-center gap-3">
                                <span className="text-2xl">🚀</span> Book Marketing
                            </h3>
                            <p className="text-ink-soft leading-relaxed text-lg font-light">
                                When your book is out, we'll send you promotional material to help you promote it.
                                We'll also share our <span className="text-indigo-700 font-bold">book marketing guide</span> to help you sell more copies.
                            </p>
                        </div>

                        {/* ═══ WHATS NEW: DIY TOOL ═══ */}
                        <div className="mt-16 pt-16 border-t border-linen">
                            <h2 className="text-3xl font-bold mb-3 text-ink">What's New?</h2>
                            <h3 className="text-xl font-bold mb-6 text-oxblood">
                                Your DIY Book Creation Tool
                            </h3>

                            <p className="text-ink-soft leading-relaxed mb-12 max-w-4xl text-lg">
                                We have developed a cutting-edge DIY portal to make your book creation process seamless and enjoyable.
                                You can use it to write your {selectedChallenge === 'Poetry Challenge' ? 'poems' : 'stories/chapters'}, and choose from various book designs and layouts.
                                Also, you can instantly see the final draft of your book on your screen and make any changes you want in real time.
                            </p>

                            <div className="flex flex-col md:flex-row items-center gap-8 justify-center bg-transparent border-none p-0 rounded-3xl relative overflow-visible"> {/* Removed dark box here, keeping it cleaner */}
                                {/* Background glow */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-500/5 blur-3xl -z-10"></div>

                                {/* Editor Image */}
                                <div className="w-full md:w-5/12 text-center group">
                                    <div className="rounded-2xl overflow-hidden border border-linen shadow-2xl shadow-indigo-500/20 group-hover:scale-[1.02] transition-transform duration-500 mb-4 bg-paper backdrop-blur-sm p-1">
                                        <img src="/images/challenge-editor.png" alt="Formatting Tool Interface" className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity rounded-xl" />
                                    </div>
                                    <p className="text-xs text-indigo-700 uppercase tracking-wider font-bold">Write & Design</p>
                                </div>

                                {/* Arrow Animation */}
                                <div className="hidden md:flex flex-col items-center justify-center space-y-2 z-10">
                                    <div className="w-12 h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500 to-indigo-500/0"></div>
                                    <span className="text-indigo-700 text-3xl animate-pulse">➜</span>
                                    <div className="w-12 h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500 to-indigo-500/0"></div>
                                </div>
                                <div className="md:hidden text-indigo-700 text-3xl animate-bounce my-2">⬇</div>

                                {/* Preview Image */}
                                <div className="w-full md:w-5/12 text-center group">
                                    <div className="rounded-2xl overflow-hidden border border-linen shadow-2xl shadow-purple-500/20 group-hover:scale-[1.02] transition-transform duration-500 mb-4 bg-paper backdrop-blur-sm p-1">
                                        <img src="/images/challenge-preview.png" alt="Book Preview Interface" className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity rounded-xl" />
                                    </div>
                                    <p className="text-xs text-purple-700 uppercase tracking-wider font-bold">Instant Preview</p>
                                </div>
                            </div>
                        </div>

                        {/* ═══ COVER DESIGN STUDIO ═══ */}
                        <div className="mt-24 pt-16 border-t border-linen">
                            <h3 className="text-xl font-bold mb-6 text-oxblood">
                                Professional Cover Design Creator
                            </h3>

                            <p className="text-ink-soft leading-relaxed mb-12 max-w-4xl text-lg">
                                Design your book cover using our intuitive cover creator. Choose from hundreds of images and designs to craft a cover that you can be proud of. The cover creator is extremely easy to use, and you do not need any prior design experience to create your cover.
                            </p>

                            {/* 3-Step Visual Flow */}
                            <div className="bg-transparent p-0 rounded-3xl relative overflow-visible"> {/* Removed dark box */}
                                {/* Background glow */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/5 blur-3xl -z-10"></div>

                                <div className="flex flex-col md:flex-row items-center justify-between gap-6">



                                    {/* Step 2: Editor */}
                                    <div className="flex-1 text-center group w-full">
                                        <div className="rounded-2xl overflow-hidden border border-linen shadow-2xl shadow-indigo-500/10 group-hover:scale-[1.02] transition-transform duration-500 mb-4 bg-paper backdrop-blur-sm p-2">
                                            <img src="/images/cover-editor.png" alt="Cover Editor Interface" className="w-full h-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <p className="text-xs text-indigo-700 uppercase tracking-wider font-bold">1. Customize</p>
                                    </div>

                                    {/* Arrow 2 */}
                                    <div className="hidden md:block text-indigo-700 text-2xl animate-pulse">➜</div>
                                    <div className="md:hidden text-indigo-700 text-2xl animate-bounce my-2">⬇</div>

                                    {/* Step 3: Preview */}
                                    <div className="flex-1 text-center group w-full">
                                        <div className="rounded-2xl overflow-hidden border border-linen shadow-2xl shadow-indigo-500/10 group-hover:scale-[1.02] transition-transform duration-500 mb-4 bg-paper backdrop-blur-sm p-2">
                                            <img src="/images/cover-preview.png" alt="Cover Preview" className="w-full h-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <p className="text-xs text-purple-700 uppercase tracking-wider font-bold">2. Final Preview</p>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enrollment Form */}
            <div id="enrollment-form" className="max-w-2xl mx-auto px-6">
                <div className="bg-indigo-50 border border-linen rounded-3xl p-8 md:p-12 shadow-2xl shadow-indigo-900/10 backdrop-blur-md">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold mb-2">Enrollment Form</h2>
                        <p className="text-umber">Apply for the <span className="text-purple-700">{selectedChallenge}</span></p>
                        <div className="w-16 h-1 bg-purple-600 mx-auto mt-6 rounded-full"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-umber uppercase tracking-wider ml-1">Full Name</label>
                                <input
                                    type="text"
                                    value={data.full_name}
                                    onChange={e => setData('full_name', e.target.value)}
                                    className="w-full bg-paper border border-linen rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition placeholder-gray-500 backdrop-blur-sm"
                                    placeholder="Enter your full name"
                                />
                                {errors.full_name && <div className="text-red-500 text-xs mt-1">{errors.full_name}</div>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-umber uppercase tracking-wider ml-1">Email Address</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className="w-full bg-paper border border-linen rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition placeholder-gray-500 backdrop-blur-sm"
                                    placeholder="your@email.com"
                                />
                                {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-umber uppercase tracking-wider ml-1">Mobile Number</label>
                                <input
                                    type="text"
                                    value={data.mobile_number}
                                    onChange={e => setData('mobile_number', e.target.value)}
                                    className="w-full bg-paper border border-linen rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition placeholder-gray-500 backdrop-blur-sm"
                                    placeholder="+91 00000 00000"
                                />
                                {errors.mobile_number && <div className="text-red-500 text-xs mt-1">{errors.mobile_number}</div>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-umber uppercase tracking-wider ml-1">City</label>
                                <input
                                    type="text"
                                    value={data.city}
                                    onChange={e => setData('city', e.target.value)}
                                    className="w-full bg-paper border border-linen rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition placeholder-gray-500 backdrop-blur-sm"
                                    placeholder="Enter your city"
                                />
                                {errors.city && <div className="text-red-500 text-xs mt-1">{errors.city}</div>}
                            </div>
                        </div>

                        <div className="pt-6 pb-2">
                            {/* ═══ COUPON CODE SECTION ═══ */}
                            <div className="mb-6">
                                <label className="text-xs font-bold text-umber uppercase tracking-wider ml-1 mb-2 block">Have a Coupon Code?</label>
                                {!couponApplied ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponInput}
                                            onChange={e => setCouponInput(e.target.value.toUpperCase())}
                                            className="flex-1 bg-paper border border-linen rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition placeholder-gray-500 backdrop-blur-sm uppercase tracking-wider text-sm font-mono"
                                            placeholder="ENTER CODE"
                                            maxLength={20}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            disabled={couponLoading}
                                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shrink-0"
                                        >
                                            {couponLoading ? (
                                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                            ) : 'Apply'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <span className="text-emerald-700 font-bold text-sm font-mono">{couponApplied.code}</span>
                                            <span className="text-emerald-700 text-xs">({couponApplied.discount_percentage}% off)</span>
                                        </div>
                                        <button type="button" onClick={handleRemoveCoupon} className="text-umber hover:text-red-700 transition-colors text-xs font-bold">
                                            Remove
                                        </button>
                                    </div>
                                )}
                                {couponError && <p className="text-red-700 text-xs mt-1.5 ml-1">{couponError}</p>}
                                {couponSuccess && !couponApplied && <p className="text-emerald-700 text-xs mt-1.5 ml-1">{couponSuccess}</p>}
                            </div>

                            {/* ═══ ORDER SUMMARY ═══ */}
                            <div className="bg-paper border border-linen rounded-2xl p-5 mb-6 backdrop-blur-sm">
                                <h4 className="text-xs font-bold text-umber uppercase tracking-widest mb-4">Order Summary</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-umber">Challenge</span>
                                        <span className="text-indigo-700 font-medium">{selectedChallenge}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-umber">Entry Fee</span>
                                        <span className="text-ink font-medium">₹{entryFee.toLocaleString()}</span>
                                    </div>
                                    {couponApplied && (
                                        <div className="flex justify-between text-emerald-700">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                                Coupon ({couponApplied.code})
                                            </span>
                                            <span className="font-medium">-₹{couponApplied.discount_amount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-linen pt-3 flex justify-between">
                                        <span className="text-ink font-bold">Total</span>
                                        <span className="text-xl font-black text-ink">
                                            ₹{couponApplied ? couponApplied.final_amount.toLocaleString() : entryFee.toLocaleString()}
                                        </span>
                                    </div>
                                    {couponApplied && (
                                        <div className="text-center">
                                            <span className="text-xs text-emerald-700 font-bold">🎉 You save ₹{couponApplied.discount_amount.toLocaleString()}!</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                {processing ? 'Processing...' : 'Submit Enrollment & Join Challenge →'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
