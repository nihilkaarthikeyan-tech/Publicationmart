<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Blog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AdministratorController extends Controller
{
    public function dashboard(\App\Services\Admin\AdminDashboardService $dashboardService)
    {
        if (!Auth::user()->is_admin) {
            abort(403, 'Unauthorized action.');
        }

        $metrics = $dashboardService->getDashboardMetrics();

        return Inertia::render('Admin/Dashboard', $metrics);
    }

    public function books()
    {
        if (!Auth::user()->is_admin) {
            abort(403);
        }

        $books = Book::with('user')
            ->latest()
            ->paginate(15)
            ->through(function ($book) {
            return [
            'id' => $book->id,
            'title' => $book->title,
            'author_name' => $book->author_name,
            'status' => $book->status ?? 'pending',
            'selling_price' => $book->selling_price,
            'user' => $book->user ? ['name' => $book->user->name, 'email' => $book->user->email] : null,
            'created_at' => $book->created_at,
            ];
        });

        return Inertia::render('Admin/Books/Index', [
            'books' => $books
        ]);
    }

    /**
     * Dedicated Approvals Queue
     */
    public function approvals(Request $request)
    {
        if (!Auth::user()->is_admin) {
            abort(403);
        }

        $dbError = null;

        try {
            // Fetch books that are submitted (step >= 4) but not yet approved
            // Using pagination strictly for performance
            // Status must be 'pending', 'draft', 'submitted', or NULL (new books)
            $books = Book::with('user')
                ->where('step_completed', '>=', 4) // Ensure user actually submitted
                ->where(function ($q) {
                $q->whereIn('status', ['pending', 'draft', 'submitted'])
                    ->orWhereNull('status');
            })
                ->orderBy('updated_at', 'desc') // Show recently updated/submitted books first
                ->paginate(20)
                ->through(function ($book) {
                return [
                'id' => $book->id,
                'title' => $book->title,
                'author_name' => $book->author_name,
                'status' => $book->status ?? 'pending',
                'isbn' => $book->isbn,
                'selling_price' => $book->selling_price,
                'cover_design_path' => $book->cover_design_path,
                'user' => $book->user ? ['name' => $book->user->name, 'email' => $book->user->email] : null,
                'created_at' => $book->created_at,
                'updated_at' => $book->updated_at,
                ];
            });
        }
        catch (\Throwable $e) {
            // Don't white-screen the admin panel if the DB is temporarily unavailable / misconfigured.
            // Still log the exception for debugging.
            \Log::error('Admin approvals DB error', [
                'message' => $e->getMessage(),
                'exception' => $e,
            ]);

            // Empty paginator so the UI can still render.
            $books = new \Illuminate\Pagination\LengthAwarePaginator(
            [],
                0,
                20,
                1,
            [
                'path' => $request->url(),
                'query' => $request->query(),
            ]
                );

            // Friendly hint for common local/prod misconfigs (avoid leaking credentials).
            $msg = $e->getMessage();
            if (str_contains($msg, 'SQLSTATE[HY000] [1045]')) {
                $dbError = 'Database authentication failed. Check DB_USERNAME/DB_PASSWORD in your .env and confirm the MySQL user has access.';
            }
            elseif (str_contains($msg, 'SQLSTATE[HY000] [2002]')) {
                $dbError = 'Database connection failed. Confirm MySQL is running and DB_HOST/DB_PORT are correct.';
            }
            else {
                $dbError = 'Database error while loading approvals. Please check server logs.';
            }
        }

        return Inertia::render('Admin/Approvals/Index', [
            'books' => $books,
            'dbError' => $dbError,
        ]);
    }

    public function show(Book $book)
    {
        if (!Auth::user()->is_admin) {
            abort(403);
        }

        return Inertia::render('Admin/BookDetails', [
            'book' => $book->load('user')->loadCount('aiChapters')
        ]);
    }

    /**
     * Admin Manuscript Preview — Opens the formatted book in BookViewer for admin
     */
    public function previewManuscript(Book $book)
    {
        if (!Auth::user()->is_admin) {
            abort(403);
        }

        $formattingData = $book->formatting_data;
        $interiorFile = $book->interior_file;

        // Allow preview if EITHER formatting data exists OR a file was uploaded
        if ((empty($formattingData) || !is_array($formattingData)) && empty($interiorFile)) {
            return back()->with('error', 'This book has no formatted manuscript data and no uploaded file.');
        }

        return Inertia::render('Admin/ManuscriptPreview', [
            'book' => [
                'id' => $book->id,
                'title' => $book->title,
                'author_name' => $book->author_name,
                'book_size' => $book->book_size ?? '6x9',
            ],
            'formattingData' => $formattingData,
            'interiorFile' => $interiorFile ?Storage::url($interiorFile) : null,
            'layoutMethod' => $book->interior_layout_method
        ]);
    }

    /**
     * Admin Download Manuscript as DOCX — uses existing FormattingToolController export
     */
    public function downloadManuscript(Book $book)
    {
        if (!Auth::user()->is_admin) {
            abort(403);
        }

        // Delegate to the existing export method
        $request = request();
        $format = $request->query('format', 'docx');
        $request->merge(['format' => $format]);

        $controller = app(\App\Http\Controllers\Books\FormattingToolController::class);
        return $controller->export($request, $book);
    }

    public function update(Request $request, Book $book)
    {
        if (!Auth::user()->is_admin) {
            abort(403);
        }

        $validated = $request->validate([
            // Step 1 Fields
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'author_name' => 'required|string|max:255',
            'genre' => 'required|string|max:255',
            'language' => 'required|string|max:255',
            'publication' => 'nullable|string|max:255',
            'about_book' => 'nullable|string',
            'author_biography' => 'nullable|string',

            // Publishing Details (Admin)
            'isbn' => 'nullable|string|max:20',
            'selling_price' => 'nullable|numeric|min:0',
            'hardcover_price' => 'nullable|numeric|min:0',
            'ebook_price' => 'nullable|numeric|min:0',
            'audio_price' => 'nullable|numeric|min:0',
            'printing_cost' => 'nullable|numeric|min:0',
            'author_cost' => 'nullable|numeric|min:0',
            'publication_date' => 'nullable|date',

            // Step 2 Fields (Specs & Files)
            'book_size' => 'nullable|string',
            'printing_color' => 'nullable|string',
            'paper_type' => 'nullable|string',
            'binding_type' => 'nullable|string',
            'num_pages' => 'nullable|integer',
            'interior_layout_method' => 'nullable|string',
            // Laravel 'max' is in KB → 1 GB = 1,048,576 KB
            'interior_file' => 'nullable|file|mimes:doc,docx,pdf|max:51200',
            'cover_design_path' => 'nullable|file|mimes:jpg,jpeg,png|max:10240',
            'audio_file' => 'nullable|file|mimes:mp3,wav,m4a,ogg,aac|max:102400',

            // External Links
            'amazon_link' => 'nullable|url',
            'google_books_link' => 'nullable|url',
        ]);

        $data = $validated;

        // Handle File Uploads
        if ($request->hasFile('cover_design_path')) {
            $path = $request->file('cover_design_path')->store('covers', 'public');
            $data['cover_design_path'] = $path;
        }

        if ($request->hasFile('interior_file')) {
            $path = $request->file('interior_file')->store('interiors', 'public');
            $data['interior_file'] = $path;
        }

        if ($request->hasFile('audio_file')) {
            $path = $request->file('audio_file')->store('audiobooks', 'public');
            $data['audio_file'] = $path;
        }

        $book->update($data);

        return back()->with('success', 'Book details updated successfully.');
    }

    /**
     * Quick file upload - only uploads a single file without requiring other fields
     */
    public function uploadFile(Request $request, Book $book)
    {
        if (!Auth::user()->is_admin) {
            abort(403);
        }

        \Log::info('Upload request received', [
            'file_type' => $request->input('file_type'),
            'has_file' => $request->hasFile('file'),
            'all_input' => $request->all(),
            'files' => $request->allFiles()
        ]);

        $fileType = $request->input('file_type');

        if ($fileType === 'cover' && $request->hasFile('file')) {
            try {
                // Laravel 'max' is in KB → 1 GB = 1,048,576 KB
                $request->validate(['file' => 'required|file|mimes:jpg,jpeg,png|max:10240']);
                $path = $request->file('file')->store('covers', 'public');
                $book->update(['cover_design_path' => $path]);
                return back()->with('success', 'Cover image uploaded successfully.');
            }
            catch (\Exception $e) {
                \Log::error('Cover upload failed', ['error' => $e->getMessage()]);
                return back()->with('error', 'Cover upload failed: ' . $e->getMessage());
            }
        }

        if ($fileType === 'interior' && $request->hasFile('file')) {
            try {
                // Laravel 'max' is in KB → 1 GB = 1,048,576 KB
                $request->validate(['file' => 'required|file|mimes:doc,docx,pdf|max:51200']);
                $path = $request->file('file')->store('interiors', 'public');
                $book->update(['interior_file' => $path]);
                return back()->with('success', 'Interior file uploaded successfully.');
            }
            catch (\Exception $e) {
                \Log::error('Interior upload failed', ['error' => $e->getMessage()]);
                return back()->with('error', 'Interior upload failed: ' . $e->getMessage());
            }
        }

        if ($fileType === 'audio' && $request->hasFile('file')) {
            try {
                // Laravel 'max' is in KB → 1 GB = 1,048,576 KB
                $request->validate(['file' => 'required|file|mimes:mp3,wav,m4a,ogg,aac|max:102400']);
                $path = $request->file('file')->store('audiobooks', 'public');
                $book->update(['audio_file' => $path]);
                return back()->with('success', 'Audio file uploaded successfully.');
            }
            catch (\Exception $e) {
                \Log::error('Audio upload failed', ['error' => $e->getMessage()]);
                return back()->with('error', 'Audio upload failed: ' . $e->getMessage());
            }
        }

        \Log::warning('No valid file upload', [
            'file_type' => $fileType,
            'has_file' => $request->hasFile('file')
        ]);

        return back()->with('error', 'No file uploaded or invalid file type.');
    }

    public function approve(Request $request, Book $book)
    {
        if (!Auth::user()->is_admin) {
            abort(403);
        }

        // Before approving, save any metadata sent (ISBN, About Book, etc.)
        // This makes the "Approve" button also act as a "Save & Approve" button
        $validated = $request->validate([
            // Basic Info
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'author_name' => 'nullable|string|max:255',
            'genre' => 'nullable|string|max:255',
            'language' => 'nullable|string|max:255',
            'publication' => 'nullable|string|max:255',
            // Publishing Details
            'isbn' => 'nullable|string|max:20',
            'selling_price' => 'nullable|numeric|min:0',
            'printing_cost' => 'nullable|numeric|min:0',
            'author_cost' => 'nullable|numeric|min:0',
            'about_book' => 'nullable|string',
            'author_biography' => 'nullable|string',
            'publication_date' => 'nullable|date',
            'book_size' => 'nullable|string',
            'printing_color' => 'nullable|string',
            'paper_type' => 'nullable|string',
            'binding_type' => 'nullable|string',
            'num_pages' => 'nullable|integer',
            'amazon_link' => 'nullable|url',
            'google_books_link' => 'nullable|url',
        ]);

        if (!empty($validated)) {
            $book->update($validated);
        }

        // Validation: Check required fields before final approval
        $errors = [];

        if (empty($book->cover_design_path)) {
            $errors[] = 'Cover image is required before approval.';
        }

        if (empty($book->selling_price) || $book->selling_price <= 0) {
            $errors[] = 'Selling price must be set before approval.';
        }

        if (empty($book->title)) {
            $errors[] = 'Book title is required.';
        }

        if (empty($book->isbn)) {
            $errors[] = 'ISBN is required before official approval.';
        }

        if (!empty($errors)) {
            return back()->with('error', implode(' ', $errors));
        }

        $book->update([
            'status' => 'approved',
            'published_at' => now(),
            'step_completed' => 5
        ]);

        return back()->with('success', 'Book approved and published to store.');
    }

    public function requestRevision(Request $request, Book $book)
    {
        if (!Auth::user()->is_admin) {
            abort(403);
        }

        try {
            $validated = $request->validate([
                'reason' => 'required|string|min:5',
            ]);

            $book->update([
                'status' => 'draft',
                'admin_feedback' => $validated['reason'],
            ]);

            // Send rejection email to the author
            try {
                if ($book->user && $book->user->email) {
                    \Mail::to($book->user->email)->send(new \App\Mail\BookRejectionNotification($book));
                }
            }
            catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Mail failed: ' . $e->getMessage());
            }

            return back()->with('success', 'Book returned for revision. Author has been notified.');
        }
        catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Revision failed: ' . $e->getMessage());
            return back()->with('error', 'Error: ' . $e->getMessage());
        }

    }

    /**
     * Delete a book (Admin only)
     */
    public function destroy(Book $book)
    {
        if (!Auth::user()->is_admin) {
            abort(403);
        }

        // Delete associated files from storage
        if ($book->cover_design_path) {
            Storage::disk('public')->delete($book->cover_design_path);
        }
        if ($book->interior_file) {
            Storage::disk('public')->delete($book->interior_file);
        }
        if ($book->audio_file) {
            Storage::disk('public')->delete($book->audio_file);
        }

        $bookTitle = $book->title;
        $book->delete();

        // If deleting from the detail page, go to dashboard. Otherwise stay on the list (back).
        if (request()->header('referer') === route('admin.books.show', $book->id)) {
            return redirect()->route('admin.dashboard')->with('success', "Book '{$bookTitle}' has been deleted.");
        }

        return back()->with('success', "Book '{$bookTitle}' has been deleted.");
    }

    // --- Admin Publication Flow Methods ---

    public function createBook()
    {
        if (!Auth::user()->is_admin) {
            abort(403);
        }
        return Inertia::render('Admin/Books/Create');
    }

    public function storeBook(Request $request)
    {
        if (!Auth::user()->is_admin) {
            abort(403);
        }

        $validated = $request->validate([
            'language' => 'required',
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'author_name' => 'required|string|max:255',
            'co_authors' => 'nullable|array',
            'genre' => 'required|string',
            'author_email' => 'nullable|email', // New optional field
        ]);

        $bookData = array_merge($validated, ['status' => 'draft']);

        // Remove author_email from bookData as it might not be a direct column if we map it differently,
        // but wait, we added 'user_email' column. So let's map it.
        if (isset($bookData['author_email'])) {
            $bookData['user_email'] = $bookData['author_email'];
            unset($bookData['author_email']);
        }

        // Determine Owner
        $ownerId = $request->user()->id; // Default to Admin
        $userEmail = $bookData['user_email'] ?? null;

        if ($userEmail) {
            // Check if user exists
            $existingUser = \App\Models\User::where('email', $userEmail)->first();
            if ($existingUser) {
                $ownerId = $existingUser->id;
            }
            else {
                // Shadow Profile: No user_id, but has user_email
                $ownerId = null;
            }
        }

        $bookData['user_id'] = $ownerId;

        // Start Transaction
        $book = Book::create($bookData);

        return redirect()->route('admin.books.design', $book->id);
    }

    public function designBook(Book $book)
    {
        if (!Auth::user()->is_admin) {
            abort(403);
        }
        return Inertia::render('Admin/Books/Design', [
            'book' => $book
        ]);
    }

    public function updateDesignBook(Request $request, Book $book)
    {
        if (!Auth::user()->is_admin) {
            abort(403);
        }

        $validated = $request->validate([
            'book_size' => 'nullable|string',
            'printing_color' => 'nullable|string',
            'paper_type' => 'nullable|string',
            'interior_layout_method' => 'nullable|string',
            // Laravel 'max' is in KB → 1 GB = 1,048,576 KB
            'interior_file' => 'nullable|file|mimes:doc,docx,pdf|max:51200',
            'cover_design_path' => 'nullable|file|mimes:jpg,jpeg,png|max:10240',
        ]);

        $data = $validated;

        if ($request->hasFile('cover_design_path')) {
            $path = $request->file('cover_design_path')->store('covers', 'public');
            $data['cover_design_path'] = $path;
        }

        if ($request->hasFile('interior_file')) {
            $path = $request->file('interior_file')->store('interiors', 'public');
            $data['interior_file'] = $path;
        }

        $book->update(array_merge($data, ['step_completed' => 2]));

        // Redirect to Admin Book Details for final review/edit
        return redirect()->route('admin.books.show', $book->id);
    }

    /**
     * User Management - List all users (authors)
     */
    public function users()
    {
        if (!Auth::user()->is_admin) {
            abort(403, 'Unauthorized action.');
        }

        $users = \App\Models\User::where(function ($q) {
            $q->whereNull('role')->orWhereNotIn('role', ['super_admin', 'editor']);
        })
            ->withCount('books')
            ->withCount([
            'books as published_books_count' => function ($q) {
            $q->where('status', 'approved');
        }
        ])
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users
        ]);
    }

    /**
     * View a specific user's dashboard/analytics
     */
    public function userDashboard(\App\Models\User $user)
    {
        if (!Auth::user()->is_admin) {
            abort(403, 'Unauthorized action.');
        }

        // Use database queries for accurate real-time data
        $userBookIds = Book::where('user_id', $user->id)->pluck('id');

        // Get user's transactions
        $transactions = \App\Models\Transaction::where('payment_status', 'completed')
            ->whereIn('book_id', $userBookIds)
            ->get();

        // Real-time stats using database queries
        $analytics = [
            'totalBooks' => Book::where('user_id', $user->id)->count(),
            'publishedBooks' => Book::where('user_id', $user->id)->where('status', 'approved')->count(),
            'pendingBooks' => Book::where('user_id', $user->id)
            ->where(function ($q) {
            $q->whereIn('status', ['pending', 'draft', 'submitted'])->orWhereNull('status');
        })->count(),
            'totalRevenue' => $transactions->sum('amount'),
            'totalRoyalty' => $transactions->sum('author_revenue'),
            'totalSales' => $transactions->sum('quantity'),
            'breakdown' => [
                'amazon' => [
                    'quantity' => $transactions->where('sales_channel', 'amazon')->sum('quantity'),
                    'revenue' => $transactions->where('sales_channel', 'amazon')->sum('author_revenue'),
                ],
                'google' => [
                    'quantity' => $transactions->where('sales_channel', 'google')->sum('quantity'),
                    'revenue' => $transactions->where('sales_channel', 'google')->sum('author_revenue'),
                ],
                'direct' => [
                    'quantity' => $transactions->where('sales_channel', 'direct')->sum('quantity'),
                    'revenue' => $transactions->where('sales_channel', 'direct')->sum('author_revenue'),
                ],
                'other' => [
                    'quantity' => $transactions->where('sales_channel', 'other')->sum('quantity'),
                    'revenue' => $transactions->where('sales_channel', 'other')->sum('author_revenue'),
                ],
            ],
        ];

        // User's books list with database query
        $books = Book::where('user_id', $user->id)
            ->select('id', 'title', 'author_name', 'status', 'selling_price', 'created_at')
            ->latest()
            ->get()
            ->map(function ($book) {
            return [
            'id' => $book->id,
            'title' => $book->title,
            'author_name' => $book->author_name,
            'status' => $book->status ?? 'pending',
            'selling_price' => $book->selling_price,
            'created_at' => $book->created_at,
            ];
        });

        return Inertia::render('Admin/Users/Dashboard', [
            'user' => $user,
            'analytics' => $analytics,
            'books' => $books,
            'backUrl' => route('admin.users.index'),
            'backLabel' => 'Back to Users'
        ]);
    }

    /**
     * Admin Management - List all sub-admins
     */
    public function admins()
    {
        if (!Auth::user()->is_admin) {
            abort(403, 'Unauthorized action.');
        }

        $adminQuery = \App\Models\User::whereIn('role', ['super_admin', 'editor']);

        $stats = [
            'totalAdmins' => (clone $adminQuery)->count(),
            'activePublishing' => (clone $adminQuery)->whereHas('books', fn($q) => $q->where('status', 'approved'))->count(),
            'totalBooks' => Book::whereIn('user_id', (clone $adminQuery)->pluck('id'))->where('status', 'approved')->count(),
        ];

        // List all users where is_admin is true
        $admins = (clone $adminQuery)
            ->withCount('books')
            ->withCount([
            'books as published_books_count' => function ($q) {
            $q->where('status', 'approved');
        }
        ])
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Admins/Index', [
            'admins' => $admins,
            'stats' => $stats
        ]);
    }

    /**
     * View a specific sub-admin's dashboard/analytics
     */
    public function adminDashboard(\App\Models\User $admin)
    {
        if (!Auth::user()->is_admin) {
            abort(403, 'Unauthorized action.');
        }

        // Use database queries for accurate real-time data (not collection filtering)
        $userBookIds = Book::where('user_id', $admin->id)->pluck('id');

        $transactions = \App\Models\Transaction::where('payment_status', 'completed')
            ->whereIn('book_id', $userBookIds)
            ->get();

        // Real-time stats using database queries
        $analytics = [
            'totalBooks' => Book::where('user_id', $admin->id)->count(),
            'publishedBooks' => Book::where('user_id', $admin->id)->where('status', 'approved')->count(),
            'pendingBooks' => Book::where('user_id', $admin->id)
            ->where(function ($q) {
            $q->whereIn('status', ['pending', 'draft', 'submitted'])->orWhereNull('status');
        })->count(),
            'totalRevenue' => $transactions->sum('amount'),
            'totalRoyalty' => $transactions->sum('author_revenue'),
            'totalSales' => $transactions->sum('quantity'),
            'breakdown' => [
                'amazon' => [
                    'quantity' => $transactions->where('sales_channel', 'amazon')->sum('quantity'),
                    'revenue' => $transactions->where('sales_channel', 'amazon')->sum('author_revenue'),
                ],
                'google' => [
                    'quantity' => $transactions->where('sales_channel', 'google')->sum('quantity'),
                    'revenue' => $transactions->where('sales_channel', 'google')->sum('author_revenue'),
                ],
                'direct' => [
                    'quantity' => $transactions->where('sales_channel', 'direct')->sum('quantity'),
                    'revenue' => $transactions->where('sales_channel', 'direct')->sum('author_revenue'),
                ],
                'other' => [
                    'quantity' => $transactions->where('sales_channel', 'other')->sum('quantity'),
                    'revenue' => $transactions->where('sales_channel', 'other')->sum('author_revenue'),
                ],
            ],
        ];

        // Get books list with database query
        $books = Book::where('user_id', $admin->id)
            ->select('id', 'title', 'author_name', 'status', 'selling_price', 'created_at')
            ->latest()
            ->get()
            ->map(function ($book) {
            return [
            'id' => $book->id,
            'title' => $book->title,
            'author_name' => $book->author_name,
            'status' => $book->status ?? 'pending',
            'selling_price' => $book->selling_price,
            'created_at' => $book->created_at,
            ];
        });

        return Inertia::render('Admin/Users/Dashboard', [
            'user' => $admin,
            'analytics' => $analytics,
            'books' => $books,
            'backUrl' => route('admin.admins.index'),
            'backLabel' => 'Back to Admins'
        ]);
    }

    /**
     * Store a new campaign code (Main Admin Only - id=1)
     */
    public function storeCampaignCode(Request $request)
    {
        // Only main admin (id=1) can create campaign codes
        if (Auth::id() !== 2) {
            abort(403, 'Only the main administrator can manage campaign codes.');
        }

        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:campaign_codes,code',
            'description' => 'nullable|string|max:255',
        ]);

        $campaignCode = \App\Models\CampaignCode::create([
            'code' => strtoupper($validated['code']),
            'description' => $validated['description'] ?? null,
            'is_active' => true,
            'created_by' => Auth::id(),
        ]);

        return back()->with('success', 'Campaign code created successfully!');
    }

    /**
     * Toggle campaign code status (enable/disable)
     */
    public function toggleCampaignCode($id)
    {
        if (Auth::id() !== 2) {
            abort(403, 'Only the main administrator can manage campaign codes.');
        }

        $campaignCode = \App\Models\CampaignCode::findOrFail($id);
        $campaignCode->is_active = !$campaignCode->is_active;
        $campaignCode->save();

        return back()->with('success', 'Campaign code ' . ($campaignCode->is_active ? 'enabled' : 'disabled') . '!');
    }

    /**
     * Delete a campaign code
     */
    public function deleteCampaignCode($id)
    {
        if (Auth::id() !== 2) {
            abort(403, 'Only the main administrator can manage campaign codes.');
        }

        $campaignCode = \App\Models\CampaignCode::findOrFail($id);
        $campaignCode->delete();

        return back()->with('success', 'Campaign code deleted!');
    }

    // --- Admin Blog Management ---

    public function manageBlogs()
    {
        if (!Auth::user()->is_admin) {
            abort(403);
        }

        $blogs = Blog::query()
            ->latest()
            ->paginate(20)
            ->through(function ($blog) {
            return [
            'id' => $blog->id,
            'title' => $blog->title,
            'slug' => $blog->slug,
            'author_name' => $blog->author_name,
            'author_email' => $blog->author_email,
            'user' => $blog->user ? ['name' => $blog->user->name, 'email' => $blog->user->email] : null,
            'status' => $blog->status ?? 'pending',
            'created_at' => $blog->created_at->format('M d, Y'),
            'excerpt' => \Illuminate\Support\Str::limit($blog->excerpt, 100),
            'is_presale' => $blog->is_presale,
            'access_attempts' => $blog->access_attempts,
            ];
        });

        return Inertia::render('Admin/Blogs/Index', [
            'blogs' => $blogs
        ]);
    }

    public function destroyBlog(Blog $blog)
    {
        if (!Auth::user()->is_admin) {
            abort(403);
        }

        if ($blog->image_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($blog->image_path);
        }

        $blog->delete();

        return back()->with('success', 'Studio content deleted successfully.');
    }

    public function approveBlog(Blog $blog)
    {
        if (!Auth::user()->is_admin) {
            abort(403);
        }

        $blog->update([
            'status' => 'approved',
            'is_published' => true,
            'published_at' => now(),
        ]);

        return back()->with('success', 'Blog approved and published.');
    }

    public function rejectBlog(Blog $blog)
    {
        if (!Auth::user()->is_admin) {
            abort(403);
        }

        // Option 1: Delete
        // $blog->delete();
        // Option 2: Mark Rejected
        $blog->update([
            'status' => 'rejected',
            'is_published' => false,
        ]);

        return back()->with('success', 'Blog marked as rejected.');
    }

    public function adminPresaleDetails(Blog $blog)
    {
        if (!Auth::user()->is_admin) {
            abort(403);
        }

        // Ensure it's a presale blog
        if (!$blog->is_presale) {
        // Technically we could show details for any blog, but bookings are presale specific.
        // If we add bookings for regular blogs later, we can remove this check.
        }

        $bookings = \App\Models\PresaleBooking::where('blog_id', $blog->id)
            ->latest()
            ->get();

        return Inertia::render('Admin/Blogs/PresaleDetails', [
            'blog' => $blog,
            'bookings' => $bookings
        ]);
    }

    public function presaleManagement()
    {
        if (!Auth::user()->is_admin) {
            abort(403);
        }

        $presales = \App\Models\Blog::where('is_presale', true)
            ->withCount('presaleBookings as bookings_count')
            ->latest()
            ->paginate(20)
            ->through(function ($blog) {
            return [
            'id' => $blog->id,
            'title' => $blog->title,
            'author_name' => $blog->author_name,
            'bookings_count' => $blog->bookings_count,
            'access_attempts' => $blog->access_attempts,
            'status' => $blog->status,
            'created_at' => $blog->created_at->format('M d, Y'),
            ];
        });

        return Inertia::render('Admin/Presales/Index', [
            'presales' => $presales
        ]);
    }
}
