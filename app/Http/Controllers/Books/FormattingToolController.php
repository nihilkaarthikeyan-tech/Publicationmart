<?php

namespace App\Http\Controllers\Books;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Smalot\PdfParser\Parser as PdfParser;

class FormattingToolController extends Controller
{
    /**
     * SECURITY: only allow embedding image files that live inside the app's
     * own public storage / asset directories. Blocks path traversal (e.g.
     * "storage/../../../.env") and absolute paths to arbitrary server files.
     * Returns the safe absolute path, or null if it is outside the allowlist.
     */
    private function safeLocalImagePath(?string $absolutePath): ?string
    {
        if (!$absolutePath) {
            return null;
        }
        $real = realpath($absolutePath);
        if ($real === false) {
            return null;
        }
        $allowedRoots = array_filter([
            realpath(storage_path('app/public')),
            realpath(public_path('storage')),
            realpath(public_path('images')),
            realpath(public_path('build')),
        ]);
        foreach ($allowedRoots as $root) {
            if (str_starts_with($real, $root . DIRECTORY_SEPARATOR) || $real === $root) {
                return $real;
            }
        }
        return null;
    }

    public function index(Book $book)
    {
        // Ensure only the owner can access (basic auth check)
        if ($book->user_id !== auth()->id() && !auth()->user()->is_admin) {
            abort(403);
        }

        $hasAiContent = $book->aiChapters()->exists();

        return Inertia::render('Books/FormattingTool', [
            'book' => $book,
            'hasAiContent' => $hasAiContent
        ]);
    }



    public function export(Request $request, Book $book)
    {
        if ($book->user_id !== auth()->id() && !auth()->user()->is_admin) {
            abort(403);
        }

        $format = $request->input('format', 'docx');

        // Check for UPLOADED MANUSCRIPT first (Priority Source)
        if ($book->interior_file && Storage::disk('public')->exists($book->interior_file)) {
            $path = Storage::disk('public')->path($book->interior_file);
            while (ob_get_level() > 0) { ob_end_clean(); }
            return response()->download($path, basename($path));
        }

        // Load formatting data
        if ($request->has('sections')) {
            $data = $request->validate([
                'sections'              => 'required|array',
                'frontMatters'          => 'array',
                'chapters'              => 'array',
                'endMatters'            => 'array',
                'visibleFrontMatterKeys'=> 'array',
                'layout'                => 'string'
            ]);
        } else {
            $data = $book->formatting_data;
            if (empty($data) || !is_array($data)) {
                return redirect()->back()->with('error', 'No saved formatting data found and no uploaded manuscript.');
            }
        }

        if ($format === 'epub') {
            return back()->with('error', 'EPUB export requires Pandoc which is not available on this server.');
        }

        // ═══════════════════════════════════════════════════════════
        // PDF: Two-Pass Generation for 100% Accurate TOC Page Numbers
        // ═══════════════════════════════════════════════════════════
        if ($format === 'pdf') {
            $tempBodyFiles = [];
            try {
                $dims         = $this->getPageDimensions($book->book_size ?? '5.5x8.5');
                $widthInches  = floatval($dims['width'])  / 1440;
                $heightInches = floatval($dims['height']) / 1440;

                $api2pdf = new \App\Services\Api2PdfService();

                $bodyOptions = [
                    'paperWidth'          => $widthInches,
                    'paperHeight'         => $heightInches,
                    'marginTop'           => 0.75,
                    'marginBottom'        => 0.75,
                    'marginLeft'          => 0.75,
                    'marginRight'         => 0.75,
                    'preferCSSPageSize'   => false,
                    'displayHeaderFooter' => true,
                    'footerTemplate'      => '<div style="width:100%;font-size:11px;text-align:center;color:#000;font-family:\'Times New Roman\',serif;"><span class="pageNumber"></span></div>',
                    'headerTemplate'      => '<div></div>',
                    'printBackground'     => true,
                ];

                $sections       = $data['sections']      ?? [];
                $chaptersData   = array_values($data['chapters']  ?? []);
                $endMattersData = $data['endMatters']    ?? [];

                // Helper closures
                $renderPdf = function(string $html) use ($api2pdf, $bodyOptions): string {
                    $res = $api2pdf->htmlToPdf($html, $bodyOptions);
                    if (!$res['success']) {
                        throw new \Exception("PDF render error: " . ($res['error'] ?? 'unknown'));
                    }
                    $tmp = tempnam(sys_get_temp_dir(), 'pdf_sec_');
                    file_put_contents($tmp, file_get_contents($res['pdf_url']));
                    return $tmp;
                };

                $countPages = function(string $file): int {
                    $fpdi = new \setasign\Fpdi\Fpdi();
                    return $fpdi->setSourceFile($file);
                };

                // ── PASS 1: Render each section, count real pages ──
                $currentBodyPage     = 1;
                $chapterPageStarts   = [];
                $endMatterStarts     = [];
                $preciseHeadingPages = []; // [chapterId => [headingText => relativePageNum]]

                $pdfParser = new PdfParser();

                foreach ($chaptersData as $index => $chapter) {
                    $cId = $chapter['id'];
                    if (empty($sections[$cId]['content'])) continue;

                    $chapterPageStarts[$cId] = $currentBodyPage;
                    $html     = $this->buildSingleSectionHtml($data, $book, 'chapter', $index, $chapter);
                    $tmpFile  = $renderPdf($html);
                    
                    // --- PRECISE HEADING SCANNING ---
                    try {
                        $parsedPdf = $pdfParser->parseFile($tmpFile);
                        $pdfPages  = $parsedPdf->getPages();
                        
                        // Extract headings we want to find
                        $headingsToFind = $this->extractHeadingsFromHtml($sections[$cId]['content']);
                        $foundHeadings  = [];

                        foreach ($pdfPages as $pIdx => $p) {
                            $pageText = $p->getText();
                            // Normalize text for better matching (lowercase, strip extra spaces)
                            $normalizedPageText = mb_strtolower(preg_replace('/\s+/', ' ', $pageText));

                            foreach ($headingsToFind as $hKey => $hText) {
                                if (isset($foundHeadings[$hKey])) continue;

                                $normalizedHText = mb_strtolower(preg_replace('/\s+/', ' ', $hText));
                                if (str_contains($normalizedPageText, $normalizedHText)) {
                                    $foundHeadings[$hKey] = $pIdx + 1; // 1-based page index within this file
                                }
                            }
                        }
                        $preciseHeadingPages[$cId] = $foundHeadings;
                    } catch (\Exception $e) {
                        \Log::warning("Precise PDF heading scan failed for chapter $cId", ['error' => $e->getMessage()]);
                    }

                    $currentBodyPage += $countPages($tmpFile);
                    $tempBodyFiles[] = $tmpFile;
                }

                foreach ($endMattersData as $emMeta) {
                    $eId = $emMeta['id'];
                    if (empty($sections[$eId]['content'])) continue;

                    $endMatterStarts[$eId] = $currentBodyPage;
                    $html     = $this->buildSingleSectionHtml($data, $book, 'end_matter', 0, $emMeta);
                    $tmpFile  = $renderPdf($html);
                    $currentBodyPage += $countPages($tmpFile);
                    $tempBodyFiles[] = $tmpFile;
                }

                // ── PASS 2: Rebuild TOC with REAL page numbers ──
                $dataWithRealToc = $this->injectRealTocPageNumbers(
                    $data, $chaptersData, $endMattersData,
                    $chapterPageStarts, $endMatterStarts,
                    $preciseHeadingPages
                );

                // ── PASS 3: Merge — Front Matter first, then ONE continuous Body PDF ──
                $pdf = new \setasign\Fpdi\Fpdi();

                $visibleKeys    = $dataWithRealToc['visibleFrontMatterKeys'] ?? [];
                $hasFrontMatter = false;
                foreach ($visibleKeys as $key) {
                    if (!empty($dataWithRealToc['sections'][$key]['content'])) {
                        $hasFrontMatter = true;
                        break;
                    }
                }

                if ($hasFrontMatter) {
                    // Render FRONT MATTER (No page numbers)
                    $htmlFront = $this->buildHtmlDocument($dataWithRealToc, $book, 'pdf', 'front_matter');
                    $frontRes  = $api2pdf->htmlToPdf($htmlFront, [
                        'paperWidth'          => $widthInches,
                        'paperHeight'         => $heightInches,
                        'marginTop'           => 0.75,
                        'marginBottom'        => 0.75,
                        'marginLeft'          => 0.75,
                        'marginRight'         => 0.75,
                        'preferCSSPageSize'   => false,
                        'displayHeaderFooter' => false, // No page numbers on Title/TOC
                        'printBackground'     => true,
                    ]);
                    if (!$frontRes['success']) {
                        throw new \Exception('Front matter PDF error: ' . $frontRes['error']);
                    }
                    $tmpFront = tempnam(sys_get_temp_dir(), 'pdf_front_');
                    file_put_contents($tmpFront, file_get_contents($frontRes['pdf_url']));

                    $pc = $pdf->setSourceFile($tmpFront);
                    for ($p = 1; $p <= $pc; $p++) {
                        $tpl  = $pdf->importPage($p);
                        $size = $pdf->getTemplateSize($tpl);
                        $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
                        $pdf->useTemplate($tpl);
                    }
                    @unlink($tmpFront);
                }

                // Render the ENTIRE BODY as one document for continuous numbering starting at 1
                $htmlBody = $this->buildHtmlDocument($dataWithRealToc, $book, 'pdf', 'chapters');
                $bodyRes  = $api2pdf->htmlToPdf($htmlBody, $bodyOptions);
                if (!$bodyRes['success']) {
                    throw new \Exception('Body PDF error: ' . $bodyRes['error']);
                }
                $tmpBody = tempnam(sys_get_temp_dir(), 'pdf_body_');
                file_put_contents($tmpBody, file_get_contents($bodyRes['pdf_url']));

                $pc = $pdf->setSourceFile($tmpBody);
                for ($p = 1; $p <= $pc; $p++) {
                    $tpl  = $pdf->importPage($p);
                    $size = $pdf->getTemplateSize($tpl);
                    $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
                    $pdf->useTemplate($tpl);
                }
                @unlink($tmpBody);

                // Cleanup leftover Pass 1 temp files
                foreach ($tempBodyFiles as $tmpFile) { @unlink($tmpFile); }
                $tempBodyFiles = [];

                $filename = preg_replace('/[^A-Za-z0-9_\-]/', '_', $book->title ?? 'Book') . '.pdf';
                return response()->streamDownload(function () use ($pdf) {
                    echo $pdf->Output('S');
                }, $filename, [
                    'Content-Type'        => 'application/pdf',
                    'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                ]);

            } catch (\Exception $e) {
                foreach ($tempBodyFiles as $f) { @unlink($f); }
                \Log::error('PDF generation failed (two-pass)', ['error' => $e->getMessage()]);
                return back()->with('error', 'Failed to generate PDF: ' . $e->getMessage());
            }
        }

        // --- DOCX Generation via PHPWord ---
        try {
            return $this->generateDocxWithPhpWord($data, $book);
        } catch (\Exception $e) {
            \Log::error('PHPWord DOCX generation failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return back()->with('error', 'Failed to generate DOCX: ' . $e->getMessage());
        }
    }


    /**
     * Build HTML for a SINGLE chapter or end-matter section.
     * Used by the two-pass PDF generator so each chapter is rendered separately
     * and its exact page count can be determined.
     */
    private function buildSingleSectionHtml(array $data, $book, string $type, int $index, array $sectionMeta): string
    {
        // Reuse buildHtmlDocument but override the chapters/endMatters arrays
        // to contain only the one section we want to render.
        $singleData = $data;

        if ($type === 'chapter') {
            $singleData['chapters']  = [$sectionMeta];
            $singleData['endMatters'] = [];
            $singleData['_chapter_index_override'] = $index; // pass original index for correct numbering
        } else {
            $singleData['chapters']  = [];
            $singleData['endMatters'] = [$sectionMeta];
        }

        // We render only the 'chapters' part (which now contains a single item)
        return $this->buildHtmlDocument($singleData, $book, 'pdf', 'chapters');
    }

    /**
     * Inject real page numbers (from Pass 1) into the TOC section of the data array.
     * Returns a copy of $data with the contents_list content updated to have correct page numbers.
     */
    private function injectRealTocPageNumbers(
        array $data,
        array $chaptersData,
        array $endMattersData,
        array $chapterPageStarts,
        array $endMatterStarts,
        array $preciseHeadingPages = []
    ): array {
        $sections = $data['sections'] ?? [];

        // Build the TOC HTML with real page numbers
        $tocHtml = '<h1 style="text-align:center;font-size:32px;margin-top:20px;margin-bottom:48px;font-weight:normal;font-style:italic;letter-spacing:4px;">Contents</h1>';
        $tableStyle = 'width:100%;max-width:90%;margin:0 auto;border-collapse:collapse;line-height:1.4;';

        $chapterNum = 0;
        foreach ($chaptersData as $chapter) {
            $cId   = $chapter['id'];
            if (empty($sections[$cId]['content'])) continue;

            $title = $sections[$cId]['title'] ?? $chapter['title'] ?? 'Untitled';
            $page  = $chapterPageStarts[$cId] ?? 1;

            if (($chapter['type'] ?? 'chapter') === 'part') {
                $tocHtml .= '<table style="' . $tableStyle . '"><tbody><tr>'
                    . '<td style="padding-top:40px;padding-bottom:20px;padding-left:40px;font-weight:bold;font-size:20px;text-transform:uppercase;letter-spacing:1.5px;color:#475569;" width="85%">' . htmlspecialchars($title) . '</td>'
                    . '<td style="padding-top:40px;padding-bottom:20px;font-weight:bold;font-size:18px;text-align:right;" width="15%">' . $page . '</td>'
                    . '</tr></tbody></table>';
            } else {
                $chapterNum++;
                $tocHtml .= '<table style="' . $tableStyle . '"><tbody>'
                    . '<tr><td style="padding-top:40px;padding-bottom:5px;font-weight:bold;font-size:24px;color:#1e293b;" width="85%">Chapter ' . $chapterNum . '</td>'
                    . '<td style="padding-top:40px;padding-bottom:5px;font-weight:bold;font-size:24px;color:#1e293b;text-align:right;" width="15%">' . $page . '</td></tr>'
                    . '<tr><td style="padding-bottom:15px;font-weight:normal;font-size:24px;color:#1e293b;" width="85%">' . htmlspecialchars($title) . '</td>'
                    . '<td style="padding-bottom:15px;font-weight:normal;font-size:24px;color:#1e293b;text-align:right;" width="15%">' . $page . '</td></tr>'
                    . '</tbody></table>';

                // --- Inject subheadings (H1/H2/H3) for this chapter ---
                $tocHtml .= $this->buildSubHeadingTocEntries(
                    $sections[$cId]['content'],
                    $chapterNum,
                    $page,
                    $tableStyle,
                    $preciseHeadingPages[$cId] ?? []
                );
            }
        }

        if (!empty($endMattersData)) {
            $tocHtml .= '<table style="' . $tableStyle . '"><tbody><tr><td colspan="2"><hr style="margin:40px 0;border:0;border-bottom:1px solid #f1f5f9;"></td></tr></tbody></table>';
            foreach ($endMattersData as $emMeta) {
                $eId   = $emMeta['id'];
                if (empty($sections[$eId]['content'])) continue;
                $title = $sections[$eId]['title'] ?? $emMeta['title'] ?? 'Section';
                $page  = $endMatterStarts[$eId] ?? 1;
                $tocHtml .= '<table style="' . $tableStyle . '"><tbody><tr>'
                    . '<td style="padding:10px 0;font-size:14px;color:#1e293b;font-weight:600;text-transform:uppercase;letter-spacing:1px;" width="85%">' . htmlspecialchars($title) . '</td>'
                    . '<td style="padding:10px 0;font-size:14px;color:#1e293b;font-weight:600;text-align:right;" width="15%">' . $page . '</td>'
                    . '</tr></tbody></table>';
            }
        }

        // Inject into the data copy
        $data['sections']['contents_list']['content'] = $tocHtml;
        return $data;
    }

    /**
     * Parse chapter HTML content for h1/h2/h3 headings and build TOC sub-entries.
     * Uses word-count offset from chapter start page to estimate each heading's page.
     * Mirrors the frontend appendHeadingsToToc() logic exactly.
     */
    private function buildSubHeadingTocEntries(
        string $contentHtml,
        int    $chapterNum,
        int    $chapterStart,
        string $tableStyle,
        array  $preciseOffsets = []
    ): string {
        if (empty(trim($contentHtml))) return '';

        // Approx words-per-page (FALLBACK ONLY if precise scanning fails)
        $wordsPerPage = 220;

        $html = '';
        $localH1 = 0;
        $localH2 = 0;
        $localH3 = 0;
        $wordsBefore = 0;

        // Use DOMDocument to safely walk nodes
        $dom = new \DOMDocument();
        // Suppress warnings for malformed HTML fragments
        @$dom->loadHTML('<?xml encoding="utf-8"?><div>' . $contentHtml . '</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);

        $xpath = new \DOMXPath($dom);
        // We only care about text nodes (to count words) and heading tags
        $allNodes = $xpath->query('//*[self::h1 or self::h2 or self::h3] | //text()[normalize-space()]');

        foreach ($allNodes as $node) {
            if ($node->nodeType === XML_TEXT_NODE) {
                $text = trim($node->textContent);
                if ($text) {
                    $wordsBefore += count(preg_split('/\s+/', $text));
                }
                continue;
            }

            // It's a heading element
            $tag  = strtolower($node->nodeName);
            $text = trim($node->textContent);
            if (empty($text)) continue;

            // Calculate estimated page offset
            $hKey = $tag . '_' . md5($text); // Unique key matching extractHeadingsFromHtml
            if (isset($preciseOffsets[$hKey])) {
                $estimatedPage = $chapterStart + $preciseOffsets[$hKey] - 1;
            } else {
                // Fallback to estimation
                $estimatedPage = $chapterStart + (int)floor($wordsBefore / $wordsPerPage);
            }

            if ($tag === 'h1') {
                $localH1++;
                $localH2 = 0;
                $localH3 = 0;
                $numStr = $chapterNum . '.' . $localH1;
                $html .= '<table style="' . $tableStyle . '"><tbody><tr>'
                    . '<td style="padding-top:15px;padding-bottom:5px;padding-left:20px;font-weight:600;font-size:20px;color:#1e293b;" width="85%">' . $numStr . ' ' . htmlspecialchars($text) . '</td>'
                    . '<td style="padding-top:15px;padding-bottom:5px;font-weight:600;font-size:20px;color:#1e293b;text-align:right;" width="15%">' . $estimatedPage . '</td>'
                    . '</tr></tbody></table>';

            } elseif ($tag === 'h2') {
                if ($localH1 === 0) $localH1 = 1;
                $localH2++;
                $localH3 = 0;
                $numStr = $chapterNum . '.' . $localH1 . '.' . $localH2;
                $html .= '<table style="' . $tableStyle . '"><tbody><tr>'
                    . '<td style="padding-top:10px;padding-bottom:5px;padding-left:40px;font-weight:normal;font-size:18px;color:#334155;" width="85%">' . $numStr . ' ' . htmlspecialchars($text) . '</td>'
                    . '<td style="padding-top:10px;padding-bottom:5px;font-weight:normal;font-size:18px;color:#334155;text-align:right;" width="15%">' . $estimatedPage . '</td>'
                    . '</tr></tbody></table>';

            } elseif ($tag === 'h3') {
                if ($localH1 === 0) $localH1 = 1;
                if ($localH2 === 0) $localH2 = 1;
                $localH3++;
                $numStr = $chapterNum . '.' . $localH1 . '.' . $localH2 . '.' . $localH3;
                $html .= '<table style="' . $tableStyle . '"><tbody><tr>'
                    . '<td style="padding-top:5px;padding-bottom:5px;padding-left:60px;font-weight:normal;font-size:16px;color:#475569;" width="85%">' . $numStr . ' ' . htmlspecialchars($text) . '</td>'
                    . '<td style="padding-top:5px;padding-bottom:5px;font-weight:normal;font-size:16px;color:#475569;text-align:right;" width="15%">' . $estimatedPage . '</td>'
                    . '</tr></tbody></table>';
            }

            // Also count the words inside the heading itself
            $wordsBefore += count(preg_split('/\s+/', $text));
        }

        return $html;
    }

    /**
     * Helper: Extract all headings from HTML and return a map for scanning the PDF.
     */
    private function extractHeadingsFromHtml(string $contentHtml): array
    {
        $headings = [];
        if (empty(trim($contentHtml))) return [];

        $dom = new \DOMDocument();
        @$dom->loadHTML('<?xml encoding="utf-8"?><div>' . $contentHtml . '</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        $xpath = new \DOMXPath($dom);
        $nodes = $xpath->query('//h1 | //h2 | //h3');

        foreach ($nodes as $node) {
            $tag  = strtolower($node->nodeName);
            $text = trim($node->textContent);
            if ($text) {
                // Use tag + md5 of text as unique key to handle duplicate titles safely
                $headings[$tag . '_' . md5($text)] = $text;
            }
        }
        return $headings;
    }

    private function buildHtmlDocument($data, $book, $format = 'pdf', $part = 'all')
    {
        // 1. Define Template Configs (Matches TEMPLATE_CONFIGS in FormattingTool.jsx)
        $templateConfigs = [
            '5 x 8' => [
                'fontFamily' => '"Times New Roman", Times, serif',
                'fontSize' => '12pt',
                'lineHeight' => '1.15',
                'textColor' => '#000000',
                'headingFont' => 'Poppins, Bahnschrift, "Segoe UI", sans-serif',
                'headingWeight' => 'bold',
                'margins' => ['top' => '0.75in', 'bottom' => '0.75in', 'left' => '0.9in', 'right' => '0.6in'],
                'paragraphStyle' => 'indent',
                'paragraphIndent' => '0.2in',
                'paragraphSpacing' => '6pt'
            ],
            '5.5 x 8.5' => [
                'fontFamily' => '"Times New Roman", Times, serif',
                'fontSize' => '12pt',
                'lineHeight' => '1.15',
                'textColor' => '#000000',
                'headingFont' => 'Poppins, Bahnschrift, "Segoe UI", sans-serif',
                'headingWeight' => 'bold',
                'margins' => ['top' => '0.75in', 'bottom' => '0.75in', 'left' => '0.85in', 'right' => '0.65in'],
                'paragraphStyle' => 'indent',
                'paragraphIndent' => '0.2in',
                'paragraphSpacing' => '6pt'
            ],
            '6x9' => [
                'fontFamily' => '"Times New Roman", Times, serif',
                'fontSize' => '12pt',
                'lineHeight' => '1.15',
                'textColor' => '#000000',
                'headingFont' => 'Poppins, Bahnschrift, "Segoe UI", sans-serif',
                'headingWeight' => 'bold',
                'margins' => ['top' => '0.75in', 'bottom' => '0.75in', 'left' => '0.9in', 'right' => '0.65in'],
                'paragraphStyle' => 'indent',
                'paragraphIndent' => '0.2in',
                'paragraphSpacing' => '6pt'
            ],
            '8.5 x 11' => [
                'fontFamily' => '"Times New Roman", Times, serif',
                'fontSize' => '12pt',
                'lineHeight' => '1.15',
                'textColor' => '#000000',
                'headingFont' => 'Poppins, Bahnschrift, "Segoe UI", sans-serif',
                'headingWeight' => 'bold',
                'margins' => ['top' => '1.0in', 'bottom' => '1.0in', 'left' => '1.0in', 'right' => '0.75in'],
                'paragraphStyle' => 'indent',
                'paragraphIndent' => '0.2in',
                'paragraphSpacing' => '6pt'
            ],
            '8.5x8.5' => [
                'fontFamily' => '"Times New Roman", Times, serif',
                'fontSize' => '12pt',
                'lineHeight' => '1.15',
                'textColor' => '#000000',
                'headingFont' => 'Poppins, Bahnschrift, "Segoe UI", sans-serif',
                'headingWeight' => 'bold',
                'margins' => ['top' => '1.0in', 'bottom' => '1.0in', 'left' => '1.0in', 'right' => '1.0in'],
                'paragraphStyle' => 'indent',
                'paragraphIndent' => '0.25in',
                'paragraphSpacing' => '6pt'
            ],
            '16.5x11' => [
                'fontFamily' => '"Times New Roman", Times, serif',
                'fontSize' => '20pt',
                'lineHeight' => '1.15',
                'textColor' => '#000000',
                'headingFont' => 'Cinzel, "Felix Titling", "Times New Roman", serif',
                'headingWeight' => 'bold',
                'margins' => ['top' => '0.75in', 'bottom' => '0.75in', 'left' => '0.75in', 'right' => '0.75in'],
                'paragraphStyle' => 'block',
                'paragraphIndent' => '0',
                'paragraphSpacing' => '6pt'
            ]
        ];

        // 2. Resolve Current Configuration
        // Priority: saved layout from editor > book's actual book_size > fallback '5.5 x 8.5'
        $bookSizeToLayoutMap = [
            '5x8' => '5 x 8',
            '5.5x8.5' => '5.5 x 8.5',
            '6x9' => '6x9',
            '8.5x11' => '8.5 x 11',
            '8.5x8.5' => '8.5x8.5',
            '16.5x11' => '16.5x11',
        ];
        $bookSizeKey = strtolower(str_replace(' ', '', $book->book_size ?? '5.5x8.5'));
        $layoutFromBookSize = $bookSizeToLayoutMap[$bookSizeKey] ?? '5.5 x 8.5';
        $layoutName = $data['layout'] ?? $layoutFromBookSize;
        // Keep what the user actually chose: the styled templates (e.g.
        // 'Horror Style') are not keys in this size-based config, so the safety
        // check below used to overwrite the name and the Horror background was
        // never applied.
        $requestedTemplate = $data['layout'] ?? null;
        // Ensure the layout actually exists in our config (safety check)
        if (!isset($templateConfigs[$layoutName])) {
            $layoutName = $layoutFromBookSize;
        }
        $config = $templateConfigs[$layoutName] ?? $templateConfigs['5.5 x 8.5'];

        // Override with user specifics if they customized it further
        $fontFamily = $data['currentFont'] ?? $config['fontFamily'];
        // Remove quotes from font family for CSS/Word stability
        $fontFamily = trim(explode(',', $fontFamily)[0], ' "\'');
        $fontSize = $config['fontSize']; // Default from template (e.g., '12pt')
        if (isset($data['currentFontSize'])) {
            $userSize = $data['currentFontSize'];
            // If the user size is numeric (from frontend slider), convert to pt for PDF
            // Frontend uses px but PDF/DomPDF works better with pt on small book pages
            if (is_numeric($userSize)) {
                if ($format === 'pdf') {
                    // Convert px to pt: 1px = 0.75pt (at 96dpi screen to 72dpi print)
                    $fontSize = round($userSize * 0.75, 1) . 'pt';
                }
                else {
                    $fontSize = $userSize . 'px';
                }
            }
            else {
                $fontSize = $userSize; // Already has units like '12pt'
            }
        }
        $lineHeight = $data['currentLineHeight'] ?? $config['lineHeight'];
        $color = $data['currentColor'] ?? $config['textColor'];

        // Margins for Pandoc to parse
        $marginTop = $config['margins']['top'] ?? '0.75in';
        $marginBottom = $config['margins']['bottom'] ?? '0.75in';
        $marginLeft = $config['margins']['left'] ?? $config['margins']['side'] ?? '0.75in';
        $marginRight = $config['margins']['right'] ?? $config['margins']['side'] ?? '0.75in';

        // Paragraph styles
        $pIndent = $config['paragraphIndent'];
        $pSpacing = $config['paragraphSpacing'];

        // Heading styles
        $hFont = $config['headingFont'];
        $hWeight = $config['headingWeight'];

        // If it is the Horror Template, we MUST force a dark background and light text in the PDF
        // (Pandoc ignores this for DOCX, but Api2Pdf will use it for the PDF preview)
        $backgroundColor = '#ffffff';
        $backgroundImageCss = '';
        if ($requestedTemplate === 'Horror Style' || $layoutName === 'Horror Style') {
            $backgroundColor = '#1a1a1a';
            // Force text color to be light if it was accidentally saved as black
            if ($color === '#000000' || $color === '#1e293b') {
                $color = '#111111'; // Using Dark text, as the "skulls" template is actually a light parchment color
            // Actually the image2.jpeg is a white parchment background with skulls, so we need DARK text! No white text!
            }
            $bgPath = str_replace('\\', '/', public_path('images/templates/image2.jpeg'));
            if (file_exists($bgPath)) {
                $backgroundImageCss = 'background-image: url("file:///' . $bgPath . '"); background-size: cover; background-position: center;';
            }
        }

        $cssPageMargins = '';
        $cssBody = '';
        $cssP = '';
        $cssHeading = '';

        if ($format === 'pdf') {
            $cssPageMargins = '
    @page {
        margin: ' . $marginTop . ' ' . $marginRight . ' ' . $marginBottom . ' ' . $marginLeft . ';
    }';
            $cssBody = '
        font-family: ' . htmlspecialchars($fontFamily) . ';
        font-size: ' . htmlspecialchars($fontSize) . ';
        line-height: ' . htmlspecialchars($lineHeight) . ';
        color: ' . htmlspecialchars($color) . ';
        background-color: ' . htmlspecialchars($backgroundColor) . ';
        ' . $backgroundImageCss;
            $cssP = '
        text-indent: ' . htmlspecialchars($pIndent) . ';
        margin-bottom: ' . htmlspecialchars($pSpacing) . ';
        margin-top: 0;';
            $cssHeading = '
        font-family: ' . htmlspecialchars($hFont) . ';
        font-weight: ' . htmlspecialchars($hWeight) . ';
        margin-top: 2em;
        margin-bottom: 1em;';
        }

        $html = '<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Cinzel:wght@400;700&family=Gandhi+Serif:ital,wght@0,400;0,700;1,400;1,700&family=Comic+Neue:wght@400;700&family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Merriweather:wght@400;700&family=Noto+Serif+Tamil:wght@400;600;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<style>' . $cssPageMargins . '
    body { ' . $cssBody . ' }
    p {
        ' . $cssP . '
        text-align: justify;
        text-justify: inter-word;
    }
    .chapter-header h1, .chapter-header h2,
    .front-matter > h1.explicit-title,
    .end-matter > h1 {
        text-align: center;
        ' . $cssHeading . '
    }
    .section.chapter h1:not(.chapter-title), .section.chapter h2:not(.chapter-number), .section.chapter h3,
    .section.end-matter h1, .section.end-matter h2, .section.end-matter h3 {
        ' . $cssHeading . '
        text-align: left;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
    }

    /* Hierarchical Heading Numbering for Chapters (Resets handled per-chapter below) */
    .section.chapter h1:not(.chapter-title) { counter-increment: h1_num; counter-reset: h2_num 0; }
    .section.chapter h2:not(.chapter-number) { counter-increment: h2_num; counter-reset: h3_num 0; }
    .section.chapter h3 { counter-increment: h3_num; }

    .chapter-header h1.chapter-title::before, .chapter-header h2.chapter-number::before {
        content: "";
    }

    /* Dynamic Chapter Prefixes and Resets (Injected below) */
    .chapter-header h1, .chapter-header h2 {
        text-align: center !important;
    }
    #pdf-footer {
        position: fixed;
        bottom: ' . ($format === 'pdf' ? '-50px' : '0') . ';
        left: 0;
        right: 0;
        height: 30px;
        text-align: center;
    }
    .pdf-page-number:before {
        content: counter(page);
    }
    .page-break { page-break-after: always; }
    .chapter-header { text-align: center; margin-top: 2em; margin-bottom: 1em; }
    .chapter-header h2 { font-size: 1.2em; margin-bottom: 0.3em; page-break-before: avoid; }
    .chapter-header h1 { font-size: 2em; margin-bottom: 0.5em; margin-top: 0; page-break-before: avoid; }
    .separator-line {
        width: 6rem;
        height: 1px;
        background-color: #d1d5db;
        margin: 0.5em auto 1.5em auto;
    }
    .front-matter p { text-indent: 0 !important; }
    .ql-align-center { text-align: center !important; }
    .ql-align-right { text-align: right !important; }
    .ql-align-justify { text-align: justify !important; text-justify: inter-word; }
    .front-matter h1 { page-break-before: avoid; text-align: center; }
    img { max-width: 100%; height: auto; display: block; margin: 0.5em auto; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 2px 4px; }
    ' . ($format === 'pdf' ? $this->generateHeadingNumberingCss($data) : '') . '
</style>
</head>
<body>';
        if ($format === 'pdf') {
        // Don't add static footer - we'll use DomPDF page_script for dynamic page numbering
        }

        $sections = $data['sections'] ?? [];

        // 1. FRONT MATTER
        $visibleKeys = $data['visibleFrontMatterKeys'] ?? [];
        foreach ($visibleKeys as $key) {
            if (!empty($sections[$key]['content'])) {
                if ($part === 'all' || $part === 'front_matter') {
                    $isTOC = ($key === 'contents_list');
                    $sectionHtml = $this->cleanHtmlForPandoc($sections[$key]['content'], $isTOC);

                    $html .= '<div class="section front-matter">';

                    if ($isTOC && $format === 'docx') {
                        if (preg_match_all('/<tr[^>]*>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<\/tr>/is', $sectionHtml, $matches, PREG_SET_ORDER)) {
                            $newTocHtml = '';
                            foreach ($matches as $match) {
                                $leftText = trim(strip_tags($match[1]));
                                $rightText = trim(strip_tags($match[2]));
                                $newTocHtml .= '<p custom-style="toc 1">' . $leftText . '&#9;' . $rightText . '</p>';
                            }
                            $sectionHtml = $newTocHtml;
                        }
                    }

                    // Add an explicit heading for ALL non-TOC sections that have a title,
                    // Except for Title Page and Copyright which have their own self-contained layout.
                    if (!$isTOC && !in_array($key, ['main_title', 'legal_info'])) {
                        $title = $sections[$key]['title'] ?? ucfirst(str_replace('_', ' ', $key));
                        $html .= '<h1 class="explicit-title">' . htmlspecialchars($title) . '</h1>';
                        $html .= '<div class="separator-line"></div>';
                    }

                    $html .= $sectionHtml;
                    $html .= '</div><div class="page-break"></div>';
                }
            }
        }

        // 2. CHAPTERS
        // Count front matter pages for page numbering offset
        $frontMatterSectionCount = 0;
        foreach ($visibleKeys as $key) {
            if (!empty($sections[$key]['content'])) {
                $frontMatterSectionCount++;
            }
        }

        // --- Chapters ---
        $chaptersData = array_values($data['chapters'] ?? []);
        // Support single-chapter rendering: use _chapter_index_override for correct chapter numbering
        $chapterIndexOffset = isset($data['_chapter_index_override']) ? $data['_chapter_index_override'] : null;
        $chapterOnlyCount = 0;
        foreach ($chaptersData as $idx => $chapter) {
            $cId = $chapter['id'];
            if (empty($sections[$cId]['content'])) continue;
            if ($part === 'all' || $part === 'chapters') {
                // Use real original index if provided (for single-chapter two-pass rendering)
                $realIndex   = ($chapterIndexOffset !== null) ? $chapterIndexOffset : $idx;
                $chapterNum  = $realIndex + 1;

                $html .= '<div class="section chapter chapter-' . $cId . '">';
                $html .= '<div class="chapter-header">';

                $titleUpper = strtoupper($chapter['title'] ?? '');
                if (strpos($titleUpper, 'CHAPTER') === false && !empty(trim($chapter['title'] ?? ''))) {
                    $html .= '<h2 class="chapter-number">Chapter ' . $chapterNum . '</h2>';
                }

                $chapterTitle = \Illuminate\Support\Str::title($chapter['title'] ?? '');
                if (!empty(trim($chapterTitle))) {
                    $html .= '<h1 class="chapter-title">' . htmlspecialchars($chapterTitle) . '</h1>';
                }
                $html .= '</div>'; // Close .chapter-header
                $html .= '<div class="separator-line"></div>';
                $html .= $this->cleanHtmlForPandoc($sections[$cId]['content'], false);
                $html .= '</div><div class="page-break"></div>';
            }
        }

        // --- End Matter ---
        $endMatters = $data['endMatters'] ?? [];
        foreach ($endMatters as $emMeta) {
            $eId = $emMeta['id'];
            if (empty($sections[$eId]['content'])) continue;
            if ($part === 'all' || $part === 'chapters') {
                $html .= '<div class="section end-matter">';
                $title = $sections[$eId]['title'] ?? 'Section';
                $html .= '<h1>' . htmlspecialchars($title) . '</h1>';
                $html .= '<div class="separator-line"></div>';
                $html .= $this->cleanHtmlForPandoc($sections[$eId]['content']);
                $html .= '</div><div class="page-break"></div>';
            }
        }

        $html .= '</body></html>';
        return $html;
    }

    private function buildReferenceDocx($path, $data, $book)
    {
        $templateConfigs = [
            'Standard Book' => [
                'fontFamily' => 'Georgia', 'fontSize' => 16, 'lineHeight' => 1.8, 'textColor' => '#1e293b',
                'headingFont' => 'Georgia', 'headingWeight' => 'bold', 'paragraphIndent' => '1.5em', 'paragraphSpacing' => '0'
            ],
            'Magazine Template' => [
                'fontFamily' => 'Arial', 'fontSize' => 14, 'lineHeight' => 1.6, 'textColor' => '#000000',
                'headingFont' => 'Arial', 'headingWeight' => 'bold', 'paragraphIndent' => '0', 'paragraphSpacing' => '1em'
            ],
            'Horror Style' => [
                'fontFamily' => 'Crimson Text', 'fontSize' => 17, 'lineHeight' => 1.9, 'textColor' => '#1a1a1a',
                'headingFont' => 'Crimson Text', 'headingWeight' => 'bold', 'paragraphIndent' => '1.8em', 'paragraphSpacing' => '0'
            ],
            'Kavithai Style' => [
                'fontFamily' => 'Georgia', 'fontSize' => 18, 'lineHeight' => 2.2, 'textColor' => '#374151',
                'headingFont' => 'Georgia', 'headingWeight' => 'bold', 'paragraphIndent' => '0', 'paragraphSpacing' => '1.5em'
            ],
            'RK publication Template' => [
                'fontFamily' => 'Georgia', 'fontSize' => 16, 'lineHeight' => 1.85, 'textColor' => '#1e3a33',
                'headingFont' => 'Georgia', 'headingWeight' => 'bold', 'paragraphIndent' => '1.5em', 'paragraphSpacing' => '0'
            ],
            'Bordered Style' => [
                'fontFamily' => 'Comic Sans MS', 'fontSize' => 18, 'lineHeight' => 1.6, 'textColor' => '#064e3b',
                'headingFont' => 'Comic Sans MS', 'headingWeight' => 'bold', 'paragraphIndent' => '0', 'paragraphSpacing' => '1em'
            ]
        ];

        $layoutName = $data['layout'] ?? 'Standard Book';
        $config = $templateConfigs[$layoutName] ?? $templateConfigs['Standard Book'];

        // Apply custom fonts
        $fontFamily = $data['currentFont'] ?? $config['fontFamily'];
        $fontFamily = trim(explode(',', $fontFamily)[0], ' "\'');
        $fontSizePx = intval($data['currentFontSize'] ?? $config['fontSize']);
        // 1px ~ 0.75pt, PHPWord size is in half-points
        $fontSizeHp = intval($fontSizePx * 0.75 * 2) ?: 24;

        // Indent & Spacing parsing
        $indentFirstLine = 0;
        if ($config['paragraphIndent'] !== '0') {
            $indentFirstLine = \PhpOffice\PhpWord\Shared\Converter::inchToTwip(floatval(str_replace('em', '', $config['paragraphIndent'])) * 0.2);
        }
        $spaceAfter = 0;
        if ($config['paragraphSpacing'] !== '0') {
            $spaceAfter = \PhpOffice\PhpWord\Shared\Converter::pointToTwip(floatval(str_replace('em', '', $config['paragraphSpacing'])) * $fontSizePx * 0.75);
        }

        $pw = new \PhpOffice\PhpWord\PhpWord();
        $pw->setDefaultFontName($fontFamily);
        $pw->setDefaultFontSize($fontSizeHp / 2);

        $pw->addParagraphStyle('Normal', [
            'spaceAfter' => $spaceAfter,
            'indentation' => ['firstLine' => $indentFirstLine]
        ]);

        $pw->addTitleStyle(1, ['name' => $config['headingFont'], 'size' => 24, 'bold' => true], [
            'alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER,
            'spaceBefore' => 240,
            'spaceAfter' => 240,
            'pageBreakBefore' => true
        ]);
        $pw->addTitleStyle(2, ['name' => $config['headingFont'], 'size' => 18, 'bold' => true], [
            'alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER,
            'spaceBefore' => 240,
            'spaceAfter' => 240
        ]);

        $dims = $this->getPageDimensions($book->book_size ?? '5.5x8.5');

        // Override with precise Template Configuration margins (if given in inches)
        if (isset($config['margins'])) {
            $dims['marginTop'] = intval(floatval(str_replace('in', '', $config['margins']['top'])) * 1440);
            $dims['marginBottom'] = intval(floatval(str_replace('in', '', $config['margins']['bottom'])) * 1440);
            $dims['marginLeft'] = intval(floatval(str_replace('in', '', $config['margins']['side'])) * 1440);
            $dims['marginRight'] = intval(floatval(str_replace('in', '', $config['margins']['side'])) * 1440);
        }

        $pw->addSection([
            'marginLeft' => $dims['marginLeft'],
            'marginRight' => $dims['marginRight'],
            'marginTop' => $dims['marginTop'],
            'marginBottom' => $dims['marginBottom'],
            'pageSizeW' => $dims['width'],
            'pageSizeH' => $dims['height']
        ]);

        $writer = \PhpOffice\PhpWord\IOFactory::createWriter($pw, 'Word2007');
        $writer->save($path);
    }

    /**
     * Generate DOCX using PHPWord directly (no Pandoc dependency)
     * Converts HTML content from the formatting tool into a proper Word document
     */
    private function generateDocxWithPhpWord($data, $book)
    {
        $templateConfigs = [
            '5 x 8' => [
                'fontFamily' => 'Times New Roman', 'fontSize' => 12, 'lineHeight' => 1.15,
                'headingFont' => 'Bahnschrift', 'paragraphIndent' => '0.2in', 'paragraphSpacing' => '6pt'
            ],
            '5.5 x 8.5' => [
                'fontFamily' => 'Times New Roman', 'fontSize' => 12, 'lineHeight' => 1.15,
                'headingFont' => 'Bahnschrift', 'paragraphIndent' => '0.2in', 'paragraphSpacing' => '6pt'
            ],
            '6x9' => [
                'fontFamily' => 'Times New Roman', 'fontSize' => 12, 'lineHeight' => 1.15,
                'headingFont' => 'Bahnschrift', 'paragraphIndent' => '0.2in', 'paragraphSpacing' => '6pt'
            ],
            '8.5 x 11' => [
                'fontFamily' => 'Times New Roman', 'fontSize' => 12, 'lineHeight' => 1.15,
                'headingFont' => 'Bahnschrift', 'paragraphIndent' => '0.2in', 'paragraphSpacing' => '6pt'
            ],
            '8.5x8.5' => [
                'fontFamily' => 'Times New Roman', 'fontSize' => 12, 'lineHeight' => 1.15,
                'headingFont' => 'Bahnschrift', 'paragraphIndent' => '0.25in', 'paragraphSpacing' => '6pt'
            ],
            '16.5x11' => [
                'fontFamily' => 'Times New Roman', 'fontSize' => 20, 'lineHeight' => 1.15,
                'headingFont' => 'Felix Titling', 'paragraphIndent' => '0', 'paragraphSpacing' => '6pt'
            ],
        ];

        // Priority: saved layout from editor > book's actual book_size > fallback '5.5 x 8.5'
        $bookSizeToLayoutMap = [
            '5x8' => '5 x 8',
            '5.5x8.5' => '5.5 x 8.5',
            '6x9' => '6x9',
            '8.5x11' => '8.5 x 11',
            '8.5x8.5' => '8.5x8.5',
            '16.5x11' => '16.5x11',
        ];
        $bookSizeKey = strtolower(str_replace(' ', '', $book->book_size ?? '5.5x8.5'));
        $layoutFromBookSize = $bookSizeToLayoutMap[$bookSizeKey] ?? '5.5 x 8.5';
        $layoutName = $data['layout'] ?? $layoutFromBookSize;
        if (!isset($templateConfigs[$layoutName])) {
            $layoutName = $layoutFromBookSize;
        }
        $config = $templateConfigs[$layoutName] ?? $templateConfigs['5.5 x 8.5'];

        // Apply custom font overrides
        $fontFamily = $data['currentFont'] ?? $config['fontFamily'];
        $fontFamily = trim(explode(',', $fontFamily)[0], ' "\'');
        // currentFontSize from the editor is usually in pixels (e.g. 16px). Convert px -> pt.
        // If not set, use template config which is already a reasonable pt value (e.g. 12).
        if (isset($data['currentFontSize'])) {
            $fontSizePt = (int)round(intval($data['currentFontSize']) * 0.75);
        }
        else {
            $fontSizePt = intval($config['fontSize']);
        }

        if ($fontSizePt < 9) {
            $fontSizePt = 11; // Safety minimum
        }

        // Create PHPWord instance
        $phpWord = new \PhpOffice\PhpWord\PhpWord();
        $phpWord->setDefaultFontName($fontFamily);
        $phpWord->setDefaultFontSize($fontSizePt);

        // Define paragraph styles
        $indentFirstLine = 0;
        if ($config['paragraphIndent'] !== '0' && $config['paragraphIndent'] !== 0) {
            $indentVal = $config['paragraphIndent'];
            if (strpos($indentVal, 'in') !== false) {
                // Direct inch value (e.g. '0.2in')
                $indentFirstLine = \PhpOffice\PhpWord\Shared\Converter::inchToTwip(floatval($indentVal));
            }
            else {
                // Legacy em-based (e.g. '1.5em')
                $indentFirstLine = \PhpOffice\PhpWord\Shared\Converter::inchToTwip(
                    floatval(str_replace('em', '', $indentVal)) * 0.2
                );
            }
        }
        $spaceAfter = 0;
        if ($config['paragraphSpacing'] !== '0' && $config['paragraphSpacing'] !== 0) {
            $spacingVal = $config['paragraphSpacing'];
            if (strpos($spacingVal, 'pt') !== false) {
                // Direct point value (e.g. '6pt')
                $spaceAfter = \PhpOffice\PhpWord\Shared\Converter::pointToTwip(floatval($spacingVal));
            }
            else {
                // Legacy em-based (e.g. '1em')
                $spaceAfter = \PhpOffice\PhpWord\Shared\Converter::pointToTwip(
                    floatval(str_replace('em', '', $spacingVal)) * $fontSizePt
                );
            }
        }

        $phpWord->addParagraphStyle('Normal', [
            'spaceAfter' => $spaceAfter,
            'indentation' => ['firstLine' => $indentFirstLine],
            'alignment' => \PhpOffice\PhpWord\SimpleType\Jc::BOTH
        ]);

        // Title styles
        $phpWord->addTitleStyle(1, [
            'name' => $config['headingFont'], 'size' => 22, 'bold' => true
        ], [
            'alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER,
            'spaceBefore' => 480, 'spaceAfter' => 240,
            'pageBreakBefore' => true
        ]);
        $phpWord->addTitleStyle(2, [
            'name' => $config['headingFont'], 'size' => 16, 'bold' => true
        ], [
            'alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER,
            'spaceBefore' => 360, 'spaceAfter' => 200
        ]);

        // Get page dimensions
        $dims = $this->getPageDimensions($book->book_size ?? '5.5x8.5');

        // Create the main section with proper page size
        $sectionStyle = [
            'marginLeft' => $dims['marginLeft'],
            'marginRight' => $dims['marginRight'],
            'marginTop' => $dims['marginTop'],
            'marginBottom' => $dims['marginBottom'],
            'pageSizeW' => $dims['width'],
            'pageSizeH' => $dims['height'],
        ];

        // ═══════════════════════════════════════════
        // FRONT MATTER SECTION — No page numbers
        // ═══════════════════════════════════════════
        $section = $phpWord->addSection($sectionStyle);
        // No footer for front matter — page numbers should NOT appear here

        $sections = $data['sections'] ?? [];

        $visibleKeys = $data['visibleFrontMatterKeys'] ?? [];
        $isFirstSection = true;
        $hasFrontMatter = false;

        foreach ($visibleKeys as $key) {
            if (empty($sections[$key]['content']))
                continue;

            // Add page break between sections (not before the very first)
            if (!$isFirstSection) {
                $section->addPageBreak();
            }
            $isFirstSection = false;

            $content = $sections[$key]['content'];

            // ── Special handling for Table of Contents ──
            if ($key === 'contents_list') {
                $this->addTocToSection($section, $content, $config, $dims);
                continue;
            }

            // ── Special handling for Title Page ──
            if ($key === 'main_title') {
                $this->addTitlePageToSection($section, $content, $config);
                continue;
            }

            // ── Special handling for Copyright Page ──
            if ($key === 'legal_info') {
                $this->addCopyrightPageToSection($section, $content, $config, $fontFamily, $fontSizePt);
                continue;
            }

            // Add heading for prologue/introduction/custom front matter
            if ($key === 'prologue' || $key === 'introduction' || str_starts_with($key, 'front-matter-')) {
                $title = $sections[$key]['title'] ?? ucfirst(str_replace('_', ' ', $key));
                $section->addTextBreak(1);
                $section->addText(
                    htmlspecialchars(html_entity_decode($title, ENT_QUOTES, 'UTF-8'), ENT_XML1, 'UTF-8'),
                ['name' => $config['headingFont'], 'size' => 22, 'bold' => true],
                ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER, 'spaceBefore' => 480, 'spaceAfter' => 120]
                );
                // Decorative separator line (matching preview)
                $section->addText(
                    '________________________',
                ['size' => 6, 'color' => 'CCCCCC'],
                ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER, 'spaceAfter' => 360]
                );
            }

            // Process and add HTML content
            $cleanHtml = $this->prepareHtmlForPhpWord($content, false);
            $this->addHtmlToSection($section, $cleanHtml, $fontFamily, $fontSizePt);
        }

        // ═══════════════════════════════════════════
        // 2. CHAPTERS — New section with page numbers starting from 1
        // ═══════════════════════════════════════════
        $chapterSectionStyle = array_merge($sectionStyle, [
            'pageNumberingStart' => 1,
        ]);
        $section = $phpWord->addSection($chapterSectionStyle);

        // Add automatic page numbers centered in footer (chapters + end matter only)
        $footer = $section->addFooter();
        $footer->addPreserveText('{PAGE}',
        ['name' => $fontFamily, 'size' => 10, 'color' => '333333'],
        ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER]
        );

        $isFirstSection = true; // Reset — first item in new section doesn't need page break
        $chaptersData = array_values($data['chapters'] ?? []);
        foreach ($chaptersData as $index => $chapter) {
            $cId = $chapter['id'];
            if (empty($sections[$cId]['content']))
                continue;

            // Page break before each chapter (skip for first chapter in this section)
            if (!$isFirstSection) {
                $section->addPageBreak();
            }
            $isFirstSection = false;

            // ── Chapter Header Block (matching preview exactly) ──
            $section->addTextBreak(1);

            // Chapter number heading (e.g., "Chapter 1")
            $chapterNumber = $index + 1;
            $titleUpper = strtoupper($chapter['title']);
            if (strpos($titleUpper, 'CHAPTER') === false) {
                $section->addText(
                    'Chapter ' . $chapterNumber,
                ['name' => $config['headingFont'], 'size' => 16, 'bold' => true],
                ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER, 'spaceAfter' => 100]
                );
            }

            // Chapter title (large, bold, centered)
            $section->addText(
                htmlspecialchars(html_entity_decode(\Illuminate\Support\Str::title($chapter['title']), ENT_QUOTES, 'UTF-8'), ENT_XML1, 'UTF-8'),
            ['name' => $config['headingFont'], 'size' => 22, 'bold' => true],
            ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER, 'spaceAfter' => 120]
            );

            // Decorative separator line (matching preview's subtle gray line)
            $section->addText(
                '________________________',
            ['size' => 6, 'color' => 'CCCCCC'],
            ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER, 'spaceAfter' => 360]
            );

            // Chapter content
            $chapterHtml = $this->prependNumbersToHtml($sections[$cId]['content'], $chapterNumber);
            $cleanHtml = $this->prepareHtmlForPhpWord($chapterHtml, false);
            $this->addHtmlToSection($section, $cleanHtml, $fontFamily, $fontSizePt);
        }

        // ═══════════════════════════════════════════
        // 3. END MATTER
        // ═══════════════════════════════════════════
        $endMatters = $data['endMatters'] ?? [];
        foreach ($endMatters as $emMeta) {
            $eId = $emMeta['id'];
            if (empty($sections[$eId]['content']))
                continue;

            $section->addPageBreak();

            // End matter title with decorative separator
            $title = $sections[$eId]['title'] ?? 'Section';
            $section->addTextBreak(1);
            $section->addText(
                htmlspecialchars(html_entity_decode($title, ENT_QUOTES, 'UTF-8'), ENT_XML1, 'UTF-8'),
            ['name' => $config['headingFont'], 'size' => 22, 'bold' => true],
            ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER, 'spaceBefore' => 480, 'spaceAfter' => 120]
            );
            $section->addText(
                '________________________',
            ['size' => 6, 'color' => 'CCCCCC'],
            ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER, 'spaceAfter' => 360]
            );

            $cleanHtml = $this->prepareHtmlForPhpWord($sections[$eId]['content'], false);
            $this->addHtmlToSection($section, $cleanHtml, $fontFamily, $fontSizePt);
        }

        // Save to temp file and download
        $tempFile = tempnam(sys_get_temp_dir(), 'docx_') . '.docx';
        $writer = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');
        $writer->save($tempFile);

        $title = preg_replace('/[^A-Za-z0-9_\-]/', '_', $book->title ?? 'Book');
        $filename = $title . '.docx';

        // Clear any output buffers to prevent PHP notices/warnings from corrupting the ZIP stream
        while (ob_get_level() > 0) {
            ob_end_clean();
        }

        return response()->download($tempFile, $filename)->deleteFileAfterSend(true);
    }

    /**
     * Prepare HTML content for PHPWord's Html::addHtml() parser
     * Resolves image src paths to absolute file system paths
     */
    private function prepareHtmlForPhpWord($content, $isCentered = false)
    {
        if (empty($content))
            return '';

        // Strip only font-family, color, and background overrides from inline styles
        // IMPORTANT: We must preserve text-align, font-size, font-weight, font-style, margin, padding, text-indent
        // so that the user's alignment choices (justify, center, right) are respected in the Word document.
        $content = preg_replace_callback('/(\bstyle\s*=\s*)(["\'])(.*?)\2/is', function($m) {
            $quote = $m[2];
            // Remove only cosmetic overrides that conflict with the template (font-family, colors, backgrounds)
            $cleaned = preg_replace('/(font-family|color|background(?:-color)?)\s*:[^;]+;?/i', '', $m[3]);
            // Collapse extra whitespace and semicolons left behind after removal
            $cleaned = preg_replace('/;\s*;/i', ';', $cleaned);
            $cleaned = trim($cleaned, " ;\t");
            // If no styles remain, drop the style attribute entirely to keep HTML clean
            if (empty($cleaned)) {
                return '';
            }
            return $m[1] . $quote . $cleaned . $quote;
        }, $content);

        // Resolve image paths: convert /storage/ URLs to absolute file paths
        $content = preg_replace_callback('/src=["\']([^"\']+)["\']/', function ($matches) {
            $src = $matches[1];

            // Skip base64 images (PHPWord handles them)
            if (str_starts_with($src, 'data:')) {
                return $matches[0];
            }

            // REMOVE file:/// URIs — local paths from user's PC (MS Word paste)
            if (str_starts_with($src, 'file:///')) {
                return 'src=""'; // Mark for removal
            }

            // Remove host prefix
            $src = preg_replace('#^https?://[^/]+#', '', $src);

            $absolutePath = null;

            if (strpos($src, '/storage/') === 0 || strpos($src, 'storage/') === 0) {
                $relativePath = ltrim($src, '/');
                if (str_starts_with($relativePath, 'storage/')) {
                    $relativePath = substr($relativePath, 8);
                }
                $absolutePath = storage_path('app/public/' . $relativePath);

                // Also try public storage symlink path
                if (!file_exists($absolutePath)) {
                    $altPath = public_path('storage/' . $relativePath);
                    if (file_exists($altPath)) {
                        $absolutePath = $altPath;
                    }
                }
            }
            elseif (strpos($src, '/images/') === 0 || strpos($src, 'images/') === 0) {
                $relativePath = ltrim($src, '/');
                $absolutePath = public_path($relativePath);
            }
            elseif (strpos($src, '/') === 0) {
                // Absolute path from web root
                $absolutePath = public_path(ltrim($src, '/'));
            }

            // SECURITY: only embed files inside our own storage dirs (blocks
            // path traversal to arbitrary server files during DOCX export).
            $safePath = $this->safeLocalImagePath($absolutePath);
            if ($safePath) {
                // PHPWord needs absolute file paths (not file:// URIs)
                return 'src="' . str_replace('\\', '/', $safePath) . '"';
            }
            else {
                if ($absolutePath) {
                    \Log::warning('Image not found / not allowed for DOCX export', ['original_src' => $src]);
                    return 'src=""';
                }
            }
            return $matches[0];
        }, $content);

        // Remove <img> tags with empty src
        $content = preg_replace('/<img[^>]*src=""\s*[^>]*\/?>/i', '', $content);

        // Extract base64 images to temp files (PHPWord handles file paths more reliably)
        $content = preg_replace_callback('/src="data:image\/([^;]+);base64,([^"]+)"/', function ($matches) {
            $extension = $matches[1] === 'jpeg' ? 'jpg' : $matches[1];
            // Strict mode: without it base64_decode() never returns false, so
            // the guard below could not fire and malformed data became garbage.
            $imageData = base64_decode($matches[2], true);
            if ($imageData === false)
                return $matches[0];

            $tempFile = tempnam(sys_get_temp_dir(), 'img_') . '.' . $extension;
            file_put_contents($tempFile, $imageData);
            return 'src="' . str_replace('\\', '/', $tempFile) . '"';
        }, $content);

        // Ensure max-width on images for Word compatibility
        $content = preg_replace('/<img\b(?![^>]*style=)/i', '<img style="max-width:100%;height:auto;" ', $content);

        // Add text-align center if this is a centered section (title page, copyright)
        if ($isCentered) {
            $content = preg_replace('/<(p|div)\b(?![^>]*style=)/i', '<$1 style="text-align:center;"', $content);
            $content = preg_replace('/(<(p|div)\b[^>]*style="[^"]*)/i', '$1;text-align:center;', $content);
        }

        // Ensure content is wrapped in proper HTML tags
        $content = trim($content);
        if (!empty($content) && !preg_match('/^\s*</', $content)) {
            $content = '<p>' . $content . '</p>';
        }

        return $content;
    }

    /**
     * Add HTML content to a PHPWord section, handling images separately
     * PHPWord's Html::addHtml() can parse most HTML, but images need special handling
     */
    private function addHtmlToSection($section, $html, $fontFamily, $fontSize)
    {
        if (empty(trim($html)))
            return;

        // Split content into chunks: regular HTML vs images
        // PHPWord's Html::addHtml handles text/formatting well but images need addImage()
        $parts = preg_split('/(<img[^>]*>)/i', $html, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);

        foreach ($parts as $part) {
            $part = trim($part);
            if (empty($part))
                continue;

            // Handle image tags
            if (preg_match('/<img[^>]*src=["\']([^"\']+)["\'][^>]*>/i', $part, $imgMatch)) {
                $imgPath = $imgMatch[1];
                if (!empty($imgPath) && file_exists($imgPath)) {
                    try {
                        // Get image dimensions for proper sizing
                        $imageInfo = @getimagesize($imgPath);
                        $imgWidth = 400; // Default width in points

                        if ($imageInfo) {
                            $pixelWidth = $imageInfo[0];
                            $pixelHeight = $imageInfo[1];
                            $ratio = $pixelHeight / max($pixelWidth, 1);

                            // Scale to max 5 inches wide (360pt), maintaining aspect ratio
                            $maxWidthPt = 360;
                            $imgWidth = min($pixelWidth * 0.75, $maxWidthPt); // px to pt
                            $imgHeight = $imgWidth * $ratio;

                            $section->addImage($imgPath, [
                                'width' => $imgWidth,
                                'height' => $imgHeight,
                                'alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER,
                                'wrappingStyle' => 'inline',
                            ]);
                        }
                        else {
                            // Fallback: add without dimensions
                            $section->addImage($imgPath, [
                                'width' => 300,
                                'alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER,
                            ]);
                        }
                    }
                    catch (\Exception $e) {
                        \Log::warning('Failed to add image to DOCX', ['path' => $imgPath, 'error' => $e->getMessage()]);
                        // Add placeholder text instead of crashing
                        $section->addText('[Image could not be embedded]', ['italic' => true, 'color' => '999999']);
                    }
                }
                continue;
            }

            // Handle regular HTML content
            // Strip control characters that corrupt XML
            $part = preg_replace('/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/u', '', $part);

            // Wrap in a minimal HTML document for the parser.
            // Inject a CSS default that makes all paragraphs justified — this is
            // the book-publishing standard. Paragraphs with an explicit text-align
            // (center, right) in their inline style will still override this default.
            $wrappedHtml = '<html><head><style>'
                . 'p, div { text-align: justify; text-justify: inter-word; }'
                . 'h1, h2, h3, h4, h5, h6 { text-align: center; }'
                . 'li { text-align: justify; }'
                . '</style></head><body>' . $part . '</body></html>';

            try {
                // Suppress libxml warnings from bleeding into the HTTP response and corrupting the ZIP DOCX
                $previousLibxmlState = libxml_use_internal_errors(true);
                \PhpOffice\PhpWord\Shared\Html::addHtml($section, $wrappedHtml, false, false);
                libxml_clear_errors();
                libxml_use_internal_errors($previousLibxmlState);
            }
            catch (\Exception $e) {
                // Fallback: strip HTML and add as plain text, escaping for XML
                $plainText = strip_tags($part);
                if (!empty(trim($plainText))) {
                    $escapedText = htmlspecialchars(html_entity_decode($plainText, ENT_QUOTES, 'UTF-8'), ENT_XML1, 'UTF-8');
                    $section->addText($escapedText, ['name' => $fontFamily, 'size' => $fontSize]);
                }
            }
        }
    }

    /**
     * Build Table of Contents using native PHPWord elements (not Html::addHtml).
     * The frontend generates the TOC as HTML tables with two columns (title | page#).
     * PHPWord's HTML parser handles tables very poorly (text cut off, page numbers lost).
     * This method parses the HTML and builds native Word elements for pixel-perfect output.
     */
    private function addTocToSection($section, $htmlContent, $config, $dims)
    {
        // ── 1. "Contents" Title ──
        // Match the preview: centered, bold, large font, with spacing
        $section->addTextBreak(1);
        $section->addText(
            'Contents',
        [
            'name' => $config['headingFont'],
            'size' => 24,
            'bold' => true,
        ],
        [
            'alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER,
            'spaceAfter' => 120,
        ]
        );

        // ── 2. Decorative separator line ──
        // Thin horizontal rule below the title (matching the preview's subtle line)
        $section->addText(
            '_______________',
        ['size' => 8, 'color' => 'CCCCCC'],
        ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER, 'spaceAfter' => 400]
        );

        // ── 3. Parse HTML table rows into TOC entries ──
        // Each row in the frontend TOC HTML is: <tr><td>Title text</td><td>Page#</td></tr>
        // Some rows have two <tr> inside one <table> (chapter number + chapter title)
        // We match ALL <tr> rows individually
        $allRows = [];
        if (preg_match_all('/<tr[^>]*>\s*<td([^>]*)>(.*?)<\/td>\s*<td([^>]*)>(.*?)<\/td>\s*<\/tr>/is', $htmlContent, $rowMatches, PREG_SET_ORDER)) {
            foreach ($rowMatches as $row) {
                $tdStyle = $row[1]; // style attribute of left <td>
                $leftText = trim(strip_tags($row[2]));
                $rightText = trim(strip_tags($row[4]));

                // Skip empty rows and <hr> separator rows
                if (empty($leftText) && empty($rightText))
                    continue;

                // Determine formatting from inline styles
                $isBold = (stripos($tdStyle, 'font-weight: bold') !== false || stripos($tdStyle, 'font-weight:bold') !== false || stripos($tdStyle, 'font-weight: 600') !== false || stripos($tdStyle, 'font-weight:600') !== false);
                $fontSize = 12; // default
                if (preg_match('/font-size:\s*(\d+)px/i', $tdStyle, $sizeMatch)) {
                    $fontSize = round(intval($sizeMatch[1]) * 0.75); // px to pt
                }
                $indent = 0; // left padding → indent
                if (preg_match('/padding-left:\s*(\d+)px/i', $tdStyle, $padMatch)) {
                    $indent = \PhpOffice\PhpWord\Shared\Converter::pixelToTwip(intval($padMatch[1]));
                }

                // Determine spacing
                $spaceBefore = 0;
                if (preg_match('/padding-top:\s*(\d+)px/i', $tdStyle, $ptMatch)) {
                    $spaceBefore = \PhpOffice\PhpWord\Shared\Converter::pointToTwip(intval($ptMatch[1]) * 0.75);
                }

                $allRows[] = [
                    'left' => $leftText,
                    'right' => $rightText,
                    'bold' => $isBold,
                    'fontSize' => max(9, $fontSize),
                    'indent' => $indent,
                    'spaceBefore' => $spaceBefore,
                ];
            }
        }

        if (empty($allRows)) {
            // Fallback: if parsing failed, try to add raw content
            $section->addText('(Table of Contents)', ['italic' => true, 'color' => '999999']);
            return;
        }

        // ── 4. Build native PHPWord table for the TOC ──
        // Use a borderless table with two columns: wide left for text, narrow right for page numbers
        $contentWidth = ($dims['width'] ?? 7920) - ($dims['marginLeft'] ?? 1080) - ($dims['marginRight'] ?? 1080);
        $leftColWidth = intval($contentWidth * 0.85);
        $rightColWidth = intval($contentWidth * 0.15);

        $tableStyle = [
            'borderSize' => 0,
            'borderColor' => 'FFFFFF',
            'cellMargin' => 0,
            'width' => 100,
            'unit' => \PhpOffice\PhpWord\SimpleType\TblWidth::PERCENT,
        ];

        $table = $section->addTable($tableStyle);

        foreach ($allRows as $entry) {
            $table->addRow();

            // Left cell: Chapter/section title
            $leftCell = $table->addCell($leftColWidth, [
                'borderSize' => 0,
                'borderColor' => 'FFFFFF',
                'valign' => 'top',
            ]);
            $leftCell->addText(
                htmlspecialchars(html_entity_decode($entry['left'], ENT_QUOTES, 'UTF-8'), ENT_XML1, 'UTF-8'),
            [
                'name' => $config['headingFont'],
                'size' => $entry['fontSize'],
                'bold' => $entry['bold'],
            ],
            [
                'indentation' => ['left' => $entry['indent']],
                'spaceBefore' => $entry['spaceBefore'],
                'spaceAfter' => 40,
            ]
            );

            // Right cell: Page number (right-aligned)
            $rightCell = $table->addCell($rightColWidth, [
                'borderSize' => 0,
                'borderColor' => 'FFFFFF',
                'valign' => 'top',
            ]);
            $rightCell->addText(
                $entry['right'],
            [
                'name' => $config['headingFont'],
                'size' => $entry['fontSize'],
                'bold' => $entry['bold'],
            ],
            [
                'alignment' => \PhpOffice\PhpWord\SimpleType\Jc::END,
                'spaceBefore' => $entry['spaceBefore'],
                'spaceAfter' => 40,
            ]
            );
        }
    }

    /**
     * Build Title Page using native PHPWord elements.
     * The frontend HTML has centered text with varying sizes for title, subtitle, author, publisher.
     * We parse the spans to extract text and inline styles, then build native Word elements.
     */
    private function addTitlePageToSection($section, $htmlContent, $config)
    {
        // Parse all paragraphs/spans from the HTML content
        // The title page HTML has <p style="text-align:center"><span style="font-size:36pt">Title</span></p>
        $entries = [];
        if (preg_match_all('/<(?:p|div)[^>]*>(.*?)<\/(?:p|div)>/is', $htmlContent, $pMatches)) {
            foreach ($pMatches[1] as $pContent) {
                $text = trim(strip_tags($pContent));
                if (empty($text)) {
                    $entries[] = [
                        'text' => '',
                        'fontSize' => 12,
                        'bold' => false,
                        'spaceBefore' => 0
                    ];
                    continue;
                }

                // Extract font-size from span
                $fontSize = 12;
                if (preg_match('/font-size:\s*([\d.]+)pt/i', $pContent, $sizeMatch)) {
                    $fontSize = intval($sizeMatch[1]);
                }
                elseif (preg_match('/font-size:\s*([\d.]+)px/i', $pContent, $sizeMatch)) {
                    $fontSize = round(intval($sizeMatch[1]) * 0.75);
                }

                // Check for text-transform: uppercase or letter-spacing
                $isUppercase = (stripos($pContent, 'text-transform: uppercase') !== false || stripos($pContent, 'text-transform:uppercase') !== false);
                $isBold = (stripos($pContent, 'font-weight: bold') !== false || stripos($pContent, 'font-weight:bold') !== false);

                // Extract margin-top for spacing
                $marginTop = 0;
                if (preg_match('/margin-top:\s*([\d.]+)px/i', $pContent, $mtMatch)) {
                    $marginTop = intval($mtMatch[1]);
                }

                $entries[] = [
                    'text' => $isUppercase ? strtoupper($text) : $text,
                    'fontSize' => max(9, $fontSize),
                    'bold' => $isBold,
                    'spaceBefore' => \PhpOffice\PhpWord\Shared\Converter::pointToTwip($marginTop * 0.55),
                ];
            }
        }

        if (empty($entries)) {
            // Fallback: add raw text
            $section->addText(strip_tags($htmlContent), ['size' => 12], ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER]);
            return;
        }

        // Add top spacing
        $section->addTextBreak(2);

        foreach ($entries as $entry) {
            $section->addText(
                htmlspecialchars(html_entity_decode($entry['text'], ENT_QUOTES, 'UTF-8'), ENT_XML1, 'UTF-8'),
            [
                'name' => $config['headingFont'],
                'size' => $entry['fontSize'],
                'bold' => $entry['bold'],
            ],
            [
                'alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER,
                'spaceBefore' => $entry['spaceBefore'],
                'spaceAfter' => 20,
            ]
            );
        }
    }

    /**
     * Build Copyright Page using native PHPWord elements.
     * The copyright page has mixed alignment: centered header (publisher, location, edition)
     * and justified body text (legal disclaimers). Html::addHtml() can't handle this mix properly.
     */
    private function addCopyrightPageToSection($section, $htmlContent, $config, $fontFamily, $fontSizePt)
    {
        // Parse paragraphs
        $paragraphs = [];
        if (preg_match_all('/<(?:p|div)([^>]*)>(.*?)<\/(?:p|div)>/is', $htmlContent, $pMatches, PREG_SET_ORDER)) {
            foreach ($pMatches as $pm) {
                $attributes = $pm[1];
                $style = '';
                if (preg_match('/style="([^"]*)"/i', $attributes, $styleMatch)) {
                    $style = $styleMatch[1];
                }

                $innerHtml = $pm[2];
                $text = trim(strip_tags($innerHtml));

                // Determine alignment from Quill class or inline style
                $alignment = \PhpOffice\PhpWord\SimpleType\Jc::START; // Default left
                if (stripos($style, 'text-align: justify') !== false || stripos($style, 'text-align:justify') !== false || stripos($attributes, 'ql-align-justify') !== false) {
                    $alignment = \PhpOffice\PhpWord\SimpleType\Jc::BOTH;
                }
                elseif (stripos($style, 'text-align: center') !== false || stripos($style, 'text-align:center') !== false || stripos($attributes, 'ql-align-center') !== false) {
                    $alignment = \PhpOffice\PhpWord\SimpleType\Jc::CENTER;
                }
                elseif (stripos($style, 'text-align: right') !== false || stripos($style, 'text-align:right') !== false || stripos($attributes, 'ql-align-right') !== false) {
                    $alignment = \PhpOffice\PhpWord\SimpleType\Jc::END;
                }

                if (empty($text)) {
                    $paragraphs[] = [
                        'text' => '',
                        'fontSize' => 10,
                        'bold' => false,
                        'alignment' => $alignment,
                        'spaceBefore' => 0
                    ];
                    continue;
                }

                // Font size
                $fontSize = 10;
                if (preg_match('/font-size:\s*([\d.]+)pt/i', $innerHtml, $sizeMatch)) {
                    $fontSize = intval($sizeMatch[1]);
                }
                elseif (preg_match('/font-size:\s*([\d.]+)px/i', $innerHtml, $sizeMatch)) {
                    $fontSize = round(intval($sizeMatch[1]) * 0.75);
                }

                // Bold
                $isBold = (stripos($innerHtml, 'font-weight: bold') !== false || stripos($innerHtml, 'font-weight:bold') !== false);

                // Margin top
                $marginTop = 0;
                if (preg_match('/margin-top:\s*([\d.]+)px/i', $style, $mtMatch)) {
                    $marginTop = intval($mtMatch[1]);
                }

                $paragraphs[] = [
                    'text' => $text,
                    'fontSize' => max(7, $fontSize),
                    'bold' => $isBold,
                    'alignment' => $alignment,
                    'spaceBefore' => \PhpOffice\PhpWord\Shared\Converter::pointToTwip($marginTop * 0.55),
                ];
            }
        }

        if (empty($paragraphs)) {
            // Fallback
            $cleanHtml = $this->prepareHtmlForPhpWord($htmlContent, true);
            $this->addHtmlToSection($section, $cleanHtml, $fontFamily, $fontSizePt);
            return;
        }

        foreach ($paragraphs as $para) {
            $section->addText(
                htmlspecialchars(html_entity_decode($para['text'], ENT_QUOTES, 'UTF-8'), ENT_XML1, 'UTF-8'),
            [
                'name' => $fontFamily,
                'size' => $para['fontSize'],
                'bold' => $para['bold'],
            ],
            [
                'alignment' => $para['alignment'],
                'spaceBefore' => $para['spaceBefore'],
                'spaceAfter' => 0,
            ]
            );
        }
    }

    public function save(Request $request, Book $book)
    {
        if ($book->user_id !== auth()->id() && !auth()->user()->is_admin) {
            abort(403);
        }

        // Frontend sends formatting_data as JSON string (to bypass PHP max_input_vars limit)
        $rawData = $request->input('formatting_data');
        if (is_string($rawData)) {
            $formattingData = json_decode($rawData, true);
            if (json_last_error() !== JSON_ERROR_NONE || !is_array($formattingData)) {
                return response()->json(['success' => false, 'message' => 'Invalid formatting data'], 422);
            }
        }
        elseif (is_array($rawData)) {
            $formattingData = $rawData;
        }
        else {
            return response()->json(['success' => false, 'message' => 'Formatting data is required'], 422);
        }

        $numPages = $request->input('num_pages');

        $updateData = [
            'formatting_data' => $formattingData,
            'interior_file' => null, // Enforce Mutual Exclusivity: Clear uploaded file
            'interior_layout_method' => 'formatting_tool'
        ];

        if ($numPages !== null && is_numeric($numPages) && (int)$numPages >= 0) {
            $updateData['num_pages'] = (int)$numPages;
        }

        $book->update($updateData);

        return response()->json(['success' => true, 'message' => 'Progress saved successfully!']);
    }

    /**
     * Upload manuscript file (docx) — replaces formatting tool data
     */
    public function uploadManuscript(Request $request, Book $book)
    {
        if ($book->user_id !== auth()->id() && !auth()->user()->is_admin) {
            abort(403);
        }

        $request->validate([
            // Laravel 'max' is in KB → 1 GB = 1,048,576 KB
            'file' => 'required|file|mimes:docx|max:51200',
        ]);

        $file = $request->file('file');

        // Delete old file if exists
        if ($book->interior_file && Storage::disk('public')->exists($book->interior_file)) {
            Storage::disk('public')->delete($book->interior_file);
        }

        $path = $file->store('books/' . $book->id, 'public');

        $book->update([
            'interior_file' => $path,
            'formatting_data' => null, // Enforce Mutual Exclusivity: Clear formatting tool data
            'interior_layout_method' => 'upload'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Manuscript uploaded successfully.',
            'path' => $path
        ]);
    }

    /**
     * Remove uploaded manuscript — unlocks formatting tool
     */
    public function removeManuscript(Request $request, Book $book)
    {
        if ($book->user_id !== auth()->id() && !auth()->user()->is_admin) {
            abort(403);
        }

        if ($book->interior_file && Storage::disk('public')->exists($book->interior_file)) {
            Storage::disk('public')->delete($book->interior_file);
        }

        $book->update([
            'interior_file' => null,
            'interior_layout_method' => 'formatting_tool'
        ]);

        return response()->json(['success' => true, 'message' => 'Manuscript removed. Editor unlocked.']);
    }

    /**
     * Upload an image from the formatting tool editor.
     * Images are stored in public storage and the URL is returned for insertion into the editor.
     * This prevents bloating the formatting_data JSON with massive base64 strings.
     */
    public function uploadImage(Request $request, Book $book)
    {
        if ($book->user_id !== auth()->id() && !auth()->user()->is_admin) {
            abort(403);
        }

        $request->validate([
            'image' => 'required|mimes:jpeg,jpg,png,gif,webp|max:10240', // max 10MB (no SVG — XSS)
        ]);

        $file = $request->file('image');

        // Store in a book-specific folder
        $path = $file->store('books/' . $book->id . '/images', 'public');

        if (!$path) {
            return response()->json(['success' => false, 'message' => 'Failed to store image.'], 500);
        }

        // Return the public URL that can be used in the editor
        $url = Storage::disk('public')->url($path);

        return response()->json([
            'success' => true,
            'url' => $url,
            'path' => $path
        ]);
    }

    /**
     * Helper to prepare HTML for Pandoc conversion
     * Resolves storage image paths to absolute file paths needed by Pandoc CLI
     */
    private function cleanHtmlForPandoc($content, $isTOC = false)
    {
        if (empty($content))
            return "";

        // Strip ONLY font-family, color, and background overrides from inline styles.
        // We MUST preserve text-align, font-size, font-weight, font-style, margin, padding,
        // text-indent so that the user's alignment choices are respected in the PDF output.
        // Table of Contents is excluded entirely to retain its table/layout styling.
        if (!$isTOC) {
            $content = preg_replace_callback('/(\bstyle\s*=\s*)(["\'"])(.*?)\2/is', function($m) {
                $quote = $m[2];
                // Remove only cosmetic overrides that conflict with the template
                $cleaned = preg_replace('/(font-family|color|background(?:-color)?)\s*:[^;]+;?/i', '', $m[3]);
                // Collapse extra semicolons/whitespace left behind
                $cleaned = preg_replace('/;\s*;/i', ';', $cleaned);
                $cleaned = trim($cleaned, " ;\t");
                if (empty($cleaned)) {
                    return ''; // Drop the style attribute entirely if nothing remains
                }
                return $m[1] . $quote . $cleaned . $quote;
            }, $content);
        }

        // Replace relative storage URLs with absolute file:/// paths so Pandoc can find the images
        $content = preg_replace_callback('/src=["\']([^"\']+)["\']/', function ($matches) {
            $src = $matches[1];

            // Skip if already a base64 data URI
            if (str_starts_with($src, 'data:')) {
                return $matches[0];
            }

            // REMOVE file:/// URIs — these are local paths from user's PC (e.g. MS Word paste)
            // They point to files like C:/Users/Admin/AppData/Local/Temp/... which don't exist on the server
            if (str_starts_with($src, 'file:///')) {
                \Log::info('Removing local file:/// image from PDF export', ['src' => substr($src, 0, 100)]);
                return 'src=""'; // Mark for removal
            }

            $absolutePath = null;
            $isRemoteUrl = false;
            $originalSrc = $src;

            // Check for external URLs BEFORE stripping host
            if (strpos($src, 'http://') === 0 || strpos($src, 'https://') === 0) {
                // Check if this is our own site's URL (contains /storage/ or /images/)
                if (preg_match('#^https?://[^/]+(/(?:storage|images)/.+)$#', $src, $urlParts)) {
                    // It's our own site's URL — strip host and resolve locally
                    $src = $urlParts[1];
                }
                else {
                    // Truly external image URL
                    $isRemoteUrl = true;
                    $absolutePath = $src;
                }
            }

            if (!$isRemoteUrl) {
                if (strpos($src, '/storage/') === 0 || strpos($src, 'storage/') === 0) {
                    $relativePath = ltrim($src, '/');
                    if (str_starts_with($relativePath, 'storage/')) {
                        $relativePath = substr($relativePath, 8);
                    }
                    $absolutePath = storage_path('app/public/' . $relativePath);

                    // Also try public storage symlink path
                    if (!file_exists($absolutePath)) {
                        $altPath = public_path('storage/' . $relativePath);
                        if (file_exists($altPath)) {
                            $absolutePath = $altPath;
                        }
                    }
                }
                elseif (strpos($src, '/images/') === 0 || strpos($src, 'images/') === 0) {
                    $relativePath = ltrim($src, '/');
                    $absolutePath = public_path($relativePath);
                }
                elseif (strpos($src, '/') === 0) {
                    // Absolute path from web root
                    $absolutePath = public_path(ltrim($src, '/'));
                }
                else {
                    // Try as-is, then as public path
                    $absolutePath = $src;
                    if (!file_exists($absolutePath)) {
                        $absolutePath = public_path($src);
                    }
                }
            }

            // Resolve to base64 for DomPDF.
            // SECURITY: never fetch remote URLs (SSRF) and only read files
            // inside our own storage dirs (blocks reading .env, etc.).
            $safePath = $isRemoteUrl ? null : $this->safeLocalImagePath($absolutePath);
            if ($safePath) {
                try {
                    $imgData = @file_get_contents($safePath);
                    if ($imgData !== false) {
                        $finfo = new \finfo(FILEINFO_MIME_TYPE);
                        $mimeType = $finfo->buffer($imgData) ?: 'image/png';
                        return 'src="data:' . $mimeType . ';base64,' . base64_encode($imgData) . '"';
                    }
                }
                catch (\Exception $e) {
                    \Log::warning('Image base64 encoding failed', ['path' => $absolutePath, 'error' => $e->getMessage()]);
                }

                // Fallback: return original source
                return 'src="' . $originalSrc . '"';
            }
            else {
                \Log::warning('Image not found for PDF export', [
                    'resolved_path' => $absolutePath,
                    'original_src' => $originalSrc
                ]);
                // SECURITY: do not re-embed untrusted/remote sources.
                return 'src=""'; // Remove image that is not in our storage
            }
        }, $content);

        // Remove any <img> tags with empty src to prevent corrupt DOCX entries
        $content = preg_replace('/<img[^>]*src=""\s*[^>]*\/?>/i', '', $content);

        // (Removed previous code that converted base64 to temp files, as DomPDF handles base64 natively just fine)

        // Ensure well-formed structure (avoid bare text)
        $content = trim($content);
        if (!empty($content) && !preg_match('/^\s*</', $content)) {
            $content = '<p>' . $content . '</p>';
        }

        return $content;
    }

    /**
     * Helper: Get precise Page Dimensions & Margins based on Book Size
     * Returns values in Twips (1/1440 inch) for PHPWord
     */
    private function getPageDimensions($sizeStr)
    {
        $size = strtolower(str_replace(' ', '', $sizeStr));

        // Defaults (6x9)
        $dims = [
            'width' => 8640, // 6"
            'height' => 12960, // 9"
            'marginTop' => 1080, // 0.75"
            'marginBottom' => 1080, // 0.75"
            'marginLeft' => 1080, // 0.75" (Inside/Gutter side)
            'marginRight' => 864, // 0.6"  (Outside)
            'gutter' => 0
        ];

        switch ($size) {
            case '5x8':
                $dims['width'] = 7200;
                $dims['height'] = 11520;
                break;
            case '5.25x8':
            case '5.25x8.25':
                $dims['width'] = 7560;
                $dims['height'] = 11880;
                break;
            case '5.5x8.5':
                $dims['width'] = 7920;
                $dims['height'] = 12240;
                break;
            case '6x9':
                $dims['width'] = 8640;
                $dims['height'] = 12960;
                break;
            case '8.5x8.5':
                $dims['width'] = 12240;
                $dims['height'] = 12240;
                // Larger books often need slightly larger margins
                $dims['marginLeft'] = 1152; // 0.8"
                break;
            case '8.5x11':
                $dims['width'] = 12240;
                $dims['height'] = 15840;
                $dims['marginLeft'] = 1296; // 0.9"
                break;
            case '16.5x11':
                $dims['width'] = 23760;
                $dims['height'] = 15840;
                $dims['marginLeft'] = 1440; // 1.0"
                break;
            case 'a4':
                $dims['width'] = 11909; // 8.27" * 1440 (Twips)
                $dims['height'] = 16834; // 11.69" * 1440
                $dims['marginLeft'] = 1296; // 0.9"
                break;
            case 'a3':
                $dims['width'] = 16834; // 11.69"
                $dims['height'] = 23818; // 16.54"
                $dims['marginLeft'] = 1440; // 1.0"
                break;
            case 'a5':
                $dims['width'] = 8395; // 5.83"
                $dims['height'] = 11909; // 8.27"
                $dims['marginLeft'] = 1080; // 0.75"
                break;
        }

        return $dims;
    }
    private function numberToWord($number)
    {
        $dictionary = [
            1 => 'One',
            2 => 'Two',
            3 => 'Three',
            4 => 'Four',
            5 => 'Five',
            6 => 'Six',
            7 => 'Seven',
            8 => 'Eight',
            9 => 'Nine',
            10 => 'Ten',
            11 => 'Eleven',
            12 => 'Twelve',
            13 => 'Thirteen',
            14 => 'Fourteen',
            15 => 'Fifteen',
            16 => 'Sixteen',
            17 => 'Seventeen',
            18 => 'Eighteen',
            19 => 'Nineteen',
            20 => 'Twenty'
        ];
        return $dictionary[$number] ?? $number;
    }

    private function generateHeadingNumberingCss($data)
    {
        $chaptersData = array_values($data['chapters'] ?? []);
        $chapterIndexOffset = isset($data['_chapter_index_override']) ? $data['_chapter_index_override'] : null;
        $sections = $data['sections'] ?? [];
        $css = "";

        foreach ($chaptersData as $idx => $chapter) {
            $realIndex = ($chapterIndexOffset !== null) ? $chapterIndexOffset : $idx;
            $chapterNum = $realIndex + 1;
            $cId = $chapter['id'];
            $content = $sections[$cId]['content'] ?? '';
            
            $hasH1 = stripos($content, '<h1') !== false;
            $hasH2 = stripos($content, '<h2') !== false;
            
            $h1Start = $hasH1 ? 0 : 1;
            $h2Start = ($hasH1 || $hasH2) ? 0 : 1;
            
            $css .= "
    .chapter-{$cId} { counter-reset: h1_num {$h1Start} h2_num {$h2Start} h3_num 0; }
    .chapter-{$cId} h1::before { content: '{$chapterNum}.' counter(h1_num) ' '; }
    .chapter-{$cId} h2::before { content: '{$chapterNum}.' counter(h1_num) '.' counter(h2_num) ' '; }
    .chapter-{$cId} h3::before { content: '{$chapterNum}.' counter(h1_num) '.' counter(h2_num) '.' counter(h3_num) ' '; }
";
        }
        return $css;
    }

    private function prependNumbersToHtml($html, $chapterNum)
    {
        if (empty($html)) return $html;

        // Use DOMDocument to inject numbers safely
        $dom = new \DOMDocument();
        // Handle UTF-8 correctly
        $html = mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8');
        @$dom->loadHTML('<div>' . $html . '</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);

        $h1Count = 0;
        $h2Count = 0;
        $h3Count = 0;

        $xpath = new \DOMXPath($dom);
        $nodes = $xpath->query('//h1 | //h2 | //h3');

        foreach ($nodes as $node) {
            $numStr = '';
            if ($node->nodeName === 'h1') {
                $h1Count++;
                $h2Count = 0;
                $h3Count = 0;
                $numStr = "{$chapterNum}.{$h1Count}";
            } elseif ($node->nodeName === 'h2') {
                if ($h1Count === 0) $h1Count = 1; // Default H1 to 1 if missing, matching TOC
                $h2Count++;
                $h3Count = 0;
                $numStr = "{$chapterNum}.{$h1Count}.{$h2Count}";
            } elseif ($node->nodeName === 'h3') {
                if ($h1Count === 0) $h1Count = 1; // Default H1 to 1 if missing
                if ($h2Count === 0) $h2Count = 1; // Default H2 to 1 if missing
                $h3Count++;
                $numStr = "{$chapterNum}.{$h1Count}.{$h2Count}.{$h3Count}";
            }

            $node->insertBefore($dom->createTextNode($numStr . ' '), $node->firstChild);
        }

        $result = $dom->saveHTML($dom->documentElement);
        // Remove the wrapping <div> and </div>
        return substr($result, 5, -6);
    }
}
