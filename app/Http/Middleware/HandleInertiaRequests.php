<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * Handle the incoming request.
     */
    public function handle(Request $request, \Closure $next)
    {
        $response = parent::handle($request, $next);

        // STRICT CACHING: Prevent JSON/HTML confusion
        // 1. Vary header ensures caches treat JSON and HTML versions separately
        $vary = $response->headers->get('Vary');
        if (!$vary || !str_contains($vary, 'X-Inertia')) {
            $response->headers->set('Vary', $vary ? $vary . ', X-Inertia' : 'X-Inertia');
        }

        // 2. For Inertia responses (JSON), strictly disable caching
        // This prevents the "Back Button" or "History" from serving JSON to a Document Request
        if ($request->inertia()) {
            $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, private');
            $response->headers->set('Pragma', 'no-cache');
            $response->headers->set('Expires', 'Fri, 01 Jan 1990 00:00:00 GMT');
        }

        return $response;
    }

    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user    = null;
        $dbError = null;

        try {
            $user = $request->user();
        } catch (\Throwable $e) {
            $dbError = 'Database connection failed: ' . $e->getMessage();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id'               => $user->id,
                    'name'             => $user->name,
                    'email'            => $user->email,
                    'role'             => $user->role,                    // full role string
                    'is_admin'         => (int) ($user->is_admin || $user->role === 'super_admin' || $user->role === 'editor'),
                    'is_support_agent' => $user->role === 'support_agent',
                    'referral_code'    => $user->referral_code,
                    'referral_balance' => $user->referral_balance,
                ] : null,
            ],
            'db_connection_error' => $dbError,
            'app_url'             => config('app.url'),
            'flash'               => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],
        ];
    }
}
