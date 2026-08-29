import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Book, Library, GraduationCap, Sparkles } from 'lucide-react';


export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        excerpt: '',
        content: '',
        category: 'Fiction', // Default to first option
        image: null,
        image_url: '', // Keep backward compatibility in data structure
        author_name: auth?.user?.name || '',
        author_email: auth?.user?.email || '',
        is_presale: false,
        honeypot_trap: '', // Anti-bot trap
        captcha_num1: 0, // Send challenge to server
        captcha_num2: 0, // Send challenge to server
        captcha_answer: '', // User's answer
    });

    // Initialize Captcha
    React.useEffect(() => {
        const n1 = Math.floor(Math.random() * 10);
        const n2 = Math.floor(Math.random() * 10);
        setCaptcha({ num1: n1, num2: n2 });
        // We update form data silently so it submits with the request
        setData(d => ({ ...d, captcha_num1: n1, captcha_num2: n2 }));
    }, []);

    const [captcha, setCaptcha] = useState({ num1: 0, num2: 0 }); // Visual state
    const [captchaAnswer, setCaptchaAnswer] = useState('');

    const refreshCaptcha = () => {
        const n1 = Math.floor(Math.random() * 10);
        const n2 = Math.floor(Math.random() * 10);
        setCaptcha({ num1: n1, num2: n2 });
        setCaptchaAnswer('');
        setData(d => ({ ...d, captcha_num1: n1, captcha_num2: n2 }));
    };

    const categories = [
        { id: 'Fiction', label: 'Fiction', icon: Book, color: 'text-blue-700', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        { id: 'Non-Fiction', label: 'Non-Fiction', icon: Library, color: 'text-green-700', bg: 'bg-green-500/10', border: 'border-green-500/20' },
        { id: 'Academic', label: 'Academic', icon: GraduationCap, color: 'text-purple-700', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
        { id: 'Poetry', label: 'Poetry', icon: Sparkles, color: 'text-yellow-800', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();

        // Client-side quick check
        if (parseInt(captchaAnswer) !== captcha.num1 + captcha.num2) {
            alert('Incorrect Captcha! Please match the sum.');
            return;
        }

        post(route('blogs.store'), {
            forceFormData: true,
            // Ensure the latest answer is sent (in case state lag) - though 'data' should be current.
            // We use transform to attach the answer definitively
            onBefore: () => {
                // Double check data sync
                data.captcha_num1 = captcha.num1;
                data.captcha_num2 = captcha.num2;
            }
        });
    };

    return (
        <>
            <Head title="Create Studio Post" />


            <div className="min-h-screen bg-parchment text-ink font-sans selection:bg-purple-500 selection:text-paper pb-20 pt-32">
                <div className="pb-16 px-6 max-w-3xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8 text-center text-oxblood">
                        Create Studio Article
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6 bg-paper border border-linen p-8 rounded-3xl">

                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-umber uppercase tracking-widest ml-1">Title</label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                className="w-full bg-paper border border-linen rounded-xl px-4 py-3.5 text-ink focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition placeholder-violet-400/40"
                                placeholder="Enter catchy title..."
                            />
                            {errors.title && <div className="text-red-500 text-xs ml-1">{errors.title}</div>}
                        </div>

                        {/* Presale Option */}
                        <div className="flex items-center space-x-3 bg-paper p-4 rounded-xl border border-linen">
                            <input
                                type="checkbox"
                                id="is_presale"
                                checked={data.is_presale}
                                onChange={e => setData('is_presale', e.target.checked)}
                                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 bg-paper border-linen"
                            />
                            <label htmlFor="is_presale" className="text-sm font-medium text-ink-soft cursor-pointer select-none">
                                Is this a Presale? <span className="text-umber text-xs">(Requires Admin Approval)</span>
                            </label>
                            {errors.is_presale && <div className="text-red-500 text-xs ml-1">{errors.is_presale}</div>}
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-umber uppercase tracking-widest ml-1">Cover Image</label>
                            <input
                                type="file"
                                onChange={e => setData('image', e.target.files[0])}
                                className="w-full bg-paper border border-linen rounded-xl px-4 py-3.5 text-ink focus:outline-none focus:border-purple-500 transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-paper hover:file:bg-purple-700"
                                accept="image/*"
                            />
                            {errors.image && <div className="text-red-500 text-xs ml-1">{errors.image}</div>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Category - Visual Selection */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold text-umber uppercase tracking-widest ml-1">Book Genre <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {categories.map((cat) => {
                                        const Icon = cat.icon;
                                        const isSelected = data.category === cat.id;
                                        return (
                                            <div
                                                key={cat.id}
                                                onClick={() => setData('category', cat.id)}
                                                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-3 transition-all duration-200 ${isSelected
                                                    ? `${cat.border} ${cat.bg} ring-1 ring-offset-0 ring-offset-transparent ring-${cat.color.split('-')[1]}-500/50`
                                                    : 'border-linen bg-night hover:border-violet-600/50 hover:bg-violet-50'
                                                    }`}
                                            >
                                                <Icon className={`w-8 h-8 ${isSelected ? cat.color : 'text-umber'}`} strokeWidth={1.5} />
                                                <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-ink' : 'text-umber'}`}>
                                                    {cat.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Author Names */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-umber uppercase tracking-widest ml-1">Author Name(s) <span className="text-umber">(Max 4)</span></label>
                                <div className="space-y-3">
                                    {(data.author_name ? data.author_name.split(', ') : ['']).map((author, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={author}
                                                onChange={(e) => {
                                                    const authors = data.author_name ? data.author_name.split(', ') : [''];
                                                    authors[index] = e.target.value;
                                                    setData('author_name', authors.join(', '));
                                                }}
                                                className="w-full bg-paper border border-linen rounded-xl px-4 py-3.5 text-ink focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition placeholder-violet-400/40"
                                                placeholder={`Author ${index + 1}`}
                                            />
                                            {/* Remove Button */}
                                            {(data.author_name?.split(', ').length > 1) && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const authors = data.author_name.split(', ');
                                                        authors.splice(index, 1);
                                                        setData('author_name', authors.join(', '));
                                                    }}
                                                    className="px-4 py-2 bg-red-500/10 text-red-800 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {/* Add Button */}
                                {(data.author_name?.split(', ').length < 4) && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const authors = data.author_name ? data.author_name.split(', ') : [];
                                            authors.push('');
                                            setData('author_name', authors.join(', '));
                                        }}
                                        className="mt-2 text-xs font-bold text-purple-700 hover:text-purple-700 uppercase tracking-wider flex items-center gap-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                        Add Another Author
                                    </button>
                                )}
                                {errors.author_name && <div className="text-red-500 text-xs ml-1">{errors.author_name}</div>}
                            </div>
                        </div>

                        {/* Guest Email (Required if not logged in) */}
                        {!auth.user && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-umber uppercase tracking-widest ml-1">Your Email (For notification)</label>
                                <input
                                    type="email"
                                    value={data.author_email}
                                    onChange={e => setData('author_email', e.target.value)}
                                    className="w-full bg-paper border border-linen rounded-xl px-4 py-3.5 text-ink focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition placeholder-violet-400/40"
                                    placeholder="name@example.com"
                                />
                                {errors.author_email && <div className="text-red-500 text-xs ml-1">{errors.author_email}</div>}
                            </div>
                        )}

                        {/* Excerpt */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-umber uppercase tracking-widest ml-1">Short Excerpt (Displayed in Grid)</label>
                            <textarea
                                value={data.excerpt}
                                onChange={e => setData('excerpt', e.target.value)}
                                className="w-full bg-paper border border-linen rounded-xl px-4 py-3.5 text-ink focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition placeholder-violet-400/40 h-24"
                                placeholder="A brief summary..."
                            ></textarea>
                            {errors.excerpt && <div className="text-red-500 text-xs ml-1">{errors.excerpt}</div>}
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-umber uppercase tracking-widest ml-1">Main Content (HTML Supported)</label>
                            <textarea
                                value={data.content}
                                onChange={e => setData('content', e.target.value)}
                                className="w-full bg-paper border border-linen rounded-xl px-4 py-3.5 text-ink focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition placeholder-violet-400/40 h-64 font-mono text-sm"
                                placeholder="Use <h2>, <p> tags for formatting..."
                            ></textarea>
                            {errors.content && <div className="text-red-500 text-xs ml-1">{errors.content}</div>}
                        </div>

                        {/* Honeypot Trap (Hidden) */}
                        <div className="absolute opacity-0 -z-10 h-0 w-0 overflow-hidden">
                            <label htmlFor="hp_field">Website url</label>
                            <input
                                type="text"
                                id="hp_field"
                                name="honeypot_trap"
                                value={data.honeypot_trap}
                                onChange={e => setData('honeypot_trap', e.target.value)}
                                tabIndex="-1"
                                autoComplete="off"
                            />
                        </div>

                        {/* Captcha */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-umber uppercase tracking-widest ml-1">Human Verification</label>
                            <div className="flex items-center gap-4">
                                <div className="bg-paper border border-linen rounded-xl px-4 py-3.5 text-ink-soft font-mono select-none flex items-center gap-3">
                                    <span className="text-lg font-bold text-ink">{captcha.num1} + {captcha.num2} = ?</span>
                                    <button
                                        type="button"
                                        onClick={refreshCaptcha}
                                        className="text-umber hover:text-ink transition-colors"
                                        title="Refresh Captcha"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    </button>
                                </div>
                                <input
                                    type="number"
                                    value={data.captcha_answer}
                                    onChange={(e) => {
                                        setCaptchaAnswer(e.target.value);
                                        setData('captcha_answer', e.target.value);
                                    }}
                                    className="w-24 bg-paper border border-linen rounded-xl px-4 py-3.5 text-ink text-center font-bold focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition placeholder-violet-400/40"
                                    placeholder="?"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                disabled={processing}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 transform hover:scale-[1.01] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Publishing...' : 'Publish Article'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </>
    );
}
