import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Success({ enrollment }) {

    // Meta Pixel: Track challenge enrollment as a Purchase
    useEffect(() => {
        if (typeof window.fbq === 'function') {
            fbq('track', 'Purchase', {
                value: parseFloat(enrollment.entry_fee),
                currency: 'INR',
            });
        }
    }, []);
    return (
        <>
            <Head title="Enrollment Successful - Poetry Challenge" />

            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 flex items-center justify-center p-4">
                <div className="w-full max-w-lg">

                    {/* Success Card */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden text-center">

                        {/* Success Animation */}
                        <div className="pt-12 pb-6">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            <h1 className="text-3xl font-black text-white mb-2">Enrollment Successful!</h1>
                            <p className="text-gray-400">Welcome to the Poetry Challenge</p>
                        </div>

                        {/* Enrollment Details */}
                        <div className="px-8 pb-6">
                            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-left">
                                <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-4 text-center">Your Enrollment Details</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-gray-400">Name</span>
                                        <span className="text-white font-semibold">{enrollment.full_name}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-gray-400">Email</span>
                                        <span className="text-white font-semibold">{enrollment.email}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-gray-400">Mobile</span>
                                        <span className="text-white font-semibold">{enrollment.mobile_number}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-gray-400">City</span>
                                        <span className="text-white font-semibold">{enrollment.city}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-gray-400">Challenge</span>
                                        <span className="text-indigo-400 font-semibold">{enrollment.challenge_type}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-400">Amount Paid</span>
                                        <span className="text-emerald-400 font-bold text-lg">₹{enrollment.entry_fee}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div className="px-8 pb-8">
                            <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-2xl p-6 border border-indigo-500/30 mb-6">
                                <h3 className="text-white font-bold text-lg mb-3">🎯 What's Next?</h3>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    Create an account or login to access your challenge dashboard,
                                    submit your entries, and track your progress throughout the competition.
                                </p>
                            </div>

                            {/* CTA Buttons */}
                            <div className="space-y-3">
                                <Link
                                    href={route('register')}
                                    className="block w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-indigo-500/30 transition-all text-center"
                                >
                                    Create Account →
                                </Link>

                                <Link
                                    href={route('login')}
                                    className="block w-full py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 transition-all text-center"
                                >
                                    Already have an account? Login
                                </Link>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-white/10 py-4 bg-white/5">
                            <p className="text-gray-500 text-sm">
                                Need help? <a href="mailto:support@publicationmart.com" className="text-indigo-400 hover:underline">Contact Support</a>
                            </p>
                        </div>
                    </div>

                    {/* Back to Home */}
                    <div className="mt-6 text-center">
                        <Link
                            href="/"
                            className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Homepage
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
