<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SupportAgentMiddleware
{
    /**
     * Allow access if user is logged in AND has the 'support_agent' role.
     * Admins (super_admin, editor) can also access the support portal.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login')
                ->with('error', 'Please log in to access the support portal.');
        }

        $role = Auth::user()->role;

        $allowed = in_array($role, ['support_agent', 'super_admin', 'editor']);

        if (!$allowed) {
            abort(403, 'You do not have permission to access the support portal.');
        }

        return $next($request);
    }
}
