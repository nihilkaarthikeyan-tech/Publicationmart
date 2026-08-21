import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

export default function BookCard({ book }) {
    const { app_url } = usePage().props;

    return (
        <div className="group relative bg-[#2d2347] rounded-2xl overflow-hidden border border-violet-800/50 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col">
            {/* Clickable Cover Image */}
            <Link href={route('book-store.show', book.id)} className="relative aspect-[2/3] overflow-hidden bg-gray-800 block">
                {book.cover_design_path ? (
                    <img
                        src={`${app_url}/storage/${book.cover_design_path}`}
                        alt={book.title}
                        className="h-full w-full object-contain bg-gray-900 transform group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600">
                        <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                        <span>No Cover</span>
                    </div>
                )}
                {/* Badge */}
                <div className="absolute top-3 left-3">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-white/10">
                        {book.genre || 'General'}
                    </span>
                </div>
                {/* View Details Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <span className="text-white font-semibold text-sm bg-indigo-600 px-4 py-2 rounded-full">
                        View Details
                    </span>
                </div>
            </Link>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4">
                    <Link href={route('book-store.show', book.id)}>
                        <h3 className="text-lg font-bold text-white leading-tight mb-1 line-clamp-2 hover:text-indigo-400 transition-colors" title={book.title}>
                            {book.title}
                        </h3>
                    </Link>
                    <p className="text-sm text-gray-400">by <span className="text-indigo-400">{book.author_name}</span></p>
                </div>

                <div className="mt-auto space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-white">₹{book.selling_price}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                        <Link
                            href={route('book-store.show', book.id)}
                            className="col-span-2 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
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
