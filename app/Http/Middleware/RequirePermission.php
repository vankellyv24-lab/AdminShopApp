<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequirePermission
{
    /**
     * @param  array<int, string>  $permissions
     */
    public function handle(Request $request, Closure $next, ...$permissions): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(401);
        }

        foreach ($permissions as $perm) {
            if ($user->hasPermission((string) $perm)) {
                return $next($request);
            }
        }

        abort(403);
    }
}
