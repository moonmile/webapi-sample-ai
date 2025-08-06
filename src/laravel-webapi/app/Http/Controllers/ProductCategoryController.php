<?php

namespace App\Http\Controllers;

use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ProductCategoryController extends Controller
{
    /**
     * 商品カテゴリ関連一覧取得
     * GET /api/product-categories
     */
    public function index(Request $request): JsonResponse
    {
        $query = ProductCategory::query();

        // フィルタリング
        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $productCategories = $query->paginate(15);

        return response()->json([
            'data' => $productCategories->items(),
            'meta' => [
                'total' => $productCategories->total(),
                'per_page' => $productCategories->perPage(),
                'current_page' => $productCategories->currentPage(),
                'last_page' => $productCategories->lastPage(),
            ]
        ]);
    }

    /**
     * 商品カテゴリ関連作成
     * POST /api/product-categories
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'category_id' => 'required|integer|exists:categories,id'
        ]);

        // 重複チェック
        $exists = ProductCategory::where('product_id', $validated['product_id'])
            ->where('category_id', $validated['category_id'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'この商品とカテゴリの関連は既に存在します',
                'errors' => [
                    'product_category' => ['この組み合わせは既に存在します']
                ]
            ], 422);
        }

        $productCategory = ProductCategory::create($validated);

        return response()->json([
            'data' => $productCategory
        ], 201);
    }

    /**
     * 商品カテゴリ関連削除
     * DELETE /api/product-categories/{product_id}/{category_id}
     */
    public function destroy(int $productId, int $categoryId): JsonResponse
    {
        $productCategory = ProductCategory::where('product_id', $productId)
            ->where('category_id', $categoryId)
            ->firstOrFail();

        $productCategory->delete();

        return response()->json(null, 204);
    }
}
