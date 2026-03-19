<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Response;
use Inertia\Inertia;

class OrderController extends Controller
{
    private function getFirebaseAccessToken(): string
    {
        $credentialsPath = config('services.firebase.credentials');
        $fullPath = base_path($credentialsPath);

        if (!is_file($fullPath)) {
            throw new \RuntimeException("Firebase credentials not found: {$fullPath}");
        }

        $credentials = json_decode(file_get_contents($fullPath), true);
        
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

        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $jwt,
        ]);

        if (!$response->successful()) {
            throw new \RuntimeException('Failed to get access token: ' . $response->body());
        }

        return $response->json('access_token');
    }

    private function syncOrderToFirebase(Order $order): void
    {
        try {
            $projectId = 'shopapp-000';
            $accessToken = $this->getFirebaseAccessToken();
            
            // Find the user by external_id to get their Firebase UID
            $user = $order->user;
            if (!$user || !$user->external_id) {
                \Log::warning('Cannot sync order to Firebase: user has no external_id', ['order_id' => $order->id]);
                return;
            }
            
            $firebaseUid = $user->external_id;
            
            // Build order data for Firebase
            $orderData = [
                'fields' => [
                    'id' => ['stringValue' => (string) $order->id],
                    'status' => ['stringValue' => $order->status],
                    'total' => ['doubleValue' => (float) $order->total],
                    'subtotal' => ['doubleValue' => (float) $order->subtotal],
                    'shipping_fee' => ['doubleValue' => (float) $order->shipping_fee],
                    'currency' => ['stringValue' => $order->currency ?? 'USD'],
                    'payment_method' => ['stringValue' => $order->payment_method ?? 'card'],
                    'payment_ref' => ['stringValue' => $order->payment_ref ?? ''],
                    'updatedAt' => ['timestampValue' => now()->toIso8601String()],
                ]
            ];
            
            // If order has items, add them
            if ($order->items && $order->items->count() > 0) {
                $itemsArray = [];
                foreach ($order->items as $item) {
                    $itemsArray[] = [
                        'mapValue' => [
                            'fields' => [
                                'productId' => ['stringValue' => (string) ($item->product_id ?? '')],
                                'name' => ['stringValue' => $item->product?->name ?? 'Unknown'],
                                'quantity' => ['integerValue' => (int) $item->quantity],
                                'price' => ['doubleValue' => (float) $item->price],
                            ]
                        ]
                    ];
                }
                $orderData['fields']['items'] = ['arrayValue' => ['values' => $itemsArray]];
            }
            
            // Update in Firestore under user's orders collection
            $url = "https://firestore.googleapis.com/v1/projects/{$projectId}/databases/(default)/documents/users/{$firebaseUid}/orders/{$order->id}";
            
            $response = Http::withToken($accessToken)
                ->timeout(30)
                ->patch($url, $orderData);
                
            if (!$response->successful()) {
                \Log::error('Failed to sync order to Firebase', [
                    'order_id' => $order->id,
                    'response' => $response->body(),
                ]);
            } else {
                \Log::info('Order synced to Firebase', ['order_id' => $order->id, 'firebase_uid' => $firebaseUid]);
            }
        } catch (\Throwable $e) {
            \Log::error('Error syncing order to Firebase', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function index(Request $request): Response
    {
        if (!$request->user()->hasPermission('orders.view')) {
            abort(403);
        }

        $query = Order::query()->with('user')->orderByDesc('id');

        if ($request->filled('q')) {
            $q = (string) $request->string('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('id', 'like', "%{$q}%")
                    ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$q}%"));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $orders = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Orders/Index', [
            'filters' => [
                'q' => $request->input('q'),
                'status' => $request->input('status'),
            ],
            'orders' => $orders,
        ]);
    }

    public function show(Request $request, Order $order): Response
    {
        if (!$request->user()->hasPermission('orders.view')) {
            abort(403);
        }

        $order->load('user', 'items.product');

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
        ]);
    }

    public function update(Request $request, Order $order): RedirectResponse
    {
        if (!$request->user()->hasPermission('orders.update')) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending_payment,paid,processing,shipped,delivered,cancelled'],
        ]);

        $order->update($validated);
        
        // Sync to Firebase so ShopApp sees the update
        $this->syncOrderToFirebase($order);
        
        ActivityLog::log('update', 'order', $order->id, "Updated order #{$order->id} status to {$order->status}");

        return redirect()->route('admin.orders.show', $order)->with('success', 'Order updated.');
    }
}