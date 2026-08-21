<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;
use App\Models\Blog;
use App\Models\PresaleBooking;
use Inertia\Inertia;
use App\Mail\PresaleOtp;
use Illuminate\Support\Facades\Mail;

class PresaleBookingController extends Controller
{
    public function generateCaptcha()
    {
        $num1 = random_int(1, 10);
        $num2 = random_int(1, 10);
        session(['presale_captcha_answer' => $num1 + $num2]);

        return response()->json([
            'question' => "$num1 + $num2 = ?"
        ]);
    }

    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'captcha' => 'required|integer',
            'blog_id' => 'required|exists:blogs,id',
        ]);

        if (PresaleBooking::where('blog_id', $request->blog_id)->where('email', $request->email)->exists()) {
            return response()->json(['message' => 'You have already placed a booking for this item.'], 422);
        }

        if ($request->captcha != session('presale_captcha_answer')) {
            return response()->json(['message' => 'Incorrect CAPTCHA answer.'], 422);
        }

        // Generate OTP
        $otp = random_int(100000, 999999);

        // Store in cache for 10 minutes
        \Illuminate\Support\Facades\Cache::put('presale_otp_' . $request->email, $otp, 600);

        // Fetch Blog Title if available
        $blogTitle = null;
        if ($request->has('blog_id')) {
            $blog = Blog::find($request->blog_id);
            if ($blog) {
                $blogTitle = $blog->title;
            }
        }

        // Send Email
        try {
            Mail::to($request->email)->send(new PresaleOtp($otp, $blogTitle));
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to send OTP. Please try again.'], 500);
        }

        return response()->json(['message' => 'OTP sent successfully!']);
    }

    public function store(Request $request, $blogId)
    {
        $request->validate([
            'copies_count' => 'required|integer|min:1',
            'email' => 'required|email',
            'mobile_number' => ['required', 'regex:/^(\+\d{1,3}[- ]?)?\d{10}$/'],
            'otp' => 'required|integer',
        ]);

        // SECURITY: rate-limit OTP verification to stop brute force (M11).
        $throttleKey = 'presale-otp:' . \Illuminate\Support\Str::lower($request->email) . '|' . $request->ip();
        if (\Illuminate\Support\Facades\RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = \Illuminate\Support\Facades\RateLimiter::availableIn($throttleKey);
            return back()->with('error', "Too many attempts. Try again in {$seconds}s.");
        }

        // Verify OTP (constant-time)
        $cachedOtp = \Illuminate\Support\Facades\Cache::get('presale_otp_' . $request->email);

        if (!$cachedOtp || !hash_equals((string) $cachedOtp, (string) $request->otp)) {
            \Illuminate\Support\Facades\RateLimiter::hit($throttleKey, 600);
            if (\Illuminate\Support\Facades\RateLimiter::attempts($throttleKey) >= 5) {
                \Illuminate\Support\Facades\Cache::forget('presale_otp_' . $request->email);
            }
            return back()->with('error', 'Invalid or expired OTP.');
        }

        // Clear OTP + throttle
        \Illuminate\Support\Facades\Cache::forget('presale_otp_' . $request->email);
        \Illuminate\Support\Facades\RateLimiter::clear($throttleKey);

        $blog = Blog::findOrFail($blogId);

        if (!$blog->is_presale) {
            return back()->with('error', 'This studio is not open for presale.');
        }

        if (PresaleBooking::where('blog_id', $blog->id)->where('email', $request->email)->exists()) {
            return back()->with('error', 'You have already booked copies for this presale.');
        }

        PresaleBooking::create([
            'blog_id' => $blog->id,
            'copies_count' => $request->copies_count,
            'email' => $request->email,
            'mobile_number' => $request->mobile_number,
            'is_verified' => true,
        ]);

        return back()->with('success', 'Presale booking submitted successfully!');
    }
}
