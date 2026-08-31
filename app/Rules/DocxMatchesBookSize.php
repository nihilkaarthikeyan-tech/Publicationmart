<?php

namespace App\Rules;

use App\Support\BookPageSize;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;

/**
 * Rejects a manuscript whose page size does not match the book's trim size.
 *
 * The upload screen has always promised this — "your uploaded file's page
 * dimensions must match the selected book size, mismatched sizes will be
 * rejected" — but nothing enforced it. A 6×9 manuscript could be uploaded
 * against a 5.5×8.5 book and accepted silently, then printed at the wrong
 * size or reflowed on export.
 *
 * A .docx is a zip; page size lives in word/document.xml as
 * <w:pgSz w:w="7920" w:h="12240"/> on each section's <w:sectPr>. Every
 * section is checked, because a document can change page size partway
 * through and a book cannot.
 */
class DocxMatchesBookSize implements ValidationRule
{
    /** Word writes rounded twips; allow a 20th of an inch either way. */
    private const TOLERANCE_TWIPS = 72;

    public function __construct(private readonly ?string $bookSize)
    {
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $value instanceof UploadedFile) {
            return; // the file rules deal with that
        }

        $expected = BookPageSize::twips($this->bookSize);
        if ($expected === null) {
            return; // unknown trim size — nothing to compare against, so don't block the author
        }

        // Only .docx is a zip we can read. A legacy .doc is opaque here, and
        // blocking it on a check we cannot perform would be wrong.
        if (strtolower($value->getClientOriginalExtension()) !== 'docx') {
            return;
        }

        $sections = $this->pageSizes($value->getRealPath());

        if ($sections === null || $sections === []) {
            return; // unreadable or no page size declared — let it through rather than reject on our own failure
        }

        [$expectedW, $expectedH] = $expected;

        foreach ($sections as $i => [$w, $h]) {
            if ($this->matches($w, $h, $expectedW, $expectedH)) {
                continue;
            }

            $found = BookPageSize::describe($w, $h);
            $want = BookPageSize::describe($expectedW, $expectedH);

            // Landscape is the common mistake and worth naming precisely.
            if ($this->matches($h, $w, $expectedW, $expectedH)) {
                $fail("This file's pages are landscape ({$found}). The selected book size is {$want} — rotate the pages to portrait and upload again.");

                return;
            }

            $where = count($sections) > 1 ? ' (section ' . ($i + 1) . ')' : '';
            $fail("This file's pages are {$found}{$where}, but the selected book size is {$want}. Change the page size in Word, or pick the matching book size, then upload again.");

            return;
        }
    }

    private function matches(int $w, int $h, int $expectedW, int $expectedH): bool
    {
        return abs($w - $expectedW) <= self::TOLERANCE_TWIPS
            && abs($h - $expectedH) <= self::TOLERANCE_TWIPS;
    }

    /**
     * Every section's [width, height] in twips, or null if the file cannot be
     * read as a .docx at all.
     */
    private function pageSizes(string $path): ?array
    {
        if (! class_exists(\ZipArchive::class)) {
            return null; // no zip extension — cannot check, so do not block
        }

        $zip = new \ZipArchive();
        if ($zip->open($path) !== true) {
            return null;
        }

        $xml = $zip->getFromName('word/document.xml');
        $zip->close();

        if ($xml === false) {
            return null;
        }

        // w:orient is not consulted: w and h are already the final page
        // dimensions, and a landscape page reports them swapped.
        if (! preg_match_all('/<w:pgSz\b[^>]*>/i', $xml, $tags)) {
            return [];
        }

        $sizes = [];
        foreach ($tags[0] as $tag) {
            if (preg_match('/\bw:w="(\d+)"/i', $tag, $mw)
                && preg_match('/\bw:h="(\d+)"/i', $tag, $mh)) {
                $sizes[] = [(int) $mw[1], (int) $mh[1]];
            }
        }

        return $sizes;
    }
}
