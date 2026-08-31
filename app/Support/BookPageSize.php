<?php

namespace App\Support;

/**
 * The canonical table of book trim sizes.
 *
 * Page geometry was previously defined only inside FormattingToolController,
 * where it drives preview and export. Validating an upload needs the same
 * numbers, and two copies of a table like this drift apart silently — so the
 * table lives here and both callers read it.
 *
 * All measurements are in twips (twentieths of a point, 1440 to the inch),
 * which is the unit Word itself stores page size in.
 */
class BookPageSize
{
    public const TWIPS_PER_INCH = 1440;

    /** trim size key => [width, height] in twips */
    public const SIZES = [
        '5x8'        => [7200, 11520],
        '5.25x8'     => [7560, 11880],
        '5.25x8.25'  => [7560, 11880],
        '5.5x8.5'    => [7920, 12240],
        '6x9'        => [8640, 12960],
        '8.5x8.5'    => [12240, 12240],
        '8.5x11'     => [12240, 15840],
        '16.5x11'    => [23760, 15840],
        'a4'         => [11909, 16834],   // 8.27 x 11.69 in
        'a3'         => [16834, 23818],   // 11.69 x 16.54 in
        'a5'         => [8395, 11909],    // 5.83 x 8.27 in
    ];

    /** The size used when a book has none recorded, matching the tool's default. */
    public const DEFAULT_SIZE = '6x9';

    /** Normalise "5.5 x 8.5", "5.5X8.5", " A4 " to a table key. */
    public static function normalise(?string $size): string
    {
        return strtolower(str_replace(' ', '', (string) $size));
    }

    /**
     * [width, height] in twips for a trim size, or null when the size is not
     * one we know — in which case a caller should not guess.
     */
    public static function twips(?string $size): ?array
    {
        return self::SIZES[self::normalise($size)] ?? null;
    }

    /** "5.5 × 8.5 inches", for telling a person what went wrong. */
    public static function describe(int $widthTwips, int $heightTwips): string
    {
        $fmt = fn (int $t) => rtrim(rtrim(number_format($t / self::TWIPS_PER_INCH, 2, '.', ''), '0'), '.');

        return $fmt($widthTwips) . ' × ' . $fmt($heightTwips) . ' inches';
    }
}
