<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * カテゴリ一覧取得
     * GET /api/categories
     */
    public function index(): JsonResponse
    {
        $categories = Category::paginate(15);

        return response()->json([
            'data' => $categories->items(),
            'meta' => [
                'total' => $categories->total(),
                'per_page' => $categories->perPage(),
                'current_page' => $categories->currentPage(),
                'last_page' => $categories->lastPage(),
            ]
        ]);
    }

    /**
     * カテゴリ作成
     * POST /api/categories
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string'
        ]);

        $category = Category::create($validated);

        return response()->json([
            'data' => $category
        ], 201);
    }

    /**
     * カテゴリ詳細取得
     * GET /api/categories/{id}
     */
    public function show(int $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        return response()->json([
            'data' => $category
        ]);
    }

    /**
     * カテゴリ更新
     * PUT /api/categories/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'description' => 'nullable|string'
        ]);

        $category->update($validated);

        return response()->json([
            'data' => $category->fresh()
        ]);
    }

    /**
     * カテゴリ削除
     * DELETE /api/categories/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return response()->json(null, 204);
    }
}
