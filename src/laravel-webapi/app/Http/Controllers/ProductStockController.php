<?php

namespace App\Http\Controllers;

use App\Models\ProductStock;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductStockController extends Controller
{
    /**
     * 商品在庫一覧取得
     * GET /api/product-stock
     */
    public function index(): JsonResponse
    {
        $productStock = ProductStock::paginate(15);

        return response()->json([
            'data' => $productStock->items(),
            'meta' => [
                'total' => $productStock->total(),
                'per_page' => $productStock->perPage(),
                'current_page' => $productStock->currentPage(),
                'last_page' => $productStock->lastPage(),
            ]
        ]);
    }

    /**
     * 商品在庫作成
     * POST /api/product-stock
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,id|unique:product_stock,product_id',
            'quantity' => 'required|integer|min:0'
        ]);

        $productStock = ProductStock::create($validated);

        return response()->json([
            'data' => $productStock
        ], 201);
    }

    /**
     * 商品在庫詳細取得
     * GET /api/product-stock/{product_id}
     */
    public function show(int $productId): JsonResponse
    {
        $productStock = ProductStock::where('product_id', $productId)->firstOrFail();

        return response()->json([
            'data' => $productStock
        ]);
    }

    /**
     * 商品在庫更新
     * PUT /api/product-stock/{product_id}
     */
    public function update(Request $request, int $productId): JsonResponse
    {
        $productStock = ProductStock::where('product_id', $productId)->firstOrFail();

        $validated = $request->validate([
            'quantity' => 'required|integer|min:0'
        ]);

        $productStock->update($validated);

        return response()->json([
            'data' => $productStock->fresh()
        ]);
    }

    /**
     * 商品在庫削除
     * DELETE /api/product-stock/{product_id}
     */
    public function destroy(int $productId): JsonResponse
    {
        $productStock = ProductStock::where('product_id', $productId)->firstOrFail();
        $productStock->delete();

        return response()->json(null, 204);
    }
}
