
// Theme configurations for Paged.js
export const themeStyles = {
    'Standard Book': {
        bodyFont: 'Georgia, serif',
        headingFont: 'Georgia, serif',
        lineHeight: 1.6,
        chapterAlign: 'center',
        dropCap: false
    },
    'Horror Style': {
        bodyFont: "'Crimson Text', serif",
        headingFont: "'Creepster', cursive",
        lineHeight: 1.5,
        chapterAlign: 'left',
        dropCap: true
    },
    'Kavithai Style': {
        bodyFont: "'Noto Serif Tamil', serif",
        headingFont: "'Noto Serif Tamil', serif",
        lineHeight: 2.0,
        chapterAlign: 'center',
        dropCap: false
    },
    'Magazine Template': {
        bodyFont: "'Lato', sans-serif",
        headingFont: "'Montserrat', sans-serif",
        lineHeight: 1.4,
        chapterAlign: 'left',
        dropCap: true
    },
    'Bordered Style': {
        bodyFont: "'Merriweather', serif",
        headingFont: "'Merriweather', serif",
        lineHeight: 1.6,
        chapterAlign: 'center',
        dropCap: false,
        border: true
    },
    'RK publication Template': {
        bodyFont: "'Comic Sans MS', cursive, sans-serif",
        headingFont: "'Comic Sans MS', cursive, sans-serif",
        lineHeight: 1.5,
        chapterAlign: 'center',
        dropCap: false
    }
};

// Calculate page dimensions in inches
export const getPageDimensions = (sizeStr) => {
    const map = {
        '5x8': { w: 5, h: 8 },
        '5.5x8.5': { w: 5.5, h: 8.5 },
        '6x9': { w: 6, h: 9 },
        '8.5x11': { w: 8.5, h: 11 },
    };
    const cleanSize = sizeStr ? sizeStr.replace(/\s/g, '').toLowerCase() : '6x9';
    return map[cleanSize] || { w: 6, h: 9 };
};

// Helper: get CSS content value for a header slot
const getHeaderContent = (slot, bookInfo = {}) => {
    switch (slot) {
        case 'author_name':
            return bookInfo.authorName
                ? `"${bookInfo.authorName}"`
                : '"Author"';
        case 'book_title':
            return bookInfo.bookTitle
                ? `"${bookInfo.bookTitle}"`
                : '"Untitled"';
        case 'chapter_title':
            // Use CSS string() running header — set from h1 elements
            return 'string(chapter-title)';
        case 'none':
        default:
            return 'none';
    }
};

// Generate CSS for Paged.js
// headerSettings: { leftContent, rightContent, showPageNumbers }
// bookInfo: { authorName, bookTitle }
// customSettings: { currentFont, currentLineHeight, paragraphStyle, etc. }
export const getPagedStyles = (width, height, marginInfo, themeName = 'Standard Book', headerSettings = null, bookInfo = null, customSettings = null) => {
    const baseTheme = themeStyles[themeName] || themeStyles['Standard Book'];

    // Merge custom settings if provided
    const theme = {
        ...baseTheme,
        bodyFont: customSettings?.currentFont || baseTheme.bodyFont,
        lineHeight: customSettings?.currentLineHeight || baseTheme.lineHeight,
    };

    // ... headers logic ...
    const info = bookInfo || {};
    const headers = headerSettings || {
        leftContent: 'author_name',
        rightContent: 'chapter_title',
        showPageNumbers: true,
    };

    const leftHeaderCSS = headers.leftContent !== 'none' ? `
        content: ${getHeaderContent(headers.leftContent, info)};
        font-size: 8pt;
        font-family: ${theme.bodyFont};
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #666;
    ` : 'content: none;';

    const rightHeaderCSS = headers.rightContent !== 'none' ? `
        content: ${getHeaderContent(headers.rightContent, info)};
        font-size: 8pt;
        font-family: ${theme.bodyFont};
        font-style: italic;
        color: #666;
    ` : 'content: none;';

    const pageNumContent = headers.showPageNumbers ? 'counter(page)' : 'none';

    return `
    /* --- RESET & BASICS --- */
    @page {
        size: ${width}in ${height}in;
        margin: ${marginInfo.top}in ${marginInfo.outside}in ${marginInfo.bottom}in ${marginInfo.inside}in;
    }

    /* --- LEFT (EVEN) PAGES --- */
    @page :left {
        margin-left: ${marginInfo.outside}in;
        margin-right: ${marginInfo.inside}in;

        @top-left {
            ${leftHeaderCSS}
        }
        @bottom-left {
            content: ${pageNumContent};
            font-size: 9pt;
            font-family: ${theme.bodyFont};
        }
    }

    /* --- RIGHT (ODD) PAGES --- */
    @page :right {
        margin-left: ${marginInfo.inside}in;
        margin-right: ${marginInfo.outside}in;

        @top-right {
            ${rightHeaderCSS}
        }
        @bottom-right {
            content: ${pageNumContent};
            font-size: 9pt;
            font-family: ${theme.bodyFont};
        }
    }

    /* --- FIRST PAGE: No headers or page numbers --- */
    @page :first {
        @top-left { content: none; }
        @top-right { content: none; }
        @bottom-left { content: none; }
        @bottom-right { content: none; }
        @bottom-center { content: none; }
        margin-top: ${marginInfo.top}in;
    }

    /* --- FRONT MATTER PAGES: No page numbers or headers --- */
    @page frontmatter {
        @top-left { content: none; }
        @top-right { content: none; }
        @bottom-left { content: none; }
        @bottom-right { content: none; }
        @bottom-center { content: none; }
    }
    @page frontmatter:left {
        margin-left: ${marginInfo.outside}in;
        margin-right: ${marginInfo.inside}in;
        @top-left { content: none; }
        @bottom-left { content: none; }
    }
    @page frontmatter:right {
        margin-left: ${marginInfo.inside}in;
        margin-right: ${marginInfo.outside}in;
        @top-right { content: none; }
        @bottom-right { content: none; }
    }

    /* --- THEME STYLES --- */
    
    .pagedjs_page {
        font-family: ${theme.bodyFont};
        line-height: ${theme.lineHeight};
        color: black;
    }

    /* Headings */
    h1, h2, h3, h4, h5, h6 {
        font-family: ${theme.headingFont};
        font-weight: bold;
        line-height: 1.2;
        page-break-after: avoid;
    }

    /* Chapter Titles — set running header string */
    h1.chapter-title, h1 {
        string-set: chapter-title content();
        break-before: right;
        margin-top: 30%;
        text-align: ${theme.chapterAlign};
        font-size: 24pt;
        margin-bottom: 3rem;
    }

    h2 {
        font-size: 18pt;
        margin-top: 2rem !important;
        margin-bottom: 1rem;
    }

    /* Section Handling */
    .section-container {
        break-after: page;
    }

    /* Front matter sections: use frontmatter named page (no page numbers) */
    .section-container.front-matter-section {
        page: frontmatter;
    }

    /* First chapter section resets the page counter to 1 */
    .section-container.first-chapter-section {
        counter-reset: page 1;
    }

    /* Paragraphs */
    p {
        font-size: 11pt;
        text-align: justify;
        text-indent: 1.5em;
        margin: 0;
        widows: 2;
        widows: 2;
        orphans: 2;
    }
    
    strong, b {
        font-weight: bold;
    }

    em, i {
        font-style: italic;
    }

    p + p {
        margin-top: 0;
    }

    /* No indent after headings */
    h1 + p, h2 + p, h3 + p, h1.chapter-title + p {
        text-indent: 0;
    }

    /* Images */
    img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 1em auto;
    }

    /* Scene Breaks */
    .scene-break {
        text-align: center;
        margin: 1.5em 0;
        page-break-inside: avoid;
    }

    /* --- SPECIAL FEATURES --- */

    ${theme.dropCap ? `
    /* Drop Cap */
    h1.chapter-title + p::first-letter, h1 + p::first-letter {
        font-size: 3.5em;
        float: left;
        line-height: 0.8;
        padding-right: 0.1em;
        padding-top: 0.1em;
        font-family: ${theme.headingFont};
    }
    ` : ''}

    ${theme.border ? `
    /* Bordered Page Effect */
    @page {
        border: 1px solid black;
    }
    ` : ''}
    
    /* --- PAGINATION SEMANTICS --- */
    
    .avoid-break {
        page-break-inside: avoid;
        break-inside: avoid;
    }

    .keep-with-next {
        break-after: avoid;
        page-break-after: avoid;
    }

    .force-break {
        break-before: page;
        page-break-before: always;
    }

    h1, h2, h3, h4, h5, h6 {
        break-after: avoid;
    }

    blockquote {
        page-break-inside: avoid;
    }
    
    .pagedjs_interface { display: none !important; }
`;
};
