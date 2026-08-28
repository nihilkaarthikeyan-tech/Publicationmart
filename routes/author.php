<?php

/*
|--------------------------------------------------------------------------
| Author area — requires login
|--------------------------------------------------------------------------
| Everything a logged-in author can do: their dashboard, the book
| publishing flow, the AI Studio, the formatting tool, professional
| services, support tickets, and their profile.
*/

use App\Http\Controllers\Api\Ai\AiBookStudioController;
use App\Http\Controllers\Api\Ai\BookWriterController;
use App\Http\Controllers\Books\BookController;
use App\Http\Controllers\Books\FormattingToolController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfessionalServiceController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SupportTicketController;
use Illuminate\Support\Facades\Route;

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {

    // ── Book publishing flow ─────────────────────────────────────────────────
    Route::get('/books', [BookController::class, 'index'])->name('books.index');
    Route::get('/publish', [BookController::class, 'create'])->name('books.create');
    Route::post('/books', [BookController::class, 'store'])->name('books.store');
    Route::get('/books/{book}/edit', [BookController::class, 'edit'])->name('books.edit');
    Route::put('/books/{book}/basics', [BookController::class, 'updateBasics'])->name('books.update_basics');
    Route::get('/books/{book}/design', [BookController::class, 'design'])->name('books.design');
    Route::get('/books/{book}/cover-creator', [BookController::class, 'coverCreator'])->name('books.cover-creator');
    Route::post('/books/{book}/save-cover', [BookController::class, 'saveCover'])->name('books.save-cover');
    Route::post('/books/{book}', [BookController::class, 'update'])->name('books.update');
    Route::get('/books/{book}/details', [BookController::class, 'details'])->name('books.details');
    Route::post('/books/{book}/details', [BookController::class, 'updateDetails'])->name('books.update_details');
    Route::get('/books/{book}/review', [BookController::class, 'review'])->name('books.review');
    Route::get('/books/{book}/preview', [BookController::class, 'preview'])->name('books.preview');
    Route::post('/books/{book}/confirm-preview', [BookController::class, 'confirmPreview'])->name('books.confirm-preview');
    Route::post('/books/{book}/publish', [BookController::class, 'publish'])->name('books.publish');
    Route::delete('/books/{book}', [BookController::class, 'destroy'])->name('books.destroy');

    // ── AI Book Studio ───────────────────────────────────────────────────────
    Route::get('/books/{book}/ai-studio', [AiBookStudioController::class, 'index'])->name('books.ai-studio');
    Route::get('/books/{book}/ai-studio/show', [AiBookStudioController::class, 'show'])->name('ai-studio.show');
    Route::get('/books/{book}/ai-studio/pro-pricing', [AiBookStudioController::class, 'proPricing'])->name('ai-studio.pro-pricing');
    Route::get('/books/{book}/ai-studio/premium-pricing', [AiBookStudioController::class, 'premiumPricing'])->name('ai-studio.premium-pricing');
    Route::get('/books/{book}/ai-studio/payment/{plan}/{type}', [AiBookStudioController::class, 'payment'])->name('ai-studio.payment');
    Route::post('/books/{book}/ai-studio/save-plan', [AiBookStudioController::class, 'savePlan'])->name('ai-studio.save-plan');
    Route::post('/books/{book}/ai-studio/outline', [AiBookStudioController::class, 'generateOutline'])->name('ai-studio.outline');
    Route::post('/books/{book}/ai-studio/context', [AiBookStudioController::class, 'updateContext'])->name('ai-studio.context');
    Route::post('/books/{book}/ai-studio/chapters/manual', [AiBookStudioController::class, 'storeManualChapter'])->name('ai-studio.chapters.manual');
    Route::post('/books/ai-studio/chapters/{chapter}/sections', [AiBookStudioController::class, 'generateSections'])->name('ai-studio.sections');
    Route::post('/books/ai-studio/chapters/{chapter}/sections/manual', [AiBookStudioController::class, 'saveManualSections'])->name('ai-studio.sections.manual');
    Route::post('/books/ai-studio/sections/{section}/write', [AiBookStudioController::class, 'writeSection'])->name('ai-studio.write');
    Route::post('/books/ai-studio/sections/{section}/image', [AiBookStudioController::class, 'generateImage'])->name('ai-studio.image');
    Route::get('/books/{book}/ai-studio/download', [AiBookStudioController::class, 'downloadBook'])->name('ai-studio.download');
    Route::post('/books/{book}/ai-studio/submit', [AiBookStudioController::class, 'submitForApproval'])->name('ai-studio.submit');
    Route::get('/ai-studio/start-new', [AiBookStudioController::class, 'startNewSession'])->name('ai-studio.new');

    // Rate-limited: this generic AI helper has no per-book paywall, so cap it
    // to stop it being scripted as a free unlimited AI proxy. (Whether it should
    // require a paid plan at all is a product decision — flagged.)
    Route::post('/ai/generate', [BookWriterController::class, 'generate'])->name('ai.generate')->middleware('throttle:15,1');

    // ── DIY formatting tool ──────────────────────────────────────────────────
    Route::get('/books/{book}/format', [FormattingToolController::class, 'index'])->name('books.format');
    Route::post('/books/{book}/format/save', [FormattingToolController::class, 'save'])->name('books.format.save');
    Route::post('/books/{book}/format/upload', [FormattingToolController::class, 'uploadManuscript'])->name('books.format.upload');
    Route::post('/books/{book}/format/remove', [FormattingToolController::class, 'removeManuscript'])->name('books.format.remove');
    Route::post('/books/{book}/format/upload-image', [FormattingToolController::class, 'uploadImage'])->name('books.format.upload-image');
    Route::match(['get', 'post'], '/books/{book}/format/export', [FormattingToolController::class, 'export'])->name('books.format.export');

    // ── Hire a professional ──────────────────────────────────────────────────
    Route::get('/books/{book}/hire-professional', [ProfessionalServiceController::class, 'showPayment'])->name('professional.payment');
    Route::post('/books/{book}/hire-professional', [ProfessionalServiceController::class, 'processPayment'])->name('professional.process-payment');
    Route::post('/books/{book}/hire-professional/upload-first', [ProfessionalServiceController::class, 'uploadFirst'])->name('professional.upload-first');
    Route::get('/professional/upload/{serviceRequest}', [ProfessionalServiceController::class, 'showUpload'])->name('professional.upload');
    Route::post('/professional/upload/{serviceRequest}', [ProfessionalServiceController::class, 'uploadManuscript'])->name('professional.upload-manuscript');
    Route::get('/professional/download/{serviceRequest}/formatted', [ProfessionalServiceController::class, 'downloadFormatted'])->name('professional.download-formatted');
    Route::get('/professional/success/{serviceRequest}', [ProfessionalServiceController::class, 'showSuccess'])->name('professional.success');

    // ── Author-copies payment ────────────────────────────────────────────────
    Route::get('/payment/author-copies', [PaymentController::class, 'showAuthorCopiesCheckout'])->name('payment.author_copies');
    Route::post('/payment/author-copies/process', [PaymentController::class, 'initiateAuthorCopyPayment'])->name('payment.author_copies.process');

    // ── Profile ──────────────────────────────────────────────────────────────
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ── Manuscript template download ─────────────────────────────────────────
    Route::get('/download-template', function () {
        $path = public_path('templates/template.docx');
        if (!file_exists($path)) {
            abort(404, 'Template not found at: ' . $path);
        }
        return response()->download($path, 'RK publication Template.docx');
    })->name('download.template');
});

// ── Support tickets ──────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->prefix('support')->name('support.')->group(function () {
    Route::get('/', [SupportTicketController::class, 'index'])->name('index');
    Route::get('/create', [SupportTicketController::class, 'create'])->name('create');
    Route::post('/', [SupportTicketController::class, 'store'])->name('store');
    Route::get('/{ticket}', [SupportTicketController::class, 'show'])->name('show');
    Route::post('/{ticket}/reply', [SupportTicketController::class, 'reply'])->name('reply');
    Route::post('/{ticket}/close', [SupportTicketController::class, 'close'])->name('close');
});
