import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PublishToStores from '@/Components/PublishToStores';
import { useState } from 'react';

export default function BookDetails({ auth, book }) {
    const { app_url } = usePage().props;



    const [isEditing, setIsEditing] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [uploadingInterior, setUploadingInterior] = useState(false);
    const [uploadingAudio, setUploadingAudio] = useState(false);
    const [coAuthorInput, setCoAuthorInput] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [coverViewTab, setCoverViewTab] = useState('front');

    // Co-author management
    const addCoAuthor = () => {
        if (coAuthorInput.trim() && !data.co_authors.includes(coAuthorInput.trim())) {
            setData('co_authors', [...data.co_authors, coAuthorInput.trim()]);
            setCoAuthorInput('');
        }
    };

    const removeCoAuthor = (index) => {
        const newAuthors = [...data.co_authors];
        newAuthors.splice(index, 1);
        setData('co_authors', newAuthors);
    };

    // Form for Approving
    const { post: postApprove, processing: processingApprove } = useForm();

    // Form for Updating Details
    const { data, setData, put, processing: processingUpdate, errors, reset } = useForm({
        // Step 1
        title: book.title || '',
        subtitle: book.subtitle || '',
        author_name: book.author_name || '',
        co_authors: book.co_authors || [],
        genre: book.genre || '',
        language: book.language || '',
        publication: book.publication || '',
        about_book: book.about_book || '',
        author_biography: book.author_biography || '',
        // Publishing details
        isbn: book.isbn || '',
        selling_price: book.selling_price || '',
        hardcover_price: book.hardcover_price || '',
        ebook_price: book.ebook_price || '',
        audio_price: book.audio_price || '',
        printing_cost: book.printing_cost || '',
        author_cost: book.author_cost || '',
        publication_date: book.publication_date || '',
        // Step 2
        book_size: book.book_size || '5.5x8.5',
        printing_color: book.printing_color || 'B/W',
        paper_type: book.paper_type || 'White Paper',
        binding_type: book.binding_type || 'Soft Binding',
        num_pages: book.num_pages || '',
        interior_file: null,
        cover_design_path: null,
        audio_file: null,
        // External
        amazon_link: book.amazon_link || '',
        google_books_link: book.google_books_link || '',
    });

    const approve = () => {
        if (confirm('Are you sure you want to approve this book for publication? Any changes you made in the fields below will also be saved.')) {
            // Use the main form 'data' to ensure ISBN/About Book/etc are saved during approval
            router.post(route('admin.books.approve', book.id), data, {
                onSuccess: () => setIsEditing(false),
            });
        }
    };

    const updateDetails = (e) => {
        e.preventDefault();

        // Create payload WITHOUT null file fields to prevent overwriting existing files
        const payload = { ...data, _method: 'put' };

        // Remove file fields if they're null (don't overwrite existing files)
        if (!payload.interior_file) delete payload.interior_file;
        if (!payload.cover_design_path) delete payload.cover_design_path;
        if (!payload.audio_file) delete payload.audio_file;

        router.post(route('admin.books.update', book.id), payload, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setIsEditing(false),
        });
    };

    // Quick file upload using dedicated endpoint (Modified to use router.post for correct CSRF handling)
    const handleQuickCoverUpload = (file) => {
        if (!file) return;

        // Validate Image Dimensions (755 x 1144)
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl); // Clean up memory
            if (img.width !== 755 || img.height !== 1144) {
                alert(`Cover Error: Image size must be exactly 755 x 1144 pixels.\nYour image: ${img.width} x ${img.height} pixels.`);
                setUploadingCover(false);
                return;
            }

            // Proceed with upload if valid
            console.log('=== COVER UPLOAD START with router.post ===');
            setUploadingCover(true);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('file_type', 'cover');

            router.post(route('admin.books.upload-file', book.id), formData, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    console.log('Upload successful via router');
                    setUploadingCover(false);
                },
                onError: (errors) => {
                    console.error('Upload failed via router', errors);
                    alert('Upload failed. Please check the file and try again.');
                    setUploadingCover(false);
                },
                onFinish: () => {
                    setUploadingCover(false);
                }
            });
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            alert("Invalid image file.");
        };

        img.src = objectUrl;
    };

    const handleQuickInteriorUpload = (file) => {
        if (!file) return;
        setUploadingInterior(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('file_type', 'interior');

        router.post(route('admin.books.upload-file', book.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setUploadingInterior(false),
            onError: () => {
                alert('Upload failed. Please try again.');
                setUploadingInterior(false);
            },
            onFinish: () => setUploadingInterior(false)
        });
    };

    const handleQuickAudioUpload = (file) => {
        if (!file) return;
        setUploadingAudio(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('file_type', 'audio');

        router.post(route('admin.books.upload-file', book.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setUploadingAudio(false),
            onError: () => {
                alert('Upload failed. Please try again.');
                setUploadingAudio(false);
            },
            onFinish: () => setUploadingAudio(false)
        });
    };

    return (
        <>
            <Head title={`Admin Review: ${book.title}`} />

            {/* Premium Dark Background */}
            <div className="min-h-screen bg-parchment relative overflow-hidden">
                {/* Ambient Background */}
                <div className="fixed inset-0 bg-gradient-to-br from-parchment via-vellum to-parchment" />
                <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-oxblood/5 to-foil/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-foil/10 to-oxblood/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative py-10 sm:py-14">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                        {/* Modern Breadcrumb */}
                        <div className="mb-8">
                            <Link href={route('admin.dashboard')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-paper backdrop-blur border border-linen text-sm font-bold text-ink-soft hover:text-ink hover:border-oxblood/50 transition-all group">
                                <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Dashboard
                            </Link>
                        </div>

                        {/* Flash Messages */}
                        {usePage().props.flash?.success && (
                            <div className="mb-6 p-4 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center gap-3">
                                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="font-medium">{usePage().props.flash.success}</span>
                            </div>
                        )}
                        {usePage().props.flash?.error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-100 border border-red-200 text-red-800 flex items-center gap-3">
                                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">{usePage().props.flash.error}</span>
                            </div>
                        )}

                        {/* Premium Card Container */}
                        <div className="bg-paper/80 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(23,21,15,0.12)] border border-linen overflow-hidden">
                            {/* Header with Modern Gradient */}
                            <div className="relative px-8 pt-10 pb-8 bg-gradient-to-br from-paper via-parchment to-vellum">
                                {/* Decorative Pattern */}
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #635c4e 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

                                <div className="relative flex flex-col sm:flex-row justify-between items-start gap-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-2xl bg-vellum backdrop-blur flex items-center justify-center border border-linen-deep">
                                                <svg className="w-6 h-6 text-oxblood" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-oxblood bg-oxblood/10 px-3 py-1.5 rounded-lg border border-oxblood/20">
                                                Admin Review Panel
                                            </span>
                                        </div>
                                        <h1 className="text-3xl sm:text-4xl font-black text-ink mb-2 tracking-tight">{book.title}</h1>
                                        <p className="text-lg text-ink-soft">by <span className="font-bold text-ink">{book.author_name}</span></p>
                                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                                            <span className="flex items-center gap-2 text-umber bg-vellum px-3 py-1.5 rounded-lg">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span className="font-medium text-ink-soft">{book.user?.name || 'N/A'}</span>
                                            </span>
                                            <span className="flex items-center gap-2 text-umber bg-vellum px-3 py-1.5 rounded-lg">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span className="font-medium text-ink-soft">{book.user?.email || ''}</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-3">
                                        <span className={`px-5 py-2.5 rounded-xl text-sm font-black shadow-lg ${book.status === 'approved'
                                            ? 'bg-emerald-500 text-white'
                                            : book.status === 'rejected'
                                                ? 'bg-red-500 text-white'
                                                : 'bg-amber-400 text-amber-900'
                                            }`}>
                                            {book.status === 'approved' && (
                                                <svg className="w-4 h-4 inline mr-1.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )}
                                            {book.status ? book.status.charAt(0).toUpperCase() + book.status.slice(1) : 'Pending Review'}
                                        </span>
                                        <span className="text-xs font-mono text-umber bg-vellum px-3 py-1.5 rounded-lg">ID: #{book.id}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="p-6 sm:p-8 bg-paper">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {/* Left Column: Files & Cover */}
                                    <div className="col-span-1 space-y-6">
                                        {/* Cover Image */}
                                        <div className="bg-paper p-4 rounded-xl border border-linen">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h3 className="font-semibold text-ink">Cover Design</h3>
                                                    <p className="text-[10px] text-umber">Rec. Size: 755 x 1144 px</p>
                                                </div>
                                                <label className={`cursor-pointer inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${uploadingCover ? 'bg-vellum text-taupe' : 'text-oxblood bg-oxblood/10 hover:bg-oxblood/20'}`}>
                                                    {uploadingCover ? (
                                                        <>
                                                            <svg className="animate-spin w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Uploading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                            </svg>
                                                            {book.cover_design_path ? 'Replace' : 'Upload'}
                                                        </>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept=".jpg,.jpeg,.png"
                                                        className="hidden"
                                                        disabled={uploadingCover}
                                                        onChange={e => handleQuickCoverUpload(e.target.files[0])}
                                                    />
                                                </label>
                                            </div>
                                            {book.cover_design_path ? (
                                                <div>
                                                    {/* Single View - Matches Book Store Logic (No Cropping) */}
                                                    <div className="rounded-xl overflow-hidden border border-linen shadow-lg bg-vellum">
                                                        <div className="aspect-[2/3] w-full relative overflow-hidden group">
                                                            <a href={`${app_url}/storage/${book.cover_design_path}`} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative">
                                                                {/* Blurred Background (Optional, kept for safety if aspect ratio varies slightly) */}
                                                                <div
                                                                    className="absolute inset-0 bg-cover bg-center blur-xl opacity-50 scale-125 saturate-150"
                                                                    style={{ backgroundImage: `url('${app_url}/storage/${book.cover_design_path}')` }}
                                                                ></div>

                                                                {/* Main Image - Cropped to Front Cover (Right Side) */}
                                                                <img
                                                                    src={`${app_url}/storage/${book.cover_design_path}`}
                                                                    alt="Cover Design"
                                                                    className="relative z-10 w-full h-full object-cover object-right shadow-2xl drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                                                                />
                                                            </a>
                                                        </div>

                                                        <div className="p-3 bg-vellum text-center border-t border-linen">
                                                            <a href={`${app_url}/storage/${book.cover_design_path}`} download className="text-sm font-bold text-oxblood hover:text-oxblood-deep transition-colors">
                                                                Download Full Spread
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-40 bg-vellum border-2 border-dashed border-linen-deep rounded-lg flex flex-col items-center justify-center text-taupe text-sm">
                                                    <svg className="w-8 h-8 mb-2 text-taupe" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span>No Cover Uploaded</span>
                                                    <span className="text-xs text-taupe mt-1">Rec. Size: 755 x 1144 px</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* AI Generated Content (Only if exists) */}
                                        {book.ai_chapters_count > 0 && (
                                            <div className="bg-paper p-4 rounded-xl border border-linen relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-gradient-to-r from-oxblood/5 to-foil/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <div className="relative z-10">
                                                    <div className="mb-3 flex items-center justify-between">
                                                        <div>
                                                            <h3 className="font-semibold text-ink">AI Manuscript</h3>
                                                            <p className="text-[10px] text-oxblood">Generated via AI Studio</p>
                                                        </div>
                                                        <span className="px-2 py-1 bg-oxblood/10 text-oxblood rounded text-[10px] font-bold">
                                                            {book.ai_chapters_count} Chapters
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <a
                                                            href={route('books.format', book.id)}
                                                            target="_blank"
                                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-oxblood hover:bg-oxblood-deep text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-oxblood/20 mb-1"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            View Content (Online Editor)
                                                        </a>
                                                        <a
                                                            href={route('ai-studio.download', { book: book.id, format: 'docx' })}
                                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-blue-500/20"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                            Download Word (DOCX)
                                                        </a>
                                                        <a
                                                            href={route('ai-studio.download', { book: book.id, format: 'pdf' })}
                                                            target="_blank"
                                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-vellum hover:bg-vellum/70 text-ink-soft hover:text-ink border border-linen rounded-lg transition-all text-xs font-semibold"
                                                        >
                                                            Download PDF Preview
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="bg-paper p-4 rounded-xl border border-linen relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <div className="relative z-10">
                                                <div className="mb-3 flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-ink">Interior Manuscript</h3>
                                                        <p className="text-[10px] text-umber mt-0.5">
                                                            Book Size: <span className="text-oxblood font-bold">{book.book_size || '6x9'}</span> •
                                                            Method: <span className={`font-bold ${(book.interior_layout_method === 'upload' || book.interior_layout_method === 'upload_template')
                                                                ? 'text-amber-700'
                                                                : book.interior_layout_method === 'formatting_tool'
                                                                    ? 'text-emerald-700'
                                                                    : 'text-taupe'
                                                                }`}>
                                                                {(book.interior_layout_method === 'upload' || book.interior_layout_method === 'upload_template') ? '📄 Uploaded File' : book.interior_layout_method === 'formatting_tool' ? '✏️ Formatting Tool' : '—'}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    {/* Status Badge */}
                                                    {(book.interior_file || book.formatting_data) ? (
                                                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                                                            Available
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-[10px] font-bold">
                                                            Not Submitted
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-3">

                                                    {/* ─── SECTION 1: User Uploaded File (ONLY if method is 'upload' or legacy 'upload_template') ─── */}
                                                    {(book.interior_layout_method === 'upload' || book.interior_layout_method === 'upload_template') && (
                                                        <div className={`rounded-lg border p-3 ${book.interior_file ? 'bg-amber-50 border-amber-200' : 'bg-vellum/50 border-linen'}`}>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                                                </svg>
                                                                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                                                                    User Uploaded File
                                                                </span>
                                                                {book.interior_file ? (
                                                                    <span className="ml-auto px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[9px] font-bold">
                                                                        Available
                                                                    </span>
                                                                ) : (
                                                                    <span className="ml-auto px-1.5 py-0.5 bg-red-100 text-red-800 rounded text-[9px] font-bold">
                                                                        Missing
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {book.interior_file ? (
                                                                <>
                                                                    <div className="flex items-center justify-between bg-amber-50 p-2.5 rounded-md border border-amber-200 mb-2">
                                                                        <div className="flex items-center overflow-hidden">
                                                                            <svg className="w-6 h-6 text-amber-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z"></path><path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"></path></svg>
                                                                            <span className="text-[11px] text-ink-soft truncate">{book.interior_file.split('/').pop()}</span>
                                                                        </div>
                                                                        <a href={`${app_url}/storage/${book.interior_file}`} download className="text-oxblood hover:text-oxblood-deep ml-2 flex-shrink-0">
                                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                                                        </a>
                                                                    </div>
                                                                    <a
                                                                        href={`${app_url}/storage/${book.interior_file}`}
                                                                        download
                                                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-amber-500/20"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                                        Download Uploaded Manuscript
                                                                    </a>
                                                                </>
                                                            ) : (
                                                                <p className="text-[11px] text-taupe italic px-1">User selected upload but file is missing.</p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* ─── SECTION 2: Online Formatting Tool (ONLY if method is formatting_tool) ─── */}
                                                    {book.interior_layout_method === 'formatting_tool' && (
                                                        <div className={`rounded-lg border p-3 ${book.formatting_data ? 'bg-emerald-50 border-emerald-200' : 'bg-vellum/50 border-linen'}`}>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                                                </svg>
                                                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                                                                    Online Formatting Tool
                                                                </span>
                                                                {book.formatting_data ? (
                                                                    <span className="ml-auto px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">
                                                                        Available
                                                                    </span>
                                                                ) : (
                                                                    <span className="ml-auto px-1.5 py-0.5 bg-red-100 text-red-800 rounded text-[9px] font-bold">
                                                                        Missing
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {book.formatting_data ? (
                                                                <div className="flex flex-col gap-2">
                                                                    {/* PDF Download - Closest match to online preview */}
                                                                    <a
                                                                        href={route('admin.books.download-manuscript', book.id) + '?format=pdf'}
                                                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-rose-500/20"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                                                        Download PDF (Exact Preview)
                                                                    </a>
                                                                    {/* DOCX Download - For editing */}
                                                                    <a
                                                                        href={route('admin.books.download-manuscript', book.id)}
                                                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-emerald-500/20"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                                        Download Word (DOCX)
                                                                    </a>
                                                                    <a
                                                                        href={route('books.format', book.id)}
                                                                        target="_blank"
                                                                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-vellum hover:bg-vellum/70 text-ink-soft hover:text-ink border border-linen rounded-lg transition-all text-xs font-semibold"
                                                                    >
                                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                        </svg>
                                                                        View in Online Editor
                                                                    </a>
                                                                </div>
                                                            ) : (
                                                                <p className="text-[11px] text-taupe italic px-1">User selected formatting tool but content is missing.</p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* ─── SECTION 3: Admin Quick Upload (Replace) — Always visible ─── */}
                                                    <div className="rounded-lg border border-linen bg-vellum/50 p-3">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <svg className="w-4 h-4 text-oxblood" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                            </svg>
                                                            <span className="text-xs font-bold uppercase tracking-wider text-oxblood">
                                                                Admin Quick Upload
                                                            </span>
                                                        </div>
                                                        <label className={`cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-linen-deep hover:border-oxblood/50 rounded-lg transition-all text-xs font-semibold text-umber hover:text-ink ${uploadingInterior ? 'opacity-50' : ''}`}>
                                                            {uploadingInterior ? (
                                                                <>
                                                                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                    Uploading...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                                                    Admin Quick Upload (Replace)
                                                                </>
                                                            )}
                                                            <input
                                                                type="file"
                                                                accept=".doc,.docx,.pdf"
                                                                className="hidden"
                                                                disabled={uploadingInterior}
                                                                onChange={e => handleQuickInteriorUpload(e.target.files[0])}
                                                            />
                                                        </label>
                                                    </div>

                                                    {/* Empty State — no method selected */}
                                                    {!book.interior_layout_method && (
                                                        <div className="h-16 bg-vellum/50 border-2 border-dashed border-linen-deep rounded-lg flex items-center justify-center text-taupe text-sm">
                                                            <span>No manuscript submitted by user</span>
                                                        </div>
                                                    )}

                                                </div>
                                            </div>
                                        </div>

                                        {/* Audio File */}
                                        <div className="bg-paper p-4 rounded-xl border border-linen">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-semibold text-ink">Audiobook File</h3>
                                                <label className={`cursor-pointer inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${uploadingAudio ? 'bg-vellum text-taupe' : 'text-oxblood bg-oxblood/10 hover:bg-oxblood/20'}`}>
                                                    {uploadingAudio ? (
                                                        <>
                                                            <svg className="animate-spin w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Uploading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                            </svg>
                                                            {book.audio_file ? 'Replace' : 'Upload'}
                                                        </>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept=".mp3,.wav,.m4a,.ogg,.aac"
                                                        className="hidden"
                                                        disabled={uploadingAudio}
                                                        onChange={e => handleQuickAudioUpload(e.target.files[0])}
                                                    />
                                                </label>
                                            </div>
                                            {book.audio_file ? (
                                                <div className="space-y-2">
                                                    <div className="flex items-center bg-vellum p-3 rounded-lg border border-linen">
                                                        <svg className="w-8 h-8 text-oxblood mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.21-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-sm text-ink-soft truncate flex-1">{book.audio_file.split('/').pop()}</span>
                                                        <a href={`${app_url}/storage/${book.audio_file}`} download className="text-oxblood hover:text-oxblood-deep ml-2">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                                        </a>
                                                    </div>
                                                    <audio controls className="w-full" src={`${app_url}/storage/${book.audio_file}`}>
                                                        Your browser does not support the audio element.
                                                    </audio>
                                                </div>
                                            ) : (
                                                <div className="h-16 bg-vellum/50 border-2 border-dashed border-linen-deep rounded-lg flex items-center justify-center text-taupe text-sm">
                                                    <span>No audiobook uploaded</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Column: Metadata */}
                                    <div className="col-span-1 md:col-span-2 space-y-8">

                                        {/* 1. Basic Info (Editable) */}
                                        <div>
                                            <div className="flex justify-between items-center border-b border-linen-deep pb-2 mb-4">
                                                <h3 className="text-lg font-bold text-ink">Book Metadata</h3>
                                                <SecondaryButton onClick={() => setIsEditing(!isEditing)} size="sm">
                                                    {isEditing ? 'Cancel Editing' : 'Edit Details'}
                                                </SecondaryButton>
                                            </div>

                                            {/* Approval Validation Warning */}
                                            {book.status !== 'approved' && (!book.selling_price || !book.cover_design_path) && (
                                                <div className="mb-6 p-5 rounded-xl border-l-4 border-amber-400" style={{ background: 'linear-gradient(to right, rgba(251, 191, 36, 0.1), rgba(251, 191, 36, 0.05))' }}>
                                                    <div className="flex items-start space-x-4">
                                                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-bold text-amber-800">Publishing Requirements Missing</h4>
                                                            <p className="text-sm text-amber-700 mt-1">
                                                                Complete the following before publishing:
                                                            </p>
                                                            <div className="mt-3 space-y-2">

                                                                {(!book.selling_price || book.selling_price <= 0) && (
                                                                    <div className="flex items-center text-sm text-amber-800 bg-amber-50 px-3 py-2 rounded-lg">
                                                                        <svg className="w-4 h-4 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                        Set Selling Price in Edit Details
                                                                    </div>
                                                                )}
                                                                {!book.cover_design_path && (
                                                                    <div className="flex items-center text-sm text-amber-800 bg-amber-50 px-3 py-2 rounded-lg">
                                                                        <svg className="w-4 h-4 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                        </svg>
                                                                        Upload Book Cover
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {isEditing ? (
                                                <form onSubmit={updateDetails} className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                                                    {/* Step 1 Fields */}
                                                    <div>
                                                        <InputLabel htmlFor="title" value="Title" />
                                                        <TextInput id="title" className="w-full mt-1" value={data.title} onChange={e => setData('title', e.target.value)} />
                                                        {/* <InputError message={errors.title} className="mt-1" /> */}
                                                    </div>
                                                    <div>
                                                        <InputLabel htmlFor="subtitle" value="Subtitle" />
                                                        <TextInput id="subtitle" className="w-full mt-1" value={data.subtitle} onChange={e => setData('subtitle', e.target.value)} />
                                                        {/* <InputError message={errors.subtitle} className="mt-1" /> */}
                                                    </div>
                                                    <div>
                                                        <InputLabel htmlFor="author_name" value="Author Name" />
                                                        <TextInput id="author_name" className="w-full mt-1" value={data.author_name} onChange={e => setData('author_name', e.target.value)} />
                                                        {/* <InputError message={errors.author_name} className="mt-1" /> */}
                                                    </div>
                                                    <div>
                                                        <InputLabel htmlFor="genre" value="Genre" />
                                                        <TextInput id="genre" className="w-full mt-1" value={data.genre} onChange={e => setData('genre', e.target.value)} />
                                                        {/* <InputError message={errors.genre} className="mt-1" /> */}
                                                    </div>

                                                    {/* Co-Authors Section */}
                                                    <div className="col-span-2">
                                                        <InputLabel value="Co-Authors (Optional)" />
                                                        <div className="flex gap-2 mt-1">
                                                            <TextInput
                                                                className="flex-1"
                                                                value={coAuthorInput}
                                                                onChange={e => setCoAuthorInput(e.target.value)}
                                                                placeholder="Enter co-author name"
                                                                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addCoAuthor())}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={addCoAuthor}
                                                                className="px-4 py-2 bg-oxblood text-white rounded-md hover:bg-oxblood-deep transition-colors"
                                                            >
                                                                Add
                                                            </button>
                                                        </div>
                                                        {data.co_authors.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mt-3">
                                                                {data.co_authors.map((author, index) => (
                                                                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
                                                                        {author}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeCoAuthor(index)}
                                                                            className="ml-1 text-emerald-600 hover:text-red-600"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <InputLabel htmlFor="language" value="Language" />
                                                        <TextInput id="language" className="w-full mt-1" value={data.language} onChange={e => setData('language', e.target.value)} />
                                                        {/* <InputError message={errors.language} className="mt-1" /> */}
                                                    </div>
                                                    <div>
                                                        <InputLabel htmlFor="publication" value="Publication House" />
                                                        <select
                                                            id="publication"
                                                            className="mt-1 block w-full border-linen-deep focus:border-oxblood focus:ring-oxblood rounded-md shadow-sm"
                                                            value={data.publication}
                                                            onChange={e => setData('publication', e.target.value)}
                                                        >
                                                            <option value="">Select Publication House</option>
                                                            {['RK Publications', 'Redknot Publications', 'GreenInk publications', 'Leaf publications', 'Violet Publications'].map(pub => (
                                                                <option key={pub} value={pub}>{pub}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <InputLabel htmlFor="isbn" value="ISBN (13 digits)" />
                                                        <TextInput
                                                            id="isbn"
                                                            className="w-full mt-1 font-mono"
                                                            value={data.isbn}
                                                            onChange={e => {
                                                                // Only allow digits, max 13 characters
                                                                const value = e.target.value.replace(/\D/g, '').slice(0, 13);
                                                                setData('isbn', value);
                                                            }}
                                                            placeholder="Enter 13-digit ISBN"
                                                            maxLength="13"
                                                        />
                                                        <div className="flex justify-between mt-1">
                                                            {/* <InputError message={errors.isbn} /> */}
                                                            <span className={`text-xs ${data.isbn?.length === 13 ? 'text-green-700' : 'text-taupe'}`}>
                                                                {data.isbn?.length || 0}/13 digits
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <InputLabel htmlFor="selling_price" value="Selling Price (Hardcover) (INR)" />
                                                        <TextInput id="selling_price" type="number" step="0.01" className="w-full mt-1 border-oxblood/20" value={data.selling_price} onChange={e => setData('selling_price', e.target.value)} placeholder="0.00" />
                                                    </div>
                                                    <div>
                                                        <InputLabel htmlFor="ebook_price" value="E-Book Price (INR)" />
                                                        <TextInput id="ebook_price" type="number" step="0.01" className="w-full mt-1 border-oxblood/20" value={data.ebook_price} onChange={e => setData('ebook_price', e.target.value)} placeholder="0.00" />
                                                    </div>
                                                    <div>
                                                        <InputLabel htmlFor="audio_price" value="Audio Book Price (INR)" />
                                                        <TextInput id="audio_price" type="number" step="0.01" className="w-full mt-1 border-oxblood/20" value={data.audio_price} onChange={e => setData('audio_price', e.target.value)} placeholder="0.00" />
                                                    </div>
                                                    <div>
                                                        <InputLabel htmlFor="printing_cost" value="Printing Cost (INR)" />
                                                        <TextInput id="printing_cost" type="number" step="0.01" className="w-full mt-1 border-rose-200" value={data.printing_cost} onChange={e => setData('printing_cost', e.target.value)} placeholder="0.00" />
                                                    </div>
                                                    <div>
                                                        <InputLabel htmlFor="author_cost" value="Author Royalty (INR)" />
                                                        <TextInput id="author_cost" type="number" step="0.01" className="w-full mt-1 border-emerald-200" value={data.author_cost} onChange={e => setData('author_cost', e.target.value)} placeholder="0.00" />
                                                    </div>
                                                    <div>
                                                        <InputLabel htmlFor="num_pages" value="Total Number of Pages" />
                                                        <TextInput id="num_pages" type="number" className="w-full mt-1" value={data.num_pages} onChange={e => setData('num_pages', e.target.value)} placeholder="0" />
                                                    </div>
                                                    <div>
                                                        <InputLabel htmlFor="publication_date" value="Publication Date" />
                                                        <TextInput id="publication_date" type="date" className="w-full mt-1" value={data.publication_date} onChange={e => setData('publication_date', e.target.value)} />
                                                    </div>

                                                    <div className="col-span-2">
                                                        <InputLabel htmlFor="about_book" value="About the Book" />
                                                        <textarea
                                                            id="about_book"
                                                            className="w-full mt-1 border-linen-deep focus:border-oxblood focus:ring-oxblood rounded-md shadow-sm"
                                                            rows="4"
                                                            value={data.about_book}
                                                            onChange={e => setData('about_book', e.target.value)}
                                                        />
                                                        {/* <InputError message={errors.about_book} className="mt-1" /> */}
                                                    </div>

                                                    <div className="col-span-2">
                                                        <InputLabel htmlFor="author_biography" value="Author Biography" />
                                                        <textarea
                                                            id="author_biography"
                                                            className="w-full mt-1 border-linen-deep focus:border-oxblood focus:ring-oxblood rounded-md shadow-sm"
                                                            rows="4"
                                                            value={data.author_biography}
                                                            onChange={e => setData('author_biography', e.target.value)}
                                                        />
                                                        {/* <InputError message={errors.author_biography} className="mt-1" /> */}
                                                    </div>

                                                    {/* Step 2 Fields: Specs */}
                                                    <div className="col-span-2 border-t pt-4 mt-2">
                                                        <h4 className="text-sm font-bold text-ink-soft mb-3">Book Specifications</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div>
                                                                <InputLabel htmlFor="book_size" value="Book Size" />
                                                                <select
                                                                    id="book_size"
                                                                    className="mt-1 block w-full border-linen-deep focus:border-oxblood focus:ring-oxblood rounded-md shadow-sm"
                                                                    value={data.book_size}
                                                                    onChange={e => setData('book_size', e.target.value)}
                                                                >
                                                                    {['5x8', '5.5x8.5', '6x9', '8.5x8.5', '8.5x11', '16.5x11'].map(s => <option key={s} value={s}>{s}</option>)}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <InputLabel htmlFor="printing_color" value="Printing Color" />
                                                                <select
                                                                    id="printing_color"
                                                                    className="mt-1 block w-full border-linen-deep focus:border-oxblood focus:ring-oxblood rounded-md shadow-sm"
                                                                    value={data.printing_color}
                                                                    onChange={e => setData('printing_color', e.target.value)}
                                                                >
                                                                    <option value="B/W">Black & White</option>
                                                                    <option value="Color">Full Color</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <InputLabel htmlFor="paper_type" value="Paper Type" />
                                                                <select
                                                                    id="paper_type"
                                                                    className="mt-1 block w-full border-linen-deep focus:border-oxblood focus:ring-oxblood rounded-md shadow-sm"
                                                                    value={data.paper_type}
                                                                    onChange={e => setData('paper_type', e.target.value)}
                                                                >
                                                                    {['White Paper', 'Bond Paper', 'Art Paper'].map(p => <option key={p} value={p}>{p}</option>)}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <InputLabel htmlFor="binding_type" value="Binding Type" />
                                                                <select
                                                                    id="binding_type"
                                                                    className="mt-1 block w-full border-linen-deep focus:border-oxblood focus:ring-oxblood rounded-md shadow-sm"
                                                                    value={data.binding_type}
                                                                    onChange={e => setData('binding_type', e.target.value)}
                                                                >
                                                                    {['Soft Binding', 'Hard Binding', 'Perfect Bound', 'Hardcover', 'Saddle Stitch', 'Spiral Bound'].map(b => <option key={b} value={b}>{b}</option>)}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <InputLabel value="Layout Method" />
                                                                <div className="mt-2 text-sm text-ink-soft bg-vellum px-3 py-2 rounded">
                                                                    {book.interior_layout_method || 'Default'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Step 2 Fields: Files */}
                                                    <div className="col-span-2 border-t border-linen-deep pt-4 mt-2">
                                                        <h4 className="text-sm font-bold text-ink-soft mb-3">Files (Upload to Replace)</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <InputLabel htmlFor="interior_file" value="Interior Manuscript (PDF/DOCX)" />
                                                                <input
                                                                    type="file"
                                                                    id="interior_file"
                                                                    className="mt-1 block w-full text-sm text-taupe file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-oxblood/10 file:text-oxblood hover:file:bg-oxblood/20"
                                                                    onChange={e => setData('interior_file', e.target.files[0])}
                                                                />
                                                                <InputError message={errors.interior_file} className="mt-1" />
                                                            </div>
                                                            <div>
                                                                <InputLabel htmlFor="cover_design_path" value="Cover Design (Image)" />
                                                                <input
                                                                    type="file"
                                                                    id="cover_design_path"
                                                                    accept=".jpg,.jpeg,.png"
                                                                    className="mt-1 block w-full text-sm text-taupe file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-oxblood/10 file:text-oxblood hover:file:bg-oxblood/20"
                                                                    onChange={e => setData('cover_design_path', e.target.files[0])}
                                                                />
                                                                <InputError message={errors.cover_design_path} className="mt-1" />
                                                            </div>
                                                        </div>
                                                        {/* Audio File Upload */}
                                                        <div className="mt-4">
                                                            <InputLabel htmlFor="audio_file" value="Audiobook File (MP3, WAV, M4A, OGG)" />
                                                            <input
                                                                type="file"
                                                                id="audio_file"
                                                                accept=".mp3,.wav,.m4a,.ogg,.aac"
                                                                className="mt-1 block w-full text-sm text-taupe file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                                                onChange={e => setData('audio_file', e.target.files[0])}
                                                            />
                                                            <InputError message={errors.audio_file} className="mt-1" />
                                                            <p className="text-xs text-taupe mt-1">Max file size: 100MB</p>
                                                        </div>
                                                    </div>

                                                    {/* External Links */}
                                                    <div className="col-span-2 border-t border-linen-deep pt-4 mt-2">
                                                        <h4 className="text-sm font-bold text-ink-soft mb-3">Distribution Links (External)</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <InputLabel htmlFor="amazon_link" value="Amazon Link" />
                                                                <TextInput id="amazon_link" className="w-full mt-1" placeholder="https://amazon.com/dp/..." value={data.amazon_link} onChange={e => setData('amazon_link', e.target.value)} />
                                                                <InputError message={errors.amazon_link} className="mt-1" />
                                                            </div>
                                                            <div>
                                                                <InputLabel htmlFor="google_books_link" value="Google Books Link" />
                                                                <TextInput id="google_books_link" className="w-full mt-1" placeholder="https://play.google.com/..." value={data.google_books_link} onChange={e => setData('google_books_link', e.target.value)} />
                                                                <InputError message={errors.google_books_link} className="mt-1" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="col-span-2 flex justify-end gap-3 mt-4">
                                                        <SecondaryButton onClick={() => setIsEditing(false)}>Cancel</SecondaryButton>
                                                        <PrimaryButton
                                                            type="submit"
                                                            disabled={processingUpdate}
                                                            className="bg-oxblood hover:bg-oxblood-deep"
                                                        >
                                                            {processingUpdate ? 'Saving...' : 'Save Changes'}
                                                        </PrimaryButton>
                                                    </div>
                                                </form>
                                            ) : (
                                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                                                    <div>
                                                        <dt className="text-xs text-taupe uppercase tracking-wider">Title</dt>
                                                        <dd className="mt-1 text-sm font-medium text-ink">{book.title}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-xs text-taupe uppercase tracking-wider">Subtitle</dt>
                                                        <dd className="mt-1 text-sm text-ink-soft">{book.subtitle || '-'}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-xs text-taupe uppercase tracking-wider">Genre</dt>
                                                        <dd className="mt-1 text-sm text-ink-soft">{book.genre}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-xs text-taupe uppercase tracking-wider">Language</dt>
                                                        <dd className="mt-1 text-sm text-ink-soft">{book.language}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-xs text-taupe uppercase tracking-wider">Publication House</dt>
                                                        <dd className="mt-1 text-sm text-ink-soft">{book.publication || 'Not specified'}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-xs text-taupe uppercase tracking-wider">ISBN</dt>
                                                        <dd className={`mt-1 text-sm font-bold ${book.isbn ? 'text-ink' : 'text-rose-700 italic'}`}>
                                                            {book.isbn || 'Missing (Required for approval)'}
                                                        </dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-xs text-taupe uppercase tracking-wider">Selling Price</dt>
                                                        <dd className={`mt-1 text-sm font-bold ${book.selling_price > 0 ? 'text-ink' : 'text-rose-700 italic'}`}>
                                                            {book.selling_price ? `₹${book.selling_price}` : 'Not set (Required)'}
                                                        </dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-xs text-taupe uppercase tracking-wider">Publication Date</dt>
                                                        <dd className="mt-1 text-sm font-medium text-ink-soft">
                                                            {book.publication_date ? new Date(book.publication_date).toLocaleDateString() : 'Not set'}
                                                        </dd>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <dt className="text-xs text-taupe uppercase tracking-wider">About the Book</dt>
                                                        <dd className="mt-1 text-sm text-ink-soft bg-vellum p-3 rounded-lg">{book.about_book || '-'}</dd>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <dt className="text-xs text-taupe uppercase tracking-wider">Author Biography</dt>
                                                        <dd className="mt-1 text-sm text-ink-soft bg-vellum p-3 rounded-lg">{book.author_biography || '-'}</dd>
                                                    </div>
                                                </dl>
                                            )}
                                        </div>

                                        {/* 2. Specs */}
                                        <div>
                                            <h3 className="text-lg font-bold text-ink border-b border-linen-deep pb-2 mb-4">Production Specifications</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <div className="bg-vellum p-3 rounded-lg border border-linen">
                                                    <div className="text-xs text-taupe">Size</div>
                                                    <div className="font-semibold text-ink">{book.book_size || 'N/A'}</div>
                                                </div>
                                                <div className="bg-vellum p-3 rounded-lg border border-linen">
                                                    <div className="text-xs text-taupe">Color</div>
                                                    <div className="font-semibold text-ink">{book.printing_color || 'N/A'}</div>
                                                </div>
                                                <div className="bg-vellum p-3 rounded-lg border border-linen">
                                                    <div className="text-xs text-taupe">Paper</div>
                                                    <div className="font-semibold text-ink">{book.paper_type || 'N/A'}</div>
                                                </div>
                                                <div className="bg-vellum p-3 rounded-lg border border-linen">
                                                    <div className="text-xs text-taupe">Layout</div>
                                                    <div className="font-semibold text-ink capitalize">{book.interior_layout_method?.replace('_', ' ') || 'N/A'}</div>
                                                </div>
                                                <div className="bg-vellum p-3 rounded-lg border border-linen">
                                                    <div className="text-xs text-taupe">Binding</div>
                                                    <div className="font-semibold text-ink">{book.binding_type || 'Perfect Bound'}</div>
                                                </div>
                                                <div className="bg-vellum p-3 rounded-lg border border-linen">
                                                    <div className="text-xs text-taupe">Pages</div>
                                                    <div className="font-semibold text-ink">{book.num_pages || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 3. Pricing */}
                                        <div>
                                            <h3 className="text-lg font-bold text-ink border-b border-linen-deep pb-2 mb-4">Pricing & Revenue</h3>
                                            <div className="flex space-x-8">
                                                <div>
                                                    <dt className="text-xs text-taupe uppercase">Selling Price</dt>
                                                    <dd className="mt-1 text-2xl font-bold text-ink">₹{book.selling_price || '0.00'}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-xs text-taupe uppercase">Printing Cost</dt>
                                                    <dd className="mt-1 text-xl font-medium text-rose-700">- ₹{book.printing_cost || '0.00'}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-xs text-taupe uppercase">Author Royalty</dt>
                                                    <dd className="mt-1 text-2xl font-bold text-emerald-600">₹{book.author_cost || '0.00'}</dd>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 3b. Author Contact & Order Details */}
                                        <div className="bg-gradient-to-br from-paper to-vellum rounded-xl p-5 border border-linen relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-oxblood/5 rounded-full blur-3xl pointer-events-none"></div>
                                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-foil/10 rounded-full blur-2xl pointer-events-none"></div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-3 mb-5">
                                                    <div className="w-10 h-10 rounded-xl bg-oxblood/10 flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-oxblood" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-ink">Author Contact & Order Details</h3>
                                                        <p className="text-[10px] text-umber">Details submitted by the user in the order summary</p>
                                                    </div>
                                                </div>

                                                {/* ── User Account Info ── */}
                                                <div className="bg-vellum p-4 rounded-lg border border-linen mb-3">
                                                    <div className="text-[10px] font-bold text-oxblood uppercase tracking-wider mb-3">User Account</div>
                                                    <div className="flex items-center gap-4">
                                                        {/* Avatar */}
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-oxblood to-oxblood-deep flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                                                            {book.user?.name ? book.user.name.charAt(0).toUpperCase() : '?'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-bold text-ink truncate">{book.user?.name || 'Unknown User'}</div>
                                                            {book.user?.email && (
                                                                <a href={`mailto:${book.user.email}`} className="text-xs text-oxblood hover:text-oxblood-deep transition-colors truncate block">
                                                                    {book.user.email}
                                                                </a>
                                                            )}
                                                        </div>
                                                        {/* Quick Email Button */}
                                                        {book.user?.email && (
                                                            <a
                                                                href={`mailto:${book.user.email}?subject=Regarding your book "${book.title}"&body=Dear ${book.user.name || 'Author'},%0D%0A%0D%0A`}
                                                                className="flex items-center gap-1.5 px-3 py-2 bg-oxblood/10 hover:bg-oxblood/20 text-oxblood hover:text-oxblood-deep border border-oxblood/30 rounded-lg transition-all text-xs font-bold flex-shrink-0"
                                                                title="Send Email"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                </svg>
                                                                Email
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Parse the author_address into components */}
                                                {(() => {
                                                    const addr = book.author_address || '';
                                                    const lines = addr.split('\n');
                                                    const street = lines[0] || '';
                                                    let city = '', state = '', pincode = '', phone = '';
                                                    if (lines[1]) {
                                                        const parts = lines[1].split('-');
                                                        if (parts.length > 1) {
                                                            pincode = parts[1].trim();
                                                            const cityState = parts[0].split(',');
                                                            if (cityState.length > 0) city = cityState[0].trim();
                                                            if (cityState.length > 1) state = cityState[1].trim();
                                                        } else {
                                                            city = lines[1].trim();
                                                        }
                                                    }
                                                    if (lines[2]) {
                                                        phone = lines[2].replace('Phone:', '').trim();
                                                    }

                                                    const hasAddress = street || city || state || pincode || phone;

                                                    return (
                                                        <>
                                                            {/* ── Phone Contact (Prominent) ── */}
                                                            <div className={`rounded-lg border p-4 mb-3 ${phone ? 'bg-emerald-50 border-emerald-200' : 'bg-vellum border-linen'}`}>
                                                                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">Phone Contact</div>
                                                                {phone ? (
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2">
                                                                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                            </svg>
                                                                            <span className="text-lg font-bold text-ink">+91 {phone}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            {/* Call Button */}
                                                                            <a
                                                                                href={`tel:+91${phone}`}
                                                                                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 hover:text-emerald-900 border border-emerald-300 rounded-lg transition-all text-xs font-bold"
                                                                                title="Call"
                                                                            >
                                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                                </svg>
                                                                                Call
                                                                            </a>
                                                                            {/* WhatsApp Button */}
                                                                            <a
                                                                                href={`https://wa.me/91${phone}?text=Hi ${book.user?.name || 'there'}, regarding your book "${book.title}" on PublicationMart.`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="flex items-center gap-1.5 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-800 hover:text-green-900 border border-green-300 rounded-lg transition-all text-xs font-bold"
                                                                                title="WhatsApp"
                                                                            >
                                                                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                                                </svg>
                                                                                WhatsApp
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-sm text-taupe italic">No phone number provided</p>
                                                                )}
                                                            </div>

                                                            {/* ── Shipping Address ── */}
                                                            <div className={`rounded-lg border p-4 mb-3 ${hasAddress && street ? 'bg-vellum border-linen' : 'bg-vellum/60 border-linen'}`}>
                                                                <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2">Shipping Address</div>
                                                                {hasAddress && street ? (
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        {street && (
                                                                            <div className="col-span-2">
                                                                                <div className="text-[10px] text-taupe uppercase tracking-wider">Street</div>
                                                                                <div className="text-sm font-semibold text-ink mt-0.5">{street}</div>
                                                                            </div>
                                                                        )}
                                                                        {city && (
                                                                            <div>
                                                                                <div className="text-[10px] text-taupe uppercase tracking-wider">City</div>
                                                                                <div className="text-sm font-semibold text-ink mt-0.5">{city}</div>
                                                                            </div>
                                                                        )}
                                                                        {state && (
                                                                            <div>
                                                                                <div className="text-[10px] text-taupe uppercase tracking-wider">State</div>
                                                                                <div className="text-sm font-semibold text-ink mt-0.5">{state}</div>
                                                                            </div>
                                                                        )}
                                                                        {pincode && (
                                                                            <div>
                                                                                <div className="text-[10px] text-taupe uppercase tracking-wider">Pincode</div>
                                                                                <div className="text-sm font-semibold text-ink mt-0.5">{pincode}</div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-sm text-taupe italic">No address provided</p>
                                                                )}
                                                            </div>

                                                            {/* ── Author Copies ── */}
                                                            <div className={`rounded-lg border p-4 ${parseInt(book.author_copies || 0) >= 5 ? 'bg-orange-50 border-orange-200' : 'bg-vellum/60 border-linen'}`}>
                                                                <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-2">Author Copies Order</div>
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                                        </svg>
                                                                        <span className="text-sm font-semibold text-ink-soft">Copies Requested</span>
                                                                    </div>
                                                                    <span className={`text-lg font-bold ${parseInt(book.author_copies || 0) >= 5 ? 'text-orange-600' : 'text-taupe'}`}>
                                                                        {parseInt(book.author_copies || 0) >= 5
                                                                            ? `${book.author_copies} copies`
                                                                            : 'Not ordered'}
                                                                    </span>
                                                                </div>
                                                                {parseInt(book.author_copies || 0) >= 5 && (
                                                                    <div className="mt-2 text-xs text-umber bg-orange-50 p-2 rounded">
                                                                        Total Cost: <span className="font-bold text-orange-700">₹{((parseInt(book.author_copies) || 0) * parseFloat(book.author_cost || 0)).toFixed(2)}</span>
                                                                        <span className="text-taupe ml-1">({book.author_copies} × ₹{parseFloat(book.author_cost || 0).toFixed(2)} per copy)</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* ── Order Summary Pricing ── */}
                                                            <div className="rounded-lg border border-linen bg-vellum/60 p-4 mt-3">
                                                                <div className="text-[10px] font-bold text-oxblood uppercase tracking-wider mb-2">User's Order Summary</div>
                                                                <div className="grid grid-cols-3 gap-3">
                                                                    <div>
                                                                        <div className="text-[10px] text-taupe uppercase">Pages</div>
                                                                        <div className="text-sm font-bold text-ink mt-0.5">{book.num_pages || '—'}</div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-[10px] text-taupe uppercase">Selling Price</div>
                                                                        <div className="text-sm font-bold text-ink mt-0.5">{book.selling_price ? `₹${book.selling_price}` : '—'}</div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-[10px] text-taupe uppercase">Print Cost</div>
                                                                        <div className="text-sm font-bold text-rose-700 mt-0.5">{book.printing_cost ? `₹${book.printing_cost}` : '—'}</div>
                                                                    </div>
                                                                </div>
                                                                {/* Declarations */}
                                                                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-linen">
                                                                    <div className="flex items-center gap-1.5">
                                                                        {book.agreed_terms ? (
                                                                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                                                        ) : (
                                                                            <svg className="w-4 h-4 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                        )}
                                                                        <span className="text-[10px] text-umber">Terms Agreed</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5">
                                                                        {book.confirmed_content ? (
                                                                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                                                        ) : (
                                                                            <svg className="w-4 h-4 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                        )}
                                                                        <span className="text-[10px] text-umber">Content Confirmed</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>

                                        {/* 4. External Distribution Links - New Section Box */}
                                        <div className="bg-vellum/50 rounded-xl p-5 border border-linen">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-bold text-ink">External Distribution Links</h3>
                                                {!isEditing && (
                                                    <button onClick={() => setIsEditing(true)} className="text-sm text-oxblood hover:text-oxblood-deep hover:underline">
                                                        {(!book.amazon_link && !book.google_books_link) ? '+ Add Links' : 'Edit Links'}
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-vellum p-4 rounded-lg border border-linen">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-8 h-8 rounded bg-orange-100 flex items-center justify-center text-orange-600">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.9 16.5c-4 0-6.1-1.3-6.5-1.5-.2-.1-.2-.4 0-.6.2-.2.5-.2.7 0 .1.1 2.3 1.2 5.8 1.2 3.8 0 5.4-1.3 5.5-1.3.3-.2.6-.1.8.1.2.2.2.6-.1.8-.1.1-2.1 1.3-6.2 1.3zM15.4 12.3c-.3 0-.6.1-.9.4L13 14.2c-.3-.3-.5-.4-.9-.4-1 0-1.8.8-1.8 1.8 0 1 .8 1.7 1.8 1.7 1 0 1.8-.8 1.8-1.8v-.6l.9-1c.2-.2.6-.2.8.1.3.2.3.6 0 .8l-1.3 1.4c-.1.1-.3.2-.5.2v.3c0 1.2-1 2.1-2.2 2.1-1.3 0-2.3-1-2.3-2.2 0-1.3 1-2.3 2.3-2.3.6 0 1.1.2 1.5.6l1.2-1.3c.3-.4.8-.4 1.1-.3.3.1.4.5.3.8-.1.2-.2.2-.4.2zm-2.2 2.2c-.3 0-.6.1-.8.4v.9c.2.2.5.4.8.4.5 0 1-.4 1-1 0-.4-.4-.7-1-.7zM20 7h-2.1c-.8 0-1.5.3-2 .8L14 9.7l-1.9-1.9c-.5-.5-1.2-.8-2-.8H8c-1.7 0-3 1.3-3 3v2c0 1.7 1.3 3 3 3h2.1c.8 0 1.5-.3 2-.8l1.9-1.9 1.9 1.9c.5.5 1.2.8 2 .8H20c1.7 0 3-1.3 3-3v-2c0-1.7-1.3-3-3-3zM9.5 14H8c-1.1 0-2-.9-2-2s.9-2 2-2h1.5v4zm10.5 0h-1.5v-4H20c1.1 0 2 .9 2 2s-.9 2-2 2z" /></svg>
                                                        </div>
                                                        <span className="font-semibold text-ink">Amazon</span>
                                                    </div>
                                                    {book.amazon_link ? (
                                                        <a href={book.amazon_link} target="_blank" className="text-sm text-oxblood hover:underline break-all block">
                                                            {book.amazon_link}
                                                        </a>
                                                    ) : (
                                                        <span className="text-sm text-taupe italic">No link added</span>
                                                    )}
                                                </div>
                                                <div className="bg-vellum p-4 rounded-lg border border-linen">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-600">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" /></svg>
                                                        </div>
                                                        <span className="font-semibold text-ink">Google Books</span>
                                                    </div>
                                                    {book.google_books_link ? (
                                                        <a href={book.google_books_link} target="_blank" className="text-sm text-oxblood hover:underline break-all block">
                                                            {book.google_books_link}
                                                        </a>
                                                    ) : (
                                                        <span className="text-sm text-taupe italic">No link added</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 5. Quality Assurance Dashboard */}
                                        <div className="border-t border-linen-deep pt-8 mb-8">
                                            <h3 className="text-lg font-bold text-ink mb-4">Quality Assurance</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-vellum/50 p-4 rounded-lg border border-linen flex justify-between items-center">
                                                    <div>
                                                        <div className="text-xs text-taupe uppercase font-bold">Word Count Check</div>
                                                        <div className="text-sm text-ink-soft">Estimated based on page count</div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${(!book.num_pages || book.num_pages < 20) ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                                        {book.num_pages ? (book.num_pages * 250) + '~ Words' : 'Unknown'}
                                                    </span>
                                                </div>
                                                <div className="bg-vellum/50 p-4 rounded-lg border border-linen flex justify-between items-center">
                                                    <div>
                                                        <div className="text-xs text-taupe uppercase font-bold">Content Safety</div>
                                                        <div className="text-sm text-ink-soft">Plagiarism / AI Hallucination</div>
                                                    </div>
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-vellum text-ink-soft">
                                                        Manual Check Req.
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 6. Approval Actions */}
                                        <div className="border-t border-linen-deep pt-8">
                                            {book.status !== 'approved' ? (
                                                <div className="flex flex-col gap-4">
                                                    {showRejectModal ? (
                                                        <div className="bg-red-50 border border-red-200 p-6 rounded-xl animate-fade-in">
                                                            <h4 className="font-bold text-red-700 mb-2">Request Revision</h4>
                                                            <p className="text-sm text-red-800/80 mb-4">Explain what needs to be fixed. The user will be notified and the book status will change to Draft.</p>
                                                            <textarea
                                                                className="w-full bg-paper border border-red-300 rounded-lg p-3 text-ink text-sm focus:ring-red-500 focus:border-red-500"
                                                                rows="4"
                                                                placeholder="e.g., The cover image is low resolution, please upload a version with at least 300 DPI."
                                                                value={rejectionReason}
                                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                            ></textarea>
                                                            <div className="flex justify-end gap-3 mt-4">
                                                                <button
                                                                    onClick={() => setShowRejectModal(false)}
                                                                    className="px-4 py-2 text-sm text-umber hover:text-ink"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        if (!rejectionReason.trim()) return alert('Please enter a reason');
                                                                        router.post(route('admin.books.request-revision', book.id), { reason: rejectionReason }, {
                                                                            onSuccess: () => { setShowRejectModal(false); setRejectionReason(''); }
                                                                        });
                                                                    }}
                                                                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-sm"
                                                                >
                                                                    Send Request
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-4">
                                                            <PrimaryButton
                                                                className="px-8 py-3 text-lg bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/30 flex-1 justify-center"
                                                                onClick={approve}
                                                            >
                                                                Approve for Publication
                                                            </PrimaryButton>
                                                            <button
                                                                className="px-6 py-3 border border-red-300 text-red-700 rounded-md font-medium hover:bg-red-50 hover:border-red-400 transition-colors"
                                                                onClick={() => setShowRejectModal(true)}
                                                            >
                                                                Request Revision
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="bg-green-100 border border-green-200 text-green-800 px-6 py-4 rounded-md flex items-center">
                                                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                    <span className="font-bold">This book has been approved and published.</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* 5. Publish to External Stores - Only show for approved books */}
                                        {(book.status === 'approved' || book.step_completed >= 5) && (
                                            <PublishToStores book={book} />
                                        )}

                                        {/* 6. Delete Book - Admin Only */}
                                        <div className="border-t border-linen-deep pt-8 mt-8">
                                            <h3 className="text-lg font-bold text-red-700 mb-4">Danger Zone</h3>
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                                <p className="text-sm text-red-700 mb-4">
                                                    Once deleted, this book and all its files will be permanently removed. This action cannot be undone.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (confirm(`Are you sure you want to delete "${book.title}"? This will permanently remove the book and all associated files. This action cannot be undone.`)) {
                                                            router.delete(route('admin.books.destroy', book.id));
                                                        }
                                                    }}
                                                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                                                >
                                                    Delete Book Permanently
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
