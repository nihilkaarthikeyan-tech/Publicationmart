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
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $email = $request->email;

        // Generate 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Store OTP in FILE cache for 10 minutes (Avoiding database cache issues)
        $cacheKey = 'otp_' . md5($email);

        // Explicitly use 'file' store to ensure persistence even if DB cache is misconfigured
        Cache::store('file')->put($cacheKey, $otp, now()->addMinutes(10));

        // Log the OTP for debugging (Remove in final production if strict security needed)
        \Illuminate\Support\Facades\Log::info("OTP generated for {$email}: {$otp} (Stored in File Cache)");

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
        $request->validate([
            'email' => 'required|email|exists:users,email',
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
