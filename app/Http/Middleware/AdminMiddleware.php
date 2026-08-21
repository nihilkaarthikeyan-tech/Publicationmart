<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     * Only allows access if the authenticated user is an admin.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            // Check if user is authenticated
            if (!Auth::check()) {
                return redirect()->route('login')->with('error', 'Please login to access this page.');
            }

            // Check if user is an admin
            if (!Auth::user()->is_admin) {
                abort(403, 'Unauthorized. Admin access only.');
            }
        } catch (\Illuminate\Database\QueryException $e) {
            // Handle DB connection errors gracefully
            \Log::error('AdminMiddleware DB Error: ' . $e->getMessage());
            abort(503, 'Database connection failed. Please check your database configuration.');
        } catch (\PDOException $e) {
            \Log::error('AdminMiddleware PDO Error: ' . $e->getMessage());
            abort(503, 'Database connection failed. Please check your database configuration.');
        }

        return $next($request);
    }
}
