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
            return redirect()->route('login')
                ->with('status', 'Your session expired. Please login again to continue.');
        });

        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\HttpException $e, $request) {
            if ($e->getStatusCode() === 419) {
                return redirect()->route('login')
                    ->with('status', 'Page expired. Please try again.');
            }
        });
    })->create();
