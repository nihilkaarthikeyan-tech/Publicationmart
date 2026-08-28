import React, { useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import BookViewer from '@/Components/Preview/BookViewer';

export default function ManuscriptPreview({ book, formattingData, interiorFile, layoutMethod }) {

    // CASE 1: Uploaded Manuscript (Word/PDF)
    if (interiorFile || layoutMethod === 'upload') {
        return (
            <>
                <Head title={`Preview: ${book.title}`} />
                <div className="min-h-screen bg-paper flex items-center justify-center p-6">
                    <div className="bg-paper p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-slate-700">
                        <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-ink mb-2">Uploaded Manuscript</h2>
                        <p className="text-umber mb-8">
                            This author uploaded a pre-formatted manuscript file instead of using the online tool.
                        </p>
                        <div className="space-y-4">
                            <a
                                href={interiorFile}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download Manuscript
                            </a>
                            <Link
                                href={route('admin.books.show', book.id)}
                                className="block w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-ink-soft rounded-lg font-medium transition-colors"
                            >
                                Back to Book Details
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // CASE 2: Formatting Tool Data
    const bookViewList = useMemo(() => {
        if (!formattingData || !formattingData.sections) return [];

        const list = [];
        const sections = formattingData.sections;

        const visibleKeys = formattingData.visibleFrontMatterKeys || [];
        if (Array.isArray(visibleKeys)) {
            visibleKeys.forEach(key => {
                if (sections[key]) {
                    list.push({ id: key, title: sections[key].title || key, content: sections[key].content || '', type: 'front' });
                }
            });
        }

        (formattingData.frontMatters || []).forEach(item => {
            const sec = formattingData.sections[item.id];
            if (sec && sec.content) {
                list.push({ id: item.id, title: item.title || sec.title || '', content: sec.content, type: 'front' });
            }
        });

        (formattingData.chapters || []).forEach(item => {
            if (item.type === 'part') {
                list.push({ id: item.id, title: item.title || 'Part', content: `<div style="text-align:center;margin-top:40%;"><h1 style="font-size:2rem;">${item.title || 'Part'}</h1></div>`, type: 'part' });
            } else {
                const sec = formattingData.sections[item.id];
                if (sec) {
                    list.push({ id: item.id, title: item.title || sec.title || 'Chapter', content: sec.content || '', type: 'chapter' });
                }
            }
        });

        (formattingData.endMatters || []).forEach(item => {
            const sec = formattingData.sections[item.id];
            if (sec && sec.content) {
                list.push({ id: item.id, title: item.title || sec.title || '', content: sec.content, type: 'end' });
            }
        });

        return list;
    }, [formattingData]);

    const layout = formattingData?.layout || 'Standard Book';
    const headerSettings = formattingData?.headerSettings || {
        leftContent: 'author_name',
        rightContent: 'chapter_title',
        showPageNumbers: true,
    };

    if (bookViewList.length === 0) {
        return (
            <>
                <Head title="Manuscript Preview" />
                <div className="min-h-screen bg-paper flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-6xl mb-4">📄</div>
                        <h2 className="text-ink text-xl font-bold mb-2">No Formatted Content</h2>
                        <p className="text-ink/50 mb-6">This book hasn't been formatted yet.</p>
                        <Link href={route('admin.books.show', book.id)} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                            ← Back to Book Details
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={`Preview: ${book.title}`} />

            <BookViewer
                content={(() => {
                    let firstChapterFound = false;
                    return bookViewList.map(s => {
                        let extraClasses = '';
                        if (s.type === 'front') {
                            extraClasses = ' front-matter-section';
                        } else if ((s.type === 'chapter' || s.type === 'part') && !firstChapterFound) {
                            firstChapterFound = true;
                            extraClasses = ' first-chapter-section';
                        }
                        return `<div class="section-container${extraClasses}" id="sec-${s.id}">
                            ${s.title && s.type !== 'front' ? `<h1 class="chapter-title">${s.title}</h1>` : ''}
                            ${s.content}
                        </div>`;
                    }).join('');
                })()}
                bookSize={book.book_size || '6x9'}
                theme={layout}
                headerSettings={headerSettings}
                bookInfo={{ authorName: book.author_name, bookTitle: book.title }}
                onClose={() => window.location.href = route('admin.books.show', book.id)}
                customSettings={formattingData}
                isAdminPreview={true}
                bookId={book.id}
            />
        </>
    );
}
