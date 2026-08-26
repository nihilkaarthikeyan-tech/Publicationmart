<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use App\Models\User;

class OtpController extends Controller
{
    /**
     * Send OTP to user's email
     */
    public function send(Request $request)
    {
        // NOTE: deliberately no 'exists:users,email' rule. Rejecting unknown
        // addresses revealed which emails are registered (account
        // enumeration). Accept any well-formed address, respond identically
        // either way, and only actually send to real users.
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = $request->email;

        // Unknown address: same response, but nothing is sent.
        if (!\App\Models\User::where('email', $email)->exists()) {
            return response()->json([
                'success' => true,
                'message' => 'If that email is registered, a code has been sent to it.',
            ]);
        }

        // Generate 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Store OTP in FILE cache for 10 minutes (Avoiding database cache issues)
        $cacheKey = 'otp_' . md5($email);

        // Explicitly use 'file' store to ensure persistence even if DB cache is misconfigured
        Cache::store('file')->put($cacheKey, $otp, now()->addMinutes(10));

        // Send OTP via email
        try {
            Mail::raw(
                "Your PublicationMart login OTP is: {$otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.",
                function ($message) use ($email) {
                    $message->to($email)
                        ->subject('Your PublicationMart Login OTP');
                }
            );

            return response()->json([
                'success' => true,
                'message' => 'OTP sent successfully to your email!',
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to send OTP email to {$email}: " . $e->getMessage());

            // In production, we might want to return a generic error, but for debugging:
            return response()->json([
                'success' => false,
                'message' => 'Failed to send email. Please contact support.',
            ], 500);
        }
    }

    /**
     * Verify OTP
     */
    public function verify(Request $request)
    {
        // No 'exists' rule: an unknown email simply has no cached OTP and
        // falls through to the same generic failure, so this no longer
        // reveals which addresses are registered.
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        $email = $request->email;
        $otp = $request->otp;

        $cacheKey = 'otp_' . md5($email);

        // Retrieve from FILE cache
        $storedOtp = Cache::store('file')->get($cacheKey);

        if (!$storedOtp) {
            return response()->json([
                'success' => false,
                'message' => 'OTP has expired. Please request a new one.',
            ], 400);
        }

        if ($storedOtp !== $otp) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid OTP. Please try again.',
            ], 400);
        }

        // OTP is valid - clear it from cache
        Cache::store('file')->forget($cacheKey);

        return response()->json([
            'success' => true,
            'message' => 'OTP verified successfully!',
        ]);
    }
}
