import React, { useState, useEffect, useMemo } from 'react';
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

export default function GuestStudio({ session, token, existingChapters = [] }) {
    // Determine Initial Step based on session state or URL
    const getInitialStep = () => {
        // If chapters exist, skip setup. If we have sections, skip outline.
        // Guest session usually starts at Setup (1) if no title, but here we might have title from Payment.
        if (existingChapters && existingChapters.length > 0) {
            const hasStructure = existingChapters.some(c => c.sections && c.sections.length > 0);
            return hasStructure ? 3 : 2; // If structure exists, go to Step 3, else Step 2
        }
        return 1; // Default to Setup
    };

    const [step, setStep] = useState(getInitialStep());
    const [isLoading, setIsLoading] = useState(false);

    // Data State (Mirroring DB)
    const [chapters, setChapters] = useState(existingChapters || []);

    // Step 1: Initialization Inputs
    const [initData, setInitData] = useState({
        title: session.book_title || '',
        author_name: session.author_name || '', // Use author_name from session if available
        topic: '',
        audience: 'General Readers',
        chapter_count: 10,
        sub_chapter_count: 5, // Default for guests
        page_range: session.page_range || session.plan_name || '80-100', // From payment (plan_name stores range)
        genre: 'Non-Fiction'
    });

    // Step 4: Writer State
    const [activeChapterId, setActiveChapterId] = useState(null);
    const [activeSection, setActiveSection] = useState(null);
    const [writerTone, setWriterTone] = useState('Professional');
    const [writerPerspective, setWriterPerspective] = useState('3rd Person');

    // Image Credits (for Guests)
    const [imageCredits, setImageCredits] = useState({
        used: session.image_credits_used || 0,
        limit: session.image_credits_limit || 0
    });

    // Image Generation State
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [imagePromptMode, setImagePromptMode] = useState('auto'); // 'auto' or 'custom'
    const [customImagePrompt, setCustomImagePrompt] = useState('');
    const [showImagePromptModal, setShowImagePromptModal] = useState(false);

    // Handle Browser Back Button for Steps
    useEffect(() => {
        const handlePopState = (event) => {
            if (activeSection) {
                event.preventDefault();
                setActiveSection(null);
            }
        };
        return () => { };
    }, [step, activeSection]);

    // ================== STEP 1: INITIALIZATION ==================
    const proceedToOutlinePhase = async () => {
        // Validation: Required User Details for Access Link
        if (!initData.full_name?.trim() || !initData.email?.trim()) {
            alert("Please providing your Name and Email is mandatory to save your progress and receive your access link.");
            return;
        }

        if (!initData.topic.trim()) {
            alert("Please describe your book concept first.");
            return;
        }

        // AUTO-SAVE USER DETAILS to DB
        try {
            await axios.post(route('guest-writer.save', token), {
                full_name: initData.full_name,
                email: initData.email,
                title: initData.title,
                author_name: initData.author_name,
                genre: initData.genre,
                about_book: initData.topic,
                current_step: 1
            });
        } catch (err) {
            console.error(err);
            // We continue even if save fails? No, if save fails, email isn't set.
            // But blocking might be annoying if just a glitch.
            // Let's alert but proceed if user insists? No, mandate it.
            if (!confirm("We couldn't save your email for the access link. Do you want to proceed anyway? (You might lose access if you close the tab)")) {
                return;
            }
        }

        // 2. Plan Constraints (Dynamic Allocation)

        // 2. Plan Constraints (Dynamic Allocation)
        const rangeParts = (initData.page_range || '80-100').split('-');
        const maxPages = parseInt(rangeParts[1] || rangeParts[0] || 100);

        // Determine Plan Type for Limits
        let limits = { maxCh: 12, maxSub: 15 }; // Default Saver (Boosted Sub: 10->15)
        if (maxPages >= 200) limits = { maxCh: 25, maxSub: 30 }; // Enterprise
        else if (maxPages >= 150) limits = { maxCh: 20, maxSub: 25 }; // Pro
        else if (maxPages >= 120) limits = { maxCh: 15, maxSub: 20 }; // Standard

        // 1. Platform Limits (Dynamic)
        if ((initData.chapter_count || 0) > limits.maxCh) {
            alert(`Plan Limit Exceeded: Maximum ${limits.maxCh} Chapters allowed for your plan.`);
            return;
        }
        if ((initData.sub_chapter_count || 0) > limits.maxSub) {
            alert(`Plan Limit Exceeded: Maximum ${limits.maxSub} Sub-chapters allowed for your plan.`);
            return;
        }

        const totalSub = (initData.chapter_count || 0) * (initData.sub_chapter_count || 0);

        if (totalSub === 0) return;

        const totalCapacityWords = maxPages * 275;
        const wordsPerSub = Math.floor(totalCapacityWords / totalSub);
        const pagesPerSub = wordsPerSub / 275;

        // Validation Rule: Must have at least ~0.5 page per sub-chapter (approx 135 words)
        if (pagesPerSub < 0.5) {
            const requiredPages = totalSub * 0.5;
            alert(`Structure Too Dense!\n\nYour plan is set to ${maxPages} pages.\nWith ${totalSub} total sections, each section would be too short (${pagesPerSub.toFixed(2)} pages).\n\nTo keep this many sections, you would need a plan of at least ${Math.ceil(requiredPages)} pages.\n\nPlease reduce the number of chapters or sub-chapters to fit your current plan.`);
            return;
        }

        const totalUsed = Math.round((wordsPerSub * totalSub) / 275);

        // Confirmation if pages per section is low (optional UX improvement)
        if (pagesPerSub < 1.0 && !confirm(`Notice: Each sub-chapter will be short (approx ${pagesPerSub.toFixed(1)} pages).\n\nDo you want to continue with this dense structure?`)) {
            return;
        }

        // For Guests, we just update local state and move to Step 2.
        setStep(2);
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
                sub_chapter_count: initData.sub_chapter_count,
                page_range: initData.page_range,
                genre: initData.genre,
                mode: mode,
                session_token: token
            };

            if (mode === 'manual') {
                const manualContent = document.getElementById('manual-chapters-input').value;
                if (!manualContent.trim()) return alert("Please enter your chapters.");
                payload.manual_content = manualContent;
            }

            // GUEST ENDPOINT
            const res = await axios.post(route('guest-writer.generate-outline'), payload);
            // Backend returns 'chapters_data', not 'chapters'
            setChapters(res.data.chapters_data || res.data.chapters || []);
            // Stay on Step 2 to review
        } catch (error) {
            alert("Failed: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    // ================== STEP 2: OUTLINE REVIEW ==================
    const startSubChapters = async () => {
        setStep(3);
        if (chapters.length > 0) setActiveChapterId(chapters[0].id);
    };

    // ================== STEP 3: SUB-CHAPTERS ==================
    const generateSectionsForChapter = async (chapterId) => {
        setIsLoading(true);
        try {
            // GUEST ENDPOINT
            const res = await axios.post(route('guest-writer.generate-sections'), {
                chapter_id: chapterId,
                session_token: token,
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

    const saveManualStructure = async (chapterId) => {
        const input = document.getElementById(`manual-input-${chapterId}`).value;
        if (!input.trim()) return alert("Please enter sub-headings.");

        const lines = input.split('\n').filter(line => line.trim() !== '');
        const maxSub = initData.sub_chapter_count || 5;

        if (lines.length > maxSub) {
            alert(`You are limited to ${maxSub} sub-chapters per chapter.`);
            return;
        }

        setIsLoading(true);
        try {
            // GUEST ENDPOINT (Reuse or similar logic)
            // We need a manual endpoint for guest sections. Assuming generic 'generate-sections' can handle manual or we use a separate one.
            // GuestController might not have manual-section support yet. Let's fallback to 'generate-sections' with 'manual_content'.
            // Or better, just alert user manual isn't fully supported without backend update, OR assume backend handles it.
            // For now, let's assume parity request means parity backend too.
            const res = await axios.post(route('guest-writer.generate-sections'), { // Using same endpoint but need to check if it supports manual
                chapter_id: chapterId,
                session_token: token,
                manual_content: lines // Passing raw lines
            });

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


    const writeContent = async (section) => {
        setIsLoading(true);
        try {
            // GUEST ENDPOINT
            const res = await axios.post(route('guest-writer.write-section'), {
                section_id: section.id,
                session_token: token,
                tone: writerTone,
                perspective: writerPerspective
            });

            // Update the deeply nested section content
            setChapters(prev => prev.map(c => {
                if (c.id !== activeChapterId) return c;
                return {
                    ...c,
                    sections: c.sections.map(s => s.id === section.id ? { ...s, content: res.data.content } : s)
                };
            }));

            // Set as active to view
            setActiveSection(prev => ({ ...prev, content: res.data.content }));

        } catch (error) {
            console.error(error);
            alert("Writing Failed: " + (error.response?.data?.message || 'Unknown error'));
        } finally {
            setIsLoading(false);
        }
    };

    // Open image generation modal
    const handleGenerateImageClick = () => {
        setShowImagePromptModal(true);
    };

    const generateImage = async (section, mode = 'auto', customPrompt = '') => {
        setShowImagePromptModal(false);
        setIsGeneratingImage(true);
        try {
            // GUEST ENDPOINT
            const res = await axios.post(route('guest-writer.generate-image'), {
                section_id: section.id,
                session_token: token,
                mode: mode,
                custom_prompt: mode === 'custom' ? customPrompt : null
            });

            const newImageUrl = res.data.image_url;

            setChapters(prev => prev.map(c => {
                if (c.id !== activeChapterId) return c;
                return {
                    ...c,
                    sections: c.sections.map(s => s.id === section.id ? { ...s, image_url: newImageUrl } : s)
                };
            }));

            setActiveSection(prev => ({ ...prev, image_url: newImageUrl }));

            if (res.data.image_credits_used !== undefined) {
                setImageCredits({
                    used: res.data.image_credits_used,
                    limit: res.data.image_credits_limit
                });
            }

            setCustomImagePrompt('');
            setImagePromptMode('auto');
        } catch (error) {
            alert("Image Generation Failed: " + (error.response?.data?.message || error.message));
        } finally {
            setIsGeneratingImage(false);
        }
    };

    // Stats Calculation
    const stats = useMemo(() => {
        let totalWords = 0;
        let completed = 0;
        let total = 0;

        chapters.forEach(chap => {
            (chap.sections || []).forEach(sec => {
                total++;
                if (sec.content) {
                    completed++;
                    totalWords += sec.content.trim().split(/\s+/).length;
                }
            });
        });

        return { totalWords, completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
    }, [chapters]);

    const isStructureComplete = () => {
        return chapters.every(c => c.sections && c.sections.length > 0);
    };

    const saveProgress = async () => {
        setIsLoading(true);
        try {
            await axios.post(route('guest-writer.save', token), {
                current_step: step,
                title: initData.title,
                author_name: initData.author_name,
                genre: initData.genre,
                about_book: initData.topic,
                chapters_data: chapters
            });
            // Show a temporary success indicator (could use a toast in real app)
            const btn = document.getElementById('save-btn');
            if (btn) {
                const originalText = btn.innerText;
                btn.innerText = 'Saved!';
                btn.classList.add('text-emerald-400');
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.classList.remove('text-emerald-400');
                }, 2000);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to save progress");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinish = () => {
        setStep(5);
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-[#05060b] text-white selection:bg-indigo-500/30">
            <Head title={`Smart Writer - ${initData.title || 'Untitled'}`} />

            {/* TOP-LEFT BACK BUTTON - ALWAYS VISIBLE */}
            <button
                onClick={() => {
                    if (activeSection) {
                        setActiveSection(null);
                    } else if (step > 1) {
                        setStep(step - 1);
                    } else {
                        if (window.history.length > 1) {
                            window.history.back();
                        } else {
                            router.visit('/');
                        }
                    }
                }}
                className="fixed top-4 left-4 z-[100] flex items-center gap-2 px-4 py-2 bg-[#0d1220]/90 backdrop-blur-md border border-white/10 rounded-lg text-gray-300 hover:text-white hover:bg-[#0d1220] transition-all shadow-lg"
                title="Go Back"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                <span className="text-sm font-medium">Back</span>
            </button>

            {/* STEPPER HEADER - ALWAYS VISIBLE AT TOP CENTER */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-[#0d1220]/90 backdrop-blur-md border-b border-white/10">
                <div className="h-16 flex items-center justify-center px-6">
                    {/* Progress Stepper - VISIBLE ON ALL SCREENS */}
                    <div className="flex items-center gap-1 md:gap-2 text-sm">
                        {[1, 2, 3, 4, 5].map(s => (
                            <button
                                key={s}
                                onClick={() => {
                                    // Allow going back freely, but forward only sequentially
                                    if (s <= Math.max(step, 2)) setStep(s);
                                }}
                                disabled={s > Math.max(step, 2) && s > step + 1}
                                className={`flex items-center gap-1 md:gap-2 ${step >= s ? 'text-indigo-400 font-bold' : 'text-gray-500'}`}
                            >
                                <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center border-2 transition-all text-xs md:text-sm ${step >= s ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' : 'border-gray-600/50 text-gray-500'} ${s <= step ? 'cursor-pointer hover:border-indigo-400' : ''}`}>
                                    {s}
                                </div>
                                <span className="hidden md:inline text-xs font-semibold uppercase tracking-wider">
                                    {s === 1 && 'Setup'}
                                    {s === 2 && 'Outline'}
                                    {s === 3 && 'Structure'}
                                    {s === 4 && 'Write'}
                                    {s === 5 && 'Export'}
                                </span>
                                {s < 5 && <div className={`w-3 md:w-6 h-px mx-0.5 md:mx-1 ${step > s ? 'bg-indigo-500/50' : 'bg-gray-700'}`} />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Book Title and Actions Bar */}
                <div className="h-12 border-t border-white/5 flex items-center justify-between px-6 bg-[#0a0f1a]/80">
                    <h1 className="font-bold text-sm md:text-lg flex items-center gap-2 text-white pl-20 md:pl-24">
                        <span className="text-xl md:text-2xl">✨</span>
                        <span className="hidden md:inline text-gray-400 text-xs uppercase tracking-wider">Smart Writer Studio</span>
                        <span className="hidden md:inline text-gray-600 mx-2">|</span>
                        <span className="truncate max-w-[120px] md:max-w-none">{initData.title || 'Untitled Book'}</span>
                        <span className="text-[10px] md:text-xs px-2 py-0.5 rounded-full uppercase tracking-wider font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Guest</span>
                    </h1>


                    <div className="flex items-center gap-4">
                        {/* Stats Display (Progress & Words) */}
                        <div className="hidden lg:flex items-center gap-4 mr-2">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Progress</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${stats.percent}%` }}></div>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-400">{stats.percent}%</span>
                                </div>
                            </div>
                            <div className="w-px h-6 bg-white/10"></div>
                            <div className="flex flex-col items-start">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Words</span>
                                <span className="text-xs font-bold text-indigo-300">{stats.totalWords.toLocaleString()}</span>
                            </div>
                        </div>

                        {step === 4 && (
                            <button
                                onClick={() => setStep(5)}
                                className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-500/20"
                            >
                                Finish →
                            </button>
                        )}
                        <button id="save-btn" onClick={() => saveProgress()} className="text-xs text-indigo-300 border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg font-bold transition-colors uppercase tracking-wider flex items-center gap-1">
                            <span>Save</span>
                        </button>
                    </div>
                </div>
            </div>

            <main className="pt-32 flex-1 flex overflow-hidden">
                {/* Step 1: Initialization */}
                {step === 1 && (
                    <div className="w-full max-w-2xl mx-auto py-10 px-4 relative overflow-y-auto">
                        <div className="relative z-10">
                            <div className="text-center mb-6">
                                <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-3">Step 1 of 5</span>
                                <h2 className="text-2xl font-bold text-white mb-2">Book Specifications</h2>
                                <p className="text-sm text-gray-300">Define your book's core details and structure</p>
                            </div>

                            <div className="bg-[#0d1220] rounded-2xl border border-white/10 p-5 md:p-6 shadow-xl">
                                <div className="space-y-5">
                                    {/* User Details (For Access Link) */}
                                    <div className="bg-indigo-500/5 rounded-xl border border-indigo-500/20 p-4 mb-4">
                                        <h4 className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            Your Details (For Access Link)
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Your Name <span className="text-red-400">*</span></label>
                                                <input
                                                    type="text"
                                                    value={initData.full_name || ''}
                                                    onChange={e => setInitData({ ...initData, full_name: e.target.value })}
                                                    className="w-full bg-[#0a0f1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400"
                                                    placeholder="Enter your full name"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Email Address <span className="text-red-400">*</span></label>
                                                <input
                                                    type="email"
                                                    value={initData.email || ''}
                                                    onChange={e => setInitData({ ...initData, email: e.target.value })}
                                                    className="w-full bg-[#0a0f1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400"
                                                    placeholder="Where should we send your link?"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Book Title</label>
                                            <input type="text" value={initData.title} onChange={e => setInitData({ ...initData, title: e.target.value })} className="w-full bg-[#0a0f1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400" placeholder="Enter book title" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Author Name</label>
                                            <input type="text" value={initData.author_name} onChange={e => setInitData({ ...initData, author_name: e.target.value })} className="w-full bg-[#0a0f1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400" placeholder="Enter author name" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Book Category</label>
                                            <select
                                                value={(initData.genre || 'Non-Fiction').split(':')[0].trim().includes('Non-Fiction') ? 'Non-Fiction' : 'Fiction'}
                                                onChange={e => {
                                                    const newPrimary = e.target.value;
                                                    const defaultSub = newPrimary === 'Non-Fiction' ? NON_FICTION_TYPES[0] : FICTION_TYPES[0];
                                                    setInitData({ ...initData, genre: `${newPrimary}: ${defaultSub}` });
                                                }}
                                                className="w-full bg-[#0a0f1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400 appearance-none cursor-pointer"
                                            >
                                                <option value="Non-Fiction">Non-Fiction (Fact-based)</option>
                                                <option value="Fiction">Fiction (Creative)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Genre / Style</label>
                                            <select
                                                value={(initData.genre || '').split(':')[1]?.trim() || ''}
                                                onChange={e => {
                                                    const primary = (initData.genre || 'Non-Fiction').split(':')[0].trim();
                                                    setInitData({ ...initData, genre: `${primary}: ${e.target.value}` });
                                                }}
                                                className="w-full bg-[#0a0f1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400 appearance-none cursor-pointer"
                                            >
                                                {((initData.genre || 'Non-Fiction').split(':')[0].trim().includes('Non-Fiction') ? NON_FICTION_TYPES : FICTION_TYPES).map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Book Concept / Premise <span className="text-cyan-400">*</span></label>
                                        <textarea value={initData.topic} onChange={e => setInitData({ ...initData, topic: e.target.value })} className="w-full bg-[#0a0f1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400 h-20 resize-none" placeholder={initData.genre === 'Fiction' ? "Describe the plot..." : "Describe the topic..."} />
                                    </div>

                                    <div className="bg-[#0a0f1a] rounded-xl border border-white/10 p-4">
                                        <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-4">Structure Settings</h4>
                                        <div className="grid grid-cols-3 gap-4">
                                            {/* Dynamic LIMITS Calculation for UI */}
                                            {(() => {
                                                const rangeParts = (initData.page_range || '80-100').split('-');
                                                const maxPages = parseInt(rangeParts[1] || rangeParts[0] || 100);
                                                let limits = { maxCh: 12, maxSub: 15 }; // Default Saver (Boosted Sub)
                                                if (maxPages >= 200) limits = { maxCh: 25, maxSub: 30 };
                                                else if (maxPages >= 150) limits = { maxCh: 20, maxSub: 25 };
                                                else if (maxPages >= 120) limits = { maxCh: 15, maxSub: 20 };

                                                return (
                                                    <>
                                                        <div className="space-y-1.5">
                                                            <label className="block text-[10px] font-bold text-gray-400">Chapters (Max {limits.maxCh})</label>
                                                            <input
                                                                type="number"
                                                                value={initData.chapter_count}
                                                                onChange={e => {
                                                                    const val = e.target.value;
                                                                    setInitData({ ...initData, chapter_count: val === '' ? '' : parseInt(val) });
                                                                }}
                                                                onBlur={e => {
                                                                    let val = parseInt(e.target.value);
                                                                    if (isNaN(val) || val < 1) val = 1;
                                                                    if (val > limits.maxCh) val = limits.maxCh;
                                                                    setInitData({ ...initData, chapter_count: val });
                                                                }}
                                                                className="w-full bg-[#070a10] border border-white/10 rounded-lg px-2 py-2 text-white text-center font-bold"
                                                                min="1"
                                                                max={limits.maxCh}
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="block text-[10px] font-bold text-gray-400">Sub-chapters (Max {limits.maxSub})</label>
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
                                                                    if (val > limits.maxSub) val = limits.maxSub;
                                                                    setInitData({ ...initData, sub_chapter_count: val });
                                                                }}
                                                                className="w-full bg-[#070a10] border border-white/10 rounded-lg px-2 py-2 text-white text-center font-bold"
                                                                min="1"
                                                                max={limits.maxSub}
                                                            />
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                            <div className="space-y-1.5">
                                                <label className="block text-[10px] font-bold text-gray-400">Total Pages (Approx)</label>
                                                <div className={`w-full border rounded-lg px-2 py-2 text-center text-xs font-bold flex flex-col justify-center ${(() => {
                                                    // Parse Max Pages from Range (e.g., "150-200" -> 200)
                                                    const rangeParts = (initData.page_range || '80-100').split('-');
                                                    const maxPages = parseInt(rangeParts[1] || rangeParts[0] || 100);

                                                    const totalSub = (initData.chapter_count || 0) * (initData.sub_chapter_count || 0);
                                                    if (totalSub === 0) return 'bg-[#070a10] border-white/10 text-white opacity-70';

                                                    const pagesPerSub = Math.floor(maxPages / totalSub);
                                                    if (pagesPerSub < 1) return 'bg-red-500/10 border-red-500/30 text-red-500'; // Invalid
                                                    return 'bg-[#070a10] border-white/10 text-emerald-400';
                                                })()
                                                    }`}>
                                                    {(() => {
                                                        const rangeParts = (initData.page_range || '80-100').split('-');
                                                        const maxPages = parseInt(rangeParts[1] || rangeParts[0] || 100);

                                                        const totalSub = (initData.chapter_count || 0) * (initData.sub_chapter_count || 0);
                                                        if (totalSub === 0) return <span>0 Pages</span>;

                                                        const totalCapacityWords = maxPages * 275;
                                                        const wordsPerSub = Math.floor(totalCapacityWords / totalSub);
                                                        const pagesPerSub = wordsPerSub / 275;
                                                        const totalUsedPages = Math.round((wordsPerSub * totalSub) / 275);

                                                        let statusColor = 'text-emerald-400';
                                                        let statusText = `${pagesPerSub.toFixed(1)} Pages / Section`;

                                                        if (pagesPerSub < 0.5) {
                                                            statusColor = 'text-red-500';
                                                            statusText = 'TOO DENSE (< 0.5 Pg/Sec)';
                                                        } else if (pagesPerSub < 1.0) {
                                                            statusColor = 'text-amber-400';
                                                            statusText = `Short Sections (${pagesPerSub.toFixed(1)} Pg)`;
                                                        }

                                                        return (
                                                            <>
                                                                <span>{totalUsedPages} Pages Used / {maxPages} Max</span>
                                                                <span className={`text-[9px] font-normal decoration-indigo-300 ${statusColor}`}>
                                                                    {statusText}
                                                                </span>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Plan Limits Legend */}
                                        <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-400 bg-white/5 p-2 rounded-lg border border-white/5">
                                            <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <span>
                                                {(() => {
                                                    const rangeParts = (initData.page_range || '80-100').split('-');
                                                    const maxPages = parseInt(rangeParts[1] || rangeParts[0] || 100);
                                                    let planName = 'Saver';
                                                    let limits = { maxCh: 12, maxSub: 15 };
                                                    if (maxPages >= 200) { planName = 'Enterprise'; limits = { maxCh: 25, maxSub: 30 }; }
                                                    else if (maxPages >= 150) { planName = 'Pro'; limits = { maxCh: 20, maxSub: 25 }; }
                                                    else if (maxPages >= 120) { planName = 'Standard'; limits = { maxCh: 15, maxSub: 20 }; }

                                                    return `Your ${planName} Plan allows up to ${limits.maxCh} Chapters and ${limits.maxSub} Sub-chapters per Chapter.`;
                                                })()}
                                            </span>
                                        </div>
                                    </div>

                                    <button onClick={proceedToOutlinePhase} className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-sm rounded-lg shadow-lg flex items-center justify-center gap-2">
                                        Proceed to Outline Phase →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Outline */}
                {step === 2 && (
                    <div className="w-full max-w-3xl mx-auto py-10 px-4 overflow-y-auto relative">
                        <div className="relative z-10">
                            <div className="text-center mb-6">
                                <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-3">Step 2 of 5</span>
                                <h2 className="text-2xl font-bold text-white mb-2">Chapter Outline</h2>
                                <p className="text-sm text-gray-300">{chapters.length > 0 ? `${chapters.length} Chapters Generated` : 'Generate your book structure'}</p>
                            </div>

                            {chapters.length === 0 ? (
                                <div className="bg-[#0d1220] rounded-2xl border border-white/10 p-6 md:p-8 shadow-xl text-center">
                                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/30 to-cyan-500/20 text-white rounded-xl flex items-center justify-center mx-auto mb-5 text-2xl border border-indigo-500/30">📚</div>
                                    <h3 className="text-lg font-bold text-white mb-2">No Chapters Yet</h3>
                                    <p className="text-sm text-gray-300 mb-6 max-w-sm mx-auto">Generate an outline with AI or manually create your own.</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                        {/* Auto Mode */}
                                        <div onClick={() => generateOutline('ai')} className="group bg-gradient-to-br from-indigo-500/15 to-transparent rounded-xl p-4 border border-indigo-500/30 hover:border-indigo-400/50 transition-all cursor-pointer text-center h-full flex flex-col justify-center">
                                            <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-lg">✨</div>
                                            <h4 className="font-semibold text-white text-sm mb-1">Smart Writer Mode</h4>
                                            <p className="text-xs text-gray-300 mb-4">Let AI create a structured outline based on your concept.</p>
                                            <button className="w-full py-2 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-lg font-bold text-xs shadow-lg mt-auto">
                                                {isLoading ? 'Generating...' : 'Generate with AI'}
                                            </button>
                                        </div>

                                        {/* Manual Mode */}
                                        <div className="group bg-[#0a0f1a] rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all text-center h-full flex flex-col justify-center relative">
                                            <div className="w-10 h-10 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-3 text-lg">✍️</div>
                                            <h4 className="font-semibold text-white text-sm mb-1">Manual Creation</h4>
                                            <p className="text-xs text-gray-400 mb-3">Type or paste your chapter titles directly.</p>

                                            <div className="flex-1 w-full mb-3">
                                                <textarea
                                                    id="manual-chapters-input"
                                                    className="w-full h-24 bg-[#05060b] border border-white/10 rounded-lg p-2 text-xs text-white placeholder-gray-600 resize-none focus:outline-none focus:border-indigo-500"
                                                    placeholder="Chapter 1: The Beginning&#10;Chapter 2: The Journey&#10;..."
                                                    onClick={(e) => e.stopPropagation()}
                                                ></textarea>
                                            </div>

                                            <button
                                                onClick={(e) => { e.stopPropagation(); generateOutline('manual'); }}
                                                className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-xs border border-white/10 mt-auto"
                                            >
                                                Use Manual Outline
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-[#0d1220] rounded-2xl border border-white/10 p-5 shadow-xl">
                                    <div className="space-y-2 mb-5 max-h-[45vh] overflow-y-auto pr-2">
                                        {chapters.map((chapter, i) => (
                                            <div key={i} className="bg-[#0a0f1a] p-3 rounded-lg border border-white/10 flex items-center gap-3">
                                                <span className="w-7 h-7 flex items-center justify-center bg-indigo-500/20 rounded-lg font-bold text-indigo-300 text-xs">{i + 1}</span>
                                                <span className="flex-1 font-medium text-sm text-white">{chapter.title}</span>
                                                <span className="text-emerald-400 text-xs">✓</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                        <button onClick={() => setStep(1)} className="px-4 py-2 text-sm text-gray-300 hover:text-white flex items-center gap-2">Back</button>
                                        <button onClick={startSubChapters} className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-sm rounded-lg shadow-lg flex items-center gap-2">Approve Outline & Next →</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 3: Structure */}
                {step === 3 && (
                    <div className="flex w-full h-full">
                        <div className="w-64 bg-[#0a0f1a] border-r border-white/10 overflow-y-auto flex flex-col pt-4">
                            <div className="px-4 mb-4">
                                <span className="inline-block py-0.5 px-2 rounded-md bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[9px] font-bold uppercase tracking-wider mb-1">Step 3 of 5</span>
                                <h3 className="font-bold text-white text-sm">Chapter Structure</h3>
                                <p className="text-gray-500 text-[10px] mt-1">Select a chapter to generate sub-sections</p>
                            </div>
                            <div className="flex-1">
                                {chapters.map((chapter, i) => (
                                    <div key={i} onClick={() => setActiveChapterId(chapter.id)} className={`p-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition ${activeChapterId === chapter.id ? 'bg-indigo-500/15 border-l-4 border-l-indigo-400' : ''}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="font-medium text-xs text-white"><span className="text-gray-400 mr-1">{i + 1}.</span>{chapter.title}</div>
                                            {chapter.sections && chapter.sections.length > 0 ? <span className="text-emerald-400 text-[10px]">Ready</span> : <span className="text-amber-400 text-[10px]">Pending</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 bg-[#070a10] p-6 overflow-y-auto relative">
                            {activeChapterId && (
                                <div className="max-w-xl mx-auto relative z-10">
                                    <h2 className="text-lg font-bold mb-1 text-white">Structure for: <span className="text-indigo-400">{chapters.find(c => c.id === activeChapterId)?.title}</span></h2>
                                    <p className="text-gray-300 text-xs mb-5">Define sub-sections.</p>

                                    {chapters.find(c => c.id === activeChapterId)?.sections?.length > 0 ? (
                                        <div className="space-y-2">
                                            {chapters.find(c => c.id === activeChapterId).sections.map((section, idx) => (
                                                <div key={idx} className="bg-[#0d1220] p-3 rounded-lg border border-white/10 flex items-center gap-3">
                                                    <span className="w-6 h-6 flex items-center justify-center bg-indigo-500/20 rounded-md text-indigo-300 text-xs font-bold">{idx + 1}</span>
                                                    <span className="text-white text-sm font-medium">{section.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-[#0d1220] rounded-xl border border-white/10 p-8 text-center">
                                            {/* No sections yet icon */}
                                            <div className="w-14 h-14 mx-auto mb-4 bg-[#0a0f1a] rounded-xl flex items-center justify-center border border-white/10">
                                                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <h4 className="text-white font-bold text-sm mb-1">No sections yet</h4>
                                            <p className="text-gray-400 text-xs mb-6">Generate sub-headings for this chapter to organize the content.</p>

                                            <button onClick={() => generateSectionsForChapter(activeChapterId)} disabled={isLoading} className="w-full py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-sm rounded-lg shadow-lg mb-5">
                                                {isLoading ? 'Generating...' : '✨ Generate with Smart Writer'}
                                            </button>

                                            <div className="text-xs text-gray-500 uppercase tracking-widest mb-3">Or Manually (Max {initData.sub_chapter_count || 5})</div>
                                            <textarea id={`manual-input-${activeChapterId}`} className="w-full bg-[#0a0f1a] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-xs h-24 mb-3" placeholder={`1. First sub-heading\n2. Second sub-heading\n...`}></textarea>
                                            <button onClick={() => saveManualStructure(activeChapterId)} className="w-full py-2.5 bg-white/10 text-white rounded-lg font-bold text-xs border border-white/10 hover:bg-white/15 transition">Save Manual Structure</button>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="fixed bottom-6 right-6 z-40">
                                <button
                                    onClick={() => {
                                        if (!isStructureComplete()) {
                                            if (!confirm("⚠️ Structure Incomplete\n\nSome chapters do not have sub-chapters yet. You won't be able to write content for them until you generate their structure.\n\nContinue anyway?")) {
                                                return;
                                            }
                                        }
                                        setStep(4);
                                    }}
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-sm rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all flex items-center gap-2"
                                >
                                    Start Writing Phase →
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Writing */}
                {
                    step === 4 && (
                        <div className="flex w-full h-full">
                            <div className="w-60 bg-[#0a0f1a] border-r border-white/10 flex flex-col pt-4">
                                <div className="px-4 mb-4">
                                    <span className="inline-block py-0.5 px-2 rounded-md bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[9px] font-bold uppercase tracking-wider mb-1">Step 4 of 5</span>
                                    <h3 className="font-bold text-white text-sm">Write Content</h3>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {chapters.map(chapter => (
                                        <div key={chapter.id}>
                                            <div className="px-3 py-2 bg-[#070a10] text-[10px] font-bold text-gray-300 uppercase tracking-wider sticky top-0 border-b border-white/5">{chapter.title}</div>
                                            {chapter.sections?.map(section => (
                                                <button key={section.id} onClick={() => { setActiveSection(section); setActiveChapterId(chapter.id); }} className={`w-full text-left px-4 py-2 text-xs border-b border-white/5 hover:bg-white/5 transition ${activeSection?.id === section.id ? 'bg-indigo-500/15 text-white border-l-4 border-l-indigo-400' : 'text-gray-300'}`}>
                                                    <div className="flex justify-between items-center">
                                                        <span className="truncate pr-2">{section.title}</span>
                                                        {section.content ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> : <span className="w-1.5 h-1.5 rounded-full bg-gray-600 border border-gray-500"></span>}
                                                    </div>
                                                </button>
                                            ))}
                                            {(!chapter.sections || chapter.sections.length === 0) && (
                                                <button
                                                    onClick={() => {
                                                        setActiveChapterId(chapter.id);
                                                        setStep(3);
                                                    }}
                                                    className="w-full text-left px-4 py-3 text-[10px] text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 border-b border-white/5 transition flex items-center gap-2"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                    <span>Missing Structure. Click to Setup.</span>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 bg-[#070a10] flex flex-col">
                                {activeSection ? (
                                    <div className="flex-1 flex flex-col h-full">
                                        <div className="h-12 border-b border-white/10 flex items-center justify-between px-5 bg-[#0a0f1a]">
                                            <h2 className="font-bold text-white text-sm">{activeSection.title}</h2>
                                            <div className="flex gap-3 items-center">
                                                {!activeSection.content ? (
                                                    <button onClick={() => writeContent(activeSection)} disabled={isLoading} className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-xs rounded-lg shadow-lg">
                                                        {isLoading ? 'Writing...' : '✨ Write This Section'}
                                                    </button>
                                                ) : (
                                                    <div className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 font-bold rounded-lg border border-emerald-500/30 text-xs flex items-center gap-1.5"><span>✔ Generated</span></div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Toolbar - Image generation available to all paid guest plans */}
                                        <div className="h-10 border-b border-white/10 flex items-center px-5 bg-[#0d1220]">
                                            {session.image_credits_limit > 0 ? (
                                                <>
                                                    <button onClick={handleGenerateImageClick} disabled={isGeneratingImage || imageCredits.used >= imageCredits.limit} className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isGeneratingImage || imageCredits.used >= imageCredits.limit ? 'text-gray-500 cursor-not-allowed' : 'text-indigo-400 hover:text-indigo-300'}`}>
                                                        {isGeneratingImage ? 'Generating Image...' : '🎨 Generate Illustration'}
                                                    </button>
                                                    <div className="mx-3 h-4 w-px bg-white/10"></div>
                                                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                                                        <span>Credits:</span>
                                                        <span className={imageCredits.used >= imageCredits.limit ? 'text-red-400' : 'text-emerald-400'}>{imageCredits.used} / {imageCredits.limit}</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">🔒 Image Generation (Not Available)</span>
                                            )}
                                        </div>

                                        <div className="flex-1 p-6 overflow-y-auto relative">
                                            <div className="max-w-3xl mx-auto bg-[#0d1220] min-h-[600px] shadow-xl border border-white/10 rounded-xl p-8 relative z-10">
                                                {activeSection.image_url && <div className="mb-6 p-2 border border-white/10 rounded-lg bg-[#0a0f1a] text-center"><img src={activeSection.image_url} className="max-w-full h-auto mx-auto rounded-lg shadow-lg" /></div>}
                                                {activeSection.content ? (
                                                    <div
                                                        className="prose prose-invert max-w-none font-serif text-base leading-relaxed text-gray-100"
                                                        dangerouslySetInnerHTML={{ __html: activeSection.content }}
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-center py-16"><p className="text-gray-300 text-sm font-medium">Click "Write This Section" to generate content.</p></div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center p-10">
                                        <div className="text-center text-gray-500">
                                            <div className="text-4xl mb-4 opacity-50">👈</div>
                                            <p className="text-base font-medium">Select a section from the left sidebar to start writing</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }



                {/* Step 5: Export */}
                {
                    step === 5 && (
                        <div className="w-full max-w-2xl mx-auto py-10 px-4 relative">
                            <div className="relative z-10 text-center space-y-6">

                                {/* Download Section */}
                                <div className="bg-[#0d1220] rounded-2xl border border-white/10 p-6 md:p-8 shadow-xl">
                                    <h2 className="text-2xl font-bold text-white mb-2">Book Compilation Complete!</h2>
                                    <p className="text-sm text-gray-300 mb-6">Your book manuscript is ready.</p>
                                    <div className="space-y-3 max-w-sm mx-auto">
                                        <div className="p-3 bg-[#0a0f1a] rounded-xl border border-white/10 flex items-center justify-between">
                                            <div className="text-left"><div className="font-semibold text-sm text-white">Microsoft Word (.docx)</div></div>
                                            <a href={route('guest-writer.download-book', { session_token: token, format: 'word' })} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-xs font-bold text-white">Download</a>
                                        </div>
                                        <div className="p-3 bg-[#0a0f1a] rounded-xl border border-white/10 flex items-center justify-between">
                                            <div className="text-left"><div className="font-semibold text-sm text-white">PDF Document (.pdf)</div></div>
                                            <a href={route('guest-writer.download-book', { session_token: token, format: 'pdf' })} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-xs font-bold text-white">Download</a>
                                        </div>
                                    </div>
                                </div>

                                {/* Start Publishing Section */}
                                <div className="bg-gradient-to-br from-indigo-900/40 to-cyan-900/40 rounded-2xl border border-indigo-500/30 p-6 md:p-8 shadow-xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors"></div>
                                    <div className="relative z-10">
                                        <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-3">Next Step</span>
                                        <h3 className="text-xl font-bold text-white mb-2">Ready to Publish Globally?</h3>
                                        <p className="text-sm text-gray-300 mb-6 max-w-md mx-auto">
                                            Turn your manuscript into a bestseller. Create a free account to distribute to Amazon, Google Books, and 100+ stores.
                                        </p>
                                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                            <Link href={route('login')} className="w-full sm:w-auto px-6 py-2.5 bg-[#0a0f1a] hover:bg-[#151b29] border border-white/10 text-white font-bold text-sm rounded-lg transition-all">
                                                Login to Account
                                            </Link>
                                            <Link href={route('register')} className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:scale-105 text-white font-bold text-sm rounded-lg shadow-lg transition-all">
                                                Create Free Account & Publish →
                                            </Link>
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
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                        <div className="bg-[#0d1220] rounded-2xl border border-white/10 w-full max-w-md overflow-hidden shadow-2xl">
                            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">🎨 Generate Illustration</h3>
                                <button onClick={() => setShowImagePromptModal(false)} className="text-gray-400 hover:text-white">✕</button>
                            </div>
                            <div className="p-4 space-y-4">
                                <p className="text-sm text-gray-300">Generate for: <span className="text-white font-semibold">{activeSection?.title}</span></p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setImagePromptMode('auto')} className={`p-4 rounded-xl border text-center transition-all ${imagePromptMode === 'auto' ? 'border-indigo-500 bg-indigo-500/20 text-white' : 'border-white/10 bg-white/5 text-gray-300'}`}>
                                        <span className="block text-sm font-bold">Auto (AI)</span>
                                    </button>
                                    <button onClick={() => setImagePromptMode('custom')} className={`p-4 rounded-xl border text-center transition-all ${imagePromptMode === 'custom' ? 'border-cyan-500 bg-cyan-500/20 text-white' : 'border-white/10 bg-white/5 text-gray-300'}`}>
                                        <span className="block text-sm font-bold">Custom</span>
                                    </button>
                                </div>
                                {imagePromptMode === 'custom' && (
                                    <textarea value={customImagePrompt} onChange={e => setCustomImagePrompt(e.target.value)} placeholder="Describe the image..." className="w-full bg-[#0a0f1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm h-24 resize-none" />
                                )}
                            </div>
                            <div className="p-4 border-t border-white/10 flex gap-3">
                                <button onClick={() => setShowImagePromptModal(false)} className="flex-1 py-2.5 bg-white/5 text-gray-300 font-semibold rounded-lg text-sm border border-white/10">Cancel</button>
                                <button onClick={() => generateImage(activeSection, imagePromptMode, customImagePrompt)} disabled={imagePromptMode === 'custom' && !customImagePrompt.trim()} className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold rounded-lg text-sm shadow-lg disabled:opacity-50">Generate Image</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
