<?php

namespace App\Http\Controllers;

use App\Models\ProfessionalServiceRequest;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use App\Mail\ProfessionalRequestStatusUpdated;
use Inertia\Inertia;

class ProfessionalServiceController extends Controller
{
    protected $phonePeService;

    public function __construct(\App\Services\Payment\PhonePeService $phonePeService)
    {
        $this->phonePeService = $phonePeService;
    }

    /**
     * Service pricing
     */
    private const PRICES = [
        'formatting' => 1999,
        'cover' => 499,
        'full_package' => 2299,
    ];

    /**
     * Show payment gateway for professional service
     * For Cover: Direct payment
     * For Formatting/Full Package: Redirect to upload first
     */
    public function showPayment(Request $request, Book $book)
    {
        $serviceType = $request->query('service', 'formatting');
        $price = self::PRICES[$serviceType] ?? 1999;

        // For Formatting or Full Package: Upload manuscript first
        if ($serviceType === 'formatting' || $serviceType === 'full_package') {
            return Inertia::render('Books/ProfessionalUploadFirst', [
                'book' => $book,
                'serviceType' => $serviceType,
                'price' => $price,
            ]);
        }

        // For Cover Design: Direct to payment
        return Inertia::render('Books/ProfessionalPayment', [
            'book' => $book,
            'serviceType' => $serviceType,
            'price' => $price,
        ]);
    }

    /**
     * Handle manuscript upload first (before payment)
     */
    public function uploadFirst(Request $request, Book $book)
    {
        $request->validate([
            // Laravel 'max' is in KB → 1 GB = 1,048,576 KB
            'manuscript' => 'required|file|mimes:doc,docx,pdf|max:51200',
            'notes' => 'nullable|string|max:2000',
            'service_type' => 'required|in:formatting,full_package',
        ]);

        $serviceType = $request->service_type;
        $price = self::PRICES[$serviceType] ?? 1999;

        // Store the manuscript file
        $path = $request->file('manuscript')->store('professional-manuscripts', 'public');

        // Create service request with manuscript (pending payment)
        $serviceRequest = ProfessionalServiceRequest::create([
            'user_id' => Auth::id(),
            'book_id' => $book->id,
            'service_type' => $serviceType,
            'amount' => $price,
            'payment_id' => null,
            'status' => 'pending', // Will update after payment
            'manuscript_file' => $path,
            'user_notes' => $request->notes,
        ]);

        // Redirect to payment page with the request ID
        return Inertia::render('Books/ProfessionalPayment', [
            'book' => $book,
            'serviceType' => $serviceType,
            'price' => $price,
            'serviceRequestId' => $serviceRequest->id,
            'manuscriptUploaded' => true,
        ]);
    }

    /**
     * Process payment and create service request
     */
    public function processPayment(Request $request, Book $book)
    {
        $request->validate([
            'service_type' => 'required|in:formatting,cover,full_package',
            'payment_method' => 'required|string',
            'service_request_id' => 'nullable|integer|exists:professional_service_requests,id',
        ]);

        $serviceType = $request->service_type;
        $amount = self::PRICES[$serviceType] ?? 1999;

        // Check if we have an existing service request (from upload-first flow)
        if ($request->service_request_id) {
            $serviceRequest = ProfessionalServiceRequest::findOrFail($request->service_request_id);

            // Verify ownership
            if ($serviceRequest->user_id !== Auth::id()) {
                abort(403, 'Unauthorized');
            }
        } else {
            // For COVER DESIGN: Create new service request directly
            $serviceRequest = ProfessionalServiceRequest::create([
                'user_id' => Auth::id(),
                'book_id' => $book->id,
                'service_type' => $serviceType,
                'amount' => $amount,
                'payment_id' => null,
                'status' => 'pending',
            ]);
        }

        $txnId = 'PRO_' . $serviceRequest->id;

        // --- BYPASS LOGIC FOR TEST DOMAINS ---
        // SECURITY: payment bypass is allowed ONLY in the local dev environment,
        // never based on a client-supplied Host header (was Host-spoofable).
        $isTestDomain = app()->environment('local');
        
        if ($isTestDomain) {
            \Illuminate\Support\Facades\Log::info('Bypassing Professional Service payment (local dev environment)');
            
            $nextStatus = ($serviceRequest->service_type !== 'cover') ? 'pending_upload' : 'pending';
            $serviceRequest->update(['status' => $nextStatus, 'payment_id' => $txnId]);
            
            return redirect()->route('professional.success', $serviceRequest->id);
        }

        // Initiate PhonePe Payment
        $callbackUrl = route('payment.phonepe.callback');
        $redirectUrl = route('payment.phonepe.redirect');

        $response = $this->phonePeService->initiatePayment(
            $txnId,
            $amount,
            $callbackUrl,
            $redirectUrl,
            Auth::id(),
            Auth::user()->mobile_number ?? '9999999999'
        );

        if ($response['success']) {
            return Inertia::location($response['url']);
        }

        return back()->with('error', 'Payment Initiation Failed: ' . ($response['message'] ?? 'Unknown error'));
    }

    /**
     * Show success page after payment
     */
    public function showSuccess(ProfessionalServiceRequest $serviceRequest)
    {
        // Ensure user owns this request
        if ($serviceRequest->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('Professional/Success', [
            'serviceRequest' => $serviceRequest->load(['book', 'user']),
        ]);
    }

    /**
     * Show upload page after payment
     */
    public function showUpload(ProfessionalServiceRequest $serviceRequest)
    {
        // Ensure user owns this request
        if ($serviceRequest->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('Books/ProfessionalUpload', [
            'serviceRequest' => $serviceRequest->load('book'),
        ]);
    }

    /**
     * Handle manuscript upload
     */
    public function uploadManuscript(Request $request, ProfessionalServiceRequest $serviceRequest)
    {
        // Ensure user owns this request
        if ($serviceRequest->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            // Laravel 'max' is in KB → 1 GB = 1,048,576 KB
            'manuscript' => 'required|file|mimes:doc,docx,pdf|max:51200',
            'notes' => 'nullable|string|max:2000',
        ]);

        // Store the manuscript file
        $path = $request->file('manuscript')->store('professional-manuscripts', 'public');

        // Update service request
        $serviceRequest->update([
            'manuscript_file' => $path,
            'user_notes' => $request->notes,
            'status' => 'pending', // Now awaiting admin review
        ]);

        return redirect()->route('dashboard')
            ->with('success', 'Manuscript uploaded successfully! Our team will start working on it.');
    }

    /**
     * Get user's service requests for dashboard
     */
    public static function getUserRequests()
    {
        if (!Auth::check()) {
            return collect([]);
        }

        return ProfessionalServiceRequest::where('user_id', Auth::id())
            ->with('book')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (ProfessionalServiceRequest $request) {
                return [
                    'id' => $request->id,
                    'service_type' => $request->service_type,
                    'service_name' => $request->getServiceDisplayName(),
                    'status' => $request->status,
                    'status_badge' => $request->getStatusBadge(),
                    'amount' => $request->amount,
                    'book_title' => $request->book?->title ?? 'No book linked',
                    'formatted_file' => $request->formatted_file,
                    'created_at' => $request->created_at->format('M d, Y'),
                    'completed_at' => $request->completed_at?->format('M d, Y'),
                ];
            });
    }

    // ===================== ADMIN METHODS =====================

    /**
     * Show all professional service requests (Admin)
     */
    public function adminIndex(Request $request)
    {
        $status = $request->query('status', 'all');

        $query = ProfessionalServiceRequest::with(['user', 'book', 'assignedAdmin'])
            ->orderBy('created_at', 'desc');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $requests = $query->paginate(20);

        return Inertia::render('Admin/ProfessionalRequests', [
            'requests' => $requests,
            'currentStatus' => $status,
            'stats' => [
                'pending' => ProfessionalServiceRequest::where('status', 'pending')->count(),
                'in_progress' => ProfessionalServiceRequest::where('status', 'in_progress')->count(),
                'completed' => ProfessionalServiceRequest::where('status', 'completed')->count(),
            ],
        ]);
    }

    /**
     * View single request details (Admin)
     */
    public function adminShow(ProfessionalServiceRequest $serviceRequest)
    {
        return Inertia::render('Admin/ProfessionalRequestDetails', [
            'serviceRequest' => $serviceRequest->load(['user', 'book', 'assignedAdmin']),
        ]);
    }

    /**
     * Update request status (Admin)
     */
    public function adminUpdateStatus(Request $request, ProfessionalServiceRequest $serviceRequest)
    {
        $request->validate([
            'status' => 'required|in:pending,in_progress,completed,cancelled',
            'admin_notes' => 'nullable|string|max:2000',
        ]);

        $updateData = [
            'status' => $request->status,
            'admin_notes' => $request->admin_notes,
        ];

        // If marking as in_progress, assign to current admin
        if ($request->status === 'in_progress' && !$serviceRequest->assigned_to) {
            $updateData['assigned_to'] = Auth::id();
        }

        // If marking as completed, set completion timestamp
        if ($request->status === 'completed') {
            $updateData['completed_at'] = now();
        }

        $serviceRequest->update($updateData);

        // Send Email Notification
        try {
            Mail::to($serviceRequest->user)->send(
                new ProfessionalRequestStatusUpdated($serviceRequest, $request->admin_notes)
            );
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send status update email: ' . $e->getMessage());
        }

        return back()->with('success', 'Status updated successfully!');
    }

    /**
     * Upload completed formatted file (Admin)
     */
    public function adminUploadFormatted(Request $request, ProfessionalServiceRequest $serviceRequest)
    {
        $request->validate([
            // Laravel 'max' is in KB → 1 GB = 1,048,576 KB
            'formatted_file' => 'required|file|mimes:doc,docx,pdf|max:51200',
        ]);

        // Store the formatted file
        $path = $request->file('formatted_file')->store('professional-formatted', 'public');

        // Delete old file if exists
        if ($serviceRequest->formatted_file) {
            Storage::disk('public')->delete($serviceRequest->formatted_file);
        }

        $serviceRequest->update([
            'formatted_file' => $path,
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // Send Email Notification
        try {
            Mail::to($serviceRequest->user)->send(
                new ProfessionalRequestStatusUpdated($serviceRequest, "Your formatted file is ready for download.")
            );
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send completion email: ' . $e->getMessage());
        }

        return back()->with('success', 'Formatted file uploaded and request marked as completed!');
    }

    /**
     * Download manuscript file (Admin)
     */
    public function downloadManuscript(ProfessionalServiceRequest $serviceRequest)
    {
        if (!$serviceRequest->manuscript_file) {
            abort(404, 'No manuscript file found');
        }

        $path = Storage::disk('public')->path($serviceRequest->manuscript_file);
        return response()->download($path);
    }

    /**
     * Download formatted file (User or Admin)
     */
    public function downloadFormatted(ProfessionalServiceRequest $serviceRequest)
    {
        // User can only download their own completed files
        // 'admin' is not a role in this app (they are super_admin / editor),
        // so this check never matched and admins could never download.
        if (!Auth::user()->is_admin && $serviceRequest->user_id !== Auth::id()) {
            abort(403);
        }

        if (!$serviceRequest->formatted_file) {
            abort(404, 'No formatted file found');
        }

        $path = Storage::disk('public')->path($serviceRequest->formatted_file);
        return response()->download($path);
    }
}
