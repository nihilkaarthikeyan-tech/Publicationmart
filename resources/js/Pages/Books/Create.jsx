import { Head, useForm, Link } from '@inertiajs/react';
import Icon from '@/Components/Icon';
import { route } from 'ziggy-js';
import InputError from '@/Components/InputError';
import { useState, useEffect } from 'react';

export default function Create({ auth, book }) {
    const { data, setData, post, put, processing, errors } = useForm({
        language: book?.language || 'English',
        title: book?.title || '',
        subtitle: book?.subtitle || '',
        author_name: book?.author_name || auth.user.name,
        co_authors: book?.co_authors || [],
        genre: book?.genre || '',
        publication: book?.publication || '',
    });

    const [coAuthorInput, setCoAuthorInput] = useState('');
    const [isMounted, setIsMounted] = useState(false);
    const [hoveredGenre, setHoveredGenre] = useState(null);

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
        if (book) {
            put(route('books.update_basics', book.id));
        } else {
            post(route('books.store'));
        }
    };

    const genres = [
        { id: 'Fiction', label: 'Fiction', icon: 'bookOpen', color: 'from-violet-500 to-purple-600', bgLight: 'bg-violet-50', borderColor: 'border-violet-500' },
        { id: 'Non-Fiction', label: 'Non-Fiction', icon: 'library', color: 'from-blue-500 to-cyan-600', bgLight: 'bg-blue-50', borderColor: 'border-blue-500' },
        { id: 'Academic', label: 'Academic', icon: 'academic', color: 'from-emerald-500 to-teal-600', bgLight: 'bg-emerald-50', borderColor: 'border-emerald-500' },
        { id: 'Poetry', label: 'Poetry', icon: 'feather', color: 'from-rose-500 to-pink-600', bgLight: 'bg-rose-50', borderColor: 'border-rose-500' },
    ];

    return (
        <>
            <Head title="Publish Your Book - Step 1" />

            {/* Split Background - Dark Left, Light Right Gradient */}
            <div className="min-h-screen relative overflow-hidden">
                {/* Dark side gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-oxblood-deep via-oxblood to-oxblood-night" />

                {/* Light overlay on right side */}
                <div className="absolute inset-0 bg-gradient-to-l from-parchment via-parchment/95 to-transparent" style={{ clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 15% 100%)' }} />

                {/* Decorative elements */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-violet-500/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-20 left-40 w-96 h-96 bg-indigo-500/15 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-purple-400/10 rounded-full blur-[80px]" />

                <div className={`relative min-h-screen flex items-center py-12 transition-all duration-1000 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

                            {/* Left Side - Hero Content (Dark) */}
                            <div className={`lg:col-span-5 transition-all duration-700 delay-200 transform ${isMounted ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                                {/* Background backdrop for text */}
                                <div className="relative p-8 rounded-3xl bg-gradient-to-br from-oxblood-deep/90 via-oxblood/85 to-oxblood-night/85 backdrop-blur-sm border border-linen">
                                    {/* Progress Steps - Vertical */}
                                    <div className="mb-8">
                                        <div className="flex items-center gap-3 mb-4">
                                            {[1, 2, 3, 4].map((step, idx) => (
                                                <div key={step} className="flex items-center">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${step === 1
                                                        ? 'bg-foil-light text-oxblood-night shadow-lg'
                                                        : 'bg-white/10 text-cream/60 border border-white/20'
                                                        }`}>
                                                        {step === 1 ? (
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        ) : step}
                                                    </div>
                                                    {idx < 3 && <div className={`w-6 h-0.5 ${step === 1 ? 'bg-gradient-to-r from-violet-500 to-white/20' : 'bg-vellum'}`} />}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-foil-light/20 rounded-lg text-foil-light text-sm font-bold">Step 1</span>
                                            <span className="text-cream/60 text-sm">of 4</span>
                                        </div>
                                    </div>

                                    <h1 className="text-4xl lg:text-5xl tracking-tight mb-4 text-cream" style={{ fontFamily: "'EB Garamond', Georgia, serif", textShadow: '0 2px 10px rgba(0,0,0,0.25)' }}>
                                        Let's bring your
                                        <em className="block text-foil-light">
                                            story to life
                                        </em>
                                    </h1>

                                    <p className="text-lg text-cream/85 mb-8 leading-relaxed">
                                        Start your publishing journey by telling us about your masterpiece. Every great book starts with a simple first step.
                                    </p>

                                    {/* Feature highlights */}
                                    <div className="space-y-3">
                                        {[
                                            'Global distribution across 40+ countries',
                                            'Keep up to 70% royalties on every sale',
                                            'Available in print, eBook & audiobook',
                                        ].map((text, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <span className="w-1.5 h-1.5 rounded-full bg-foil-light shrink-0" aria-hidden="true" />
                                                <span className="text-cream/90 font-medium">{text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Side - Form Card (Light) */}
                            <div className={`lg:col-span-7 transition-all duration-700 delay-400 transform ${isMounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                                <div className="bg-white rounded-[2rem] shadow-2xl shadow-ink/10 border border-vellum overflow-hidden">

                                    {/* Card Header */}
                                    <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-white border-b border-vellum">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                                                    <svg className="w-5 h-5 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h2 className="text-lg font-bold text-ink">Basic Information</h2>
                                                    <p className="text-xs text-umber">Fill in the details about your book</p>
                                                </div>
                                            </div>
                                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-xs font-semibold text-emerald-700">Auto-saving</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Content */}
                                    <div className="p-8">
                                        <form onSubmit={submit} className="space-y-6">

                                            {/* Two Column Row */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                {/* Book Language */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-ink-soft mb-2">
                                                        Language
                                                    </label>
                                                    <div className="relative">
                                                        <select
                                                            value={data.language}
                                                            onChange={(e) => setData('language', e.target.value)}
                                                            className="w-full h-12 pl-4 pr-10 text-sm font-medium text-ink-soft bg-paper border-2 border-linen rounded-xl appearance-none transition-all duration-200 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-100 hover:border-linen-deep cursor-pointer"
                                                        >
                                                            <option>English</option>
                                                            <option>Spanish</option>
                                                            <option>French</option>
                                                            <option>German</option>
                                                            <option>Hindi</option>
                                                            <option>Tamil</option>
                                                        </select>
                                                        <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-umber pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                </div>

                                                {/* Primary Author */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-ink-soft mb-2">
                                                        Primary Author <span className="text-rose-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            value={data.author_name}
                                                            onChange={(e) => setData('author_name', e.target.value)}
                                                            required
                                                            className="w-full h-12 px-4 text-sm font-semibold text-ink-soft bg-violet-50/50 border-2 border-violet-200 rounded-xl transition-all duration-200 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                                                        />
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-violet-600 font-medium">
                                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            <span className="hidden sm:inline">Verified</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Book Title */}
                                            <div>
                                                <label className="block text-sm font-semibold text-ink-soft mb-2">
                                                    Book Title <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.title}
                                                    onChange={(e) => setData('title', e.target.value)}
                                                    required
                                                    placeholder="Enter your book title..."
                                                    className="w-full h-14 px-5 text-base font-semibold text-night bg-paper border-2 border-linen rounded-xl transition-all duration-200 placeholder:text-taupe-light placeholder:font-normal focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-100 hover:border-linen-deep"
                                                />
                                                <InputError message={errors.title} className="mt-2" />
                                            </div>

                                            {/* Subtitle */}
                                            <div>
                                                <label className="block text-sm font-semibold text-ink-soft mb-2">
                                                    Subtitle <span className="text-umber font-normal">(Optional)</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.subtitle}
                                                    onChange={(e) => setData('subtitle', e.target.value)}
                                                    placeholder="A catchy subtitle for your book..."
                                                    className="w-full h-12 px-4 text-sm font-medium text-ink-soft bg-paper border-2 border-linen rounded-xl transition-all duration-200 placeholder:text-taupe-light focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-100 hover:border-linen-deep"
                                                />
                                            </div>

                                            {/* Co-Authors */}
                                            <div>
                                                <label className="block text-sm font-semibold text-ink-soft mb-2">
                                                    Co-Authors <span className="text-umber font-normal">(Optional)</span>
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={coAuthorInput}
                                                        onChange={(e) => setCoAuthorInput(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCoAuthor())}
                                                        placeholder="Add co-author name..."
                                                        className="flex-1 h-12 px-4 text-sm font-medium text-ink-soft bg-paper border-2 border-linen rounded-xl transition-all duration-200 placeholder:text-taupe-light focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-100 hover:border-linen-deep"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={addCoAuthor}
                                                        className="h-12 px-5 bg-paper text-ink font-bold text-sm rounded-xl shadow-lg hover:bg-paper transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                                                    >
                                                        Add
                                                    </button>
                                                </div>

                                                {data.co_authors.length > 0 && (
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {data.co_authors.map((author, index) => (
                                                            <span key={index} className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 bg-[#efe9db] rounded-lg text-sm font-medium text-ink-soft">
                                                                {author}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeCoAuthor(index)}
                                                                    className="p-1 hover:bg-rose-100 rounded-md text-umber hover:text-rose-500 transition-colors"
                                                                >
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Publication Selection - NEW FIELD */}
                                            <div>
                                                <label className="block text-sm font-semibold text-ink-soft mb-2">
                                                    Publication House <span className="text-rose-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={data.publication}
                                                        onChange={(e) => setData('publication', e.target.value)}
                                                        required
                                                        className="w-full h-12 pl-4 pr-10 text-sm font-medium text-ink-soft bg-paper border-2 border-linen rounded-xl appearance-none transition-all duration-200 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-100 hover:border-linen-deep cursor-pointer"
                                                    >
                                                        <option value="" disabled>Select a Publication House</option>
                                                        {['RK Publications', 'Redknot Publications', 'GreenInk publications', 'Leaf publications', 'Violet Publications'].map((pub) => (
                                                            <option key={pub} value={pub}>{pub}</option>
                                                        ))}
                                                    </select>
                                                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-umber pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Genre Selection - Premium Cards */}
                                            <div>
                                                <label className="block text-sm font-semibold text-ink-soft mb-3">
                                                    Book Genre <span className="text-rose-500">*</span>
                                                </label>
                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                                    {genres.map((genre) => (
                                                        <button
                                                            key={genre.id}
                                                            type="button"
                                                            onClick={() => setData('genre', genre.id)}
                                                            onMouseEnter={() => setHoveredGenre(genre.id)}
                                                            onMouseLeave={() => setHoveredGenre(null)}
                                                            className={`relative p-4 rounded-2xl border-2 text-center transition-all duration-300 transform ${data.genre === genre.id
                                                                ? `${genre.borderColor} ${genre.bgLight} shadow-lg scale-[1.02]`
                                                                : 'border-linen bg-white hover:border-linen-deep hover:shadow-md'
                                                                }`}
                                                        >
                                                            {/* Selected indicator */}
                                                            {data.genre === genre.id && (
                                                                <div className={`absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br ${genre.color} rounded-full flex items-center justify-center shadow-lg`}>
                                                                    <svg className="w-3.5 h-3.5 text-ink" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                </div>
                                                            )}

                                                            <div className={`text-3xl mb-2 transition-transform duration-300 ${hoveredGenre === genre.id || data.genre === genre.id ? 'scale-110' : ''}`}>
                                                                <Icon name={genre.icon} size={26} />
                                                            </div>
                                                            <div className={`text-sm font-bold ${data.genre === genre.id ? 'text-ink' : 'text-ink-soft'}`}>
                                                                {genre.label}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                                <InputError message={errors.genre} className="mt-2" />
                                            </div>

                                            {/* Submit Button */}
                                            <div className="pt-4">
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="group relative w-full h-14 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white text-base font-bold rounded-xl shadow-xl shadow-violet-500/30 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/40 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    {/* Animated gradient overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                                                    <span className="relative flex items-center justify-center gap-2">
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
                                                                Continue to Design
                                                                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                                </svg>
                                                            </>
                                                        )}
                                                    </span>
                                                </button>
                                            </div>

                                        </form>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="px-8 py-4 bg-paper border-t border-vellum">
                                        <div className="flex items-center justify-between text-xs text-umber">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5">
                                                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                    </svg>
                                                    <span>SSL Secured</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                                    </svg>
                                                    <span>Draft saved</span>
                                                </div>
                                            </div>
                                            <Link href={route('support.index')} className="text-violet-600 hover:text-violet-700 font-medium hover:underline">
                                                Need help?
                                            </Link>
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
