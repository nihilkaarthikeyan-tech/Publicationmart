<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // Bypass reCAPTCHA on testing domains
        $isTestingDomain = app()->environment('local'); // was Host-header based (spoofable)

        // Verify reCAPTCHA v3 token
        $recaptchaToken = $request->input('recaptcha_token');
        if (!$isTestingDomain) {
            // SECURITY: a missing/empty token must FAIL, not silently skip the
            // check (previously `if ($token && ...)` let attackers omit it).
            if (!$recaptchaToken) {
                return back()->withErrors([
                    'email' => 'Security verification failed. Please try again.',
                ]);
            }

            $recaptchaService = app(\App\Services\RecaptchaService::class);
            $result = $recaptchaService->verify($recaptchaToken, 'login');

            if (!$result['success']) {
                \Illuminate\Support\Facades\Log::warning('reCAPTCHA verification failed', [
                    'email' => $request->email,
                    'error' => $result['error'],
                    'score' => $result['score'] ?? 0,
                ]);

                return back()->withErrors([
                    'email' => $result['error'] ?? 'Security verification failed. Please try again.',
                ]);
            }

            \Illuminate\Support\Facades\Log::info('reCAPTCHA passed', [
                'email' => $request->email,
                'score' => $result['score']
            ]);
        }

        // Check if this is an OTP login attempt
        if ($request->filled('otp')) {
            // SECURITY: do NOT log OTP values or email (was leaking codes to logs).

            // Validate email exists
            $request->validate([
                'email' => 'required|email|exists:users,email',
                'otp' => 'required|string|size:6',
            ]);

            // SECURITY: rate-limit OTP verification per email+IP to stop brute
            // force of the 6-digit code (previously this path had no throttle).
            $throttleKey = 'otp-verify:' . \Illuminate\Support\Str::lower($request->email) . '|' . $request->ip();
            if (\Illuminate\Support\Facades\RateLimiter::tooManyAttempts($throttleKey, 5)) {
                $seconds = \Illuminate\Support\Facades\RateLimiter::availableIn($throttleKey);
                return back()->withErrors([
                    'otp' => "Too many attempts. Please try again in {$seconds} seconds.",
                ]);
            }

            // Verify OTP from FILE cache
            $cacheKey = 'otp_' . md5($request->email);
            $storedOtp = \Illuminate\Support\Facades\Cache::store('file')->get($cacheKey);

            if (!$storedOtp) {
                \Illuminate\Support\Facades\RateLimiter::hit($throttleKey, 600);
                return back()->withErrors([
                    'otp' => 'OTP has expired. Please request a new one.',
                ]);
            }

            // Constant-time comparison; count the failure toward the cap.
            if (!hash_equals((string) $storedOtp, (string) $request->otp)) {
                \Illuminate\Support\Facades\RateLimiter::hit($throttleKey, 600);
                // Invalidate the code after 5 wrong tries so it can't be brute-forced.
                if (\Illuminate\Support\Facades\RateLimiter::attempts($throttleKey) >= 5) {
                    \Illuminate\Support\Facades\Cache::store('file')->forget($cacheKey);
                }
                return back()->withErrors([
                    'otp' => 'Invalid OTP. Please try again.',
                ]);
            }

            // OTP is valid - clear it from cache and reset the throttle
            \Illuminate\Support\Facades\Cache::store('file')->forget($cacheKey);
            \Illuminate\Support\Facades\RateLimiter::clear($throttleKey);

            $user = \App\Models\User::where('email', $request->email)->first();

            Auth::login($user, $request->boolean('remember'));

            $request->session()->regenerate();

            // Role-based redirect
            if ($user->role === 'support_agent') {
                return redirect()->intended(route('agent.dashboard'));
            }

            if ($user->is_admin) {
                return redirect()->intended(route('admin.dashboard', absolute: false));
            }

            return redirect()->intended(route('dashboard', absolute: false));
        }

        $request->authenticate();

        $request->session()->regenerate();

        // Role-based redirect
        if ($request->user()->role === 'support_agent') {
            return redirect()->intended(route('agent.dashboard'));
        }

        if ($request->user()->is_admin) {
            return redirect()->intended(route('admin.dashboard', absolute: false));
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
