<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        if (!$request->user()->hasPermission('products.view')) {
            abort(403);
        }

        $query = Product::query()->with('category')->orderByDesc('id');

        // Text search
        if ($request->filled('q')) {
            $q = (string) $request->string('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('sku', 'like', "%{$q}%");
            });
        }

        // Stock filter
        if ($request->filled('stock_status')) {
            switch ($request->input('stock_status')) {
                case 'out':
                    $query->where('stock', 0);
                    break;
                case 'low':
                    $query->whereBetween('stock', [1, 10]);
                    break;
                case 'in':
                    $query->where('stock', '>', 10);
                    break;
            }
        }

        // Status filter
        if ($request->has('is_active') && $request->input('is_active') !== '') {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Price range
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->input('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->input('max_price'));
        }

        // Category filter
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        $products = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Products/Index', [
            'filters' => [
                'q' => $request->input('q'),
                'stock_status' => $request->input('stock_status'),
                'is_active' => $request->input('is_active'),
                'min_price' => $request->input('min_price'),
                'max_price' => $request->input('max_price'),
                'category_id' => $request->input('category_id'),
            ],
            'products' => $products,
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create(Request $request): Response
    {
        if (!$request->user()->hasPermission('products.create')) {
            abort(403);
        }

        return Inertia::render('Admin/Products/Create', [
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if (!$request->user()->hasPermission('products.create')) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['nullable', 'string', 'max:64'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'is_active' => ['required', 'boolean'],
            'image_url' => ['nullable', 'url', 'max:500'],
        ]);

        $product = Product::create($validated);

        ActivityLog::log('create', 'product', $product->id, "Created product: {$product->name}");

        return redirect()->route('admin.products.index')->with('success', 'Product created.');
    }

    public function edit(Request $request, Product $product): Response
    {
        if (!$request->user()->hasPermission('products.update')) {
            abort(403);
        }

        $product->load('category');

        return Inertia::render('Admin/Products/Edit', [
            'product' => $product,
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        if (!$request->user()->hasPermission('products.update')) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['nullable', 'string', 'max:64'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'is_active' => ['required', 'boolean'],
            'image_url' => ['nullable', 'url', 'max:500'],
        ]);

        $product->update($validated);

        ActivityLog::log('update', 'product', $product->id, "Updated product: {$product->name}");

        return redirect()->route('admin.products.index')->with('success', 'Product updated.');
    }

    public function destroy(Request $request, Product $product): RedirectResponse
    {
        if (!$request->user()->hasPermission('products.delete')) {
            abort(403);
        }

        ActivityLog::log('delete', 'product', $product->id, "Deleted product: {$product->name}");

        $product->delete();

        return redirect()->route('admin.products.index')->with('success', 'Product deleted.');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        if (!$request->user()->hasPermission('products.delete')) {
            abort(403);
        }

        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:products,id'],
        ]);

        $count = Product::query()->whereIn('id', $validated['ids'])->delete();

        ActivityLog::log('delete', 'product', null, "Bulk deleted {$count} products");

        return redirect()->route('admin.products.index')->with('success', "{$count} products deleted.");
    }

    public function bulkUpdate(Request $request): RedirectResponse
    {
        if (!$request->user()->hasPermission('products.update')) {
            abort(403);
        }

        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:products,id'],
            'is_active' => ['required', 'boolean'],
        ]);

        $count = Product::query()->whereIn('id', $validated['ids'])->update(['is_active' => $validated['is_active']]);

        $status = $validated['is_active'] ? 'activated' : 'deactivated';
        ActivityLog::log('update', 'product', null, "Bulk {$status} {$count} products");

        return redirect()->route('admin.products.index')->with('success', "{$count} products {$status}.");
    }
}