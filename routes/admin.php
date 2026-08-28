<?php

/*
|--------------------------------------------------------------------------
| Admin desk — requires login + verified email + admin role
|--------------------------------------------------------------------------
| One group, one URL prefix (/admin), one name prefix (admin.).
| Every route the admin middleware protects lives here and nowhere else.
*/

use App\Http\Controllers\Admin\AdminCertificateController;
use App\Http\Controllers\Admin\AdministratorController;
use App\Http\Controllers\Admin\DiscountController;
use App\Http\Controllers\Admin\SupportTicketAdminController;
use App\Http\Controllers\ChallengeController;
use App\Http\Controllers\ProfessionalServiceController;
use App\Http\Controllers\PublishingInquiryController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {

    Route::get('/dashboard', [AdministratorController::class, 'dashboard'])->name('dashboard');

    // ── Admin publication flow ───────────────────────────────────────────────
    Route::get('/books/create', [AdministratorController::class, 'createBook'])->name('books.create');
    Route::post('/books', [AdministratorController::class, 'storeBook'])->name('books.store');
    Route::get('/books/{book}/design', [AdministratorController::class, 'designBook'])->name('books.design');
    Route::post('/books/{book}/design', [AdministratorController::class, 'updateDesignBook'])->name('books.design.update');

    // ── Book management (includes publishing to Amazon/Google) ───────────────
    Route::get('/books', [AdministratorController::class, 'books'])->name('books.index');
    Route::get('/books/{book}', [AdministratorController::class, 'show'])->name('books.show');
    Route::put('/books/{book}', [AdministratorController::class, 'update'])->name('books.update');
    Route::get('/approvals', [AdministratorController::class, 'approvals'])->name('approvals.index');
    Route::post('/books/{book}/approve', [AdministratorController::class, 'approve'])->name('books.approve');
    Route::post('/books/{book}/request-revision', [AdministratorController::class, 'requestRevision'])->name('books.request-revision');
    Route::post('/books/{book}/upload-file', [AdministratorController::class, 'uploadFile'])->name('books.upload-file');
    Route::delete('/books/{book}', [AdministratorController::class, 'destroy'])->name('books.destroy');
    Route::get('/books/{book}/preview-manuscript', [AdministratorController::class, 'previewManuscript'])->name('books.preview-manuscript');
    Route::get('/books/{book}/download-manuscript', [AdministratorController::class, 'downloadManuscript'])->name('books.download-manuscript');

    // ── Users & admins ───────────────────────────────────────────────────────
    Route::get('/users', [AdministratorController::class, 'users'])->name('users.index');
    Route::get('/users/{user}/dashboard', [AdministratorController::class, 'userDashboard'])->name('users.dashboard');
    Route::get('/admins', [AdministratorController::class, 'admins'])->name('admins.index');
    Route::get('/admins/{admin}/dashboard', [AdministratorController::class, 'adminDashboard'])->name('admins.dashboard');

    // ── Coupons ──────────────────────────────────────────────────────────────
    Route::get('/coupons', [DiscountController::class, 'index'])->name('coupons.index');
    Route::post('/coupons', [DiscountController::class, 'store'])->name('coupons.store');
    Route::delete('/coupons/{coupon}', [DiscountController::class, 'destroy'])->name('coupons.destroy');
    Route::post('/coupons/{coupon}/toggle', [DiscountController::class, 'toggleStatus'])->name('coupons.toggle');

    // ── Publishing inquiries ─────────────────────────────────────────────────
    Route::get('/publishing-inquiries', [PublishingInquiryController::class, 'adminIndex'])->name('publishing-inquiries.index');
    Route::patch('/publishing-inquiries/{inquiry}', [PublishingInquiryController::class, 'adminUpdateStatus'])->name('publishing-inquiries.update');
    Route::delete('/publishing-inquiries/{inquiry}', [PublishingInquiryController::class, 'adminDestroy'])->name('publishing-inquiries.destroy');

    // ── Challenge enrollments & settings ─────────────────────────────────────
    Route::get('/challenge-enrollments', [ChallengeController::class, 'adminIndex'])->name('challenge-enrollments.index');
    Route::patch('/challenge-enrollments/{enrollment}', [ChallengeController::class, 'adminUpdateStatus'])->name('challenge-enrollments.update');
    Route::delete('/challenge-enrollments/{enrollment}', [ChallengeController::class, 'adminDestroy'])->name('challenge-enrollments.destroy');
    Route::get('/challenge-settings', [ChallengeController::class, 'adminSettings'])->name('challenge-settings.index');
    Route::post('/challenge-settings', [ChallengeController::class, 'adminUpdateSettings'])->name('challenge-settings.update');
    Route::delete('/challenge-settings/remove-video', [ChallengeController::class, 'adminRemoveVideo'])->name('challenge-settings.remove-video');

    // ── Studio (blog) approvals & presales ───────────────────────────────────
    Route::get('/studio/submissions', [AdministratorController::class, 'manageBlogs'])->name('blogs.manage');
    Route::post('/studio/{blog}/approve', [AdministratorController::class, 'approveBlog'])->name('blogs.approve');
    Route::post('/studio/{blog}/reject', [AdministratorController::class, 'rejectBlog'])->name('blogs.reject');
    Route::delete('/studio/{blog}', [AdministratorController::class, 'destroyBlog'])->name('blogs.destroy');
    Route::get('/studio/{blog}/presale-bookings', [AdministratorController::class, 'adminPresaleDetails'])->name('blogs.presale-bookings');
    Route::get('/presales', [AdministratorController::class, 'presaleManagement'])->name('presales.index');

    // ── Professional service requests ────────────────────────────────────────
    Route::get('/professional-requests', [ProfessionalServiceController::class, 'adminIndex'])->name('professional.index');
    Route::get('/professional-requests/{serviceRequest}', [ProfessionalServiceController::class, 'adminShow'])->name('professional.show');
    Route::post('/professional-requests/{serviceRequest}/status', [ProfessionalServiceController::class, 'adminUpdateStatus'])->name('professional.update-status');
    Route::post('/professional-requests/{serviceRequest}/upload-formatted', [ProfessionalServiceController::class, 'adminUploadFormatted'])->name('professional.upload-formatted');
    Route::get('/professional-requests/{serviceRequest}/download-manuscript', [ProfessionalServiceController::class, 'downloadManuscript'])->name('professional.download-manuscript');

    // ── Support tickets (admin view) ─────────────────────────────────────────
    Route::prefix('support')->name('support.')->group(function () {
        Route::get('/', [SupportTicketAdminController::class, 'index'])->name('index');
        Route::get('/{ticket}', [SupportTicketAdminController::class, 'show'])->name('show');
        Route::post('/{ticket}/reply', [SupportTicketAdminController::class, 'reply'])->name('reply');
        Route::patch('/{ticket}/status', [SupportTicketAdminController::class, 'updateStatus'])->name('update-status');
        Route::delete('/{ticket}', [SupportTicketAdminController::class, 'destroy'])->name('destroy');
    });

    // ── Certificates ─────────────────────────────────────────────────────────
    // Only the implemented actions — the controller has no create/show/edit/update.
    Route::resource('certificates', AdminCertificateController::class)->only(['index', 'store', 'destroy']);

    // ── Run migrations + clear caches from the browser ───────────────────────
    Route::get('/update-database', function () {
        $output = '<h1>Server Update</h1>';
        try {
            \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
            $output .= '<p style="color:green;">✓ Migrations completed</p>';
        } catch (\Exception $e) {
            $output .= '<p style="color:orange;">⚠ Migrations skipped (likely already applied): ' . $e->getMessage() . '</p>';
        }
        try {
            \Illuminate\Support\Facades\Artisan::call('cache:clear');
            \Illuminate\Support\Facades\Artisan::call('route:clear');
            \Illuminate\Support\Facades\Artisan::call('config:clear');
            \Illuminate\Support\Facades\Artisan::call('view:clear');
            $output .= '<p style="color:green;">✓ All caches cleared (cache, route, config, view)</p>';
        } catch (\Exception $e) {
            $output .= '<p style="color:red;">✗ Cache clearing failed: ' . $e->getMessage() . '</p>';
        }
        $output .= '<br><a href="/admin/dashboard">→ Go back to Dashboard</a>';
        return $output;
    });
});
