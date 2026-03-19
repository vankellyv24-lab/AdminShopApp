<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        if (!$request->user()->hasPermission('reports.view')) {
            abort(403);
        }

        $period = $request->input('period', '30'); // days
        $startDate = Carbon::now()->subDays((int) $period);
        $endDate = Carbon::now();

        // Sales over time (daily for last 30 days, weekly for longer)
        $salesData = $this->getSalesOverTime($startDate, $endDate, (int) $period);

        // Top selling products
        $topProducts = $this->getTopProducts($startDate, $endDate);

        // Summary stats
        $totalRevenue = Order::query()
            ->where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('total');

        $totalOrders = Order::query()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $averageOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        $cancelledOrders = Order::query()
            ->where('status', 'cancelled')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        // Orders by status
        $ordersByStatus = Order::query()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Payment method breakdown
        $paymentMethods = Order::query()
            ->where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('payment_method, count(*) as count, sum(total) as total')
            ->groupBy('payment_method')
            ->get();

        return Inertia::render('Admin/Reports/Index', [
            'period' => $period,
            'salesData' => $salesData,
            'topProducts' => $topProducts,
            'summary' => [
                'totalRevenue' => $totalRevenue,
                'totalOrders' => $totalOrders,
                'averageOrderValue' => $averageOrderValue,
                'cancelledOrders' => $cancelledOrders,
                'conversionRate' => $totalOrders > 0 
                    ? (($totalOrders - $cancelledOrders) / $totalOrders) * 100 
                    : 0,
            ],
            'ordersByStatus' => $ordersByStatus,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    private function getSalesOverTime(Carbon $startDate, Carbon $endDate, int $period): array
    {
        if ($period <= 30) {
            // Daily data for short periods
            $data = Order::query()
                ->where('status', '!=', 'cancelled')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->selectRaw('DATE(created_at) as date, count(*) as orders, sum(total) as revenue')
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            $result = [];
            $current = $startDate->copy();
            while ($current <= $endDate) {
                $dateStr = $current->format('Y-m-d');
                $dayData = $data->firstWhere('date', $dateStr);
                $result[] = [
                    'label' => $current->format('M d'),
                    'orders' => $dayData ? (int) $dayData->orders : 0,
                    'revenue' => $dayData ? (float) $dayData->revenue : 0,
                ];
                $current->addDay();
            }
        } else {
            // Weekly data for longer periods
            $data = Order::query()
                ->where('status', '!=', 'cancelled')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->selectRaw('YEARWEEK(created_at) as week, count(*) as orders, sum(total) as revenue')
                ->groupBy('week')
                ->orderBy('week')
                ->get();

            $result = [];
            foreach ($data as $row) {
                $result[] = [
                    'label' => 'Week ' . substr($row->week, -2),
                    'orders' => (int) $row->orders,
                    'revenue' => (float) $row->revenue,
                ];
            }
        }

        return $result;
    }

    private function getTopProducts(Carbon $startDate, Carbon $endDate): array
    {
        return Order::query()
            ->where('status', '!=', 'cancelled')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->selectRaw('products.id, products.name, sum(order_items.qty) as total_sold, sum(order_items.qty * order_items.price) as total_revenue')
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_sold')
            ->limit(10)
            ->get()
            ->toArray();
    }

    public function exportOrders(Request $request)
    {
        if (!$request->user()->hasPermission('orders.view')) {
            abort(403);
        }

        $startDate = $request->input('start_date') 
            ? Carbon::parse($request->input('start_date')) 
            : Carbon::now()->subDays(30);
        $endDate = $request->input('end_date') 
            ? Carbon::parse($request->input('end_date')) 
            : Carbon::now();

        $orders = Order::query()
            ->with('user', 'items.product')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderByDesc('created_at')
            ->get();

        $headers = [
            'Order ID',
            'Date',
            'Customer',
            'Email',
            'Status',
            'Payment Method',
            'Subtotal',
            'Shipping',
            'Total',
            'Currency',
            'Items Count',
        ];

        $callback = function () use ($orders, $headers) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $headers);

            foreach ($orders as $order) {
                fputcsv($file, [
                    $order->id,
                    $order->created_at->format('Y-m-d H:i:s'),
                    $order->user?->name ?? 'Guest',
                    $order->user?->email ?? '',
                    $order->status,
                    $order->payment_method,
                    $order->subtotal,
                    $order->shipping_fee,
                    $order->total,
                    $order->currency,
                    $order->items->count(),
                ]);
            }

            fclose($file);
        };

        $filename = 'orders_' . $startDate->format('Y-m-d') . '_to_' . $endDate->format('Y-m-d') . '.csv';

        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}
