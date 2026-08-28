import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import InputError from '@/Components/InputError';

export default function Design({ auth, book }) {
    const { data, setData, post, processing, errors } = useForm({
        book_size: book.book_size || '5.5x8.5',
        printing_color: book.printing_color || 'B/W',
        paper_type: book.paper_type || 'White Paper',
        binding_type: book.binding_type || 'Soft Binding',
        interior_layout_method: 'upload',
        interior_file: null,
        cover_design_path: null,
    });

    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [templateError, setTemplateError] = useState(null);

    const getDownloadUrl = (folder, size) => {
        const pathParts = window.location.pathname.split('/');
        const publicIndex = pathParts.indexOf('public');
        const basePath = publicIndex !== -1 ? pathParts.slice(0, publicIndex + 1).join('/') : '';
        return `${basePath}/templates/${folder}/${size}.docx`;
    };

    const handleDownload = async (folder, size) => {
        const url = getDownloadUrl(folder, size);
        setTemplateError(null);
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                const link = document.createElement('a');
                link.href = url;
                link.download = `${size}.docx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                setTemplateError(`File not found: "${size}.docx" in "templates/${folder}/"`);
            }
        } catch (e) {
            setTemplateError("Connection error. Please try again.");
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.books.design.update', book.id), {
            forceFormData: true,
            onError: (err) => alert("Please correct errors: " + Object.values(err).join(", "))
        });
    };

    const bookSizes = [
        { id: '5x8', label: '5×8"', desc: 'Novels & Fiction', icon: '📖' },
        { id: '6x9', label: '6×9"', desc: 'Non-Fiction', icon: '📚' },
        { id: '5.5x8.5', label: '5.5×8.5"', desc: 'Poetry', icon: '✨' },
        { id: '8.5x8.5', label: '8.5×8.5"', desc: 'Children\'s', icon: '🎨' },
        { id: '8.5x11', label: '8.5×11"', desc: 'Academic', icon: '🎓' },
        { id: '16.5x11', label: '16.5×11"', desc: 'Magazine', icon: '📰' },
    ];

    return (
        <>
            <Head title="Book Design Studio" />

            <div className="min-h-screen bg-parchment">
                {/* Premium Dark Background with Mesh Gradient */}
                <div className="fixed inset-0 bg-gradient-to-br from-parchment via-vellum to-parchment" />
                <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-oxblood/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-foil/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-oxblood/5 to-transparent rounded-full pointer-events-none" />

                <div className="relative max-w-5xl mx-auto px-4 py-12">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <Link href={route('admin.dashboard')} className="inline-flex items-center gap-2 text-sm font-semibold text-umber hover:text-ink transition mb-6">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            Back to Dashboard
                        </Link>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-oxblood/10 border border-oxblood/30 text-oxblood text-xs font-bold uppercase tracking-wider mb-4">
                            <span className="w-2 h-2 rounded-full bg-oxblood animate-pulse" />
                            Design Studio
                        </div>
                        <h1 className="text-4xl font-black text-ink mb-3">Configure Your Book</h1>
                        <p className="text-umber max-w-lg mx-auto">Set up printing specifications and upload your manuscript files.</p>
                    </div>

                    {/* Progress */}
                    <div className="flex justify-center mb-12">
                        <div className="flex items-center gap-4 bg-paper backdrop-blur-xl rounded-2xl px-8 py-4 border border-linen">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-600/30">✓</div>
                                <span className="text-sm font-semibold text-ink-soft">Info</span>
                            </div>
                            <div className="w-12 h-0.5 bg-gradient-to-r from-emerald-600 to-oxblood rounded-full" />
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-oxblood to-oxblood-deep text-white flex items-center justify-center font-bold shadow-lg shadow-oxblood/30">2</div>
                                <span className="text-sm font-bold text-ink">Design</span>
                            </div>
                            <div className="w-12 h-0.5 bg-linen-deep rounded-full" />
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-vellum text-taupe flex items-center justify-center font-bold">3</div>
                                <span className="text-sm font-medium text-taupe">Review</span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-8">
                        {/* Book Size */}
                        <div className="bg-paper backdrop-blur-xl rounded-3xl p-8 border border-linen">
                            <h2 className="text-xl font-bold text-ink mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-oxblood/10 text-oxblood flex items-center justify-center">📐</span>
                                Book Dimensions
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {bookSizes.map((size) => (
                                    <button key={size.id} type="button" onClick={() => setData('book_size', size.id)}
                                        className={`relative p-5 rounded-2xl border-2 transition-all duration-300 text-center group ${data.book_size === size.id
                                            ? 'border-oxblood bg-oxblood/10 shadow-lg shadow-oxblood/20'
                                            : 'border-linen bg-paper hover:border-oxblood/50 hover:bg-vellum'
                                            }`}>
                                        {data.book_size === size.id && (
                                            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-oxblood text-white flex items-center justify-center shadow-lg">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                            </div>
                                        )}
                                        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{size.icon}</div>
                                        <div className="text-lg font-black text-ink">{size.label}</div>
                                        <div className="text-xs text-umber font-medium mt-1">{size.desc}</div>
                                    </button>
                                ))}
                            </div>
                            <InputError message={errors.book_size} className="mt-3" />
                        </div>

                        {/* Printing & Paper */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Printing Type */}
                            <div className="bg-paper backdrop-blur-xl rounded-3xl p-8 border border-linen">
                                <h2 className="text-xl font-bold text-ink mb-6 flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">🖨️</span>
                                    Print Color
                                </h2>
                                <div className="space-y-3">
                                    {[
                                        { id: 'B/W', label: 'Black & White', desc: 'Crisp text, lower cost', icon: '◐' },
                                        { id: 'Color', label: 'Full Color', desc: 'Vibrant illustrations', icon: '🌈' }
                                    ].map((opt) => (
                                        <button key={opt.id} type="button" onClick={() => setData('printing_color', opt.id)}
                                            className={`w-full p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${data.printing_color === opt.id
                                                ? 'border-rose-400 bg-rose-50'
                                                : 'border-linen bg-paper hover:border-rose-400/50'
                                                }`}>
                                            <span className="text-2xl">{opt.icon}</span>
                                            <div className="text-left flex-1">
                                                <div className="font-bold text-ink">{opt.label}</div>
                                                <div className="text-xs text-umber">{opt.desc}</div>
                                            </div>
                                            {data.printing_color === opt.id && (
                                                <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center">✓</div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Paper Type */}
                            <div className="bg-paper backdrop-blur-xl rounded-3xl p-8 border border-linen">
                                <h2 className="text-xl font-bold text-ink mb-6 flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">📄</span>
                                    Paper Type
                                </h2>
                                <div className="space-y-3">
                                    {['White Paper', 'Bond Paper', 'Art Paper'].map((paper) => (
                                        <button key={paper} type="button" onClick={() => setData('paper_type', paper)}
                                            className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${data.paper_type === paper
                                                ? 'border-amber-400 bg-amber-50'
                                                : 'border-linen bg-paper hover:border-amber-400/50'
                                                }`}>
                                            <span className="font-semibold text-ink">{paper}</span>
                                            {data.paper_type === paper && (
                                                <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs">✓</div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Binding */}
                        <div className="bg-paper backdrop-blur-xl rounded-3xl p-8 border border-linen">
                            <h2 className="text-xl font-bold text-ink mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-oxblood/10 text-oxblood flex items-center justify-center">📕</span>
                                Binding Style
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { id: 'Soft Binding', label: 'Paperback', desc: 'Flexible, lightweight cover', icon: '📖' },
                                    { id: 'Hard Binding', label: 'Hardcover', desc: 'Durable, premium finish', icon: '📚' }
                                ].map((bind) => (
                                    <button key={bind.id} type="button" onClick={() => setData('binding_type', bind.id)}
                                        className={`p-6 rounded-2xl border-2 flex items-center gap-4 transition-all ${data.binding_type === bind.id
                                            ? 'border-oxblood bg-oxblood/10 shadow-lg shadow-oxblood/10'
                                            : 'border-linen bg-paper hover:border-oxblood/50'
                                            }`}>
                                        <span className="text-3xl">{bind.icon}</span>
                                        <div className="text-left flex-1">
                                            <div className="font-bold text-ink text-lg">{bind.label}</div>
                                            <div className="text-sm text-umber">{bind.desc}</div>
                                        </div>
                                        {data.binding_type === bind.id && (
                                            <div className="w-8 h-8 rounded-full bg-oxblood text-white flex items-center justify-center font-bold">✓</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Files Upload */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Interior */}
                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 backdrop-blur-xl rounded-3xl p-8 border border-orange-200">
                                <h2 className="text-xl font-bold text-ink mb-2 flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center">📝</span>
                                    Interior Manuscript
                                </h2>
                                <p className="text-sm text-umber mb-6">Upload your formatted PDF or Word document</p>

                                <div className="space-y-3">
                                    <button type="button" onClick={() => setShowTemplateModal(true)}
                                        className="w-full py-3 px-4 bg-paper rounded-xl border-2 border-dashed border-orange-400/50 text-orange-700 font-semibold hover:border-orange-400 hover:bg-orange-50 transition-all">
                                        📚 Browse Templates
                                    </button>
                                    <label className="block w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white font-bold text-center cursor-pointer hover:shadow-lg hover:shadow-orange-500/30 transition-all">
                                        ⬆️ Upload File
                                        <input type="file" className="hidden" accept=".doc,.docx,.pdf"
                                            onChange={(e) => { setData('interior_file', e.target.files[0]); setData('interior_layout_method', 'upload'); }} />
                                    </label>
                                </div>

                                {data.interior_file && (
                                    <div className="mt-4 p-3 bg-emerald-100 rounded-xl border border-emerald-300 flex items-center gap-2 text-emerald-800">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        <span className="text-sm font-semibold truncate">{data.interior_file.name}</span>
                                    </div>
                                )}
                            </div>

                            {/* Cover */}
                            <div className="bg-gradient-to-br from-rose-50 to-pink-50 backdrop-blur-xl rounded-3xl p-8 border border-rose-200">
                                <h2 className="text-xl font-bold text-ink mb-2 flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center">🎨</span>
                                    Cover Design
                                </h2>
                                <p className="text-sm text-umber mb-6">Upload your cover image (PNG, JPG)</p>

                                <label className="block border-2 border-dashed border-rose-400/50 rounded-2xl p-8 text-center cursor-pointer hover:border-rose-400 hover:bg-rose-50 transition-all">
                                    <div className="text-4xl mb-3">🖼️</div>
                                    <div className="text-sm text-ink-soft"><span className="text-rose-600 font-semibold">Click to upload</span> or drag and drop</div>
                                    <div className="text-xs text-taupe mt-1">PNG, JPG up to 10MB</div>
                                    <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={(e) => setData('cover_design_path', e.target.files[0])} />
                                </label>

                                {data.cover_design_path && (
                                    <div className="mt-4 p-3 bg-emerald-100 rounded-xl border border-emerald-300 flex items-center gap-2 text-emerald-800">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        <span className="text-sm font-semibold truncate">{data.cover_design_path.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={processing}
                            className="w-full py-5 bg-oxblood hover:bg-oxblood-deep text-white text-lg font-bold rounded-2xl shadow-xl shadow-oxblood/30 hover:shadow-2xl hover:shadow-oxblood/40 transform hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                            {processing ? (
                                <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Processing...</>
                            ) : (
                                <>Continue to Review <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Template Modal */}
            {
                showTemplateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowTemplateModal(false)}>
                        <div className="bg-paper rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            <div className="p-6 border-b border-linen bg-gradient-to-r from-parchment to-vellum flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-black text-ink">Template Library</h3>
                                    <p className="text-sm text-taupe">Size: <span className="font-bold text-oxblood">{data.book_size}</span></p>
                                </div>
                                <button onClick={() => setShowTemplateModal(false)} className="w-10 h-10 rounded-full bg-paper shadow hover:bg-vellum flex items-center justify-center">✕</button>
                            </div>

                            {templateError && (
                                <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{templateError}</div>
                            )}

                            <div className="p-6 grid grid-cols-2 gap-4 overflow-y-auto max-h-[60vh]">
                                {(data.book_size === '16.5x11'
                                    ? [
                                        { name: 'Magazine Template', folder: 'Magazine Template', icon: '📰', color: 'from-stone-600 to-stone-800' }
                                    ]
                                    : [
                                        { name: 'Horror Style', folder: 'Horror Book Template', icon: '🧛', color: 'from-slate-800 to-red-900' },
                                        { name: 'Kavithai Style', folder: 'Kavithai', icon: '✍️', color: 'from-amber-500 to-orange-600' },
                                        { name: 'Standard Book', folder: 'Book', icon: '📖', color: 'from-blue-500 to-indigo-600' },
                                        { name: 'Bordered Style', folder: 'Book with border', icon: '🖼️', color: 'from-emerald-500 to-teal-600' },
                                    ]
                                ).map((style) => (
                                    <div key={style.folder} className="bg-vellum rounded-2xl p-5 border border-linen hover:shadow-lg transition-all">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-3xl">{style.icon}</span>
                                            <span className="font-bold text-ink">{style.name}</span>
                                        </div>
                                        <button onClick={() => handleDownload(style.folder, data.book_size)}
                                            className={`w-full py-3 rounded-xl text-white font-bold bg-gradient-to-r ${style.color} hover:opacity-90 transition-all`}>
                                            Download {data.book_size}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}
