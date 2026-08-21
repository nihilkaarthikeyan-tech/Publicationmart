import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import InputError from '@/Components/InputError';
import { useState, useEffect } from 'react';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        language: 'English',
        title: '',
        subtitle: '',
        author_name: auth.user.name,
        co_authors: [],
        genre: '',
        author_email: '', // For auto-claim
    });

    const [coAuthorInput, setCoAuthorInput] = useState('');
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const addCoAuthor = () => {
        if (coAuthorInput.trim() !== '') {
            setData('co_authors', [...data.co_authors, coAuthorInput]);
            setCoAuthorInput('');
        }
    };

    const removeCoAuthor = (index) => {
        const newAuthors = [...data.co_authors];
        newAuthors.splice(index, 1);
        setData('co_authors', newAuthors);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.books.store'));
    };

    const genres = [
        { id: 'fiction', label: 'Fiction', icon: '📖' },
        { id: 'non-fiction', label: 'Non-Fiction', icon: '📚' },
        { id: 'academic', label: 'Academic', icon: '🎓' },
        { id: 'poetry', label: 'Poetry', icon: '✨' },
    ];

    return (
        <>
            <Head title="Admin Publication - Step 1" />

            <div className="min-h-screen bg-[#0f172a] py-12 lg:py-20 relative overflow-hidden">
                {/* Ambient Background Elements */}
                <div className="fixed inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a]" />
                <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-violet-600/20 to-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-600/15 to-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

                <div className={`relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 transform ${isMounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

                    {/* Header Section */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black uppercase tracking-widest mb-4">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400"></span>
                            </span>
                            Admin Publishing Suite
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                            Start Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">New Publication</span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium">
                            Set up the foundation for your next masterpiece.
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex justify-center mb-12">
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl rounded-2xl px-8 py-4 border border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-500/30">1</div>
                                <span className="text-sm font-bold text-white">Info</span>
                            </div>
                            <div className="w-12 h-0.5 bg-slate-600 rounded-full" />
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-700 text-slate-500 flex items-center justify-center font-bold">2</div>
                                <span className="text-sm font-medium text-slate-500">Design</span>
                            </div>
                            <div className="w-12 h-0.5 bg-slate-600 rounded-full" />
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-700 text-slate-500 flex items-center justify-center font-bold">3</div>
                                <span className="text-sm font-medium text-slate-500">Review</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Form Card */}
                    <form onSubmit={submit} className="space-y-8">
                        {/* Language & Author Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                                    Publication Language
                                </label>
                                <select
                                    value={data.language}
                                    onChange={(e) => setData('language', e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600/50 focus:border-indigo-500 rounded-xl text-white font-semibold"
                                >
                                    <option>English</option>
                                    <option>Tamil</option>
                                    <option>French</option>
                                    <option>German</option>
                                    <option>Hindi</option>
                                </select>
                            </div>

                            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                                    Primary Author <span className="text-indigo-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.author_name}
                                    onChange={(e) => setData('author_name', e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600/50 focus:border-indigo-500 rounded-xl text-white font-semibold"
                                />
                            </div>

                            {/* Author Email (For Shadow Profile) */}
                            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/10 md:col-span-2">
                                <label className="block text-xs font-black text-emerald-400 uppercase tracking-widest mb-3">
                                    Author Email <span className="text-slate-500 lowercase font-normal">(optional - for auto-claim later)</span>
                                </label>
                                <input
                                    type="email"
                                    value={data.author_email}
                                    onChange={(e) => setData('author_email', e.target.value)}
                                    placeholder="author@example.com - Leave empty if you are the author"
                                    className="w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600/50 focus:border-indigo-500 rounded-xl text-white font-semibold placeholder-slate-500"
                                />
                                <InputError message={errors.author_email} className="mt-2" />
                            </div>
                        </div>

                        {/* Title */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                                Main Title <span className="text-indigo-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                required
                                placeholder="The Masterpiece Chronicles"
                                className="w-full px-5 py-4 bg-slate-700/50 border-2 border-slate-600/50 focus:border-indigo-500 rounded-2xl text-white text-lg font-bold placeholder-slate-500"
                            />
                            <InputError message={errors.title} className="mt-2" />
                        </div>

                        {/* Subtitle */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                                Subtitle <span className="text-slate-600">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                value={data.subtitle}
                                onChange={(e) => setData('subtitle', e.target.value)}
                                placeholder="A Journey Through Time"
                                className="w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600/50 focus:border-indigo-500 rounded-xl text-white font-semibold placeholder-slate-500"
                            />
                        </div>

                        {/* Co-Authors */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                                Collaborative Authors <span className="text-slate-600">(Optional)</span>
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={coAuthorInput}
                                    onChange={(e) => setCoAuthorInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCoAuthor())}
                                    placeholder="Full name of contributor"
                                    className="flex-1 px-4 py-3 bg-slate-700/50 border-2 border-slate-600/50 focus:border-indigo-500 rounded-xl text-white font-semibold placeholder-slate-500"
                                />
                                <button
                                    type="button"
                                    onClick={addCoAuthor}
                                    className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all"
                                >
                                    ADD
                                </button>
                            </div>
                            {data.co_authors.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {data.co_authors.map((author, index) => (
                                        <span key={index} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 font-semibold text-sm">
                                            {author}
                                            <button type="button" onClick={() => removeCoAuthor(index)} className="w-5 h-5 flex items-center justify-center bg-red-500/30 hover:bg-red-500 rounded-full text-red-300 hover:text-white transition-all">×</button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Genre Selection */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                                Primary Genre <span className="text-indigo-400">*</span>
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {genres.map((genre) => (
                                    <button
                                        key={genre.id}
                                        type="button"
                                        onClick={() => setData('genre', genre.id)}
                                        className={`p-5 rounded-2xl border-2 text-center transition-all ${data.genre === genre.id
                                            ? 'border-indigo-400 bg-indigo-500/20 shadow-lg shadow-indigo-500/10'
                                            : 'border-white/10 bg-white/5 hover:border-indigo-400/50'
                                            }`}
                                    >
                                        <div className="text-3xl mb-2">{genre.icon}</div>
                                        <div className="font-bold text-white text-sm">{genre.label}</div>
                                    </button>
                                ))}
                            </div>
                            <InputError message={errors.genre} className="mt-3" />
                        </div>

                        {/* Admin Notice */}
                        <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-5 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">⚡</div>
                            <div>
                                <p className="text-sm text-amber-200 font-medium">
                                    You are currently in <span className="font-black text-amber-300">Admin Mode</span>. This book will bypass the standard review queue and proceed directly to publication assets upon completion.
                                </p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-5 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white text-lg font-bold rounded-2xl shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-violet-500/40 transform hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {processing ? (
                                <>
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Save & Configure Design
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </>
                            )}
                        </button>

                        {/* Footer */}
                        <div className="flex justify-center items-center gap-6 pt-4">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span>SSL Encrypted</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                <span>Auto-save Active</span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
