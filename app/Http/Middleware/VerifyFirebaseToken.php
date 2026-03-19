<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Kreait\Firebase\Factory;
use Symfony\Component\HttpFoundation\Response;

class VerifyFirebaseToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $authHeader = (string) $request->header('Authorization', '');

        if (!str_starts_with($authHeader, 'Bearer ')) {
            abort(401);
        }

        $token = trim(substr($authHeader, 7));

        if ($token === '') {
            abort(401);
        }

        $credentialsPath = (string) config('services.firebase.credentials');

        if ($credentialsPath === '' || !is_file(base_path($credentialsPath))) {
            abort(500);
        }

        try {
            $factory = (new Factory())->withServiceAccount(base_path($credentialsPath));
            $auth = $factory->createAuth();

            $verifiedIdToken = $auth->verifyIdToken($token);
            $uid = $verifiedIdToken->claims()->get('sub');

            if (!$uid) {
                abort(401);
            }

            $firebaseUser = $auth->getUser($uid);

            $email = $firebaseUser->email;
            $name = $firebaseUser->displayName ?: ($email ?: 'Customer');

            if (!$email) {
                abort(401);
            }

            $user = User::query()->firstOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'role' => 'customer',
                    'password' => '',
                ]
            );

            auth()->setUser($user);
        } catch (\Throwable $e) {
            abort(401);
        }

        return $next($request);
    }
}
