import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getPagedStyles, getPageDimensions } from '@/Utils/BookStyles';

/**
 * BookViewer — A page-by-page book reader powered by paged.js
 * 
 * Uses React Portal to render at the document root to avoid z-index conflicts.
 * Safely handles Paged.js rendering to prevent crashes.
 */
const BookViewer = ({
    content,
    bookSize = '6x9',
    theme = 'Standard Book',
    headerSettings = null,
    bookInfo = null,
    onClose,
    customSettings = null,
    isAdminPreview = false,
    bookId = null,
}) => {
    const iframeRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const [currentSpread, setCurrentSpread] = useState(0); // 0 = pages 1-2, 1 = pages 3-4, etc.
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showTOC, setShowTOC] = useState(false);
    const [chapters, setChapters] = useState([]);  // { title, pageIndex }
    const containerRef = useRef(null);

    // Zoom state for user control
    const [zoom, setZoom] = useState(1.0);

    const dims = getPageDimensions(bookSize);

    const margins = {
        top: 0.75,
        bottom: 0.75,
        inside: 0.875,
        outside: 0.625
    };

    // Calculate total spreads
    const totalSpreads = Math.ceil(totalPages / 2);

    // Get current page numbers for this spread
    const leftPageNum = currentSpread * 2 + 1;
    const rightPageNum = currentSpread * 2 + 2;

    // Google Fonts dependencies
    const googleFontsURL = "https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,600;1,400&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Open+Sans:wght@400;600;700&family=Roboto:wght@400;500;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Noto+Serif+Tamil:wght@400;600&family=Lato:wght@400;700&family=Montserrat:wght@400;600;700&family=Cinzel:wght@400;600;700&display=swap";

    useEffect(() => {
        if (!content || !iframeRef.current) return;

        setLoading(true);

        const doc = iframeRef.current.contentDocument;

        // 1. Sanitize Content
        // Remove contenteditable attributes which confuse the layout engine
        const safeContent = content
            .replace(/contenteditable="[^"]*"/g, '')
            .replace(/contenteditable/g, '');

        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <link href="${googleFontsURL}" rel="stylesheet">
                <script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"><\/script>
                <style>
                    /* GLOBAL RESETS */
                    * { box-sizing: border-box; }
                    html, body { margin: 0; padding: 0; width: 100%; height: 100%; }
                    
                    #loading {
                        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                        font-family: 'Inter', sans-serif; color: #888; font-size: 14px;
                    }
                    .pagedjs_interface { display: none; }
                    body { overflow: hidden; }
                    
                    /* Paged.js Stability CSS */
                    img { break-inside: avoid; max-width: 100%; }
                    table, tr, td, th { break-inside: auto; }
                    .pagedjs_print-content { display: none; }
                </style>
                <style id="book-styles">
                    ${getPagedStyles(dims.w, dims.h, margins, theme, headerSettings, bookInfo, customSettings)}
                </style>
                <script>
                    // GLOBAL ERROR TRAP
                    window.onerror = function(msg, url, line, col, error) {
                        window.parent.postMessage({ type: 'BOOK_VIEWER_ERROR', error: msg }, '*');
                        return true; 
                    };
                    window.onunhandledrejection = function(event) {
                        window.parent.postMessage({ type: 'BOOK_VIEWER_ERROR', error: event.reason ? event.reason.message : "Async Error" }, '*');
                    };
                <\/script>
            </head>
            <body>
                <div id="loading">Paginating Book...</div>
                <div id="paged-content" class="pagedjs-print-content">
                    ${safeContent}
                </div>
                <script>
                    window.PagedConfig = {
                        auto: false,
                        after: (flow) => {
                            const loader = document.getElementById('loading');
                            if(loader) loader.style.display = 'none';

                            const pages = document.querySelectorAll('.pagedjs_page');
                            const chaptersData = [];
                            pages.forEach((page, idx) => {
                                const h1 = page.querySelector('h1, .chapter-title');
                                if (h1) chaptersData.push({ title: h1.textContent.trim(), pageIndex: idx });
                            });

                            window.parent.postMessage({
                                type: 'BOOK_VIEWER_READY',
                                totalPages: flow.total,
                                chapters: chaptersData
                            }, '*');
                        }
                    };
                    
                    document.addEventListener('DOMContentLoaded', () => {
                        const runPaged = async () => {
                             if (window.PagedPolyfill) {
                                try {
                                    await window.PagedPolyfill.preview();
                                } catch (e) {
                                    throw e; 
                                }
                            } else {
                                setTimeout(runPaged, 100);
                            }
                        };
                        setTimeout(runPaged, 50);
                    });
                <\/script>
            </body>
            </html>
        `);
        doc.close();

        const handler = (e) => {
            if (e.data) {
                if (e.data.type === 'BOOK_VIEWER_READY') {
                    setTotalPages(e.data.totalPages);
                    setChapters(e.data.chapters || []);
                    setLoading(false);
                    setTimeout(() => showSpread(0), 100);
                }
                if (e.data.type === 'BOOK_VIEWER_ERROR') {
                    console.warn("Book Render Warning:", e.data.error);
                    setLoading(false);
                    alert("Preview Error: Content too complex. " + e.data.error);
                }
            }
        };
        window.addEventListener('message', handler);

        return () => window.removeEventListener('message', handler);
    }, [content, bookSize, theme]);

    // Show a specific spread (pair of pages)
    const showSpread = useCallback((spreadIndex) => {
        if (!iframeRef.current) return;
        try {
            const doc = iframeRef.current.contentDocument;
            const pages = doc.querySelectorAll('.pagedjs_page');
            if (!pages.length) return;

            pages.forEach((page, idx) => {
                const leftIdx = spreadIndex * 2;
                const rightIdx = spreadIndex * 2 + 1;

                // Reset basic styles
                page.style.display = 'none';
                page.style.position = 'relative'; // Ensure not absolute

                if (idx === leftIdx || idx === rightIdx) {
                    page.style.display = 'block';
                    // We might need flexbox inside the iframe body to center them?
                    // But styling them 'block' with the container 'flex' usually works.
                }
            });
        } catch (e) {
            console.error("Error showing spread:", e);
        }
    }, []);

    // Navigation
    const goToSpread = useCallback((newSpread) => {
        const clamped = Math.max(0, Math.min(newSpread, totalSpreads - 1));
        setCurrentSpread(clamped);
        showSpread(clamped);
    }, [totalSpreads, showSpread]);

    const nextPage = useCallback(() => goToSpread(currentSpread + 1), [currentSpread, goToSpread]);
    const prevPage = useCallback(() => goToSpread(currentSpread - 1), [currentSpread, goToSpread]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                nextPage();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevPage();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                if (isFullscreen) {
                    toggleFullscreen();
                } else {
                    onClose?.();
                }
            } else if (e.key === 'Home') {
                e.preventDefault();
                goToSpread(0);
            } else if (e.key === 'End') {
                e.preventDefault();
                goToSpread(totalSpreads - 1);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [nextPage, prevPage, isFullscreen, totalSpreads, onClose]);

    // Fullscreen toggle
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Jump to chapter
    const jumpToChapter = (pageIndex) => {
        const spread = Math.floor(pageIndex / 2);
        goToSpread(spread);
        setShowTOC(false);
    };

    // Print / Save PDF
    const handlePrint = () => {
        if (iframeRef.current) {
            const doc = iframeRef.current.contentDocument;
            const pages = doc.querySelectorAll('.pagedjs_page');
            pages.forEach(p => p.style.display = 'block');

            iframeRef.current.contentWindow.print();

            setTimeout(() => showSpread(currentSpread), 500);
        }
    };

    // Calculate dynamic dimensions for valid spread layout
    const singlePageWidth = dims.w * 96; // 96 DPI
    const singlePageHeight = dims.h * 96;
    const totalSpreadWidth = singlePageWidth * 2 + 40; // Gap included

    // Render using Portal to ensure it sits on top of everything
    if (typeof document === 'undefined') return null; // SSR protection

    return createPortal(
        <div
            ref={containerRef}
            className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col h-screen animate-in fade-in duration-300"
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
        >
            {/* ═══ TOP BAR ═══ */}
            <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0 z-50 shadow-md">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                    >
                        <div className="p-1.5 rounded-lg group-hover:bg-slate-800 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        </div>
                        <span className="hidden sm:inline font-medium text-sm">Back to Editor</span>
                    </button>
                    <div className="h-4 w-px bg-slate-800"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-amber-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                        </span>
                        <span className="text-slate-200 font-bold text-sm truncate max-w-[200px]">
                            {bookInfo?.bookTitle || 'Book Preview'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Admin Actions */}
                    {isAdminPreview && bookId && (
                        <div className="flex items-center gap-2 mr-2 border-r border-slate-800 pr-4">
                            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mr-1">
                                Admin
                            </span>

                            <a
                                href={`/admin/books/${bookId}/download-manuscript?format=docx`}
                                className="flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-colors border border-blue-600/30 hover:border-blue-600"
                                title="Download Word (.docx)"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                Word
                            </a>

                            <a
                                href={`/admin/books/${bookId}/download-manuscript?format=pdf`}
                                className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-colors border border-red-600/30 hover:border-red-600"
                                title="Download via DomPDF (Approximate)"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                Basic PDF
                            </a>
                        </div>
                    )}

                    <div className="flex bg-slate-800 rounded-lg p-1">
                        <button
                            onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
                            title="Pro Tip: Use - to zoom out"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                        </button>
                        <span className="text-xs font-mono text-slate-400 w-12 flex items-center justify-center border-x border-slate-700/50">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button
                            onClick={() => setZoom(z => Math.min(z + 0.1, 2.0))}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
                            title="Pro Tip: Use + to zoom in"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        </button>
                    </div>

                    <div className="h-4 w-px bg-slate-800 mx-1"></div>

                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg hover:shadow-emerald-500/25"
                        title={isAdminPreview ? "Save exactly what you see here as a PDF" : "Print or Save as PDF"}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        {isAdminPreview ? "Print Exact PDF" : "Print / Save PDF"}
                    </button>

                    <button
                        onClick={toggleFullscreen}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-2"
                        title="Toggle Fullscreen"
                    >
                        {isFullscreen ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* ═══ MAIN CONTENT AREA ═══ */}
            <div className={`flex-1 relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8 transition-colors duration-300 ${isFullscreen ? 'bg-black' : 'bg-slate-950'}`}>

                {/* Loading State */}
                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-slate-950/80 backdrop-blur-sm">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xl">📖</span>
                            </div>
                        </div>
                        <p className="mt-4 text-slate-300 font-medium animate-pulse">Formatting Pages...</p>
                        <p className="text-slate-500 text-xs mt-1">This happens in your browser</p>
                    </div>
                )}

                {/* The Iframe Container - Centered and Scaled */}
                <div
                    className="relative shadow-2xl transition-all duration-300 ease-out origin-center bg-transparent"
                    style={{
                        transform: `scale(${zoom})`,
                        opacity: loading ? 0 : 1,
                        width: 'auto',
                        height: 'auto'
                    }}
                >
                    <iframe
                        ref={iframeRef}
                        style={{
                            width: `${totalSpreadWidth}px`,
                            height: `${singlePageHeight}px`,
                            border: 'none',
                            background: 'transparent',
                        }}
                        sandbox="allow-same-origin allow-scripts allow-modals"
                    />

                    {/* Navigation Handlers (Overlay) */}
                    {!loading && totalPages > 0 && (
                        <>
                            {/* Previous Page Zone (Left part of screen) */}
                            <div
                                className="absolute top-0 bottom-0 -left-20 w-32 flex items-center justify-end pr-4 cursor-pointer group opacity-0 hover:opacity-100 transition-opacity"
                                onClick={prevPage}
                            >
                                <div className="p-3 bg-slate-800/90 text-white rounded-full shadow-xl transform translate-x-4 group-hover:translate-x-0 transition-transform">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                                </div>
                            </div>

                            {/* Next Page Zone (Right part of screen) */}
                            <div
                                className="absolute top-0 bottom-0 -right-20 w-32 flex items-center justify-start pl-4 cursor-pointer group opacity-0 hover:opacity-100 transition-opacity"
                                onClick={nextPage}
                            >
                                <div className="p-3 bg-slate-800/90 text-white rounded-full shadow-xl transform -translate-x-4 group-hover:translate-x-0 transition-transform">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Bottom Controls (Timeline) */}
                {!loading && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 w-full max-w-xl px-4 z-50">
                        <div className="bg-slate-900/90 backdrop-blur-md rounded-full px-6 py-2 border border-slate-800 flex items-center gap-4 shadow-xl">
                            <span className="text-xs text-slate-400 font-mono w-16 text-right">
                                {Math.min(currentSpread * 2 + 1, totalPages) + (currentSpread * 2 + 2 <= totalPages ? `-${currentSpread * 2 + 2}` : '')}/{totalPages}
                            </span>
                            <div className="relative flex-1 mx-4 h-6 flex items-center">
                                <input
                                    type="range"
                                    min="0"
                                    max={Math.max(0, totalSpreads - 1)}
                                    value={currentSpread}
                                    onChange={(e) => goToSpread(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                                />
                            </div>
                            <span className="text-xs text-slate-400 font-mono w-16">
                                {Math.round(((currentSpread + 1) / totalSpreads) * 100)}%
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* TOC Drawer (Optional) */}
            {showTOC && (
                <div className="absolute top-14 bottom-0 left-0 w-64 bg-slate-900 border-r border-slate-800 z-40 overflow-y-auto animate-in slide-in-from-left duration-200">
                    <div className="p-4">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Table of Contents</h3>
                        <div className="space-y-1">
                            {chapters.map((ch, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => jumpToChapter(ch.pageIndex)}
                                    className="block w-full text-left px-3 py-2 rounded hover:bg-slate-800 text-sm text-slate-300 hover:text-white transition-colors truncate"
                                >
                                    {ch.title}
                                </button>
                            ))}
                            {chapters.length === 0 && (
                                <p className="text-slate-600 text-sm italic">No chapters found.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>,
        document.body
    );
};

export default BookViewer;
