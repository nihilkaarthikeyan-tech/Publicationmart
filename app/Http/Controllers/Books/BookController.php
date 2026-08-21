<?php

namespace App\Http\Controllers\Books;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;

use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;

class BookController extends Controller
{
    public function index()
    {
        $books = Auth::user()->books()->latest()->get();
        return Inertia::render('Books/Index', [
            'books' => $books
        ]);
    }

    public function create()
    {
        return Inertia::render('Books/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'language' => 'required',
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'author_name' => 'required|string|max:255',
            'co_authors' => 'nullable|array',
            'genre' => 'required|string',
            'publication' => 'nullable|string|max:255',
        ]);

        $book = $request->user()->books()->create($validated);

        return redirect()->route('books.design', $book->id);
    }

    public function edit(Book $book)
    {
        if ($book->user_id !== Auth::id()) {
            abort(403);
        }
        return Inertia::render('Books/Create', [
            'book' => $book
        ]);
    }

    public function updateBasics(Request $request, Book $book)
    {
        if ($book->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'language' => 'required',
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'author_name' => 'required|string|max:255',
            'co_authors' => 'nullable|array',
            'genre' => 'required|string',
            'publication' => 'nullable|string|max:255',
        ]);

        $book->update($validated);

        return redirect()->route('books.design', $book->id);
    }

    public function design(Book $book)
    {
        // SECURITY: enforce book ownership (was missing — IDOR).
        if ($book->user_id !== Auth::id()) { abort(403); }
        // Ideally check policy if user owns book
        return Inertia::render('Books/Design', [
            'book' => $book
        ]);
    }

    public function coverCreator(Book $book)
    {
        // SECURITY: enforce book ownership (was missing — IDOR).
        if ($book->user_id !== Auth::id()) { abort(403); }
        return Inertia::render('Books/CoverCreator', [
            'book' => $book
        ]);
    }

    /**
     * Save cover data from Cover Creator (auto-save/manual save)
     */
    public function saveCover(Request $request, Book $book)
    {
        // SECURITY: enforce book ownership (was missing — IDOR).
        if ($book->user_id !== Auth::id()) { abort(403); }
        // Validate
        $request->validate([
            'cover_data' => 'nullable', // Flexible (array or JSON string)
            'cover_image' => 'nullable|image|max:10240', // Max 10MB
        ]);

        $updateData = [];

        // 1. Handle Cover Data (JSON)
        if ($request->has('cover_data')) {
            $coverData = $request->input('cover_data');
            // If sent via FormData, it might be a JSON string
            if (is_string($coverData)) {
                $coverData = json_decode($coverData, true);
            }
            $updateData['cover_data'] = $coverData;
        }

        // 2. Handle Generated Image Upload
        if ($request->hasFile('cover_image')) {
            // Delete old cover if exists
            if ($book->cover_design_path && Storage::disk('public')->exists($book->cover_design_path)) {
                Storage::disk('public')->delete($book->cover_design_path);
            }

            // Store new cover
            $path = $request->file('cover_image')->store('covers', 'public');
            $updateData['cover_design_path'] = $path;
        }

        // 3. Update Book
        if (!empty($updateData)) {
            $book->update($updateData);
        }

        return response()->json([
            'success' => true,
            'message' => 'Cover saved successfully',
            'saved_at' => now()->toISOString(),
            'cover_url' => isset($updateData['cover_design_path']) ? '/storage/' . $updateData['cover_design_path'] : null
        ]);
    }

    public function update(Request $request, Book $book)
    {
        // SECURITY: enforce book ownership (was missing — IDOR).
        if ($book->user_id !== Auth::id()) { abort(403); }
        // Handle explicit file removal
        if ($request->boolean('remove_interior_file')) {
            if ($book->interior_file) {
                if (Storage::disk('public')->exists($book->interior_file)) {
                    Storage::disk('public')->delete($book->interior_file);
                }
                $book->update([
                    'interior_file' => null,
                    // Optional: Reset layout method to null or keep it? 
                    // Let's keep it as is or maybe they want to switch to AI?
                    // For now just removing the file is safer.
                ]);
            }
            return back()->with('success', 'File removed successfully.');
        }

        // Validate Form 2 Data
        $validated = $request->validate([
            'book_size' => 'nullable|string',
            'printing_color' => 'nullable|string',
            'paper_type' => 'nullable|string',
            'binding_type' => 'nullable|string',
            'interior_layout_method' => 'nullable|string',
            // Laravel 'max' is in KB → 1 GB = 1,048,576 KB
            'interior_file' => 'nullable|file|mimes:doc,docx|max:1048576',
            'cover_design_path' => 'nullable|file|mimes:jpg,jpeg,png|max:1048576',
        ]);

        $data = $validated;

        // Strict Mutual Exclusivity: Clear file if user chooses Automatic Tool (Manual Editing)
        $fileCleared = false;
        if (isset($data['interior_layout_method']) && $data['interior_layout_method'] === 'automatic_tool') {
            if ($book->interior_file) {
                if (Storage::disk('public')->exists($book->interior_file)) {
                    Storage::disk('public')->delete($book->interior_file);
                }
                $book->update(['interior_file' => null]);
                $fileCleared = true;
            }
        }

        // Filter out null values from the array for general updates, 
        // but since we already updated the book for the file clear, it's safe now.
        $data = array_filter($data, function ($value) {
            return !is_null($value);
        });

        if ($request->hasFile('cover_design_path')) {
            $path = $request->file('cover_design_path')->store('covers', 'public');
            $data['cover_design_path'] = $path;
        }

        if ($request->hasFile('interior_file')) {
            $file = $request->file('interior_file');
            $ext = strtolower($file->getClientOriginalExtension());

            // Strict Size Validation for DOCX
            if ($ext === 'docx' || $ext === 'doc') {
                try {
                    $phpWord = \PhpOffice\PhpWord\IOFactory::load($file->getPathname());
                    $targetSize = $request->input('book_size') ?? $book->book_size ?? '6x9';
                    $expected = $this->getPageDimensions($targetSize);

                    $sections = $phpWord->getSections();
                    if (count($sections) > 0) {
                        $section = $sections[0];
                        $style = $section->getStyle();
                        $w = $style->getPageSizeW();
                        $h = $style->getPageSizeH();

                        // Tolerance in Twips (200 twips ~= 0.14 inch)
                        $tolerance = 200;

                        if ($w && $h) {
                            if (abs($w - $expected['width']) > $tolerance || abs($h - $expected['height']) > $tolerance) {
                                $expW_in = round($expected['width'] / 1440, 2);
                                $expH_in = round($expected['height'] / 1440, 2);
                                $actW_in = round($w / 1440, 2);
                                $actH_in = round($h / 1440, 2);

                                File::delete($file->getPathname());
                                return back()->withErrors(['interior_file' => "Document size mismatch! Your selected book size is {$targetSize} inches ({$expW_in}\" × {$expH_in}\"), but the uploaded document is {$actW_in}\" × {$actH_in}\". Please upload a document that matches the {$targetSize} inch page size."]);
                            }
                        }
                    }
                    else {
                        // Could not read sections
                        File::delete($file->getPathname());
                        return back()->withErrors(['interior_file' => "Unable to read document content. The file appears to be empty or corrupted."]);
                    }
                }
                catch (\Exception $e) {
                    // Formatting Error
                    File::delete($file->getPathname());
                    return back()->withErrors(['interior_file' => "Invalid or corrupted DOCX file. Please upload a valid Word document."]);
                }
            }

            // If we get here, validation passed or wasn't applicable (PDF)
            $path = $request->file('interior_file')->store('interiors', 'public');

            // Delete old file if exists
            if ($book->interior_file) {
                Storage::disk('public')->delete($book->interior_file);
            }

            $data['interior_file'] = $path;

            // Force layout method to 'upload' if file is provided
            // This ensures if they were in automatic_tool mode, they are switched out.
            // 'upload' is the canonical value for any user file upload (consistent with FormattingToolController)
            $data['interior_layout_method'] = 'upload';
        }

        // Remove file logic (handled via silent remove or button)
        if ($request->has('remove_interior_file') && $request->remove_interior_file) {
            if ($book->interior_file) {
                Storage::disk('public')->delete($book->interior_file);
                $data['interior_file'] = null;
            // Should we reset layout method? Maybe not, keep as is or set to null.
            // $data['interior_layout_method'] = null; 
            }
        }
        $book->update(array_merge($data, ['step_completed' => 2]));

        if ($request->has('redirect_to') && !empty($request->input('redirect_to'))) {
            return redirect($request->input('redirect_to'));
        }

        if ($request->input('action') === 'back') {
            return redirect()->route('books.edit', $book->id);
        }

        // Stay on Design page when uploading a file (don't skip to step 3)
        if ($request->boolean('stay_on_page')) {
            return redirect()->route('books.design', $book->id);
        }

        return redirect()->route('books.details', $book->id);
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
            'width' => 8640, // 6" * 1440
            'height' => 12960, // 9" * 1440
            'marginTop' => 1440, // 1"
            'marginBottom' => 1440, // 1"
            'marginLeft' => 1440, // 1"
            'marginRight' => 1440, // 1"
            'gutter' => 0
        ];

        switch ($size) {
            case '5x8':
                $dims['width'] = 7200; // 5"
                $dims['height'] = 11520; // 8"
                break;
            case '6x9':
                $dims['width'] = 8640; // 6"
                $dims['height'] = 12960; // 9"
                break;
            case '5.5x8.5':
                $dims['width'] = 7920; // 5.5"
                $dims['height'] = 12240; // 8.5"
                break;
            case '8.5x8.5':
                $dims['width'] = 12240; // 8.5"
                $dims['height'] = 12240; // 8.5"
                break;
            case '8.5x11':
                $dims['width'] = 12240; // 8.5"
                $dims['height'] = 15840; // 11"
                break;
            case '16.5x11':
                $dims['width'] = 23760; // 16.5"
                $dims['height'] = 15840; // 11"
                break;
            default:
                // If unknown size, still return 6x9 defaults
                break;
        }

        return $dims;
    }

    public function details(Book $book)
    {
        // SECURITY: enforce book ownership (was missing — IDOR).
        if ($book->user_id !== Auth::id()) { abort(403); }
        $book->load('aiChapters.sections');
        return Inertia::render('Books/Details', [
            'book' => $book,
        ]);
    }

    public function updateDetails(Request $request, Book $book)
    {
        // SECURITY: enforce book ownership (was missing — IDOR).
        if ($book->user_id !== Auth::id()) { abort(403); }
        $validated = $request->validate([
            'author_biography' => 'required|string|min:10',
            'about_book' => 'required|string|min:20',
            'publication_date' => 'nullable|date',
            'num_pages' => 'required|integer|min:1',
            'printing_cost' => 'required|numeric',
            'author_cost' => 'required|numeric',
            'selling_price' => 'required|numeric|gte:author_cost',
            'international_selling_price' => 'nullable|numeric',
            'author_address' => 'nullable|string|min:10',
            'author_copies' => 'nullable|integer|min:0',
            'agreed_terms' => 'required|accepted',
            'confirmed_content' => 'required|accepted',
        ]);

        // Default author_copies to 0 if not provided (optional field, DB column is NOT NULL)
        $validated['author_copies'] = $validated['author_copies'] ?? 0;

        $book->update(array_merge($validated, ['step_completed' => 3]));

        if ($request->input('action') === 'back') {
            return redirect()->route('books.design', $book->id);
        }

        if ($request->boolean('save_only')) {
            return redirect()->back(); // Just reload current page context, client will handle navigation
        }

        return redirect()->route('books.review', $book->id);
    }

    public function review(Book $book)
    {
        // SECURITY: enforce book ownership (was missing — IDOR).
        if ($book->user_id !== Auth::id()) { abort(403); }
        return Inertia::render('Books/Review', [
            'book' => $book
        ]);
    }

    /**
     * Show the full book preview page
     */
    public function preview(Book $book)
    {
        if ($book->user_id !== Auth::id()) {
            abort(403);
        }

        $book->load('aiChapters.sections');

        return Inertia::render('Books/Preview', [
            'book' => $book,
        ]);
    }

    /**
     * Confirm preview and redirect to payment/submission
     */
    public function confirmPreview(Request $request, Book $book)
    {
        if ($book->user_id !== Auth::id()) {
            abort(403);
        }

        // Mark that user has previewed (optional: store this in session or book)
        session(['book_' . $book->id . '_previewed' => true]);

        // Redirect to payment page
        return redirect()->route('ai-studio.payment', [
            'book' => $book->id,
            'plan' => 'standard',
            'type' => 'publishing'
        ]);
    }

    public function publish(Request $request, Book $book)
    {
        try {
            // Check ownership
            if ($book->user_id !== Auth::id()) {
                abort(403, 'Unauthorized action.');
            }

            // Finalize submission - set status to pending for admin review
            $book->update([
                'step_completed' => 4,
                'status' => 'submitted'
            ]);

            // Broadcast to admins that a new book has been submitted
            try {
                \Illuminate\Support\Facades\Event::dispatch(new \App\Events\BookSubmitted($book));
            }
            catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Broadcasting failed: ' . $e->getMessage());
            // Continue execution - do not block user submission
            }

            return redirect()->route('dashboard')->with('success', 'Book submitted for approval!');

        }
        catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Publishing failed: ' . $e->getMessage());
            // Return error to user
            return redirect()->route('dashboard')->with('error', '⚠️ Submission Failed: ' . $e->getMessage());
        }
    }

    public function destroy(Book $book)
    {
        // Check ownership
        if ($book->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        // Delete associated files if any (optional but good practice)
        if ($book->cover_design_path) {
            Storage::disk('public')->delete($book->cover_design_path);
        }
        if ($book->interior_file) {
            Storage::disk('public')->delete($book->interior_file);
        }

        $book->delete();

        return redirect()->back()->with('success', 'Book deleted successfully!');
    }
}
