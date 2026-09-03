<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        /*
         * Anything in front of the app that terminates HTTPS — a tunnel used to
         * demo the site, a load balancer later — forwards the original scheme in
         * X-Forwarded-*. Without trusting those headers Laravel believes every
         * request arrived over plain http and writes http:// into its own links
         * and asset tags, which a browser on an https page then refuses to load.
         */
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \App\Http\Middleware\HandleReferralCode::class, // Capture referral codes
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\ForceHttps::class, // HTTPS enforcement (auto-detects localhost)
            \App\Http\Middleware\CompressResponse::class, // Gzip compression
            \App\Http\Middleware\SetCacheHeaders::class, // Cache optimization
        ]);

        $middleware->validateCsrfTokens(except: [
            '/payment/phonepe/callback',
            '/payment/phonepe/redirect',
        ]);

        // Register admin middleware alias
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'support_agent' => \App\Http\Middleware\SupportAgentMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Illuminate\Session\TokenMismatchException $e, $request) {
            // An async request gets the real 419 so the client can fetch a
            // fresh token and retry — the visitor keeps whatever they typed.
            // Redirecting here instead (as this used to do for every request)
            // threw away the page and its form along with it.
            if ($request->expectsJson() || $request->ajax() || $request->hasHeader('X-Inertia')) {
                return response()->json(['message' => 'CSRF token mismatch.'], 419);
            }

            // A plain browser navigation has nothing to preserve, so the
            // login redirect remains the right answer there.
            return redirect()->route('login')
                ->with('status', 'Your session expired. Please login again to continue.');
        });

        // TokenMismatchException extends HttpException, and render callbacks are
        // evaluated last-registered-first — so this one used to win and send
        // every expired token to the login page, async requests included. It
        // now makes the same distinction as the handler above.
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\HttpException $e, $request) {
            if ($e->getStatusCode() === 419) {
                if ($request->expectsJson() || $request->ajax() || $request->hasHeader('X-Inertia')) {
                    return response()->json(['message' => 'Page expired.'], 419);
                }

                return redirect()->route('login')
                    ->with('status', 'Page expired. Please try again.');
            }
        });
    })->create();
