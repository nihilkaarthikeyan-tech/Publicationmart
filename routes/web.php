<?php

/*
|--------------------------------------------------------------------------
| Public routes — no login required
|--------------------------------------------------------------------------
| This file holds everything a visitor can reach. The other audiences each
| have their own file, loaded at the bottom:
|
|   routes/author.php — the logged-in author area (/dashboard, /books/…)
|   routes/admin.php  — the admin desk (/admin/…)
|   routes/agent.php  — the support-agent portal (/agent/…)
|   routes/auth.php   — login / register / password reset
|
| Route names and URIs are the public contract — pages call route('…') by
| name — so moving a route between files is safe, renaming one is not.
*/

use App\Http\Controllers\Api\StockImageController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\Books\BookStoreController;
use App\Http\Controllers\ChallengeController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\GuestSmartWriterController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PresaleBookingController;
use App\Http\Controllers\PublishingInquiryController;
use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ── Landing page ─────────────────────────────────────────────────────────────
Route::get('/', function () {
    // Cached 30 minutes so every visitor doesn't hit the database.
    $featuredBooks = \Illuminate\Support\Facades\Cache::remember('homepage_featured_books', 1800, function () {
        return \App\Models\Book::where('step_completed', '>=', 5)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get(['id', 'title', 'author_name', 'created_at']);
    });

    $platformStats = \Illuminate\Support\Facades\Cache::remember('homepage_stats', 1800, function () {
        return [
            'publishedBooks' => \App\Models\Book::where('step_completed', '>=', 5)->count(),
            'totalAuthors' => \App\Models\User::count(),
        ];
    });

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'featuredBooks' => $featuredBooks,
        'platformStats' => $platformStats,
    ]);
})->name('welcome');

// ── SEO ──────────────────────────────────────────────────────────────────────
Route::get('/sitemap.xml', [SitemapController::class, 'index']);

// ── Static pages ─────────────────────────────────────────────────────────────
// The About page's edition history quotes real figures from the register,
// cached like the landing page's so it costs nothing per visitor.
Route::get('/about', function () {
    $stats = \Illuminate\Support\Facades\Cache::remember('about_house_stats', 1800, fn () => [
        'publishedBooks' => \App\Models\Book::where('step_completed', '>=', 5)->count(),
        'titlesInStore' => \App\Models\Book::where('status', 'approved')->count(),
        'totalAuthors' => \App\Models\User::count(),
    ]);

    return Inertia::render('About', ['houseStats' => $stats]);
})->name('about');
Route::get('/contact', fn () => Inertia::render('Contact'))->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store')->middleware('throttle:5,1');
Route::get('/how-to-publish', fn () => Inertia::render('HowToPublish'))->name('how-to-publish');
Route::get('/royalties-calculator', fn () => Inertia::render('RoyaltyCalculator'))->name('royalties.calculator');
Route::get('/services', fn () => Inertia::render('Services'))->name('services');
Route::get('/resources', fn () => Inertia::render('Resources'))->name('resources');
Route::get('/help-center', fn () => Inertia::render('Resources'))->name('help-center'); // reuses Resources for now
Route::get('/privacy-policy', fn () => Inertia::render('PrivacyPolicy'))->name('privacy-policy');
Route::get('/terms', fn () => Inertia::render('TermsOfService'))->name('terms');
Route::get('/terms-and-conditions', fn () => Inertia::render('TermsOfService'))->name('terms-and-conditions');
Route::get('/careers', fn () => Inertia::render('Services/Careers'))->name('careers');

// ── Managed service pages ────────────────────────────────────────────────────
Route::get('/services/cover-page-designer', fn () => Inertia::render('Services/CoverPageDesigner'))->name('services.cover-designer');
Route::get('/services/ebook-and-print-publishing', fn () => Inertia::render('Services/EbookPrintPublishing'))->name('services.ebook-print');
Route::get('/services/isbn-and-global-distribution', fn () => Inertia::render('Services/IsbnDistribution'))->name('services.isbn-distribution');
Route::get('/services/diy-formatting-tool', fn () => Inertia::render('Services/FormattingTool'))->name('services.formatting-tool');

// ── Publishing inquiry (premium suite form) ──────────────────────────────────
Route::get('/publishing-inquiry', [PublishingInquiryController::class, 'create'])->name('publishing-inquiry.create');
Route::post('/publishing-inquiry', [PublishingInquiryController::class, 'store'])->name('publishing-inquiry.store')->middleware('throttle:5,1');

// ── Studio (public blog) ─────────────────────────────────────────────────────
Route::get('/studio', [BlogController::class, 'index'])->name('blogs.index');
Route::get('/studio/create', [BlogController::class, 'create'])->name('blogs.create');
Route::post('/studio', [BlogController::class, 'store'])->name('blogs.store')->middleware('throttle:5,1');
Route::get('/studio/{slug}', [BlogController::class, 'show'])->name('blogs.show');
Route::post('/studio/{blog}/presale/book', [PresaleBookingController::class, 'store'])->name('blogs.presale.book')->middleware('throttle:10,1');
Route::get('/api/studio/presale/captcha', [PresaleBookingController::class, 'generateCaptcha'])->name('blogs.presale.captcha');
Route::post('/api/studio/presale/otp', [PresaleBookingController::class, 'sendOtp'])->name('blogs.presale.otp')->middleware('throttle:5,1');

// ── Challenges (guests can enrol) ────────────────────────────────────────────
Route::get('/challenges', [ChallengeController::class, 'index'])->name('challenges.index');
Route::post('/challenges', [ChallengeController::class, 'store'])->name('challenges.store');
Route::get('/challenges/{enrollment}/success', [ChallengeController::class, 'success'])->name('challenges.success');

// ── Smart Writer (guest AI writing, no login) ────────────────────────────────
Route::get('/smart-writer', [GuestSmartWriterController::class, 'pricing'])->name('guest-writer.pricing');
Route::get('/smart-writer/setup', [GuestSmartWriterController::class, 'setup'])->name('guest-writer.setup');
Route::get('/smart-writer/payment', [GuestSmartWriterController::class, 'payment'])->name('guest-writer.payment');
Route::post('/smart-writer/pay', [GuestSmartWriterController::class, 'processPayment'])->name('guest-writer.process-payment');
Route::get('/smart-writer/studio/{token}', [GuestSmartWriterController::class, 'studio'])->name('guest-writer.studio');
Route::post('/smart-writer/studio/{token}/save', [GuestSmartWriterController::class, 'save'])->name('guest-writer.save');
Route::get('/smart-writer/export/{token}', [GuestSmartWriterController::class, 'export'])->name('guest-writer.export');
Route::get('/smart-writer/success/{token}', [GuestSmartWriterController::class, 'success'])->name('guest-writer.success');
Route::get('/smart-writer/link-account', [GuestSmartWriterController::class, 'linkToUser'])->middleware('auth')->name('guest-writer.link');
Route::post('/smart-writer/generate-outline', [GuestSmartWriterController::class, 'generateOutline'])->name('guest-writer.generate-outline');
Route::post('/smart-writer/generate-sections', [GuestSmartWriterController::class, 'generateSections'])->name('guest-writer.generate-sections');
Route::post('/smart-writer/write-section', [GuestSmartWriterController::class, 'generateSectionContent'])->name('guest-writer.write-section');
Route::post('/smart-writer/generate-image', [GuestSmartWriterController::class, 'generateImage'])->name('guest-writer.generate-image');
Route::get('/smart-writer/download-book/{session_token}/{format}', [GuestSmartWriterController::class, 'downloadBook'])->name('guest-writer.download-book');

// ── Book store ───────────────────────────────────────────────────────────────
Route::get('/book-store', [BookStoreController::class, 'index'])->name('book-store.index');
Route::get('/book-store/{book}', [BookStoreController::class, 'show'])->name('book-store.show');
Route::get('/cart/{book}', [BookStoreController::class, 'cart'])->name('cart.show');
Route::post('/cart/checkout', [BookStoreController::class, 'checkout'])->middleware('auth')->name('cart.checkout');

// ── Payments (gateway pages + PhonePe callbacks) ─────────────────────────────
Route::get('/payment/checkout/{book}', [PaymentController::class, 'checkout'])->name('payment.checkout');
Route::post('/payment/process/{book}', [PaymentController::class, 'processPayment'])->name('payment.process');
Route::get('/payment/success', [PaymentController::class, 'paymentSuccess'])->name('payment.success');
Route::get('/payment/failure', [PaymentController::class, 'paymentFailure'])->name('payment.failure');
Route::any('/payment/phonepe/redirect', [PaymentController::class, 'handlePhonePeRedirect'])->name('payment.phonepe.redirect'); // user returns here
Route::any('/payment/phonepe/callback', [PaymentController::class, 'handlePhonePeCallback'])->name('payment.phonepe.callback'); // S2S webhook

// ── Public APIs ──────────────────────────────────────────────────────────────
Route::get('/api/stock-images/search', [StockImageController::class, 'search'])->name('api.stock-images.search');
// Throttled: public endpoint, otherwise coupon codes can be brute-forced.
Route::post('/api/coupons/verify', [CouponController::class, 'verify'])->name('coupons.verify')->middleware('throttle:10,1');

// ── The other audiences ──────────────────────────────────────────────────────
require __DIR__ . '/author.php';
require __DIR__ . '/admin.php';
require __DIR__ . '/agent.php';
require __DIR__ . '/auth.php';
