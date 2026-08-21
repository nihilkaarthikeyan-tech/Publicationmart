import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
export default function Welcome({ auth, featuredBooks = [], platformStats = { publishedBooks: 0, totalAuthors: 0 } }) {
    const [openFaq, setOpenFaq] = useState(null);
    const [isVisible, setIsVisible] = useState({});
    const [pricingTab, setPricingTab] = useState('pro');
    const [processStep, setProcessStep] = useState(0);
    const processes = [
        { title: 'Optimizing Distribution', node: 'NODE_492', color: 'indigo' },
        { title: 'Syncing with Amazon', node: 'API_connect', color: 'green' },
        { title: 'Verifying Metadata', node: 'META_v2', color: 'purple' },
        { title: 'Updating Global Catalog', node: 'GLB_sync', color: 'cyan' }
    ];
    useEffect(() => {
        const interval = setInterval(() => {
            setProcessStep((prev) => (prev + 1) % processes.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);
    // Typewriter Effect Logic
    const [heroText, setHeroText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [wordIndex, setWordIndex] = useState(0);
    const words = ["Automatically", "Instantly", "Effortlessly", "Magically"];
    useEffect(() => {
        const typeSpeed = isDeleting ? 75 : 150;
        const deleteDelay = 2000;
        const handleTyping = () => {
            const currentWord = words[wordIndex % words.length];
            if (isDeleting) {
                setHeroText(prev => prev.substring(0, prev.length - 1));
            } else {
                setHeroText(prev => currentWord.substring(0, prev.length + 1));
            }
            if (!isDeleting && heroText === currentWord) {
                // Pause at end of word
                // Note: We don't set text here, so effect won't re-triggered by text change
                // We depend on the timeout below to trigger state change
            }
        };
        // Handling the pause specifically
        let timer;
        const currentWord = words[wordIndex % words.length];
        if (!isDeleting && heroText === currentWord && heroText !== '') {
            timer = setTimeout(() => setIsDeleting(true), deleteDelay);
        } else if (isDeleting && heroText === '') {
            setIsDeleting(false);
            setWordIndex(prev => prev + 1);
        } else {
            timer = setTimeout(handleTyping, typeSpeed);
        }
        return () => clearTimeout(timer);
    }, [heroText, isDeleting, wordIndex]);
    // Generate Stars (Memoized to prevent re-render flickers if possible, but simple ref is fine here)
    const [stars, setStars] = useState([]);
    useEffect(() => {
        const generatedStars = [...Array(40)].map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            size: `${Math.random() * 3}px`,
            delay: `${Math.random() * 5}s`,
            duration: `${3 + Math.random() * 7}s`
        }));
        setStars(generatedStars);
    }, []);
    // Intersection Observer for scroll reveal
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
                    }
                });
            },
            { threshold: 0.1 }
        );
        document.querySelectorAll('.reveal-on-scroll').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);
    const faqs = [
        {
            question: 'What is PublicationMart?',
            answer: 'PublicationMart is an AI-powered writing and publishing SAAS platform that helps authors create, format, and publish books in eBook and print formats. We provide tools, publishing support, and optional marketing services to simplify the self-publishing process.'
        },
        {
            question: 'Do I retain full ownership of my book?',
            answer: 'Yes. Authors retain 100% copyright ownership of their work. PublicationMart does not claim ownership of your manuscript or ideas.'
        },
        {
            question: 'Do I receive 100% royalty?',
            answer: 'Yes. Authors receive 100% of the royalty as per marketplace payout structures. PublicationMart does not take a percentage of your book sales unless otherwise stated in specific promotional agreements.'
        },
        {
            question: 'How does the Smart Writing Tool work?',
            answer: 'The Smart Writing Tool generates a structured outline within minutes based on your input. Once you approve the outline, it automatically generates a complete first draft. Authors must thoroughly review, edit, and fact-check the generated content before publishing.'
        },
        {
            question: 'Is AI-generated content safe to publish?',
            answer: 'AI-generated content is provided as a draft. Authors are fully responsible for reviewing, editing, verifying originality, and ensuring legal compliance before publication.'
        },
        {
            question: 'What formats can I publish in?',
            answer: (
                <div>
                    <p className="mb-2">You can publish your book in:</p>
                    <ul className="list-disc ml-5 space-y-1">
                        <li>eBook format</li>
                        <li>Paperback (Print-on-Demand)</li>
                    </ul>
                    <p className="mt-2">Availability may vary depending on your selected package.</p>
                </div>
            )
        },
        {
            question: 'What is Print-on-Demand?',
            answer: 'Print-on-Demand means your book is printed only when a customer places an order. This eliminates the need for bulk inventory and reduces upfront costs.'
        },
        {
            question: 'Do you guarantee book sales?',
            answer: 'No. We provide publishing infrastructure and optional marketing services, but book sales depend on factors such as content quality, audience demand, pricing, and marketing efforts.'
        },
        {
            question: 'How long does publishing take?',
            answer: 'Publishing timelines vary based on your package and manuscript readiness. On average, the process can take between 7\u201321 working days after final approval.'
        },
        {
            question: 'Do I need prior writing experience?',
            answer: 'No. Our Smart Writing Tool and guided publishing system are designed for both beginners and experienced authors.'
        },
        {
            question: 'Can I upload my own manuscript?',
            answer: 'Yes. You may upload your completed manuscript for formatting and publishing support.'
        },
        {
            question: 'What marketing support do you provide?',
            answer: (
                <div>
                    <p className="mb-2">Depending on your package, we offer services such as:</p>
                    <ul className="list-disc ml-5 space-y-1">
                        <li>Social media creatives</li>
                        <li>Amazon Ads management</li>
                        <li>Author interviews</li>
                        <li>PR coverage</li>
                        <li>Website creation</li>
                        <li>Book trailers</li>
                    </ul>
                    <p className="mt-2 text-sm italic">Marketing services are optional and package-dependent.</p>
                </div>
            )
        },
        {
            question: 'Can I update my book after publishing?',
            answer: 'Yes. Revisions can be made. However, update processes and additional charges (if applicable) may depend on your selected package.'
        },
        {
            question: 'What happens if I misuse the Smart Writing Tool?',
            answer: 'PublicationMart reserves the right to suspend or terminate accounts that generate illegal, harmful, defamatory, or copyright-infringing content.'
        },
        {
            question: 'How do I get started?',
            answer: 'Simply choose a suitable package and begin writing using our Smart Writing Tool, or upload your manuscript to begin the publishing process.'
        }
    ];
    return (
        <>
            <Head title="Self Publishing Platform for Authors in India – AI Book Writing & Publishing">
                {/* Primary Meta Tags */}
                <meta name="title" content="PublicationMart  Book Publishing & Author Services in India" />
                <meta name="description" content="PublicationMart helps authors publish books easily with professional editing, ISBN, printing, and distribution services across India." />
                <meta name="keywords" content="self-publishing, book publishing, publish book online, ebook publishing, print on demand, author platform, book distribution" />
                {/* Open Graph / Facebook / WhatsApp */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://publicationmart.com/" />
                <meta property="og:title" content="PublicationMart  Book Publishing & Author Services in India" />
                <meta property="og:description" content="PublicationMart helps authors publish books easily with professional editing, ISBN, printing, and distribution services across India." />
                <meta property="og:image" content="https://publicationmart.com/images/publicationmart-social-share.jpg" />
                <meta property="og:site_name" content="PublicationMart" />
                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content="https://publicationmart.com/" />
                <meta name="twitter:title" content="PublicationMart  Book Publishing & Author Services in India" />
                <meta name="twitter:description" content="PublicationMart helps authors publish books easily with professional editing, ISBN, printing, and distribution services across India." />
                <meta name="twitter:image" content="https://publicationmart.com/images/publicationmart-social-share.jpg" />
                {/* Structured Data for Organization */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": "PublicationMart",
                        "url": "https://publicationmart.com",
                        "logo": "https://publicationmart.com/images/logo_new.png",
                        "description": "Global self-publishing platform for independent authors",
                        "sameAs": [
                            "https://whatsapp.com/channel/0029VaDNAMO9MF983m4Y5s1y",
                            "https://www.facebook.com/people/RK-Publications/100094272053003/",
                            "https://www.instagram.com/publicationmart15?utm_source=qr&igsh=MWlubWJxN3hxMGxvdg==",
                            "https://www.youtube.com/@Rademics"
                        ],
                        "contactPoint": {
                            "@type": "ContactPoint",
                            "contactType": "customer service",
                            "areaServed": "Worldwide"
                        }
                    })}
                </script>
            </Head>
            {/* PREMIUN BACKGROUND SYSTEM (Enhanced with Starfield) */}
            <div className="fixed inset-0 z-0 bg-[#0f0a1e] overflow-hidden pointer-events-none">
                {/* Base Noise */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')` }}></div>
                {/* DYNAMIC STARS */}
                {stars.map((star) => (
                    <div
                        key={star.id}
                        className="absolute bg-white rounded-full animate-twinkle"
                        style={{
                            left: star.left,
                            top: star.top,
                            width: star.size,
                            height: star.size,
                            animationDelay: star.delay,
                            opacity: 0.7
                        }}
                    ></div>
                ))}
                {/* Floating Orbs (Existing but softer) */}
                <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-900/5 rounded-full blur-[160px]"></div>
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent rotate-[15deg] transform-gpu animate-beam"></div>
                    <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-purple-500/20 to-transparent rotate-[15deg] transform-gpu animate-beam" style={{ animationDelay: '3s' }}></div>
                </div>
            </div>
            {/* HERO SECTION - AI-FIRST MESSAGING */}
            <div className="relative overflow-hidden pt-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10 relative z-10 transition-all duration-1000 transform scale-100">
                    <div className="text-center max-w-5xl mx-auto animate-fade-in-up">
                        {/* BADGE */}
                        {/* BADGE WITH GRADIENT BORDER */}
                        <div className="inline-block p-[1px] rounded-full bg-gradient-to-r from-[#FF9933] via-[#FF9933]/50 to-[#138808] mb-8 shadow-[0_0_20px_-5px_rgba(255,153,51,0.3)] hover:shadow-[0_0_25px_-5px_rgba(19,136,8,0.3)] transition-all duration-500 group">
                            <div className="bg-[#1a1035] rounded-full px-6 py-2 flex items-center gap-3 relative overflow-hidden backdrop-blur-xl">
                                <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF9933] via-white to-[#138808] uppercase tracking-widest relative z-10">INDIA'S NEXT GEN</span>
                                <div className="w-px h-5 bg-white/10 relative z-10"></div>
                                <span className="text-sm font-semibold text-gray-400 relative z-10">AI-Powered Book Writing & Publishing Platform</span>
                                <span className="w-2 h-2 rounded-full bg-[#138808] animate-pulse ml-1 relative z-10 shadow-[0_0_10px_#138808]"></span>
                            </div>
                        </div>
                        {/* HEADLINE */}
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight mb-8 leading-[1.1]">
                            Turn Ideas into Books
                            <div className="block mt-2 h-[1.2em]">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">
                                    {heroText}
                                    <span className="animate-pulse text-white font-thin"></span>
                                </span>
                            </div>
                        </h1>
                        {/* CTA BUTTONS */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-20">
                            <Link href={auth.user ? route('dashboard') : route('guest-writer.pricing')} className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-[0_10px_40px_-10px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2 transition-all transform hover:scale-105 group">
                                <span className="text-lg">✨</span>
                                <span>Launch Smart Writing Tool</span>
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </Link>
                            <Link href={route('book-store.index')} className="w-full sm:w-auto px-8 py-4 bg-[#1a1c23] border border-white/10 text-white font-bold rounded-xl hover:bg-[#252830] transition-all flex items-center justify-center">
                                Explore Published Books
                            </Link>
                        </div>
                        {/* TRUST BADGES ROW */}
                        <div className="mt-20 pt-10 border-t border-white/5 opacity-0 animate-[fade-in_1s_ease-out_forwards_1s]">
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-5">Powered by Advanced Innovation</p>
                            <div className="flex flex-wrap items-center justify-center gap-6 text-gray-400">
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    <span className="text-sm font-semibold">Smart Writing</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                                    <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <span className="text-sm font-semibold">AI Image Gen</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    <span className="text-sm font-semibold">Smart Formatting</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                                    <span className="text-sm font-semibold">Global Publish</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* 3D Book Showcase Visual - GIGANTIC EDITION */}
                    {/* 3D Book Showcase Visual - GIGANTIC EDITION (Restored & Centered) */}
                    <div id="hero-viz" className="reveal-on-scroll mt-0 relative perspective-[2000px] group transition-all duration-1000 transform scale-95 opacity-0 data-[visible=true]:scale-100 data-[visible=true]:opacity-100 w-full flex justify-center" data-visible={isVisible['hero-viz']}>
                        <div className="absolute inset-0 bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none"></div>
                        <div className="relative flex justify-center items-end gap-0 h-[450px] transform-style-3d rotate-x-[10deg] rotate-y-[-5deg] group-hover:rotate-y-[0deg] transition-transform duration-1000 ease-out">
                            {/* Book 1 (Left/Back) */}
                            <div className="hidden xl:block w-64 h-96 bg-gray-800/40 backdrop-blur-md rounded-lg shadow-2xl transform translate-z-[-100px] translate-x-[100px] rotate-y-[15deg] border border-white/10 opacity-40"></div>
                            {/* Main Book (Center) - High Impact */}
                            <div className="w-[300px] sm:w-[380px] h-[520px] bg-gradient-to-br from-indigo-950 to-slate-950 rounded-r-2xl rounded-l-sm shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-r-8 border-b-8 border-indigo-900/50 flex flex-col relative overflow-hidden transform translate-z-[50px] scale-100 sm:scale-110 transition-transform hover:scale-[1.15] z-20">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1621944190610-a96074743589?w=800&q=80')] bg-cover bg-center opacity-60 mix-blend-overlay"></div>
                                <div className="p-10 relative z-10 flex flex-col h-full justify-between">
                                    <div className="text-right">
                                        <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-xl border border-white/20 rounded-full text-[12px] text-white font-black tracking-widest shadow-xl">✨ SMART WRITER</div>
                                    </div>
                                    <div>
                                        <div className="w-12 h-1 bg-indigo-500/50 mb-6"></div>
                                        <h3 className="text-4xl sm:text-5xl font-serif text-white leading-tight mb-4 drop-shadow-2xl">The Art of<br />Publishing</h3>
                                        <p className="text-indigo-200 text-sm font-bold tracking-[.3em] uppercase opacity-80">PublicationMart Press</p>
                                    </div>
                                </div>
                                {/* Spine highlight */}
                                <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white/20 to-transparent"></div>
                                <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/5"></div>
                            </div>
                            {/* Book 2 (Right/Back) */}
                            <div className="hidden xl:block w-64 h-96 bg-gray-800/40 backdrop-blur-md rounded-lg shadow-2xl transform translate-z-[-100px] translate-x-[-100px] rotate-y-[-15deg] border border-white/10 opacity-40"></div>
                        </div>
                    </div>
                </div>
            </div>
            {/* SUCCESS STORIES TICKER */}
            <div className="relative border-y border-white/5 bg-black/20 backdrop-blur-md overflow-hidden py-10">
                <div className="absolute inset-0 bg-indigo-500/5 mix-blend-overlay"></div>
                <div className="w-full relative z-10 flex flex-col items-center gap-8">
                    {/* Badge/Title */}
                    <div className="shrink-0 flex flex-col gap-2 items-center text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                            <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 uppercase tracking-wider">
                                Author Success Stories
                            </span>
                        </div>
                    </div>
                    {/* Scrolling ticker */}
                    <div className="w-full relative flex overflow-hidden">
                        <div className="animate-scroll-left flex gap-6 whitespace-nowrap">
                            {[...Array(2)].map((_, setIndex) => (
                                <div key={setIndex} className="flex gap-6">
                                    {/* Use real book data from database */}
                                    {featuredBooks.length > 0 ? (
                                        featuredBooks.map((book, i) => {
                                            const colors = [
                                                { color: 'from-rose-500/20 to-pink-500/20', border: 'rose-500/30' },
                                                { color: 'from-blue-500/20 to-cyan-500/20', border: 'blue-500/30' },
                                                { color: 'from-emerald-500/20 to-green-500/20', border: 'emerald-500/30' },
                                                { color: 'from-purple-500/20 to-pink-500/20', border: 'purple-500/30' },
                                                { color: 'from-orange-500/20 to-amber-500/20', border: 'orange-500/30' },
                                                { color: 'from-yellow-500/20 to-orange-500/20', border: 'yellow-500/30' }
                                            ];
                                            const colorSet = colors[i % colors.length];
                                            return (
                                                <div
                                                    key={`${setIndex}-${book.id}`}
                                                    className={`relative flex-shrink-0 w-80 bg-gradient-to-br ${colorSet.color} backdrop-blur-xl rounded-2xl border border-${colorSet.border} p-6 group hover:scale-105 transition-all duration-300`}
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
                                                            <span className="text-lg font-bold text-white">{book.author_name?.charAt(0) || 'A'}</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0 overflow-hidden">
                                                            <h4 className="text-white font-bold text-sm mb-1 truncate">{book.author_name || 'Anonymous'}</h4>
                                                            <p className="text-gray-300 text-sm mb-2 leading-tight truncate">{book.title}</p>
                                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                                                                <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                                <span className="text-xs font-semibold text-white">Published</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        /* Fallback when no books are available */
                                        [
                                            { author: 'Be the First!', achievement: 'Start publishing today', metric: 'Join us', color: 'from-indigo-500/20 to-purple-500/20', border: 'indigo-500/30' }
                                        ].map((story, i) => (
                                            <div
                                                key={i}
                                                className={`relative flex-shrink-0 w-80 bg-gradient-to-br ${story.color} backdrop-blur-xl rounded-2xl border border-${story.border} p-6 group hover:scale-105 transition-all duration-300`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
                                                        <span className="text-lg font-bold text-white">👤</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-white font-bold text-sm mb-1">{story.author}</h4>
                                                        <p className="text-gray-300 text-sm mb-2 leading-tight">{story.achievement}</p>
                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                                                            <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            <span className="text-xs font-semibold text-white">{story.metric}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <style>{`
                    @keyframes scroll-left {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .animate-scroll-left {
                        animation: scroll-left 40s linear infinite;
                    }
                    .animate-scroll-left:hover {
                        animation-play-state: paused;
                    }
                    @keyframes text-slide {
                        0%, 20% { transform: translateY(0%); }
                        25%, 45% { transform: translateY(-20%); }
                        50%, 70% { transform: translateY(-40%); }
                        75%, 95% { transform: translateY(-60%); }
                        100% { transform: translateY(-80%); }
                    }
                    .animate-text-slide {
                        animation: text-slide 8s cubic-bezier(0.83, 0, 0.17, 1) infinite;
                    }
                `}</style>
            </div>
            {/* PREMIUM FEATURES SECTION - GLASSMORPHISM DESIGN */}
            <div id="features-section" className="reveal-on-scroll relative py-32 overflow-hidden transition-all duration-1000 transform translate-y-10 opacity-0 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100" data-visible={isVisible['features-section']}>
                {/* Section background overlay for contrast */}
                <div className="absolute inset-0 bg-indigo-500/5 backdrop-blur-3xl"></div>
                {/* Floating Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {
                        [...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-1 h-1 bg-white/20 rounded-full"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
                                    animationDelay: `${Math.random() * 5}s`
                                }}
                            ></div>
                        ))
                    }
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    {/* Section Header */}
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mb-6">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 animate-pulse"></div>
                            <span className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                                POWERFUL FEATURES
                            </span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                            Everything You Need to{' '}
                            <span className="relative inline-block">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 animate-gradient">
                                    Succeed
                                </span>
                                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-full blur-sm"></div>
                            </span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            Professional-grade publishing tools designed for modern authors. Create, publish, and distribute your masterpiece with cutting-edge technology.
                        </p>
                    </div>
                    {/* Premium Feature Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* 1. STUDIO CARD - INSTANT COVER DESIGN */}
                        <Link href={route('login')} className="lg:col-span-8 group relative min-h-[500px] overflow-hidden block">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                            <div className="relative h-full bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl rounded-3xl border border-white/10 p-8 md:p-10 flex flex-col justify-between overflow-hidden group-hover:border-indigo-500/50 transition-all duration-500">
                                <div className="relative z-10 mb-8">
                                    <h3 className="text-3xl md:text-4xl font-black text-white mb-3">Instant Cover Design</h3>
                                    <p className="text-gray-400 max-w-md">Generate award-winning book covers in seconds. No design skills required.</p>
                                </div>
                                {/* Animated Template Showcase */}
                                <div className="relative flex justify-center items-center h-64 perspective-1000">
                                    {/* Card 1 (Left) */}
                                    <div className="absolute w-40 h-56 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 shadow-2xl transform -translate-x-32 scale-90 rotate-y-12 z-10 border border-white/10 opacity-60 group-hover:opacity-100 group-hover:-translate-x-40 transition-all duration-700">
                                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&q=80')] bg-cover mix-blend-overlay opacity-50"></div>
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <div className="h-1.5 w-12 bg-white/40 rounded-full mb-2"></div>
                                            <div className="h-1.5 w-8 bg-white/30 rounded-full"></div>
                                        </div>
                                    </div>
                                    {/* Card 2 (Right) */}
                                    <div className="absolute w-40 h-56 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-2xl transform translate-x-32 scale-90 -rotate-y-12 z-10 border border-white/10 opacity-60 group-hover:opacity-100 group-hover:translate-x-40 transition-all duration-700">
                                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=300&q=80')] bg-cover mix-blend-overlay opacity-50"></div>
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <div className="h-1.5 w-12 bg-white/40 rounded-full mb-2"></div>
                                            <div className="h-1.5 w-8 bg-white/30 rounded-full"></div>
                                        </div>
                                    </div>
                                    {/* Card 3 (Center - Active) */}
                                    <div className="absolute w-48 h-64 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl z-20 transform group-hover:scale-105 transition-transform duration-500 border border-white/20">
                                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1621944190610-a96074743589?w=400&q=80')] bg-cover mix-blend-overlay opacity-40"></div>
                                        <div className="absolute inset-0 flex flex-col justify-end p-6">
                                            <div className="inline-block px-2 py-1 bg-white/20 backdrop-blur-md rounded text-[10px] text-white font-bold mb-auto self-end">GENERATE</div>
                                            <h4 className="text-2xl font-serif font-bold text-white mb-1 drop-shadow-lg">The Future</h4>
                                            <p className="text-white/60 text-xs font-medium uppercase tracking-widest">James Wright</p>
                                        </div>
                                        {/* Scan effect */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent h-1/4 w-full animate-[scan_3s_ease-in-out_infinite]"></div>
                                    </div>
                                </div>
                                <style>{`
                                        @keyframes scan {
                                            0% { top: -25%; opacity: 0; }
                                            50% { opacity: 1; }
                                            100% { top: 125%; opacity: 0; }
                                        }
                                    `}</style>
                            </div>
                        </Link>
                        {/* 2. GLOBAL REACH - LIVE MAP (UNCHANGED CONTENT, JUST POSITION) */}
                        <div className="lg:col-span-4 lg:row-span-2 group relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                            <div className="relative h-full bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl rounded-3xl border border-white/10 p-0 overflow-hidden flex flex-col">
                                <div className="p-8 pb-0 relative z-10">
                                    <h3 className="text-2xl font-black text-white mb-2">Global Feed</h3>
                                    <p className="text-gray-400 text-sm">Live distribution events monitoring</p>
                                </div>
                                {/* Fake Map & Ping */}
                                <div className="flex-1 relative mt-8 w-full min-h-[250px]">
                                    {/* CSS Map Dots */}
                                    <div className="absolute top-[30%] left-[20%] w-3 h-3 bg-purple-500 rounded-full animate-ping opacity-75"></div>
                                    <div className="absolute top-[30%] left-[20%] w-3 h-3 bg-purple-500 rounded-full opacity-100"></div>
                                    <div className="absolute top-[40%] right-[30%] w-3 h-3 bg-pink-500 rounded-full animate-ping delay-700 opacity-75"></div>
                                    <div className="absolute top-[40%] right-[30%] w-3 h-3 bg-pink-500 rounded-full opacity-100"></div>
                                    <div className="absolute top-[60%] left-[60%] w-3 h-3 bg-indigo-500 rounded-full animate-ping delay-1000 opacity-75"></div>
                                    <div className="absolute top-[60%] left-[60%] w-3 h-3 bg-indigo-500 rounded-full opacity-100"></div>
                                    {/* Map Image Background (World Map SVG Pattern) */}
                                    <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-contain bg-no-repeat bg-center opacity-10 filter invert contrast-150"></div>
                                </div>
                                {/* Live Ticker List */}
                                <div className="p-5 space-y-4 bg-black/20 backdrop-blur-md border-t border-white/5">
                                    <div className="flex items-center gap-3 text-xs text-gray-300">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                        <span className="flex-1 truncate">Published to <strong className="text-white">Amazon US</strong></span>
                                        <span className="text-gray-500 font-mono">2m ago</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-300">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                        <span className="flex-1 truncate">New Sale in <strong className="text-white">Germany</strong></span>
                                        <span className="text-gray-500 font-mono">5m ago</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-300">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                                        <span className="flex-1 truncate">Sent to <strong className="text-white">Apple Books</strong></span>
                                        <span className="text-gray-500 font-mono">12m ago</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* 3. NEW FEATURE GRID (REPLACING TERMINAL & GROWTH) */}
                        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Card A: Online Formatting Tool */}
                            <Link href={route('login')} className="group relative min-h-[250px] overflow-hidden rounded-3xl hover:-translate-y-1 transition-transform duration-300 block">
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                                <div className="relative h-full bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl rounded-3xl border border-white/10 p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                                        </div>
                                        <h3 className="text-xl font-black text-white mb-2">Formatting Tool</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">Perfect layout for Kindle & Print. One-click export to PDF & EPUB.</p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                                        <span>Try Online</span>
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                    </div>
                                </div>
                            </Link>
                            {/* Card B: Inbuilt Canva */}
                            <Link href={route('login')} className="group relative min-h-[250px] overflow-hidden rounded-3xl hover:-translate-y-1 transition-transform duration-300 block">
                                <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 to-rose-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                                <div className="relative h-full bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl rounded-3xl border border-white/10 p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                        <h3 className="text-xl font-black text-white mb-2">Design Suite</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">Integrated design tools. Create stunning visuals without leaving.</p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-pink-400 text-xs font-bold uppercase tracking-wider">
                                        <span>Launch Canvas</span>
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                    </div>
                                </div>
                            </Link>
                            {/* Card C: Smart Writing Tool (Full Width of inner grid) */}
                            <Link href={route('guest-writer.pricing')} className="md:col-span-2 group relative min-h-[180px] overflow-hidden rounded-3xl hover:-translate-y-1 transition-transform duration-300 block">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                                <div className="relative h-full bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl rounded-3xl border border-white/10 p-6 flex items-center gap-6">
                                    <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-emerald-500/20 items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-black text-white mb-2">Smart Writing Tool</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed mb-3">Distraction-free environment with intelligent suggestions to help you write faster and better.</p>
                                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider group-hover:text-emerald-300 transition-colors">
                                            <span>Start Writing</span>
                                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div >
            <style>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0px) translateX(0px); }
                        50% { transform: translateY(-20px) translateX(10px); }
                    }
                    @keyframes gradient {
                        0%, 100% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                    }
                    .animate-gradient {
                        background-size: 200% 200%;
                        animation: gradient 3s ease infinite;
                    }
                `}</style>
            {/* HOW IT WORKS SECTION - VIBRANT GLASSMORPHISM */}
            <div id="how-it-works" className="reveal-on-scroll py-28 relative overflow-hidden transition-all duration-1000 transform translate-y-10 opacity-0 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100" data-visible={isVisible['how-it-works']}>
                {/* Ambient background glows */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 blur-[150px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
                            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
                            <span className="text-indigo-400 font-bold tracking-widest uppercase text-xs">How It Works</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
                            Publish in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">3 Simple Steps</span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">From an idea in your head to a masterpiece in the global marketplace, in just minutes.</p>
                    </div>
                    <div className="relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-px z-0" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), rgba(168,85,247,0.5), rgba(34,211,238,0.5), transparent)' }}></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10 pt-6">
                            {[
                                { step: '01', title: 'Create Your Book', desc: 'Upload your manuscript and design a professional cover using our intuitive tools.', icon: '📝', gradient: 'from-indigo-500/20 via-indigo-500/5 to-transparent', border: 'border-indigo-500/20 hover:border-indigo-400/50', accent: 'bg-gradient-to-r from-indigo-500 to-blue-500', glow: 'group-hover:shadow-indigo-500/20' },
                                { step: '02', title: 'Format & Preview', desc: 'Our smart formatting engine automatically prepares your book for all major platforms.', icon: '⚙️', gradient: 'from-purple-500/20 via-purple-500/5 to-transparent', border: 'border-purple-500/20 hover:border-purple-400/50', accent: 'bg-gradient-to-r from-purple-500 to-pink-500', glow: 'group-hover:shadow-purple-500/20' },
                                { step: '03', title: 'Publish Globally', desc: 'Distribute to 50+ retailers worldwide with a single click. Start earning immediately.', icon: '🚀', gradient: 'from-cyan-500/20 via-cyan-500/5 to-transparent', border: 'border-cyan-500/20 hover:border-cyan-400/50', accent: 'bg-gradient-to-r from-cyan-500 to-emerald-500', glow: 'group-hover:shadow-cyan-500/20' }
                            ].map((item, index) => (
                                <div key={index} className="relative group pt-4">
                                    {/* Step badge - outside the card */}
                                    <div className={`absolute -top-0 left-1/2 transform -translate-x-1/2 px-5 py-2 rounded-full ${item.accent} shadow-lg z-20`}>
                                        <span className="text-white font-black text-xs tracking-widest">STEP {item.step}</span>
                                    </div>
                                    {/* Gradient border wrapper */}
                                    <div className={`relative bg-gradient-to-b ${item.gradient} backdrop-blur-xl rounded-3xl p-[1px] transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-2xl ${item.glow}`}>
                                        <div className={`bg-[#1a1035]/90 rounded-3xl p-8 h-full border ${item.border} transition-all duration-500 relative`}>
                                            {/* Top accent bar */}
                                            <div className={`absolute top-0 left-6 right-6 h-[2px] ${item.accent} rounded-b-full opacity-60 group-hover:opacity-100 transition-opacity`}></div>
                                            <div className="text-5xl mt-4 mb-6 text-center transform group-hover:scale-125 group-hover:rotate-3 transition-all duration-500">{item.icon}</div>
                                            <h3 className="text-2xl font-bold text-white mb-4 text-center">{item.title}</h3>
                                            <p className="text-gray-400 leading-relaxed text-center text-sm">{item.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* VALUES SECTION - GRADIENT GLASS BENTO */}
            <div id="ownership-values" className="reveal-on-scroll py-28 relative overflow-hidden transition-all duration-1000 transform translate-y-10 opacity-0 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100" data-visible={isVisible['ownership-values']}>
                {/* Ambient glows */}
                <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-emerald-500/[0.08] blur-[150px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/[0.08] blur-[150px] rounded-full pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                            <span className="text-emerald-400 font-bold tracking-widest uppercase text-xs">Our Promise</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                            Your Vision, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Our Platform</span>
                        </h2>
                        <p className="text-xl text-gray-400">Empowering writers with transparent solutions and global reach</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* 100% Ownership - spans 7 cols */}
                        <div className="md:col-span-7 group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/10 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-indigo-400/40 transition-all duration-500 p-10 h-full group-hover:-translate-y-1">
                                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-40 group-hover:opacity-100 transition-opacity"></div>
                                <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                                <div className="relative z-10">
                                    <div className="mb-6 w-14 h-14 bg-gradient-to-br from-indigo-500/30 to-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-4">100% Ownership</h3>
                                    <p className="text-gray-400 leading-relaxed text-lg max-w-md">You retain all rights to your intellectual property. Your work, your rules, forever. We simply provide the tools to amplify your voice.</p>
                                </div>
                            </div>
                        </div>
                        {/* Right column: Monthly Payouts + Expert Distribution stacked */}
                        <div className="md:col-span-5 flex flex-col gap-6">
                            {/* Monthly Payouts */}
                            <div className="group relative flex-1">
                                <div className="relative h-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-emerald-400/40 transition-all duration-500 p-8 group-hover:-translate-y-1">
                                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-40 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none"></div>
                                    <div className="relative z-10">
                                        <div className="mb-5 w-12 h-12 bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Monthly Payouts</h3>
                                        <p className="text-gray-400 text-sm">Transparent royalty reports with direct monthly payments.</p>
                                    </div>
                                </div>
                            </div>
                            {/* Expert Distribution */}
                            <div className="group relative flex-1">
                                <div className="relative h-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-orange-400/40 transition-all duration-500 p-8 group-hover:-translate-y-1">
                                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-40 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none"></div>
                                    <div className="relative z-10">
                                        <div className="mb-5 w-12 h-12 bg-gradient-to-br from-orange-500/30 to-orange-500/10 rounded-2xl flex items-center justify-center text-orange-400 border border-orange-500/30 group-hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Expert Distribution</h3>
                                        <p className="text-gray-400 text-sm">Reach Amazon, Apple, Google, and 50+ stores automatically.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Multi-Format Sales - full width */}
                        <div className="md:col-span-12 group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-purple-400/40 transition-all duration-500 p-10 group-hover:-translate-y-1">
                                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-40 group-hover:opacity-100 transition-opacity"></div>
                                <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500/30 to-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 border border-purple-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex-shrink-0">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white mb-3">Multi-Format Sales</h3>
                                        <p className="text-gray-400 leading-relaxed text-lg max-w-2xl">Sell eBooks, Hardcovers, and Audiobooks simultaneously across all major global retailers from a single unified dashboard.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* COMPREHENSIVE TOOLS SECTION - FLOATING CARDS */}
            <div id="tools-suite" className="reveal-on-scroll py-24 relative overflow-hidden transition-all duration-1000 transform translate-y-10 opacity-0 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100" data-visible={isVisible['tools-suite']}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-20">
                        <span className="text-cyan-400 font-bold tracking-widest uppercase text-sm mb-3 block">Ecosystem</span>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
                            Your Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Publishing Suite</span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">Everything you need to turn your raw manuscript into a stunning marketplace masterpiece.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'AI Cover Creator',
                                description: 'Design professional, market-ready covers in minutes with our intuitive drag-and-drop editor and premium templates.',
                                icon: (
                                    <svg className="w-10 h-10 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                ),
                                bg: 'from-pink-500/10 to-rose-500/5',
                                border: 'hover:border-pink-500/50',
                                glow: 'bg-pink-500/20'
                            },
                            {
                                title: 'Smart Formatting',
                                description: 'Automatically convert your manuscript into eBook, Paperback, and Hardcover formats that meet global industry standards.',
                                icon: (
                                    <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                ),
                                bg: 'from-cyan-500/10 to-blue-500/5',
                                border: 'hover:border-cyan-500/50',
                                glow: 'bg-cyan-500/20'
                            },
                            {
                                title: 'Real-Time Insights',
                                description: 'Track your global sales, royalties, and reader engagement across all stores from a single, unified dashboard.',
                                icon: (
                                    <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                ),
                                bg: 'from-purple-500/10 to-indigo-500/5',
                                border: 'hover:border-purple-500/50',
                                glow: 'bg-purple-500/20'
                            }
                        ].map((feature, i) => (
                            <div key={i} className={`relative group p-10 bg-gradient-to-br ${feature.bg} backdrop-blur-xl rounded-[2.5rem] border border-white/5 transition-all duration-500 hover:-translate-y-2 ${feature.border} overflow-hidden`}>
                                <div className={`absolute top-0 right-0 w-40 h-40 ${feature.glow} blur-[80px] rounded-full translate-x-10 -translate-y-10 transition-colors`}></div>
                                <div className="mb-8 p-5 bg-black/20 rounded-2xl inline-block border border-white/5 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300 shadow-lg">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed text-lg">{feature.description}</p>
                                <div className="mt-10 flex items-center gap-2 text-white/50 group-hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">
                                    <span>Explore Tool</span>
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* DYNAMIC GLOBAL DISTRIBUTION NETWORK */}
            <div id="dist-network" className="reveal-on-scroll py-20 relative overflow-hidden bg-[#0f0a1e] transition-all duration-1000 transform translate-y-10 opacity-0 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100" data-visible={isVisible['dist-network']}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="bg-[#1a1035]/40 border border-white/5 rounded-[3rem] p-12 relative overflow-hidden group">
                        {/* Animated Grid Background */}
                        <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.15) 1px, transparent 0)',
                            backgroundSize: '40px 40px'
                        }}></div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Live Platform Data
                                </div>
                                <h2 className="text-4xl font-black text-white mb-6 leading-tight">
                                    Trusted by Authors. <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Loved by Readers.</span>
                                </h2>
                                <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                                    Join our rapidly growing community of creators. We provide the tools, you provide the stories.
                                </p>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Books Published', value: platformStats.publishedBooks, suffix: ' Titles', delay: '1s', color: 'indigo' },
                                        { label: 'Authors Joined', value: platformStats.totalAuthors, suffix: ' Creators', delay: '2s', color: 'purple' },
                                        { label: 'Distribution Channels', value: '50+', suffix: ' Global Stores', delay: '3s', color: 'emerald' },
                                    ].map((stat, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                                            <div className={`w-2 h-2 rounded-full bg-${stat.color}-500 animate-ping`} style={{ animationDelay: stat.delay }}></div>
                                            <div className="flex-1">
                                                <span className="text-white font-bold block">{stat.label}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xl font-black text-white">{stat.value}</span>
                                                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">{stat.suffix}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative h-[400px] w-full flex items-center justify-center overflow-hidden rounded-3xl">
                                {/* Premium Global Image */}
                                <div className="absolute inset-0">
                                    <img
                                        src={`${route('welcome')}/images/global-network.png`}
                                        alt="Global Distribution Network"
                                        className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-700 hover:scale-105 transform"
                                    />
                                    {/* Gradient Overlay for blending */}
                                    <div className="absolute inset-0 bg-gradient-to-l from-[#0f0a1e] via-transparent to-[#0f0a1e]/80"></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a1e] via-transparent to-transparent"></div>
                                </div>
                                {/* Floating Stats Card similar to glassmorphism */}
                                <div className="absolute bottom-6 right-6 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl animate-float">
                                    <div className="flex items-center gap-3">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map((_, i) => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#2a1f4e] bg-gray-600 overflow-hidden">
                                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="text-xs text-white">
                                            <span className="font-bold block">Just Published</span>
                                            <span className="text-gray-400">2 mins ago</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* WHY PUBLICATION MART? - FILLING THE GAP */}
            <div id="why-us" className="reveal-on-scroll py-24 relative overflow-hidden transition-all duration-1000 transform translate-y-10 opacity-0 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100" data-visible={isVisible['why-us']}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                                Built by Authors, <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">For Authors.</span>
                            </h2>
                            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                                We've simplified the complex world of publishing. No more middlemen, no more hidden feesjust a direct path from your computer to global stores.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    { title: 'Global Coverage', desc: 'Reach 50+ countries and thousands of retail channels.' },
                                    { title: 'Full Control', desc: 'You decide the price, the cover, and the distribution.' },
                                    { title: 'Fast Results', desc: 'Go from manuscript to store in as little as 24 hours.' }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold">{item.title}</h4>
                                            <p className="text-gray-500 text-sm">{item.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-[2rem] blur-[80px]"></div>
                            <div className="relative p-1 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-[2rem] border border-white/10">
                                <div className="bg-[#1a1035] rounded-[1.8rem] p-8 relative overflow-hidden h-full flex flex-col justify-between min-h-[400px]">
                                    {/* Background Pattern */}
                                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                                    {/* Header Status */}
                                    <div className="flex items-center justify-between mb-8 relative z-10">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span className="text-xs font-bold text-white tracking-wider">LIVE DASHBOARD</span>
                                        </div>
                                        <div className="text-xs text-gray-500 font-mono">UPDATED: JUST NOW</div>
                                    </div>
                                    {/* Main Success Card */}
                                    <div className="relative z-10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 mb-6 shadow-2xl transform hover:scale-[1.02] transition-transform">
                                        <div className="flex items-start gap-4">
                                            {/* Book Cover Icon */}
                                            <div className="w-16 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg flex-shrink-0 flex items-center justify-center">
                                                <span className="text-2xl">📖</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs text-emerald-400 font-bold mb-1 uppercase tracking-wider">Congratulations!</div>
                                                <h3 className="text-white font-bold text-lg mb-1 leading-tight">Your Book is Live!</h3>
                                                <p className="text-gray-400 text-xs mb-3">Accessible to 50+ countries</p>
                                                {/* Retailer Badges */}
                                                <div className="flex gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center" title="Amazon">
                                                        <span className="text-xs">🅰️</span>
                                                    </div>
                                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center" title="Apple Books">
                                                        <span className="text-xs">🍎</span>
                                                    </div>
                                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center" title="Google Play">
                                                        <span className="text-xs">▶️</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4 relative z-10">
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                            <div className="text-gray-400 text-xs font-bold mb-1">ROYALTIES</div>
                                            <div className="text-emerald-400 text-xl font-black flex items-center gap-1">
                                                ₹1,02,500
                                                <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                            <div className="text-gray-400 text-xs font-bold mb-1">UNITS SOLD</div>
                                            <div className="text-white text-xl font-black flex items-center gap-1">
                                                342
                                                <span className="text-[10px] text-gray-500 font-normal self-end mb-1">copies</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* PRICING SECTION */}
            <div id="pricing-section" className="reveal-on-scroll py-24 relative overflow-hidden transition-all duration-1000 transform translate-y-10 opacity-0 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100" data-visible={isVisible['pricing-section']}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                            Plans for Every <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Ambition</span>
                        </h2>
                        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                            Choose the perfect plan to accelerate your writing journey. From text-only assistance to full-suite creative power.
                        </p>
                        {/* Pricing Toggle */}
                        <div className="inline-flex bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 relative">
                            {/* Sliding Background */}
                            <div
                                className={`absolute inset-y-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg transition-all duration-300 ease-out z-0 h-[calc(100%-12px)]`}
                                style={{
                                    left: pricingTab === 'pro' ? '6px' : '50%',
                                    width: 'calc(50% - 6px)',
                                    transform: pricingTab === 'premium' ? 'translateX(0)' : 'translateX(0)'
                                }}
                            ></div>
                            <button
                                onClick={() => setPricingTab('pro')}
                                className={`relative z-10 px-8 py-3 rounded-xl font-bold text-sm transition-colors duration-300 w-48 ${pricingTab === 'pro' ? 'text-white' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Pro Suite
                            </button>
                            <button
                                onClick={() => setPricingTab('premium')}
                                className={`relative z-10 px-8 py-3 rounded-xl font-bold text-sm transition-colors duration-300 w-48 ${pricingTab === 'premium' ? 'text-white' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Premium Suite
                            </button>
                        </div>
                        {pricingTab === 'premium' && (
                            <p className="text-xs text-purple-400 font-bold mt-4 animate-fade-in-up">
                                â¨ Full Publishing + Marketing & Promotion Services
                            </p>
                        )}
                    </div>
                    {/* Pricing Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* PRO SUITE PLANS */}
                        {pricingTab === 'pro' && [
                            {
                                name: 'Saver',
                                subtitle: 'For Self-Starters',
                                price: 2999,
                                popular: false,
                                features: ['Smart Writing Tool', 'A-Z Writing Assist', 'Auto Formatting', 'Global Distribution', 'Standard 6x9 Size']
                            },
                            {
                                name: 'Optimizer',
                                subtitle: 'Writer Advantage',
                                price: 3999,
                                popular: false,
                                features: ['Smart Writing Tool with Image Generator', 'A-Z Writing Assist', 'Auto Formatting', 'Global Distribution', 'Standard 6x9 Size']
                            },
                            {
                                name: 'Silver',
                                subtitle: 'Professional Publishing Starter',
                                price: 11999,
                                popular: true,
                                features: ['Expert Writing', 'ISBN Allocation', 'Cover Page Design', 'Interior Formatting (Basic)', 'Online Sales Board', 'Author Royalty 100%', 'Indian Online Distribution', 'Profit Payout  Monthly', 'Dedicated Publishing Manager', 'Guided Publishing']
                            },
                            {
                                name: 'Gold',
                                subtitle: 'Publishing + Starter Promotion',
                                price: 17999,
                                popular: false,
                                features: ['Everything in Silver Package', 'Hardcopies (B/W)  4 Nos', 'Social Media Posts & Banner (4 Nos)', 'Audio Publishing']
                            }
                        ].map((plan, i) => (
                            <div key={i} className={`relative group h-full ${plan.popular ? 'lg:-translate-y-4' : ''}`}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                                        <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                                            Best Value
                                        </span>
                                    </div>
                                )}
                                <div className={`h-full bg-[#1a1035] rounded-2xl border ${plan.popular ? 'border-indigo-500/50 ring-2 ring-indigo-500/20' : 'border-white/5'} p-6 flex flex-col hover:border-indigo-500/30 transition-all duration-300 group-hover:transform group-hover:scale-[1.02] relative overflow-hidden`}>
                                    {plan.popular && <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none"></div>}
                                    <h3 className="text-xl font-bold text-white mb-0.5">{plan.name}</h3>
                                    <p className="text-xs text-gray-500 mb-3 font-medium">{plan.subtitle}</p>
                                    <div className="mb-5">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black text-white">₹{plan.price.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2.5 mb-6 flex-1">
                                        <div className="h-px bg-white/5 mb-3"></div>
                                        {plan.features.map((feat, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                                                <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                {feat}
                                            </div>
                                        ))}
                                    </div>
                                    {['silver', 'gold'].includes(plan.name.toLowerCase()) ? (
                                        <Link href={`${route('publishing-inquiry.create')}?plan=${plan.name.toLowerCase()}`} className={`block w-full py-3 rounded-xl font-bold text-sm text-center transition-all ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}>
                                            Choose {plan.name}
                                        </Link>
                                    ) : (
                                        <Link href={route('guest-writer.pricing')} className={`block w-full py-3 rounded-xl font-bold text-sm text-center transition-all bg-white/5 hover:bg-white/10 text-white border border-white/10`}>
                                            Choose {plan.name}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                        {/* PREMIUM SUITE PLANS */}
                        {pricingTab === 'premium' && [
                            {
                                name: 'Diamond',
                                subtitle: 'Brand Visibility Package',
                                price: 39999,
                                popular: false,
                                features: ['Everything in Gold Package', 'Interior Formatting (Premium)', 'Hardcopies (B/W)  10 Nos', 'Social Media Posts & Banner (10 Nos)', 'Book Video Trailer', 'Author Website (Basic)  Free 1 Year', 'International Online Distribution', 'Amazon Sponsored Ads  2 Months', 'Blog Article on PM Website  1 No']
                            },
                            {
                                name: 'Platinum',
                                subtitle: 'Growth Acceleration Package',
                                price: 99999,
                                popular: false,
                                features: ['Everything in Diamond Package', 'Social Media Posts & Banner (25 Nos)', 'Amazon Sponsored Ads  4 Months', 'Blog Article on PM Website  2 Nos', '25 Books Giveaway Contest', 'Audio Song on Book', 'Author Interview', 'News Coverage 80+ Social Media Channels']
                            },
                            {
                                name: 'Prestige',
                                subtitle: 'Market Expansion Package',
                                price: 149999,
                                popular: true,
                                features: ['Everything in Platinum Package', 'Amazon Sponsored Ads  6 Months', 'News Coverage 100+ Channels + 1 News Channel', 'Book Fair Participation', 'Retail Distribution 15+ Stores', 'Book Influencer Marketing']
                            },
                            {
                                name: 'Signature',
                                subtitle: 'Elite Author Positioning',
                                price: 199999,
                                popular: false,
                                features: ['Everything in Prestige Package', 'Amazon Sponsored Ads  12 Months', 'News Coverage 100+ Channels + News Paper', 'Author Website (Premium)', 'Retail Distribution 40+ Stores', 'YouTube Ads Placement  1 Month', 'Blog Article on PM Website  4 Nos', 'Book Launching Ceremony']
                            }
                        ].map((plan, i) => (
                            <div key={i} className={`relative group h-full ${plan.popular ? 'lg:-translate-y-4' : ''}`}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                                            Most Popular
                                        </span>
                                    </div>
                                )}
                                <div className={`h-full bg-[#1a1035] rounded-2xl border ${plan.popular ? 'border-purple-500/50 ring-2 ring-purple-500/20' : 'border-white/5'} p-6 flex flex-col hover:border-purple-500/30 transition-all duration-300 group-hover:transform group-hover:scale-[1.02] relative overflow-hidden`}>
                                    {plan.popular && <div className="absolute inset-0 bg-purple-500/5 pointer-events-none"></div>}
                                    <h3 className="text-xl font-bold text-white mb-0.5">{plan.name}</h3>
                                    <p className="text-xs text-gray-500 mb-3 font-medium">{plan.subtitle}</p>
                                    <div className="mb-5">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">₹{plan.price.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2.5 mb-6 flex-1">
                                        <div className="h-px bg-white/5 mb-3"></div>
                                        {plan.features.map((feat, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                                                <svg className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                {feat}
                                            </div>
                                        ))}
                                    </div>
                                    <Link href={`${route('publishing-inquiry.create')}?plan=${plan.name.toLowerCase()}`} className={`block w-full py-3 rounded-xl font-bold text-sm text-center transition-all ${plan.popular ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}>
                                        Choose {plan.name}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 text-center">
                        <Link href={route('contact')} className="text-gray-400 hover:text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                            Need a custom plan? Contact us
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </Link>
                    </div>
                </div>
            </div>
            {/* FAQ SECTION */}
            <div id="faq-section" className="reveal-on-scroll pt-10 pb-24 transition-all duration-1000 transform translate-y-10 opacity-0 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100" data-visible={isVisible['faq-section']}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Questions</span>
                        </h2>
                        <p className="text-xl text-gray-400">Everything you need to know</p>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-[#1a1035] rounded-xl border border-white/5 overflow-hidden hover:border-indigo-500/30 transition-colors"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full px-6 py-5 flex items-center justify-between text-left"
                                >
                                    <span className="text-lg font-semibold text-white pr-8">{faq.question}</span>
                                    <svg
                                        className={`w-5 h-5 text-indigo-400 flex-shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''
                                            }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div
                                    className={`transition-all duration-300 ${openFaq === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                                        } overflow-hidden`}
                                >
                                    <div className="px-6 pb-5 text-gray-400 leading-relaxed">{faq.answer}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* GLOBAL DISTRIBUTION PARTNERS SECTION */}
            <div className="py-10 border-y border-white/5 overflow-hidden bg-black/20">
                <p className="text-center text-gray-500 text-xs font-bold uppercase tracking-[0.3em] mb-8">
                    Distribute Your Book Globally
                </p>
                {/* Infinite Scroll Marquee */}
                <div className="relative flex overflow-x-hidden group">
                    <div className="animate-marquee whitespace-nowrap flex items-center gap-20 px-8 opacity-50 grayscale group-hover:opacity-100 transition-all duration-500">
                        {/* Duplicated List for Seamless Loop */}
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="flex gap-20 items-center">
                                <span className="text-2xl font-bold text-white tracking-tight flex items-center gap-1">
                                    Amazon<span className="font-light">Kindle</span>
                                </span>
                                <span className="text-2xl font-semibold text-white flex items-center gap-1">
                                    Apple<span className="font-thin">Books</span>
                                </span>
                                <span className="text-2xl font-medium text-white flex items-center gap-1">
                                    Google<span className="text-blue-400 font-bold">Play</span>
                                </span>
                                <span className="text-2xl font-serif text-white font-bold flex items-center gap-1">
                                    Barnes<span className="text-gray-400 italic">&</span>Noble
                                </span>
                                <span className="text-2xl font-black text-white tracking-wider">Kobo</span>
                                <span className="text-2xl font-bold text-white italic flex items-center">
                                    Ingram<span className="text-indigo-500 not-italic">Spark</span>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* GENRE MASTERY SECTION - STATIC CONTENT */}
            <div id="genre-section" className="reveal-on-scroll py-24 relative overflow-hidden transition-all duration-1000 transform translate-y-10 opacity-0 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100" data-visible={isVisible['genre-section']}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                            Ready for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Every Genre</span>
                        </h2>
                        <p className="text-xl text-gray-400">From literary fiction to technical research, we support your vision.</p>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { name: 'Fiction', icon: '📖', desc: 'Novels & Stories' },
                            { name: 'Research', icon: '🔬', desc: 'Academic Papers' },
                            { name: 'Business', icon: '💼', desc: 'Growth & Strategy' },
                            { name: 'Fantasy', icon: '🪄', desc: 'World Building' },
                            { name: 'Self-Help', icon: '🌱', desc: 'Personal Growth' },
                            { name: 'Comics', icon: '🎨', desc: 'Graphic Novels' },
                            { name: 'Tech', icon: '💻', desc: 'Guides & Manuals' },
                            { name: 'Poetry', icon: '🖋️', desc: 'Verse & Rhyme' }
                        ].map((genre, i) => (
                            <div key={i} className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:border-indigo-500/40 transition-all hover:-translate-y-1 group">
                                <div className="text-3xl mb-4 group-hover:scale-125 transition-transform duration-300">{genre.icon}</div>
                                <h4 className="text-white font-bold text-lg mb-1">{genre.name}</h4>
                                <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">{genre.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* ENHANCED CALL TO ACTION */}
            <div className="relative py-24 overflow-hidden border-t border-white/5">
                <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold mb-8">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        Join 12,500+ Authors Today
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
                        Ready to tell your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">story to the world?</span>
                    </h2>
                    <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                        Join the fastest-growing community of independent authors. Start publishing in minutes, not months.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href={route('register')}
                            className="w-full sm:w-auto px-10 py-5 text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full hover:shadow-2xl hover:shadow-indigo-500/50 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            Get Started for Free
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                        <Link
                            href={route('book-store.index')}
                            className="w-full sm:w-auto px-10 py-5 text-lg font-semibold text-white bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all hover:scale-105 flex items-center justify-center gap-2"
                        >
                            Browse Published Books
                        </Link>
                    </div>
                    <p className="text-sm text-gray-500 mt-8">
                        No credit card required  Publish in 24 hours  Keep 100% of your rights
                    </p>
                </div>
            </div>
            <style>{`
                @keyframes beam {
                    0% { transform: translateY(-100%) rotate(15deg); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateY(100%) rotate(15deg); opacity: 0; }
                }
                .animate-beam {
                    animation: beam 8s linear infinite;
                }
                
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                @keyframes fade-in-up {
                    from { 
                        opacity: 0; 
                        transform: translateY(30px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 1s cubic-bezier(0.23, 1, 0.32, 1) forwards;
                }
                @keyframes gradient-text {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient-text {
                    background-size: 200% auto;
                    animation: gradient-text 4s linear infinite;
                }
                .reveal-on-scroll {
                    will-change: transform, opacity;
                }
            `}</style>
        </>
    );
}
