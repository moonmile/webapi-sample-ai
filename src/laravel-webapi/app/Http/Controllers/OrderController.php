<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    /**
     * 注文一覧取得
     * GET /api/orders
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::query();

        // フィルタリング
        if ($request->has('seat_id')) {
            $query->where('seat_id', $request->seat_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->paginate(15);

        return response()->json([
            'data' => $orders->items(),
            'meta' => [
                'total' => $orders->total(),
                'per_page' => $orders->perPage(),
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
            ]
        ]);
    }

    /**
     * 注文作成
     * POST /api/orders
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'seat_id' => 'required|integer|exists:seats,id',
            'sushi_type' => 'required|string|max:100',
            'quantity' => 'required|integer|min:1',
            'status' => ['nullable', Rule::in(['pending', 'in_progress', 'completed'])]
        ]);

        $order = Order::create($validated);

        return response()->json([
            'data' => $order
        ], 201);
    }

    /**
     * 注文詳細取得
     * GET /api/orders/{id}
     */
    public function show(int $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        return response()->json([
            'data' => $order
        ]);
    }

    /**
     * 注文更新
     * PUT /api/orders/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'seat_id' => 'sometimes|integer|exists:seats,id',
            'sushi_type' => 'sometimes|string|max:100',
            'quantity' => 'sometimes|integer|min:1',
            'status' => ['sometimes', Rule::in(['pending', 'in_progress', 'completed'])]
        ]);

        $order->update($validated);

        return response()->json([
            'data' => $order->fresh()
        ]);
    }

    /**
     * 注文削除
     * DELETE /api/orders/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $order = Order::findOrFail($id);
        $order->delete();

        return response()->json(null, 204);
    }
}
