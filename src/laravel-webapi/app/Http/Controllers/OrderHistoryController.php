<?php

namespace App\Http\Controllers;

use App\Models\OrderHistory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class OrderHistoryController extends Controller
{
    /**
     * 注文履歴一覧取得
     * GET /api/order-history
     */
    public function index(Request $request): JsonResponse
    {
        $query = OrderHistory::query();

        // フィルタリング
        if ($request->has('order_id')) {
            $query->where('order_id', $request->order_id);
        }

        if ($request->has('seat_id')) {
            $query->where('seat_id', $request->seat_id);
        }

        $orderHistory = $query->paginate(15);

        return response()->json([
            'data' => $orderHistory->items(),
            'meta' => [
                'total' => $orderHistory->total(),
                'per_page' => $orderHistory->perPage(),
                'current_page' => $orderHistory->currentPage(),
                'last_page' => $orderHistory->lastPage(),
            ]
        ]);
    }

    /**
     * 注文履歴作成
     * POST /api/order-history
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
            'seat_id' => 'required|integer|exists:seats,id',
            'sushi_type' => 'required|string|max:100',
            'quantity' => 'required|integer|min:1',
            'status' => ['nullable', Rule::in(['pending', 'in_progress', 'completed'])]
        ]);

        $orderHistory = OrderHistory::create($validated);

        return response()->json([
            'data' => $orderHistory
        ], 201);
    }

    /**
     * 注文履歴詳細取得
     * GET /api/order-history/{id}
     */
    public function show(int $id): JsonResponse
    {
        $orderHistory = OrderHistory::findOrFail($id);

        return response()->json([
            'data' => $orderHistory
        ]);
    }

    /**
     * 注文履歴削除
     * DELETE /api/order-history/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $orderHistory = OrderHistory::findOrFail($id);
        $orderHistory->delete();

        return response()->json(null, 204);
    }
}
