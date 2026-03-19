<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()->with('category')->where('is_active', true)->orderByDesc('id');

        if ($request->filled('q')) {
            $q = (string) $request->string('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('sku', 'like', "%{$q}%");
            });
        }

        $products = $query->paginate(20)->withQueryString();

        $products->getCollection()->transform(function (Product $p) {
            return [
                'id' => $p->id,
                'category_id' => $p->category_id,
                'name' => $p->name,
                'sku' => $p->sku,
                'price' => $p->price,
                'rating' => $p->rating,
                'stock' => $p->stock,
                'image_url' => $p->image_url,
                'is_active' => (bool) $p->is_active,
                'created_at' => $p->created_at,
                'updated_at' => $p->updated_at,
            ];
        });

        return response()->json($products);
    }
}
