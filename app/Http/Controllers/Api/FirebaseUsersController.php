<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class FirebaseUsersController extends Controller
{
    private function getAccessToken(): string
    {
        $credentialsPath = config('services.firebase.credentials');
        
        // Try multiple path resolution strategies
        $possiblePaths = [
            // If it's already an absolute path
            $credentialsPath,
            // If path starts with storage/
            storage_path(str_replace('storage/', '', $credentialsPath)),
            // Direct storage path
            storage_path($credentialsPath),
            // From base path
            base_path($credentialsPath),
            // Hardcoded fallback
            storage_path('app/firebase-admin.json'),
        ];

        $fullPath = null;
        foreach ($possiblePaths as $path) {
            if (is_file($path)) {
                $fullPath = $path;
                break;
            }
        }

        if (!$fullPath) {
            throw new \RuntimeException("Firebase credentials not found. Tried: " . implode(', ', $possiblePaths));
        }

        $credentials = json_decode(file_get_contents($fullPath), true);
        
        // Create JWT for OAuth2
        $header = json_encode(['alg' => 'RS256', 'typ' => 'JWT']);
        $now = time();
        $claimSet = json_encode([
            'iss' => $credentials['client_email'],
            'sub' => $credentials['client_email'],
            'scope' => 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/cloud-platform',
            'aud' => 'https://oauth2.googleapis.com/token',
            'iat' => $now,
            'exp' => $now + 3600,
        ]);

        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64ClaimSet = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($claimSet));
        
        $signatureInput = $base64Header . '.' . $base64ClaimSet;
        
        $privateKey = $credentials['private_key'];
        openssl_sign($signatureInput, $signature, $privateKey, 'SHA256');
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        $jwt = $signatureInput . '.' . $base64Signature;

        // Exchange JWT for access token
        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $jwt,
        ]);

        if (!$response->successful()) {
            throw new \RuntimeException('Failed to get access token: ' . $response->body());
        }

        return $response->json('access_token');
    }

    private function firestoreRequest(string $path, array $query = []): array
    {
        $projectId = 'shopapp-000';
        $baseUrl = "https://firestore.googleapis.com/v1/projects/{$projectId}/databases/(default)/documents";
        $accessToken = $this->getAccessToken();

        $url = $baseUrl . $path;
        if (!empty($query)) {
            $url .= '?' . http_build_query($query);
        }

        $response = Http::withToken($accessToken)
            ->timeout(30)
            ->get($url);

        if (!$response->successful()) {
            throw new \RuntimeException('Firestore API error: ' . $response->body());
        }

        return $response->json();
    }

    private function documentToArray(?array $document): ?array
    {
        if (!$document || !isset($document['fields'])) {
            return null;
        }

        $data = [];
        foreach ($document['fields'] as $key => $value) {
            if (isset($value['stringValue'])) {
                $data[$key] = $value['stringValue'];
            } elseif (isset($value['integerValue'])) {
                $data[$key] = (int) $value['integerValue'];
            } elseif (isset($value['doubleValue'])) {
                $data[$key] = $value['doubleValue'];
            } elseif (isset($value['booleanValue'])) {
                $data[$key] = $value['booleanValue'];
            } elseif (isset($value['timestampValue'])) {
                $data[$key] = $value['timestampValue'];
            } elseif (isset($value['mapValue']['fields'])) {
                $data[$key] = $this->documentToArray($value['mapValue']);
            } elseif (isset($value['arrayValue']['values'])) {
                $data[$key] = array_map(fn($v) => $this->documentToArray(['fields' => $v]) ?? $v, $value['arrayValue']['values']);
            }
        }
        
        // Extract document ID from name
        if (isset($document['name'])) {
            $parts = explode('/', $document['name']);
            $data['_id'] = end($parts);
        }

        return $data;
    }

    /**
     * Fetch all users from Firebase Firestore and sync to local database
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $result = $this->firestoreRequest('/users');
            
            // DEBUG: Log the raw response
            \Log::debug('Firestore raw response', ['result' => $result]);
            
            $users = [];
            $syncedCount = 0;

            $documents = $result['documents'] ?? [];
            
            \Log::debug('Documents found', ['count' => count($documents)]);

            foreach ($documents as $document) {
                \Log::debug('Processing document', ['doc' => $document]);
                
                $data = $this->documentToArray($document);
                if (!$data) {
                    \Log::debug('Document parsed to null');
                    continue;
                }

                $firebaseUid = $data['_id'] ?? null;
                $email = $data['email'] ?? null;

                \Log::debug('Parsed user data', ['uid' => $firebaseUid, 'email' => $email]);

                if (empty($email)) {
                    continue;
                }

                $name = $data['name'] ?? ($data['displayName'] ?? 'Unknown');
                $role = $data['role'] ?? 'customer';

                // Sync to local database
                $user = User::query()->updateOrCreate(
                    ['external_id' => $firebaseUid],
                    [
                        'email' => $email,
                        'name' => $name,
                        'role' => $role,
                        'password' => '',
                    ]
                );

                $syncedCount++;

                // Get user's orders
                $orders = $user->orders()->with('items')->get()->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'status' => $order->status,
                        'total' => $order->total,
                        'currency' => $order->currency,
                        'payment_method' => $order->payment_method,
                        'created_at' => $order->created_at?->toIso8601String(),
                        'items_count' => $order->items->count(),
                    ];
                });

                $users[] = [
                    'id' => $user->id,
                    'external_id' => $firebaseUid,
                    'email' => $email,
                    'name' => $name,
                    'role' => $role,
                    'photo_url' => $data['photoURL'] ?? null,
                    'phone' => $data['phone'] ?? null,
                    'orders' => $orders,
                    'orders_count' => $orders->count(),
                    'total_spent' => $orders->sum('total'),
                ];
            }

            // Sort by orders count descending
            usort($users, fn ($a, $b) => $b['orders_count'] <=> $a['orders_count']);

            return response()->json([
                'success' => true,
                'synced' => $syncedCount,
                'count' => count($users),
                'users' => $users,
            ]);
        } catch (\Throwable $e) {
            \Log::error('Firebase Users Fetch Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch users from Firebase: ' . $e->getMessage(),
                'error' => $e->getMessage(),
                'file' => $e->getFile() . ':' . $e->getLine(),
            ], 500);
        }
    }

    /**
     * Get a specific user by Firebase UID with their orders
     */
    public function show(string $firebaseUid): JsonResponse
    {
        try {
            $result = $this->firestoreRequest("/users/{$firebaseUid}");
            $data = $this->documentToArray($result);

            if (!$data) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found in Firebase',
                ], 404);
            }

            // Sync to local database
            $user = User::query()->updateOrCreate(
                ['external_id' => $firebaseUid],
                [
                    'email' => $data['email'] ?? null,
                    'name' => $data['name'] ?? ($data['displayName'] ?? 'Unknown'),
                    'role' => $data['role'] ?? 'customer',
                    'password' => '',
                ]
            );

            // Get full order details
            $orders = $user->orders()->with(['items.product'])->get();

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'external_id' => $firebaseUid,
                    'email' => $data['email'] ?? null,
                    'name' => $data['name'] ?? ($data['displayName'] ?? 'Unknown'),
                    'role' => $data['role'] ?? 'customer',
                    'photo_url' => $data['photoURL'] ?? null,
                    'phone' => $data['phone'] ?? null,
                    'created_at' => $data['createdAt'] ?? null,
                    'orders' => $orders,
                    'orders_count' => $orders->count(),
                    'total_spent' => $orders->sum('total'),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch user',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
