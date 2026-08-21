import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';

export default function ProfessionalSuccess({ serviceRequest }) {
    const serviceNames = {
        formatting: 'Professional Formatting',
        cover: 'Cover Design',
        full_package: 'Full Package',
    };

    const isUploadRequired = serviceRequest?.service_type !== 'cover';

    // Meta Pixel: Track professional service purchase
    useEffect(() => {
        if (typeof window.fbq === 'function') {
            fbq('track', 'Purchase', {
                value: parseFloat(serviceRequest?.amount || 0),
                currency: 'INR',
            });
        }
    }, []);

    return (
        <>
            <Head title="Payment Successful - Professional Services" />
            <div className="min-h-screen bg-[#0f0a1e] flex items-center justify-center p-4">
                {/* Background Effects */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none"></div>
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none"></div>

                <div className="relative z-10 max-w-lg w-full">
                    {/* Success Card */}
                    <div className="bg-[#0d1220] rounded-3xl border border-white/10 p-8 text-center shadow-2xl">

                        {/* Success Icon */}
                        <div className="mb-6">
                            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Payment Successful!
                        </h1>
                        <p className="text-gray-400 mb-6">
                            Thank you for your purchase
                        </p>

                        {/* Order Details */}
                        <div className="bg-[#0a0f1a] rounded-xl p-5 mb-6 border border-white/5 text-left">
                            <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/10">
                                <span className="text-gray-400 text-sm">Service</span>
                                <span className="text-white font-semibold">
                                    {serviceNames[serviceRequest?.service_type] || 'Professional Service'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/10">
                                <span className="text-gray-400 text-sm">Amount Paid</span>
                                <span className="text-emerald-400 font-bold">₹{serviceRequest?.amount || '0'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">Order ID</span>
                                <span className="text-gray-300 text-xs font-mono">PRO_{serviceRequest?.id}</span>
                            </div>
                        </div>

                        {/* Next Steps Message */}
                        {isUploadRequired ? (
                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5 mb-6">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-indigo-500/20 rounded-lg shrink-0">
                                        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-white text-sm mb-1">Next Step: Upload Your Manuscript</h4>
                                        <p className="text-gray-400 text-xs leading-relaxed">
                                            Please upload your manuscript (DOCX or PDF) so our team can begin working on your book.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-5 mb-6">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-cyan-500/20 rounded-lg shrink-0">
                                        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-white text-sm mb-1">We'll Contact You Soon!</h4>
                                        <p className="text-gray-400 text-xs leading-relaxed">
                                            Our design team will reach out to you within <span className="text-cyan-300 font-semibold">24 hours</span> to discuss your cover design requirements and vision.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Support Info */}
                        <div className="text-gray-500 text-xs mb-6">
                            <p>A confirmation email has been sent to your registered email address.</p>
                            <p className="mt-1">For any queries, contact us at <a href="mailto:support@publicationmart.com" className="text-indigo-400 hover:underline">support@publicationmart.com</a></p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            {isUploadRequired ? (
                                <Link
                                    href={route('professional.upload', serviceRequest?.id)}
                                    className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    Upload Manuscript Now
                                </Link>
                            ) : (
                                <Link
                                    href={route('dashboard')}
                                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    Go to Dashboard
                                </Link>
                            )}

                            <Link
                                href={route('dashboard')}
                                className="w-full py-3 text-gray-400 hover:text-white font-medium text-sm transition-colors"
                            >
                                ← Back to Dashboard
                            </Link>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-6 flex justify-center gap-6 text-gray-600 text-xs">
                        <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span>Secure Payment</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>24hr Response</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

