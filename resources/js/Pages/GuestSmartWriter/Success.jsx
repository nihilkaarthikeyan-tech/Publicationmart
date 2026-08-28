import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';

export default function GuestSuccess({ session, token }) {

    // Meta Pixel: Track guest book completion as a Lead
    useEffect(() => {
        if (typeof window.fbq === 'function') {
            fbq('track', 'Lead');
        }
    }, []);
    return (
        <>
            <Head title="Book Completed! - Smart Writer" />

            <div className="min-h-screen bg-[#f0ece3] flex items-center justify-center p-4">
                <div className="w-full max-w-2xl text-center">

                    {/* Celebration Animation */}
                    <div className="mb-8 relative inline-block">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse"></div>
                        <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                            <span className="text-4xl">🎉</span>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-[#17150f] mb-4">
                        Masterpiece <span className=" text-[#6e2530]">Created!</span>
                    </h1>

                    <p className="text-xl text-[#635c4e] mb-12 max-w-lg mx-auto">
                        Your book <strong>"{session.title}"</strong> is ready.
                        To keep it safe and proceed with publishing, please link it to an account.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 mb-12">

                        {/* Option 1: Create Account */}
                        <div className="bg-[#faf8f3] border border-indigo-500/30 rounded-3xl p-8 hover:border-[#7c7364] transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6 text-indigo-700 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-[#17150f] mb-2">New Author?</h3>
                            <p className="text-[#635c4e] text-sm mb-6">Create a free account to save your book and start the publishing process.</p>

                            <Link
                                href={route('register')}
                                className="block w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors"
                            >
                                Create Account & Save
                            </Link>
                        </div>

                        {/* Option 2: Login */}
                        <div className="bg-[#faf8f3] border border-[#d8d1c1] rounded-3xl p-8 hover:border-[#d8d1c1] transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-[#e7e1d4] flex items-center justify-center mb-6 text-[#17150f] group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-[#17150f] mb-2">Already have an account?</h3>
                            <p className="text-[#635c4e] text-sm mb-6">Login to add this book to your existing dashboard.</p>

                            <Link
                                href={route('login')}
                                className="block w-full py-3 bg-[#e7e1d4] hover:bg-[#e7e1d4] text-[#17150f] font-bold rounded-xl transition-colors"
                            >
                                Login & Link Book
                            </Link>
                        </div>
                    </div>

                    <div className="text-[#635c4e] text-sm">
                        <p>Your session ID: <span className="font-mono text-[#635c4e]">{token.substring(0, 8)}...</span></p>
                        <p className="mt-2 text-xs">If you close this page, be sure to save this URL to return later.</p>
                    </div>

                </div>
            </div>
        </>
    );
}

