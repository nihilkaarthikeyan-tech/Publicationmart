<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== DEBUGGING IMAGE PATHS IN BOOKS ===\n\n";

// Get recent books with formatting data
$books = App\Models\Book::whereNotNull('formatting_data')->latest()->take(3)->get(['id', 'title', 'formatting_data']);

foreach ($books as $b) {
    $data = $b->formatting_data;
    if (!is_array($data))
        continue;

    $sections = $data['sections'] ?? [];
    echo "Book #{$b->id}: {$b->title}\n";
    echo str_repeat('-', 60) . "\n";

    $foundImages = false;
    foreach ($sections as $key => $sec) {
        $content = $sec['content'] ?? '';
        if (preg_match_all('/src=["\']([^"\']+)["\']/', $content, $matches)) {
            $foundImages = true;
            foreach ($matches[1] as $src) {
                echo "  Section [{$key}]\n";

                if (str_starts_with($src, 'data:')) {
                    // Base64 image
                    $len = strlen($src);
                    $type = 'unknown';
                    if (preg_match('/^data:(image\/[^;]+)/', $src, $tm)) {
                        $type = $tm[1];
                    }
                    echo "    TYPE: BASE64 ({$type})\n";
                    echo "    SIZE: " . number_format($len) . " chars (" . number_format($len / 1024, 1) . " KB)\n";

                    // Test if DomPDF can handle it
                    $testHtml = '<html><body><img src="' . substr($src, 0, 100) . '..." /></body></html>';
                    echo "    PREVIEW: data:{$type};base64," . substr($src, strpos($src, 'base64,') + 7, 30) . "...\n";
                }
                else {
                    echo "    TYPE: URL/PATH\n";
                    echo "    SRC: {$src}\n";

                    // Try to resolve
                    $cleanSrc = preg_replace('#^https?://[^/]+#', '', $src);

                    if (strpos($cleanSrc, '/storage/') === 0 || strpos($cleanSrc, 'storage/') === 0) {
                        $rel = ltrim($cleanSrc, '/');
                        if (str_starts_with($rel, 'storage/')) {
                            $rel = substr($rel, 8);
                        }
                        $p1 = storage_path('app/public/' . $rel);
                        $p2 = public_path('storage/' . $rel);
                        echo "    Path 1 (storage_path): {$p1} => " . (file_exists($p1) ? 'EXISTS' : 'NOT FOUND') . "\n";
                        echo "    Path 2 (public_path):  {$p2} => " . (file_exists($p2) ? 'EXISTS' : 'NOT FOUND') . "\n";
                    }
                    elseif (strpos($cleanSrc, '/images/') === 0) {
                        $p = public_path(ltrim($cleanSrc, '/'));
                        echo "    Path (public): {$p} => " . (file_exists($p) ? 'EXISTS' : 'NOT FOUND') . "\n";
                    }
                    else {
                        echo "    Path (unknown pattern): {$cleanSrc}\n";
                    }
                }
                echo "\n";
            }
        }
    }

    if (!$foundImages) {
        echo "  (No images found in any section)\n";
    }
    echo "\n";
}

// Storage info
echo "\n=== STORAGE PATHS ===\n";
echo "storage_path('app/public'): " . storage_path('app/public') . "\n";
echo "public_path('storage'):     " . public_path('storage') . "\n";
echo "Symlink exists: " . (file_exists(public_path('storage')) ? 'YES' : 'NO') . "\n";

// DomPDF test
echo "\n=== DOMPDF TEST ===\n";
try {
    $options = new \Dompdf\Options();
    $options->set('isRemoteEnabled', true);
    $options->set('isHtml5ParserEnabled', true);
    $dompdf = new \Dompdf\Dompdf($options);

    // Test with a simple base64 image (1x1 red pixel PNG)
    $testBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    $testHtml = '<html><body><p>Test</p><img src="' . $testBase64 . '" width="50" height="50" /></body></html>';
    $dompdf->loadHtml($testHtml);
    $dompdf->setPaper('A4');
    $dompdf->render();
    $output = $dompdf->output();
    echo "DomPDF base64 test: SUCCESS (output size: " . strlen($output) . " bytes)\n";
}
catch (Exception $e) {
    echo "DomPDF base64 test: FAILED - " . $e->getMessage() . "\n";
}

echo "\nDone.\n";
