<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
    /**
     * 商品一覧取得
     * GET /api/products
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with('categories')->orderByDesc('created_at');

        if ($request->filled('keyword')) {
            $keyword = $request->input('keyword');
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                    ->orWhere('description', 'like', "%{$keyword}%");
            });
        }

        $products = $query->paginate(15);

        return response()->json([
            'data' => $products->items(),
            'meta' => [
                'total' => $products->total(),
                'per_page' => $products->perPage(),
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
            ]
        ]);
    }

    /**
     * 商品作成
     * POST /api/products
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string|max:100',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer|exists:categories,id'
        ]);

        $categoryIds = $validated['category_ids'] ?? [];
        unset($validated['category_ids']);

        $product = Product::create($validated);
        if (!empty($categoryIds)) {
            $product->categories()->sync($categoryIds);
        }

        return response()->json([
            'data' => $product->load('categories')
        ], 201);
    }

    /**
     * 商品詳細取得
     * GET /api/products/{id}
     */
    public function show1(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        return response()->json([
            'data' => $product
        ]);
    }
    /**
     * 商品詳細取得（例外処理あり）
     * GET /api/products/{id}
     */
    public function show(int $id): JsonResponse
    {
        Log::debug("Entering ProductController@show with ID: {$id}");
        try {
            $product = Product::with('categories')->findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error("Product not found with ID: {$id}");
            return response()->json([
                'error' => 'Product not found',
                'data' => new \stdClass()  // 空のオブジェクトを返す
            ], 404);
        }
        return response()->json([
            'data' => $product
        ]);
    }

    /**
     * 商品更新
     * PUT /api/products/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'price' => 'sometimes|numeric|min:0',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string|max:100',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer|exists:categories,id'
        ]);

        $categoryIds = $validated['category_ids'] ?? null;
        unset($validated['category_ids']);

        $product->update($validated);

        if (is_array($categoryIds)) {
            $product->categories()->sync($categoryIds);
        }

        return response()->json([
            'data' => $product->fresh()->load('categories')
        ]);
    }

    /**
     * 商品削除
     * DELETE /api/products/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->categories()->detach();
        $product->delete();

        return response()->json(null, 204);
    }
}
