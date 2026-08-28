import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { usePage } from '@inertiajs/react';

export default function Layout({ children }) {
    const { auth, flash } = usePage().props;

    return (
        <div className="min-h-screen flex flex-col bg-[#f0ece3]">
            <Navbar key={auth?.user?.id || 'guest'} />

            {/* Global Flash Messages */}
            {(flash?.success || flash?.error) && (
                <div className="fixed top-24 right-4 z-[100] max-w-sm w-full animate-slide-in-right pointer-events-none">
                    <div className="pointer-events-auto">
                        {flash.success && (
                            <div className="bg-[#221f18] border-l-4 border-emerald-500 text-white p-4 rounded-r shadow-2xl flex items-start gap-3 mb-4 ring-1 ring-white/10">
                                <div className="p-1 bg-emerald-500/20 rounded-full">
                                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-emerald-400 text-sm">Success</p>
                                    <p className="text-sm text-gray-300">{flash.success}</p>
                                </div>
                                <button onClick={() => flash.success = null} className="ml-auto text-gray-500 hover:text-white transition">×</button>
                            </div>
                        )}
                        {flash.error && (
                            <div className="bg-[#221f18] border-l-4 border-red-500 text-white p-4 rounded-r shadow-2xl flex items-start gap-3 mb-4 ring-1 ring-white/10">
                                <div className="p-1 bg-red-500/20 rounded-full">
                                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-red-400 text-sm">Error</p>
                                    <p className="text-sm text-gray-300">{flash.error}</p>
                                </div>
                                <button onClick={() => flash.error = null} className="ml-auto text-gray-500 hover:text-white transition">×</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 80px matches the navbar height exactly — a larger value exposed a
                strip of the layout background between the bar and the page. */}
            <main className="flex-1 pt-[80px]">
                {children}
            </main>
            <Footer />
        </div>
    );
}

