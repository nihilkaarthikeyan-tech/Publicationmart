import React, { useEffect, useRef, useState } from 'react';
import { getPagedStyles, getPageDimensions } from '@/Utils/BookStyles';

const PagedPreview = ({
    content,
    bookSize = '6x9',
    theme = 'Standard Book',
    headerSettings = null,
    bookInfo = null,
    onClose
}) => {
    const iframeRef = useRef(null);
    const [loading, setLoading] = useState(true);

    const dims = getPageDimensions(bookSize);

    // Standard Trade Book Margins
    const margins = {
        top: 0.75,
        bottom: 0.75,
        inside: 0.875, // Gutter margin
        outside: 0.625
    };

    useEffect(() => {
        if (!content || !iframeRef.current) return;

        setLoading(true);
        console.time('paged-render');

        const doc = iframeRef.current.contentDocument;

        // 1. Write Initial HTML Structure to Iframe
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"><\/script>
                <style>
                    /* Loader styling inside iframe */
                    #loading { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); font-family: sans-serif; color: #666; }
                    /* Hide Paged.js interface */
                    .pagedjs_interface { display: none; }
                </style>
                <style id="book-styles">
                    ${getPagedStyles(dims.w, dims.h, margins, theme, headerSettings, bookInfo)}
                </style>
            </head>
            <body>
                <div id="loading">Generating Layout...</div>
                <div id="content" class="pagedjs-print-content">
                    ${content}
                </div>
                <script>
                    window.PagedConfig = {
                        auto: false,
                        after: (flow) => {
                            const loader = document.getElementById('loading');
                            if(loader) loader.style.display = 'none';
                            // Notify parent
                            window.parent.postMessage({ type: 'PAGED_COMPLETE', pages: flow.total }, '*');
                        }
                    };
                    
                    // Wait for Paged.js to load then run
                    document.addEventListener('DOMContentLoaded', () => {
                        if (window.PagedPolyfill) {
                            window.PagedPolyfill.preview();
                        } else {
                            // Poll for it in case script is slow
                            const check = setInterval(() => {
                                if (window.PagedPolyfill) {
                                    clearInterval(check);
                                    window.PagedPolyfill.preview();
                                }
                            }, 100);
                        }
                    });
                <\/script>
            </body>
            </html>
        `);
        doc.close();

        // 2. Listen for completion message
        const handler = (e) => {
            if (e.data && e.data.type === 'PAGED_COMPLETE') {
                console.timeEnd('paged-render');
                console.log("Paged.js (Iframe) finished:", e.data.pages, "pages");
                setLoading(false);
            }
        };
        window.addEventListener('message', handler);

        return () => {
            window.removeEventListener('message', handler);
        };

    }, [content, bookSize, theme, headerSettings, bookInfo]);

    const handlePrint = () => {
        if (iframeRef.current) {
            iframeRef.current.contentWindow.print();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col h-screen">
            {/* Header */}
            <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        &larr; Back to Editor
                    </button>
                    <span className="text-slate-400 text-sm">
                        Print Preview ({bookSize} in)
                    </span>
                </div>
                <div>
                    {loading && <span className="text-indigo-400 font-bold animate-pulse">Generating Layout...</span>}
                    {!loading && <button onClick={handlePrint} className="text-white hover:text-indigo-400">Print / Save PDF</button>}
                </div>
            </div>

            {/* Preview Container */}
            <div className="flex-1 overflow-auto bg-slate-900/50 p-8 flex justify-center">
                <iframe
                    ref={iframeRef}
                    className="bg-white shadow-2xl origin-top scale-90 sm:scale-100 transition-transform"
                    style={{
                        width: '100%',
                        height: '100%',
                        maxWidth: '12in', // Limit max width for readability
                        border: 'none'
                    }}
                    sandbox="allow-same-origin allow-scripts allow-modals allow-popups"
                />
            </div>
        </div>
    );
};

export default PagedPreview;
