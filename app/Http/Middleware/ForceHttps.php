<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceHttps
{
    /**
     * Handle an incoming request.
     * 
     * Forces HTTPS on production, allows HTTP on local development
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Don't force HTTPS on local development
        if ($this->isLocalEnvironment()) {
            return $next($request);
        }

        // Don't force HTTPS if CDN is not enabled
        if (!config('app.cdn_enabled', false)) {
            return $next($request);
        }

        // Force HTTPS redirect if not already on HTTPS
        if (!$request->secure() && !$request->isSecure()) {
            return redirect()->secure($request->getRequestUri(), 301);
        }

        return $next($request);
    }

    /**
     * Check if we're in local development environment
     */
    private function isLocalEnvironment(): bool
    {
        $host = request()->getHost();

        return app()->environment('local') ||
            $host === 'localhost' ||
            $host === '127.0.0.1' ||
            str_starts_with($host, '192.168.') ||
            str_starts_with($host, '10.0.') ||
            str_ends_with($host, '.test') ||
            str_ends_with($host, '.local');
    }
}
