import { Head, Link, router } from '@inertiajs/react';
import { useState, useRef } from 'react';

export default function ProfessionalUploadFirst({ book, serviceType, price }) {
    const [file, setFile] = useState(null);
    const [notes, setNotes] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadComplete, setUploadComplete] = useState(false);
    const [tempRequestId, setTempRequestId] = useState(null);
    const fileInputRef = useRef(null);

    const serviceNames = {
        formatting: 'Professional Formatting',
        full_package: 'Full Package (Formatting + Cover)',
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && isValidFile(droppedFile)) {
            setFile(droppedFile);
        }
    };

    const isValidFile = (file) => {
        const validTypes = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        return validTypes.includes(file.type) || file.name.endsWith('.doc') || file.name.endsWith('.docx');
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && isValidFile(selectedFile)) {
            setFile(selectedFile);
        } else {
            alert('Please select a valid file (DOC, DOCX)');
        }
    };

    const handleUploadAndProceed = async () => {
        if (!file) {
            alert('Please upload your manuscript first');
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append('manuscript', file);
        formData.append('notes', notes);
        formData.append('service_type', serviceType);

        router.post(route('professional.upload-first', book.id), formData, {
            forceFormData: true,
            onSuccess: () => {
                setUploadComplete(true);
            },
            onError: (errors) => {
                console.error(errors);
                alert('Upload failed. Please try again.');
                setIsUploading(false);
            },
            onFinish: () => {
                setIsUploading(false);
            }
        });
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <>
            <Head title={`Upload Manuscript - ${serviceNames[serviceType]}`} />
            <div className="min-h-screen bg-parchment">
                {/* Header */}
                <header className="bg-paper/90 backdrop-blur-md border-b border-linen sticky top-0 z-50">
                    <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                        <Link
                            href={route('books.design', book.id)}
                            className="flex items-center gap-3 text-umber hover:text-ink transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="font-medium">Back</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <span className="text-xl">📄</span>
                            <span className="font-bold text-ink">Step 1: Upload Manuscript</span>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-3xl mx-auto py-12 px-4">
                    {/* Background Effects */}
                    <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[128px] pointer-events-none"></div>

                    {/* Service Info */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-ink mb-2">{serviceNames[serviceType]}</h1>
                        <p className="text-umber">Upload your manuscript to proceed with payment</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-4 mb-10">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">1</div>
                            <span className="text-ink font-medium">Upload</span>
                        </div>
                        <div className="w-12 h-0.5 bg-vellum"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-vellum flex items-center justify-center text-umber font-bold text-sm">2</div>
                            <span className="text-umber">Payment</span>
                        </div>
                        <div className="w-12 h-0.5 bg-vellum"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-vellum flex items-center justify-center text-umber font-bold text-sm">3</div>
                            <span className="text-umber">Done</span>
                        </div>
                    </div>

                    {/* Upload Card */}
                    <div className="bg-paper rounded-2xl border border-linen p-8">
                        {/* Drag & Drop Zone */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${isDragging
                                ? 'border-indigo-500 bg-indigo-500/10'
                                : file
                                    ? 'border-emerald-500/50 bg-emerald-500/5'
                                    : 'border-linen hover:border-taupe hover:bg-paper'
                                }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".doc,.docx"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            {file ? (
                                <div>
                                    <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-ink font-medium mb-1">{file.name}</p>
                                    <p className="text-umber text-sm">{formatFileSize(file.size)}</p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                        }}
                                        className="mt-3 text-red-700 hover:text-red-700 text-sm"
                                    >
                                        Remove & Choose Different File
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div className="w-16 h-16 mx-auto bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <p className="text-ink font-medium mb-2">
                                        Drag & drop your manuscript here
                                    </p>
                                    <p className="text-umber text-sm mb-4">or click to browse</p>
                                    <p className="text-umber text-xs">Supported formats: DOC, DOCX (Max 50MB)</p>
                                </div>
                            )}
                        </div>

                        {/* Notes Section */}
                        <div className="mt-6">
                            <label className="block text-umber text-sm mb-2">
                                Special Instructions (Optional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any specific formatting requirements, style preferences, or special instructions for our team..."
                                className="w-full px-4 py-3 bg-paper border border-linen rounded-xl text-ink placeholder-taupe focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                                rows={4}
                            />
                        </div>

                        {/* Price Summary */}
                        <div className="mt-6 p-4 bg-paper rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-umber text-sm">Service Price</p>
                                <p className="text-ink font-medium">{serviceNames[serviceType]}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-oxblood">
                                    ₹{price}
                                </p>
                                <p className="text-umber text-xs">One-time payment</p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleUploadAndProceed}
                            disabled={!file || isUploading}
                            className={`w-full mt-6 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${file && !isUploading
                                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-ink shadow-lg shadow-indigo-500/30'
                                : 'bg-vellum text-umber cursor-not-allowed'
                                }`}
                        >
                            {isUploading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    Continue to Payment
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </>
                            )}
                        </button>

                        {!file && (
                            <p className="text-center text-umber text-sm mt-3">
                                Please upload your manuscript to proceed
                            </p>
                        )}
                    </div>

                    {/* Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                        <div className="bg-paper rounded-xl border border-linen p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-cyan-500/20 rounded-lg">
                                    <svg className="w-5 h-5 text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h4 className="text-ink font-medium">Quick Turnaround</h4>
                            </div>
                            <p className="text-umber text-sm">Your formatted manuscript will be delivered within 3-5 business days.</p>
                        </div>
                        <div className="bg-paper rounded-xl border border-linen p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                    <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h4 className="text-ink font-medium">Secure & Private</h4>
                            </div>
                            <p className="text-umber text-sm">Your manuscript is encrypted and kept confidential at all times.</p>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

