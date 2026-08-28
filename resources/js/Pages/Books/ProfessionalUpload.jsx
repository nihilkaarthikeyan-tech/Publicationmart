import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function ProfessionalUpload({ serviceRequest }) {
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [notes, setNotes] = useState('');

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedFile) {
            alert('Please select a manuscript file to upload.');
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append('manuscript', selectedFile);
        formData.append('notes', notes);

        router.post(route('professional.upload-manuscript', serviceRequest.id), formData, {
            forceFormData: true,
            onSuccess: () => {
                // Will redirect to dashboard
            },
            onError: (errors) => {
                console.error('Upload error:', errors);
                alert('Failed to upload manuscript. Please try again.');
                setIsUploading(false);
            },
        });
    };

    const serviceNames = {
        formatting: 'Professional Formatting',
        cover: 'Cover Design',
        full_package: 'Full Package',
    };

    return (
        <>
            <Head title="Upload Your Manuscript" />
            <div className="min-h-screen bg-[#f0ece3] flex items-center justify-center py-12 px-4">
                {/* Background Effects */}
                <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none"></div>
                <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none"></div>

                <div className="relative z-10 w-full max-w-2xl">
                    {/* Success Badge */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-3 py-2 px-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-4">
                            <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-emerald-700 font-bold">Payment Successful!</span>
                        </div>
                        <h1 className="text-3xl font-bold text-[#17150f] mb-2">Upload Your Manuscript</h1>
                        <p className="text-[#635c4e]">
                            Your {serviceNames[serviceRequest.service_type]} service is confirmed.
                            Please upload your manuscript to get started.
                        </p>
                    </div>

                    {/* Upload Card */}
                    <div className="bg-[#faf8f3] rounded-2xl border border-[#d8d1c1] p-8">
                        <form onSubmit={handleSubmit}>
                            {/* Drag & Drop Zone */}
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragActive
                                    ? 'border-indigo-400 bg-indigo-500/10'
                                    : selectedFile
                                        ? 'border-emerald-400 bg-emerald-500/10'
                                        : 'border-[#d8d1c1] hover:border-[#d8d1c1]'
                                    }`}
                            >
                                <input
                                    type="file"
                                    accept=".doc,.docx"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />

                                {selectedFile ? (
                                    <div className="space-y-3">
                                        <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                                            <svg className="w-8 h-8 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <p className="text-[#17150f] font-bold">{selectedFile.name}</p>
                                        <p className="text-[#635c4e] text-sm">
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedFile(null);
                                            }}
                                            className="text-red-700 hover:text-red-700 text-sm underline"
                                        >
                                            Remove file
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="w-16 h-16 mx-auto bg-[#faf8f3] rounded-2xl flex items-center justify-center">
                                            <svg className="w-8 h-8 text-[#635c4e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        <p className="text-[#17150f] font-medium">
                                            Drag & drop your manuscript here
                                        </p>
                                        <p className="text-[#635c4e] text-sm">
                                            or click to browse • DOC, DOCX (max 50MB)
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Notes */}
                            <div className="mt-6">
                                <label className="block text-sm font-bold text-[#4b443a] mb-2">
                                    Special Instructions (Optional)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Any specific formatting preferences, font choices, or special requirements..."
                                    className="w-full bg-[#faf8f3] border border-[#d8d1c1] rounded-xl px-4 py-3 text-[#17150f] placeholder-gray-500 focus:outline-none focus:border-indigo-400 transition resize-none h-24"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={!selectedFile || isUploading}
                                className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold text-base rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                        Submit Manuscript
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Info Box */}
                        <div className="mt-6 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                            <h4 className="font-bold text-indigo-700 text-sm mb-2">What happens next?</h4>
                            <ul className="space-y-1 text-sm text-[#635c4e]">
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-700">1.</span>
                                    Our team will review your manuscript within 24 hours
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-700">2.</span>
                                    Professional formatting will begin immediately
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-700">3.</span>
                                    You'll receive your formatted book in 3-5 business days
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Skip Link */}
                    <div className="text-center mt-6">
                        <Link
                            href={route('dashboard')}
                            className="text-[#635c4e] hover:text-[#4b443a] text-sm transition"
                        >
                            I'll upload later → Go to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

