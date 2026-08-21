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
        // The page renders a promo video per challenge type, keyed by name.
        // Without this the video section silently fell back to the placeholder.
        $settings = \App\Models\ChallengeSetting::all()
            ->keyBy('challenge_type')
            ->map(fn($s) => $s->toPublicArray());

        return Inertia::render('Challenges/Index', [
            'challengeSettings' => $settings,
        ]);
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

        // Remember this enrollment in the session so the success page can be
        // shown to the guest/user who created it — without exposing others'
        // enrollments by sequential id (IDOR/PII fix).
        $mine = session('my_enrollments', []);
        $mine[] = $enrollment->id;
        session(['my_enrollments' => array_values(array_unique($mine))]);

        // Direct Payment Initiation (Skip Payment Confirmation Page)
        $txnId = 'CHAL_' . $enrollment->id . '_' . time();
        $amount = $entryFee;

        // --- BYPASS LOGIC FOR TEST DOMAINS ---
        // SECURITY: payment bypass is allowed ONLY in the local dev environment,
        // never based on a client-supplied Host header (was Host-spoofable).
        $isTestDomain = app()->environment('local');
        
        if ($isTestDomain) {
            \Illuminate\Support\Facades\Log::info('Bypassing Challenge payment (local dev environment)');
            
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

        // SECURITY: only the enrollee may view this page (it shows name, email,
        // phone). Allow the logged-in owner, or the session that created it.
        $ownsBySession = in_array($enrollment->id, session('my_enrollments', []), true);
        $ownsByAuth = auth()->check() && $enrollment->user_id === auth()->id();
        if (!$ownsBySession && !$ownsByAuth) {
            abort(403);
        }

        return Inertia::render('Challenges/Success', [
            'enrollment' => $enrollment,
        ]);
    }

    // ─── Admin Methods ────────────────────────────────────────────

    /**
     * Admin: List all challenge enrollments with filters
     */
    /**
     * Admin: manage the promo video shown on the public Challenges page for
     * each challenge type. Video can be an external URL (YouTube/Vimeo) or an
     * uploaded file.
     */
    public function adminSettings()
    {
        $existing = \App\Models\ChallengeSetting::all()->keyBy('challenge_type');

        $settings = collect(\App\Models\ChallengeSetting::$types)->map(function ($type) use ($existing) {
            $s = $existing->get($type);
            return [
                'challenge_type'  => $type,
                'video_type'      => $s->video_type ?? 'url',
                'video_url'       => $s->video_url ?? null,
                'video_file'      => $s && $s->video_file ? asset('storage/' . $s->video_file) : null,
                'video_thumbnail' => $s && $s->video_thumbnail ? asset('storage/' . $s->video_thumbnail) : null,
                'video_title'     => $s->video_title ?? null,
                'has_video'       => (bool) ($s && ($s->video_url || $s->video_file)),
            ];
        })->values();

        return Inertia::render('Admin/ChallengeSettings', [
            'settings' => $settings,
        ]);
    }

    public function adminUpdateSettings(Request $request)
    {
        $validated = $request->validate([
            'challenge_type'  => 'required|string|in:' . implode(',', \App\Models\ChallengeSetting::$types),
            'video_type'      => 'required|in:url,upload',
            'video_url'       => 'nullable|url|max:255|required_if:video_type,url',
            'video_file'      => 'nullable|file|mimes:mp4,webm,mov|max:102400|required_if:video_type,upload',
            'video_thumbnail' => 'nullable|mimes:jpeg,jpg,png,webp|max:5120',
            'video_title'     => 'nullable|string|max:255',
        ]);

        $setting = \App\Models\ChallengeSetting::firstOrNew(
            ['challenge_type' => $validated['challenge_type']]
        );

        $setting->video_type  = $validated['video_type'];
        $setting->video_title = $validated['video_title'] ?? null;

        if ($validated['video_type'] === 'url') {
            $setting->video_url = $validated['video_url'];
            // Drop any previously uploaded file so the two sources can't diverge.
            if ($setting->video_file) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($setting->video_file);
                $setting->video_file = null;
            }
        } else {
            if ($request->hasFile('video_file')) {
                if ($setting->video_file) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($setting->video_file);
                }
                $setting->video_file = $request->file('video_file')->store('challenge-videos', 'public');
            }
            $setting->video_url = null;
        }

        if ($request->hasFile('video_thumbnail')) {
            if ($setting->video_thumbnail) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($setting->video_thumbnail);
            }
            $setting->video_thumbnail = $request->file('video_thumbnail')->store('challenge-videos', 'public');
        }

        $setting->save();

        return back()->with('success', $validated['challenge_type'] . ' video updated.');
    }

    public function adminRemoveVideo(Request $request)
    {
        $validated = $request->validate([
            'challenge_type' => 'required|string|in:' . implode(',', \App\Models\ChallengeSetting::$types),
        ]);

        $setting = \App\Models\ChallengeSetting::where('challenge_type', $validated['challenge_type'])->first();

        if (!$setting) {
            return back()->with('error', 'No video set for this challenge.');
        }

        foreach (['video_file', 'video_thumbnail'] as $field) {
            if ($setting->$field) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($setting->$field);
            }
        }

        $setting->delete();

        return back()->with('success', $validated['challenge_type'] . ' video removed.');
    }

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
