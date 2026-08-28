import { Head, useForm, Link, router } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Details({ auth, book }) {
    // Helper to parse existing address
    const parseExistingAddress = (fullAddress) => {
        if (!fullAddress) return { street: '', city: '', state: '', zip: '', phone: '' };

        const lines = fullAddress.split('\n');
        // If only 1 line, assume it's just street (legacy)
        if (lines.length === 1) return { street: lines[0], city: '', state: '', zip: '', phone: '' };

        const street = lines[0];
        let city = '', state = '', zip = '', phone = '';

        // Try to parse Line 2: "City, State - Zip"
        if (lines[1]) {
            const parts = lines[1].split('-');
            if (parts.length > 1) {
                zip = parts[1].trim();
                const cityState = parts[0].split(',');
                if (cityState.length > 0) city = cityState[0].trim();
                if (cityState.length > 1) state = cityState[1].trim();
            } else {
                // Fallback if no hyphen
                city = lines[1];
            }
        }

        // Try to parse Line 3: "Phone: 123123123"
        if (lines[2]) {
            phone = lines[2].replace('Phone:', '').trim();
        }

        return { street, city, state, zip, phone };
    };

    const existingAddr = parseExistingAddress(book.author_address);

    const { data, setData, post, processing, errors, transform } = useForm({
        author_biography: book.author_biography || '',
        about_book: book.about_book || '',
        num_pages: book.num_pages || '',
        printing_cost: book.printing_cost || 0,
        author_cost: book.author_cost || 0,
        selling_price: book.selling_price || '',
        international_selling_price: book.international_selling_price || 0,
        // Address Components (New)
        street_address: existingAddr.street,
        city: existingAddr.city,
        state: existingAddr.state,
        pincode: existingAddr.zip,
        phone_contact: existingAddr.phone,
        author_copies: book.author_copies || 0, // Default to 0 (optional)
        // Checkboxes state
        agreed_terms: book.agreed_terms || false,
        confirmed_content: book.confirmed_content || false,
    });

    const [authorCopiesError, setAuthorCopiesError] = useState('');
    const [isMounted, setIsMounted] = useState(false);
    const [hasPreviewed, setHasPreviewed] = useState(book.status === 'published'); // Allow skip if already published

    // Address validation errors
    const [addressErrors, setAddressErrors] = useState({});

    // Indian States & Union Territories
    const indianStates = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
        'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
        'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
        'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
        'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
        'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
        'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
    ];

    // Validate address fields
    const validateAddress = () => {
        const errs = {};
        const wantsCopies = parseInt(data.author_copies || 0) >= 5;
        if (!wantsCopies) return true; // No validation needed if not ordering copies

        if (!data.street_address || data.street_address.trim().length < 10) {
            errs.street_address = 'Please enter a complete street address (at least 10 characters)';
        }
        if (!data.city || data.city.trim().length < 2 || !/^[a-zA-Z\s]+$/.test(data.city.trim())) {
            errs.city = 'Please enter a valid city name (letters only)';
        }
        if (!data.state) {
            errs.state = 'Please select a state';
        }
        if (!data.pincode || !/^\d{6}$/.test(data.pincode)) {
            errs.pincode = 'Pincode must be exactly 6 digits';
        }
        if (!data.phone_contact || !/^[6-9]\d{9}$/.test(data.phone_contact)) {
            errs.phone_contact = 'Enter a valid 10-digit Indian mobile number';
        }

        setAddressErrors(errs);
        return Object.keys(errs).length === 0;
    };

    useEffect(() => {
        setIsMounted(true);

        // Check if returned from preview
        const params = new URLSearchParams(window.location.search);
        if (params.get('previewed')) {
            setHasPreviewed(true);
            // Scroll to declaration section after a short delay to ensure render
            setTimeout(() => {
                document.getElementById('final-declaration')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);

            // Clean URL (Standard Technique)
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }
    }, []);

    // =====================================================
    // COMPREHENSIVE PRICING MATRIX
    // Based on: Book Size, Printing Type, Paper Type, Binding Type
    // =====================================================
    const getPricingData = (bookSize, printingType, paperType, bindingType) => {
        // Normalize inputs
        const size = (bookSize || '5.5x8.5').replace(/\s/g, '');
        const printing = (printingType || 'B/W').toLowerCase().includes('color') ? 'Color' : 'B/W';
        const paper = (paperType || 'White Paper').toLowerCase();
        const binding = (bindingType || 'Soft Binding').toLowerCase().includes('hard') ? 'Hard' : 'Soft';

        // Pricing data structure: { bindingCost, perPageCost }
        const pricingMatrix = {
            '5x8': {
                'B/W': {
                    'white paper': { Soft: { binding: 50, perPage: 1 }, Hard: { binding: 200, perPage: 1 } },
                    'bond paper': { Soft: { binding: 50, perPage: 1 }, Hard: { binding: 200, perPage: 1 } },
                    'art paper': { Soft: { binding: 50, perPage: 1.5 }, Hard: { binding: 200, perPage: 1.5 } },
                },
                'Color': {
                    'white paper': { Soft: { binding: 50, perPage: 6 }, Hard: { binding: 200, perPage: 6 } },
                    'bond paper': { Soft: { binding: 50, perPage: 6 }, Hard: { binding: 200, perPage: 6 } },
                    'art paper': { Soft: { binding: 50, perPage: 5 }, Hard: { binding: 200, perPage: 5 } },
                },
            },
            '6x9': {
                'B/W': {
                    'white paper': { Soft: { binding: 50, perPage: 1 }, Hard: { binding: 200, perPage: 1 } },
                    'bond paper': { Soft: { binding: 50, perPage: 1.2 }, Hard: { binding: 200, perPage: 1.2 } },
                    'art paper': { Soft: { binding: 50, perPage: 1.75 }, Hard: { binding: 200, perPage: 1.75 } },
                },
                'Color': {
                    'white paper': { Soft: { binding: 50, perPage: 6 }, Hard: { binding: 200, perPage: 6 } },
                    'bond paper': { Soft: { binding: 50, perPage: 6 }, Hard: { binding: 200, perPage: 6 } },
                    'art paper': { Soft: { binding: 50, perPage: 5 }, Hard: { binding: 200, perPage: 5 } },
                },
            },
            '5.5x8.5': {
                'B/W': {
                    'white paper': { Soft: { binding: 50, perPage: 1 }, Hard: { binding: 200, perPage: 1 } },
                    'bond paper': { Soft: { binding: 50, perPage: 1.2 }, Hard: { binding: 200, perPage: 1.2 } },
                    'art paper': { Soft: { binding: 50, perPage: 1.75 }, Hard: { binding: 200, perPage: 1.75 } },
                },
                'Color': {
                    'white paper': { Soft: { binding: 50, perPage: 6 }, Hard: { binding: 200, perPage: 6 } },
                    'bond paper': { Soft: { binding: 50, perPage: 6 }, Hard: { binding: 200, perPage: 6 } },
                    'art paper': { Soft: { binding: 50, perPage: 5 }, Hard: { binding: 200, perPage: 5 } },
                },
            },
            '8.5x8.5': {
                'B/W': {
                    'white paper': { Soft: { binding: 80, perPage: 1.5 }, Hard: { binding: 300, perPage: 1.5 } },
                    'bond paper': { Soft: { binding: 80, perPage: 1.8 }, Hard: { binding: 300, perPage: 1.8 } },
                    'art paper': { Soft: { binding: 80, perPage: 2.5 }, Hard: { binding: 300, perPage: 2.5 } },
                },
                'Color': {
                    'white paper': { Soft: { binding: 80, perPage: 12 }, Hard: { binding: 300, perPage: 12 } },
                    'bond paper': { Soft: { binding: 80, perPage: 12 }, Hard: { binding: 300, perPage: 12 } },
                    'art paper': { Soft: { binding: 80, perPage: 10 }, Hard: { binding: 300, perPage: 10 } },
                },
            },
            '8.5x11': {
                'B/W': {
                    'white paper': { Soft: { binding: 80, perPage: 1.5 }, Hard: { binding: 300, perPage: 1.5 } },
                    'bond paper': { Soft: { binding: 80, perPage: 1.8 }, Hard: { binding: 300, perPage: 1.8 } },
                    'art paper': { Soft: { binding: 80, perPage: 2.5 }, Hard: { binding: 300, perPage: 2.5 } },
                },
                'Color': {
                    'white paper': { Soft: { binding: 80, perPage: 12 }, Hard: { binding: 300, perPage: 12 } },
                    'bond paper': { Soft: { binding: 80, perPage: 12 }, Hard: { binding: 300, perPage: 12 } },
                    'art paper': { Soft: { binding: 80, perPage: 10 }, Hard: { binding: 300, perPage: 10 } },
                },
            },
            '16.5x11': {
                'B/W': {
                    'white paper': { Soft: { binding: 120, perPage: 3 }, Hard: { binding: 500, perPage: 3 } },
                    'bond paper': { Soft: { binding: 120, perPage: 3.5 }, Hard: { binding: 500, perPage: 3.5 } },
                    'art paper': { Soft: { binding: 120, perPage: 4 }, Hard: { binding: 500, perPage: 4 } },
                },
                'Color': {
                    'white paper': { Soft: { binding: 120, perPage: 24 }, Hard: { binding: 500, perPage: 24 } },
                    'bond paper': { Soft: { binding: 120, perPage: 24 }, Hard: { binding: 500, perPage: 24 } },
                    'art paper': { Soft: { binding: 120, perPage: 20 }, Hard: { binding: 500, perPage: 20 } },
                },
            },
        };

        // Get pricing or fallback to default (5.5x8.5 B/W White Soft)
        const sizeData = pricingMatrix[size] || pricingMatrix['5.5x8.5'];
        const printingData = sizeData[printing] || sizeData['B/W'];
        const paperData = printingData[paper] || printingData['white paper'];
        const bindingData = paperData[binding] || paperData['Soft'];

        return bindingData;
    };

    // Calculate derived values directly - NO setData calls that would reset form!
    const numPages = parseFloat(data.num_pages) || 0;

    // Get pricing based on book's design settings
    const pricingData = getPricingData(book.book_size, book.printing_color, book.paper_type, book.binding_type);
    const printingCost = numPages > 0 ? (numPages * pricingData.perPage) + pricingData.binding : 0;
    const authorCost = printingCost > 0 ? printingCost * 1.4 : 0;
    const sellingPrice = parseFloat(data.selling_price) || 0;
    const calculatedRoyalty = Math.max(0, sellingPrice - authorCost);

    // Amazon/Google royalty calculation - 70% of YOUR royalty
    const amazonRoyalty = Math.max(0, calculatedRoyalty * 0.70);
    const googleRoyalty = Math.max(0, calculatedRoyalty * 0.70);

    // Validate author copies - show error when value is 1-4
    useEffect(() => {
        const copies = parseInt(data.author_copies) || 0;
        if (copies === 0 || copies >= 5) {
            setAuthorCopiesError('');
        } else {
            setAuthorCopiesError('Enter 0 (no purchase) or minimum 5 copies');
        }
    }, [data.author_copies]);

    // Check if author copies is valid (0 or >= 5)
    const isAuthorCopiesValid = () => {
        const copies = parseInt(data.author_copies) || 0;
        return copies === 0 || copies >= 5;
    };

    const submit = (action = 'next') => {
        // Use transform to add calculated values to the data before sending
        const wantsCopies = parseInt(data.author_copies || 0) >= 5;
        transform((formData) => ({
            ...formData,
            printing_cost: printingCost.toFixed(2),
            author_cost: authorCost.toFixed(2),
            // Combine address components into the single DB column — only if ordering copies
            author_address: wantsCopies
                ? `${formData.street_address}\n${formData.city}, ${formData.state} - ${formData.pincode}\nPhone: ${formData.phone_contact}`.trim()
                : null
        }));

        post(route('books.update_details', book.id) + (action === 'back' ? '?action=back' : ''), {
            preserveScroll: true,
        });
    };

    const saveAndPreview = () => {
        // Validate address before saving
        if (!validateAddress()) {
            document.getElementById('dispatch-address-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        const wantsCopies = parseInt(data.author_copies || 0) >= 5;
        transform((formData) => ({
            ...formData,
            printing_cost: printingCost.toFixed(2),
            author_cost: authorCost.toFixed(2),
            author_address: wantsCopies
                ? `${formData.street_address}\n${formData.city}, ${formData.state} - ${formData.pincode}\nPhone: ${formData.phone_contact}`.trim()
                : null,
            save_only: true
        }));

        post(route('books.update_details', book.id), {
            preserveScroll: true,
            onSuccess: () => {
                router.visit(route('books.preview', book.id));
            }
        });
    };



    // Helper to get correct cover URL (handles relative/absolute paths)
    const getCoverUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http') || path.startsWith('//')) {
            return `${path}?t=${new Date().getTime()}`;
        }

        // Remove leading slash if present to standardize
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;

        // If it starts with 'storage/', just use it. Otherwise prepend 'storage/'
        const storagePath = cleanPath.startsWith('storage/') ? cleanPath : `storage/${cleanPath}`;

        return `/${storagePath}?t=${new Date().getTime()}`;
    };

    return (
        <>
            <Head title="Book Details - Step 3" />

            <div className="min-h-screen relative overflow-hidden">

                {/* Split Background - Dark Left, Light Right Gradient */}
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
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${step === 3
                                                        ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/50'
                                                        : step < 3
                                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                            : 'bg-white/10 text-white/50 border border-white/20'
                                                        }`}>
                                                        {step < 3 ? (
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                                        ) : step}
                                                    </div>
                                                    {step < 4 && <div className={`w-4 h-0.5 ml-2 rounded ${step < 3 ? 'bg-emerald-500/50' : 'bg-white/10'}`}></div>}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-violet-500/30 rounded-lg text-violet-200 text-sm font-bold border border-violet-500/30">Step 3: Details</span>
                                        </div>
                                    </div>

                                    <h1 className="text-4xl text-[#f2ecdd] mb-4 leading-tight" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
                                        Finalize & <br />
                                        <em className="text-[#e8cf8e]">Monetize</em>
                                    </h1>
                                    <p className="text-lg text-[#f2ecdd]/85 mb-8 leading-relaxed">
                                        Set your pricing, royalties, and distribution details. You retain full control over your book's earnings.
                                    </p>

                                    {/* Features List */}
                                    <div className="space-y-4">
                                        {[
                                            { icon: '💰', text: 'Real-time Royalty Calculator' },
                                            { icon: '🌍', text: 'Global Distribution Setup' },
                                            { icon: '📈', text: 'Control Your Selling Price' }
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
                                            <Link
                                                href={route('books.design', book.id)}
                                                className="p-2 -ml-2 text-[#7c7364] hover:text-[#635c4e] hover:bg-[#efe9db] rounded-full transition-colors"
                                                title="Go Back"
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </Link>
                                            <div>
                                                <h2 className="text-xl font-bold text-[#17150f]">Details & Pricing</h2>
                                                <p className="text-[#635c4e] text-sm mt-1">Final details to publish your book</p>
                                            </div>
                                        </div>
                                        <div className="hidden sm:block">
                                            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Content Wrapper */}
                                    <div className="p-8 lg:p-10">
                                        {/* Admin Feedback Alert */}
                                        {book.status === 'draft' && book.admin_feedback && (
                                            <div className="mb-8 p-6 rounded-2xl bg-red-500/10 border border-red-500/30 animate-pulse">
                                                <div className="flex items-start gap-4">
                                                    <div className="mt-1">
                                                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-red-400 mb-1">Revision Requested</h3>
                                                        <p className="text-red-200/80 text-sm mb-3">
                                                            Our review team has requested changes. Please review the feedback below and make the necessary updates.
                                                        </p>
                                                        <div className="bg-red-900/20 p-3 rounded-lg border border-red-500/20">
                                                            <p className="text-red-100 text-sm">{book.admin_feedback}</p>
                                                        </div>
                                                        <p className="text-red-300 text-xs mt-3 font-semibold">
                                                            After making changes, resubmit your book for review.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <form className="space-y-10" onSubmit={(e) => {
                                            e.preventDefault();
                                            if (!hasPreviewed) {
                                                alert("Please preview your book first.");
                                                return;
                                            }
                                            if (!data.agreed_terms || !data.confirmed_content) {
                                                alert("Please accept the terms and content confirmation.");
                                                return;
                                            }

                                            // STRICT VALIDATION: Check Selling Price
                                            if (parseFloat(data.selling_price || 0) < parseFloat(authorCost.toFixed(2))) {
                                                alert(`Selling price cannot be less than Author Cost (₹${authorCost.toFixed(2)})`);
                                                return;
                                            }

                                            // Validate address if ordering author copies
                                            if (!validateAddress()) {
                                                document.getElementById('dispatch-address-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                return;
                                            }

                                            // Apply transformation to ensure calculated values and address are saved
                                            const wantsCopiesFinal = parseInt(data.author_copies || 0) >= 5;
                                            transform((formData) => ({
                                                ...formData,
                                                printing_cost: printingCost.toFixed(2),
                                                author_cost: authorCost.toFixed(2),
                                                author_address: wantsCopiesFinal
                                                    ? `${formData.street_address}\n${formData.city}, ${formData.state} - ${formData.pincode}\nPhone: ${formData.phone_contact}`.trim()
                                                    : null,
                                                save_only: true // Prevent redirect to review page
                                            }));

                                            post(route('books.update_details', book.id), {
                                                preserveScroll: true,
                                                onSuccess: () => {
                                                    // UNIFIED FLOW: Always go to Author Copies Checkout (which handles Fee + Copies)
                                                    window.location.href = route('payment.author_copies', {
                                                        book_id: book.id,
                                                        copies: data.author_copies || 0 // Default to 0 instead of forcing 5 minimum
                                                    });
                                                }
                                            });
                                        }}>

                                            {/* Book Metadata */}
                                            <div>
                                                <h3 className="text-xl font-bold text-[#17150f] mb-6 flex items-center">
                                                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    Book Metadata
                                                </h3>

                                                {/* Number of Pages */}
                                                <div className="mb-6">
                                                    <label className="block text-sm font-semibold text-[#4b443a] mb-2">
                                                        Number of Pages *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="\d*"
                                                        className="w-full px-4 py-3 border-2 border-[#d8d1c1] focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl transition-all duration-200 font-medium text-[#17150f]"
                                                        placeholder="e.g. 250"
                                                        value={data.num_pages}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/\D/g, '');
                                                            setData('num_pages', val);
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        required
                                                    />
                                                    <p className="text-xs text-[#635c4e] mt-1">Total number of pages in your book</p>
                                                    <InputError message={errors.num_pages} className="mt-2" />
                                                </div>

                                                {/* Author Biography */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-[#4b443a] mb-2">
                                                        Author Biography
                                                    </label>
                                                    <textarea
                                                        className="w-full px-4 py-3 border-2 border-[#d8d1c1] focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl transition-all duration-200"
                                                        rows="4"
                                                        placeholder="Tell readers about yourself..."
                                                        value={data.author_biography}
                                                        onChange={(e) => setData('author_biography', e.target.value)}
                                                        required
                                                    />
                                                    <InputError message={errors.author_biography} className="mt-2" />
                                                </div>

                                                {/* About the Book */}
                                                <div className="mt-6">
                                                    <label className="block text-sm font-semibold text-[#4b443a] mb-2">
                                                        About the Book (Description)
                                                    </label>
                                                    <textarea
                                                        className="w-full px-4 py-3 border-2 border-[#d8d1c1] focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl transition-all duration-200"
                                                        rows="5"
                                                        placeholder="Write a compelling description for your book..."
                                                        value={data.about_book}
                                                        onChange={(e) => setData('about_book', e.target.value)}
                                                        required
                                                    />
                                                    <InputError message={errors.about_book} className="mt-2" />
                                                </div>
                                            </div>

                                            <div className="border-t border-[#d8d1c1]"></div>

                                            {/* Pricing Strategy */}
                                            <div>
                                                <h3 className="text-xl font-bold text-[#17150f] mb-6 flex items-center">
                                                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    Pricing Strategy
                                                </h3>

                                                {/* Book Configuration Summary */}
                                                <div className="bg-[#faf8f3] p-4 rounded-xl border border-[#d8d1c1] mb-6">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="text-sm font-bold text-[#635c4e] uppercase tracking-wide">Your Book Configuration</h4>
                                                        <Link href={route('books.design', book.id)} className="text-xs text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                            Edit Design
                                                        </Link>
                                                    </div>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                        <div className="bg-white p-3 rounded-lg border border-[#e7e1d4]">
                                                            <div className="text-[10px] font-bold text-[#7c7364] uppercase tracking-wider">Book Size</div>
                                                            <div className="text-sm font-bold text-[#241f16] mt-1">{book.book_size || '5.5x8.5'}"</div>
                                                        </div>
                                                        <div className="bg-white p-3 rounded-lg border border-[#e7e1d4]">
                                                            <div className="text-[10px] font-bold text-[#7c7364] uppercase tracking-wider">Printing</div>
                                                            <div className="text-sm font-bold text-[#241f16] mt-1">{book.printing_color || 'B/W'}</div>
                                                        </div>
                                                        <div className="bg-white p-3 rounded-lg border border-[#e7e1d4]">
                                                            <div className="text-[10px] font-bold text-[#7c7364] uppercase tracking-wider">Paper Type</div>
                                                            <div className="text-sm font-bold text-[#241f16] mt-1">{book.paper_type || 'White Paper'}</div>
                                                        </div>
                                                        <div className="bg-white p-3 rounded-lg border border-[#e7e1d4]">
                                                            <div className="text-[10px] font-bold text-[#7c7364] uppercase tracking-wider">Binding</div>
                                                            <div className="text-sm font-bold text-[#241f16] mt-1">{book.binding_type || 'Soft Binding'}</div>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-[#635c4e] mt-3 flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        Pricing is calculated based on the above settings. Page cost: ₹{pricingData.perPage}/page, Binding: ₹{pricingData.binding}
                                                    </p>
                                                </div>

                                                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl border-2 border-blue-100">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                                        {/* Printing Cost - Auto-calculated, Read-only */}
                                                        <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-[#d8d1c1]">
                                                            <label className="block text-xs font-bold text-[#635c4e] uppercase tracking-wide mb-2">
                                                                Printing Cost (Per Copy)
                                                            </label>
                                                            <div className="text-3xl font-black text-[#17150f]">
                                                                ₹{printingCost.toFixed(2)}
                                                            </div>
                                                        </div>

                                                        {/* Author Cost - Auto-calculated, Read-only */}
                                                        <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-blue-200 hover:border-blue-400 transition-colors">
                                                            <label className="block text-xs font-bold text-[#635c4e] uppercase tracking-wide mb-2">
                                                                Author Cost (Minimum Price)
                                                            </label>
                                                            <div className="text-3xl font-black text-blue-600">
                                                                ₹{authorCost.toFixed(2)}
                                                            </div>
                                                        </div>

                                                        {/* Selling Price - User Input */}
                                                        <div className={`bg-white p-6 rounded-xl shadow-sm border-2 transition-all duration-200 ${parseFloat(data.selling_price || 0) < authorCost
                                                            ? 'border-red-300 ring-2 ring-red-100'
                                                            : 'border-purple-200 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-200'
                                                            }`}>
                                                            <label className="block text-xs font-bold text-[#635c4e] uppercase tracking-wide mb-2">
                                                                Selling Price (INR) *
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min={authorCost.toFixed(2)}
                                                                step="0.01"
                                                                className="w-full text-2xl font-bold text-[#17150f] border-none p-0 focus:ring-0 placeholder-gray-300"
                                                                placeholder="0.00"
                                                                value={data.selling_price}
                                                                onChange={(e) => setData('selling_price', e.target.value)}
                                                                onWheel={(e) => e.target.blur()}
                                                                required
                                                            />
                                                            <div className="h-px bg-gray-200 w-full my-2"></div>
                                                            <p className={`text-xs font-medium ${parseFloat(data.selling_price || 0) < authorCost ? 'text-red-500' : 'text-[#635c4e]'
                                                                }`}>
                                                                Must be ≥ ₹{authorCost.toFixed(2)}
                                                            </p>
                                                            <InputError message={errors.selling_price} className="mt-2" />
                                                        </div>
                                                    </div>

                                                    {/* Royalties Breakdown */}
                                                    <div className="space-y-4">
                                                        {/* Total Royalty Banner */}
                                                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg transform transition-all hover:scale-[1.01]">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <h4 className="text-lg font-bold opacity-90">Your Royalty Per Book</h4>
                                                                    <p className="text-sm opacity-75">Selling Price - Author Cost = Royalty</p>
                                                                </div>
                                                                <div className="text-4xl font-black">
                                                                    ₹{calculatedRoyalty.toFixed(0)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Platform Royalties Grid */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {/* Amazon Royalty */}
                                                            <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-sm flex items-center justify-between">
                                                                <div>
                                                                    <div className="flex items-center space-x-2 mb-1">
                                                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                                                        <h5 className="font-bold text-[#17150f]">Amazon Royalty</h5>
                                                                    </div>
                                                                    <p className="text-xs text-[#635c4e]">Price × 70% royalty</p>
                                                                </div>
                                                                <div className="text-2xl font-bold text-orange-600">
                                                                    ₹{amazonRoyalty.toFixed(2)}
                                                                </div>
                                                            </div>

                                                            {/* Google Play Royalty */}
                                                            <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm flex items-center justify-between">
                                                                <div>
                                                                    <div className="flex items-center space-x-2 mb-1">
                                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                        <h5 className="font-bold text-[#17150f]">Google Play Royalty</h5>
                                                                    </div>
                                                                    <p className="text-xs text-[#635c4e]">Price × 70% royalty</p>
                                                                </div>
                                                                <div className="text-2xl font-bold text-blue-600">
                                                                    ₹{googleRoyalty.toFixed(2)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-8">
                                                        <label className="block text-sm font-semibold text-[#4b443a] mb-2">
                                                            International Selling Price (USD) <span className="text-[#7c7364] font-normal">(Optional)</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            className="w-full md:w-1/3 px-4 py-3 border-2 border-[#d8d1c1] focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl transition-all duration-200"
                                                            placeholder="e.g. 14.99"
                                                            value={data.international_price}
                                                            onChange={(e) => setData('international_price', e.target.value)}
                                                        />
                                                        <InputError message={errors.international_price} className="mt-2" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border-t border-[#d8d1c1]"></div>

                                            {/* Author Copies */}
                                            <div>
                                                <h3 className="text-xl font-bold text-[#17150f] mb-6 flex items-center">
                                                    <div className="p-2 bg-orange-100 rounded-lg mr-3">
                                                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                        </svg>
                                                    </div>
                                                    Author Copies
                                                </h3>
                                                <div className="bg-orange-50 rounded-2xl p-8 border border-orange-100">
                                                    <p className="text-[#635c4e] mb-6">
                                                        <span className="font-bold text-[#241f16]">Optional:</span> Purchase your own books at <span className="font-bold text-orange-700">author cost</span>. If you choose to buy, minimum order is 5 copies.
                                                    </p>

                                                    <div className="flex flex-col md:flex-row gap-8 items-start">
                                                        <div className="w-full md:w-1/3">
                                                            <label className="block text-sm font-bold text-[#4b443a] mb-2">
                                                                Number of Copies <span className="text-[#7c7364] font-normal">(Optional)</span>
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="1"
                                                                placeholder="0"
                                                                className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${authorCopiesError
                                                                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                                                    : 'border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                                                                    }`}
                                                                value={data.author_copies}
                                                                onChange={(e) => setData('author_copies', e.target.value)}
                                                            />
                                                            <p className="text-xs text-[#635c4e] mt-1">Enter 0 (no purchase) or 5+ copies.</p>
                                                            {authorCopiesError && (
                                                                <p className="text-xs text-red-500 mt-1 font-medium">{authorCopiesError}</p>
                                                            )}
                                                            <InputError message={errors.author_copies} className="mt-2" />
                                                        </div>

                                                        <div className="w-full md:w-2/3 bg-white p-6 rounded-xl border border-orange-100 shadow-sm flex flex-col md:flex-row items-center justify-between">
                                                            <div>
                                                                <h4 className="text-sm font-bold text-[#635c4e] uppercase tracking-wide">Total Cost for Author Copies</h4>
                                                                <div className="text-4xl font-black text-orange-600 mt-2">
                                                                    ₹{((parseInt(data.author_copies || 0) >= 0 ? parseInt(data.author_copies || 0) : 0) * authorCost).toFixed(2)}
                                                                </div>
                                                                <p className="text-sm text-[#635c4e] mt-1">
                                                                    {data.author_copies || 0} copies × ₹{authorCost.toFixed(2)}
                                                                </p>
                                                            </div>
                                                            <div className="mt-4 md:mt-0">
                                                                {authorCost <= 0 ? (
                                                                    <p className="text-sm text-red-500 font-medium">⚠️ Enter number of pages first</p>
                                                                ) : parseInt(data.author_copies || 0) >= 5 ? (
                                                                    <div className="text-right">
                                                                        <p className="text-sm text-emerald-600 font-bold flex items-center justify-end">
                                                                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                                            Added to Order
                                                                        </p>
                                                                        <p className="text-xs text-[#635c4e]">Proceed to bottom to pay</p>
                                                                    </div>
                                                                ) : parseInt(data.author_copies || 0) > 0 && parseInt(data.author_copies || 0) < 5 ? (
                                                                    <p className="text-sm text-red-500 font-medium">Enter at least 5 copies to order</p>
                                                                ) : (
                                                                    <p className="text-sm text-[#7c7364]">Enter quantity to order (Min 5)</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Dispatch Address - Only shown when ordering author copies */}
                                            {parseInt(data.author_copies || 0) >= 5 && (
                                                <div id="dispatch-address-section">
                                                    <h3 className="text-xl font-bold text-[#17150f] mb-6 flex items-center">
                                                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                        </div>
                                                        Dispatch Address
                                                    </h3>
                                                    <p className="text-sm text-[#635c4e] mb-4">Where should we send your author copies?</p>

                                                    <div className="bg-[#faf8f3] border border-[#d8d1c1] rounded-xl p-6">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            {/* Street / Flat */}
                                                            <div className="md:col-span-2">
                                                                <label className="block text-xs font-bold text-[#4b443a] uppercase tracking-wide mb-2">
                                                                    Street Address / Flat No. <span className="text-red-500">*</span>
                                                                </label>
                                                                <textarea
                                                                    className={`w-full px-4 py-3 border focus:ring-2 focus:ring-purple-200 rounded-lg transition-all ${addressErrors.street_address ? 'border-red-400 focus:border-red-500' : 'border-[#cdc5b1] focus:border-purple-500'
                                                                        }`}
                                                                    rows="2"
                                                                    placeholder="House No, Building Name, Street Area, Landmark..."
                                                                    value={data.street_address}
                                                                    onChange={(e) => {
                                                                        setData('street_address', e.target.value);
                                                                        if (addressErrors.street_address) setAddressErrors(prev => ({ ...prev, street_address: '' }));
                                                                    }}
                                                                    required
                                                                />
                                                                {addressErrors.street_address && (
                                                                    <p className="text-xs text-red-500 mt-1 font-medium">{addressErrors.street_address}</p>
                                                                )}
                                                            </div>

                                                            {/* City */}
                                                            <div>
                                                                <label className="block text-xs font-bold text-[#4b443a] uppercase tracking-wide mb-2">
                                                                    City <span className="text-red-500">*</span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className={`w-full px-4 py-3 border focus:ring-2 focus:ring-purple-200 rounded-lg ${addressErrors.city ? 'border-red-400 focus:border-red-500' : 'border-[#cdc5b1] focus:border-purple-500'
                                                                        }`}
                                                                    placeholder="e.g. Mumbai"
                                                                    value={data.city}
                                                                    onChange={(e) => {
                                                                        // Allow only letters and spaces
                                                                        const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                                                        setData('city', val);
                                                                        if (addressErrors.city) setAddressErrors(prev => ({ ...prev, city: '' }));
                                                                    }}
                                                                    required
                                                                />
                                                                {addressErrors.city && (
                                                                    <p className="text-xs text-red-500 mt-1 font-medium">{addressErrors.city}</p>
                                                                )}
                                                            </div>

                                                            {/* State */}
                                                            <div>
                                                                <label className="block text-xs font-bold text-[#4b443a] uppercase tracking-wide mb-2">
                                                                    State <span className="text-red-500">*</span>
                                                                </label>
                                                                <select
                                                                    className={`w-full px-4 py-3 border focus:ring-2 focus:ring-purple-200 rounded-lg appearance-none bg-white ${addressErrors.state ? 'border-red-400 focus:border-red-500' : 'border-[#cdc5b1] focus:border-purple-500'
                                                                        }`}
                                                                    value={data.state}
                                                                    onChange={(e) => {
                                                                        setData('state', e.target.value);
                                                                        if (addressErrors.state) setAddressErrors(prev => ({ ...prev, state: '' }));
                                                                    }}
                                                                    required
                                                                >
                                                                    <option value="">Select State</option>
                                                                    {indianStates.map(s => (
                                                                        <option key={s} value={s}>{s}</option>
                                                                    ))}
                                                                </select>
                                                                {addressErrors.state && (
                                                                    <p className="text-xs text-red-500 mt-1 font-medium">{addressErrors.state}</p>
                                                                )}
                                                            </div>

                                                            {/* Pincode */}
                                                            <div>
                                                                <label className="block text-xs font-bold text-[#4b443a] uppercase tracking-wide mb-2">
                                                                    Pincode / Zip <span className="text-red-500">*</span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    inputMode="numeric"
                                                                    maxLength="6"
                                                                    className={`w-full px-4 py-3 border focus:ring-2 focus:ring-purple-200 rounded-lg ${addressErrors.pincode ? 'border-red-400 focus:border-red-500' : 'border-[#cdc5b1] focus:border-purple-500'
                                                                        }`}
                                                                    placeholder="e.g. 400001"
                                                                    value={data.pincode}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value.replace(/\D/g, ''); // Numbers only
                                                                        setData('pincode', val);
                                                                        if (addressErrors.pincode) setAddressErrors(prev => ({ ...prev, pincode: '' }));
                                                                    }}
                                                                    required
                                                                />
                                                                {data.pincode && data.pincode.length > 0 && data.pincode.length < 6 && (
                                                                    <p className="text-xs text-amber-600 mt-1 font-medium">Pincode must be 6 digits ({6 - data.pincode.length} more)</p>
                                                                )}
                                                                {addressErrors.pincode && (
                                                                    <p className="text-xs text-red-500 mt-1 font-medium">{addressErrors.pincode}</p>
                                                                )}
                                                            </div>

                                                            {/* Phone Number */}
                                                            <div>
                                                                <label className="block text-xs font-bold text-[#4b443a] uppercase tracking-wide mb-2">
                                                                    Contact Number <span className="text-red-500">*</span>
                                                                </label>
                                                                <div className="relative">
                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#635c4e] font-medium">+91</span>
                                                                    <input
                                                                        type="tel"
                                                                        inputMode="numeric"
                                                                        maxLength="10"
                                                                        className={`w-full pl-12 pr-4 py-3 border focus:ring-2 focus:ring-purple-200 rounded-lg ${addressErrors.phone_contact ? 'border-red-400 focus:border-red-500' : 'border-[#cdc5b1] focus:border-purple-500'
                                                                            }`}
                                                                        placeholder="9876543210"
                                                                        value={data.phone_contact}
                                                                        onChange={(e) => {
                                                                            const val = e.target.value.replace(/\D/g, '');
                                                                            setData('phone_contact', val);
                                                                            if (addressErrors.phone_contact) setAddressErrors(prev => ({ ...prev, phone_contact: '' }));
                                                                        }}
                                                                        required
                                                                    />
                                                                </div>
                                                                {data.phone_contact && data.phone_contact.length > 0 && data.phone_contact.length < 10 && (
                                                                    <p className="text-xs text-amber-600 mt-1 font-medium">{10 - data.phone_contact.length} more digits needed</p>
                                                                )}
                                                                {data.phone_contact && data.phone_contact.length === 10 && !/^[6-9]/.test(data.phone_contact) && (
                                                                    <p className="text-xs text-red-500 mt-1 font-medium">Indian mobile numbers start with 6, 7, 8, or 9</p>
                                                                )}
                                                                {addressErrors.phone_contact && (
                                                                    <p className="text-xs text-red-500 mt-1 font-medium">{addressErrors.phone_contact}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-[#7c7364] mt-4 flex items-center">
                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                            Your address is encrypted and only used for shipping.
                                                        </p>
                                                        <InputError message={errors.author_address} className="mt-2" />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="border-t border-[#d8d1c1]"></div>

                                            {/* Final Confirmations */}
                                            {/* Final Confirmations */}
                                            <div id="final-declaration" className="bg-[#faf8f3] p-6 rounded-2xl border border-[#d8d1c1]">
                                                <h4 className="font-bold text-[#17150f] mb-4">Final Declaration & Approval</h4>
                                                <div className="space-y-4">
                                                    <label className="flex items-start gap-3 cursor-pointer group">
                                                        <div className="relative flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={data.agreed_terms}
                                                                onChange={(e) => setData('agreed_terms', e.target.checked)}
                                                                className="w-5 h-5 text-indigo-600 rounded border-[#cdc5b1] focus:ring-indigo-500 cursor-pointer"
                                                            />
                                                        </div>
                                                        <span className="text-sm text-[#4b443a] font-medium group-hover:text-[#17150f] transition-colors">
                                                            I agree to the policy, terms and condition.
                                                        </span>
                                                    </label>

                                                    <label className="flex items-start gap-3 cursor-pointer group">
                                                        <div className="relative flex items-center pt-0.5">
                                                            <input
                                                                type="checkbox"
                                                                checked={data.confirmed_content}
                                                                onChange={(e) => setData('confirmed_content', e.target.checked)}
                                                                className="w-5 h-5 text-indigo-600 rounded border-[#cdc5b1] focus:ring-indigo-500 cursor-pointer"
                                                            />
                                                        </div>
                                                        <span className="text-sm text-[#4b443a] font-medium leading-relaxed group-hover:text-[#17150f] transition-colors">
                                                            I confirm that any content created using AI Studio has been fully reviewed, edited, and approved by me. I take full responsibility for the originality, accuracy, and compliance of the final content.
                                                        </span>
                                                    </label>
                                                </div>

                                                <div className="mt-5 p-4 bg-blue-50 text-blue-900 text-xs font-semibold rounded-xl border border-blue-100 flex items-start gap-3">
                                                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    To maintain publishing quality, content that does not meet PublicationMart’s guidelines may be subject to additional review before publication.
                                                </div>
                                            </div>

                                            <div className="pt-6 flex items-center justify-between border-t gap-4">
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => submit('back')}
                                                        className="flex items-center text-[#635c4e] hover:text-[#17150f] font-semibold transition-colors"
                                                    >
                                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                        </svg>
                                                        Back
                                                    </button>

                                                    {/* PREVIEW BUTTON */}
                                                    {/* PREVIEW BUTTON (Restored Modal Trigger) */}
                                                    <button
                                                        type="button"
                                                        onClick={saveAndPreview}
                                                        className="flex items-center px-6 py-3 bg-indigo-50 text-indigo-600 font-bold rounded-xl border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 transition-all shadow-sm"
                                                    >
                                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        Preview Book
                                                    </button>
                                                </div>

                                                {/* Submit Button Logic */}
                                                <div className="flex flex-col items-end">
                                                    <button
                                                        type="submit"
                                                        className={`px-6 py-3 text-white font-bold rounded-xl shadow-lg transition-all items-center flex gap-2 ${(!hasPreviewed || !data.agreed_terms || !data.confirmed_content) ? 'bg-gray-300 cursor-not-allowed text-[#635c4e] shadow-none' : 'bg-orange-600 hover:bg-orange-700'
                                                            }`}
                                                    >
                                                        Pay & Order Copies
                                                    </button>
                                                    {(!data.agreed_terms || !data.confirmed_content) && <p className="text-xs text-red-500 mt-1">Please confirm above first</p>}
                                                </div>

                                            </div>



                                        </form>
                                    </div>
                                    {/* Card Footer */}
                                    <div className="px-8 py-4 bg-[#faf8f3] border-t border-[#e7e1d4] text-center">
                                        <p className="text-sm text-[#635c4e]">
                                            Need help? <Link href={route('support.index')} className="text-violet-600 hover:text-violet-700 font-semibold hover:underline">Contact Support</Link>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div >
            </div >
        </>
    );
}
