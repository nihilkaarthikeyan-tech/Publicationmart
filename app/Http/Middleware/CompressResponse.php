<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CompressResponse
{
    /**
     * Handle an incoming request.
     * 
     * Compresses responses for better performance
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Don't compress if already compressed or if it's a file download
        if ($this->shouldCompress($request, $response)) {
            $this->compressResponse($response);
        }

        return $response;
    }

    /**
     * Determine if response should be compressed
     */
    private function shouldCompress(Request $request, Response $response): bool
    {
        // Don't compress if client doesn't support it
        if (!str_contains($request->header('Accept-Encoding', ''), 'gzip')) {
            return false;
        }

        // Don't compress if already compressed
        if ($response->headers->has('Content-Encoding')) {
            return false;
        }

        // Only compress text-based content
        $contentType = $response->headers->get('Content-Type', '');
        $compressibleTypes = [
            'text/html',
            'text/css',
            'text/javascript',
            'application/javascript',
            'application/json',
            'application/xml',
            'text/xml',
        ];

        foreach ($compressibleTypes as $type) {
            if (str_contains($contentType, $type)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Compress the response content
     */
    private function compressResponse(Response $response): void
    {
        $content = $response->getContent();

        if ($content && strlen($content) > 1024) { // Only compress if >1KB
            $compressed = gzencode($content, 6); // Level 6 = good balance

            if ($compressed !== false) {
                $response->setContent($compressed);
                $response->headers->set('Content-Encoding', 'gzip');
                $response->headers->set('Content-Length', strlen($compressed));
                $response->headers->set('Vary', 'Accept-Encoding', false);
            }
        }
    }
}
