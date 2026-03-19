<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::orderBy('id')->get()->map(function (Category $c) {
            return [
                'id' => $c->id,
                'name' => $c->name,
                'slug' => $c->slug,
            ];
        });

        return response()->json($categories);
    }
}
