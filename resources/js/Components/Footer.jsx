import { Link } from '@inertiajs/react';

export default function Footer() {
    const guidedPublishingLinks = [
        { name: 'How to Publish', href: route('how-to-publish') },
        { name: 'Publishing Workflow', href: route('how-to-publish') },
        { name: 'Author Resources', href: route('resources') },
        { name: 'Royalty Calculator', href: route('royalties.calculator') },
        { name: 'Pricing Plans', href: route('welcome') + '#pricing-section' },
        { name: 'AI Studio (Writing & Formatting)', href: route('books.create') },
    ];

    const readLinks = [
        { name: 'Trending This Week', href: route('book-store.index') },
        { name: 'New Releases', href: route('book-store.index') },
        { name: "Editor's Picks", href: route('book-store.index') },
        { name: 'Best Sellers', href: route('book-store.index') },
        { name: 'Book Studio & Insights', href: route('blogs.index') },
    ];

    const servicesLinks = [
        { name: 'Smart Writer', href: route('guest-writer.pricing') },
        { name: 'Automatic Book Formatting', href: route('services.formatting-tool') },
        { name: 'Cover Page Designer', href: route('services.cover-designer') },
        { name: 'eBook & Print Publishing', href: route('services.ebook-print') },
        { name: 'ISBN & Global Distribution', href: route('services.isbn-distribution') },
        { name: 'Help Center', href: route('help-center') },
    ];

    const companyLinks = [
        { name: 'About Us', href: route('about') },
        { name: 'Contact Us', href: route('contact') },
        { name: 'Careers', href: route('careers') },
        { name: 'Partners', href: route('contact') },
        { name: 'Challenges & Contests', href: route('challenges.index') },
    ];

    const legalLinks = [
        { name: 'Terms & Conditions', href: route('terms-and-conditions') },
        { name: 'Privacy Policy', href: route('privacy-policy') },
        { name: 'Copyright Policy', href: route('terms-and-conditions') },
        { name: 'Refund Policy', href: route('terms-and-conditions') },
    ];

    const socialIcons = [
        {
            name: 'WhatsApp',
            href: 'https://whatsapp.com/channel/0029VaDNAMO9MF983m4Y5s1y',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.394 0 12.03c0 2.122.554 4.197 1.604 6.013L0 24l6.135-1.61a11.771 11.771 0 005.912 1.599h.005c6.635 0 12.032-5.395 12.035-12.031a11.77 11.77 0 00-3.525-8.514z" />
                </svg>
            )
        },
        {
            name: 'Instagram',
            href: 'https://www.instagram.com/publicationmart15?utm_source=qr&igsh=MWlubWJxN3hxMGxvdg==',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
            )
        },
        {
            name: 'Facebook',
            href: 'https://www.facebook.com/people/RK-Publications/100094272053003/',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            )
        },
        {
            name: 'YouTube',
            href: 'https://www.youtube.com/@Rademics',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.612 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
            )
        },
    ];

    return (
        // Oxblood binding cloth, matching the masthead — the two bookend the page.
        <footer className="relative z-10 bg-oxblood text-white pt-20 pb-10 border-t-2 border-foil/50">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-4 mb-16">
                    {/* Guided Publishing */}
                    <div>
                        <h3 className="text-xs font-bold text-foil-light uppercase tracking-widest mb-6">Guided Publishing</h3>
                        <ul className="space-y-4">
                            {guidedPublishingLinks.map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="text-parchment/70 hover:text-foil-light text-[14px] transition-colors">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Read */}
                    <div>
                        <h3 className="text-xs font-bold text-foil-light uppercase tracking-widest mb-6 flex items-center gap-2">
                            Discover & Read
                        </h3>
                        <ul className="space-y-4">
                            {readLinks.map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="text-parchment/70 hover:text-foil-light text-[14px] transition-colors">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="text-xs font-bold text-foil-light uppercase tracking-widest mb-6 flex items-center gap-2">
                            Services
                        </h3>
                        <ul className="space-y-4">
                            {servicesLinks.map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="text-parchment/70 hover:text-foil-light text-[14px] transition-colors">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-xs font-bold text-foil-light uppercase tracking-widest mb-6 flex items-center gap-2">
                            Company
                        </h3>
                        <ul className="space-y-4">
                            {companyLinks.map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="text-parchment/70 hover:text-foil-light text-[14px] transition-colors">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-xs font-bold text-foil-light uppercase tracking-widest mb-6 flex items-center gap-2">
                            Legal
                        </h3>
                        <ul className="space-y-4">
                            {legalLinks.map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="text-parchment/70 hover:text-foil-light text-[14px] transition-colors">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Connect With Us */}
                    <div>
                        <h3 className="text-xs font-bold text-foil-light uppercase tracking-widest mb-6 flex items-center gap-2">
                            Connect With Us
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {socialIcons.map((icon, index) => (
                                <a
                                    key={index}
                                    href={icon.href}
                                    className="p-3 rounded-xl bg-black/15 border border-foil-light/25 text-parchment hover:bg-foil hover:text-[#2b1e0a] hover:border-foil hover:scale-110 flex items-center justify-center transition-all duration-300"
                                    aria-label={icon.name}
                                >
                                    {icon.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-foil-light/20 pt-8 flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="space-y-2">
                        <Link href={route('welcome')} className="text-2xl font-black tracking-tight text-white block">
                            PublicationMart
                        </Link>
                        <p className="text-parchment/60 text-sm max-w-md">
                            Empowering authors worldwide with professional tools to design, format, and distribute their stories to a global audience.
                        </p>
                    </div>

                    <div className="text-right space-y-2">
                        <p className="text-sm font-medium text-parchment/75">
                            Built for authors. Powered by Smart Tech.
                        </p>
                        <p className="text-xs text-parchment/45">
                            © {new Date().getFullYear()} PublicationMart. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

