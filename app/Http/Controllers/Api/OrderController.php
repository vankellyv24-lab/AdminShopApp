<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    private function resolveUserId(Request $request): int
    {
        $user = $request->user();
        return $user ? (int) $user->id : 1;
    }

    private function assertUserOwnsOrder(int $userId, Order $order): void
    {
        if ((int) $order->user_id !== (int) $userId) {
            abort(403);
        }
    }

    public function index(Request $request): JsonResponse
    {
        $userId = $this->resolveUserId($request);

        $orders = Order::query()
            ->with('items')
            ->where('user_id', $userId)
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json($orders);
    }

    public function store(Request $request): JsonResponse
    {
        $userId = $this->resolveUserId($request);

        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
            'payment_method' => ['nullable', 'string', 'max:50'],
            'currency' => ['nullable', 'string', 'size:3'],
            'shipping' => ['nullable', 'array'],
            'shipping.fullName' => ['nullable', 'string', 'max:191'],
            'shipping.address' => ['nullable', 'string', 'max:500'],
            'shipping.city' => ['nullable', 'string', 'max:100'],
            'shipping.country' => ['nullable', 'string', 'max:100'],
            'shipping.phone' => ['nullable', 'string', 'max:50'],
        ]);

        $currency = $validated['currency'] ?? 'USD';
        $shipping = $validated['shipping'] ?? [];

        $itemsInput = $validated['items'];

        $productIds = collect($itemsInput)->pluck('product_id')->all();
        $products = Product::query()->whereIn('id', $productIds)->get()->keyBy('id');

        return DB::transaction(function () use ($userId, $itemsInput, $products, $currency, $validated, $shipping) {
            $subtotal = 0;
            $order = Order::create([
                'user_id' => $userId,
                'status' => 'pending_payment',
                'subtotal' => 0,
                'shipping_fee' => 0,
                'total' => 0,
                'currency' => $currency,
                'payment_method' => $validated['payment_method'] ?? null,
                'shipping_name' => $shipping['fullName'] ?? null,
                'shipping_address' => $shipping['address'] ?? null,
                'shipping_city' => $shipping['city'] ?? null,
                'shipping_country' => $shipping['country'] ?? null,
                'shipping_phone' => $shipping['phone'] ?? null,
            ]);

            foreach ($itemsInput as $it) {
                $product = $products->get($it['product_id']);

                if (!$product || !$product->is_active) {
                    abort(422);
                }

                $qty = (int) $it['qty'];

                if ($qty > (int) $product->stock) {
                    abort(422);
                }

                $price = (string) $product->price;
                $lineTotal = (float) $product->price * $qty;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'price' => $price,
                    'qty' => $qty,
                    'line_total' => $lineTotal,
                ]);

                $subtotal += $lineTotal;

                $product->decrement('stock', $qty);
            }

            $order->update([
                'subtotal' => $subtotal,
                'shipping_fee' => 0,
                'total' => $subtotal,
            ]);

            $order->load('items');

            return response()->json($order, 201);
        });
    }

    public function pay(Request $request, Order $order): JsonResponse
    {
        $userId = $this->resolveUserId($request);
        $this->assertUserOwnsOrder($userId, $order);

        if ($order->status !== 'pending_payment') {
            return response()->json([
                'message' => 'Order cannot be paid in its current status.',
                'status' => $order->status,
            ], 422);
        }

        $validated = $request->validate([
            'payment_ref' => ['nullable', 'string', 'max:191'],
        ]);

        $order->update([
            'status' => 'paid',
            'payment_ref' => $validated['payment_ref'] ?? $order->payment_ref,
        ]);

        $order->load('items');

        return response()->json($order);
    }

    public function advance(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'to' => ['nullable', 'string', 'in:processing,shipped,delivered'],
        ]);

        $current = (string) $order->status;

        $nextMap = [
            'paid' => 'processing',
            'processing' => 'shipped',
            'shipped' => 'delivered',
        ];

        $requestedTo = $validated['to'] ?? null;

        if ($requestedTo !== null) {
            $allowedFrom = [
                'processing' => ['paid'],
                'shipped' => ['processing'],
                'delivered' => ['shipped'],
            ];

            if (!in_array($current, $allowedFrom[$requestedTo] ?? [], true)) {
                return response()->json([
                    'message' => 'Invalid status transition.',
                    'from' => $current,
                    'to' => $requestedTo,
                ], 422);
            }

            $order->update(['status' => $requestedTo]);
        } else {
            if (!array_key_exists($current, $nextMap)) {
                return response()->json([
                    'message' => 'Order cannot be advanced in its current status.',
                    'status' => $current,
                ], 422);
            }

            $order->update(['status' => $nextMap[$current]]);
        }

        $order->load('items');

        return response()->json($order);
    }
}
