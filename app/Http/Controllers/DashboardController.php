<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Ensure user has permission to view dashboard
        if (!$request->user()->hasPermission('dashboard.view')) {
            abort(403);
        }

        $productCount = Product::query()->count();
        $orderCount = Order::query()->count();
        $revenue = Order::query()
            ->where('status', '!=', 'cancelled')
            ->sum('total');
        $userCount = User::query()->count();

        // Get recent orders (last 5)
        $recentOrders = Order::query()
            ->with('user')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        // Get low stock products (less than 10 in stock)
        $lowStockProducts = Product::query()
            ->where('stock', '<', 10)
            ->where('is_active', true)
            ->orderBy('stock')
            ->limit(5)
            ->get(['id', 'name', 'sku', 'stock']);

        // Get REAL customers who have ordered products (from ShopApp via Firebase sync)
        $customersWithOrders = User::query()
            ->whereNotNull('external_id') // Only Firebase users from ShopApp
            ->withCount('orders')
            ->withSum('orders', 'total')
            ->having('orders_count', '>', 0)
            ->orderByDesc('orders_count')
            ->limit(10)
            ->get();

        // Get top customers by total spent
        $topCustomers = User::query()
            ->whereNotNull('external_id')
            ->withCount('orders')
            ->withSum('orders as total_spent', 'total')
            ->having('orders_count', '>', 0)
            ->orderByDesc('total_spent')
            ->limit(5)
            ->get(['id', 'name', 'email', 'external_id', 'orders_count', 'total_spent']);

        // Recent customers who placed orders today
        $recentCustomers = User::query()
            ->whereNotNull('external_id')
            ->whereHas('orders', function ($q) {
                $q->whereDate('created_at', today());
            })
            ->withCount(['orders' => function ($q) {
                $q->whereDate('created_at', today());
            }])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => [
                'productCount' => $productCount,
                'orderCount' => $orderCount,
                'revenue' => $revenue,
                'userCount' => $userCount,
                'customerCount' => $customersWithOrders->count(),
            ],
            'recentOrders' => $recentOrders,
            'lowStockProducts' => $lowStockProducts,
            'customersWithOrders' => $customersWithOrders,
            'topCustomers' => $topCustomers,
            'recentCustomers' => $recentCustomers,
        ]);
    }
}
