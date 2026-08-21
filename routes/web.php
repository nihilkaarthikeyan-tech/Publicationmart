<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ChallengeController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\Api\StockImageController;
use App\Http\Controllers\PublishingInquiryController;

// (removed public /clear-all-caches-now debug route — use `php artisan` over SSH)

// Dynamic Sitemap (SEO - auto-includes all books & blogs)
Route::get('/sitemap.xml', [\App\Http\Controllers\SitemapController::class , 'index']);

// Static Pages
Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');
Route::get('/contact', function () {
    return Inertia::render('Contact');
})->name('contact');
Route::post('/contact', [\App\Http\Controllers\ContactController::class , 'store'])->name('contact.store');

// Publishing Inquiry Routes (Public - Premium Suite Form)
Route::get('/publishing-inquiry', [PublishingInquiryController::class , 'create'])->name('publishing-inquiry.create');
Route::post('/publishing-inquiry', [PublishingInquiryController::class , 'store'])->name('publishing-inquiry.store');

Route::get('/how-to-publish', function () {
    return Inertia::render('HowToPublish');
})->name('how-to-publish');

Route::get('/royalties-calculator', function () {
    return Inertia::render('RoyaltyCalculator');
})->name('royalties.calculator');

Route::get('/services', function () {
    return Inertia::render('Services');
})->name('services');

Route::get('/resources', function () {
    return Inertia::render('Resources');
})->name('resources');

Route::get('/help-center', function () {
    return Inertia::render('Resources'); // Reusing Resources for now
})->name('help-center');

// Managed Service Pages
Route::get('/services/cover-page-designer', function () {
    return Inertia::render('Services/CoverPageDesigner');
})->name('services.cover-designer');

Route::get('/services/ebook-and-print-publishing', function () {
    return Inertia::render('Services/EbookPrintPublishing');
})->name('services.ebook-print');

Route::get('/services/isbn-and-global-distribution', function () {
    return Inertia::render('Services/IsbnDistribution');
})->name('services.isbn-distribution');

Route::get('/services/diy-formatting-tool', function () {
    return Inertia::render('Services/FormattingTool');
})->name('services.formatting-tool');

Route::get('/careers', function () {
    return Inertia::render('Services/Careers');
})->name('careers');

Route::get('/privacy-policy', function () {
    return Inertia::render('PrivacyPolicy');
})->name('privacy-policy');

Route::get('/terms', function () {
    return Inertia::render('TermsOfService');
})->name('terms');

Route::get('/terms-and-conditions', function () {
    return Inertia::render('TermsOfService');
})->name('terms-and-conditions');

// Blog Routes (Renamed to Studio)
Route::get('/studio', [BlogController::class , 'index'])->name('blogs.index');
Route::get('/studio/create', [BlogController::class , 'create'])->name('blogs.create');
Route::post('/studio', [BlogController::class , 'store'])->name('blogs.store');
Route::get('/studio/{slug}', [BlogController::class , 'show'])->name('blogs.show');
Route::post('/studio/{blog}/presale/book', [\App\Http\Controllers\PresaleBookingController::class , 'store'])->name('blogs.presale.book');
Route::get('/api/studio/presale/captcha', [\App\Http\Controllers\PresaleBookingController::class , 'generateCaptcha'])->name('blogs.presale.captcha');
Route::post('/api/studio/presale/otp', [\App\Http\Controllers\PresaleBookingController::class , 'sendOtp'])->name('blogs.presale.otp');

// (removed public /test-email debug route)

// Challenge Routes (Guest can access)
Route::get('/challenges', [ChallengeController::class , 'index'])->name('challenges.index');
Route::post('/challenges', [ChallengeController::class , 'store'])->name('challenges.store');
// Removed: ChallengeController::payment()/processPayment() were deleted when the
// direct-payment flow replaced the confirmation page. These routes pointed at
// missing methods and returned a server error if reached.
Route::get('/challenges/{enrollment}/success', [ChallengeController::class , 'success'])->name('challenges.success');

// Guest Smart Writer Routes (No login required)
Route::get('/smart-writer', [App\Http\Controllers\GuestSmartWriterController::class , 'pricing'])->name('guest-writer.pricing');
Route::get('/smart-writer/setup', [App\Http\Controllers\GuestSmartWriterController::class , 'setup'])->name('guest-writer.setup');
Route::get('/smart-writer/payment', [App\Http\Controllers\GuestSmartWriterController::class , 'payment'])->name('guest-writer.payment');
Route::post('/smart-writer/pay', [App\Http\Controllers\GuestSmartWriterController::class , 'processPayment'])->name('guest-writer.process-payment');
Route::get('/smart-writer/studio/{token}', [App\Http\Controllers\GuestSmartWriterController::class , 'studio'])->name('guest-writer.studio');
Route::post('/smart-writer/studio/{token}/save', [App\Http\Controllers\GuestSmartWriterController::class , 'save'])->name('guest-writer.save');
Route::get('/smart-writer/export/{token}', [App\Http\Controllers\GuestSmartWriterController::class , 'export'])->name('guest-writer.export');
Route::get('/smart-writer/success/{token}', [App\Http\Controllers\GuestSmartWriterController::class , 'success'])->name('guest-writer.success');
Route::get('/smart-writer/link-account', [App\Http\Controllers\GuestSmartWriterController::class , 'linkToUser'])->middleware('auth')->name('guest-writer.link');

Route::post('/smart-writer/generate-outline', [App\Http\Controllers\GuestSmartWriterController::class , 'generateOutline'])->name('guest-writer.generate-outline');
Route::post('/smart-writer/generate-sections', [App\Http\Controllers\GuestSmartWriterController::class , 'generateSections'])->name('guest-writer.generate-sections');
Route::post('/smart-writer/write-section', [App\Http\Controllers\GuestSmartWriterController::class , 'generateSectionContent'])->name('guest-writer.write-section');
Route::post('/smart-writer/generate-image', [App\Http\Controllers\GuestSmartWriterController::class , 'generateImage'])->name('guest-writer.generate-image');
Route::get('/smart-writer/download-book/{session_token}/{format}', [App\Http\Controllers\GuestSmartWriterController::class , 'downloadBook'])->name('guest-writer.download-book');

Route::get('/', function () {
    // OPTIMIZATION: Cache these queries for 30 minutes (1800 seconds)
    // This prevents hitting the database for every single visitor.

    $featuredBooks = \Illuminate\Support\Facades\Cache::remember('homepage_featured_books', 1800, function () {
            return \App\Models\Book::where('step_completed', '>=', 5)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get(['id', 'title', 'author_name', 'created_at']);
        }
        );

        $platformStats = \Illuminate\Support\Facades\Cache::remember('homepage_stats', 1800, function () {
            return [
            'publishedBooks' => \App\Models\Book::where('step_completed', '>=', 5)->count(),
            'totalAuthors' => \App\Models\User::count(),
            ];
        }
        );

        return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'featuredBooks' => $featuredBooks,
        'platformStats' => $platformStats,
        ]);
    })->name('welcome');

// Stock Image Proxy (Pexels)
Route::get('/api/stock-images/search', [StockImageController::class , 'search'])->name('api.stock-images.search');

Route::get('/dashboard', [App\Http\Controllers\DashboardController::class , 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Book Store Routes (Public)
Route::get('/book-store', [App\Http\Controllers\Books\BookStoreController::class , 'index'])->name('book-store.index');
Route::get('/book-store/{book}', [App\Http\Controllers\Books\BookStoreController::class , 'show'])->name('book-store.show');

// Payment Routes
Route::get('/payment/checkout/{book}', [App\Http\Controllers\PaymentController::class , 'checkout'])->name('payment.checkout');
Route::post('/payment/process/{book}', [App\Http\Controllers\PaymentController::class , 'processPayment'])->name('payment.process');
Route::get('/payment/success', [App\Http\Controllers\PaymentController::class , 'paymentSuccess'])->name('payment.success');
Route::get('/payment/failure', [App\Http\Controllers\PaymentController::class , 'paymentFailure'])->name('payment.failure');

// PhonePe Specific Routes
Route::any('/payment/phonepe/redirect', [App\Http\Controllers\PaymentController::class , 'handlePhonePeRedirect'])->name('payment.phonepe.redirect'); // User returns here
Route::any('/payment/phonepe/callback', [App\Http\Controllers\PaymentController::class , 'handlePhonePeCallback'])->name('payment.phonepe.callback'); // S2S webhook

// Cart Routes
Route::get('/cart/{book}', [App\Http\Controllers\Books\BookStoreController::class , 'cart'])->name('cart.show');
Route::post('/cart/checkout', [App\Http\Controllers\Books\BookStoreController::class , 'checkout'])->middleware('auth')->name('cart.checkout');

// Public Coupon Verification
Route::post('/api/coupons/verify', [App\Http\Controllers\CouponController::class , 'verify'])->name('coupons.verify');


use App\Http\Controllers\Books\BookController; // Import Controller

Route::middleware('auth')->group(function () {
    Route::get('/books', [BookController::class , 'index'])->name('books.index');
    Route::get('/publish', [BookController::class , 'create'])->name('books.create');
    Route::post('/books', [BookController::class , 'store'])->name('books.store');
    Route::get('/books/{book}/edit', [BookController::class , 'edit'])->name('books.edit');
    Route::put('/books/{book}/basics', [BookController::class , 'updateBasics'])->name('books.update_basics');
    Route::get('/books/{book}/design', [BookController::class , 'design'])->name('books.design');
    Route::get('/books/{book}/cover-creator', [BookController::class , 'coverCreator'])->name('books.cover-creator');
    Route::post('/books/{book}/save-cover', [BookController::class , 'saveCover'])->name('books.save-cover');
    Route::post('/books/{book}', [BookController::class , 'update'])->name('books.update');
    Route::get('/books/{book}/details', [BookController::class , 'details'])->name('books.details');
    Route::post('/books/{book}/details', [BookController::class , 'updateDetails'])->name('books.update_details');
    Route::get('/books/{book}/review', [BookController::class , 'review'])->name('books.review');
    Route::get('/books/{book}/preview', [BookController::class , 'preview'])->name('books.preview');
    Route::post('/books/{book}/confirm-preview', [BookController::class , 'confirmPreview'])->name('books.confirm-preview');
    Route::post('/books/{book}/publish', [BookController::class , 'publish'])->name('books.publish');
    Route::delete('/books/{book}', [BookController::class , 'destroy'])->name('books.destroy');

    // AI Book Studio Routes
    Route::get('/books/{book}/ai-studio', [App\Http\Controllers\Api\Ai\AiBookStudioController::class , 'index'])->name('books.ai-studio');
    Route::get('/books/{book}/ai-studio/show', [App\Http\Controllers\Api\Ai\AiBookStudioController::class , 'show'])->name('ai-studio.show');
    Route::get('/books/{book}/ai-studio/pro-pricing', [App\Http\Controllers\Api\Ai\AiBookStudioController::class , 'proPricing'])->name('ai-studio.pro-pricing');
    Route::get('/books/{book}/ai-studio/premium-pricing', [App\Http\Controllers\Api\Ai\AiBookStudioController::class , 'premiumPricing'])->name('ai-studio.premium-pricing');
    Route::get('/books/{book}/ai-studio/payment/{plan}/{type}', [App\Http\Controllers\Api\Ai\AiBookStudioController::class , 'payment'])->name('ai-studio.payment');
    Route::post('/books/{book}/ai-studio/save-plan', [App\Http\Controllers\Api\Ai\AiBookStudioController::class , 'savePlan'])->name('ai-studio.save-plan');
    Route::post('/books/{book}/ai-studio/outline', [App\Http\Controllers\Api\Ai\AiBookStudioController::class , 'generateOutline'])->name('ai-studio.outline');
    Route::post('/books/{book}/ai-studio/context', [App\Http\Controllers\Api\Ai\AiBookStudioController::class , 'updateContext'])->name('ai-studio.context');
    Route::post('/books/{book}/ai-studio/chapters/manual', [App\Http\Controllers\Api\Ai\AiBookStudioController::class , 'storeManualChapter'])->name('ai-studio.chapters.manual');
    Route::post('/books/ai-studio/chapters/{chapter}/sections', [App\Http\Controllers\Api\Ai\AiBookStudioController::class , 'generateSections'])->name('ai-studio.sections');
    Route::post('/books/ai-studio/chapters/{chapter}/sections/manual', [App\Http\Controllers\Api\Ai\AiBookStudioController::class , 'saveManualSections'])->name('ai-studio.sections.manual');
    Route::post('/books/ai-studio/sections/{section}/write', [App\Http\Controllers\Api\Ai\AiBookStudioController::class , 'writeSection'])->name('ai-studio.write');
    Route::post('/books/ai-studio/sections/{section}/image', [App\Http\Controllers\Api\Ai\AiBookStudioController::class , 'generateImage'])->name('ai-studio.image');
    Route::get('/books/{book}/ai-studio/download', [App\Http\Controllers\Api\Ai\AiBookStudioController::class , 'downloadBook'])->name('ai-studio.download');
    Route::post('/books/{book}/ai-studio/submit', [App\Http\Controllers\Api\Ai\AiBookStudioController::class , 'submitForApproval'])->name('ai-studio.submit');
    Route::get('/ai-studio/start-new', [App\Http\Controllers\Api\Ai\AiBookStudioController::class , 'startNewSession'])->name('ai-studio.new');

    // AI Writer Routes
    Route::post('/ai/generate', [App\Http\Controllers\Api\Ai\BookWriterController::class , 'generate'])->name('ai.generate');

    // Admin Routes - Protected by admin middleware
    Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
            Route::get('/dashboard', [App\Http\Controllers\Admin\AdministratorController::class , 'dashboard'])->name('dashboard');

            // Admin Publication Flow
            Route::get('/books/create', [App\Http\Controllers\Admin\AdministratorController::class , 'createBook'])->name('books.create');
            Route::post('/books', [App\Http\Controllers\Admin\AdministratorController::class , 'storeBook'])->name('books.store');
            Route::get('/books/{book}/design', [App\Http\Controllers\Admin\AdministratorController::class , 'designBook'])->name('books.design');
            Route::post('/books/{book}/design', [App\Http\Controllers\Admin\AdministratorController::class , 'updateDesignBook'])->name('books.design.update');

            // Admin Management (includes publishing to Amazon/Google)
            Route::get('/books', [App\Http\Controllers\Admin\AdministratorController::class , 'books'])->name('books.index');
            Route::get('/books/{book}', [App\Http\Controllers\Admin\AdministratorController::class , 'show'])->name('books.show');
            Route::put('/books/{book}', [App\Http\Controllers\Admin\AdministratorController::class , 'update'])->name('books.update');
            Route::get('/approvals', [App\Http\Controllers\Admin\AdministratorController::class , 'approvals'])->name('approvals.index');
            Route::post('/books/{book}/approve', [App\Http\Controllers\Admin\AdministratorController::class , 'approve'])->name('books.approve');
            Route::post('/books/{book}/request-revision', [App\Http\Controllers\Admin\AdministratorController::class , 'requestRevision'])->name('books.request-revision');
            Route::post('/books/{book}/upload-file', [App\Http\Controllers\Admin\AdministratorController::class , 'uploadFile'])->name('books.upload-file');
            Route::delete('/books/{book}', [App\Http\Controllers\Admin\AdministratorController::class , 'destroy'])->name('books.destroy');

            // Admin Manuscript Preview & Download
            Route::get('/books/{book}/preview-manuscript', [App\Http\Controllers\Admin\AdministratorController::class , 'previewManuscript'])->name('books.preview-manuscript');
            Route::get('/books/{book}/download-manuscript', [App\Http\Controllers\Admin\AdministratorController::class , 'downloadManuscript'])->name('books.download-manuscript');

            // User Management Routes
            Route::get('/users', [App\Http\Controllers\Admin\AdministratorController::class , 'users'])->name('users.index');
            Route::get('/users/{user}/dashboard', [App\Http\Controllers\Admin\AdministratorController::class , 'userDashboard'])->name('users.dashboard');

            // Admin Management Routes
            Route::get('/admins', [App\Http\Controllers\Admin\AdministratorController::class , 'admins'])->name('admins.index');
            Route::get('/admins/{admin}/dashboard', [App\Http\Controllers\Admin\AdministratorController::class , 'adminDashboard'])->name('admins.dashboard');

            // Coupon Routes
            Route::get('/coupons', [App\Http\Controllers\Admin\DiscountController::class , 'index'])->name('coupons.index');
            Route::post('/coupons', [App\Http\Controllers\Admin\DiscountController::class , 'store'])->name('coupons.store');
            Route::delete('/coupons/{coupon}', [App\Http\Controllers\Admin\DiscountController::class , 'destroy'])->name('coupons.destroy');
            Route::post('/coupons/{coupon}/toggle', [App\Http\Controllers\Admin\DiscountController::class , 'toggleStatus'])->name('coupons.toggle');

            // Publishing Inquiries Management
            Route::get('/publishing-inquiries', [PublishingInquiryController::class , 'adminIndex'])->name('publishing-inquiries.index');
            Route::patch('/publishing-inquiries/{inquiry}', [PublishingInquiryController::class , 'adminUpdateStatus'])->name('publishing-inquiries.update');
            Route::delete('/publishing-inquiries/{inquiry}', [PublishingInquiryController::class , 'adminDestroy'])->name('publishing-inquiries.destroy');

            // Challenge Enrollments Management
            Route::get('/challenge-enrollments', [App\Http\Controllers\ChallengeController::class , 'adminIndex'])->name('challenge-enrollments.index');
            Route::patch('/challenge-enrollments/{enrollment}', [App\Http\Controllers\ChallengeController::class , 'adminUpdateStatus'])->name('challenge-enrollments.update');
            Route::delete('/challenge-enrollments/{enrollment}', [App\Http\Controllers\ChallengeController::class , 'adminDestroy'])->name('challenge-enrollments.destroy');

            // Challenge Settings (promo video per challenge type)
            Route::get('/challenge-settings', [App\Http\Controllers\ChallengeController::class , 'adminSettings'])->name('challenge-settings.index');
            Route::post('/challenge-settings', [App\Http\Controllers\ChallengeController::class , 'adminUpdateSettings'])->name('challenge-settings.update');
            Route::delete('/challenge-settings/remove-video', [App\Http\Controllers\ChallengeController::class , 'adminRemoveVideo'])->name('challenge-settings.remove-video');

            // Studio Approval Management (Renamed from Blogs)
            Route::get('/studio/submissions', [App\Http\Controllers\Admin\AdministratorController::class , 'manageBlogs'])->name('blogs.manage');
            Route::post('/studio/{blog}/approve', [App\Http\Controllers\Admin\AdministratorController::class , 'approveBlog'])->name('blogs.approve');
            Route::post('/studio/{blog}/reject', [App\Http\Controllers\Admin\AdministratorController::class , 'rejectBlog'])->name('blogs.reject');
            Route::delete('/studio/{blog}', [App\Http\Controllers\Admin\AdministratorController::class , 'destroyBlog'])->name('blogs.destroy');

            // Presale Management
            Route::get('/studio/{blog}/presale-bookings', [App\Http\Controllers\Admin\AdministratorController::class , 'adminPresaleDetails'])->name('blogs.presale-bookings');
            Route::get('/presales', [App\Http\Controllers\Admin\AdministratorController::class , 'presaleManagement'])->name('presales.index');

            // Helper Route to Update Database (Run Migrations) via Browser
            Route::get('/update-database', function () {
                    $output = '<h1>Server Update</h1>';

                    // Run migrations (may fail if already applied)
                    try {
                        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
                        $output .= '<p style="color:green;">✓ Migrations completed</p>';
                    }
                    catch (\Exception $e) {
                        $output .= '<p style="color:orange;">⚠ Migrations skipped (likely already applied): ' . $e->getMessage() . '</p>';
                    }

                    // Clear all caches - this always runs
                    try {
                        \Illuminate\Support\Facades\Artisan::call('cache:clear');
                        \Illuminate\Support\Facades\Artisan::call('route:clear');
                        \Illuminate\Support\Facades\Artisan::call('config:clear');
                        \Illuminate\Support\Facades\Artisan::call('view:clear');
                        $output .= '<p style="color:green;">✓ All caches cleared (cache, route, config, view)</p>';
                    }
                    catch (\Exception $e) {
                        $output .= '<p style="color:red;">✗ Cache clearing failed: ' . $e->getMessage() . '</p>';
                    }

                    $output .= '<br><a href="/admin/dashboard">→ Go back to Dashboard</a>';
                    return $output;
                }
                );

                // Certificate Management Routes
                // Only the implemented actions — the controller has no create/show/edit/update.
                Route::resource('certificates', App\Http\Controllers\Admin\AdminCertificateController::class)
                    ->only(['index', 'store', 'destroy']);
            }
            );

            // Formatting Tool Route
            Route::get('/books/{book}/format', [App\Http\Controllers\Books\FormattingToolController::class , 'index'])->name('books.format');
            Route::post('/books/{book}/format/save', [App\Http\Controllers\Books\FormattingToolController::class , 'save'])->name('books.format.save');
            Route::post('/books/{book}/format/upload', [App\Http\Controllers\Books\FormattingToolController::class , 'uploadManuscript'])->name('books.format.upload');
            Route::post('/books/{book}/format/remove', [App\Http\Controllers\Books\FormattingToolController::class , 'removeManuscript'])->name('books.format.remove');
            Route::post('/books/{book}/format/upload-image', [App\Http\Controllers\Books\FormattingToolController::class , 'uploadImage'])->name('books.format.upload-image');

            Route::match (['get', 'post'], '/books/{book}/format/export', [App\Http\Controllers\Books\FormattingToolController::class , 'export'])->name('books.format.export');
            Route::get('/profile', [ProfileController::class , 'edit'])->name('profile.edit');
            Route::patch('/profile', [ProfileController::class , 'update'])->name('profile.update');
            Route::delete('/profile', [ProfileController::class , 'destroy'])->name('profile.destroy');

            // Download Template Route
            Route::get('/download-template', function () {
            $path = public_path('templates/template.docx');
            if (!file_exists($path))
                abort(404, 'Template not found at: ' . $path);
            return response()->download($path, 'RK publication Template.docx');
        }
        )->name('download.template');
    });


// Payment Routes
Route::get('/payment/author-copies', [\App\Http\Controllers\PaymentController::class , 'showAuthorCopiesCheckout'])
    ->name('payment.author_copies')
    ->middleware(['auth']);

Route::post('/payment/author-copies/process', [\App\Http\Controllers\PaymentController::class , 'initiateAuthorCopyPayment'])
    ->name('payment.author_copies.process')
    ->middleware(['auth']);

// Professional Service Routes (Hire a Professional)
Route::middleware('auth')->group(function () {
    Route::get('/books/{book}/hire-professional', [App\Http\Controllers\ProfessionalServiceController::class , 'showPayment'])->name('professional.payment');
    Route::post('/books/{book}/hire-professional', [App\Http\Controllers\ProfessionalServiceController::class , 'processPayment'])->name('professional.process-payment');
    Route::post('/books/{book}/hire-professional/upload-first', [App\Http\Controllers\ProfessionalServiceController::class , 'uploadFirst'])->name('professional.upload-first');
    Route::get('/professional/upload/{serviceRequest}', [App\Http\Controllers\ProfessionalServiceController::class , 'showUpload'])->name('professional.upload');
    Route::post('/professional/upload/{serviceRequest}', [App\Http\Controllers\ProfessionalServiceController::class , 'uploadManuscript'])->name('professional.upload-manuscript');
    Route::get('/professional/download/{serviceRequest}/formatted', [App\Http\Controllers\ProfessionalServiceController::class , 'downloadFormatted'])->name('professional.download-formatted');
    Route::get('/professional/success/{serviceRequest}', [App\Http\Controllers\ProfessionalServiceController::class , 'showSuccess'])->name('professional.success');
});

// Admin Professional Service Routes
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/professional-requests', [App\Http\Controllers\ProfessionalServiceController::class , 'adminIndex'])->name('professional.index');
    Route::get('/professional-requests/{serviceRequest}', [App\Http\Controllers\ProfessionalServiceController::class , 'adminShow'])->name('professional.show');
    Route::post('/professional-requests/{serviceRequest}/status', [App\Http\Controllers\ProfessionalServiceController::class , 'adminUpdateStatus'])->name('professional.update-status');
    Route::post('/professional-requests/{serviceRequest}/upload-formatted', [App\Http\Controllers\ProfessionalServiceController::class , 'adminUploadFormatted'])->name('professional.upload-formatted');
    Route::get('/professional-requests/{serviceRequest}/download-manuscript', [App\Http\Controllers\ProfessionalServiceController::class , 'downloadManuscript'])->name('professional.download-manuscript');
});

// ─── Support Ticket Routes (Users) ───────────────────────────────────────────
Route::middleware(['auth', 'verified'])->prefix('support')->name('support.')->group(function () {
    Route::get('/',                              [App\Http\Controllers\SupportTicketController::class, 'index'])->name('index');
    Route::get('/create',                        [App\Http\Controllers\SupportTicketController::class, 'create'])->name('create');
    Route::post('/',                             [App\Http\Controllers\SupportTicketController::class, 'store'])->name('store');
    Route::get('/{ticket}',                      [App\Http\Controllers\SupportTicketController::class, 'show'])->name('show');
    Route::post('/{ticket}/reply',               [App\Http\Controllers\SupportTicketController::class, 'reply'])->name('reply');
    Route::post('/{ticket}/close',               [App\Http\Controllers\SupportTicketController::class, 'close'])->name('close');
});

// ─── Support Ticket Routes (Admin — kept for backward compat) ─────────────────
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin/support')->name('admin.support.')->group(function () {
    Route::get('/',                              [App\Http\Controllers\Admin\SupportTicketAdminController::class, 'index'])->name('index');
    Route::get('/{ticket}',                      [App\Http\Controllers\Admin\SupportTicketAdminController::class, 'show'])->name('show');
    Route::post('/{ticket}/reply',               [App\Http\Controllers\Admin\SupportTicketAdminController::class, 'reply'])->name('reply');
    Route::patch('/{ticket}/status',             [App\Http\Controllers\Admin\SupportTicketAdminController::class, 'updateStatus'])->name('update-status');
    Route::delete('/{ticket}',                   [App\Http\Controllers\Admin\SupportTicketAdminController::class, 'destroy'])->name('destroy');
});

// ─── Support Agent Portal (Role-Based — same login as everyone else) ──────────
Route::middleware(['auth', 'support_agent'])->prefix('agent')->name('agent.')->group(function () {
    Route::get('/dashboard',                 [App\Http\Controllers\SupportAgent\TicketController::class, 'index'])->name('dashboard');
    Route::get('/tickets/{ticket}',          [App\Http\Controllers\SupportAgent\TicketController::class, 'show'])->name('tickets.show');
    Route::post('/tickets/{ticket}/reply',   [App\Http\Controllers\SupportAgent\TicketController::class, 'reply'])->name('tickets.reply');
    Route::patch('/tickets/{ticket}/status', [App\Http\Controllers\SupportAgent\TicketController::class, 'updateStatus'])->name('tickets.status');
});


require __DIR__ . '/auth.php';

