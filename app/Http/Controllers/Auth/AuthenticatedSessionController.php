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
        $isTestingDomain = in_array(request()->getHost(), ['radinfotec.com', 'localhost', '127.0.0.1']);

        // Verify reCAPTCHA v3 token
        $recaptchaToken = $request->input('recaptcha_token');
        if ($recaptchaToken && !$isTestingDomain) {
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
            \Illuminate\Support\Facades\Log::info("Login attempt with OTP for email: " . $request->email);

            // Validate email exists
            $request->validate([
                'email' => 'required|email|exists:users,email',
                'otp' => 'required|string|size:6',
            ]);

            // Verify OTP from FILE cache
            $cacheKey = 'otp_' . md5($request->email);
            $storedOtp = \Illuminate\Support\Facades\Cache::store('file')->get($cacheKey);

            \Illuminate\Support\Facades\Log::info("Stored OTP: " . ($storedOtp ? 'FOUND' : 'NOT FOUND') . " for key: " . $cacheKey);

            if (!$storedOtp) {
                return back()->withErrors([
                    'otp' => 'OTP has expired. Please request a new one.',
                ]);
            }

            if ($storedOtp !== $request->otp) {
                \Illuminate\Support\Facades\Log::warning("OTP mismatch. Stored: {$storedOtp}, Provided: " . $request->otp);
                return back()->withErrors([
                    'otp' => 'Invalid OTP. Please try again.',
                ]);
            }

            // OTP is valid - clear it from cache
            \Illuminate\Support\Facades\Cache::store('file')->forget($cacheKey);

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
