<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireRole
{
    /**
     * @param  array<int, string>  $roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(401);
        }

        foreach ($roles as $roleName) {
            if ($user->hasRole((string) $roleName)) {
                return $next($request);
            }
        }

        if (!empty($roles)) {
            abort(403);
        }

        return $next($request);
    }
}
