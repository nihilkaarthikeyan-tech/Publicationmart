<?php

namespace App\Rules;

use App\Support\BookPageSize;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;

/**
 * Rejects a front-cover image whose proportions do not match the book's trim
 * size, or which is too small to print or display well.
 *
 * Before this, the only dimension check anywhere was in the admin book screen,
 * in the browser, demanding exactly 755x1144 pixels for every book regardless
 * of its trim size — so a 5.5x8.5 book was forced to supply a 6x9-shaped
 * cover, and nothing enforced even that once the request left the page.
 *
 * Proportions are checked rather than exact pixels: an author supplying a
 * larger, sharper cover of the correct shape is doing the right thing and
 * should not be refused for it.
 */
class CoverMatchesBookSize implements ValidationRule
{
    /**
     * Proportional, and deliberately tight.
     *
     * Adjacent trim sizes are close: 5.25x8.25 and 5.5x8.5 are only 1.68%
     * apart in proportion. A tolerance anywhere near that cannot tell one
     * from the other, which is the whole job. 0.7% comfortably absorbs the
     * pixel of rounding an export introduces while still separating every
     * size in the table.
     */
    private const RATIO_TOLERANCE = 0.007;

    /**
     * The narrowest cover still worth putting on a shelf. Deliberately below
     * print resolution: this rule refuses the unusable, and what counts as
     * print-ready is the house's decision, not ours.
     */
    private const MIN_WIDTH_PX = 600;

    public function __construct(private readonly ?string $bookSize)
    {
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $value instanceof UploadedFile) {
            return;
        }

        $path = $value->getRealPath();
        if ($path === false || ! is_readable($path)) {
            return;
        }

        $info = @getimagesize($path);
        if ($info === false) {
            return; // not readable as an image — the mimes rule reports that
        }

        [$width, $height] = $info;
        if ($width < 1 || $height < 1) {
            return;
        }

        if ($width < self::MIN_WIDTH_PX) {
            $fail("This cover is only {$width} pixels wide. Covers need to be at least " . self::MIN_WIDTH_PX . ' pixels wide to print and display cleanly.');

            return;
        }

        $expected = BookPageSize::twips($this->bookSize);
        if ($expected === null) {
            return; // unknown trim size — nothing to compare against
        }

        [$expectedW, $expectedH] = $expected;
        $wanted = $expectedW / $expectedH;
        $actual = $width / $height;

        if (abs($actual - $wanted) / $wanted <= self::RATIO_TOLERANCE) {
            return;
        }

        $trim = BookPageSize::describe($expectedW, $expectedH);
        $suggestW = (int) round($height * $wanted);
        $suggestH = (int) round($width / $wanted);

        // Landscape where portrait is wanted is the usual mistake — most often
        // a full wrap (back cover, spine and front together) uploaded whole.
        if ($actual > 1 && $wanted < 1) {
            $fail("This image is landscape ({$width} x {$height}). A cover is the front of the book only, in portrait, shaped to the {$trim} trim size — around {$suggestW} x {$height} pixels.");

            return;
        }

        $fail("This cover is {$width} x {$height} pixels, which is not the shape of a {$trim} book. Use {$suggestW} x {$height}, or {$width} x {$suggestH}, or any size with those proportions.");
    }
}
