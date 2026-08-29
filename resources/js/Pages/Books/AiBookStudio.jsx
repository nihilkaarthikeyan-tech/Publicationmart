import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';

const FICTION_TYPES = [
    'Literary Fiction', 'Fantasy', 'Science Fiction', 'Historical Fiction',
    'Romance', 'Mystery & Thriller', 'Horror', 'Adventure',
    'Young Adult (YA) Fiction', "Children's Fiction"
];

const NON_FICTION_TYPES = [
    'Academic / Textbooks', 'Scientific & Research Books', 'Technical & Professional Books',
    'Business & Economics', 'Self-Help & Personal Development', 'Biographies & Autobiographies'
];

// Maps plan names (stored in ai_plan_name) to their page range strings
const planNameToPageRange = (planName) => {
    const name = (planName || '').toLowerCase().trim();
    if (/^\d+-\d+$/.test(name)) return name; // Already a range like "80-100"
    const map = {
        'saver':      '80-100',
        'standard':   '100-150',
        'pro':        '150-200',
        'enterprise': '200-250',
    };
    return map[name] || '80-100';
};

export default function AiBookStudio({ book, auth }) {
    // Smart Step Detection: Check URL parameters first, then default to Step 0
    const getInitialStep = () => {
        // Enforce Plan Selection: If no AI plan is associated, force Step 0
        if (!book.ai_plan_type) return 0;

        // Check if step parameter is passed in URL (from payment page)
        const urlParams = new URLSearchParams(window.location.search);
        const stepParam = urlParams.get('step');
        if (stepParam && !isNaN(parseInt(stepParam))) {
            return parseInt(stepParam);
        }
        return 1;
    };

    const [step, setStep] = useState(getInitialStep());
    const [isLoading, setIsLoading] = useState(false);

    // Data State (Mirroring DB)
    const [chapters, setChapters] = useState(book.ai_chapters || []);

    // Step 1: Initialization Inputs
    const [initData, setInitData] = useState({
        title: book.title || '',
        author_name: book.author_name || '',
        topic: book.topic || book.about_book || '',
        audience: book.audience || 'General Readers',
        chapter_count: 10,
        sub_chapter_count: 15,
        page_range: planNameToPageRange(book.ai_plan_name),
        genre: book.genre || 'Non-Fiction'
    });

    // Step 4: Writer State
    const [activeChapterId, setActiveChapterId] = useState(null);
    const [activeSection, setActiveSection] = useState(null);
    const [writerTone, setWriterTone] = useState('Professional');
    const [writerPerspective, setWriterPerspective] = useState('3rd Person');
    // generatedImage state removed - use activeSection.image_url instead
    const [imageCredits, setImageCredits] = useState({
        used: book.image_credits_used || 0,
        limit: book.image_credits_limit || 0
    });

    // Image Generation State
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [imagePromptMode, setImagePromptMode] = useState('auto'); // 'auto' or 'custom'
    const [customImagePrompt, setCustomImagePrompt] = useState('');
    const [showImagePromptModal, setShowImagePromptModal] = useState(false);

    // writing length is now auto-calculated, no state needed.

    // Handle Browser Back Button for Steps
    React.useEffect(() => {
        const handlePopState = (event) => {
            if (activeSection) {
                // Close section viewer first
                event.preventDefault();
                setActiveSection(null);
            } else if (step > 1) {
                // Determine if we should block the back event (pseudo-navigation)
                // In a real SPA with Inertia, this is tricky.
                // Best approach: Push state when changing steps.
            }
        };

        // window.addEventListener('popstate', handlePopState);
        return () => {
            // window.removeEventListener('popstate', handlePopState);
        };
    }, [step, activeSection]);

    // Custom Step Setter that pushes history
    const updateStep = (newStep) => {
        setStep(newStep);
        // Optional: window.history.pushState({ step: newStep }, '', window.location.href);
    };

    // ================== STEP 1: INITIALIZATION ==================
    // ================== STEP 1: INITIALIZATION ==================
    const setupOutline = async () => {
        if (!initData.topic.trim()) {
            alert("Please describe your book concept first.");
            return;
        }

        const rangeParts = (initData.page_range || '80-100').split('-');
        const maxPages = parseInt(rangeParts[1] || rangeParts[0] || 100);

        // Determine Plan Type for Limits
        let limits = { maxCh: 12, maxSub: 10 }; // Default Saver
        if (maxPages >= 200) limits = { maxCh: 25, maxSub: 20 }; // Enterprise
        else if (maxPages >= 150) limits = { maxCh: 20, maxSub: 15 }; // Pro
        else if (maxPages >= 120) limits = { maxCh: 15, maxSub: 12 }; // Standard

        // Platform Limits (Dynamic)
        if ((initData.chapter_count || 1) > limits.maxCh) {
            alert(`Plan Limit Exceeded: Maximum ${limits.maxCh} Chapters allowed for your plan.`);
            return;
        }
        if ((initData.sub_chapter_count || 1) > limits.maxSub) {
            alert(`Plan Limit Exceeded: Maximum ${limits.maxSub} Sub-chapters allowed for your plan.`);
            return;
        }

        const totalSub = (initData.chapter_count || 1) * (initData.sub_chapter_count || 1);
        const totalCapacityWords = maxPages * 275;
        const wordsPerSub = Math.floor(totalCapacityWords / totalSub);
        const pagesPerSub = wordsPerSub / 275;

        // Validation Rule: Must have at least ~0.5 page per sub-chapter (approx 135 words)
        // This ensures the sections aren't ridiculously short
        if (pagesPerSub < 0.5) {
            const requiredPages = totalSub * 0.5;
            alert(`Structure Too Dense!\n\nYour plan is set to ${maxPages} pages.\nWith ${totalSub} total sections, each section would be too short (${pagesPerSub.toFixed(2)} pages).\n\nTo keep this many sections, you would need a plan of at least ${Math.ceil(requiredPages)} pages.\n\nPlease reduce the number of chapters or sub-chapters to fit your current plan.`);
            return;
        }

        // Confirmation if pages per section is low
        if (pagesPerSub < 1.0 && !confirm(`Notice: Each sub-chapter will be short (approx ${pagesPerSub.toFixed(1)} pages).\n\nDo you want to continue with this dense structure?`)) {
            return;
        }

        setIsLoading(true);
        try {
            // Save metadata before proceeding
            await axios.post(route('ai-studio.context', book.id), {
                title: initData.title,
                author_name: initData.author_name,
                topic: initData.topic,
                audience: initData.audience,
                genre: initData.genre
            });
            setStep(2);
        } catch (e) {
            console.error("Failed to save context:", e);
            // Continue anyway locally
            setStep(2);
        } finally {
            setIsLoading(false);
        }
    };

    const generateOutline = async (mode = 'ai') => {
        setIsLoading(true);
        try {
            const payload = {
                title: initData.title,
                author_name: initData.author_name,
                topic: initData.topic,
                audience: initData.audience,
                chapter_count: initData.chapter_count,
                page_range: initData.page_range,
                genre: initData.genre,
                mode: mode
            };

            if (mode === 'manual') {
                const manualContent = document.getElementById('manual-chapters-input').value;
                if (!manualContent.trim()) return alert("Please enter your chapters.");
                payload.manual_content = manualContent;
            }

            const res = await axios.post(route('ai-studio.outline', book.id), payload);
            setChapters(res.data.chapters);
            // Stay on Step 2 to review
        } catch (error) {
            alert("Failed: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddManualChapter = async () => {
        // STRICT LIMIT CHECK
        const maxChapters = initData.chapter_count || 10;
        if (chapters.length >= maxChapters) {
            alert(`You have reached the limit of ${maxChapters} chapters as defined in your setup.`);
            return;
        }

        const title = document.getElementById('new-chapter-title').value;
        if (!title.trim()) return alert("Please enter a chapter title.");

        setIsLoading(true);
        try {
            const res = await axios.post(route('ai-studio.chapters.manual', book.id), { title });
            setChapters(res.data.chapters);
            document.getElementById('new-chapter-title').value = ''; // Clear input
        } catch (error) {
            alert("Failed to add chapter: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper for Step 3 Manual Structure
    const saveManualStructure = async (chapterId) => {
        const input = document.getElementById(`manual-input-${chapterId}`).value;
        if (!input.trim()) return alert("Please enter sub-headings.");

        // STRICT SUB-CHAPTER LIMIT CHECK
        const lines = input.split('\n').filter(line => line.trim() !== '');
        const maxSub = initData.sub_chapter_count || 5;

        if (lines.length > maxSub) {
            alert(`You are limited to ${maxSub} sub-chapters per chapter. You entered ${lines.length}.`);
            return;
        }

        setIsLoading(true);
        try {
            const res = await axios.post(route('ai-studio.sections.manual', chapterId), { sections: lines });
            // Update local state deeply
            const updatedChapters = chapters.map(c =>
                c.id === chapterId ? { ...c, sections: res.data.sections } : c
            );
            setChapters(updatedChapters);
        } catch (error) {
            alert("Failed to save structure: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // ================== STEP 2: OUTLINE REVIEW ==================
    const startSubChapters = async () => {
        // In a real app, we might allow edits here. For now, we trust the DB.
        // We trigger generation for the first chapter automatically or let user do it one by one.
        // Let's just move to step 3
        setStep(3);
        // Auto-select first chapter
        if (chapters.length > 0) setActiveChapterId(chapters[0].id);
    };

    // ================== STEP 3: SUB-CHAPTERS ==================
    const generateSectionsForChapter = async (chapterId) => {
        setIsLoading(true);
        try {
            const res = await axios.post(route('ai-studio.sections', { chapter: chapterId }), {
                count: initData.sub_chapter_count || 5
            });
            // Update local state
            setChapters(chapters.map(c => c.id === chapterId ? { ...c, sections: res.data.sections } : c));
        } catch (error) {
            alert("Failed: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };



    // Check if step 3 is complete (all chapters have sections)
    const isStructureComplete = () => {
        return chapters.every(c => c.sections && c.sections.length > 0);
    };

    // ================== STEP 4: WRITING ==================
    const writeContent = async (section) => {
        setIsLoading(true);

        // Dynamic Word Count Calculation
        // Goal: Total words (from page range) divided by Total Sections
        let targetWords = 500; // Default base

        if (initData.page_range) {
            const range = (initData.page_range || '80-100').split('-').map(Number);
            // Use upper bound or average, but let's align with backend 'maxPages' logic which uses upper bound mostly
            // Backend uses maxPages (e.g. 200) * 380. 
            // Here we are averaging. Let's use max (upper bound) to be safe/consistent with plan promise?
            // Actually, backend uses maxPages. Let's use range[1] || range[0].
            const maxPages = range[1] || range[0] || 100;
            const totalBookWords = maxPages * 275; // Safe 6x9 Standard

            // Count total sections in book
            let totalSections = 0;
            chapters.forEach(c => {
                if (c.sections) totalSections += c.sections.length;
            });

            if (totalSections > 0) {
                targetWords = Math.round(totalBookWords / totalSections);
                // Cap min/max for sanity
                if (targetWords < 300) targetWords = 300;
                if (targetWords > 2000) targetWords = 2000; // AI struggles with HUGE chunks at once
            }
        }

        try {
            const res = await axios.post(route('ai-studio.write', { section: section.id }), {
                tone: writerTone,
                perspective: writerPerspective,
                word_count: targetWords // Use calculated target
            });

            // Update the deeply nested section content
            setChapters(prev => prev.map(c => {
                if (c.id !== section.ai_chapter_id) return c;
                return {
                    ...c,
                    sections: c.sections.map(s => s.id === section.id ? res.data.section : s)
                };
            }));

            // Set as active to view
            setActiveSection(res.data.section);

        } catch (error) {
            alert("Writing Failed: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    // Open image generation modal
    const handleGenerateImageClick = () => {
        setShowImagePromptModal(true);
    };

    // Generate image with selected mode
    const generateImage = async (section, mode = 'auto', customPrompt = '') => {
        setShowImagePromptModal(false);
        setIsGeneratingImage(true);
        try {
            const res = await axios.post(route('ai-studio.image', { section: section.id }), {
                mode: mode,
                custom_prompt: mode === 'custom' ? customPrompt : null
            });

            // Update the deeply nested section data with new image URL
            const newImageUrl = res.data.imageUrl;

            setChapters(prev => prev.map(c => {
                if (c.id !== section.ai_chapter_id) return c;
                return {
                    ...c,
                    sections: c.sections.map(s => s.id === section.id ? { ...s, image_url: newImageUrl } : s)
                };
            }));

            // Also update the currently active section to show it immediately
            setActiveSection(prev => ({ ...prev, image_url: newImageUrl }));

            // Update credits
            if (res.data.credits_used !== undefined) {
                setImageCredits({
                    used: res.data.credits_used,
                    limit: res.data.credits_limit
                });
            }

            // Reset custom prompt after generation
            setCustomImagePrompt('');
            setImagePromptMode('auto');
        } catch (error) {
            alert("Image Generation Failed: " + (error.response?.data?.message || error.message));
        } finally {
            setIsGeneratingImage(false);
        }
    };

    return (
        <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${step === 0 ? 'bg-paper' : step >= 1 && step <= 5 ? 'bg-paper' : 'bg-paper'}`}>
            <Head title={`AI Studio - ${book.title}`} />

            {/* Header */}
            <header className={`h-16 flex items-center justify-between px-6 shadow-sm z-50 transition-colors duration-500 ${step >= 0 && step <= 5 ? 'bg-paper/90 backdrop-blur-md border-b border-linen' : 'bg-white border-b'}`}>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            if (activeSection) {
                                setActiveSection(null);
                            } else if (step > 1) {
                                setStep(step - 1);
                            } else {
                                router.visit(route('books.design', book.id));
                            }
                        }}
                        className="text-umber hover:text-ink transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    </button>
                    <h1 className="font-bold text-lg flex items-center gap-2 text-ink">
                        <span className="text-2xl">✨</span>
                        {book.title}
                        <span className="text-xs px-2 py-0.5 rounded-full uppercase tracking-wider font-bold bg-indigo-500/20 text-indigo-700 border border-indigo-500/30">AI Studio</span>
                    </h1>
                </div>

                {/* Progress Stepper */}
                <div className={`flex items-center gap-2 text-sm ${step === 0 ? 'opacity-0 pointer-events-none hidden md:flex' : ''}`}>
                    {[1, 2, 3, 4, 5].map(s => (
                        <button
                            key={s}
                            onClick={() => {
                                // Allow going back OR going to the very next step
                                if (s <= step + 1) setStep(s);
                            }}
                            disabled={s > step + 1}
                            className={`flex items-center gap-2 ${step >= s ? 'text-indigo-700 font-bold' : 'text-umber'}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${step >= s ? 'border-indigo-500 bg-indigo-500/20 text-indigo-700' : 'border-linen text-umber'} ${s === step + 1 ? 'cursor-pointer hover:border-indigo-400' : ''}`}>
                                {s}
                            </div>
                            <span className="hidden md:inline">
                                {s === 1 && 'Setup'}
                                {s === 2 && 'Outline'}
                                {s === 3 && 'Structure'}
                                {s === 4 && 'Write'}
                                {s === 5 && 'Export'}
                            </span>
                            {s < 5 && <div className="w-8 h-0.5 bg-linen mx-2" />}
                        </button>
                    ))}
                </div>

                <div className="min-w-[160px] flex justify-end">
                    {step === 4 && (
                        <button
                            onClick={() => setStep(5)}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white text-sm font-bold rounded-lg shadow-lg shadow-emerald-500/30 whitespace-nowrap transition-all"
                        >
                            Finish & Export →
                        </button>
                    )}
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex overflow-hidden">

                {/* Step 0: Pricing / Plan Selection (Premium Dark Theme) */}
                {step === 0 && (
                    <div className="w-full max-w-6xl mx-auto py-16 px-4 relative overflow-hidden">

                        {/* Dynamic Starry Background Effects */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-[10%] left-[15%] w-1 h-1 bg-white rounded-full animate-pulse opacity-60"></div>
                            <div className="absolute top-[30%] right-[20%] w-0.5 h-0.5 bg-white rounded-full animate-ping opacity-40 duration-1000"></div>
                            <div className="absolute bottom-[20%] left-[10%] w-0.5 h-0.5 bg-white rounded-full opacity-30"></div>
                            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-3000"></div>
                            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none"></div>
                        </div>

                        <div className="text-center mb-16 relative z-10 space-y-6">
                            {/* Premium Badge */}
                            <div className="inline-flex items-center gap-3 py-2 px-4 rounded-full bg-paper border border-linen backdrop-blur-sm shadow-xl animate-fade-in-up">
                                <span className="text-[10px] md:text-xs font-bold text-umber tracking-wider">
                                    IN INDIA'S FIRST
                                </span>
                                <div className="w-px h-3 bg-vellum"></div>
                                <span className="text-[10px] md:text-xs font-medium text-ink-soft tracking-wide flex items-center gap-2">
                                    AI-Powered Book Writing & Publishing Platform
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                </span>
                            </div>

                            {/* Main Headline */}
                            <div className="space-y-2">
                                <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-ink tracking-tight leading-tight">
                                    Turn Ideas into Books
                                </h2>
                                <div className="relative inline-block">
                                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                                        <span className="text-umber mr-2">—</span>
                                        <span className="drop-shadow-[0_0_15px_rgba(192,38,211,0.3)] text-oxblood">
                                            Automatically
                                        </span>
                                    </h2>
                                    {/* Glowing Underline */}
                                    <div className="absolute -bottom-2 md:-bottom-4 left-10 md:left-14 right-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-full opacity-80 blur-[2px] shadow-[0_0_10px_rgba(217,70,239,0.5)]"></div>
                                    <div className="absolute -bottom-2 md:-bottom-4 left-10 md:left-14 right-0 h-0.5 bg-white/50 rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12 max-w-4xl mx-auto relative z-10">
                            {/* Pro Plan - Clickable */}
                            <Link
                                href={route('ai-studio.pro-pricing', book.id)}
                                className="group relative bg-paper rounded-2xl p-0.5 border border-linen hover:border-cyan-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-900/20 cursor-pointer block"
                            >
                                <div className="absolute inset-x-0 h-px w-1/2 mx-auto -top-px shadow-2xl bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="h-full bg-paper rounded-[14px] p-5 md:p-6 flex flex-col relative overflow-hidden">
                                    <div className="mb-5">
                                        <h3 className="text-xl font-bold text-ink mb-2">Pro</h3>
                                        <p className="text-sm text-umber">Perfect for getting started with AI Studio</p>
                                    </div>

                                    <div className="flex-1 space-y-4 mb-6">
                                        <div className="flex items-start gap-3 group/item">
                                            <div className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-700 flex items-center justify-center flex-shrink-0 mt-0.5 border border-cyan-500/30 group-hover/item:bg-cyan-500/30 transition-colors">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-ink block text-sm">AI Studio</span>
                                                <p className="text-xs text-ink-soft mt-0.5 leading-relaxed">Generate chapters, outlines, and content effortlessly.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 group/item">
                                            <div className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-700 flex items-center justify-center flex-shrink-0 mt-0.5 border border-cyan-500/30 group-hover/item:bg-cyan-500/30 transition-colors">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-ink block text-sm">Auto Formatting</span>
                                                <p className="text-xs text-ink-soft mt-0.5 leading-relaxed">Professional book layout and structure.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 group/item">
                                            <div className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-700 flex items-center justify-center flex-shrink-0 mt-0.5 border border-cyan-500/30 group-hover/item:bg-cyan-500/30 transition-colors">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-ink block text-sm">Amazon-Ready Export</span>
                                                <p className="text-xs text-ink-soft mt-0.5 leading-relaxed">Export in KDP-ready formats.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto">
                                        <div className="w-full py-2.5 bg-paper text-ink-soft font-semibold rounded-lg text-center border border-linen text-xs uppercase tracking-wider group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 group-hover:text-cyan-700 transition-all">
                                            View Pro Plans →
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            {/* Premium Plan (Featured) */}
                            <Link
                                href={route('ai-studio.premium-pricing', book.id)}
                                className="relative group transform md:-translate-y-4 block cursor-pointer transition-all hover:scale-105"
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-[18px] blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
                                <div className="relative bg-paper rounded-2xl h-full flex flex-col overflow-hidden">
                                    <div className="absolute top-0 right-0">
                                        <div className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-widest shadow-lg">
                                            Premium
                                        </div>
                                    </div>

                                    <div className="p-5 md:p-6 flex flex-col h-full bg-paper rounded-2xl">
                                        <div className="mb-5">
                                            <h3 className="text-xl font-bold text-umber mb-2">Premium</h3>
                                            <p className="text-sm text-umber">Complete suite for professional authors</p>
                                        </div>

                                        <div className="flex-1 space-y-4 mb-6">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-700 flex items-center justify-center flex-shrink-0 mt-0.5 border border-indigo-500/30">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-ink block text-sm">Advanced AI Writing Engine</span>
                                                    <p className="text-xs text-ink-soft mt-0.5 leading-relaxed">Superior models for bestseller-quality prose.</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-700 flex items-center justify-center flex-shrink-0 mt-0.5 border border-cyan-500/30">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-ink block text-sm">AI Art Studio</span>
                                                    <p className="text-xs text-ink-soft mt-0.5 leading-relaxed">Stunning visuals for covers and headers.</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-700 flex items-center justify-center flex-shrink-0 mt-0.5 border border-indigo-500/30">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-ink block text-sm">Priority Support</span>
                                                    <p className="text-xs text-ink-soft mt-0.5 leading-relaxed">Get help when you need it most.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            <div className="w-full py-2.5 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-indigo-700 font-semibold rounded-lg text-center border border-indigo-500/30 text-xs uppercase tracking-wider group-hover:from-indigo-500/30 group-hover:to-cyan-500/30 transition-all">
                                                View Premium Plans →
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Step 1: Initialization (Premium Dark Theme) */}
                {
                    step === 1 && (
                        <div className="w-full max-w-2xl mx-auto py-10 px-4 relative">
                            {/* Background Orb */}
                            <div className="absolute top-10 right-0 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none"></div>

                            <div className="relative z-10">
                                {/* Header */}
                                <div className="text-center mb-6">
                                    <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-700 text-[10px] font-bold uppercase tracking-wider mb-3">
                                        Step 1 of 5
                                    </span>
                                    <h2 className="text-2xl font-bold text-ink mb-2">Book Specifications</h2>
                                    <p className="text-sm text-ink-soft">Define your book's core details and structure</p>
                                </div>

                                {/* Main Form Card */}
                                <div className="bg-paper rounded-2xl border border-linen p-5 md:p-6 shadow-xl">
                                    <div className="space-y-5">
                                        {/* Row 1: Title & Author */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-semibold text-ink-soft uppercase tracking-wider">Book Title</label>
                                                <input
                                                    type="text"
                                                    value={initData.title}
                                                    onChange={e => setInitData({ ...initData, title: e.target.value })}
                                                    className="w-full bg-paper border border-linen rounded-lg px-3 py-2.5 text-sm text-ink placeholder-taupe focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition"
                                                    placeholder="Enter book title"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-semibold text-ink-soft uppercase tracking-wider">Author Name</label>
                                                <input
                                                    type="text"
                                                    value={initData.author_name}
                                                    onChange={e => setInitData({ ...initData, author_name: e.target.value })}
                                                    className="w-full bg-paper border border-linen rounded-lg px-3 py-2.5 text-sm text-ink placeholder-taupe focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition"
                                                    placeholder="Enter author name"
                                                />
                                            </div>
                                        </div>

                                        {/* Row 2: Type */}
                                        {/* Row 2: Type & Sub-Genre */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-semibold text-ink-soft uppercase tracking-wider">Book Category</label>
                                                <select
                                                    value={(initData.genre || 'Non-Fiction').split(':')[0].trim().includes('Non-Fiction') ? 'Non-Fiction' : 'Fiction'}
                                                    onChange={e => {
                                                        const newPrimary = e.target.value;
                                                        const defaultSub = newPrimary === 'Non-Fiction' ? NON_FICTION_TYPES[0] : FICTION_TYPES[0];
                                                        setInitData({ ...initData, genre: `${newPrimary}: ${defaultSub}` });
                                                    }}
                                                    className="w-full bg-paper border border-linen rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition appearance-none cursor-pointer"
                                                >
                                                    <option value="Non-Fiction">Non-Fiction (Fact-based)</option>
                                                    <option value="Fiction">Fiction (Creative)</option>
                                                </select>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-semibold text-ink-soft uppercase tracking-wider">Genre / Style</label>
                                                <select
                                                    value={(initData.genre || '').split(':')[1]?.trim() || ''}
                                                    onChange={e => {
                                                        const primary = (initData.genre || 'Non-Fiction').split(':')[0].trim();
                                                        setInitData({ ...initData, genre: `${primary}: ${e.target.value}` });
                                                    }}
                                                    className="w-full bg-paper border border-linen rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition appearance-none cursor-pointer"
                                                >
                                                    {((initData.genre || 'Non-Fiction').split(':')[0].trim().includes('Non-Fiction') ? NON_FICTION_TYPES : FICTION_TYPES).map(type => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Detailed Concept */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-ink-soft uppercase tracking-wider">
                                                Book Concept / Premise <span className="text-cyan-700">*</span>
                                            </label>
                                            <textarea
                                                value={initData.topic}
                                                onChange={e => setInitData({ ...initData, topic: e.target.value })}
                                                className="w-full bg-paper border border-linen rounded-lg px-3 py-2.5 text-sm text-ink placeholder-taupe focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition h-20 resize-none"
                                                placeholder={initData.genre === 'Fiction' ? "Describe the plot, characters, and setting..." : "Describe the topic, key lessons, and goals of the book..."}
                                            />
                                        </div>

                                        {/* Metrics Section */}
                                        <div className="bg-paper rounded-xl border border-linen p-4">
                                            <h4 className="text-[10px] font-bold text-ink-soft uppercase tracking-widest mb-4 flex items-center gap-1.5">
                                                <svg className="w-3 h-3 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                Structure Settings
                                            </h4>
                                            {/* Logic: Mirror Guest AI Studio Limits */}
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="block text-[10px] font-bold text-umber">Chapters (Max 10)</label>
                                                    <input
                                                        type="number"
                                                        value={initData.chapter_count}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            // Allow empty string or valid number
                                                            setInitData({ ...initData, chapter_count: val === '' ? '' : parseInt(val) });
                                                        }}
                                                        onBlur={e => {
                                                            // Clamp on blur
                                                            let val = parseInt(e.target.value);
                                                            if (isNaN(val) || val < 1) val = 1;
                                                            if (val > 10) val = 10;
                                                            setInitData({ ...initData, chapter_count: val });
                                                        }}
                                                        className="w-full bg-paper border border-linen rounded-lg px-2 py-2 text-ink text-center text-base font-bold focus:outline-none focus:border-indigo-400 transition"
                                                        min="1" max="10"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="block text-[10px] font-bold text-umber">Sub-chapters (Max 15)</label>
                                                    <input
                                                        type="number"
                                                        value={initData.sub_chapter_count}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            setInitData({ ...initData, sub_chapter_count: val === '' ? '' : parseInt(val) });
                                                        }}
                                                        onBlur={e => {
                                                            let val = parseInt(e.target.value);
                                                            if (isNaN(val) || val < 1) val = 1;
                                                            if (val > 15) val = 15;
                                                            setInitData({ ...initData, sub_chapter_count: val });
                                                        }}
                                                        className="w-full bg-paper border border-linen rounded-lg px-2 py-2 text-ink text-center text-base font-bold focus:outline-none focus:border-indigo-400 transition"
                                                        min="1" max="15"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="block text-[10px] font-bold text-umber">Total Pages (Approx)</label>
                                                    <div className={`w-full bg-paper border border-linen rounded-lg px-2 py-2 text-center flex flex-col justify-center h-[50px] ${(() => {
                                                        const rangeParts = (initData.page_range || '80-100').split('-');
                                                        const maxPages = parseInt(rangeParts[1] || rangeParts[0] || 100);
                                                        const totalSub = (initData.chapter_count || 0) * (initData.sub_chapter_count || 0);
                                                        const pagesPerSub = Math.floor(maxPages / (totalSub || 1));
                                                        if (pagesPerSub < 1) return 'border-red-500/50 text-red-500';
                                                        return 'text-emerald-700';
                                                    })()}`}>
                                                        {(() => {
                                                            const rangeParts = (initData.page_range || '80-100').split('-');
                                                            const maxPages = parseInt(rangeParts[1] || rangeParts[0] || 100);
                                                            const totalSub = (initData.chapter_count || 0) * (initData.sub_chapter_count || 0);

                                                            if (totalSub === 0) return <span className="text-sm font-bold text-umber">0 Pages</span>;

                                                            const pagesPerSub = Math.floor(maxPages / totalSub);
                                                            const totalUsed = pagesPerSub * totalSub; // Approximate usage matches allocation

                                                            return (
                                                                <div className="leading-tight">
                                                                    <span className="text-sm font-bold">
                                                                        {maxPages} Pages Used / {maxPages} Max
                                                                    </span>
                                                                    <span className="block text-[10px] text-umber font-normal mt-0.5">
                                                                        {pagesPerSub} Pages per Section
                                                                    </span>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* CTA Button */}
                                        <button
                                            onClick={() => {
                                                // Validation Logic
                                                const rangeParts = (initData.page_range || '80-100').split('-');
                                                const maxPages = parseInt(rangeParts[1] || rangeParts[0] || 100);

                                                const totalSub = (initData.chapter_count || 0) * (initData.sub_chapter_count || 0);
                                                const pagesPerSub = Math.floor(maxPages / totalSub);

                                                if ((initData.chapter_count || 0) > 10) return alert("Max 10 Chapters allowed.");
                                                if ((initData.sub_chapter_count || 0) > 15) return alert("Max 15 Sub-chapters allowed.");

                                                if (pagesPerSub < 1) {
                                                    alert(`Structure Too Large!\n\nYour plan allows ${maxPages} pages.\nWith ${totalSub} total sections, you would get < 1 page per section.\n\nPlease reduce the number of chapters or sub-chapters.`);
                                                    return;
                                                }

                                                setupOutline();
                                            }}
                                            disabled={isLoading}
                                            className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold text-sm rounded-lg shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transform transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Proceed to Outline Phase
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }


                {/* Step 2: Outline (Premium Dark Theme) */}
                {
                    step === 2 && (
                        <div className="w-full max-w-3xl mx-auto py-10 px-4 overflow-y-auto relative">
                            {/* Background Orb */}
                            <div className="absolute top-10 left-0 w-[250px] h-[250px] bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none"></div>

                            <div className="relative z-10">
                                {/* Header */}
                                <div className="text-center mb-6">
                                    <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-700 text-[10px] font-bold uppercase tracking-wider mb-3">
                                        Step 2 of 5
                                    </span>
                                    <h2 className="text-2xl font-bold text-ink mb-2">Chapter Outline</h2>
                                    <p className="text-sm text-ink-soft">
                                        {chapters.length > 0
                                            ? `${chapters.length} Chapters Generated`
                                            : 'Generate your book structure'}
                                    </p>
                                </div>

                                {/* Choice: AI or Manual (Only if no chapters exist) */}
                                {chapters.length === 0 ? (
                                    <div className="bg-paper rounded-2xl border border-linen p-6 md:p-8 shadow-xl text-center">
                                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/30 to-cyan-500/20 text-white rounded-xl flex items-center justify-center mx-auto mb-5 text-2xl border border-indigo-500/30">
                                            📚
                                        </div>
                                        <h3 className="text-lg font-bold text-ink mb-2">No Chapters Yet</h3>
                                        <p className="text-sm text-ink-soft mb-6 max-w-sm mx-auto">Generate an outline with AI or manually create your own structure.</p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto text-left">
                                            {/* Option A: AI */}
                                            <div
                                                className="group bg-gradient-to-br from-indigo-500/15 to-transparent rounded-xl p-4 border border-indigo-500/30 hover:border-indigo-400/50 transition-all cursor-pointer flex flex-col h-full"
                                                onClick={() => generateOutline('ai')}
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-700 flex items-center justify-center mb-3 border border-indigo-500/30 group-hover:scale-110 transition-transform">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                </div>
                                                <h4 className="font-semibold text-ink text-sm mb-1">AI Studio Mode</h4>
                                                <p className="text-xs text-ink-soft mb-4 flex-grow">Let AI Studio create chapters based on your topic.</p>
                                                <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white rounded-lg font-bold text-xs shadow-lg transition-all">
                                                    {isLoading ? 'Generating...' : 'Generate with AI Studio'}
                                                </button>
                                            </div>

                                            {/* Option B: Manual */}
                                            <div className="bg-paper rounded-xl p-4 border border-linen hover:border-linen transition-all flex flex-col h-full">
                                                <div className="w-8 h-8 rounded-lg bg-paper text-ink-soft flex items-center justify-center mb-3 border border-linen">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </div>
                                                <h4 className="font-semibold text-ink text-sm mb-1">Manual Entry</h4>
                                                <p className="text-[10px] text-ink-soft mb-2">Type your {initData.chapter_count} chapters line by line.</p>
                                                <textarea
                                                    id="manual-chapters-input"
                                                    className="w-full bg-paper border border-linen rounded-lg px-3 py-2 text-ink placeholder-taupe text-xs mb-3 flex-grow focus:outline-none focus:border-indigo-400 transition resize-none"
                                                    placeholder={`Chapter 1: Introduction\nChapter 2: Getting Started\n...`}
                                                    style={{ minHeight: '80px' }}
                                                ></textarea>
                                                <button
                                                    onClick={() => generateOutline('manual')}
                                                    className="w-full py-2.5 bg-vellum hover:bg-vellum text-ink rounded-lg font-bold text-xs border border-linen transition-all"
                                                >
                                                    Save Manual List
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-paper rounded-2xl border border-linen p-5 shadow-xl">
                                        {/* Chapter List Display */}
                                        <div className="space-y-2 mb-5 max-h-[45vh] overflow-y-auto pr-2">
                                            {chapters.map((chapter, i) => (
                                                <div key={chapter.id} className="bg-paper p-3 rounded-lg border border-linen flex items-center gap-3 group hover:border-taupe transition-all">
                                                    <span className="w-7 h-7 flex items-center justify-center bg-gradient-to-br from-indigo-500/30 to-transparent rounded-lg font-bold text-indigo-700 border border-indigo-500/30 text-xs">
                                                        {i + 1}
                                                    </span>
                                                    <span className="flex-1 font-medium text-sm text-ink">{chapter.title}</span>
                                                    <span className="text-emerald-700 text-xs opacity-0 group-hover:opacity-100 transition-opacity">✓</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-between items-center pt-4 border-t border-linen">
                                            <button
                                                onClick={() => setStep(1)}
                                                className="px-4 py-2 text-sm text-ink-soft hover:text-ink transition-colors flex items-center gap-2"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                                Back
                                            </button>
                                            <button
                                                onClick={startSubChapters}
                                                className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold text-sm rounded-lg shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all hover:scale-[1.02]"
                                            >
                                                Approve Outline & Next
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }

                {/* Step 3: Sub-Chapters (Structure) - Premium Dark Theme */}
                {
                    step === 3 && (
                        <div className="flex w-full h-full">
                            {/* Sidebar Chapters */}
                            <div className="w-64 bg-paper border-r border-linen overflow-y-auto flex flex-col">
                                <div className="p-3 border-b border-linen">
                                    <span className="inline-block py-0.5 px-2 rounded-md bg-indigo-500/20 border border-indigo-400/30 text-indigo-700 text-[9px] font-bold uppercase tracking-wider mb-1">
                                        Step 3 of 5
                                    </span>
                                    <h3 className="font-bold text-ink text-sm">Chapter Structure</h3>
                                    <p className="text-[10px] text-ink-soft">Select a chapter to generate sub-sections</p>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {chapters.map((chapter, i) => (
                                        <div
                                            key={chapter.id}
                                            onClick={() => setActiveChapterId(chapter.id)}
                                            className={`p-3 border-b border-linen cursor-pointer hover:bg-paper transition ${activeChapterId === chapter.id ? 'bg-indigo-500/15 border-l-4 border-l-indigo-400' : ''}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="font-medium text-xs text-ink">
                                                    <span className="text-umber mr-1">{i + 1}.</span>
                                                    {chapter.title}
                                                </div>
                                                {chapter.sections && chapter.sections.length > 0 ? (
                                                    <span className="text-emerald-700 text-[10px] flex items-center gap-0.5">
                                                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                        Ready
                                                    </span>
                                                ) : (
                                                    <span className="text-amber-800 text-[10px]">Pending</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Main Area */}
                            <div className="flex-1 bg-paper p-6 overflow-y-auto relative">
                                {/* Background Orb */}
                                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                                {activeChapterId && (
                                    <div className="max-w-xl mx-auto relative z-10">
                                        <h2 className="text-lg font-bold mb-1 text-ink">
                                            Structure for: <span className=" text-oxblood">{chapters.find(c => c.id === activeChapterId)?.title}</span>
                                        </h2>
                                        <p className="text-ink-soft text-xs mb-5">Define the sub-sections that will make up this chapter.</p>

                                        {chapters.find(c => c.id === activeChapterId)?.sections && chapters.find(c => c.id === activeChapterId)?.sections.length > 0 ? (
                                            <div className="space-y-2">
                                                {chapters.find(c => c.id === activeChapterId).sections.map((section, idx) => (
                                                    <div key={section.id} className="bg-paper p-3 rounded-lg border border-linen flex items-center gap-3 group hover:border-taupe transition-all">
                                                        <span className="w-6 h-6 flex items-center justify-center bg-indigo-500/20 rounded-md text-indigo-700 text-xs font-bold border border-indigo-500/30">{idx + 1}</span>
                                                        <span className="text-ink text-sm font-medium">{section.title}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-paper rounded-xl border border-linen p-6 text-center">
                                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/30 to-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl border border-indigo-500/30">
                                                    📑
                                                </div>
                                                <h3 className="font-bold text-ink text-base mb-1">No sections yet</h3>
                                                <p className="text-ink-soft mb-5 text-xs max-w-xs mx-auto">Generate sub-headings for this chapter to organize the content.</p>
                                                <div className="flex flex-col gap-3 max-w-sm mx-auto">
                                                    <button
                                                        onClick={() => generateSectionsForChapter(activeChapterId)}
                                                        disabled={isLoading}
                                                        className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold text-sm rounded-lg shadow-lg transition-all disabled:opacity-50"
                                                    >
                                                        {isLoading ? 'Generating...' : '✨ Generate with AI Studio'}
                                                    </button>

                                                    <div className="relative flex py-2 items-center">
                                                        <div className="flex-grow border-t border-linen"></div>
                                                        <span className="flex-shrink-0 mx-3 text-umber text-[10px] uppercase tracking-wider">Or manually (max {initData.sub_chapter_count})</span>
                                                        <div className="flex-grow border-t border-linen"></div>
                                                    </div>

                                                    <textarea
                                                        id={`manual-input-${activeChapterId}`}
                                                        className="w-full bg-paper border border-linen rounded-lg px-3 py-2 text-ink placeholder-taupe text-xs focus:outline-none focus:border-indigo-400 transition h-24 resize-none"
                                                        placeholder={`1. First sub-heading\n2. Second sub-heading\n...`}
                                                    ></textarea>

                                                    <button
                                                        onClick={() => saveManualStructure(activeChapterId)}
                                                        className="w-full py-2 bg-vellum hover:bg-vellum text-ink rounded-lg font-bold text-xs border border-linen transition-all"
                                                    >
                                                        Save Manual Structure
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Next Button Floating */}
                                <div className="fixed bottom-6 right-6 z-50">
                                    <button
                                        onClick={() => {
                                            if (!isStructureComplete()) {
                                                if (!confirm("⚠️ Structure Incomplete\n\nSome chapters do not have sub-chapters yet. You won't be able to write content for them until you generate their structure.\n\nContinue anyway?")) {
                                                    return;
                                                }
                                            }
                                            setStep(4);
                                        }}
                                        className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-sm rounded-full shadow-[0_0_30px_-10px_rgba(99,102,241,0.5)] hover:shadow-[0_0_50px_-15px_rgba(99,102,241,0.7)] transition-all flex items-center gap-2 hover:scale-105"
                                    >
                                        Start Writing Phase
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Step 4: WRITING - Premium Dark Theme */}
                {
                    step === 4 && (
                        <div className="flex w-full h-full">
                            {/* Sidebar Navigation */}
                            <div className="w-60 bg-paper border-r border-linen flex flex-col">
                                <div className="p-3 border-b border-linen">
                                    <span className="inline-block py-0.5 px-2 rounded-md bg-indigo-500/20 border border-indigo-400/30 text-indigo-700 text-[9px] font-bold uppercase tracking-wider mb-1">
                                        Step 4 of 5
                                    </span>
                                    <h3 className="font-bold text-ink text-sm">Write Content</h3>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    {chapters.map((chapter) => (
                                        <div key={chapter.id}>
                                            <div className="px-3 py-2 bg-paper text-[10px] font-bold text-ink-soft uppercase tracking-wider sticky top-0 border-b border-linen">
                                                {chapter.title}
                                            </div>
                                            {chapter.sections?.map(section => (
                                                <button
                                                    key={section.id}
                                                    onClick={() => {
                                                        setActiveSection(section);
                                                        setActiveChapterId(chapter.id);
                                                    }}
                                                    className={`w-full text-left px-4 py-2 text-xs border-b border-linen hover:bg-paper transition ${activeSection?.id === section.id ? 'bg-indigo-500/15 text-ink border-l-4 border-l-indigo-400' : 'text-ink-soft'}`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span className="truncate pr-2">{section.title}</span>
                                                        {section.status === 'generated' || section.content ? (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                        ) : (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-ink-soft border border-linen-deep"></span>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                            {(!chapter.sections || chapter.sections.length === 0) && (
                                                <button
                                                    onClick={() => {
                                                        setActiveChapterId(chapter.id);
                                                        setStep(3);
                                                    }}
                                                    className="w-full text-left px-4 py-3 text-[10px] text-amber-800 bg-amber-500/5 hover:bg-amber-500/10 border-b border-linen transition flex items-center gap-2"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                    <span>Missing Structure. Click to Setup.</span>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Editor Area */}
                            <div className="flex-1 bg-paper flex flex-col">
                                {activeSection ? (
                                    <div className="flex-1 flex flex-col h-full">
                                        <div className="h-12 border-b border-linen flex items-center justify-between px-5 bg-paper">
                                            <h2 className="font-bold text-ink text-sm">{activeSection.title}</h2>
                                            <div className="flex gap-3 items-center">
                                                {/* Write Button */}
                                                {!activeSection.content ? (
                                                    <button
                                                        onClick={() => writeContent(activeSection)}
                                                        disabled={isLoading}
                                                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold text-xs rounded-lg shadow-lg transition-all disabled:opacity-50"
                                                    >
                                                        {isLoading ? 'Writing...' : '✨ Write This Section'}
                                                    </button>
                                                ) : (
                                                    <div className="px-3 py-1.5 bg-emerald-500/20 text-emerald-700 font-bold rounded-lg border border-emerald-500/30 text-xs flex items-center gap-1.5">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                        <span>Generated</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Secondary AI Toolbar - Only show image generation for Premium plans */}
                                        {book.ai_plan_type === 'premium' ? (
                                            <div className="h-10 border-b border-linen flex items-center px-5 bg-paper">
                                                <button
                                                    onClick={handleGenerateImageClick}
                                                    disabled={isGeneratingImage}
                                                    className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${isGeneratingImage ? 'text-umber cursor-not-allowed' : 'text-indigo-700 hover:text-indigo-700'}`}
                                                >
                                                    {isGeneratingImage ? (
                                                        <>
                                                            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Generating Image...
                                                        </>
                                                    ) : (
                                                        <>🎨 Generate Illustration</>
                                                    )}
                                                </button>

                                                {/* Credit Display */}
                                                {imageCredits.limit > 0 && (
                                                    <>
                                                        <div className="mx-3 h-4 w-px bg-vellum"></div>
                                                        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-umber">
                                                            <span>Credits:</span>
                                                            <span className={imageCredits.used >= imageCredits.limit ? 'text-red-700' : 'text-emerald-700'}>
                                                                {imageCredits.used} / {imageCredits.limit}
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="h-10 border-b border-linen flex items-center px-5 bg-paper">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-umber flex items-center gap-1.5">
                                                    🔒 Image Generation (Premium Only)
                                                </span>
                                            </div>
                                        )}

                                        {/* Content Area */}
                                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar relative">
                                            {/* Background effect */}
                                            <div className="absolute top-0 left-1/2 w-[400px] h-[250px] bg-indigo-600/5 rounded-full blur-[80px] pointer-events-none -translate-x-1/2"></div>

                                            <div className="max-w-2xl mx-auto bg-paper min-h-[600px] shadow-xl border border-linen rounded-xl p-8 relative z-10">
                                                {activeSection.image_url && (
                                                    <div className="mb-6 p-2 border border-linen rounded-lg bg-paper text-center">
                                                        <img src={activeSection.image_url} alt="Section Illustration" className="max-w-full h-auto mx-auto rounded-lg shadow-lg" />
                                                    </div>
                                                )}
                                                {activeSection.content ? (
                                                    <div
                                                        className="prose prose-invert max-w-none font-serif text-base leading-relaxed text-ink-soft"
                                                        dangerouslySetInnerHTML={{ __html: activeSection.content }}
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-center py-16">
                                                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/30 to-cyan-500/20 rounded-xl flex items-center justify-center text-2xl mb-4 border border-indigo-500/30">
                                                            ✍️
                                                        </div>
                                                        <p className="text-ink-soft text-sm font-medium max-w-xs">Click "Write This Section" to generate content.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-paper rounded-xl flex items-center justify-center mx-auto mb-4 border border-linen">
                                                <svg className="w-7 h-7 text-umber" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </div>
                                            <p className="text-base font-medium text-umber">← Select a section to start writing</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }
                {/* Step 5: EXPORT & COMPILE - Premium Dark Theme */}
                {
                    step === 5 && (
                        <div className="w-full max-w-2xl mx-auto py-10 px-4 relative">
                            {/* Background Orbs */}
                            <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none"></div>
                            <div className="absolute bottom-0 right-1/4 w-[250px] h-[250px] bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none"></div>

                            <div className="relative z-10">
                                {/* Header */}
                                <div className="text-center mb-6">
                                    <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-3">
                                        Step 5 of 5 — Complete!
                                    </span>
                                </div>

                                <div className="bg-paper rounded-2xl border border-linen p-6 md:p-8 shadow-xl text-center">
                                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/30 to-emerald-400/20 rounded-xl flex items-center justify-center mx-auto mb-5 border border-emerald-500/40">
                                        <svg className="w-8 h-8 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-ink mb-2">Book Compilation Complete!</h2>
                                    <p className="text-sm text-ink-soft mb-6 max-w-sm mx-auto">
                                        All {chapters.length} chapters and their sections have been organized. Your book manuscript is ready.
                                    </p>

                                    <div className="space-y-3 max-w-sm mx-auto">
                                        {/* DOCX Download */}
                                        <div className="p-3 bg-paper rounded-xl border border-linen flex items-center justify-between hover:border-taupe transition-all group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-700 border border-blue-500/30">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-semibold text-sm text-ink">Microsoft Word (.docx)</div>
                                                    <div className="text-[10px] text-umber">Standard manuscript format</div>
                                                </div>
                                            </div>
                                            <a href={route('ai-studio.download', { book: book.id, format: 'docx' })} className="px-3 py-1.5 bg-vellum hover:bg-vellum border border-linen rounded-lg text-xs font-bold text-ink transition-all">
                                                Download
                                            </a>
                                        </div>

                                        {/* PDF Download */}
                                        <div className="p-3 bg-paper rounded-xl border border-linen flex items-center justify-between hover:border-taupe transition-all group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-red-500/20 rounded-lg flex items-center justify-center text-red-700 border border-red-500/30">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-semibold text-sm text-ink">PDF Document (.pdf)</div>
                                                    <div className="text-[10px] text-umber">Universal format, print-ready</div>
                                                </div>
                                            </div>
                                            <a href={route('ai-studio.download', { book: book.id, format: 'pdf' })} className="px-3 py-1.5 bg-vellum hover:bg-vellum border border-linen rounded-lg text-xs font-bold text-ink transition-all">
                                                Download
                                            </a>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-linen">
                                        <h3 className="text-sm font-bold text-ink mb-1">What's Next?</h3>
                                        <p className="text-ink-soft text-xs mb-4">Fine-tune fonts, layout, and add images in the formatting editor.</p>
                                        <Link
                                            href={route('books.design', book.id)}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold text-sm rounded-lg shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02]"
                                        >
                                            Continue
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                        </Link>

                                        <button
                                            onClick={async () => {
                                                if (confirm('Are you sure you want to submit this book for Admin review? It will be sent to the review queue.')) {
                                                    try {
                                                        const res = await axios.post(route('ai-studio.submit', book.id));
                                                        if (res.data.success) {
                                                            alert(res.data.message);
                                                            window.location.href = route('dashboard');
                                                        }
                                                    } catch (e) {
                                                        alert(e.response?.data?.message || 'Submission failed.');
                                                    }
                                                }
                                            }}
                                            className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-sm rounded-lg shadow-lg transition-all"
                                        >
                                            Submit for Publishing Review
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </button>

                                        <div className="mt-4 pt-4 border-t border-linen">
                                            <button
                                                onClick={() => setStep(4)}
                                                className="text-xs text-indigo-700 hover:text-indigo-700 underline transition-colors mr-6"
                                            >
                                                ← Back to Editor
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure? This will allow you to regenerate the outline and content.')) {
                                                        setStep(1);
                                                    }
                                                }}
                                                className="text-xs text-umber hover:text-ink-soft underline transition-colors"
                                            >
                                                Start Over / Regenerate Book
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            </main >

            {/* Image Generation Modal */}
            {
                showImagePromptModal && (
                    <div className="fixed inset-0 bg-paper backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                        <div className="bg-paper rounded-2xl border border-linen w-full max-w-md overflow-hidden shadow-2xl">
                            {/* Modal Header */}
                            <div className="p-4 border-b border-linen flex items-center justify-between">
                                <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                                    <span>🎨</span>
                                    Generate Illustration
                                </h3>
                                <button
                                    onClick={() => setShowImagePromptModal(false)}
                                    className="text-umber hover:text-ink transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-4 space-y-4">
                                <p className="text-sm text-ink-soft">
                                    Generate an AI illustration for: <span className="text-ink font-semibold">{activeSection?.title}</span>
                                </p>

                                {/* Mode Selection */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setImagePromptMode('auto')}
                                        className={`p-4 rounded-xl border text-center transition-all ${imagePromptMode === 'auto' ? 'border-indigo-500 bg-indigo-500/20' : 'border-linen hover:border-linen bg-paper'}`}
                                    >
                                        <span className="text-2xl mb-2 block">🤖</span>
                                        <span className={`text-sm font-bold block ${imagePromptMode === 'auto' ? 'text-ink' : 'text-ink-soft'}`}>Auto (AI)</span>
                                        <span className="text-[10px] text-umber mt-1 block">Based on content</span>
                                    </button>
                                    <button
                                        onClick={() => setImagePromptMode('custom')}
                                        className={`p-4 rounded-xl border text-center transition-all ${imagePromptMode === 'custom' ? 'border-cyan-500 bg-cyan-500/20' : 'border-linen hover:border-linen bg-paper'}`}
                                    >
                                        <span className="text-2xl mb-2 block">✏️</span>
                                        <span className={`text-sm font-bold block ${imagePromptMode === 'custom' ? 'text-ink' : 'text-ink-soft'}`}>Custom</span>
                                        <span className="text-[10px] text-umber mt-1 block">Your own prompt</span>
                                    </button>
                                </div>

                                {/* Custom Prompt Input */}
                                {imagePromptMode === 'custom' && (
                                    <div className="space-y-2">
                                        <label className="block text-xs font-semibold text-ink-soft uppercase tracking-wider">
                                            Your Image Prompt
                                        </label>
                                        <textarea
                                            value={customImagePrompt}
                                            onChange={(e) => setCustomImagePrompt(e.target.value)}
                                            placeholder="Describe the illustration you want... (e.g., 'A serene landscape with mountains at sunset, digital art style')"
                                            className="w-full bg-paper border border-linen rounded-lg px-3 py-2.5 text-ink text-sm placeholder-taupe focus:outline-none focus:border-cyan-400 transition resize-none h-24"
                                        />
                                        <p className="text-[10px] text-umber">
                                            Tip: Be descriptive! Include style, mood, and specific details.
                                        </p>
                                    </div>
                                )}

                                {imagePromptMode === 'auto' && (
                                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3">
                                        <p className="text-xs text-indigo-700">
                                            ✨ AI will create a prompt based on the chapter content and generate a relevant illustration automatically.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-linen flex gap-3">
                                <button
                                    onClick={() => setShowImagePromptModal(false)}
                                    className="flex-1 py-2.5 bg-paper text-ink-soft font-semibold rounded-lg text-sm border border-linen hover:bg-vellum transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => generateImage(activeSection, imagePromptMode, customImagePrompt)}
                                    disabled={imagePromptMode === 'custom' && !customImagePrompt.trim()}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold rounded-lg text-sm shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Generate Image
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}


// Full-screen page: renders its own chrome, so the global Layout stays off.
AiBookStudio.layout = null;
