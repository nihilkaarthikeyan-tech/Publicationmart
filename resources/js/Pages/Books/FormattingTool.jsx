import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import React, { useState, useRef, useEffect, useMemo, useLayoutEffect, useCallback, memo } from 'react';

import DOMPurify from 'dompurify';

import {
    availableFonts,
    fontSizes,
    lineHeights,
    colorPalette,
    highlightColors,
    specialCharacters
} from '@/Data/FormattingOptions';

// Template Style Configurations — Final specs from actual .docx template files
// Body: Times New Roman 12pt | Headings: Bahnschrift 22pt | Sub-headings: Poppins 14pt
// Image Captions: Gandhi Serif 9pt italic | Title Page: Times New Roman 36pt
const TEMPLATE_CONFIGS = {
    '5 x 8': {
        fontFamily: '"Times New Roman", Times, serif',
        fontSize: 12,
        lineHeight: 1.15,
        textColor: '#000000',
        backgroundColor: '#ffffff',
        headingFont: 'Bahnschrift, "Segoe UI", sans-serif',
        headingSize: '22pt',
        headingWeight: 'bold',
        heading2Font: 'Poppins, Arial, sans-serif',
        heading2Size: '14pt',
        captionFont: '"Gandhi Serif", Georgia, serif',
        captionSize: '9pt',
        titlePageFont: '"Times New Roman", Times, serif',
        titlePageSize: '36pt',
        margins: { top: 0.75, bottom: 0.75, left: 0.9, right: 0.6 },
        paragraphStyle: 'indent',
        paragraphIndent: '0.2in',
        paragraphSpacing: '6pt'
    },
    '5.5 x 8.5': {
        fontFamily: '"Times New Roman", Times, serif',
        fontSize: 12,
        lineHeight: 1.15,
        textColor: '#000000',
        backgroundColor: '#ffffff',
        headingFont: 'Bahnschrift, "Segoe UI", sans-serif',
        headingSize: '22pt',
        headingWeight: 'bold',
        heading2Font: 'Poppins, Arial, sans-serif',
        heading2Size: '14pt',
        captionFont: '"Gandhi Serif", Georgia, serif',
        captionSize: '9pt',
        titlePageFont: '"Times New Roman", Times, serif',
        titlePageSize: '36pt',
        margins: { top: 0.75, bottom: 0.75, left: 0.85, right: 0.65 },
        paragraphStyle: 'indent',
        paragraphIndent: '0.2in',
        paragraphSpacing: '6pt'
    },
    '6x9': {
        fontFamily: '"Times New Roman", Times, serif',
        fontSize: 12,
        lineHeight: 1.15,
        textColor: '#000000',
        backgroundColor: '#ffffff',
        headingFont: 'Bahnschrift, "Segoe UI", sans-serif',
        headingSize: '22pt',
        headingWeight: 'bold',
        heading2Font: 'Poppins, Arial, sans-serif',
        heading2Size: '14pt',
        captionFont: '"Gandhi Serif", Georgia, serif',
        captionSize: '9pt',
        titlePageFont: '"Times New Roman", Times, serif',
        titlePageSize: '36pt',
        margins: { top: 0.75, bottom: 0.75, left: 0.9, right: 0.65 },
        paragraphStyle: 'indent',
        paragraphIndent: '0.2in',
        paragraphSpacing: '6pt'
    },
    '8.5 x 11': {
        fontFamily: '"Times New Roman", Times, serif',
        fontSize: 12,
        lineHeight: 1.15,
        textColor: '#000000',
        backgroundColor: '#ffffff',
        headingFont: 'Bahnschrift, "Segoe UI", sans-serif',
        headingSize: '22pt',
        headingWeight: 'bold',
        heading2Font: 'Poppins, Arial, sans-serif',
        heading2Size: '14pt',
        captionFont: '"Gandhi Serif", Georgia, serif',
        captionSize: '9pt',
        titlePageFont: '"Times New Roman", Times, serif',
        titlePageSize: '36pt',
        margins: { top: 1.0, bottom: 1.0, left: 1.0, right: 0.75 },
        paragraphStyle: 'indent',
        paragraphIndent: '0.2in',
        paragraphSpacing: '6pt'
    },
    '8.5x8.5': {
        fontFamily: '"Times New Roman", Times, serif',
        fontSize: 12,
        lineHeight: 1.15,
        textColor: '#000000',
        backgroundColor: '#ffffff',
        headingFont: 'Bahnschrift, "Segoe UI", sans-serif',
        headingSize: '22pt',
        headingWeight: 'bold',
        heading2Font: 'Poppins, Arial, sans-serif',
        heading2Size: '14pt',
        captionFont: '"Gandhi Serif", Georgia, serif',
        captionSize: '9pt',
        titlePageFont: '"Times New Roman", Times, serif',
        titlePageSize: '36pt',
        margins: { top: 1.0, bottom: 1.0, left: 1.0, right: 1.0 },
        paragraphStyle: 'indent',
        paragraphIndent: '0.25in',
        paragraphSpacing: '6pt'
    },
    '16.5x11': {
        fontFamily: '"Times New Roman", Times, serif',
        fontSize: 20,
        lineHeight: 1.15,
        textColor: '#000000',
        backgroundColor: '#ffffff',
        headingFont: '"Felix Titling", "Times New Roman", serif',
        headingSize: '58pt',
        headingWeight: 'bold',
        heading2Font: 'Calibri, sans-serif',
        heading2Size: '28pt',
        captionFont: '"Times New Roman", Times, serif',
        captionSize: '20pt',
        titlePageFont: 'Castellar, serif',
        titlePageSize: '48pt',
        margins: { top: 0.75, bottom: 0.75, left: 0.75, right: 0.75 },
        paragraphStyle: 'block',
        paragraphIndent: '0',
        paragraphSpacing: '6pt'
    }
};

// Helper function to get template configuration
function getTemplateConfig(bookSize) {
    const sizeFormatName = getDefaultLayout(bookSize);
    return TEMPLATE_CONFIGS[sizeFormatName] || TEMPLATE_CONFIGS['5.5 x 8.5'];
}

function getDefaultLayout(size) {
    if (!size) return '5.5 x 8.5';
    const s = size.toLowerCase().replace(/\s/g, '');
    const sizeMap = {
        '5x8': '5 x 8',
        '5.5x8.5': '5.5 x 8.5',
        '6x9': '6 x 9',
        '8.5x11': '8.5 x 11',
        '8.5x8.5': '8.5 x 8.5',
        '16.5x11': '16.5 x 11'
    };
    return sizeMap[s] || '5.5 x 8.5';
}

// Calculate page dimensions based on book size AND template layout for editor pagination
function getPageDimensions(bookSize) {
    // Base Dimensions for Book Sizes (Inches) - All 6 sizes from UI
    const sizeMap = {
        '5x8': { w: 5, h: 8, name: 'Story/Poetry' },
        '5.5x8.5': { w: 5.5, h: 8.5, name: 'Story/Poetry' },
        '6x9': { w: 6, h: 9, name: 'Academic/Non-Fiction' },
        '8.5x8.5': { w: 8.5, h: 8.5, name: "Children's Books" },
        '8.5x11': { w: 8.5, h: 11, name: 'Academic/Non-Fiction' },
        '16.5x11': { w: 16.5, h: 11, name: 'Magazine' }
    };

    // Parse book size (handle spaces in "5.5 x 8.5" or "5.5x8.5")
    const s = bookSize ? bookSize.toLowerCase().replace(/\s/g, '') : '5.5x8.5';
    const dims = sizeMap[s] || { w: 5.5, h: 8.5, name: 'Default' };

    // Get margins from centralized template config based on Book Size
    const templateConfig = getTemplateConfig(bookSize);
    const margins = templateConfig.margins;

    // Calculate editor dimensions based on book size
    const DPI = 96; // Standard screen DPI (1 inch = 96 pixels)

    // Calculate actual page dimensions in pixels at 100% scale
    const actualPageWidth = Math.round(dims.w * DPI);
    const actualPageHeight = Math.round(dims.h * DPI);

    // Define comfortable viewing ranges for editor
    const MAX_EDITOR_WIDTH = 900;  // Max width before scaling down
    const MIN_EDITOR_WIDTH = 480;  // Min width (for small books like 5x8)
    const OPTIMAL_WIDTH = 816;     // Target width for standard sizes

    let pageWidth = actualPageWidth;
    let pageHeight = actualPageHeight;
    let scaleFactor = 1;

    // Size-specific scaling logic
    if (s === '16.5x11') {
        // Magazine size - scale down significantly to fit screen
        scaleFactor = MAX_EDITOR_WIDTH / actualPageWidth;
        pageWidth = MAX_EDITOR_WIDTH;
        pageHeight = Math.round(actualPageHeight * scaleFactor);
    }
    else if (s === '8.5x11' || s === '8.5x8.5') {
        // Large standard sizes - use optimal width
        pageWidth = OPTIMAL_WIDTH;
        scaleFactor = OPTIMAL_WIDTH / actualPageWidth;
        pageHeight = Math.round(actualPageHeight * scaleFactor);
    }
    else if (s === '6x9') {
        // Medium size - scale to comfortable viewing
        scaleFactor = 700 / actualPageWidth;
        pageWidth = 700;
        pageHeight = Math.round(actualPageHeight * scaleFactor);
    }
    else if (s === '5x8' || s === '5.5x8.5') {
        // Small sizes - scale up slightly for comfortable editing
        scaleFactor = 650 / actualPageWidth;
        pageWidth = 650;
        pageHeight = Math.round(actualPageHeight * scaleFactor);
    }
    else {
        // Fallback for any other sizes
        if (actualPageWidth > MAX_EDITOR_WIDTH) {
            scaleFactor = MAX_EDITOR_WIDTH / actualPageWidth;
            pageWidth = MAX_EDITOR_WIDTH;
            pageHeight = Math.round(actualPageHeight * scaleFactor);
        } else if (actualPageWidth < MIN_EDITOR_WIDTH) {
            scaleFactor = MIN_EDITOR_WIDTH / actualPageWidth;
            pageWidth = MIN_EDITOR_WIDTH;
            pageHeight = Math.round(actualPageHeight * scaleFactor);
        }
    }

    // Convert Inch Margins to Pixels (scaled proportionally)
    const marginLeft = Math.round(((margins.left || margins.side || 0.75) / dims.w) * pageWidth);
    const marginRight = Math.round(((margins.right || margins.side || 0.75) / dims.w) * pageWidth);
    const marginTop = Math.round((margins.top / dims.h) * pageHeight);
    const marginBottom = Math.round((margins.bottom / dims.h) * pageHeight);

    const contentHeight = pageHeight - marginTop - marginBottom - 30; // Reserve 30px for page number footer
    const marginSide = marginLeft; // backward compat
    const pageGap = 40;

    return {
        pageWidth,           // Scaled width for display
        pageHeight,          // Scaled height for display
        contentHeight,       // Available content area height
        marginTop,           // Top margin in pixels
        marginBottom,        // Bottom margin in pixels
        marginLeft,          // Left margin in pixels
        marginRight,         // Right margin in pixels
        marginSide,          // Left margin (backward compat)
        pageGap,             // Gap between pages
        totalPageHeight: pageHeight + pageGap,
        scaleFactor,         // How much we scaled (for reference)
        actualWidth: actualPageWidth,   // Real size at 100%
        actualHeight: actualPageHeight, // Real size at 100%
        rawDimensions: dims,             // Original dimensions object
        rawMargins: margins,             // Original margins object
        sizeName: dims.name              // Human-readable name
    };
}

// Helper to escape regex special characters (defined at module level to avoid TDZ errors)
function escapeRegExp(string) {
    if (!string) return '';
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ═══════════════════════════════════════════════════════════════════
// AUTOMATIC PAGINATION SYSTEM
// ═══════════════════════════════════════════════════════════════════

// Calculate if an element fits on current page
function doesElementFitOnPage(element, remainingHeight) {
    const elementHeight = element.getBoundingClientRect().height;
    return elementHeight <= remainingHeight;
}

// Split content into pages based on available height
function paginateContent(editorElement, contentHeight, pageGap) {
    if (!editorElement) return;

    // Get all block-level elements (paragraphs, headings, images, etc.)
    const elements = Array.from(editorElement.children);

    // Remove existing page breaks
    const existingBreaks = editorElement.querySelectorAll('.auto-page-break');
    existingBreaks.forEach(br => br.remove());

    let currentPageHeight = 0;
    let pageNumber = 1;

    elements.forEach((element, index) => {
        // Skip if it's a page break marker
        if (element.classList.contains('auto-page-break')) return;

        const elementHeight = element.getBoundingClientRect().height;

        // Check if element would overflow current page
        if (currentPageHeight + elementHeight > contentHeight && currentPageHeight > 0) {
            // Insert page break BEFORE this element
            const pageBreak = document.createElement('div');
            pageBreak.className = 'auto-page-break';
            pageBreak.contentEditable = 'false';
            pageBreak.style.cssText = `
                height: ${pageGap}px;
                margin: 0;
                padding: 0;
                position: relative;
                page-break-after: always;
                break-after: page;
                background: linear-gradient(to bottom, 
                    transparent 0%, 
                    transparent calc(100% - 3px),
                    #ef4444 calc(100% - 3px),
                    #ef4444 100%
                );
                user-select: none;
                pointer-events: none;
            `;

            // Add page number indicator
            pageBreak.innerHTML = `
                <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(239, 68, 68, 0.9);
                    color: white;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 10px;
                    font-weight: bold;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                ">
                    Page ${pageNumber} End
                </div>
            `;

            element.parentNode.insertBefore(pageBreak, element);

            // Reset for new page
            // If the element ITSELF is bigger than a page, it consumes the whole next page (and maybe more)
            // The preview handles the splitting, here we just ensure it starts new.
            if (elementHeight > contentHeight) {
                currentPageHeight = 0; // It takes a full page slot logically
                // We could potentially add *another* break after it if we wanted to show it consumes multiple pages
                // but that might be visually confusing in the editor.
            } else {
                currentPageHeight = elementHeight;
            }
            pageNumber++;
        } else {
            // If element is larger than a page but we are AT the top (currentPageHeight == 0)
            // It just consumes this page.
            if (currentPageHeight === 0 && elementHeight > contentHeight) {
                // It overflows, but we can't break *before* it. 
                // We let it run. The preview will split it.
                // We mark the page as full.
                currentPageHeight = contentHeight;
            } else {
                currentPageHeight += elementHeight;
            }
        }
    });
}

// Debounced pagination trigger
let paginationTimeout = null;
function triggerPaginationDebounced(editorElement, contentHeight, pageGap) {
    if (paginationTimeout) {
        clearTimeout(paginationTimeout);
    }

    paginationTimeout = setTimeout(() => {
        paginateContent(editorElement, contentHeight, pageGap);
    }, 500); // Wait 500ms after user stops typing
}

// ----------------------------------------------------------------------
// Memoized Title Editor (Fixes Reverse Typing Bug)
// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// Memoized Title Editor (Fixes Reverse Typing Bug)
// ----------------------------------------------------------------------
const TitleEditor = memo(({ initialContent, onUpdate, onPaste, isLocked, className, placeholder }) => {
    const ref = useRef(null);

    // Set content only on mount (key change forces remount)
    useLayoutEffect(() => {
        if (ref.current) ref.current.innerText = initialContent || '';
    }, []);

    return (
        <h2
            ref={ref}
            className={`${className} empty:before:content-[attr(data-placeholder)] empty:before:text-[#635c4e] empty:before:italic empty:before:font-normal`}
            contentEditable={!isLocked}
            suppressContentEditableWarning={true}
            onInput={(e) => onUpdate(e.target.innerText)}
            onPaste={onPaste}
            data-placeholder={placeholder}
        />
    );
}, (prev, next) => {
    return prev.isLocked === next.isLocked && prev.className === next.className && prev.placeholder === next.placeholder;
});

// ==========================================
// PART 2: PREVIEW PAGINATION COMPONENT
// ==========================================
function PaginatedPreviewSection({ item, chapterNum, pageDimensions, previewSettings, templateConfig }) {
    const [pages, setPages] = useState([]);
    const containerRef = useRef(null);

    useLayoutEffect(() => {
        if (!containerRef.current) return;

        // 1. Render content into measuring container
        const container = containerRef.current;
        container.innerHTML = DOMPurify.sanitize(item.content, {
            ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'sup', 'sub', 'hr'],
            ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style', 'id', 'width', 'height']
        });

        // 2. Calculate available height from page dimensions


        // --- SIMPLER NORMALIZATION STRATEGY ---
        // 1. Detect if ALL content is inline/text? Capture it.
        // 2. If mixed, wrap inline runs in <p>.

        const originalNodes = Array.from(container.childNodes);
        container.innerHTML = ''; // Clear

        // Re-append using normalized structure
        let currentWrapper = null;

        originalNodes.forEach(node => {
            const isBlock = node.nodeType === 1 && /^(P|DIV|H[1-6]|UL|OL|LI|TABLE|BLOCKQUOTE|HR|FIGURE)$/.test(node.tagName);

            if (isBlock) {
                currentWrapper = null;
                container.appendChild(node);
            } else {
                // Text or Inline
                // Ignore completely empty text nodes between blocks to avoid empty paragraphs
                if (node.nodeType === 3 && !node.nodeValue.trim() && !currentWrapper) {
                    return;
                }

                if (!currentWrapper) {
                    currentWrapper = document.createElement('p'); // Default to P for wrapping
                    // Inherit styles from config maybe? handled by CSS injection
                    container.appendChild(currentWrapper);
                }
                currentWrapper.appendChild(node);
            }
        });

        // 3. Calculate available height from page dimensions
        const defaultHeight = pageDimensions.contentHeight;
        let firstPageHeaderHeight = 0;

        // Estimate header height for the first page
        if (item.title || item.type === 'chapter') {
            const headerMeasurer = document.createElement('div');
            headerMeasurer.className = `prose max-w-none ${previewSettings.theme === 'dark' ? 'prose-invert' : 'prose-slate'}`;
            headerMeasurer.style.visibility = 'hidden';
            headerMeasurer.style.position = 'absolute';
            headerMeasurer.style.width = `${pageDimensions.pageWidth - pageDimensions.marginLeft - pageDimensions.marginRight}px`;

            let headerHTML = '<div style="margin-bottom: 2rem; margin-top: 1rem; text-align: center;">';
            if (item.type === 'chapter' && chapterNum) {
                headerHTML += `<div style="font-family: ${templateConfig.headingFont || 'serif'}; font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem; color: ${templateConfig.textColor}">Chapter ${chapterNum}</div>`;
            }
            if (item.title) {
                headerHTML += `<h2 style="font-family: ${templateConfig.headingFont || 'serif'}; font-size: 2.25rem; line-height: 1.2; font-weight: bold; margin-bottom: 1rem; color: ${templateConfig.textColor}">${item.title}</h2>`;
            }
            headerHTML += `<div style="width: 6rem; height: 1px; margin: 0 auto; background-color: ${previewSettings.theme === 'dark' ? '#4b5563' : '#d1d5db'}; margin-bottom: 1.5rem;"></div>`;
            headerHTML += '</div>';

            headerMeasurer.innerHTML = headerHTML;
            document.body.appendChild(headerMeasurer);
            firstPageHeaderHeight = headerMeasurer.offsetHeight + 10;
            document.body.removeChild(headerMeasurer);
        }

        const children = Array.from(container.children); // Now primarily blocks
        const newPages = [];
        let currentPageNodes = [];
        let currentHeight = 0;

        // Hierarchical Counters tracking for multi-page sync
        let localH1 = 0;
        let localH2 = 0;
        let localH3 = 0;
        
        // Initial values based on content presence (defaults to 1 if first level is missing, matching TOC)
        const contentStr = item.content || "";
        const hasH1 = /<h1/i.test(contentStr);
        const hasH2 = /<h2/i.test(contentStr);
        
        localH1 = hasH1 ? 0 : 1;
        localH2 = hasH1 || hasH2 ? 0 : 1;
        
        let pageStartCounters = { h1: localH1, h2: localH2, h3: 0 };

        // 4. Measure actual element heights including margins
        const getElementHeight = (el) => {
            const style = window.getComputedStyle(el);
            return el.offsetHeight + (parseFloat(style.marginTop) || 0) + (parseFloat(style.marginBottom) || 0);
        };

        // --- SPLITTING HELPER ---
        // Splits a node into [fittedNode, remainingNode] based on max height
        const splitNode = (node, maxHeight) => {
            const clone = node.cloneNode(true);
            const parent = document.createElement('div'); // Temp measure container
            parent.style.width = `${pageDimensions.pageWidth - pageDimensions.marginLeft - pageDimensions.marginRight}px`;
            parent.style.visibility = 'hidden';
            parent.style.position = 'absolute';
            document.body.appendChild(parent);

            // Empty the clone to rebuild it piece by piece
            clone.innerHTML = '';
            const children = Array.from(node.childNodes);
            let currentHeight = 0;
            let splitIndex = -1;

            // Simple splitting: iterate children word by word if text, or node by node
            // For now, let's assume simple text nodes inside blocks (common case)
            // If complex nested structure, this simple version might need recursion (omitted for brevity but can add)

            // STRATEGY: 
            // 1. If text node, split by words.
            // 2. If element node, try to fit whole, else recurse? 
            // keeping it simple for "long paragraph" fix: split text.

            // Helper to measure
            const fits = (n) => {
                parent.innerHTML = '';
                parent.appendChild(n);
                return parent.offsetHeight <= maxHeight;
            };

            const remainingClone = node.cloneNode(false); // Shell for remainder

            // Optimization for simple text blocks (P, H1, etc)
            if (children.length === 1 && children[0].nodeType === 3) {
                const text = children[0].nodeValue;
                const words = text.split(' ');

                let low = 0, high = words.length;
                let bestFitIndex = 0;

                // Binary search for split point? Or linear? 
                // Linear is safer for word wrapping accuracy
                // Let's build up string.

                let currentText = '';
                parent.innerHTML = '';
                const testNode = node.cloneNode(false);
                parent.appendChild(testNode);

                for (let i = 0; i < words.length; i++) {
                    const word = words[i];
                    const prevText = testNode.innerText;
                    testNode.innerText = (prevText ? prevText + ' ' : '') + word;

                    if (testNode.offsetHeight > maxHeight) {
                        // Overflow! Retract last word.
                        testNode.innerText = prevText;

                        // Remaining text
                        remainingClone.innerText = words.slice(i).join(' ');

                        // Fitted node uses the testNode's content
                        clone.innerText = testNode.innerText;

                        document.body.removeChild(parent);
                        return [clone, remainingClone];
                    }
                }

                // If loop finishes, it all fits (shouldn't happen if called correctly)
                document.body.removeChild(parent);
                return [node, null];
            }

            // For complex mixed content, just move whole children for now (fallback)
            // Or implement full recursive splitting if needed later.
            // Current "long paragraph" bug is mostly single text node.

            document.body.removeChild(parent);
            return [node, null]; // Fallback
        };


        // 5. Handle empty content
        if (children.length === 0 && container.innerText.trim()) {
            newPages.push([container.innerHTML]);
        } else {
            // 5. Split content into pages with splitting logic
            let i = 0;
            while (i < children.length) {
                let child = children[i];
                const h = getElementHeight(child);

                // Dynamic available height for the first page
                const currentAvailableHeight = newPages.length === 0 ? defaultHeight - firstPageHeaderHeight : defaultHeight;
                const remainingPageSpace = currentAvailableHeight - currentHeight;

                // Case 1: Fits easily
                if (h <= remainingPageSpace) {
                    // Update counters for headings that ARE being added to this page
                    const tagName = child.tagName?.toLowerCase();
                    if (tagName === 'h1') { localH1++; localH2 = 0; localH3 = 0; }
                    else if (tagName === 'h2') { if (localH1 === 0) localH1 = 1; localH2++; localH3 = 0; }
                    else if (tagName === 'h3') { if (localH1 === 0) localH1 = 1; if (localH2 === 0) localH2 = 1; localH3++; }

                    currentPageNodes.push(child.outerHTML);
                    currentHeight += h;
                    i++;
                    continue;
                }

                // Case 2: Too big for remaining space

                // If we are at top of page (currentHeight == 0), we MUST split it
                // If not at top, move to next page first, then re-evaluate
                if (currentHeight > 0) {
                    // Push current page
                    newPages.push({ nodes: currentPageNodes, counters: { ...pageStartCounters } });
                    currentPageNodes = [];
                    currentHeight = 0;
                    
                    // The counters for the NEXT page start at where we are now
                    pageStartCounters = { h1: localH1, h2: localH2, h3: localH3 };
                    
                    // Don't increment i, verify this child on new page
                    continue;
                }

                // Case 3: At top of page but still too big -> MUST SPLIT
                if (currentHeight === 0 && h > currentAvailableHeight) {
                    // Split the node! 
                    const [fitted, remaining] = splitNode(child, currentAvailableHeight);

                    if (fitted) {
                        const tagName = fitted.tagName?.toLowerCase();
                        if (tagName === 'h1') { localH1++; localH2 = 0; localH3 = 0; }
                        else if (tagName === 'h2') { if (localH1 === 0) localH1 = 1; localH2++; localH3 = 0; }
                        else if (tagName === 'h3') { if (localH1 === 0) localH1 = 1; if (localH2 === 0) localH2 = 1; localH3++; }

                        currentPageNodes.push(fitted.outerHTML);
                        // Force new page after the fitted part
                        newPages.push({ nodes: currentPageNodes, counters: { ...pageStartCounters } });
                        currentPageNodes = [];
                        currentHeight = 0;

                        pageStartCounters = { h1: localH1, h2: localH2, h3: localH3 };
                    }

                    if (remaining) {
                        // The remainder replaces the current child for the next iteration
                        // Since `children` is an array of DOM nodes from `container`, we can insert.
                        children.splice(i + 1, 0, remaining);
                    }
                    i++;
                }
            }

            // Add last page
            if (currentPageNodes.length > 0) {
                newPages.push({ nodes: currentPageNodes, counters: { ...pageStartCounters } });
            }
        }

        setPages(newPages.length > 0 ? newPages : [{ nodes: [], counters: { h1: 0, h2: 0, h3: 0 } }]);

    }, [item.content, pageDimensions, previewSettings.fontSize, previewSettings.lineSpacing, item.title, item.type, chapterNum]);

    return (
        <div className="mb-16" id={`preview-section-${item.id}`}>
            {/* Hidden measurement container - must match page styling exactly */}
            <div
                ref={containerRef}
                className={`prose max-w-none ${previewSettings.theme === 'dark' ? 'prose-invert' : 'prose-slate'}`}
                style={{
                    visibility: 'hidden',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: -1000,
                    width: `${pageDimensions.pageWidth - pageDimensions.marginLeft - pageDimensions.marginRight}px`,
                    fontSize: `${previewSettings.fontSize}pt`,
                    lineHeight: previewSettings.lineSpacing,
                    fontFamily: templateConfig.fontFamily,
                }}
            />

            {/* Render actual pages */}
            {pages.map((pageObj, i) => (
                <div
                    key={i}
                    className={`shadow-xl border mx-auto relative mb-8 break-after-page ${previewSettings.theme === 'dark' ? 'bg-[#faf8f3] border-gray-700' : 'bg-white border-gray-200'}`}
                    style={{
                        width: `${pageDimensions.pageWidth}px`,
                        height: `${pageDimensions.pageHeight}px`,
                        padding: `${pageDimensions.marginTop}px ${pageDimensions.marginRight}px ${pageDimensions.marginBottom}px ${pageDimensions.marginLeft}px`,
                        pageBreakAfter: 'always',
                        breakAfter: 'page',
                        overflow: 'hidden',
                        backgroundColor: templateConfig.backgroundColor,
                        backgroundImage: templateConfig.backgroundImage || 'none',
                        backgroundSize: templateConfig.backgroundSize || 'auto'
                    }}
                >
                    {/* Header/Title on First Page of Section */}
                    {i === 0 && (item.title || item.type === 'chapter') && (
                        <div className="mb-6 mt-4 text-center">
                            {item.type === 'chapter' && chapterNum && (
                                <div className="text-xl md:text-2xl font-bold font-serif mb-2" style={{ color: templateConfig.textColor, fontFamily: templateConfig.headingFont }}>
                                    Chapter {chapterNum}
                                </div>
                            )}
                            {item.title && (
                                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4" style={{ color: templateConfig.textColor, fontFamily: templateConfig.headingFont, lineHeight: 1.2 }}>
                                    {item.title}
                                </h2>
                            )}
                            {(item.type === 'chapter' || item.title) && (
                                <div className={`w-24 h-px mx-auto ${previewSettings.theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                            )}
                        </div>
                    )}

                    {/* Page Content */}
                    <div
                        className={`prose max-w-none ${previewSettings.theme === 'dark' ? 'prose-invert' : 'prose-slate'}`}
                        style={{
                            fontSize: `${previewSettings.fontSize}pt`,
                            lineHeight: previewSettings.lineSpacing,
                            maxHeight: `${pageDimensions.pageHeight - pageDimensions.marginTop - pageDimensions.marginBottom - 30}px`,
                            overflow: 'hidden',
                            fontFamily: templateConfig.fontFamily,
                            color: templateConfig.textColor
                        }}
                        dangerouslySetInnerHTML={{ __html: `<style>strong,b{font-weight:bold !important;}em,i{font-style:italic !important;}h1{font-family:${templateConfig.headingFont};font-weight:bold;font-size:${templateConfig.headingSize};margin-top:1.4em;margin-bottom:0.8em;text-align:inherit;line-height:1.25;page-break-after:avoid;}h2{font-family:${templateConfig.heading2Font};font-weight:bold;font-size:${templateConfig.heading2Size};margin-top:1.2em;margin-bottom:0.6em;text-align:inherit;line-height:1.3;page-break-after:avoid;}h3{font-weight:bold;font-size:1.2em;margin-top:1.1em;margin-bottom:0.5em;text-align:inherit;page-break-after:avoid;}p{text-indent:${templateConfig.paragraphIndent || '0'};margin-bottom:${templateConfig.paragraphSpacing || '6pt'} !important;text-align:justify;text-justify:inter-word;line-height:${templateConfig.lineHeight || 1.15};}img{max-width:100%;height:auto;display:block;margin:0.8em auto;}figcaption,.caption{font-family:${templateConfig.captionFont || '"Gandhi Serif", Georgia, serif'};font-size:${templateConfig.captionSize || '9pt'};font-style:italic;text-align:center;margin-top:0.3em;margin-bottom:0.6em;}ul,ol{margin-top:0.5em;margin-bottom:0.5em;padding-left:1.5em;}li{margin-bottom:0.25em;} 
                        /* Heading Numbering (Preview) */
                        ${item.type === 'chapter' && chapterNum ? `
                            .prose { counter-reset: h1_prev ${pageObj.counters?.h1 || 0} h2_prev ${pageObj.counters?.h2 || 0} h3_prev ${pageObj.counters?.h3 || 0}; }
                            h1 { counter-increment: h1_prev; counter-reset: h2_prev 0; }
                            h1::before { content: "${chapterNum}." counter(h1_prev) " "; }
                            h2 { counter-increment: h2_prev; counter-reset: h3_prev 0; }
                            h2::before { content: "${chapterNum}." counter(h1_prev) "." counter(h2_prev) " "; }
                            h3 { counter-increment: h3_prev; }
                            h3::before { content: "${chapterNum}." counter(h1_prev) "." counter(h2_prev) "." counter(h3_prev) " "; }
                        ` : ''}
                        </style>` + (pageObj.nodes || []).join('') }}
                    />

                    {/* Page Number */}
                    <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] opacity-40 select-none" style={{ zIndex: 10 }}>
                        {item.type === 'chapter' ? `Chapter Page ${i + 1}` : `Page ${i + 1}`}
                    </div>
                </div>
            ))}
        </div>
    );
}

function FormattingTool({ book, hasAiContent }) {
    // GUARD: If user has uploaded a file, redirect back to Design page
    useEffect(() => {
        if (book.interior_file && ['upload', 'upload_template'].includes(book.interior_layout_method)) {
            router.visit(route('books.design', book.id));
        }
    }, []);

    const [activeSection, setActiveSection] = useState('main_title');

    const editorRef = useRef(null);
    const titleRef = useRef(null);
    const selectionRef = useRef(null); // Store selection range
    const fileInputRef = useRef(null); // Ref for IMAGE input

    const needsSaveRef = useRef(false); // Track if auto-save is needed

    // --- IMAGE HANDLING START ---
    // State for image handling
    const [selectedImage, setSelectedImage] = useState(null);
    const [overlayRect, setOverlayRect] = useState(null);
    const [resizeState, setResizeState] = useState({ isResizing: false, startX: 0, startWidth: 0 });

    // ✅ FIX 1: Global Click Listener for Images - FIXED
    useEffect(() => {
        const handleClick = (e) => {
            const target = e.target;

            // Check if clicking on an image inside editor
            if (target.tagName === 'IMG' && editorRef.current?.contains(target)) {
                // ALLOW NATIVE DRAG: Do NOT preventDefault() here.
                // e.preventDefault(); 
                // e.stopPropagation(); // Allow event to bubble for dragstart

                setSelectedImage(target);

                const rect = target.getBoundingClientRect();
                setOverlayRect({
                    top: rect.top + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    height: rect.height,
                    fixedTop: rect.top,
                    fixedLeft: rect.left
                });
            } else if (!target.closest('.image-floating-toolbar') && selectedImage) {
                // Deselect if clicking outside
                setSelectedImage(null);
                setOverlayRect(null);
            }
        };

        document.addEventListener('mousedown', handleClick, true); // USE CAPTURE PHASE
        return () => document.removeEventListener('mousedown', handleClick, true);
    }, [selectedImage]);

    // ✅ FIX 2: Update overlay position on scroll/resize
    useEffect(() => {
        if (!selectedImage) return;

        const updateOverlay = () => {
            if (!selectedImage.isConnected) {
                setSelectedImage(null);
                setOverlayRect(null);
                return;
            }

            const rect = selectedImage.getBoundingClientRect();
            setOverlayRect({
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
                height: rect.height,
                fixedTop: rect.top,
                fixedLeft: rect.left
            });
        };

        window.addEventListener('scroll', updateOverlay, true);
        window.addEventListener('resize', updateOverlay);

        const editorElement = editorRef.current;
        const scrollContainer = editorElement?.closest('.overflow-y-auto');
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', updateOverlay);
        }

        return () => {
            window.removeEventListener('scroll', updateOverlay, true);
            window.removeEventListener('resize', updateOverlay);
            if (scrollContainer) {
                scrollContainer.removeEventListener('scroll', updateOverlay);
            }
        };
    }, [selectedImage]);

    // ✅ FIX 3: Handle Resize Drag Start
    const handleResizeStart = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!selectedImage) return;

        setResizeState({
            isResizing: true,
            startX: e.clientX,
            startWidth: selectedImage.getBoundingClientRect().width
        });
    };

    // ✅ FIX 4: Handle Global Mouse Move/Up for Resizing
    useEffect(() => {
        if (!resizeState.isResizing || !selectedImage) return;

        const handleMouseMove = (e) => {
            const dx = e.clientX - resizeState.startX;
            const newWidth = Math.max(50, resizeState.startWidth + dx);

            selectedImage.style.width = `${newWidth}px`;
            selectedImage.style.height = 'auto';
            selectedImage.removeAttribute('width');
            selectedImage.removeAttribute('height');

            const rect = selectedImage.getBoundingClientRect();
            setOverlayRect({
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
                height: rect.height,
                fixedTop: rect.top,
                fixedLeft: rect.left
            });
        };

        const handleMouseUp = () => {
            setResizeState({ isResizing: false, startX: 0, startWidth: 0 });

            if (editorRef.current) {
                const event = new Event('input', { bubbles: true });
                editorRef.current.dispatchEvent(event);
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizeState.isResizing, resizeState.startX, resizeState.startWidth, selectedImage]);

    // ✅ FIX 5: Delete Function - FIXED
    const deleteSelectedImage = useCallback(() => {
        if (!selectedImage) return;

        const imageToRemove = selectedImage;

        // Clear selection FIRST
        setSelectedImage(null);
        setOverlayRect(null);

        // Then remove from DOM
        imageToRemove.remove();

        // Trigger content save
        setTimeout(() => {
            if (editorRef.current) {
                const newContent = editorRef.current.innerHTML;
                const textContent = editorRef.current.innerText || editorRef.current.textContent || '';
                const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).filter(w => w.length > 0).length : 0;

                setSections(prev => ({
                    ...prev,
                    [activeSection]: {
                        ...prev[activeSection],
                        content: newContent,
                        wordCount: wordCount
                    }
                }));
            }
        }, 10);
    }, [selectedImage, activeSection]);

    // ✅ FIX 6: Keyboard Listener for Delete - FIXED
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedImage) {
                // Check if the browser's own selection contains the image
                // (i.e., user clicked the image, not just positioned text cursor)
                const sel = window.getSelection();
                const selectionHasImage = sel && sel.rangeCount > 0 &&
                    sel.getRangeAt(0).intersectsNode &&
                    sel.getRangeAt(0).intersectsNode(selectedImage);

                // If the editor is focused BUT the selection is on the image itself → delete image
                // If the editor is focused AND selection is a text cursor → let normal editing work
                const activeElement = document.activeElement;
                const isInEditor = activeElement === editorRef.current || activeElement.isContentEditable;

                if (isInEditor && !selectionHasImage) {
                    return; // Normal text editing — don't intercept
                }

                e.preventDefault();
                e.stopPropagation();
                deleteSelectedImage();
            }
        };

        document.addEventListener('keydown', handleKeyDown, true); // USE CAPTURE PHASE
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [selectedImage, deleteSelectedImage]);

    // ✅ FIX 7: Image Styling Helper (for toolbar actions)
    const updateImageStyle = (style) => {
        if (!selectedImage) return;

        if (style.width) {
            selectedImage.style.width = style.width;
            selectedImage.removeAttribute('width');
        }

        if (style.float) {
            selectedImage.style.float = style.float;
            selectedImage.style.margin = style.float === 'left' ? '0 1em 0.5em 0' : '0 0 0.5em 1em';
        }

        if (style.clear) {
            selectedImage.style.float = 'none';
            selectedImage.style.margin = '1em 0';
            selectedImage.style.display = 'block';
            selectedImage.style.marginLeft = 'auto';
            selectedImage.style.marginRight = 'auto';
        }

        const event = new Event('input', { bubbles: true });
        editorRef.current.dispatchEvent(event);
    };
    // --- IMAGE HANDLING END ---

    const [layout, setLayout] = useState(() => {
        // ALWAYS derive layout from the book's actual book_size (selected in Step 2 Design page).
        // This is the single source of truth — prevents wrong size being loaded from old saved data.
        const correctLayout = getDefaultLayout(book.book_size);

        // If there's saved formatting data with a layout, only use it if it MATCHES the book_size.
        // This handles the case where old data had the wrong layout saved.
        if (book.formatting_data && book.formatting_data.layout) {
            const savedLayout = book.formatting_data.layout;
            // If saved layout matches the correct one, use it; else use book_size
            if (savedLayout === correctLayout) {
                return savedLayout;
            }
            // Mismatch: saved layout is wrong — use the correct one from book_size
            return correctLayout;
        }
        return correctLayout;
    }); // Layout always derived from book.book_size

    const pageDimensions = useMemo(() => getPageDimensions(book.book_size, layout), [book.book_size, layout]);

    // --- MANUSCRIPT UPLOAD LOGIC ---
    const manuscriptInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleManuscriptUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic client-side check
        if (!file.name.toLowerCase().endsWith('.docx')) {
            alert("Please upload a .docx file.");
            return;
        }

        if (confirm(`Are you sure you want to upload "${file.name}" as the final manuscript? \n\nThis will REPLICATE your manual formatting data. Any text you typed here will be ignored for the final book file.`)) {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            try {
                // Use the new route created
                await axios.post(route('books.format.upload', book.id), formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert("Manuscript uploaded successfully! \n\nThe system will now use this file for your book. Manual formatting features are now disabled for this book unless you reset.");
                window.location.reload();
            } catch (error) {
                console.error(error);
                alert(error.response?.data?.message || "Upload failed. Please check the file and try again.");
            } finally {
                setIsUploading(false);
                if (manuscriptInputRef.current) manuscriptInputRef.current.value = '';
            }
        } else {
            e.target.value = ''; // Reset if cancelled
        }
    };

    const handleRemoveManuscript = async () => {
        if (confirm("Are you sure? This will delete your uploaded manuscript and unlock the editor. \n\nYour previous manual formatting work will be restored.")) {
            try {
                await axios.post(route('books.format.remove', book.id));
                alert("Manuscript removed. Editor unlocked.");
                window.location.reload();
            } catch (error) {
                console.error(error);
                alert("Failed to remove manuscript.");
            }
        }
    };

    // Content Data State
    const [sections, setSections] = useState(() => {
        const defaultSections = {
            main_title: {
                title: 'Title Page',
                content: `<p style="text-align: center; margin-top: 20px; margin-bottom: 10px;"><span style="font-family: Georgia, 'Times New Roman', serif; font-size: 36pt; color: #000;">${book.title || 'Your Book Title'}</span></p>
<p style="text-align: center; margin-bottom: 0;"><span style="font-family: Georgia, 'Times New Roman', serif; font-size: 13pt; color: #333;">${book.subtitle || 'Enter Book Subtitle Here – You can delete this line if you wish to not have a subtitle'}</span></p>
<p style="text-align: center; margin-top: 150px; margin-bottom: 0;"><span style="font-family: Georgia, 'Times New Roman', serif; font-size: 12pt; color: #000; text-transform: uppercase; letter-spacing: 1px;">${book.author_name || 'AUTHOR NAME'}</span></p>${book.co_authors && book.co_authors.length > 0 ? `
<p style="text-align: center; margin-top: 10px;"><span style="font-family: Georgia, serif; font-size: 11pt; color: #333;">with ${Array.isArray(book.co_authors) ? book.co_authors.map(c => typeof c === 'string' ? c : c.name).join(', ') : ''}</span></p>` : ''}
<p style="text-align: center; margin-top: 200px; margin-bottom: 0;"><span style="font-family: Georgia, 'Times New Roman', serif; font-size: 12pt; color: #000;">${book.publication || 'RK Publications'}</span></p>`,
                wordCount: 0,
                placeholder: 'Book Title\nAuthor Name...'
            },
            legal_info: {
                title: 'Copyright Page',
                content: `<p style="text-align: center; margin-top: 100px; margin-bottom: 2px;"><span style="font-family: Georgia, serif; font-size: 16pt;">${book.publication || 'RK Publications'}</span></p>
<p style="text-align: center; margin-bottom: 2px;"><span style="font-family: Georgia, serif; font-size: 13pt;">India|Brazil|Kenya</span></p>
<p style="text-align: center; margin-bottom: 10px;"><span style="font-family: Georgia, serif; font-size: 13pt;">1st Edition - ${new Date().getFullYear()}</span></p>
<p style="text-align: justify; margin-top: 12px; margin-bottom: 6px;"><span style="font-family: Georgia, serif; font-size: 9pt;">ISBN xxx-x-xxxxx-xx-x</span></p>
<p style="text-align: justify; margin-bottom: 8px; line-height: 1.5;"><span style="font-family: Georgia, serif; font-size: 8pt;">This book has been published with all reasonable efforts taken to make the material error-free after the consent of the author. No part of this book shall be used, reproduced in any manner whatsoever without written permission from the author, except in the case of brief quotations embodied in critical articles and reviews.</span></p>
<p style="text-align: justify; margin-bottom: 12px; line-height: 1.5;"><span style="font-family: Georgia, serif; font-size: 8pt;">The Author of this book is solely responsible and liable for its content including but not limited to the views, representations, descriptions, statements, information, opinions and references ["Content"]. The Content of this book shall not constitute or be construed or deemed to reflect the opinion or expression of the Publisher or Editor. Neither the Publisher nor Editor endorse or approve the Content of this book or guarantee the reliability, accuracy or completeness of the Content published herein and do not make any representations or warranties of any kind, express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose. The Publisher and Editor shall not be liable whatsoever for any errors, omissions, whether such errors or omissions result from negligence, accident, or any other cause or claims for loss or damages of any kind, including without limitation, indirect or consequential loss or damage arising out of use, inability to use, or about the reliability, accuracy or sufficiency of the information contained in this book.</span></p>
<p style="margin-top: 30px; line-height: 1.8;"><span style="font-family: Georgia, serif; font-size: 9pt; font-weight: bold;">Price - INR ₹ 800 | USD $10</span></p>
<p style="line-height: 1.8;"><span style="font-family: Georgia, serif; font-size: 9pt; font-weight: bold;">Head office - Saravanampatti</span></p>
<p style="line-height: 1.8;"><span style="font-family: Georgia, serif; font-size: 9pt; font-weight: bold;">Coimbatore, India</span></p>`,
                wordCount: 0,
                placeholder: '© 2024 Author Name. All rights reserved...'
            },
            contents_list: {
                title: 'Contents',
                content: `<p style="text-align: center; margin-top: 40px; margin-bottom: 20px;"><span style="font-family: Georgia, serif; font-size: 22pt;">Contents</span></p>
<p style="text-align: center; margin-bottom: 5px;"><span style="font-family: Georgia, serif; font-size: 11pt;">Foreword</span></p>
<p style="text-align: center; margin-bottom: 5px;"><span style="font-family: Georgia, serif; font-size: 11pt;">Preface</span></p>
<p style="text-align: center; margin-bottom: 5px;"><span style="font-family: Georgia, serif; font-size: 11pt;">Acknowledgments</span></p>
<p style="text-align: center; margin-bottom: 5px;"><span style="font-family: Georgia, serif; font-size: 11pt;">Prologue/Introduction</span></p>
<p style="text-align: center; margin-bottom: 5px;"><span style="font-family: Georgia, serif; font-size: 11pt;">1. Enter Chapter name</span></p>
<p style="text-align: center; margin-bottom: 5px;"><span style="font-family: Georgia, serif; font-size: 11pt;">2. Enter Chapter Name</span></p>
<p style="text-align: center; margin-bottom: 5px;"><span style="font-family: Georgia, serif; font-size: 11pt;">3. Enter Chapter Name</span></p>
<p style="text-align: center; margin-bottom: 5px;"><span style="font-family: Georgia, serif; font-size: 11pt;">Epilogue</span></p>`,
                wordCount: 0,
                placeholder: 'Table of Contents...'
            }
        };

        if (book.formatting_data && book.formatting_data.sections) {
            return {
                ...defaultSections,
                ...book.formatting_data.sections
            };
        }
        return defaultSections;
    });

    const [frontMatters, setFrontMatters] = useState(book.formatting_data?.frontMatters || [
        { id: 'dedication_default', title: 'Dedication', type: 'front_matter', content: '<p style="text-align: center; margin-top: 200px;"><span style="font-family: Georgia, serif; font-style: italic; font-size: 13pt; color: #333;">Dedicated to our family members.</span></p>', wordCount: 0 }
    ]); // Dynamic Front Matter State
    const [chapters, setChapters] = useState(book.formatting_data?.chapters || []); // Dynamic Chapters State (moved here to avoid TDZ)

    // FIX: Added 'introduction' to standard keys so it's draggable/movable
    const [visibleFrontMatterKeys, setVisibleFrontMatterKeys] = useState(book.formatting_data?.visibleFrontMatterKeys || ['main_title', 'legal_info', 'contents_list']);

    // REMOVED showPrologue state to integrate Introduction into main list
    // const [showPrologue, setShowPrologue] = useState(true);

    const [isFrontMatterOpen, setIsFrontMatterOpen] = useState(true);
    const [isChapterOpen, setIsChapterOpen] = useState(true);
    const [isEndMatterOpen, setIsEndMatterOpen] = useState(true);

    const [endMatters, setEndMatters] = useState(book.formatting_data?.endMatters || []); // Dynamic End Matter State

    // Calculate current chapter number and heading presence for the active section (for editor numbering)
    const { activeChapterNum, hasH1, hasH2 } = useMemo(() => {
        let chapterNum = null;
        if (activeSection && activeSection.startsWith('chapter')) {
            const chapterList = chapters.filter(c => c.type === 'chapter');
            const idx = chapterList.findIndex(c => c.id === activeSection);
            if (idx !== -1) chapterNum = idx + 1;
        }

        const content = sections[activeSection]?.content || "";
        return {
            activeChapterNum: chapterNum,
            hasH1: /<h1/i.test(content),
            hasH2: /<h2/i.test(content)
        };
    }, [activeSection, chapters, sections]);


    const [showChapterMenu, setShowChapterMenu] = useState(false);
    const [isToolbarVisible, setIsToolbarVisible] = useState(false);
    const [currentBlockType, setCurrentBlockType] = useState('Normal');
    const [showExportPreview, setShowExportPreview] = useState(false);
    const [showTypographyMenu, setShowTypographyMenu] = useState(false);

    // Word Count Calculation
    const totalWordCount = useMemo(() => {
        let combinedContent = "";
        Object.values(sections).forEach(s => combinedContent += (s.content || "") + " ");
        // Strip HTML tags and split by whitespace
        const plainText = combinedContent.replace(/<[^>]*>/g, ' ');
        return plainText.trim().split(/\s+/).filter(w => w.length > 0).length;
    }, [sections]);

    const activeSectionWordCount = useMemo(() => {
        const content = sections[activeSection]?.content || "";
        const plainText = content.replace(/<[^>]*>/g, ' ');
        return plainText.trim().split(/\s+/).filter(w => w.length > 0).length;
    }, [sections, activeSection]);


    // Advanced Formatting States
    const [showFontMenu, setShowFontMenu] = useState(false);
    const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);
    const [showLineHeightMenu, setShowLineHeightMenu] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showHighlightPicker, setShowHighlightPicker] = useState(false);
    const [showFindReplace, setShowFindReplace] = useState(false);
    const [showInsertMenu, setShowInsertMenu] = useState(false);
    const [findText, setFindText] = useState('');
    const [replaceText, setReplaceText] = useState('');
    const [findResults, setFindResults] = useState({ count: 0, current: 0 });

    // Undo/Redo History
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);

    // Drag and Drop State
    const [draggedItem, setDraggedItem] = useState(null);
    const [draggedSection, setDraggedSection] = useState(null);
    const [dragOverItem, setDragOverItem] = useState(null);

    // Current formatting states
    const [currentFont, setCurrentFont] = useState('Georgia');
    const [currentFontSize, setCurrentFontSize] = useState('16');
    const [currentLineHeight, setCurrentLineHeight] = useState('1.8');
    const [currentColor, setCurrentColor] = useState('#1e293b');



    // Intelligent Default Template Selection



    const [showLayoutMenu, setShowLayoutMenu] = useState(false);
    const [headerSettings, setHeaderSettings] = useState({
        leftContent: 'author_name', // 'author_name' | 'book_title' | 'none'
        rightContent: 'chapter_title', // 'book_title' | 'chapter_title' | 'none'
        showPageNumbers: true,
    });
    const [showHeaderMenu, setShowHeaderMenu] = useState(false); // Controls the Headers popover
    const [validationIssues, setValidationIssues] = useState([]); // Stores pre-flight errors
    const [showValidationPanel, setShowValidationPanel] = useState(false);

    const [paragraphStyle, setParagraphStyle] = useState({
        alignment: 'justify', // 'left', 'center', 'right', 'justify'
        hyphenation: true,
        indentation: 'indent' // 'indent' (classic book) or 'block' (web style)
    });

    // Chapter Design Themes
    const [chapterDesign, setChapterDesign] = useState('simple'); // 'simple', 'modern', 'classic', 'decorative', 'minimal'

    const [showAdvancedTypeMenu, setShowAdvancedTypeMenu] = useState(false); // New menu toggler

    const [isProcessing, setIsProcessing] = useState(false);
    const [saveStatus, setSaveStatus] = useState('Saved');
    // [DUPLICATE IMAGE LOGIC REMOVED]

    // --------------------------------------------------------------------------------
    // UNIFIED FLOW ENGINE (MS WORD-STYLE)
    // --------------------------------------------------------------------------------
    // [PAGINATION ENGINE REMOVED]

    // 1. INITIALIZATION: Load Section Content
    useEffect(() => {
        // Force Paragraph Mode
        document.execCommand('defaultParagraphSeparator', false, 'p');

        // Ensure content is synced on load
        if (editorRef.current && sections[activeSection]) {
            editorRef.current.innerHTML = sections[activeSection].content || "";

            // ✅ TRIGGER PAGINATION AFTER LOADING (REMOVED)
            // setTimeout(() => {
            //     paginateContent(
            //         editorRef.current,
            //         pageDimensions.contentHeight,
            //         pageDimensions.pageGap
            //     );
            // }, 200);
        }
    }, [activeSection]);




    // --------------------------------------------------------------------------------
    // END OF ENGINE
    // --------------------------------------------------------------------------------

    // --------------------------------------------------------------------------------

    // Track the last loaded section to preventing re-syncing during typing (Fixes 'olleh' bug)
    const lastLoadedSection = useRef(null);

    // ══════════════════════════════════════════════════════════════════
    // SYNC EDITOR WITH ACTIVE SECTION (moved here to avoid TDZ errors)
    // ══════════════════════════════════════════════════════════════════
    useEffect(() => {
        if (!editorRef.current || !sections[activeSection]) return;

        // Smart Sync: Only update if content is actually different to prevent cursor jumps and loops
        const currentContent = editorRef.current.innerHTML;
        const newContent = sections[activeSection].content || "";

        // Check if ID changed OR content is significantly different
        if (activeSection !== lastLoadedSection.current || currentContent !== newContent) {
            editorRef.current.innerHTML = newContent;
            lastLoadedSection.current = activeSection;

            // Pagination Removed
        }
    }, [activeSection]); // Removed 'sections' to prevent race loops

    // Separate effect for Title to allow independent updates if needed, but strictly controlled
    useEffect(() => {
        if (titleRef.current && sections[activeSection]) {
            // Only update title if it's different (basics)
            if (titleRef.current.innerText !== (sections[activeSection].title || '')) {
                titleRef.current.innerText = sections[activeSection].title || '';
            }
        }
    }, [activeSection, sections]);

    // [DUPLICATE updateImageStyle REMOVED]

    // Handle content changes (typing, editing)
    const handleContentChange = (e) => {
        if (!editorRef.current) return;

        const newContent = editorRef.current.innerHTML;

        // Calculate word count from text content (strip HTML)
        const textContent = editorRef.current.innerText || editorRef.current.textContent || '';
        const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).filter(w => w.length > 0).length : 0;

        setSections(prev => ({
            ...prev,
            [activeSection]: {
                ...prev[activeSection],
                content: newContent,
                wordCount: wordCount
            }
        }));

        setSaveStatus('Unsaved...');

        // ✅ TRIGGER AUTOMATIC PAGINATION (REMOVED)
        // triggerPaginationDebounced(
        //     editorRef.current,
        //     pageDimensions.contentHeight,
        //     pageDimensions.pageGap
        // );
    };

    // Handle paste events - CRITICAL FOR FIXING LAYOUT ISSUES
    const handleContentPaste = (e) => {
        e.preventDefault();

        // 1. Handle Image Paste (Screenshots / File Copy)
        const clipboardData = e.clipboardData || window.clipboardData;
        if (clipboardData.files && clipboardData.files.length > 0) {
            const file = clipboardData.files[0];
            if (file.type.startsWith('image/')) {
                insertImageFromFile(file);
                return;
            }
        }

        const html = clipboardData.getData('text/html');
        const text = clipboardData.getData('text/plain');

        // Clean pasted content to avoid formatting issues
        if (html) {
            const temp = document.createElement('div');
            temp.innerHTML = html;

            // Strip unwanted formatting
            const cleanNode = (node) => {
                if (node.nodeType === 1) { // Element node
                    // Remove images with file:/// src (MS Word paste - local temp paths that won't work on server)
                    if (node.tagName === 'IMG') {
                        const src = node.getAttribute('src') || '';
                        if (src.startsWith('file:///')) {
                            // This is a local temp file path from the user's PC (e.g. Word paste)
                            // Remove the image entirely - it can't be uploaded
                            node.remove();
                            return;
                        }
                    }

                    // Remove style attributes that cause layout issues
                    node.removeAttribute('style');
                    node.removeAttribute('class');
                    node.removeAttribute('id');

                    // Recursively clean child nodes
                    Array.from(node.children).forEach(cleanNode);
                }
            };

            Array.from(temp.children).forEach(cleanNode);

            // Insert cleaned HTML
            document.execCommand('insertHTML', false, temp.innerHTML);
        } else {
            // Plain text fallback
            document.execCommand('insertText', false, text);
        }

        // ✅ FORCE PAGINATION AFTER PASTE
        setTimeout(() => {
            if (editorRef.current) {
                // Update content state
                const newContent = editorRef.current.innerHTML;
                setSections(prev => ({
                    ...prev,
                    [activeSection]: {
                        ...prev[activeSection],
                        content: newContent
                    }
                }));

                // Trigger pagination immediately for paste (REMOVED)
                // paginateContent(
                //     editorRef.current,
                //     pageDimensions.contentHeight,
                //     pageDimensions.pageGap
                // );
            }
        }, 100);
    };

    // Handle title paste
    const handleTitlePaste = (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text/plain');
        document.execCommand('insertText', false, text);
    };

    const insertFootnote = () => {
        const text = prompt("Enter footnote text:");
        if (!text) return;

        const count = (editorRef.current?.querySelectorAll('.footnote-ref').length || 0) + 1;
        const noteId = `fn-${Date.now()}`;

        // Insert Reference
        const refHtml = `<sup class="footnote-ref" id="ref-${noteId}"><a href="#${noteId}" style="text-decoration:none; color: indigo;">[${count}]</a></sup>`;
        execCmd('insertHTML', refHtml);

        // Append Footnote Body at the end of content
        // We do this by direct DOM manipulation to avoid breaking selection context usually
        if (editorRef.current) {
            const footerHtml = `
                <div id="${noteId}" class="footnote-item" contenteditable="false" style="font-size: 0.85em; color: #555; border-top: 1px solid #eee; margin-top: 10px; padding-top: 5px;">
                    <a href="#ref-${noteId}" style="text-decoration:none; font-weight:bold; color: indigo; margin-right:5px;">^${count}</a>
                    ${text}
                </div>`;

            // Check if specialized footnote container exists
            let container = editorRef.current.querySelector('.footnotes-container');
            if (!container) {
                container = document.createElement('div');
                container.className = 'footnotes-container';
                container.style.marginTop = '40px';
                container.style.paddingTop = '20px';
                container.style.borderTop = '2px solid #eee';
                editorRef.current.appendChild(container);
            }
            container.insertAdjacentHTML('beforeend', footerHtml);

            // Trigger save after DOM manipulation
            const event = new Event('input', { bubbles: true });
            editorRef.current.dispatchEvent(event);
        }
    };





    // Global Click Listener for Images




    // ═══════════════════════════════════════════════════════════════════════════
    // PREVIEW MODE — PURE RENDERING ONLY (NO LAYOUT LOGIC)
    // Per Architecture: No observers, no refs, no page calculations
    // ═══════════════════════════════════════════════════════════════════════════
    const [previewSettings, setPreviewSettings] = useState({
        fontSize: 16,
        lineSpacing: 1.8,
        theme: 'light', // 'light' | 'dark'
        zoom: 1,
        searchQuery: '',
        activeChapterIndex: 0
    });

    // Preview Mode: NO observers, NO refs, NO layout measurements
    // This is intentionally empty - Preview is pure rendering


    // --- TITLE DUPLICATION FIXER (EDITOR) ---
    // Automatically cleans duplicate H1 titles from content if they match the Section Title
    useEffect(() => {
        if (!activeSection || !sections[activeSection]) return;

        const currentSection = sections[activeSection];
        const title = currentSection.title?.trim();
        const content = currentSection.content || '';

        if (title && content) {
            // Regex to find H1/H2/H3/P that EXACTLY contains the title (plus whitespace) at the START of content
            // We match strictly to avoid false positives
            const regex = new RegExp(`^\\s*<(h[1-3]|p)[^>]*>\\s*${escapeRegExp(title)}\\s*<\\/\\1>\\s*`, 'i');

            if (regex.test(content)) {
                // Remove it
                const newContent = content.replace(regex, '');
                console.log("Auto-fixed duplicate title in content");

                setSections(prev => ({
                    ...prev,
                    [activeSection]: {
                        ...prev[activeSection],
                        content: newContent
                    }
                }));
            }
        }
    }, [activeSection, sections[activeSection]?.title]); // Run when switching section or title changes



    // Helper to get template configuration for Preview
    const getTemplateConfig = (designName) => {
        switch (designName) {
            case 'Horror Style':
                return { fontFamily: '"Creepster", cursive', textColor: '#111111', backgroundColor: '#fdf2f2', backgroundImage: "url('/images/templates/image2.jpeg')", backgroundSize: 'cover' };
            case 'Kavithai Style':
                return { fontFamily: '"Dancing Script", cursive', textColor: '#374151', backgroundColor: '#fffbeb' };
            case 'modern':
                return { fontFamily: 'Inter, sans-serif', textColor: '#1f2937', backgroundColor: '#ffffff' };
            case 'classic':
                return { fontFamily: 'Merriweather, serif', textColor: '#000000', backgroundColor: '#ffffff' };
            case 'decorative':
                return { fontFamily: 'Cinzel, serif', textColor: '#4a0404', backgroundColor: '#fff5f5' };
            case 'minimal':
                return { fontFamily: 'Lato, sans-serif', textColor: '#333333', backgroundColor: '#ffffff' };
            default: // 'simple', 'RK publication Template', 'Standard Book'
                return { fontFamily: 'Georgia, serif', textColor: '#000000', backgroundColor: '#ffffff' };
        }
    };

    // Helper function to get the CSS class for the selected template
    function getTemplateClass() {
        return 'plain-book-template';
    }

    const handleExport = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setShowExportPreview(true);
        }, 3000); // 3 seconds delay for effect
    };


    const addFrontMatter = (e) => {
        e.stopPropagation();
        const newCount = frontMatters.length + 1;
        const newId = `front-matter-${newCount}-${Date.now()}`;
        const newTitle = `Front Matter ${newCount}`;

        setFrontMatters([...frontMatters, { id: newId, title: newTitle }]);
        setVisibleFrontMatterKeys(prev => [...prev, newId]);
        setSections(prev => ({
            ...prev,
            [newId]: { title: newTitle, content: '', placeholder: `Begin writing ${newTitle}...` }
        }));

        if (!isFrontMatterOpen) setIsFrontMatterOpen(true);
    };

    const deleteStandardFrontMatter = (key) => {
        setVisibleFrontMatterKeys(prev => prev.filter(k => k !== key));
        // Optional: Remove from sections data if desired, but hiding is safer for "standard" keys to allow re-enabling later if features expanded
        if (activeSection === key) setActiveSection(visibleFrontMatterKeys.find(k => k !== key) || 'chapter-1');
    };



    const deleteFrontMatter = (id) => {
        setFrontMatters(frontMatters.filter(f => f.id !== id));
        setVisibleFrontMatterKeys(prev => prev.filter(k => k !== id));
        const newSections = { ...sections };
        delete newSections[id];
        setSections(newSections);
        if (activeSection === id) setActiveSection('prologue');
    };

    const handleTitleChange = (e) => {
        const newTitle = (e && e.target) ? e.target.innerText : e;
        updateSectionTitle(newTitle);
    };

    // --- CONTENT MANIPULATION (Fixing Ordering/Duplication Bugs 005/006) ---
    // Using functional updates (prev => ...) is critical to avoid stale state in rapid interactions

    const updateSectionTitle = (newTitle) => {
        setSections(prev => ({
            ...prev,
            [activeSection]: {
                ...prev[activeSection],
                title: newTitle
            }
        }));

        // Batch update to keep lists in sync without race conditions
        const updateList = (list) => list.map(item => item.id === activeSection ? { ...item, title: newTitle } : item);

        if (activeSection.startsWith('chapter') || activeSection.startsWith('part')) {
            setChapters(prev => updateList(prev));
        } else if (activeSection.startsWith('end-matter')) {
            setEndMatters(prev => updateList(prev));
        } else if (activeSection.startsWith('front-matter')) {
            setFrontMatters(prev => updateList(prev));
        }
    };

    const addChapter = () => {
        const newId = `chapter-${Date.now()}`; // Simplified ID, randomness handled by Date
        const newTitle = ``;

        const newItem = { id: newId, title: newTitle, type: 'chapter' };

        // Atomic update to avoid race conditions
        setChapters(prev => [...prev, newItem]);
        setSections(prev => ({
            ...prev,
            [newId]: { title: newTitle, content: '', type: 'chapter', placeholder: `Start writing here...` }
        }));

        setShowChapterMenu(false);
        if (!isChapterOpen) setIsChapterOpen(true);
        // Defer active section switch slightly to ensure React has rendered the new item
        setTimeout(() => setActiveSection(newId), 0);
    };



    // Fix for Insert Logic (BUG-005 Incorrect Ordering)
    const insertChapterAt = (index) => {
        const newId = `chapter-ins-${Date.now()}`;
        const newTitle = ``;
        const newItem = { id: newId, title: newTitle, type: 'chapter' };

        setChapters(prev => {
            const newList = [...prev];
            newList.splice(index + 1, 0, newItem);
            return newList;
        });

        setSections(prev => ({
            ...prev,
            [newId]: { title: newTitle, content: '', type: 'chapter', placeholder: `Start writing here...` }
        }));

        setTimeout(() => setActiveSection(newId), 0);
    };




    // --- ENHANCED SAVE LOGIC (Fixing BUG-004 Conflicting Messages) ---
    const saveProgress = async (silent = false, overrideData = {}) => {
        // Prepare Data Payload
        const data = {
            layout: overrideData.layout || layout,
            sections: overrideData.sections || sections,
            chapters: overrideData.chapters || chapters,
            frontMatters: overrideData.frontMatters || frontMatters,
            visibleFrontMatterKeys: overrideData.visibleFrontMatterKeys || visibleFrontMatterKeys,
            endMatters: overrideData.endMatters || endMatters,
            // Advanced formatting settings
            currentFont: overrideData.currentFont || currentFont,
            currentFontSize: overrideData.currentFontSize || currentFontSize,
            currentLineHeight: overrideData.currentLineHeight || currentLineHeight,
            currentColor: overrideData.currentColor || currentColor,
            headerSettings: overrideData.headerSettings || headerSettings,
            paragraphStyle: overrideData.paragraphStyle || paragraphStyle,
            chapterDesign: overrideData.chapterDesign || chapterDesign,
            lastSaved: Date.now()
        };

        // 1. Local Backup (Immediate Synchronous Fallback)
        try {
            localStorage.setItem(`book_content_${book.id}`, JSON.stringify(data));
        } catch (e) {
            console.error("Local storage failed (quota exceeded?)", e);
        }

        // 2. Server Save
        if (!silent) setSaveStatus('Saving...');

        // Calculate Estimated Pages for DB Preview (size-aware words/page)
        let totalWordCount = 0;
        const sectionsToCount = overrideData.sections || sections;
        if (sectionsToCount) {
            Object.values(sectionsToCount).forEach(sec => {
                if (sec && sec.content) {
                    const cleanText = sec.content.replace(/<[^>]*>/g, ' ');
                    const words = cleanText.trim().split(/\s+/).filter(w => w.length > 0).length;
                    totalWordCount += words;
                }
            });
        }
        const getEstWordsPerPage = () => {
            const size = book.book_size ? book.book_size.replace(/\s/g, '').toLowerCase() : '5.5x8.5';
            if (size === '5x8' || size === '5.5x8.5') return 250;
            if (size === '6x9') return 300;
            if (size === '8.5x11') return 500;
            if (size === '16.5x11') return 600;
            return 275;
        };
        const estimatedPages = Math.max(1, Math.ceil(totalWordCount / getEstWordsPerPage()));

        // Use Promise to handle Async Save correctly
        // FIX: Send formatting_data as JSON String to bypass PHP max_input_vars limit (1000)
        return axios.post(route('books.format.save', book.id), {
            formatting_data: JSON.stringify(data), // Send as string!
            num_pages: estimatedPages
        })
            .then(() => {
                // Success Handling
                if (!silent) {
                    setSaveStatus('Saved to Cloud');
                    takeSnapshot('Manual Save'); // Create history snapshot

                    // Show explicit success message for manual saves (as requested)
                    // We use a toast-like approach or simple alert if no toast component exists
                    // alert("Progress Saved Successfully!"); // User requested messsage
                } else {
                    setSaveStatus('Auto-saved');
                }
                return true;
            })
            .catch((error) => {
                console.error("Server save failed", error);
                setSaveStatus('⚠️ Local Save Only');

                // Even if server fails, we have local backup, so take a snapshot
                if (!silent) {
                    takeSnapshot('Local Backup (Offline)');

                    if (error.response) {
                        // Show the server's specific error message (e.g., data too large, integrity check failed)
                        const serverMsg = error.response.data?.message;
                        if (serverMsg) {
                            alert("⚠️ Save Issue: " + serverMsg);
                        } else if (error.response.status === 413) {
                            alert("⚠️ Save Failed: Content is too large. Please reduce image sizes.");
                        }
                    }
                }
                return false;
            });
    };






    // Flatten all sections into a linear playlist of SECTIONS for the Book View
    // We no longer split by page chunks here, as we will use CSS Columns to handle pagination dynamically
    const bookViewList = useMemo(() => {
        const list = [];

        // Helper to process a list of sections
        const processSections = (items, type) => {
            items.forEach(item => {
                const id = typeof item === 'string' ? item : item.id;
                const title = typeof item === 'string' ? sections[id]?.title : item.title;
                const content = sections[id]?.content || '';

                // Clean content for Book View: Remove visual-only editors margins
                let cleanContent = content.replace(/margin-top:\s*[\d\.]+px;?/gi, '');

                // TITLE DUPLICATION FIX (BOOK VIEW / PREVIEW)
                // Ensure we don't double-render the title if it's still partially in the text
                if (title) {
                    const regex = new RegExp(`^\\s*<(h[1-3]|p)[^>]*>\\s*${escapeRegExp(title)}\\s*<\\/\\1>\\s*`, 'i');
                    cleanContent = cleanContent.replace(regex, '');
                }

                // Always show structural elements (Chapters/Parts), even if empty
                if (cleanContent.trim() || cleanContent.includes('<img') || title || type === 'chapter' || type === 'part') {
                    list.push({
                        id: id,
                        type: (typeof item === 'object' && item.type) ? item.type : type,
                        title: title,
                        content: cleanContent
                    });
                }
            });
        };

        // 1. Visible Front Matter (Pre-defined keys)
        // 1. Visible Front Matter (Pre-defined and Dynamic keys)
        processSections(visibleFrontMatterKeys, 'front');

        // 3. Chapters
        processSections(chapters, 'chapter');

        // 4. End Matter
        processSections(endMatters, 'end');

        return list;
    }, [sections, visibleFrontMatterKeys, frontMatters, chapters, endMatters]);



    const toggleEndMatter = () => setIsEndMatterOpen(!isEndMatterOpen);

    const addEndMatter = (e) => {
        e.stopPropagation(); // Prevent toggling when clicking add
        const newCount = endMatters.length + 1;
        const newId = `end-matter-${newCount}`;
        const newTitle = `End Matter ${newCount}`;

        // Add to list
        setEndMatters([...endMatters, { id: newId, title: newTitle }]);

        // Also add to sections data so we can edit it
        setSections(prev => ({
            ...prev,
            [newId]: { title: newTitle, content: '', placeholder: `Begin writing your ${newTitle} here...` }
        }));

        if (!isEndMatterOpen) setIsEndMatterOpen(true);
    };

    const deleteChapter = (id) => {
        setChapters(chapters.filter(c => c.id !== id));
        const newSections = { ...sections };
        delete newSections[id];
        setSections(newSections);
        if (activeSection === id) setActiveSection('prologue');
    };

    const deleteEndMatter = (id) => {
        setEndMatters(endMatters.filter(e => e.id !== id));
        const newSections = { ...sections };
        delete newSections[id];
        setSections(newSections);
        if (activeSection === id) setActiveSection('prologue');
    };

    // ==================== DRAG AND DROP FUNCTIONS ====================

    // Handle drag start
    const handleDragStart = (e, item, sectionType, index) => {
        setDraggedItem({ item, index });
        setDraggedSection(sectionType);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', item.id || item);
        // Add a visual effect
        e.target.style.opacity = '0.5';
    };

    // Handle drag end
    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
        setDraggedItem(null);
        setDraggedSection(null);
        setDragOverItem(null);
    };

    // Handle drag over
    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverItem(index);
    };

    // Handle drop for Pre-Content (visibleFrontMatterKeys)
    const handleDropFrontMatterKeys = (e, dropIndex) => {
        e.preventDefault();
        if (draggedSection !== 'frontMatterKeys' || draggedItem === null) return;

        const newKeys = [...visibleFrontMatterKeys];
        const [removed] = newKeys.splice(draggedItem.index, 1);
        newKeys.splice(dropIndex, 0, removed);
        setVisibleFrontMatterKeys(newKeys);
        setDraggedItem(null);
        setDragOverItem(null);
    };

    // Handle drop for Dynamic Front Matters
    const handleDropFrontMatters = (e, dropIndex) => {
        e.preventDefault();
        if (draggedSection !== 'frontMatters' || draggedItem === null) return;

        const newItems = [...frontMatters];
        const [removed] = newItems.splice(draggedItem.index, 1);
        newItems.splice(dropIndex, 0, removed);
        setFrontMatters(newItems);
        setDraggedItem(null);
        setDragOverItem(null);
    };

    // Handle drop for Chapters
    const handleDropChapters = (e, dropIndex) => {
        e.preventDefault();
        if (draggedSection !== 'chapters' || draggedItem === null) return;

        const newChapters = [...chapters];
        const [removed] = newChapters.splice(draggedItem.index, 1);
        newChapters.splice(dropIndex, 0, removed);
        setChapters(newChapters);
        setDraggedItem(null);
        setDragOverItem(null);
    };

    // Handle drop for End Matters
    const handleDropEndMatters = (e, dropIndex) => {
        e.preventDefault();
        if (draggedSection !== 'endMatters' || draggedItem === null) return;

        const newEndMatters = [...endMatters];
        const [removed] = newEndMatters.splice(draggedItem.index, 1);
        newEndMatters.splice(dropIndex, 0, removed);
        setEndMatters(newEndMatters);
        setDraggedItem(null);
        setDragOverItem(null);
    };

    const handleSectionClick = (key) => {
        setActiveSection(key);
    };

    // Dynamic page dimensions based on book size
    // Dynamic page dimensions based on book size (Moved to top)



    // Helper to insert a manual page break
    const insertPageBreak = () => {
        const marker = '<hr class="page-break-marker" style="border: none; border-top: 1px dashed #ccc; margin: 1em 0; height: 1px; page-break-after: always;" title="Page Break" />';
        document.execCommand('insertHTML', false, marker);
        // Trigger pagination update
        setTimeout(enforcePagination, 100);
    };


    const checkActiveFormat = () => {
        if (!document.queryCommandSupported('bold')) return;

        // Save the current selection range to persist through toolbar clicks
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            selectionRef.current = selection.getRangeAt(0);
        }

        const block = (document.queryCommandValue('formatBlock') || '').toLowerCase();
        if (block === 'h1') setCurrentBlockType('Heading 1');
        else if (block === 'h2') setCurrentBlockType('Heading 2');
        else if (block === 'h3') setCurrentBlockType('Heading 3');
        else if (block === 'block-quote') setCurrentBlockType('Quote');
        else setCurrentBlockType('Normal');
    };

    const execCmd = (command, value = null) => {
        if (selectionRef.current) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(selectionRef.current);
        }

        if (editorRef.current) editorRef.current.focus();

        document.execCommand(command, false, value);

        if (editorRef.current) {
            const event = new Event('input', { bubbles: true });
            editorRef.current.dispatchEvent(event);
        }
        checkActiveFormat();
    };

    // --- SMART TYPING ASSISTANT ---
    // Handles smart quotes, em-dashes, and cleanup on the fly
    const handleSmartInput = (e) => {
        try {
            if (!editorRef.current) return;

            // We act on "Space" or "Enter" to finalize a word/phrase
            if (e.key === ' ' || e.key === 'Enter') {
                const selection = window.getSelection();
                if (!selection.rangeCount) return;
                const range = selection.getRangeAt(0);
                const node = range.startContainer;

                // Only process text nodes
                if (node.nodeType === 3) { // TEXT_NODE
                    let text = node.nodeValue;
                    let originalText = text;

                    // 1. Smart Dashes (--) -> (—)
                    text = text.replace(/--/g, '—');

                    // 2. Smart Quotes (Basic)
                    // Convert " at start of word to “ and " at end to ”
                    // Note: deeply robust smart quotes usually need full context scanning, 
                    // but this regex handles the common case of "word" -> “word”
                    text = text.replace(/(\W|^)"/g, '$1“'); // Open quote
                    text = text.replace(/"/g, '”');        // Close quote (remaining)

                    // Single quotes ' -> ‘ ’
                    text = text.replace(/(\W|^)'/g, '$1‘');
                    text = text.replace(/'/g, '’');

                    if (text !== originalText) {
                        node.nodeValue = text;
                        // Restore cursor position (simple logic, valid since length mostly stays same or we added 1 char)
                        // (Actually nodeValue change keeps cursor at end of node often, may need adjustment if cursor was in middle)
                    }
                }
            }
        } catch (error) {
            console.error("Smart Input Error:", error);
        }
    };

    // --- VERSION HISTORY (Local Session) ---
    const [snapshots, setSnapshots] = useState([]);
    const [showHistoryMenu, setShowHistoryMenu] = useState(false);

    const takeSnapshot = (label = 'Auto-Save') => {
        const timestamp = new Date().toLocaleTimeString();
        const newSnapshot = {
            id: Date.now(),
            label,
            timestamp,
            data: {
                chapters: JSON.parse(JSON.stringify(chapters)),
                sections: JSON.parse(JSON.stringify(sections)),
                frontMatters: JSON.parse(JSON.stringify(frontMatters)),
                endMatters: JSON.parse(JSON.stringify(endMatters))
            }
        };
        setSnapshots(prev => [newSnapshot, ...prev].slice(0, 10)); // Keep last 10
    };

    const restoreSnapshot = (snapshot) => {
        if (confirm(`Restore version from ${snapshot.timestamp}? Current unsaved changes will be lost.`)) {
            setChapters(snapshot.data.chapters);
            setSections(snapshot.data.sections);
            setFrontMatters(snapshot.data.frontMatters);
            setEndMatters(snapshot.data.endMatters);
            setShowHistoryMenu(false);
            alert(`Restored version from ${snapshot.timestamp}`);
        }
    };

    // --- DRAG & DROP + IMAGE UPLOAD HANDLING ---

    const insertImageFromFile = (file) => {
        if (!file) return;

        // Upload image to server instead of embedding base64 (prevents JSON bloat)
        const formData = new FormData();
        formData.append('image', file);

        // Show a loading placeholder while uploading
        const placeholderId = `img-loading-${Date.now()}`;
        execCmd('insertHTML', `<span id="${placeholderId}" style="display:inline-block;padding:12px 20px;background:#f1f5f9;border:2px dashed #94a3b8;border-radius:8px;color:#64748b;font-size:13px;">⏳ Uploading image...</span>`);

        axios.post(`/books/${book.id}/format/upload-image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
            .then(response => {
                if (response.data.success) {
                    const imageUrl = response.data.url;

                    // Replace the loading placeholder with the actual image
                    const placeholder = document.getElementById(placeholderId);
                    if (placeholder) {
                        const img = document.createElement('img');
                        img.src = imageUrl;
                        img.style.cssText = 'max-width: 100%; height: auto; display: block; margin: 1em auto;';
                        placeholder.replaceWith(img);
                    }

                    // Trigger content update
                    setTimeout(() => {
                        if (editorRef.current) {
                            const event = new Event('input', { bubbles: true });
                            editorRef.current.dispatchEvent(event);
                        }
                    }, 100);
                }
            })
            .catch(error => {
                console.error('Image upload failed, falling back to base64:', error);

                // Fallback: use base64 if server upload fails
                const reader = new FileReader();
                reader.onload = (loadEvent) => {
                    const placeholder = document.getElementById(placeholderId);
                    if (placeholder) {
                        const img = document.createElement('img');
                        img.src = loadEvent.target.result;
                        img.style.cssText = 'max-width: 100%; height: auto; display: block; margin: 1em auto;';
                        placeholder.replaceWith(img);
                    }

                    setTimeout(() => {
                        if (editorRef.current) {
                            const event = new Event('input', { bubbles: true });
                            editorRef.current.dispatchEvent(event);
                        }
                    }, 100);
                };
                reader.readAsDataURL(file);
            });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            insertImageFromFile(file);
        }
        e.target.value = ''; // Reset input to allow selecting same file again
    };

    const handleEditorDragOver = (e) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleEditorDrop = (e) => {
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            e.preventDefault(); // Stop browser from opening file
            const file = files[0];
            if (file.type.startsWith('image/')) {
                insertImageFromFile(file);
            }
        }
        // If no files, let text drag-and-drop work naturally
    };







    // ==================== ADVANCED FORMATTING FUNCTIONS ====================

    // Apply font family
    const applyFont = (fontFamily) => {
        execCmd('fontName', fontFamily);
        setCurrentFont(fontFamily.split(',')[0].replace(/"/g, ''));
        setShowFontMenu(false);
    };

    // Apply font size
    const applyFontSize = (size) => {
        // Use CSS approach for better control
        if (selectionRef.current) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(selectionRef.current);
        }

        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const span = document.createElement('span');
            span.style.fontSize = `${size}px`;
            range.surroundContents(span);
        }
        setCurrentFontSize(size);
        setShowFontSizeMenu(false);
    };

    // Apply line height
    const applyLineHeight = (height) => {
        if (editorRef.current) {
            editorRef.current.style.lineHeight = height;
        }
        setCurrentLineHeight(height);
        setShowLineHeightMenu(false);
    };

    // Apply text color
    const applyTextColor = (color) => {
        execCmd('foreColor', color);
        setCurrentColor(color);
        setShowColorPicker(false);
    };

    // Apply highlight/background color
    const applyHighlight = (color) => {
        if (color === 'transparent') {
            execCmd('removeFormat');
        } else {
            execCmd('hiliteColor', color);
        }
        setShowHighlightPicker(false);
    };

    // Superscript
    const toggleSuperscript = () => {
        execCmd('superscript');
    };

    // Subscript
    const toggleSubscript = () => {
        execCmd('subscript');
    };

    // Insert scene break (decorative divider)
    const insertSceneBreak = () => {
        const sceneBreakHTML = `
            <div class="scene-break" contenteditable="false" style="text-align: center; margin: 2rem 0; user-select: none;">
                <span style="display: inline-block; letter-spacing: 0.5em; color: #94a3b8; font-size: 1.5rem;">⁂</span>
            </div>
        `;
        execCmd('insertHTML', sceneBreakHTML);
    };



    // Insert drop cap (first letter styling)
    const insertDropCap = () => {
        const dropCapHTML = `<span class="drop-cap" style="float: left; font-size: 4rem; line-height: 0.8; padding-right: 0.5rem; padding-top: 0.1rem; font-weight: bold; color: #1e293b;">T</span>`;
        execCmd('insertHTML', dropCapHTML);
    };

    // Insert horizontal rule
    const insertHorizontalRule = () => {
        execCmd('insertHorizontalRule');
    };

    // Insert special characters
    const insertSpecialChar = (char) => {
        execCmd('insertText', char);
        setShowInsertMenu(false);
    };



    // ==================== PRE-FLIGHT CHECKS SYSTEM ====================

    const runPreFlightChecks = () => {
        const issues = [];
        let hasInconsistencies = false;

        // --- 1. CONTENT CONSISTENCY CHECKS (New) ---

        // Check All Sections
        const allKeys = [...visibleFrontMatterKeys, ...chapters.map(c => c.id), ...endMatters.map(e => e.id)];

        allKeys.forEach(key => {
            const content = sections[key]?.content || '';
            const title = sections[key]?.title || 'Untitled Section';

            // A. Double Spaces
            // We ignore spaces inside HTML tags
            const textContent = content.replace(/<[^>]*>/g, ' ');
            if (/\s{2,}/.test(textContent) || content.includes('&nbsp;&nbsp;')) {
                issues.push({
                    type: 'consistency',
                    message: `Double spaces detected in "${title}".`,
                    sectionId: key,
                    fixAction: 'remove_double_spaces'
                });
                hasInconsistencies = true;
            }

            // B. Manual Line Breaks (<br>)
            // Publishers prefer paragraph tags <p> over <br>
            if ((content.match(/<br\s*\/?>/gi) || []).length > 3) {
                issues.push({
                    type: 'consistency',
                    message: `Excessive manual line breaks (<br>) detected in "${title}". Use paragraphs instead.`,
                    sectionId: key
                });
                hasInconsistencies = true;
            }

            // C. Improper Quotes (Straight vs Curly)
            // Check for straight quotes outside of HTML attributes
            // This is a naive check; robust checking requires parsing, but this catches basic "..." vs “...”
            // We strip tags first to avoid matching class="something"
            const textOnly = content.replace(/<[^>]*>/g, '');
            if (textOnly.includes('"') || textOnly.includes("'")) {
                issues.push({
                    type: 'consistency',
                    message: `Straight quotes detected in "${title}". Professional books prefer curly quotes (“ ”).`,
                    sectionId: key
                });
                hasInconsistencies = true;
            }

            // D. Font Consistency
            // Check for inline font-family declarations that might clash with the theme
            if (content.match(/font-family:[^;]+;/i)) {
                issues.push({
                    type: 'consistency',
                    message: `Inconsistent inline font styles detected in "${title}". Select "Clear Formatting" to fix.`,
                    sectionId: key
                });
                hasInconsistencies = true;
            }
        });

        // --- 2. STRUCTURAL CHECKS (Original) ---

        // A. Empty Chapters
        chapters.forEach(chap => {
            const cleanText = (sections[chap.id]?.content || '').replace(/<[^>]*>/g, '').trim();
            if (!cleanText && !sections[chap.id]?.content.includes('<img')) {
                issues.push({ type: 'warning', message: `Chapter "${chap.title}" appears to be empty.`, sectionId: chap.id });
            }
        });

        // B. Mixed Heading Levels (Heuristic)
        // Check if H3 is used without H2, or H2 without H1 (though H1 is usually the chapter title)
        chapters.forEach(chap => {
            const content = sections[chap.id]?.content || '';
            const hasH2 = content.includes('<h2');
            const hasH3 = content.includes('<h3');
            if (hasH3 && !hasH2) {
                issues.push({
                    type: 'consistency',
                    message: `Skipped heading level in "${chap.title}" (H3 used without H2).`,
                    sectionId: chap.id
                });
            }
        });

        // C. Image Quality (Active Editor Only)
        if (editorRef.current) {
            const images = editorRef.current.querySelectorAll('img');
            images.forEach((img, idx) => {
                if (img.naturalWidth > 0 && img.naturalWidth < 300) {
                    issues.push({
                        type: 'alert',
                        message: `Image #${idx + 1} in current section is low resolution (<300px).`,
                        sectionId: activeSection
                    });
                }

                // Check for Captions (Consistency)
                const next = img.nextSibling;
                const hasCaption = next && next.classList && next.classList.contains('image-caption');
                if (!hasCaption) {
                    issues.push({
                        type: 'consistency',
                        message: `Image #${idx + 1} is missing a caption.`,
                        sectionId: activeSection,
                        fixAction: 'add_caption' // Metadata for potential auto-fix later
                    });
                }
            });
            // D. Table Check
            const tables = editorRef.current.querySelectorAll('table');
            if (tables.length > 0) {
                issues.push({ type: 'info', message: 'Tables detected. Check layouts in "Book View".', sectionId: activeSection });
            }
        }

        setValidationIssues(issues);
        setShowValidationPanel(true);

        if (issues.length === 0) {
            alert("✅ Consistency Check Passed: Manuscript is structurally sound!");
        }
    };

    // Find and Replace functionality
    const handleFind = () => {
        if (!findText || !editorRef.current) return;

        const content = editorRef.current.innerHTML;
        const regex = new RegExp(findText, 'gi');
        const matches = content.match(regex);
        setFindResults({ count: matches ? matches.length : 0, current: 0 });

        // Highlight matches (simple version)
        if (matches && matches.length > 0) {
            const highlightedContent = content.replace(regex, (match) =>
                `<mark style="background-color: #fef08a;">${match}</mark>`
            );
            editorRef.current.innerHTML = highlightedContent;
        }
    };

    const handleReplace = () => {
        if (!findText || !editorRef.current) return;

        const content = editorRef.current.innerHTML;
        // Remove existing highlights first
        const cleanContent = content.replace(/<mark[^>]*>(.*?)<\/mark>/gi, '$1');
        const regex = new RegExp(findText, 'gi');
        const newContent = cleanContent.replace(regex, replaceText);
        editorRef.current.innerHTML = newContent;

        // Update state
        handleContentChange({ target: editorRef.current });
        setFindResults({ count: 0, current: 0 });
    };

    const handleReplaceAll = () => {
        handleReplace();
    };

    const clearFindHighlights = () => {
        if (!editorRef.current) return;
        const content = editorRef.current.innerHTML;
        const cleanContent = content.replace(/<mark[^>]*>(.*?)<\/mark>/gi, '$1');
        editorRef.current.innerHTML = cleanContent;
        setFindResults({ count: 0, current: 0 });
    };

    // Undo functionality
    const handleUndo = () => {
        document.execCommand('undo');
    };

    // Redo functionality
    const handleRedo = () => {
        document.execCommand('redo');
    };

    // Clear all formatting
    const clearFormatting = () => {
        execCmd('removeFormat');
    };



    // Keyboard shortcuts handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Only handle if editor is focused
            if (!editorRef.current?.contains(document.activeElement) &&
                !titleRef.current?.contains(document.activeElement)) return;

            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'b':
                        e.preventDefault();
                        execCmd('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        execCmd('italic');
                        break;
                    case 'u':
                        e.preventDefault();
                        execCmd('underline');
                        break;
                    case 'z':
                        if (e.shiftKey) {
                            e.preventDefault();
                            handleRedo();
                        } else {
                            e.preventDefault();
                            handleUndo();
                        }
                        break;
                    case 'y':
                        e.preventDefault();
                        handleRedo();
                        break;
                    case 'f':
                        e.preventDefault();
                        setShowFindReplace(true);
                        break;
                    case 's':
                        e.preventDefault();
                        saveProgress(false);
                        break;
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.font-menu-container')) setShowFontMenu(false);
            if (!e.target.closest('.font-size-menu-container')) setShowFontSizeMenu(false);
            if (!e.target.closest('.line-height-menu-container')) setShowLineHeightMenu(false);
            if (!e.target.closest('.color-picker-container')) setShowColorPicker(false);
            if (!e.target.closest('.highlight-picker-container')) setShowHighlightPicker(false);
            if (!e.target.closest('.insert-menu-container')) setShowInsertMenu(false);
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Handle browser back button for export preview modal
    useEffect(() => {
        const handlePopState = (e) => {
            // If export preview is open, close it instead of navigating away
            if (showExportPreview) {
                e.preventDefault();
                setShowExportPreview(false);
                // Push state back so user can still navigate
                window.history.pushState({ exportPreview: false }, '');
            }
        };

        // When export preview opens, push a new history state
        if (showExportPreview) {
            window.history.pushState({ exportPreview: true }, '');
        }

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [showExportPreview]);

    // Load saved progress on mount (Auto-Restore)
    useEffect(() => {
        let serverData = null;
        let localData = null;

        if (book.formatting_data) {
            try {
                serverData = typeof book.formatting_data === 'string'
                    ? JSON.parse(book.formatting_data)
                    : book.formatting_data;
            } catch (e) {
                console.error("Failed to parse server data", e);
            }
        }

        // Parse Local Data
        try {
            const localRaw = localStorage.getItem(`book_content_${book.id}`);
            if (localRaw) localData = JSON.parse(localRaw);
        } catch (e) {
            console.error("Failed to parse local data", e);
        }

        // Compare Timestamps to determine which is newer
        const serverTime = serverData?.lastSaved || 0;
        const localTime = localData?.lastSaved || 0;

        const dataToLoad = (localTime > serverTime) ? localData : serverData;
        const source = (localTime > serverTime) ? 'Local Backup' : 'Cloud Save';

        if (dataToLoad) {
            if (dataToLoad.layout) {
                const correctLayout = getDefaultLayout(book.book_size);
                if (dataToLoad.layout === correctLayout) {
                    setLayout(dataToLoad.layout);
                } else {
                    setLayout(correctLayout);
                }
            }
            if (dataToLoad.sections) {
                // Sanitization for sections as well
                const cleanSections = { ...dataToLoad.sections };
                Object.keys(cleanSections).forEach(key => {
                    if (cleanSections[key].title === 'New Part') {
                        cleanSections[key].title = '';
                    }
                });
                setSections(cleanSections);
            }
            if (dataToLoad.chapters) {
                // Sanitization: Remove legacy "New Part" titles so they appear as Untitled
                const cleanChapters = dataToLoad.chapters.map(c => c.title === 'New Part' ? { ...c, title: '' } : c);
                setChapters(cleanChapters);
            }
            if (dataToLoad.frontMatters) setFrontMatters(dataToLoad.frontMatters);

            // Restore Advanced Formatting
            if (dataToLoad.currentFont) setCurrentFont(dataToLoad.currentFont);
            if (dataToLoad.currentFontSize) setCurrentFontSize(dataToLoad.currentFontSize);
            if (dataToLoad.currentLineHeight) setCurrentLineHeight(dataToLoad.currentLineHeight);
            if (dataToLoad.currentColor) setCurrentColor(dataToLoad.currentColor);
            if (dataToLoad.headerSettings) setHeaderSettings(dataToLoad.headerSettings);
            if (dataToLoad.paragraphStyle) setParagraphStyle(dataToLoad.paragraphStyle);
            if (dataToLoad.chapterDesign) setChapterDesign(dataToLoad.chapterDesign);

            if (dataToLoad.visibleFrontMatterKeys) {
                setVisibleFrontMatterKeys(dataToLoad.visibleFrontMatterKeys);
            } else {
                // Fallback for older saves
                const dynamicIds = dataToLoad.frontMatters ? dataToLoad.frontMatters.map(f => f.id) : [];
                setVisibleFrontMatterKeys(['main_title', 'legal_info', 'contents_list', ...dynamicIds]);
            }

            if (dataToLoad.endMatters) setEndMatters(dataToLoad.endMatters);

            setSaveStatus(`Restored from ${source}`);

            // If local was newer, we should probably sync to server immediately or prompt, 
            // but for now let's just let the auto-save handle it eventually.
        }
    }, []); // Run once on mount

    // Auto-save every 10 seconds
    // Track changes for auto-save
    useEffect(() => {
        needsSaveRef.current = true;
    }, [layout, sections, chapters, frontMatters, endMatters, currentFont, currentFontSize, currentLineHeight, currentColor, headerSettings, paragraphStyle, chapterDesign]);

    // Use a ref to access the latest saveProgress function inside setInterval without resetting the interval
    const saveProgressRef = useRef(saveProgress);
    useEffect(() => {
        saveProgressRef.current = saveProgress;
    }, [saveProgress]);

    // Single interval for auto-save
    useEffect(() => {
        const interval = setInterval(() => {
            if (needsSaveRef.current) {
                saveProgressRef.current(true);
                needsSaveRef.current = false;
            }
        }, 10000);
        return () => clearInterval(interval);
    }, []);


    // Auto-generate Contents List when structural data changes
    useEffect(() => {
        // ESTIMATE WORDS PER PAGE based on Book Size
        // Calibrated against real PDF output — values are intentionally conservative
        // (lower than theoretical) to account for chapter headers, spacing, subheadings,
        // and images that reduce effective word density per page.
        const getWordsPerPage = () => {
            const size = book.book_size ? book.book_size.replace(/\s/g, '').toLowerCase() : '5.5x8.5';
            if (size === '5x8') return 200;        // ~200 words/page (small, tight margins)
            if (size === '5.5x8.5') return 215;    // ~215 words/page (most common book size)
            if (size === '6x9') return 250;         // ~250 words/page (medium trade paperback)
            if (size === '8.5x8.5') return 240;    // ~240 words/page (square format)
            if (size === '8.5x11') return 450;      // ~450 words/page (large academic)
            if (size === '16.5x11') return 420;     // ~420 words/page (magazine/oversized)
            return 215; // safe fallback
        };
        const wordsPerPage = getWordsPerPage();

        // With the new split PDF system, Front Matter has NO page numbers. 
        // Chapter 1 ALWAYS starts exactly at Page 1.
        let currentPage = 1;
        let tocHtml = '<h1 style="text-align: center; font-size: 32px; margin-top: 20px; margin-bottom: 48px; font-weight: normal; font-style: italic; letter-spacing: 4px;">Contents</h1>';

        let h1Global = 0;
        let h2Global = 0;
        let h3Global = 0;

        const tableStyle = 'width: 100%; max-width: 90%; margin: 0 auto; border-collapse: collapse; line-height: 1.4; page-break-inside: avoid;';

        // Function to extract and append headings to TOC
        const appendHeadingsToToc = (contentHtml, startPage, chapterNum) => {
            if (!contentHtml) return;

            // Hierarchical Heading Numbering counters
            let localH1 = 0;
            let localH2 = 0;
            let localH3 = 0;
            let lastPage = startPage;
            
            // Set initial counters based on contentpresence (one-based fallback for missing levels)
            const hasH1 = /<h1/i.test(contentHtml);
            const hasH2 = /<h2/i.test(contentHtml);
            localH1 = hasH1 ? 0 : 1;
            localH2 = (hasH1 || hasH2) ? 0 : 1;

            const doc = new DOMParser().parseFromString(contentHtml, 'text/html');
            const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null, false);
            let currentWords = 0;
            let currentNode;

            while ((currentNode = walker.nextNode())) {
                if (currentNode.nodeType === Node.TEXT_NODE) {
                    const text = currentNode.textContent.trim();
                    if (text) {
                        // Use robust word counting
                        currentWords += text.split(/\s+/).filter(Boolean).length;
                    }
                } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
                    const tagName = currentNode.tagName.toLowerCase();
                    if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3') {
                        const text = currentNode.textContent.trim();
                        if (text) {
                            // Accuracy safety: ensure page numbers never decrease due to estimation noise
                            const estPage = startPage + Math.floor(currentWords / wordsPerPage);
                            const estimatedHeadingPage = Math.max(lastPage, estPage);
                            lastPage = estimatedHeadingPage;

                            if (chapterNum !== undefined && chapterNum !== null) {
                                // Inside a chapter — use chapter-based numbering
                                if (tagName === 'h1') {
                                    localH1++;
                                    localH2 = 0;
                                    localH3 = 0;
                                    const numStr = `${chapterNum}.${localH1}`;
                                    tocHtml += `<table style="${tableStyle}"><tbody><tr>
                                        <td style="padding-top: 15px; padding-bottom: 5px; padding-left: 20px; font-weight: 600; font-size: 20px; color: #1e293b;" width="85%">${numStr} ${text}</td>
                                        <td style="padding-top: 15px; padding-bottom: 5px; font-weight: 600; font-size: 20px; color: #1e293b; text-align: right;" width="15%">${estimatedHeadingPage}</td>
                                    </tr></tbody></table>`;
                                } else if (tagName === 'h2') {
                                    if (localH1 === 0) localH1 = 1;
                                    localH2++;
                                    localH3 = 0;
                                    const numStr = `${chapterNum}.${localH1}.${localH2}`;
                                    tocHtml += `<table style="${tableStyle}"><tbody><tr>
                                        <td style="padding-top: 10px; padding-bottom: 5px; padding-left: 40px; font-weight: normal; font-size: 18px; color: #334155;" width="85%">${numStr} ${text}</td>
                                        <td style="padding-top: 10px; padding-bottom: 5px; font-weight: normal; font-size: 18px; color: #334155; text-align: right;" width="15%">${estimatedHeadingPage}</td>
                                    </tr></tbody></table>`;
                                } else if (tagName === 'h3') {
                                    if (localH1 === 0) localH1 = 1;
                                    if (localH2 === 0) localH2 = 1;
                                    localH3++;
                                    const numStr = `${chapterNum}.${localH1}.${localH2}.${localH3}`;
                                    tocHtml += `<table style="${tableStyle}"><tbody><tr>
                                        <td style="padding-top: 5px; padding-bottom: 5px; padding-left: 60px; font-weight: normal; font-size: 16px; color: #475569;" width="85%">${numStr} ${text}</td>
                                        <td style="padding-top: 5px; padding-bottom: 5px; font-weight: normal; font-size: 16px; color: #475569; text-align: right;" width="15%">${estimatedHeadingPage}</td>
                                    </tr></tbody></table>`;
                                }
                            } else {
                                // Non-chapter (end matter, parts) — use simple global numbering
                                if (tagName === 'h1') {
                                    h1Global++;
                                    h2Global = 0;
                                    h3Global = 0;
                                    const numStr = `${h1Global}`;
                                    tocHtml += `<table style="${tableStyle}"><tbody><tr>
                                        <td style="padding-top: 15px; padding-bottom: 5px; padding-left: 20px; font-weight: 600; font-size: 20px; color: #1e293b;" width="85%">${numStr}. ${text}</td>
                                        <td style="padding-top: 15px; padding-bottom: 5px; font-weight: 600; font-size: 20px; color: #1e293b; text-align: right;" width="15%">${estimatedHeadingPage}</td>
                                    </tr></tbody></table>`;
                                } else if (tagName === 'h2') {
                                    if (h1Global === 0) h1Global = 1;
                                    h2Global++;
                                    h3Global = 0;
                                    const numStr = `${h1Global}.${h2Global}`;
                                    tocHtml += `<table style="${tableStyle}"><tbody><tr>
                                        <td style="padding-top: 10px; padding-bottom: 5px; padding-left: 40px; font-weight: normal; font-size: 18px; color: #334155;" width="85%">${numStr} ${text}</td>
                                        <td style="padding-top: 10px; padding-bottom: 5px; font-weight: normal; font-size: 18px; color: #334155; text-align: right;" width="15%">${estimatedHeadingPage}</td>
                                    </tr></tbody></table>`;
                                } else if (tagName === 'h3') {
                                    if (h1Global === 0) h1Global = 1;
                                    if (h2Global === 0) h2Global = 1;
                                    h3Global++;
                                    const numStr = `${h1Global}.${h2Global}.${h3Global}`;
                                    tocHtml += `<table style="${tableStyle}"><tbody><tr>
                                        <td style="padding-top: 5px; padding-bottom: 5px; padding-left: 60px; font-weight: normal; font-size: 16px; color: #475569;" width="85%">${numStr} ${text}</td>
                                        <td style="padding-top: 5px; padding-bottom: 5px; font-weight: normal; font-size: 16px; color: #475569; text-align: right;" width="15%">${estimatedHeadingPage}</td>
                                    </tr></tbody></table>`;
                                }
                            }
                        }
                    }
                }
            }
        };

        // 1. Chapters & Parts (Starting at Page 1)
        chapters.forEach((chapter, index) => {
            const chaptersBefore = chapters.slice(0, index + 1).filter(c => c.type === 'chapter');
            const chapterNum = chaptersBefore.length;
            const title = sections[chapter.id]?.title || chapter.title || 'Untitled Section';
            const chapterWords = sections[chapter.id]?.wordCount || 0;
            const chapterPages = Math.max(1, Math.ceil(chapterWords / wordsPerPage));
            const startPage = currentPage;

            if (chapter.type === 'part') {
                tocHtml += `<table style="${tableStyle}"><tbody><tr>
                    <td style="padding-top: 40px; padding-bottom: 20px; padding-left: 40px; font-weight: bold; font-size: 20px; text-transform: uppercase; letter-spacing: 1.5px; color: #475569;" width="85%">${title || 'PART'}</td>
                    <td style="padding-top: 40px; padding-bottom: 20px; font-weight: bold; font-size: 18px; text-align: right;" width="15%">${currentPage}</td>
                </tr></tbody></table>`;

                // Read headings
                appendHeadingsToToc(sections[chapter.id]?.content, startPage, null);

                currentPage += 1;
            } else {
                tocHtml += `<table style="${tableStyle}"><tbody>
                <tr>
                    <td style="padding-top: 40px; padding-bottom: 5px; font-weight: bold; font-size: 24px; color: #1e293b;" width="85%">Chapter ${chapterNum}</td>
                    <td style="padding-top: 40px; padding-bottom: 5px; font-weight: bold; font-size: 24px; color: #1e293b; text-align: right;" width="15%">${currentPage}</td>
                </tr>
                <tr>
                    <td style="padding-bottom: 15px; font-weight: normal; font-size: 24px; color: #1e293b;" width="85%">${title}</td>
                    <td style="padding-bottom: 15px; font-weight: normal; font-size: 24px; color: #1e293b; text-align: right;" width="15%">${currentPage}</td>
                </tr>
                </tbody></table>`;

                // Read headings
                appendHeadingsToToc(sections[chapter.id]?.content, startPage, chapterNum);

                currentPage += chapterPages;
            }
        });

        // 2. End Matter Sections
        if (endMatters.length > 0) {
            tocHtml += `<table style="${tableStyle}"><tbody><tr><td colspan="2"><hr style="margin: 40px 0; border: 0; border-bottom: 1px solid #f1f5f9;"></td></tr></tbody></table>`;
            endMatters.forEach((item) => {
                const title = sections[item.id]?.title || item.title;
                const contentWords = sections[item.id]?.wordCount || 0;
                const itemPages = Math.max(1, Math.ceil(contentWords / wordsPerPage));
                const startPage = currentPage;

                tocHtml += `<table style="${tableStyle}"><tbody><tr>
                    <td style="padding: 10px 0; font-size: 14px; color: #1e293b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;" width="85%">${title}</td>
                    <td style="padding: 10px 0; font-size: 14px; color: #1e293b; font-weight: 600; text-align: right;" width="15%">${currentPage}</td>
                </tr></tbody></table>`;

                // Read headings
                appendHeadingsToToc(sections[item.id]?.content, startPage, null);

                currentPage += itemPages;
            });
        }

        // Update with Guard to prevent infinite state loops
        setSections(prev => {
            if (prev.contents_list?.content === tocHtml) return prev;
            return {
                ...prev,
                contents_list: { ...prev.contents_list, content: tocHtml }
            };
        });
    }, [
        chapters,
        endMatters,
        sections, // Add sections to explicitly trigger on live editor updates
        book.book_size,
        // Trigger on structural changes or content/title updates
        JSON.stringify(chapters.map(c => [sections[c.id]?.wordCount, sections[c.id]?.title])),
        JSON.stringify(endMatters.map(e => [sections[e.id]?.wordCount, sections[e.id]?.title]))
    ]);


    const handleManualSave = () => saveProgress(false);

    const handleApproveAndSave = async () => {
        setSaveStatus('Saving...');
        const success = await saveProgress(true);
        if (success) {
            alert("Formatting Data Saved Successfully! You can continue editing or return to the design page.");
            setSaveStatus('All Changes Saved');
        }
    };


    // Locked State for Uploaded Manuscripts
    // Lock editor if user uploaded a file (supports both 'upload' (new canonical) and 'upload_template' (legacy))
    if ((book.interior_layout_method === 'upload' || book.interior_layout_method === 'upload_template') && book.interior_file) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-100 to-indigo-50 font-sans">
                <Head title={`Locked - ${book.title}`} />
                <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-lg text-center border border-gray-200">
                    {/* Lock Icon with animation */}
                    <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>

                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Editor Locked</h2>
                    <p className="text-sm text-indigo-600 font-semibold mb-4">
                        Book Size: <span className="bg-indigo-100 px-2 py-0.5 rounded">{book.book_size || '6x9'} inches</span>
                    </p>

                    <p className="text-[#635c4e] mb-6 leading-relaxed">
                        You have uploaded a pre-formatted manuscript file (<span className="font-medium text-gray-800">.docx</span>).
                        The online editor is disabled to ensure your uploaded file is used for publication.
                    </p>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
                        <p className="text-sm text-blue-800 font-medium mb-1">📄 Uploaded File</p>
                        <p className="text-xs text-blue-600 truncate">{book.interior_file?.split('/').pop() || 'manuscript.docx'}</p>
                        <a
                            href={`/storage/${book.interior_file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800 mt-2 font-medium"
                        >
                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            Download File
                        </a>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={handleRemoveManuscript}
                            className="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-bold text-white transition-all bg-red-500 rounded-xl hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            Remove File & Unlock Editor
                        </button>
                        <Link
                            href={route('books.design', book.id)}
                            className="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-bold text-indigo-600 transition-all bg-indigo-50 rounded-xl hover:bg-indigo-100"
                        >
                            ← Return to Design Page
                        </Link>
                    </div>

                    <p className="mt-5 text-xs text-[#635c4e] leading-relaxed">
                        Your previous manual formatting work is preserved. Removing the uploaded file will restore your edits.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#f1f5f9] overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">
            <Head title={`Editing - ${book.title}`}>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Gandhi+Serif:ital,wght@0,400;0,700;1,400;1,700&family=Poppins:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Lora:wght@400;600&family=Comic+Neue:wght@400;700&family=Noto+Serif+Tamil:wght@400;600&display=swap" rel="stylesheet" />
            </Head>

            {/* LEFT SIDEBAR - Modern Slate */}
            <div className="w-72 bg-[#faf8f3] text-[#635c4e] flex flex-col flex-shrink-0 shadow-xl z-20">
                {/* Back Link (Save & Exit) */}
                <div className="p-5 border-b border-gray-800/50">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            saveProgress(true); // Save before exit
                            router.visit(route('books.design', book.id));
                        }}
                        className="flex items-center text-[11px] font-bold uppercase tracking-widest text-[#635c4e] hover:text-indigo-700 transition group mb-3 w-full text-left"
                    >
                        <svg className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        Back to Dashboard
                    </button>
                    <h1 className="text-[#4b443a] font-bold text-lg truncate leading-tight tracking-tight" title={book.title}>
                        {book.title}
                    </h1>
                </div>





                {/* Navigation Menu */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-4 space-y-6">

                    {/* Front Matter */}
                    <div className="relative">
                        <div className="flex items-center justify-between px-3 py-1 group">
                            <button
                                onClick={() => setIsFrontMatterOpen(!isFrontMatterOpen)}
                                className="flex-1 flex items-center text-left text-[11px] font-bold uppercase tracking-wider text-[#635c4e] hover:text-[#4b443a] transition focus:outline-none"
                            >
                                <svg className={`w-3 h-3 mr-2 text-indigo-500 transition-transform duration-300 ${isFrontMatterOpen ? 'rotate-0' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                <span className="group-hover:translate-x-0.5 transition-transform">Pre-Content</span>
                            </button>
                            <button
                                onClick={addFrontMatter}
                                className="p-1 text-[#635c4e] hover:text-indigo-700 hover:bg-indigo-500/10 rounded transition"
                                title="Add Front Matter Page"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            </button>
                        </div>


                        {isFrontMatterOpen && (
                            <div className="mt-1 space-y-0.5">
                                {visibleFrontMatterKeys.map((key, index) => {
                                    const isDynamic = key.startsWith('front-matter-');
                                    return (
                                        <div
                                            key={key}
                                            onDragStart={(e) => handleDragStart(e, { id: key }, 'frontMatterKeys', index)}
                                            onDragEnd={handleDragEnd}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDrop={(e) => handleDropFrontMatterKeys(e, index)}
                                            className={`group flex items-center justify-between px-4 py-2 mx-2 rounded-md cursor-pointer text-sm transition-all duration-200 ${dragOverItem === index && draggedSection === 'frontMatterKeys' ? 'border-t-2 border-indigo-500' : ''} ${activeSection === key ? 'bg-indigo-500/10 text-indigo-700 font-medium' : 'text-[#635c4e] hover:text-[#4b443a]'}`}
                                            onClick={() => handleSectionClick(key)}
                                        >
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                {/* Drag Handle */}
                                                <div className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" title="Drag to reorder">
                                                    <svg className="w-3.5 h-3.5 text-[#635c4e]" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"></path>
                                                    </svg>
                                                </div>
                                                {/* Dot indicator */}
                                                <div className={`w-1.5 h-1.5 flex-shrink-0 rounded-full transition-colors ${activeSection === key ? 'bg-indigo-500' : 'bg-transparent group-hover:bg-gray-600'}`}></div>
                                                <span className="truncate">{sections[key]?.title}</span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1">
                                                {activeSection === key && !isDynamic && (
                                                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4"></path></svg>
                                                )}

                                                <button
                                                    className={`p-1.5 text-[#635c4e] hover:text-red-700 hover:bg-red-400/10 rounded transition ${activeSection === key ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (isDynamic) deleteFrontMatter(key);
                                                        else deleteStandardFrontMatter(key);
                                                    }}
                                                    title="Delete"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}

                            </div>
                        )}
                    </div>

                    {/* Chapters */}
                    <div className="relative">
                        <div className="flex items-center justify-between px-3 py-1 group">
                            <button
                                onClick={() => setIsChapterOpen(!isChapterOpen)}
                                className="flex-1 flex items-center text-left text-[11px] font-bold uppercase tracking-wider text-[#635c4e] hover:text-[#4b443a] transition focus:outline-none"
                            >
                                <svg className={`w-3 h-3 mr-2 text-indigo-500 transition-transform duration-300 ${isChapterOpen ? 'rotate-0' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                <span className="group-hover:translate-x-0.5 transition-transform">Chapters</span>
                            </button>
                            <button
                                onClick={addChapter}
                                className="p-1 text-[#635c4e] hover:text-indigo-700 hover:bg-indigo-500/10 rounded transition"
                                title="Add Chapter"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            </button>
                        </div>

                        {isChapterOpen && (
                            <div className="mt-1 space-y-0.5">
                                {chapters.length === 0 ? (
                                    <div className="px-8 py-6 text-center">
                                        <p className="text-xs text-[#635c4e] mb-2">No chapters yet</p>
                                        <button onClick={() => setShowChapterMenu(true)} className="text-[10px] text-indigo-700 hover:text-indigo-700 underline underline-offset-2">Create your first chapter</button>
                                    </div>
                                ) : (
                                    chapters.map((item, index) => {
                                        const chapterNum = chapters.slice(0, index + 1).filter(c => c.type === 'chapter').length;
                                        return (
                                            <div
                                                key={item.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, item, 'chapters', index)}
                                                onDragEnd={handleDragEnd}
                                                onDragOver={(e) => handleDragOver(e, index)}
                                                onDrop={(e) => handleDropChapters(e, index)}
                                                className={`group relative flex items-center justify-between px-4 py-2 mx-2 rounded-md cursor-pointer text-sm transition-all duration-200 border border-transparent ${dragOverItem === index && draggedSection === 'chapters' ? 'border-t-2 border-indigo-500' : ''} ${activeSection === item.id ? 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20 font-medium shadow-sm' : 'text-[#635c4e] hover:bg-gray-100 hover:text-[#4b443a]'}`}
                                                onClick={() => handleSectionClick(item.id)}
                                            >
                                                <div className="flex items-center truncate gap-2 flex-1">
                                                    {/* Drag Handle */}
                                                    <div className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" title="Drag to reorder">
                                                        <svg className="w-3.5 h-3.5 text-[#635c4e]" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"></path>
                                                        </svg>
                                                    </div>
                                                    {item.type === 'chapter' && (
                                                        <span className={`font-mono text-xs opacity-50 ${activeSection === item.id ? 'text-indigo-700' : 'text-[#635c4e]'}`}>
                                                            {chapterNum.toString().padStart(2, '0')}
                                                        </span>
                                                    )}
                                                    <span className={`truncate ${!item.title ? 'text-[#635c4e] italic' : ''}`}>
                                                        {item.title || '(Untitled Chapter)'}
                                                    </span>
                                                </div>

                                                {/* Context Actions */}
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">

                                                    <button
                                                        className="p-1.5 text-[#635c4e] hover:text-red-700 hover:bg-red-400/10 rounded transition"
                                                        title="Delete"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (confirm(`Delete this Chapter?`)) deleteChapter(item.id);
                                                        }}
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>

                    {/* End Matter */}
                    <div className="relative">
                        <div className="flex items-center justify-between px-3 py-1 group">
                            <button
                                onClick={toggleEndMatter}
                                className="flex-1 flex items-center text-left text-[11px] font-bold uppercase tracking-wider text-[#635c4e] hover:text-[#4b443a] transition focus:outline-none"
                            >
                                <svg className={`w-3 h-3 mr-2 text-indigo-500 transition-transform duration-300 ${isEndMatterOpen ? 'rotate-0' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                <span className="group-hover:translate-x-0.5 transition-transform">End Matter</span>
                            </button>
                            <button
                                onClick={addEndMatter}
                                className="p-1 text-[#635c4e] hover:text-indigo-700 hover:bg-indigo-500/10 rounded transition"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            </button>
                        </div>

                        {isEndMatterOpen && (
                            <div className="mt-1 space-y-0.5">
                                {endMatters.length === 0 ? (
                                    <div className="px-8 py-4 text-center">
                                        <p className="text-xs text-[#635c4e]">No end matter items.</p>
                                    </div>
                                ) : (
                                    endMatters.map((item, index) => (
                                        <div
                                            key={item.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, item, 'endMatters', index)}
                                            onDragEnd={handleDragEnd}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDrop={(e) => handleDropEndMatters(e, index)}
                                            className={`group flex items-center justify-between px-4 py-2 mx-2 rounded-md cursor-pointer text-sm transition-all duration-200 border border-transparent ${dragOverItem === index && draggedSection === 'endMatters' ? 'border-t-2 border-indigo-500' : ''} ${activeSection === item.id ? 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20 font-medium shadow-sm' : 'text-[#635c4e] hover:bg-gray-100 hover:text-[#4b443a]'}`}
                                            onClick={() => handleSectionClick(item.id)}
                                        >
                                            <div className="flex items-center gap-2">
                                                {/* Drag Handle */}
                                                <div className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" title="Drag to reorder">
                                                    <svg className="w-3.5 h-3.5 text-[#635c4e]" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"></path>
                                                    </svg>
                                                </div>
                                                <span className="font-mono text-xs opacity-50 text-[#635c4e]">{index + 1}.</span>
                                                <span>{item.title}</span>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    className="p-1.5 text-[#635c4e] hover:text-red-700 hover:bg-red-400/10 rounded transition"
                                                    onClick={(e) => { e.stopPropagation(); deleteEndMatter(item.id); }}
                                                    title="Delete"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                </div>

                {/* Footer Stats */}
                <div className="p-4 bg-[#faf8f3] border-t border-gray-800/50 text-center space-y-2">
                    <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-gray-100 text-[10px] font-bold tracking-widest text-[#635c4e]">
                        <span>{totalWordCount} TOTAL WORDS</span>
                        <span className="w-1 h-3 bg-gray-600 rounded-full"></span>
                        <span>EST. {Math.max(1, Math.ceil(totalWordCount / (() => { const s = (book.book_size || '').replace(/\s/g, '').toLowerCase(); if (s === '5x8') return 240; if (s === '5.5x8.5') return 260; if (s === '6x9') return 300; if (s === '8.5x8.5') return 290; if (s === '8.5x11') return 550; if (s === '16.5x11') return 500; return 260; })()))} TOTAL PAGES</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-[9px] text-amber-500/70 font-medium">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path></svg>
                        <span>Preview is approximate — download PDF for exact layout</span>
                    </div>
                </div>
            </div >

            {/* MAIN CONTENT Area */}
            < div className="flex-1 flex flex-col h-full relative overflow-hidden" >

                {/* TOP HEADER */}
                < div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm z-30 relative" >
                    <div className="flex items-center gap-3">
                        {/* Breadcrumbs or Status could go here */}

                        {/* HEADERS & FOOTERS Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowHeaderMenu(!showHeaderMenu)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-50 text-xs font-bold text-[#635c4e] hover:text-indigo-600 transition-colors uppercase tracking-wider"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                                Headers
                            </button>

                            {showHeaderMenu && (
                                <div className="absolute top-full left-0 mt-4 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                                    <h3 className="text-xs font-bold text-[#635c4e] uppercase tracking-wider mb-3">Header Configuration</h3>

                                    {/* Left Page Setting */}
                                    <div className="mb-4">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Left Page Header</label>
                                        <select
                                            value={headerSettings.leftContent}
                                            onChange={(e) => setHeaderSettings({ ...headerSettings, leftContent: e.target.value })}
                                            className="w-full text-xs border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="author_name">Author Name</option>
                                            <option value="book_title">Book Title</option>
                                            <option value="none">None (Blank)</option>
                                        </select>
                                    </div>

                                    {/* Right Page Setting */}
                                    <div className="mb-4">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Right Page Header</label>
                                        <select
                                            value={headerSettings.rightContent}
                                            onChange={(e) => setHeaderSettings({ ...headerSettings, rightContent: e.target.value })}
                                            className="w-full text-xs border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="chapter_title">Chapter Title</option>
                                            <option value="book_title">Book Title</option>
                                            <option value="author_name">Author Name</option>
                                            <option value="none">None (Blank)</option>
                                        </select>
                                    </div>

                                    {/* Page Numbers Toggle */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-gray-700">Show Page Numbers</span>
                                        <button
                                            onClick={() => setHeaderSettings({ ...headerSettings, showPageNumbers: !headerSettings.showPageNumbers })}
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${headerSettings.showPageNumbers ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                        >
                                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${headerSettings.showPageNumbers ? 'translate-x-5' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>



                        {/* TEMPLATE ACTIONS */}
                        <div className="flex items-center gap-3 ml-4">

                            <button
                                onClick={handleManualSave}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition shadow-sm cursor-pointer"
                                title="Save Progress to Browser"
                            >
                                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Auto-Saved</span>
                            </button>

                            {/* VERSION HISTORY BUTTON (New) */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowHistoryMenu(!showHistoryMenu)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition shadow-sm text-[#635c4e]"
                                    title="Version History"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">History</span>
                                </button>
                                {showHistoryMenu && (
                                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
                                        <div className="bg-gray-50 px-3 py-2 border-b border-gray-100 flex justify-between items-center">
                                            <span className="text-xs font-bold text-[#635c4e] uppercase">Session History</span>
                                            <button onClick={() => setShowHistoryMenu(false)} className="text-[#635c4e] hover:text-[#635c4e]">&times;</button>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            {snapshots.length === 0 ? (
                                                <div className="p-4 text-center text-xs text-[#635c4e] italic">No snapshots yet.</div>
                                            ) : (
                                                snapshots.map(snap => (
                                                    <div key={snap.id} onClick={() => restoreSnapshot(snap)} className="px-4 py-3 border-b border-gray-50 hover:bg-indigo-50 cursor-pointer transition">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="font-bold text-slate-700 text-xs">{snap.label}</span>
                                                            <span className="text-[10px] text-[#635c4e]">{snap.timestamp}</span>
                                                        </div>
                                                        <div className="text-[10px] text-[#635c4e]">Restores full state</div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">




                        <button
                            onClick={handleExport}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase px-6 py-2.5 rounded-lg shadow-lg shadow-indigo-200 transition-all hover:translate-y-px tracking-wide"
                        >
                            Preview
                        </button>

                        {/* Save Progress Button */}
                        <button
                            onClick={handleApproveAndSave}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase px-6 py-2.5 rounded-lg shadow-lg shadow-emerald-200 transition-all hover:translate-y-px tracking-wide"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                            Save Progress
                        </button>
                    </div>
                </div >

                {/* PROCESSING LOADER MODAL - Book Opening Animation */}
                {
                    isProcessing && (
                        <div className="fixed inset-0 z-[200] bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-slate-900/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-500">
                            <div className="flex flex-col items-center max-w-lg w-full mx-4 relative">

                                {/* Floating Particles */}
                                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                    {[...Array(12)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
                                            style={{
                                                left: `${10 + Math.random() * 80}%`,
                                                top: `${10 + Math.random() * 80}%`,
                                                animationDelay: `${i * 0.3}s`,
                                                animationDuration: `${3 + Math.random() * 2}s`
                                            }}
                                        ></div>
                                    ))}
                                </div>

                                {/* 3D Book Animation Container */}
                                <div className="relative mb-12" style={{ perspective: '1000px' }}>
                                    {/* Book Base/Shadow */}
                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-4 bg-[#faf8f3] rounded-[100%] blur-md animate-pulse"></div>

                                    {/* Book Structure */}
                                    <div className="relative w-48 h-64" style={{ transformStyle: 'preserve-3d' }}>

                                        {/* Back Cover */}
                                        <div
                                            className="absolute inset-0 bg-gradient-to-br from-indigo-700 to-purple-800 rounded-r-lg shadow-2xl"
                                            style={{ transform: 'rotateY(-5deg)' }}
                                        >
                                            <div className="absolute inset-2 border border-indigo-400/30 rounded-r-md"></div>
                                        </div>

                                        {/* Pages Stack */}
                                        <div className="absolute inset-0 left-[8px]">
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="absolute inset-y-2 right-2 bg-gradient-to-r from-gray-100 to-white rounded-r shadow"
                                                    style={{
                                                        left: `${4 + i * 2}px`,
                                                        zIndex: 5 - i
                                                    }}
                                                ></div>
                                            ))}
                                        </div>

                                        {/* Animated Flipping Pages */}
                                        {[...Array(3)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="absolute inset-y-2 right-2 left-4 bg-white rounded-r shadow-lg origin-left animate-page-flip"
                                                style={{
                                                    animationDelay: `${i * 0.6}s`,
                                                    zIndex: 10 + i
                                                }}
                                            >
                                                {/* Page Content Lines */}
                                                <div className="p-4 space-y-2">
                                                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                                                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                                                    <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                                                    <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Front Cover (Opening) */}
                                        <div
                                            className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-r-lg shadow-2xl origin-left animate-book-open"
                                        >
                                            {/* Cover Decoration */}
                                            <div className="absolute inset-4 border-2 border-[#d8d1c1] rounded-md flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-[#e7e1d4] rounded-full flex items-center justify-center mb-4 animate-pulse">
                                                    <svg className="w-8 h-8 text-[#17150f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                                    </svg>
                                                </div>
                                                <div className="w-20 h-2 bg-white/30 rounded mb-2"></div>
                                                <div className="w-14 h-1.5 bg-[#e7e1d4] rounded"></div>
                                            </div>

                                            {/* Spine highlight */}
                                            <div className="absolute left-0 inset-y-0 w-3 bg-gradient-to-r from-black/30 to-transparent"></div>
                                        </div>
                                    </div>

                                    {/* Sparkle Effects */}
                                    <div className="absolute -top-4 -right-4 text-yellow-800 animate-sparkle">✨</div>
                                    <div className="absolute -bottom-2 -left-4 text-yellow-800 animate-sparkle" style={{ animationDelay: '0.5s' }}>✨</div>
                                    <div className="absolute top-1/2 -right-8 text-yellow-800 animate-sparkle" style={{ animationDelay: '1s' }}>✨</div>
                                </div>

                                {/* Loading Text */}
                                <div className="text-center relative z-10">
                                    <h3 className="text-2xl font-bold text-[#17150f] mb-3 tracking-tight">
                                        Preparing Your Document
                                    </h3>
                                    <p className="text-indigo-700 text-sm mb-6">
                                        Formatting pages & applying styles...
                                    </p>

                                    {/* Progress Bar */}
                                    <div className="w-64 h-2 bg-[#e7e1d4] rounded-full overflow-hidden mx-auto">
                                        <div className="h-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-full animate-progress-indeterminate"></div>
                                    </div>
                                </div>
                            </div>

                            {/* CSS for Animations */}
                            <style>{`
    /* Auto Page Break Styles - HIDDEN IN EDITOR */
    .auto-page-break {
        display: none !important;
    }
    
    /* Print styles */
    @media print {
        .auto-page-break {
            display: none !important;
        }
    }

                            @keyframes book-open {
                                0%, 100% { transform: rotateY(0deg); }
                                50% { transform: rotateY(-120deg); }
                            }
                            @keyframes page-flip {
                                0%, 100% { transform: rotateY(0deg); opacity: 1; }
                                25% { transform: rotateY(-30deg); }
                                50% { transform: rotateY(-150deg); opacity: 0.5; }
                                75% { transform: rotateY(-170deg); opacity: 0; }
                            }
                            @keyframes float {
                                0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
                                50% { transform: translateY(-20px) scale(1.2); opacity: 0.6; }
                            }
                            @keyframes sparkle {
                                0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
                                50% { transform: scale(1.5) rotate(180deg); opacity: 0.5; }
                            }
                            @keyframes progress-indeterminate {
                                0% { transform: translateX(-100%); }
                                100% { transform: translateX(200%); }
                            }
                            .animate-book-open {
                                animation: book-open 3s ease-in-out infinite;
                            }
                            .animate-page-flip {
                                animation: page-flip 1.8s ease-in-out infinite;
                            }
                            .animate-float {
                                animation: float 4s ease-in-out infinite;
                            }
                            .animate-sparkle {
                                animation: sparkle 2s ease-in-out infinite;
                            }
                            }
                            .animate-progress-indeterminate {
                                animation: progress-indeterminate 1.5s ease-in-out infinite;
                            }
                            
                                /* Prevent Double Line Breaks */
                            .formatted-content br + br {
                                display: none;
                            }

                            /* Prevent automatic centering of headings */
                            .formatted-content h1, 
                            .formatted-content h2, 
                            .formatted-content h3 {
                                text-align: left;
                            }
                        `}</style>
                        </div>
                    )
                }

                {/* WRITING WORKSPACE */}
                <div className="flex-1 overflow-y-auto bg-[#f8fafc] flex flex-col items-center py-12 relative custom-scrollbar">
                    {/* Enhanced Professional Toolbar - Floating Sticky */}
                    {/* Enhanced Professional Toolbar - Floating Sticky (Conditional Visibility) */}
                    <div
                        className={`sticky top-4 z-30 mb-8 flex flex-col gap-2 w-full max-w-[850px] mx-auto not-prose transition-all duration-300 ease-in-out ${isToolbarVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        {/* Main Toolbar Row */}
                        <div className="pointer-events-auto bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-xl shadow-indigo-500/10 px-4 py-2.5 flex items-center flex-wrap gap-y-2 gap-x-3 ring-1 ring-black/5 not-prose">

                            {/* Undo/Redo */}
                            <div className="flex items-center gap-0.5 flex-nowrap shrink-0">
                                <button onClick={handleUndo} className="p-1.5 text-[#635c4e] hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition w-8 h-8 flex items-center justify-center" title="Undo (Ctrl+Z)">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                                </button>
                                <button onClick={handleRedo} className="p-1.5 text-[#635c4e] hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition w-8 h-8 flex items-center justify-center" title="Redo (Ctrl+Y)">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"></path></svg>
                                </button>
                            </div>

                            <div className="w-px h-5 bg-gray-200 mx-1"></div>

                            {/* Font Family Selector */}
                            <div className="relative font-menu-container">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowFontMenu(!showFontMenu); }}
                                    className={`flex items-center gap-1 text-xs font-medium text-gray-700 hover:bg-gray-100 px-2 py-1.5 rounded-lg transition-colors border border-transparent hover:border-gray-200 min-w-[100px] ${showFontMenu ? 'bg-gray-100 border-gray-200' : ''}`}
                                >
                                    <span className="truncate">{currentFont}</span>
                                    <span className="text-[9px] opacity-50">▼</span>
                                </button>
                                {showFontMenu && (
                                    <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 max-h-80 overflow-y-auto">
                                        <div className="px-3 py-2 bg-gray-50 border-b border-gray-100/50 sticky top-0">
                                            <span className="text-[10px] font-bold text-[#635c4e] uppercase tracking-wider">Font Family</span>
                                        </div>
                                        {['Serif', 'Sans-Serif', 'Monospace'].map(category => (
                                            <div key={category}>
                                                <div className="px-3 py-1 text-[10px] font-bold text-[#635c4e] uppercase bg-gray-50/50">{category}</div>
                                                {availableFonts.filter(f => f.category === category).map(font => (
                                                    <button
                                                        key={font.name}
                                                        onClick={() => applyFont(font.family)}
                                                        className="block w-full text-left px-4 py-2 hover:bg-indigo-50 text-gray-700 transition-colors border-l-4 border-transparent hover:border-[#7c7364]"
                                                        style={{ fontFamily: font.family }}
                                                    >
                                                        {font.name}
                                                    </button>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Font Size Selector */}
                            <div className="relative font-size-menu-container">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowFontSizeMenu(!showFontSizeMenu); }}
                                    className={`flex items-center gap-1 text-xs font-medium text-gray-700 hover:bg-gray-100 px-2 py-1.5 rounded-lg transition-colors border border-transparent hover:border-gray-200 w-14 ${showFontSizeMenu ? 'bg-gray-100 border-gray-200' : ''}`}
                                >
                                    {currentFontSize}px <span className="text-[9px] opacity-50">▼</span>
                                </button>
                                {showFontSizeMenu && (
                                    <div className="absolute top-full left-0 mt-1 w-24 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 max-h-60 overflow-y-auto">
                                        {fontSizes.map(size => (
                                            <button
                                                key={size}
                                                onClick={() => applyFontSize(size)}
                                                className={`block w-full text-left px-3 py-1.5 text-sm hover:bg-indigo-50 transition-colors ${currentFontSize === size ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700'}`}
                                            >
                                                {size}px
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="w-px h-5 bg-gray-200 mx-1"></div>

                            {/* Typography/Block Format */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowTypographyMenu(!showTypographyMenu)}
                                    className={`flex items-center gap-1 text-xs font-semibold text-gray-700 hover:bg-gray-100 px-2 py-1.5 rounded-lg transition-colors border border-transparent hover:border-gray-200 min-w-[80px] ${showTypographyMenu ? 'bg-gray-100 border-gray-200' : ''}`}
                                >
                                    {currentBlockType} <span className="text-[9px] opacity-50 ml-1">▼</span>
                                </button>
                                {showTypographyMenu && (
                                    <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1">
                                        <div className="px-3 py-2 bg-gray-50 border-b border-gray-100/50">
                                            <span className="text-[10px] font-bold text-[#635c4e] uppercase tracking-wider">Paragraph Format</span>
                                        </div>
                                        <button onClick={() => { execCmd('formatBlock', 'P'); setShowTypographyMenu(false); }} className="block w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 text-gray-700 transition-colors border-l-4 border-transparent hover:border-[#7c7364]">Normal</button>
                                        <button onClick={() => { execCmd('formatBlock', 'H1'); setShowTypographyMenu(false); }} className="block w-full text-left px-4 py-2.5 text-2xl font-bold hover:bg-indigo-50 text-slate-800 border-l-4 border-transparent hover:border-[#7c7364]">Heading 1</button>
                                        <button onClick={() => { execCmd('formatBlock', 'H2'); setShowTypographyMenu(false); }} className="block w-full text-left px-4 py-2 text-xl font-bold hover:bg-indigo-50 text-slate-800 border-l-4 border-transparent hover:border-[#7c7364]">Heading 2</button>
                                        <button onClick={() => { execCmd('formatBlock', 'H3'); setShowTypographyMenu(false); }} className="block w-full text-left px-4 py-2 text-lg font-semibold hover:bg-indigo-50 text-slate-800 border-l-4 border-transparent hover:border-[#7c7364]">Heading 3</button>
                                    </div>
                                )}
                            </div>

                            {/* Chapter Design Menu (New) */}
                            <div className="relative ml-2">
                                <button
                                    onClick={() => setShowChapterMenu(!showChapterMenu)}
                                    className={`flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100 ${showChapterMenu ? 'ring-2 ring-indigo-200' : ''}`}
                                    title="Chapter Styling"
                                >
                                    <span className="uppercase tracking-wider text-[10px]">Theme</span>
                                </button>

                                {showChapterMenu && (
                                    <div className="absolute top-full left-0 mt-1 w-60 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50">
                                        <div className="px-2 py-1 mb-2 border-b border-gray-100">
                                            <span className="text-[10px] font-bold text-[#635c4e] uppercase tracking-wider">Chapter Header Style</span>
                                        </div>
                                        <div className="space-y-1">
                                            {[
                                                { id: 'simple', label: 'Simple (Default)', desc: 'Clean and standard' },
                                                { id: 'modern', label: 'Modern Sans', desc: 'Bold, left-aligned, sleek' },
                                                { id: 'classic', label: 'Classic Serif', desc: 'Centered, elegant, italics' },
                                                { id: 'decorative', label: 'Decorative', desc: 'With ornamental dividers' },
                                                { id: 'minimal', label: 'Minimalist', desc: 'Small caps, letter-spaced' }
                                            ].map((style) => (
                                                <button
                                                    key={style.id}
                                                    onClick={() => setChapterDesign(style.id)}
                                                    className={`w-full text-left px-3 py-2 rounded-lg transition flex flex-col ${chapterDesign === style.id ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'hover:bg-gray-50 text-gray-700'}`}
                                                >
                                                    <span className="text-sm font-semibold">{style.label}</span>
                                                    <span className="text-[10px] opacity-60">{style.desc}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Professional Layout (Typography) Controls */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowAdvancedTypeMenu(!showAdvancedTypeMenu)}
                                    className={`flex items-center gap-1 text-xs font-semibold text-gray-700 hover:bg-gray-100 px-2 py-1.5 rounded-lg transition-colors border border-transparent hover:border-gray-200 ${showAdvancedTypeMenu ? 'bg-gray-100 border-gray-200' : ''}`}
                                    title="Text alignment, indentation, and hyphenation"
                                >
                                    <svg className="w-4 h-4 text-[#635c4e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                                    <span className="text-[9px] opacity-50 ml-0.5">▼</span>
                                </button>

                                {showAdvancedTypeMenu && (
                                    <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50">
                                        <div className="px-2 py-1 mb-2 border-b border-gray-100">
                                            <span className="text-[10px] font-bold text-[#635c4e] uppercase tracking-wider">Text Layout</span>
                                        </div>

                                        {/* Alignment */}
                                        <div className="flex gap-1 mb-3 justify-center">
                                            {['left', 'center', 'right', 'justify'].map(align => (
                                                <button
                                                    key={align}
                                                    onClick={() => setParagraphStyle({ ...paragraphStyle, alignment: align })}
                                                    className={`p-1.5 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition ${paragraphStyle.alignment === align ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300' : 'text-[#635c4e]'}`}
                                                    title={`Align ${align}`}
                                                >
                                                    {/* Icons for alignment */}
                                                    {align === 'left' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h10M4 18h16"></path></svg>}
                                                    {align === 'center' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M7 12h10M4 18h16"></path></svg>}
                                                    {align === 'right' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M10 12h10M4 18h16"></path></svg>}
                                                    {align === 'justify' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Indentation Mode */}
                                        <div className="mb-3 px-2">
                                            <label className="text-[10px] font-semibold text-[#635c4e] block mb-1">Paragraph Style</label>
                                            <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                                                <button
                                                    onClick={() => setParagraphStyle({ ...paragraphStyle, indentation: 'indent' })}
                                                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition ${paragraphStyle.indentation === 'indent' ? 'bg-white shadow text-indigo-600' : 'text-[#635c4e] hover:text-gray-700'}`}
                                                >
                                                    First Line
                                                </button>
                                                <button
                                                    onClick={() => setParagraphStyle({ ...paragraphStyle, indentation: 'block' })}
                                                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition ${paragraphStyle.indentation === 'block' ? 'bg-white shadow text-indigo-600' : 'text-[#635c4e] hover:text-gray-700'}`}
                                                >
                                                    Block
                                                </button>
                                            </div>
                                        </div>

                                        {/* Hyphenation */}
                                        <div className="px-2 flex items-center justify-between">
                                            <span className="text-[10px] font-semibold text-[#635c4e]">Auto-Hyphenation</span>
                                            <button
                                                onClick={() => setParagraphStyle({ ...paragraphStyle, hyphenation: !paragraphStyle.hyphenation })}
                                                className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${paragraphStyle.hyphenation ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                            >
                                                <span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${paragraphStyle.hyphenation ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="w-px h-5 bg-gray-200 mx-1"></div>

                            {/* Basic Formatting */}
                            <div className="flex items-center gap-0.5">
                                <button onClick={() => execCmd('bold')} className="p-1.5 text-[#635c4e] hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition font-bold w-8 h-8 flex items-center justify-center" title="Bold (Ctrl+B)">B</button>
                                <button onClick={() => execCmd('italic')} className="p-1.5 text-[#635c4e] hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition italic w-8 h-8 flex items-center justify-center" title="Italic (Ctrl+I)">I</button>
                                <button onClick={() => execCmd('underline')} className="p-1.5 text-[#635c4e] hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition underline w-8 h-8 flex items-center justify-center" title="Underline (Ctrl+U)">U</button>
                                <button onClick={() => execCmd('strikeThrough')} className="p-1.5 text-[#635c4e] hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition line-through w-8 h-8 flex items-center justify-center" title="Strikethrough">S</button>
                                <button onClick={toggleSuperscript} className="p-1.5 text-[#635c4e] hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition w-8 h-8 flex items-center justify-center text-xs" title="Superscript">X²</button>
                                <button onClick={toggleSubscript} className="p-1.5 text-[#635c4e] hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition w-8 h-8 flex items-center justify-center text-xs" title="Subscript">X₂</button>
                            </div>

                            <div className="w-px h-5 bg-gray-200 mx-1"></div>

                            {/* Text Color */}
                            <div className="relative color-picker-container">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker); }}
                                    className="p-1.5 text-[#635c4e] hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition w-8 h-8 flex flex-col items-center justify-center"
                                    title="Text Color"
                                >
                                    <span className="text-sm font-bold">A</span>
                                    <div className="w-4 h-1 rounded-full mt-0.5" style={{ backgroundColor: currentColor }}></div>
                                </button>
                                {showColorPicker && (
                                    <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
                                        <div className="grid grid-cols-5 gap-1 w-32">
                                            {colorPalette.map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => applyTextColor(color)}
                                                    className="w-5 h-5 rounded border border-gray-200 hover:scale-110 transition-transform"
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Highlight Color */}
                            <div className="relative highlight-picker-container">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowHighlightPicker(!showHighlightPicker); }}
                                    className="p-1.5 text-[#635c4e] hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition w-8 h-8 flex items-center justify-center"
                                    title="Highlight"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15.243 4.515l-6.738 6.737-.707 2.121-1.04 1.041 2.828 2.828 1.04-1.04 2.122-.708 6.737-6.737-4.242-4.242zM12 22a1 1 0 01-1-1v-3a1 1 0 112 0v3a1 1 0 01-1 1z" /></svg>
                                </button>
                                {showHighlightPicker && (
                                    <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
                                        <div className="grid grid-cols-4 gap-1 w-28">
                                            {highlightColors.map((color, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => applyHighlight(color)}
                                                    className={`w-5 h-5 rounded border hover:scale-110 transition-transform ${color === 'transparent' ? 'border-red-300 relative overflow-hidden' : 'border-gray-200'}`}
                                                    style={{ backgroundColor: color === 'transparent' ? '#fff' : color }}
                                                >
                                                    {color === 'transparent' && <div className="absolute inset-0 flex items-center justify-center text-red-700 text-xs">✕</div>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="w-px h-5 bg-gray-200 mx-1"></div>

                            {/* Lists & Alignment */}
                            <div className="flex items-center gap-0.5 flex-nowrap shrink-0">
                                <button onClick={() => execCmd('insertUnorderedList')} className="p-1.5 text-[#635c4e] hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition w-8 h-8 flex items-center justify-center" title="Bullet List">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                                </button>
                                <button onClick={() => execCmd('insertOrderedList')} className="p-1.5 text-[#635c4e] hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition w-8 h-8 flex items-center justify-center" title="Numbered List">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h12M7 12h12M7 17h12M3 7h.01M3 12h.01M3 17h.01"></path></svg>
                                </button>
                                <button onClick={() => execCmd('justifyLeft')} className="p-1.5 text-[#635c4e] hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition w-8 h-8 flex items-center justify-center" title="Align Left">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h10M4 18h16"></path></svg>
                                </button>
                                <button onClick={() => execCmd('justifyCenter')} className="p-1.5 text-[#635c4e] hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition w-8 h-8 flex items-center justify-center" title="Align Center">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M7 12h10M4 18h16"></path></svg>
                                </button>
                                <button onClick={() => execCmd('justifyRight')} className="p-1.5 text-[#635c4e] hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition w-8 h-8 flex items-center justify-center" title="Align Right">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M10 12h10M4 18h16"></path></svg>
                                </button>
                                <button onClick={() => execCmd('justifyFull')} className="p-1.5 text-[#635c4e] hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition w-8 h-8 flex items-center justify-center" title="Justify">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                                </button>
                            </div>

                            <div className="w-px h-5 bg-gray-200 mx-1"></div>

                            {/* Line Height */}
                            <div className="relative line-height-menu-container">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowLineHeightMenu(!showLineHeightMenu); }}
                                    className="p-1.5 text-[#635c4e] hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition w-8 h-8 flex items-center justify-center"
                                    title="Line Spacing"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                                </button>
                                {showLineHeightMenu && (
                                    <div className="absolute top-full right-0 mt-1 w-32 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
                                        <div className="px-3 py-2 bg-gray-50 border-b border-gray-100/50">
                                            <span className="text-[10px] font-bold text-[#635c4e] uppercase">Line Height</span>
                                        </div>
                                        {lineHeights.map(lh => (
                                            <button
                                                key={lh.value}
                                                onClick={() => applyLineHeight(lh.value)}
                                                className={`block w-full text-left px-3 py-1.5 text-sm hover:bg-indigo-50 transition-colors ${currentLineHeight === lh.value ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700'}`}
                                            >
                                                {lh.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="w-px h-5 bg-gray-200 mx-1"></div>

                            {/* Insert Menu */}
                            <div className="relative insert-menu-container">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowInsertMenu(!showInsertMenu); }}
                                    className={`flex items-center gap-1 text-xs font-medium text-gray-700 hover:bg-gray-100 px-2 py-1.5 rounded-lg transition-colors ${showInsertMenu ? 'bg-gray-100' : ''}`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                    Insert <span className="text-[9px] opacity-50">▼</span>
                                </button>
                                {showInsertMenu && (
                                    <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
                                        <div className="px-3 py-2 bg-gray-50 border-b border-gray-100/50">
                                            <span className="text-[10px] font-bold text-[#635c4e] uppercase">Insert Elements</span>
                                        </div>
                                        <button onClick={() => { insertSceneBreak(); setShowInsertMenu(false); }} className="block w-full text-left px-4 py-2 hover:bg-indigo-50 text-gray-700 transition-colors flex items-center gap-2">
                                            <span className="text-lg">⁂</span> Scene Break
                                        </button>
                                        <button onClick={() => { insertPageBreak(); setShowInsertMenu(false); }} className="block w-full text-left px-4 py-2 hover:bg-indigo-50 text-gray-700 transition-colors flex items-center gap-2">
                                            <span className="text-[#635c4e]">—</span> Page Break
                                        </button>
                                        <button onClick={() => { insertDropCap(); setShowInsertMenu(false); }} className="block w-full text-left px-4 py-2 hover:bg-indigo-50 text-gray-700 transition-colors flex items-center gap-2">
                                            <span className="text-2xl font-serif font-bold leading-none">T</span> Drop Cap
                                        </button>
                                        <button onClick={() => { insertHorizontalRule(); setShowInsertMenu(false); }} className="block w-full text-left px-4 py-2 hover:bg-indigo-50 text-gray-700 transition-colors flex items-center gap-2">
                                            <span className="text-[#635c4e]">━</span> Horizontal Line
                                        </button>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <div className="px-3 py-1 text-[10px] font-bold text-[#635c4e] uppercase">Special Characters</div>
                                        <div className="grid grid-cols-4 gap-1 p-2">
                                            {specialCharacters.slice(0, 12).map((sc, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => insertSpecialChar(sc.char)}
                                                    className="p-1.5 text-lg hover:bg-indigo-50 rounded transition-colors"
                                                    title={sc.name}
                                                >
                                                    {sc.char}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <button onClick={() => { insertFootnote(); setShowInsertMenu(false); }} className="block w-full text-left px-4 py-2 hover:bg-indigo-50 text-gray-700 transition-colors flex items-center gap-2">
                                            <span className="text-xs font-bold bg-gray-200 rounded px-1">1</span> Insert Footnote
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="w-px h-5 bg-gray-200 mx-1"></div>

                            {/* Quote & Image */}
                            <div className="flex items-center gap-0.5">
                                <button onClick={() => execCmd('formatBlock', 'blockquote')} className="p-1.5 text-[#635c4e] hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition w-8 h-8 flex items-center justify-center" title="Block Quote">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
                                </button>
                                <button onClick={() => fileInputRef.current?.click()} className="p-1.5 text-[#635c4e] hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition w-8 h-8 flex items-center justify-center" title="Insert Image">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                            </div>

                            <div className="w-px h-5 bg-gray-200 mx-1"></div>

                            {/* Find & Replace Toggle */}
                            <button
                                onClick={() => setShowFindReplace(!showFindReplace)}
                                className={`p-1.5 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition w-8 h-8 flex items-center justify-center ${showFindReplace ? 'text-indigo-600 bg-indigo-50' : 'text-[#635c4e]'}`}
                                title="Find & Replace (Ctrl+F)"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </button>

                            {/* Clear Formatting */}
                            <button onClick={clearFormatting} className="p-1.5 text-[#635c4e] hover:text-red-500 hover:bg-red-50/50 rounded-lg transition w-8 h-8 flex items-center justify-center" title="Clear Formatting">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </div>



                        {/* Find & Replace Bar */}
                        {showFindReplace && (
                            <div className="pointer-events-auto bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-lg px-4 py-2 flex items-center gap-3 flex-wrap justify-center">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Find..."
                                        value={findText}
                                        onChange={(e) => setFindText(e.target.value)}
                                        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Replace..."
                                        value={replaceText}
                                        onChange={(e) => setReplaceText(e.target.value)}
                                        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                                    />
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={handleFind} className="px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition">Find</button>
                                    <button onClick={handleReplace} className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition">Replace</button>
                                    <button onClick={handleReplaceAll} className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition">All</button>
                                    <button onClick={clearFindHighlights} className="px-2 py-1.5 text-xs text-[#635c4e] hover:text-gray-700 transition">Clear</button>
                                </div>
                                {findResults.count > 0 && (
                                    <span className="text-xs text-[#635c4e]">{findResults.count} found</span>
                                )}
                                <button onClick={() => setShowFindReplace(false)} className="text-[#635c4e] hover:text-[#635c4e] ml-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                        )}
                    </div>


                    {/* FREE FLOW EDITOR WORKSPACE - NO PAGINATION */}
                    <div className="flex flex-col items-center gap-8 pb-32 w-full">

                        {/* Section Title (Floating Header) */}
                        <div className="w-full max-w-[850px] text-center mb-4">
                            {sections[activeSection]?.type === 'chapter' && (
                                <div className="text-5xl md:text-6xl font-bold text-slate-800 mb-2 font-serif">
                                    Chapter {chapters.filter(c => c.type === 'chapter').findIndex(c => c.id === activeSection) + 1}
                                </div>
                            )}
                            <TitleEditor
                                className={`text-5xl md:text-6xl font-bold text-slate-800 bg-transparent focus:border-indigo-200 focus:outline-none transition-all cursor-text py-2 w-full text-center leading-tight ${activeSection === 'legal_info' ? 'cursor-not-allowed' : ''}`}
                                initialContent={sections[activeSection]?.title}
                                onUpdate={handleTitleChange}
                                onPaste={handleTitlePaste}
                                isLocked={activeSection === 'legal_info'}
                                key={activeSection}
                                placeholder="Chapter Title"
                            />
                        </div>

                        {/* UNRESTRICTED EDITOR CONTAINER */}
                        {(() => {
                            const templateConfig = getTemplateConfig(layout);
                            return (
                                <>
                                    <style>{`
                                    /* --- DYNAMIC TEMPLATE STYLES --- */
                                    .formatted-content {
                                        transition: all 0.3s ease;
                                        ${activeChapterNum ? `counter-reset: h1_num 0 h2_num 0 h3_num 0;` : ''}
                                    }

                                    /* Heading Numbering (Chapter-based) */
                                    ${activeChapterNum ? `
                                        .formatted-content h1 { counter-increment: h1_num; counter-reset: h2_num 0; }
                                        .formatted-content h1::before { content: "${activeChapterNum}." counter(h1_num) " "; }

                                        .formatted-content h2 { counter-increment: h2_num; counter-reset: h3_num 0; }
                                        .formatted-content h2::before { content: "${activeChapterNum}." counter(h1_num) "." counter(h2_num) " "; }

                                        .formatted-content h3 { counter-increment: h3_num; }
                                        .formatted-content h3::before { content: "${activeChapterNum}." counter(h1_num) "." counter(h2_num) "." counter(h3_num) " "; }
                                    ` : ''}
                                    .formatted-content p {
                                        text-indent: ${templateConfig.paragraphStyle === 'indent' ? templateConfig.paragraphIndent : '0'};
                                        margin-bottom: ${templateConfig.paragraphStyle === 'block' ? templateConfig.paragraphSpacing : '0'} !important;
                                        margin-top: 0;
                                        text-align: justify;
                                        text-justify: inter-word;
                                    }
                                    /* Front matter sections: no indent, no justify - let inline styles work */
                                    .formatted-content.front-matter-content p {
                                        text-indent: 0 !important;
                                        text-align: inherit !important;
                                        margin-bottom: inherit !important;
                                    }
                                    .formatted-content.front-matter-content div {
                                        text-align: inherit;
                                    }
                                    .formatted-content.front-matter-content h1 {
                                        text-align: inherit !important;
                                    }
                                    /* First paragraph has no indent */
                                    .formatted-content > p:first-of-type,
                                    .formatted-content h1 + p,
                                    .formatted-content h2 + p,
                                    .formatted-content h3 + p,
                                    .formatted-content hr + p {
                                        text-indent: 0;
                                    }
                                    /* Headings */
                                    .formatted-content h1,
                                    .formatted-content h2,
                                    .formatted-content h3 {
                                        font-family: ${templateConfig.headingFont} !important;
                                        font-weight: ${templateConfig.headingWeight} !important;
                                        color: ${templateConfig.textColor};
                                        text-align: left;
                                    }
                                    /* Drop cap */
                                    .formatted-content .drop-cap {
                                        float: left;
                                        font-size: 4rem;
                                        line-height: 0.8;
                                        padding-right: 0.5rem;
                                        padding-top: 0.1rem;
                                        font-weight: bold;
                                        color: ${templateConfig.textColor};
                                        font-family: ${templateConfig.headingFont};
                                    }
                                    /* Border for Bordered Style */
                                    ${templateConfig.hasBorder ? `
                                        .editor-page-container::before {
                                            content: '';
                                            position: absolute;
                                            inset: 30px;
                                            border: 3px solid ${templateConfig.borderColor};
                                            border-radius: 8px;
                                            pointer-events: none;
                                            z-index: 1;
                                        }
                                        .editor-page-container > * {
                                            position: relative;
                                            z-index: 2;
                                        }
                                    ` : ''}
                                `}</style>

                                    <div
                                        className={`relative mx-auto transition-all duration-300 editor-page-container ${getTemplateClass()}`}
                                        style={{
                                            width: `${pageDimensions.pageWidth}px`,
                                            padding: `${pageDimensions.marginTop}px ${pageDimensions.marginRight}px ${pageDimensions.marginBottom}px ${pageDimensions.marginLeft}px`,
                                            backgroundColor: templateConfig.backgroundColor,
                                            backgroundImage: templateConfig.backgroundImage || 'none',
                                            backgroundSize: templateConfig.backgroundSize || 'auto',
                                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                            border: '1px solid #e2e8f0',
                                            minHeight: `${pageDimensions.pageHeight}px`, // Minimum height only
                                            // ❌ REMOVED: All pagination-related background gradients
                                        }}
                                    >
                                        {/* LOCKED OVERLAY */}
                                        {!!book.interior_file && (
                                            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-xl border-2 border-dashed border-red-200" contentEditable={false}>
                                                <div className="bg-red-50 p-4 rounded-full mb-4 animate-pulse">
                                                    <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Editor Locked</h3>
                                                <p className="text-[#635c4e] mb-8 max-w-md font-medium leading-relaxed">
                                                    You have uploaded a formatted manuscript file (<span className="text-indigo-600 font-bold">{book.book_size}</span>). The manual editor is disabled to prevent data conflicts.
                                                </p>
                                                <div className="flex gap-4 items-center">
                                                    <a href={`/storage/${book.interior_file}`} target="_blank" className="px-5 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-bold hover:border-indigo-300 hover:bg-indigo-50 transition-all shadow-sm">
                                                        View Uploaded File
                                                    </a>
                                                    <button
                                                        onClick={handleRemoveManuscript}
                                                        className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                                    >
                                                        Remove File & Unlock
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {/* Empty State Overlay */}
                                        {!sections[activeSection]?.content && !sections[activeSection]?.title && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 opacity-50">
                                                <div className="text-center">
                                                    <div className="text-[#4b443a] text-4xl mb-2">✍️</div>
                                                    <p className="text-[#4b443a] font-serif italic">{sections[activeSection]?.placeholder || 'Start writing...'}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* UNRESTRICTED CONTENT EDITABLE AREA */}
                                        <div
                                            data-editor-block-root="true"
                                            className={`prose prose-lg formatted-content max-w-none focus:outline-none min-h-full ${activeSection === 'legal_info' || activeSection === 'contents_list' ? 'cursor-not-allowed opacity-80' : ''} ${['main_title', 'legal_info'].includes(activeSection) || frontMatters.some(f => f.id === activeSection) ? 'front-matter-content' : ''}`}
                                            style={{
                                                wordBreak: 'break-word',
                                                overflowWrap: 'break-word',
                                                outline: 'none',
                                                fontFamily: templateConfig.fontFamily,
                                                fontSize: `${templateConfig.fontSize}pt`,
                                                lineHeight: templateConfig.lineHeight,
                                                color: templateConfig.textColor,
                                                ...(activeSection === 'main_title' ? { minHeight: `${pageDimensions.pageHeight - pageDimensions.marginTop - pageDimensions.marginBottom}px` } : {})
                                            }}
                                            contentEditable={activeSection !== 'legal_info' && activeSection !== 'contents_list'}
                                            suppressContentEditableWarning={true}

                                            // EVENTS
                                            onInput={handleContentChange}
                                            onPaste={handleContentPaste}
                                            onDragOver={handleEditorDragOver}
                                            onDrop={handleEditorDrop}

                                            // REF & CONTENT SYNC
                                            ref={(el) => {
                                                editorRef.current = el;
                                                if (el && el.innerHTML !== sections[activeSection]?.content) {
                                                    el.innerHTML = sections[activeSection]?.content || "";
                                                }
                                            }}

                                            // UI SYNC
                                            onFocus={() => { setIsToolbarVisible(true); checkActiveFormat(); }}
                                            onBlur={() => setIsToolbarVisible(false)}
                                            onKeyUp={(e) => { checkActiveFormat(); handleSmartInput(e); }}
                                            onMouseUp={checkActiveFormat}
                                        />

                                        {/* Simple Stats Overlay - NO PAGE COUNT */}
                                        <div className="absolute -top-10 left-0 right-0 flex justify-between text-[10px] font-mono text-[#635c4e] opacity-60 select-none uppercase tracking-widest px-2">
                                            <div className="flex gap-4">
                                                <span>{book.book_size || '5.5x8.5'} Layout</span>
                                                <span>Words: {totalWordCount}</span>
                                            </div>
                                            <div className="flex gap-4 text-right">
                                                <span>Template: {layout}</span>
                                            </div>
                                        </div>

                                        {/* Read Only Indicator */}
                                        {activeSection === 'legal_info' && (
                                            <div className="absolute top-0 right-0 p-4 z-20 pointer-events-none">
                                                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded border border-amber-200 font-bold uppercase tracking-wider">
                                                    Read Only
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                    {/* PREVIEW MODE — PURE SCROLL-BASED READER (NO LAYOUT LOGIC)                    */}
                    {/* Features: Continuous scroll, font size, line spacing, theme, search          */}
                    {/* ═══════════════════════════════════════════════════════════════════════════ */}

                    {
                        showExportPreview && (
                            <div className={`fixed inset-0 z-[99999] flex flex-col ${previewSettings.theme === 'dark' ? 'bg-[#faf8f3]' : 'bg-white'}`}>

                                {/* Preview Header with controls */}
                                <div className={`h-14 px-4 flex items-center justify-between border-b ${previewSettings.theme === 'dark' ? 'bg-[#faf8f3] border-gray-700' : 'bg-white border-gray-200'}`}>
                                    <button onClick={() => setShowExportPreview(false)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
                                        Back to Editor
                                    </button>

                                    {/* ⚠️ Approximate Preview Notice */}
                                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-2 rounded-lg max-w-md">
                                        <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path></svg>
                                        <span><strong>Preview is approximate.</strong> Page count may differ slightly in the downloaded PDF due to print rendering differences. <strong>Download PDF</strong> for the exact print layout.</span>
                                    </div>

                                    {/* Theme toggle */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPreviewSettings(prev => ({ ...prev, theme: 'light' }))}
                                            className={`px-3 py-1 rounded ${previewSettings.theme === 'light' ? 'bg-indigo-600 text-[#17150f]' : 'bg-gray-200 text-gray-700'}`}
                                        >
                                            Light
                                        </button>

                                        <button
                                            onClick={() => setPreviewSettings(prev => ({ ...prev, theme: 'dark' }))}
                                            className={`px-3 py-1 rounded ${previewSettings.theme === 'dark' ? 'bg-indigo-600 text-[#17150f]' : 'bg-gray-200 text-gray-700'}`}
                                        >
                                            Dark
                                        </button>
                                    </div>
                                </div>

                                {/* Main Preview Layout: Sidebar + Content */}
                                <div className="flex-1 flex overflow-hidden">

                                    {/* TABLE OF CONTENTS SIDEBAR (Sticky) */}
                                    <div className={`w-64 flex-shrink-0 border-r overflow-y-auto p-4 hidden md:block ${previewSettings.theme === 'dark' ? 'bg-[#faf8f3] border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                        <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 opacity-50 ${previewSettings.theme === 'dark' ? 'text-[#17150f]' : 'text-slate-900'}`}>Table of Contents</h3>
                                        <nav className="space-y-1">
                                            {bookViewList.map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => {
                                                        const el = document.getElementById(`preview-section-${item.id}`);
                                                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all hover:translate-x-1 ${previewSettings.theme === 'dark'
                                                        ? 'text-[#4b443a] hover:bg-gray-700 hover:text-[#17150f]'
                                                        : 'text-slate-700 hover:bg-white hover:shadow-sm'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {item.type === 'chapter' && <span className="text-[10px] opacity-40 font-mono">CH</span>}
                                                        {item.type === 'front' && <span className="text-[10px] opacity-40 font-mono">FM</span>}
                                                        {item.type === 'end' && <span className="text-[10px] opacity-40 font-mono">EM</span>}
                                                        <span className="truncate">{item.title || '(Untitled)'}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </nav>
                                    </div>

                                    {/* Scrollable content area with pagination */}
                                    <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth" style={{ backgroundColor: previewSettings.theme === 'dark' ? '#1f2937' : '#f3f4f6' }}>
                                        <div className="mx-auto my-8 flex flex-col items-center">
                                            {bookViewList.map((item, index) => {
                                                const currentChapterNum = item.type === 'chapter' ? bookViewList.filter((c, idx) => c.type === 'chapter' && idx <= index).length : null;
                                                return (
                                                    <PaginatedPreviewSection
                                                        key={item.id}
                                                        item={item}
                                                        chapterNum={currentChapterNum}
                                                        pageDimensions={pageDimensions}
                                                        previewSettings={{
                                                            ...previewSettings,
                                                            fontSize: getTemplateConfig(layout).fontSize,
                                                            lineSpacing: getTemplateConfig(layout).lineHeight
                                                        }}
                                                        templateConfig={getTemplateConfig(layout)}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </div >
            </div >

            {/* --- IMAGE OVERLAY & TOOLBAR --- */}
            {
                selectedImage && overlayRect && (
                    <div
                        className="fixed pointer-events-none border-2 border-indigo-500 z-50 group"
                        style={{
                            top: overlayRect.fixedTop,
                            left: overlayRect.fixedLeft,
                            width: overlayRect.width,
                            height: overlayRect.height,
                        }}
                    >
                        <div
                            className="absolute -bottom-2 -right-2 w-4 h-4 bg-indigo-600 rounded-full cursor-nwse-resize pointer-events-auto border-2 border-white shadow-md hover:scale-125 transition-transform"
                            onMouseDown={handleResizeStart}
                        ></div>
                        <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 bg-[#faf8f3] text-[#17150f] text-[10px] px-2 py-0.5 rounded transition-opacity ${resizeState.isResizing ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                            {Math.round(overlayRect.width)} × {Math.round(overlayRect.height)}
                        </div>
                    </div>
                )
            }

            {
                selectedImage && (
                    <div
                        className="image-floating-toolbar fixed z-[99999] bg-white/90 backdrop-blur shadow-xl border border-gray-200/50 rounded-full px-3 py-1.5 flex items-center gap-1 animate-in zoom-in-95 duration-200"
                        style={{
                            top: (overlayRect?.fixedTop || 0) > 60
                                ? (overlayRect?.fixedTop || 0) - 50  // Above image if room
                                : (overlayRect?.fixedTop || 0) + (overlayRect?.height || 0) + 10, // Below if near top
                            left: Math.max(10, Math.min(
                                window.innerWidth - 220,
                                (overlayRect?.fixedLeft || 0) + ((overlayRect?.width || 0) / 2) - 100
                            ))
                        }}
                    >
                        <div className="flex items-center gap-1 border-r border-gray-100 pr-1 mr-1">
                            <button onClick={() => updateImageStyle({ float: 'left', width: '40%' })} className="p-1.5 text-[#635c4e] hover:text-indigo-600 rounded hover:bg-indigo-50" title="Float Left">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h10M4 18h16M4 6v12"></path></svg>
                            </button>
                            <button onClick={() => updateImageStyle({ clear: true, width: '100%' })} className="p-1.5 text-[#635c4e] hover:text-indigo-600 rounded hover:bg-indigo-50" title="Full Width">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                            </button>
                            <button onClick={() => updateImageStyle({ float: 'right', width: '40%' })} className="p-1.5 text-[#635c4e] hover:text-indigo-600 rounded hover:bg-indigo-50" title="Float Right">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M10 12h10M4 18h16M20 6v12"></path></svg>
                            </button>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => updateImageStyle({ width: '25%' })} className="px-2 py-1 text-xs font-bold text-[#635c4e] hover:text-indigo-600 rounded hover:bg-indigo-50">S</button>
                            <button onClick={() => updateImageStyle({ width: '50%' })} className="px-2 py-1 text-xs font-bold text-[#635c4e] hover:text-indigo-600 rounded hover:bg-indigo-50">M</button>
                            <button onClick={() => updateImageStyle({ width: '100%' })} className="px-2 py-1 text-xs font-bold text-[#635c4e] hover:text-indigo-600 rounded hover:bg-indigo-50">L</button>
                            <div className="w-px h-4 bg-gray-200 mx-1"></div>
                            <button onClick={deleteSelectedImage} className="p-1.5 text-[#635c4e] hover:text-red-600 hover:bg-red-50 rounded" title="Remove Image">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Book Size Display Indicator */}
            <div className="fixed bottom-6 left-8 z-[60] print:hidden">
                <div className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl rounded-full px-5 py-2.5 flex items-center gap-3 text-xs transition-all hover:shadow-2xl">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-slate-800 font-bold text-sm">
                                {book.book_size || '5.5×8.5'}"
                            </span>
                            <span className="text-[#635c4e] text-[10px] uppercase tracking-wide">
                                {pageDimensions.sizeName}
                            </span>
                        </div>
                    </div>

                    {pageDimensions.scaleFactor !== 1 && (
                        <>
                            <div className="w-px h-6 bg-slate-200"></div>
                            <div className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-[#635c4e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                </svg>
                                <span className="text-[#635c4e] font-mono font-bold">
                                    {Math.round(pageDimensions.scaleFactor * 100)}%
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Word Count Floating Indicator */}
            <div className="fixed bottom-6 right-8 z-[60] group print:hidden">
                <div className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl rounded-full px-5 py-2.5 flex items-center gap-4 text-xs font-bold text-[#635c4e] transition-all hover:shadow-2xl hover:scale-[1.02] hover:border-indigo-200 cursor-default">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="tabular-nums text-slate-800 text-sm">
                            {(totalWordCount || 0).toLocaleString()} <span className="text-[#635c4e] font-medium text-xs ml-0.5">words</span>
                        </span>
                    </div>

                    <div className="w-px h-4 bg-slate-200"></div>

                    <div className="flex items-center gap-2" title="Estimated Pages (approx. 250 words/page)">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className="tabular-nums text-slate-800 text-sm">
                            {Math.max(1, Math.ceil((totalWordCount || 0) / 250))} <span className="text-[#635c4e] font-medium text-xs ml-0.5">est. pages</span>
                        </span>
                    </div>
                </div>
            </div>

        </div >
    );
}

// Error Boundary & Wrapper
class ErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Formatting tool error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md text-center border border-gray-200">
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Editor Encountered an Error</h2>
                        <p className="text-[#635c4e] mb-6">Something unexpected happened. Please reload the page to continue your work. Your progress is saved locally.</p>
                        <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-lg">
                            Reload Editor
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function FormattingToolWrapper(props) {
    return (
        <ErrorBoundary>
            <FormattingTool {...props} />
        </ErrorBoundary>
    );
}
