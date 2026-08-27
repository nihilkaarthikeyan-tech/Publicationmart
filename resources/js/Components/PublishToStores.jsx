import { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

/**
 * PublishToStores Component
 * A workflow panel for admins to publish books to external platforms (Amazon, Google)
 */
export default function PublishToStores({ book }) {
    const { app_url } = usePage().props;
    const [copiedField, setCopiedField] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // Form for updating links
    const { data, setData, put, processing, errors } = useForm({
        title: book.title || '',
        subtitle: book.subtitle || '',
        author_name: book.author_name || '',
        genre: book.genre || '',
        language: book.language || '',
        about_book: book.about_book || '',
        author_biography: book.author_biography || '',
        book_size: book.book_size || '5.5x8.5',
        printing_color: book.printing_color || 'B/W',
        paper_type: book.paper_type || 'White Paper',
        amazon_link: book.amazon_link || '',
        google_books_link: book.google_books_link || '',
    });

    // Save links handler
    const saveLinks = (e) => {
        e.preventDefault();
        put(route('admin.books.update', book.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            },
        });
    };

    // Copy text to clipboard with visual feedback
    const copyToClipboard = (text, fieldName) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedField(fieldName);
            setTimeout(() => setCopiedField(null), 2000);
        });
    };

    // Book metadata for easy copying
    const bookMetadata = [
        { label: 'Title', value: book.title, key: 'title' },
        { label: 'Subtitle', value: book.subtitle || '', key: 'subtitle' },
        { label: 'Author Name', value: book.author_name, key: 'author_name' },
        { label: 'Genre/Category', value: book.genre, key: 'genre' },
        { label: 'Language', value: book.language, key: 'language' },
        { label: 'Description', value: book.about_book || '', key: 'about_book', multiline: true },
        { label: 'Author Bio', value: book.author_biography || '', key: 'author_biography', multiline: true },
    ];

    // Status badge component
    const StatusBadge = ({ status }) => {
        const styles = {
            pending: 'bg-gray-100 text-gray-600 border-gray-200',
            uploaded: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            published: 'bg-green-100 text-green-700 border-green-200',
        };
        const labels = {
            pending: '⏳ Not Started',
            uploaded: '📤 Uploaded',
            published: '✅ Published',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || styles.pending}`}>
                {labels[status] || labels.pending}
            </span>
        );
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-2 border-indigo-200 rounded-xl p-6 mt-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Publish to External Stores</h3>
                    <p className="text-sm text-gray-500">Upload this book to Amazon and Google Play Books</p>
                </div>
            </div>

            {/* STEP 1: Copy Book Information */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <h4 className="font-semibold text-gray-800">Copy Book Information</h4>
                    <span className="text-xs text-gray-400">(Click to copy any field)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {bookMetadata.filter(m => !m.multiline).map((item) => (
                        <div
                            key={item.key}
                            onClick={() => item.value && copyToClipboard(item.value, item.key)}
                            className={`group flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-indigo-400 hover:shadow-sm transition-all ${!item.value ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <div className="overflow-hidden">
                                <div className="text-xs text-gray-500 uppercase tracking-wider">{item.label}</div>
                                <div className="text-sm font-medium text-gray-900 truncate">{item.value || 'N/A'}</div>
                            </div>
                            <div className={`flex-shrink-0 ml-2 ${copiedField === item.key ? 'text-green-600' : 'text-gray-400 group-hover:text-indigo-600'}`}>
                                {copiedField === item.key ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Multiline fields */}
                <div className="mt-3 space-y-3">
                    {bookMetadata.filter(m => m.multiline).map((item) => (
                        <div
                            key={item.key}
                            onClick={() => item.value && copyToClipboard(item.value, item.key)}
                            className={`group p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-indigo-400 hover:shadow-sm transition-all ${!item.value ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="text-xs text-gray-500 uppercase tracking-wider">{item.label}</div>
                                <div className={`flex-shrink-0 ${copiedField === item.key ? 'text-green-600' : 'text-gray-400 group-hover:text-indigo-600'}`}>
                                    {copiedField === item.key ? (
                                        <span className="text-xs font-bold">✓ Copied!</span>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <div className="text-sm text-gray-700 mt-1 line-clamp-3">{item.value || 'N/A'}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* STEP 2: Download Files */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <h4 className="font-semibold text-gray-800">Download Files for Upload</h4>
                </div>

                <div className="flex flex-wrap gap-4">
                    {/* Manuscript Download */}
                    {/* Authenticated admin route: the raw /storage/ URL served
                        unpublished manuscripts to anyone holding the link. */}
                    {book.interior_file ? (
                        <a
                            href={route('admin.books.download-manuscript', book.id)}
                            download
                            className="flex items-center gap-3 px-5 py-3 bg-white border-2 border-dashed border-red-200 rounded-xl hover:border-red-400 hover:bg-red-50 transition-all group"
                        >
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                                    <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-800">Download Manuscript</div>
                                <div className="text-xs text-gray-500 truncate max-w-[200px]">{book.interior_file.split('/').pop()}</div>
                            </div>
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </a>
                    ) : (
                        <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl opacity-50">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="text-sm text-gray-500">No manuscript uploaded</div>
                        </div>
                    )}

                    {/* Cover Download */}
                    {book.cover_design_path ? (
                        <a
                            href={`${app_url}/storage/${book.cover_design_path}`}
                            download
                            className="flex items-center gap-3 px-5 py-3 bg-white border-2 border-dashed border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all group"
                        >
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors overflow-hidden">
                                <img src={`${app_url}/storage/${book.cover_design_path}`} alt="Cover" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-800">Download Cover</div>
                                <div className="text-xs text-gray-500">JPG/PNG Image</div>
                            </div>
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </a>
                    ) : (
                        <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl opacity-50">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="text-sm text-gray-500">No cover uploaded</div>
                        </div>
                    )}
                </div>
            </div>

            {/* STEP 3: Upload to Platforms */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <h4 className="font-semibold text-gray-800">Upload to Platforms</h4>
                    <span className="text-xs text-gray-400">(Opens in new tab)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Amazon KDP */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-[#FF9900] rounded-xl flex items-center justify-center">
                                    <span className="text-black font-black text-lg">a</span>
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">Amazon KDP</div>
                                    <div className="text-xs text-gray-500">Kindle Direct Publishing</div>
                                </div>
                            </div>
                            <StatusBadge status={book.amazon_status} />
                        </div>
                        <a
                            href="https://kdp.amazon.com/en_US/bookshelf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full text-center py-2.5 bg-[#232F3E] text-white font-semibold rounded-lg hover:bg-[#131921] transition-colors"
                        >
                            Open Amazon KDP →
                        </a>
                        <div className="mt-3 text-xs text-gray-500 space-y-1">
                            <div>1. Click "Create New Title"</div>
                            <div>2. Upload manuscript & cover</div>
                            <div>3. Set price & publish</div>
                        </div>
                    </div>

                    {/* Google Play Books */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center">
                                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">Google Play Books</div>
                                    <div className="text-xs text-gray-500">Partner Center</div>
                                </div>
                            </div>
                            <StatusBadge status={book.google_status} />
                        </div>
                        <a
                            href="https://play.google.com/books/publish/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full text-center py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Open Google Play Books →
                        </a>
                        <div className="mt-3 text-xs text-gray-500 space-y-1">
                            <div>1. Add new book</div>
                            <div>2. Upload EPUB/PDF & cover</div>
                            <div>3. Set price & territories</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* STEP 4: Enter Published Links - WITH INPUT FIELDS */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    <h4 className="font-semibold text-gray-800">Enter Published Links</h4>
                    <span className="text-xs text-gray-400">(Paste the store links after uploading)</span>
                </div>

                <form onSubmit={saveLinks} className="bg-white border border-gray-200 rounded-xl p-5">
                    {/* Success message */}
                    {showSuccess && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="font-medium">Links saved successfully!</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Amazon Link Input */}
                        <div>
                            <label className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-[#FF9900] rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-black font-black text-sm">a</span>
                                </div>
                                <span className="text-sm font-semibold text-gray-700">Amazon Link</span>
                                {data.amazon_link && (
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </label>
                            <input
                                type="url"
                                value={data.amazon_link}
                                onChange={(e) => setData('amazon_link', e.target.value)}
                                placeholder="https://www.amazon.com/dp/B0XXXXXXXX"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9900] focus:border-[#FF9900] text-sm transition-all"
                            />
                            {errors.amazon_link && <p className="mt-1 text-xs text-red-500">{errors.amazon_link}</p>}
                        </div>

                        {/* Google Link Input */}
                        <div>
                            <label className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                </div>
                                <span className="text-sm font-semibold text-gray-700">Google Play Books Link</span>
                                {data.google_books_link && (
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </label>
                            <input
                                type="url"
                                value={data.google_books_link}
                                onChange={(e) => setData('google_books_link', e.target.value)}
                                placeholder="https://play.google.com/store/books/details?id=XXXXXX"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                            />
                            {errors.google_books_link && <p className="mt-1 text-xs text-red-500">{errors.google_books_link}</p>}
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="mt-6 flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                            Links are saved to the book and will appear in the Book Store
                        </p>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Save Links
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Progress Summary */}
            <div className="mt-6 pt-6 border-t border-indigo-100">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        <span className="font-semibold">Distribution Progress:</span>
                        <span className="ml-2">
                            {[data.amazon_link, data.google_books_link].filter(Boolean).length} of 2 platforms completed
                        </span>
                    </div>
                    <div className="flex gap-1">
                        <div className={`w-20 h-2 rounded-full ${data.amazon_link ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                        <div className={`w-20 h-2 rounded-full ${data.google_books_link ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
