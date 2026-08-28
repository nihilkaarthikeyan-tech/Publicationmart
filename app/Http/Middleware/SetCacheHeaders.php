<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetCacheHeaders
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // CRITICAL FIX: Prevent "JSON on Back Button" issue
        // Always include Vary: X-Inertia so browsers cache HTML and JSON versions separately
        $response->headers->set('Vary', 'X-Inertia');

        // If this is an Inertia JSON request, DO NOT CACHE it.
        // This prevents the browser from serving the JSON payload when the user hits "Back".
        if ($request->header('X-Inertia')) {
            $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
            $response->headers->set('Pragma', 'no-cache');
            $response->headers->set('Expires', 'Sun, 02 Jan 1990 00:00:00 GMT');
            return $response;
        }

        // Don't cache authenticated pages or admin panel
        if (auth()->check() || $request->is('admin/*') || $request->is('dashboard')) {
            $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
            $response->headers->set('Pragma', 'no-cache');
            $response->headers->set('Expires', '0');
            return $response;
        }

        // Public pages: always revalidate the HTML shell. The HTML references
        // hashed build assets, so caching it means visitors keep loading asset
        // URLs that stop existing after the next deploy (blank page for up to
        // an hour). The expensive queries behind these pages are already
        // cached server-side; the hashed assets below cache for a year.
        if ($request->is('/') || $request->is('book-store') || $request->is('book-store/*')) {
            $response->headers->set('Cache-Control', 'no-cache, must-revalidate');

            // Append Accept-Encoding to Vary without losing X-Inertia
            $vary = $response->headers->get('Vary');
            $response->headers->set('Vary', $vary ? $vary . ', Accept-Encoding' : 'Accept-Encoding');
        }

        // Cache static assets with long expiration (handled by Vite build)
        if ($request->is('build/*') || $request->is('storage/*')) {
            $response->headers->set('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
        }

        // Add security headers
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        return $response;
    }
}
