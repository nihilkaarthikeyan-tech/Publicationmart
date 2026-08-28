import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import InputError from '@/Components/InputError';
import AiWritingModal from '@/Components/AiWritingModal';

export default function Design({ auth, book }) {
    const { data, setData, post, processing, errors } = useForm({
        book_size: book.book_size || '5.5x8.5',
        printing_color: book.printing_color || 'B/W',
        paper_type: book.paper_type || 'White Paper',
        binding_type: book.binding_type || 'Soft Binding',
        interior_layout_method: book.interior_layout_method || '',
        interior_file: null,
        cover_design_path: null,
    });

    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [showAiModal, setShowAiModal] = useState(false);
    const [templateError, setTemplateError] = useState(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const getDownloadUrl = (folder, size) => {
        // Automatically detect if we are running in a subdirectory (like /publicationmart/public/)
        const pathParts = window.location.pathname.split('/');
        const publicIndex = pathParts.indexOf('public');
        const basePath = publicIndex !== -1 ? pathParts.slice(0, publicIndex + 1).join('/') : '';

        // Sanitize size (remove spaces) to match file system (e.g. '16.5 x 11' -> '16.5x11')
        const sanitizedSize = size.toString().replace(/\s/g, '');
        return `${basePath}/templates/${folder}/${sanitizedSize}.docx`;
    };

    const handleDownload = async (folder, size) => {
        const url = getDownloadUrl(folder, size);
        const sanitizedSize = size.toString().replace(/\s/g, '');

        setTemplateError(null);

        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                const link = document.createElement('a');
                link.href = url;
                link.download = `${sanitizedSize}.docx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                setTemplateError(`ERROR 404: File not found at "${url}". Please ensure the template file exists on the server.`);
            }
        } catch (e) {
            setTemplateError("Connection error: Unable to reach the server to download the template.");
        }
    };

    const submit = (action = 'next') => {
        post(route('books.update', book.id) + (action === 'back' ? '?action=back' : ''), {
            forceFormData: true,
            onError: (err) => {
                console.error(err);
                alert("Please correct the errors: " + Object.values(err).join(", "));
            }
        });
    };

    const saveAndNavigate = (routeName) => {
        const url = route(routeName, book.id);
        // We append redirect_to query param so controller knows where to go
        post(route('books.update', book.id) + '?redirect_to=' + encodeURIComponent(url), {
            forceFormData: true,
            onError: (err) => {
                console.error(err);
                alert("Please save failed. Correct errors: " + Object.values(err).join(", "));
            }
        });
    };

    /**
     * Handles immediate file upload and validation.
     * User requested immediate feedback on file size mismatch.
     */
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Strict Workflow Check: Warn if switching from Professional Formatting Tool
        if (data.interior_layout_method === 'formatting_tool') {
            if (!confirm("You are currently using the Professional Formatting Tool. Uploading a file will switch you to 'Upload Mode' and clear your formatting progress. Proceed?")) {
                e.target.value = null; // Reset input
                return;
            }
        }

        // 1. Immediate Frontend Validation
        // Check file type
        const validTypes = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
            alert("Please upload a DOC or DOCX file.");
            return;
        }

        // Check file size (50MB)
        if (file.size > 50 * 1024 * 1024) {
            alert("File size exceeds 50MB limit.");
            return;
        }

        // Update local state immediately — use single callback to avoid batching issues
        setData(data => ({
            ...data,
            interior_file: file,
            interior_layout_method: 'upload',
        }));

        // 2. Send request via Inertia (Let Inertia handle FormData conversion)
        router.post(route('books.update', book.id), {
            _method: 'POST', // Only needed if simulating PUT, but standard POST works for file uploads
            interior_file: file,
            interior_layout_method: 'upload',
            book_size: data.book_size,
            printing_color: data.printing_color,
            paper_type: data.paper_type,
            binding_type: data.binding_type,
            stay_on_page: true // Pass boolean true, Inertia handles it
        }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                // Success - file accepted and saved
                // alert("File uploaded successfully!");
            },
            onError: (err) => {
                console.error("Upload Validation Error", err);
                // Alert removed as per user request to show error inline

                // Clear the invalid file selection so user can try again
                setData('interior_file', null);
                e.target.value = null;
            }
        });
    };

    /**
     * Handles removal of the currently uploaded file from server.
     */
    const handleFileRemove = () => {
        if (!confirm("Are you sure you want to delete this file? This action cannot be undone.")) return;

        router.post(route('books.update', book.id), {
            _method: 'POST',
            remove_interior_file: true,
            stay_on_page: true
        }, {
            preserveScroll: true,
            onSuccess: () => {
                // UI update handled by Inertia reloading 'book' prop
                // Reset local state just in case
                setData('interior_file', null);

                // Optional: reset layout method if desired? 
                // setData('interior_layout_method', '');
            }
        });
    };

    /**
     * Silently removes the file when size is changed.
     */
    const handleFileRemoveSilently = () => {
        router.post(route('books.update', book.id), {
            _method: 'POST',
            remove_interior_file: true
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setData('interior_file', null);
            }
        });
    };

    /**
     * Handles book size change with strict validation logic.
     * If a file is uploaded, it must be removed if size changes to ensure consistency.
     */
    const handleSizeChange = (newSize) => {
        if (data.book_size === newSize) return;

        if (data.interior_file || book.interior_file) {
            const msg = book.interior_file
                ? `You have an uploaded file for size ${data.book_size}. Changing to ${newSize} will delete the existing file as it may no longer be compatible. Proceed?`
                : `Your selected file for size ${data.book_size} will be cleared. Proceed?`;

            if (confirm(msg)) {
                setData('book_size', newSize);
                if (book.interior_file) {
                    handleFileRemoveSilently();
                } else {
                    setData('interior_file', null);
                }
            }
        } else {
            setData('book_size', newSize);
        }
    };

    /**
     * Handles launching the Smart Writer Studio.
     * Reverted to original state as per user request.
     */
    const handleLaunchSmartStudio = () => {
        setData('interior_layout_method', 'automatic_tool');
        saveAndNavigate('books.ai-studio');
    };

    return (
        <>
            <Head title="Book Design - Step 2" />

            {/* Split Background - Dark Left, Light Right Gradient */}
            <div className="min-h-screen relative overflow-hidden">
                {/* Dark side gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#5a1e27] via-[#6e2530] to-[#4d1a22]" />

                {/* Light overlay on right side */}
                <div className="absolute inset-0 bg-gradient-to-l from-[#f0ece3] via-[#f0ece3]/95 to-transparent" style={{ clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 15% 100%)' }} />

                {/* Decorative elements */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-violet-500/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-20 left-40 w-96 h-96 bg-indigo-500/15 rounded-full blur-[120px]" />

                <div className={`relative min-h-screen flex items-start py-12 transition-all duration-1000 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                            {/* Left Side - Progress & Hero */}
                            <div className={`lg:col-span-4 transition-all duration-700 delay-200 transform ${isMounted ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'} sticky top-24`}>
                                <div className="relative p-8 rounded-3xl bg-[#17150f]/40 backdrop-blur-sm border border-white/10">
                                    {/* Vertical Steps */}
                                    <div className="mb-8">
                                        <div className="flex items-center gap-3 mb-4">
                                            {[1, 2, 3, 4].map((step) => (
                                                <div key={step} className="flex items-center">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${step === 2
                                                        ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/50'
                                                        : step < 2
                                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                            : 'bg-white/10 text-white/50 border border-white/20'
                                                        }`}>
                                                        {step < 2 ? (
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                                        ) : step}
                                                    </div>
                                                    {step < 4 && <div className={`w-4 h-0.5 ml-2 rounded ${step < 2 ? 'bg-emerald-500/50' : 'bg-white/10'}`}></div>}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-violet-500/30 rounded-lg text-violet-200 text-sm font-bold border border-violet-500/30">Step 2: Design</span>
                                        </div>
                                    </div>

                                    <h1 className="text-4xl text-[#f2ecdd] mb-4 leading-tight" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
                                        Design Your <br />
                                        <em className="text-[#e8cf8e]">Masterpiece</em>
                                    </h1>
                                    <p className="text-lg text-[#f2ecdd]/85 mb-8 leading-relaxed">
                                        Customize the physical look and feel of your book. Choose from premium printing options to make your book stand out.
                                    </p>

                                    {/* Features List */}
                                    <div className="space-y-4">
                                        {[
                                            { icon: '📏', text: 'Standard & Custom Sizes' },
                                            { icon: '🎨', text: 'Premium Color Options' },
                                            { icon: '📚', text: 'Professional Binding' }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 text-[#f2ecdd]/85">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 text-lg">
                                                    {item.icon}
                                                </div>
                                                <span className="font-medium">{item.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Side - Form Card */}
                            <div className={`lg:col-span-8 transition-all duration-700 delay-400 transform ${isMounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-[#17150f]/10 border border-[#e7e1d4] overflow-hidden relative">
                                    {/* Card Header */}
                                    <div className="px-10 py-8 bg-gradient-to-r from-slate-50 to-white border-b border-[#e7e1d4] flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <button
                                                type="button"
                                                onClick={() => submit('back')}
                                                className="p-2 -ml-2 text-[#7c7364] hover:text-[#635c4e] hover:bg-[#efe9db] rounded-full transition-colors"
                                                title="Go Back"
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <div>
                                                <h2 className="text-xl font-bold text-[#17150f]">Book Configuration</h2>
                                                <p className="text-[#635c4e] text-sm mt-1">Select your printing and layout preferences</p>
                                            </div>
                                        </div>
                                        <div className="hidden sm:block">
                                            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Content Wrapper */}
                                    <div className="p-8 lg:p-10">
                                        <form className="space-y-10">

                                            {/* Book Size */}
                                            <div>
                                                <label className="block text-lg font-bold text-[#17150f] mb-4">
                                                    Book Size
                                                </label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {[
                                                        { id: '5x8', label: '5x8', desc: 'Story, Poetry, and Fiction' },
                                                        { id: '6x9', label: '6x9', desc: 'Academic and Non-fiction' },
                                                        { id: '5.5x8.5', label: '5.5x8.5', desc: 'Story and Poetry' },
                                                        { id: '8.5x8.5', label: '8.5x8.5', desc: 'Children\'s Books' },
                                                        { id: '8.5x11', label: '8.5x11', desc: 'Academic and Non-fiction' },
                                                        { id: '16.5x11', label: '16.5x11', desc: 'Magazine' },
                                                    ].map((size) => (
                                                        <button
                                                            key={size.id}
                                                            type="button"
                                                            onClick={() => handleSizeChange(size.id)}
                                                            className={`p-6 border-2 rounded-xl transition-all duration-200 text-left relative ${data.book_size === size.id
                                                                ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg'
                                                                : 'border-[#d8d1c1] hover:border-purple-300 hover:bg-purple-50/30'
                                                                }`}
                                                        >
                                                            {data.book_size === size.id && (
                                                                <div className="absolute top-2 right-2">
                                                                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                            <div className="text-center mb-3">
                                                                <div className="text-2xl font-bold text-[#17150f] mb-1">{size.label}</div>
                                                                <div className="text-xs text-[#635c4e] font-medium">inches</div>
                                                            </div>
                                                            <div className="text-[10px] leading-tight text-[#635c4e] font-bold uppercase tracking-wider text-center">
                                                                Recommended for:<br />
                                                                <span className="text-purple-600">{size.desc}</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                                <InputError message={errors.book_size} className="mt-2" />
                                            </div>

                                            <div className="border-t border-[#d8d1c1]"></div>

                                            {/* Printing Type */}
                                            <div>
                                                <label className="block text-lg font-bold text-[#17150f] mb-4">
                                                    Printing Type
                                                </label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <button
                                                        type="button"
                                                        onClick={() => setData('printing_color', 'B/W')}
                                                        className={`p-6 border-2 rounded-xl transition-all duration-200 text-left ${data.printing_color === 'B/W'
                                                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg'
                                                            : 'border-[#d8d1c1] hover:border-purple-300'
                                                            }`}
                                                    >
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="p-2 bg-[#efe9db] rounded-lg">
                                                                <svg className="w-6 h-6 text-[#4b443a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                            </div>
                                                            {data.printing_color === 'B/W' && (
                                                                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <h3 className="font-bold text-[#17150f] mb-1">Black & White</h3>
                                                        <p className="text-sm text-[#635c4e]">Perfect for novels and text-heavy books</p>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setData('printing_color', 'Color')}
                                                        className={`p-6 border-2 rounded-xl transition-all duration-200 text-left ${data.printing_color === 'Color'
                                                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg'
                                                            : 'border-[#d8d1c1] hover:border-purple-300'
                                                            }`}
                                                    >
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="p-2 bg-gradient-to-br from-red-100 via-yellow-100 to-blue-100 rounded-lg">
                                                                <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                                                </svg>
                                                            </div>
                                                            {data.printing_color === 'Color' && (
                                                                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <h3 className="font-bold text-[#17150f] mb-1">Full Color</h3>
                                                        <p className="text-sm text-[#635c4e]">Great for children's books and illustrated guides</p>
                                                    </button>
                                                </div>
                                                <InputError message={errors.printing_color} className="mt-2" />
                                            </div>

                                            <div className="border-t border-[#d8d1c1]"></div>

                                            {/* Paper Type */}
                                            <div>
                                                <label className="block text-lg font-bold text-[#17150f] mb-4">
                                                    Paper Type
                                                </label>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {['White Paper', 'Bond Paper', 'Art Paper'].map((paper) => (
                                                        <button
                                                            key={paper}
                                                            type="button"
                                                            onClick={() => setData('paper_type', paper)}
                                                            className={`p-6 border-2 rounded-xl transition-all duration-200 ${data.paper_type === paper
                                                                ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg'
                                                                : 'border-[#d8d1c1] hover:border-purple-300'
                                                                }`}
                                                        >
                                                            {data.paper_type === paper && (
                                                                <div className="flex justify-end mb-2">
                                                                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                            <div className="text-center">
                                                                <div className="font-bold text-[#17150f]">{paper}</div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                                <InputError message={errors.paper_type} className="mt-2" />
                                            </div>

                                            <div className="border-t border-[#d8d1c1]"></div>

                                            {/* Binding Type */}
                                            <div>
                                                <label className="block text-lg font-bold text-[#17150f] mb-4">
                                                    Binding Type
                                                </label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <button
                                                        type="button"
                                                        onClick={() => setData('binding_type', 'Soft Binding')}
                                                        className={`p-6 border-2 rounded-xl transition-all duration-200 text-left ${data.binding_type === 'Soft Binding'
                                                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg'
                                                            : 'border-[#d8d1c1] hover:border-purple-300'
                                                            }`}
                                                    >
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                                <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                                </svg>
                                                            </div>
                                                            {data.binding_type === 'Soft Binding' && (
                                                                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <h3 className="font-bold text-[#17150f] mb-1">Soft Binding</h3>
                                                        <p className="text-sm text-[#635c4e]">Flexible paperback binding, perfect for novels</p>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setData('binding_type', 'Hard Binding')}
                                                        className={`p-6 border-2 rounded-xl transition-all duration-200 text-left ${data.binding_type === 'Hard Binding'
                                                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg'
                                                            : 'border-[#d8d1c1] hover:border-purple-300'
                                                            }`}
                                                    >
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                                <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                            </div>
                                                            {data.binding_type === 'Hard Binding' && (
                                                                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <h3 className="font-bold text-[#17150f] mb-1">Hard Binding</h3>
                                                        <p className="text-sm text-[#635c4e]">Durable hardcover binding, premium quality</p>
                                                    </button>
                                                </div>
                                                <InputError message={errors.binding_type} className="mt-2" />
                                            </div>

                                            <div className="border-t border-[#d8d1c1]"></div>

                                            {/* Interior Layout - USER HAS BOTH OPTIONS */}
                                            <div>
                                                <label className="block text-lg font-bold text-[#17150f] mb-4">
                                                    Interior Layout Method
                                                </label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Option 1: Automatic Writing Tool (USER ONLY) */}
                                                    <div
                                                        onClick={() => setData('interior_layout_method', 'automatic_tool')}
                                                        className={`cursor-pointer border-2 rounded-2xl p-6 transition-all ${data.interior_layout_method === 'automatic_tool'
                                                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg'
                                                            : 'border-[#d8d1c1] hover:border-purple-300'
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="p-3 bg-yellow-100 rounded-xl">
                                                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                                </svg>
                                                            </div>
                                                            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">RECOMMENDED</span>
                                                        </div>
                                                        <h3 className="font-bold text-[#17150f] text-lg mb-2">Smart Writer Studio 👻</h3>
                                                        <p className="text-sm text-[#635c4e] mb-6">Write directly in our browser editor. We handle formatting automatically.</p>
                                                        <button
                                                            type="button"
                                                            onClick={handleLaunchSmartStudio}
                                                            className="block w-full text-center py-3 bg-gradient-to-r from-purple-600 to-[#6a222d] text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                                                        >
                                                            Launch Smart Writer Studio
                                                        </button>
                                                    </div>

                                                    {/* Option 2: Upload Template (USER HAS THIS TOO) */}
                                                    <div
                                                        className={`border-2 rounded-2xl p-6 transition-all ${(data.interior_layout_method === 'upload' || data.interior_layout_method === 'upload_template')
                                                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg'
                                                            : 'border-[#d8d1c1] hover:border-purple-300'
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="p-3 bg-blue-100 rounded-xl">
                                                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                        <h3 className="font-bold text-[#17150f] text-lg mb-2">Upload Formatted File</h3>
                                                        <p className="text-sm text-[#635c4e] mb-3">Have a Word doc ready? Upload it here.</p>

                                                        {/* Book Size Requirement Notice */}
                                                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                                            <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                                                                <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                                Required Document Size: <span className="text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">{data.book_size || '6x9'} inches</span>
                                                            </p>
                                                            <p className="text-[11px] text-amber-600 mt-1 ml-5.5">
                                                                Your uploaded file's page dimensions must match the selected book size. Mismatched sizes will be rejected.
                                                            </p>
                                                        </div>

                                                        <div className="flex gap-3 mb-4">
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowTemplateModal(true)}
                                                                className="flex-1 py-3 bg-white border-2 border-[#cdc5b1] rounded-xl text-sm font-semibold text-[#4b443a] hover:border-purple-400 transition-all"
                                                            >
                                                                Browse Templates
                                                            </button>
                                                            <label className="flex-1 cursor-pointer py-3 bg-gradient-to-r from-purple-600 to-[#6a222d] text-white font-semibold rounded-xl hover:shadow-lg transition-all text-center">
                                                                Upload File
                                                                <input
                                                                    type="file"
                                                                    className="hidden"
                                                                    accept=".doc,.docx"
                                                                    onChange={handleFileUpload}
                                                                />
                                                            </label>
                                                        </div>

                                                        {/* Inline Error Display for File Upload */}
                                                        {errors.interior_file && (
                                                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-pulse">
                                                                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                <div className="text-sm text-red-600">
                                                                    <span className="font-bold block mb-1">Upload Failed</span>
                                                                    {errors.interior_file}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {data.interior_file && !errors.interior_file && (
                                                            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800 flex items-center justify-between">
                                                                <div className="flex items-center truncate">
                                                                    <svg className="w-5 h-5 mr-2 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                    <span className="font-semibold truncate">New: {data.interior_file.name}</span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setData('interior_file', null)} // Just clear local state for NEW file
                                                                    className="ml-2 text-red-500 hover:text-red-700"
                                                                    title="Remove selection"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                </button>
                                                            </div>
                                                        )}

                                                        {!data.interior_file && book.interior_file && (
                                                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 flex items-center justify-between group">
                                                                <div className="flex items-center overflow-hidden flex-1 min-w-0 mr-2">
                                                                    <svg className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    <div className="truncate">
                                                                        <span className="font-semibold block truncate">Current File Uploaded</span>
                                                                        <span className="text-xs text-blue-600/70 truncate block">{book.interior_file.split('/').pop()}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                                    <a
                                                                        href={book.interior_file.startsWith('http') ? book.interior_file : `/storage/${book.interior_file}`}
                                                                        target="_blank"
                                                                        className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-bold transition-colors"
                                                                    >
                                                                        View
                                                                    </a>
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleFileRemove}
                                                                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                        title="Delete File"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <InputError message={errors.interior_layout_method} className="mt-2" />
                                                <InputError message={errors.interior_file} className="mt-2" />
                                            </div>

                                            <div className="border-t border-[#d8d1c1]"></div>

                                            {/* Online Formatting Tool - Separate Feature */}
                                            <div>
                                                <label className="block text-lg font-bold text-[#17150f] mb-4">
                                                    Online Formatting Tool
                                                </label>
                                                <div className={`relative rounded-2xl p-8 overflow-hidden border-2 transition-all duration-300 ${(book.interior_file || data.interior_file)
                                                    ? 'bg-[#efe9db] border-[#cdc5b1]'
                                                    : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'
                                                    }`}>
                                                    {/* Decorative background */}
                                                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>

                                                    {/* ═══ LOCK OVERLAY — shown when a file is uploaded ═══ */}
                                                    {(book.interior_file || data.interior_file) && (
                                                        <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 rounded-2xl">
                                                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                                                                <svg className="w-8 h-8 text-[#635c4e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                </svg>
                                                            </div>
                                                            <h4 className="text-lg font-bold text-[#241f16] mb-2 text-center">Formatting Tool Locked</h4>
                                                            <p className="text-sm text-[#635c4e] text-center max-w-sm mb-4">
                                                                You have already uploaded a manuscript file. To use the Online Formatting Tool, please remove your uploaded file first from the <strong>Upload Formatted File</strong> section above.
                                                            </p>
                                                            <div className="flex items-center gap-2 text-xs text-[#7c7364]">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                Only one method can be active at a time
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className={`relative z-10 ${(book.interior_file || data.interior_file) ? 'opacity-30 pointer-events-none select-none' : ''}`}>
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-center">
                                                                <div className="p-3 bg-purple-500 rounded-xl mr-4">
                                                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-xl font-bold text-[#17150f]">Professional Formatting Tool</h3>
                                                                    <p className="text-sm text-[#635c4e] mt-1">Format your manuscript with our advanced online editor</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <p className="text-[#4b443a] mb-6 leading-relaxed">
                                                            Use our powerful browser-based formatting tool to create professionally formatted manuscripts. Features include automatic page numbering, chapter formatting, table of contents generation, and more.
                                                        </p>

                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                                            <div className="bg-white p-3 rounded-lg text-center">
                                                                <div className="text-purple-600 font-bold text-sm">Auto Format</div>
                                                                <div className="text-xs text-[#635c4e] mt-1">Smart styling</div>
                                                            </div>
                                                            <div className="bg-white p-3 rounded-lg text-center">
                                                                <div className="text-purple-600 font-bold text-sm">Templates</div>
                                                                <div className="text-xs text-[#635c4e] mt-1">Pre-designed</div>
                                                            </div>
                                                            <div className="bg-white p-3 rounded-lg text-center">
                                                                <div className="text-purple-600 font-bold text-sm">Export PDF</div>
                                                                <div className="text-xs text-[#635c4e] mt-1">Print-ready</div>
                                                            </div>
                                                            <div className="bg-white p-3 rounded-lg text-center">
                                                                <div className="text-purple-600 font-bold text-sm">Cloud Save</div>
                                                                <div className="text-xs text-[#635c4e] mt-1">Auto-save</div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col gap-3">
                                                            <button
                                                                type="button"
                                                                disabled={!!(book.interior_file || data.interior_file)}
                                                                onClick={() => {
                                                                    router.post(route('books.update', book.id) + '?redirect_to=' + encodeURIComponent(route('books.format', book.id)), {
                                                                        ...data,
                                                                        _method: 'POST',
                                                                        interior_layout_method: 'formatting_tool'
                                                                    });
                                                                }}
                                                                className="block w-full text-center py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
                                                            >
                                                                Start Formatting
                                                            </button>

                                                            <div className="relative flex py-2 items-center">
                                                                <div className="flex-grow border-t border-purple-200"></div>
                                                                <span className="flex-shrink-0 mx-4 text-xs font-bold text-purple-400 uppercase tracking-widest">OR</span>
                                                                <div className="flex-grow border-t border-purple-200"></div>
                                                            </div>

                                                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                                                <div className="flex justify-between items-center mb-3">
                                                                    <span className="text-xs font-bold text-[#635c4e] uppercase tracking-wider">Struggling with formatting?</span>
                                                                    <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">₹1999</span>
                                                                </div>
                                                                <Link
                                                                    href={route('professional.payment', { book: book.id }) + '?service=formatting'}
                                                                    className="w-full py-2 bg-white border border-purple-200 text-purple-700 font-bold rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors flex items-center justify-center gap-2 text-sm"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                                                    Hire a Professional
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border-t border-[#d8d1c1]"></div>

                                            {/* Cover Design - USER HAS BOTH OPTIONS */}
                                            <div>
                                                <label className="block text-lg font-bold text-[#17150f] mb-4">
                                                    Cover Design
                                                </label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Option 1: Professional Cover Creator (USER ONLY) */}
                                                    <div className="relative group bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-8 hover:shadow-2xl transition-all">
                                                        <div className="absolute top-4 right-4">
                                                            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Recommended</span>
                                                        </div>
                                                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                                            </svg>
                                                        </div>
                                                        <h3 className="text-xl font-bold text-[#17150f] mb-3">Professional Cover Creator</h3>
                                                        <p className="text-[#635c4e] text-sm mb-4">Design stunning covers with our advanced studio. Unlimited stock images, professional typography, ready-made layouts.</p>

                                                        <button
                                                            type="button"
                                                            onClick={() => saveAndNavigate('books.cover-creator')}
                                                            className="block w-full text-center py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all mb-4"
                                                        >
                                                            Launch Creative Studio
                                                        </button>

                                                        <div className="bg-white/50 p-4 rounded-xl border border-indigo-100">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Struggling?</span>
                                                                <span className="text-xs font-bold text-indigo-700">₹499</span>
                                                            </div>
                                                            <Link
                                                                href={route('professional.payment', { book: book.id }) + '?service=cover'}
                                                                className="w-full py-2 bg-white border border-indigo-200 text-indigo-700 font-bold rounded-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 text-sm"
                                                            >
                                                                Hire a Professional
                                                            </Link>
                                                        </div>
                                                    </div>

                                                    {/* Option 2: Upload Custom Cover (USER HAS THIS TOO) */}
                                                    <div className="border-2 border-[#d8d1c1] rounded-2xl p-6 hover:border-purple-300 transition-all flex flex-col h-full">
                                                        <h3 className="font-bold text-[#17150f] text-lg mb-4">Upload Custom Cover</h3>

                                                        {/* Image Preview Area */}
                                                        {(data.cover_design_path || book.cover_design_path) ? (
                                                            <div className="mb-4 relative group rounded-xl overflow-hidden border border-[#d8d1c1] shadow-sm bg-[#faf8f3]">
                                                                <div className="aspect-[2/3] w-32 mx-auto sm:w-full sm:max-w-[200px] relative">
                                                                    <img
                                                                        src={data.cover_design_path instanceof File
                                                                            ? URL.createObjectURL(data.cover_design_path)
                                                                            : (book.cover_design_path?.startsWith('http') ? book.cover_design_path : `/storage/${book.cover_design_path}?t=${new Date(book.updated_at).getTime()}`)}
                                                                        alt="Cover Preview"
                                                                        className="w-full h-full object-cover object-right"
                                                                    />
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setData('cover_design_path', null)}
                                                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    title="Remove/Change"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        ) : null}

                                                        <div className={`border-2 border-dashed border-[#cdc5b1] rounded-xl p-6 text-center hover:bg-[#faf8f3] transition-colors relative cursor-pointer flex-1 flex flex-col justify-center items-center ${data.cover_design_path ? 'border-green-400 bg-green-50/10' : ''}`}>
                                                            <svg className={`mx-auto h-12 w-12 mb-4 ${data.cover_design_path ? 'text-green-500' : 'text-[#7c7364]'}`} fill="none" stroke="currentColor" viewBox="0 0 48 48">
                                                                {data.cover_design_path ? (
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                ) : (
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
                                                                )}
                                                            </svg>
                                                            <p className="text-sm text-[#635c4e] mb-2">
                                                                <span className="font-semibold text-purple-600">{data.cover_design_path ? 'Change file' : 'Upload a file'}</span> or drag and drop
                                                            </p>
                                                            <p className="text-xs text-[#635c4e] font-bold mb-1">Recommended Size: 755 x 1144 px</p>
                                                            <p className="text-[10px] text-[#7c7364]">PNG, JPG up to 10MB</p>
                                                            <input
                                                                type="file"
                                                                accept=".jpg,.jpeg,.png"
                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                onChange={(e) => {
                                                                    const file = e.target.files[0];
                                                                    if (file) {
                                                                        const img = new Image();
                                                                        const objectUrl = URL.createObjectURL(file);
                                                                        img.onload = () => {
                                                                            URL.revokeObjectURL(objectUrl);
                                                                            if (img.width !== 755 || img.height !== 1144) {
                                                                                alert(`Error: Cover image must be exactly 755 x 1144 pixels.\n\nYour image: ${img.width} x ${img.height} pixels.`);
                                                                                e.target.value = ''; // Reset input
                                                                                return;
                                                                            }
                                                                            // Valid
                                                                            setData('cover_design_path', file);
                                                                        };
                                                                        img.onerror = () => {
                                                                            URL.revokeObjectURL(objectUrl);
                                                                            alert("Invalid image file.");
                                                                        };
                                                                        img.src = objectUrl;
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        {data.cover_design_path instanceof File && (
                                                            <div className="mt-3 text-xs text-center text-green-600 font-medium truncate">
                                                                Selected: {data.cover_design_path.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <InputError message={errors.cover_design_path} className="mt-2" />
                                            </div>

                                            {/* Submit Button */}
                                            <div className="pt-6 flex gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => submit('back')}
                                                    disabled={processing}
                                                    className="w-1/3 flex items-center justify-center px-6 py-4 bg-white border-2 border-[#d8d1c1] text-[#4b443a] text-lg font-bold rounded-xl shadow-sm hover:border-violet-300 hover:bg-violet-50 transition-all duration-200 disabled:opacity-50"
                                                >
                                                    ← Back
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => submit('next')}
                                                    disabled={processing}
                                                    className="flex-1 flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-[#6a222d] text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {processing ? (
                                                        <>
                                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Save & Continue
                                                            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                            </svg>
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                        </form>
                                    </div>
                                    {/* Card Footer / Help */}
                                    <div className="px-8 py-4 bg-[#faf8f3] border-t border-[#e7e1d4] text-center">
                                        <p className="text-sm text-[#635c4e]">
                                            Need help deciding? <a href="#" className="text-violet-600 hover:text-violet-700 font-semibold hover:underline">View Sizing Guide</a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Smart Template Library Modal */}
            {
                showTemplateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowTemplateModal(false)}>
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>

                            {/* Modal Header */}
                            <div className="p-8 border-b border-[#e7e1d4] flex justify-between items-center bg-gradient-to-r from-purple-50 to-blue-50">
                                <div>
                                    <h3 className="text-3xl font-black text-[#17150f] tracking-tight">Template Library</h3>
                                    <p className="text-purple-600 font-bold flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 bg-purple-100 rounded text-xs">SIZE: {data.book_size}</span>
                                        Formatting optimized for your selection 📏
                                    </p>
                                </div>
                                <button onClick={() => setShowTemplateModal(false)} className="p-2 hover:bg-white rounded-full transition-colors text-[#7c7364] hover:text-[#17150f] shadow-sm">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Error Message Display */}
                            {templateError && (
                                <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 animate-pulse">
                                    <div className="text-red-500 mt-1">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h5 className="text-red-900 font-black text-sm uppercase tracking-wider">Download Failed</h5>
                                        <p className="text-red-700 text-xs font-bold leading-relaxed mt-1">
                                            {templateError}
                                        </p>
                                    </div>
                                    <button onClick={() => setTemplateError(null)} className="ml-auto text-red-400 hover:text-red-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            {/* Modal Body */}
                            <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#faf8f3]/50">
                                {(data.book_size === '16.5x11'
                                    ? [
                                        { name: 'Magazine Template', folder: 'Magazine Template', icon: '📰', color: 'from-stone-600 to-stone-800', border: 'border-stone-300' }
                                    ]
                                    : [
                                        { name: 'Horror Style', folder: 'Horror Book Template', icon: '🧛', color: 'from-[#5a1e27] to-red-950', border: 'border-red-900/20' },
                                        { name: 'Kavithai Style', folder: 'Kavithai', icon: '✍️', color: 'from-amber-500 to-orange-600', border: 'border-amber-200' },
                                        { name: 'Standard Book', folder: 'Book', icon: '📖', color: 'from-[#6a222d] to-indigo-700', border: 'border-blue-200' },
                                        { name: 'Bordered Style', folder: 'Book with border', icon: '🖼️', color: 'from-emerald-500 to-teal-600', border: 'border-emerald-200' },
                                    ]
                                ).map((style) => (
                                    <div key={style.folder} className={`group relative bg-white rounded-2xl border ${style.border} p-1 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
                                        <div className="p-6">
                                            <div className="flex items-center gap-5 mb-6">
                                                <div className="w-16 h-16 rounded-2xl bg-[#faf8f3] flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                                                    {style.icon}
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-bold text-[#17150f]">{style.name}</h4>
                                                    <p className="text-sm text-[#635c4e] font-medium">Professional Layout</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3 mb-6">
                                                <div className="flex items-center gap-2 text-xs font-bold text-[#7c7364] uppercase tracking-widest">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                    Includes margins & bleed
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-[#7c7364] uppercase tracking-widest">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                    Auto-page numbering
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleDownload(style.folder, data.book_size)}
                                                className={`block w-full text-center py-4 rounded-xl font-black text-white shadow-lg bg-gradient-to-r ${style.color} transform active:scale-95 transition-all`}
                                            >
                                                Download {data.book_size} .DOCX
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-[#e7e1d4] bg-white flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-xs text-[#635c4e] font-medium leading-relaxed">
                                    <span className="text-[#17150f] font-bold">Pro Tip:</span> After downloading, simply replace the placeholder text with your content. All margins, fonts, and headers are already perfectly set for a <span className="text-purple-600 font-bold">{data.book_size}</span> book.
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }

            <AiWritingModal
                show={showAiModal}
                onClose={() => setShowAiModal(false)}
            />


        </>
    );
}
