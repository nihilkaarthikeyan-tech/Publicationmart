import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

// Cloth bindings for books that have no cover yet — same cloths as the
// landing-page spines, so a coverless book still looks like a book.
export const CLOTHS = [
    'linear-gradient(155deg,#2f4f45,#20362d)',
    'linear-gradient(155deg,#6e2530,#4d1a22)',
    'linear-gradient(155deg,#2b3a56,#1c2739)',
    'linear-gradient(155deg,#7a6224,#584618)',
];

/**
 * A cover rendered as a physical book: spine shading on the left, a page
 * block on the right edge, a real shadow, and a lift-and-tilt on hover
 * (the hover classes live in the store page's stylesheet as .pm-cov).
 */
export function PhysicalCover({ book, appUrl, fit = 'contain', clothIndex = 1 }) {
    return (
        <div className="pm-covwrap relative aspect-[2/3]">
            <div className="pm-cov absolute inset-0 overflow-hidden bg-[#faf8f3]">
                {book.cover_design_path ? (
                    <img
                        src={`${appUrl}/storage/${book.cover_design_path}`}
                        alt={book.title}
                        loading="lazy"
                        className="h-full w-full"
                        style={{ objectFit: fit }}
                    />
                ) : (
                    <div
                        className="flex flex-col h-full p-5"
                        style={{ background: CLOTHS[clothIndex % CLOTHS.length] }}
                    >
                        <span
                            className="text-[#f2ecdd] text-[15px] leading-snug"
                            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                        >
                            {book.title}
                        </span>
                        <span className="mt-auto pt-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#f2ecdd]/60 border-t border-[#f2ecdd]/25">
                            PublicationMart
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function BookCard({ book, clothIndex = 1 }) {
    const { app_url } = usePage().props;

    return (
        <div className="group relative flex flex-col">
            {/* Clickable physical cover */}
            <Link href={route('book-store.show', book.id)} className="block px-2 pt-2 pb-4">
                <PhysicalCover book={book} appUrl={app_url} clothIndex={clothIndex} />
            </Link>

            {/* Content — set like a catalogue entry, not a boxed card */}
            <div className="px-2 flex-1 flex flex-col">
                <div className="mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-[#d8d1c1] text-[#635c4e]">
                        {book.genre || 'General'}
                    </span>
                </div>
                <div className="mb-4">
                    <Link href={route('book-store.show', book.id)}>
                        <h3
                            className="text-[17px] leading-tight mb-1 line-clamp-2 text-[#17150f] hover:text-[#6e2530] transition-colors"
                            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                            title={book.title}
                        >
                            {book.title}
                        </h3>
                    </Link>
                    <p className="text-[13px] text-[#635c4e] line-clamp-1">{book.author_name}</p>
                </div>

                <div className="mt-auto space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-[#17150f]">₹{book.selling_price}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                        <Link
                            href={route('book-store.show', book.id)}
                            className="col-span-2 w-full py-2 bg-[#6e2530] hover:bg-[#5a1e27] text-[#faf8f3] text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            View Details
                        </Link>

                        {/* External Links (Conditional) - Enhanced with branding */}
                        {book.amazon_link && (
                            <a href={book.amazon_link} target="_blank" rel="noopener noreferrer" className="col-span-1 py-2 bg-[#FF9900] hover:bg-[#FFa500] text-black text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.493.126.112.181.063.346-.147.494-.588.419-1.522.88-2.797 1.376-1.316.525-2.89.888-4.723 1.084a22.2 22.2 0 01-5.682-.12c-3.417-.478-6.442-1.656-9.075-3.533-.175-.122-.225-.28-.15-.476.044-.093.108-.159.19-.196.082-.036.158-.02.227.048l.002.003c.024.025.055.047.09.063.227.109.454.216.683.322z" />
                                </svg>
                                Amazon
                            </a>
                        )}
                        {book.google_books_link && (
                            <a href={book.google_books_link} target="_blank" rel="noopener noreferrer" className="col-span-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                </svg>
                                Google
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
