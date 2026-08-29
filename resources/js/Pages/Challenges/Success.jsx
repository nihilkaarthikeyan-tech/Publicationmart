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

            <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
                <div className="w-full max-w-lg">

                    {/* Success Card */}
                    <div className="bg-paper backdrop-blur-xl rounded-3xl border border-linen shadow-2xl overflow-hidden text-center">

                        {/* Success Animation */}
                        <div className="pt-12 pb-6">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce">
                                <svg className="w-12 h-12 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            <h1 className="text-3xl font-black text-ink mb-2">Enrollment Successful!</h1>
                            <p className="text-umber">Welcome to the Poetry Challenge</p>
                        </div>

                        {/* Enrollment Details */}
                        <div className="px-8 pb-6">
                            <div className="bg-paper rounded-2xl p-6 border border-linen text-left">
                                <h3 className="text-umber text-xs uppercase tracking-wider mb-4 text-center">Your Enrollment Details</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-linen">
                                        <span className="text-umber">Name</span>
                                        <span className="text-ink font-semibold">{enrollment.full_name}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-linen">
                                        <span className="text-umber">Email</span>
                                        <span className="text-ink font-semibold">{enrollment.email}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-linen">
                                        <span className="text-umber">Mobile</span>
                                        <span className="text-ink font-semibold">{enrollment.mobile_number}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-linen">
                                        <span className="text-umber">City</span>
                                        <span className="text-ink font-semibold">{enrollment.city}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-linen">
                                        <span className="text-umber">Challenge</span>
                                        <span className="text-indigo-700 font-semibold">{enrollment.challenge_type}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-umber">Amount Paid</span>
                                        <span className="text-emerald-700 font-bold text-lg">₹{enrollment.entry_fee}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div className="px-8 pb-8">
                            <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-2xl p-6 border border-indigo-500/30 mb-6">
                                <h3 className="text-ink font-bold text-lg mb-3">🎯 What's Next?</h3>
                                <p className="text-ink-soft text-sm leading-relaxed">
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
                                    className="block w-full py-4 bg-vellum hover:bg-vellum text-ink font-bold rounded-xl border border-linen transition-all text-center"
                                >
                                    Already have an account? Login
                                </Link>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-linen py-4 bg-paper">
                            <p className="text-umber text-sm">
                                Need help? <a href="mailto:support@publicationmart.com" className="text-indigo-700 hover:underline">Contact Support</a>
                            </p>
                        </div>
                    </div>

                    {/* Back to Home */}
                    <div className="mt-6 text-center">
                        <Link
                            href="/"
                            className="text-umber hover:text-ink text-sm transition-colors inline-flex items-center gap-2"
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
