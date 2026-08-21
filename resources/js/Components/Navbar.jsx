import { Link, usePage, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ApplicationLogo from './ApplicationLogo';

export default function Navbar() {
    const { url, props } = usePage();
    const auth = props?.auth || {};
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [url]);

    // Hide on auth pages
    const hidePaths = ['/login', '/register'];
    if (hidePaths.some(path => url.startsWith(path))) return null;

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    const publishUrl = auth?.user?.is_admin ? route('admin.books.create') : route('how-to-publish');

    const navLinks = [
        { href: route('welcome'), label: 'Home' },
        { href: route('about'), label: 'About' },
        { href: publishUrl, label: 'Publish' },
        { href: route('challenges.index'), label: 'Challenge' },
        { href: route('book-store.index'), label: 'Book Store' },
        { href: route('blogs.index'), label: 'Book Studio' },
        { href: route('contact'), label: 'Contact' },
    ];

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-[99999] bg-gradient-to-r from-indigo-950/90 via-purple-950/90 to-indigo-950/90 backdrop-blur-lg border-b border-white/10 h-[80px] shadow-lg shadow-purple-900/10"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">
                <Link href={route('welcome')} className="flex items-center -ml-2 shrink-0 transition-transform hover:scale-[1.02] active:scale-95">
                    <ApplicationLogo className="h-20 w-auto drop-shadow-[0_0_10px_rgba(34,211,238,0.2)]" />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex gap-8 items-center">
                    {navLinks.map(link => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="text-xs uppercase tracking-widest text-white/80 hover:text-indigo-400 transition-all duration-75 py-1 px-2 hover:bg-white/10 rounded-md"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-4">
                        {auth?.user ? (
                            <>
                                <Link
                                    href={auth?.user?.is_admin ? route('admin.dashboard') : route('dashboard')}
                                    className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all duration-75"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="px-6 py-2 rounded-full border-2 border-white/30 text-white text-sm font-medium hover:bg-white/10 hover:border-white/50 transition-all duration-75 shadow-lg"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href={route('login')} className="text-white/80 text-sm hover:text-indigo-400 transition-colors font-medium">
                                    Login
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-medium transition-all duration-75 shadow-lg hover:shadow-xl"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Hamburger Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="Toggle mobile menu"
                    >
                        {isMobileMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-[80px] left-0 right-0 bg-[#0f0a1e]/95 backdrop-blur-xl border-b border-indigo-500/40 p-4 flex flex-col gap-2 shadow-2xl animate-fade-in-down">
                    {navLinks.map(link => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="text-sm uppercase tracking-widest text-white/80 hover:text-indigo-400 py-3 px-4 hover:bg-white/5 rounded-md transition-all duration-75"
                        >
                            {link.label}
                        </Link>
                    ))}

                    {/* Mobile Auth Buttons */}
                    <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3 sm:hidden">
                        {auth?.user ? (
                            <>
                                <Link
                                    href={auth?.user?.is_admin ? route('admin.dashboard') : route('dashboard')}
                                    className="w-full text-center px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all duration-75"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-6 py-2 rounded-full border-2 border-white/30 text-white text-sm font-medium hover:bg-white/10 hover:border-white/50 transition-all duration-75"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href={route('login')} className="px-4 py-2 text-center text-white/80 text-sm hover:text-indigo-400 transition-colors font-medium hover:bg-white/5 rounded-md">
                                    Login
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="w-full text-center px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-medium transition-all duration-75 shadow-lg"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
