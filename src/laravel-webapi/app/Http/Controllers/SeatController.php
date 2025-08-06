<?php

namespace App\Http\Controllers;

use App\Models\Seat;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class SeatController extends Controller
{
    /**
     * テーブル席一覧取得
     * GET /api/seats
     */
    public function index(): JsonResponse
    {
        $seats = Seat::paginate(15);

        return response()->json([
            'data' => $seats->items(),
            'meta' => [
                'total' => $seats->total(),
                'per_page' => $seats->perPage(),
                'current_page' => $seats->currentPage(),
                'last_page' => $seats->lastPage(),
            ]
        ]);
    }

    /**
     * テーブル席作成
     * POST /api/seats
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'table_number' => 'required|integer|min:1',
            'status' => ['nullable', Rule::in(['available', 'occupied'])]
        ]);

        $seat = Seat::create($validated);

        return response()->json([
            'data' => $seat
        ], 201);
    }

    /**
     * テーブル席詳細取得
     * GET /api/seats/{id}
     */
    public function show(int $id): JsonResponse
    {
        $seat = Seat::findOrFail($id);

        return response()->json([
            'data' => $seat
        ]);
    }

    /**
     * テーブル席更新
     * PUT /api/seats/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $seat = Seat::findOrFail($id);

        $validated = $request->validate([
            'table_number' => 'sometimes|integer|min:1',
            'status' => ['sometimes', Rule::in(['available', 'occupied'])]
        ]);

        $seat->update($validated);

        return response()->json([
            'data' => $seat->fresh()
        ]);
    }

    /**
     * テーブル席削除
     * DELETE /api/seats/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $seat = Seat::findOrFail($id);
        $seat->delete();

        return response()->json(null, 204);
    }
}
