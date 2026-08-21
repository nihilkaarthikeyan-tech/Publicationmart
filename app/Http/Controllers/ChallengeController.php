<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ChallengeEnrollment;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChallengeController extends Controller
{
    protected $phonePeService;

    public function __construct(\App\Services\Payment\PhonePeService $phonePeService)
    {
        $this->phonePeService = $phonePeService;
    }

    /**
     * Show the challenge enrollment form
     */
    public function index()
    {
        return Inertia::render('Challenges/Index');
    }

    /**
     * Store enrollment and redirect to payment
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'challenge_type' => 'required|string|in:Poetry Challenge,Story Challenge,Academic Challenge',
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'mobile_number' => 'required|string|max:20',
            'city' => 'required|string|max:100',
            'coupon_code' => 'nullable|string|max:20',
        ]);

        // Calculate entry fee with coupon discount
        $entryFee = 1999;
        $appliedCouponCode = null;

        if (!empty($validated['coupon_code'])) {
            $coupon = Coupon::where('code', strtoupper($validated['coupon_code']))->where('is_active', true)->first();
            if ($coupon) {
                $discount = ($entryFee * $coupon->discount_percentage) / 100;
                $entryFee = max(0, round($entryFee - $discount));
                $appliedCouponCode = $coupon->code;
            }
        }

        // Create enrollment with pending status
        $enrollment = ChallengeEnrollment::create([
            'user_id' => auth()->id(),
            'challenge_type' => $validated['challenge_type'],
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'mobile_number' => $validated['mobile_number'],
            'city' => $validated['city'],
            'entry_fee' => $entryFee,
            'coupon_code' => $appliedCouponCode,
            'payment_status' => 'pending'
        ]);

        // Direct Payment Initiation (Skip Payment Confirmation Page)
        $txnId = 'CHAL_' . $enrollment->id . '_' . time();
        $amount = $entryFee;

        // --- BYPASS LOGIC FOR TEST DOMAINS ---
        $host = request()->getHost();
        $isTestDomain = str_contains($host, 'radinfotec') || str_contains($host, 'localhost') || $host === '127.0.0.1';
        
        if ($isTestDomain) {
            \Illuminate\Support\Facades\Log::info('Bypassing Challenge payment for test domain: ' . $host);
            
            $enrollment->update(['payment_status' => 'paid']);
            return redirect()->route('challenges.success', ['enrollment' => $enrollment->id]);
        }

        $callbackUrl = route('payment.phonepe.callback');
        $redirectUrl = route('payment.phonepe.redirect');

        // Store transaction ID in session for fallback retrieval on redirect
        session(['pending_payment_txn_id' => $txnId]);

        $response = $this->phonePeService->initiatePayment(
            $txnId,
            $amount,
            $callbackUrl,
            $redirectUrl,
            $enrollment->user_id,
            $enrollment->mobile_number
        );

        if ($response['success']) {
            return Inertia::location($response['url']);
        }

        // If gateway fails, redirect BACK TO FORM to show error
        return back()->with('error', 'Payment Initiation Failed: ' . ($response['message'] ?? 'Unknown Error'));
    }

    // 'payment' method removed - Direct Flow enforced.

    // 'processPayment' method removed - Logic moved to store()

    /**
     * Show success page with login prompt
     */
    public function success(ChallengeEnrollment $enrollment)
    {
        // If not marked paid yet, it might be a race condition or failed payment.
        // Since we removed the 'payment' page, we redirect to index if strictly not paid,
        // OR allow viewing if it's the user who just tried.

        if ($enrollment->payment_status !== 'paid') {
            // Optional: Check with PhonePe one last time if needed, or:
            return redirect()->route('challenges.index')->with('error', 'Payment not confirmed yet. Please checking back in a few moments.');
        }

        return Inertia::render('Challenges/Success', [
            'enrollment' => $enrollment,
        ]);
    }

    // ─── Admin Methods ────────────────────────────────────────────

    /**
     * Admin: List all challenge enrollments with filters
     */
    public function adminIndex(Request $request)
    {
        $query = ChallengeEnrollment::query()->latest();

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('payment_status', $request->status);
        }

        if ($request->has('challenge_type') && $request->challenge_type !== 'all') {
            $query->where('challenge_type', $request->challenge_type);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('mobile_number', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        return Inertia::render('Admin/ChallengeEnrollments', [
            'enrollments' => $query->paginate(15)->withQueryString(),
            'filters' => [
                'status' => $request->status ?? 'all',
                'challenge_type' => $request->challenge_type ?? 'all',
                'search' => $request->search ?? '',
            ],
        ]);
    }

    /**
     * Admin: Update enrollment status and notes
     */
    public function adminUpdateStatus(Request $request, ChallengeEnrollment $enrollment)
    {
        $validated = $request->validate([
            'payment_status' => 'required|in:pending,paid,failed,refunded',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $enrollment->update($validated);

        return back()->with('success', 'Enrollment status updated successfully.');
    }

    /**
     * Admin: Delete enrollment
     */
    public function adminDestroy(ChallengeEnrollment $enrollment)
    {
        $enrollment->delete();

        return back()->with('success', 'Enrollment deleted successfully.');
    }
}
