<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * レビュー投稿
     * POST /api/reviews
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:1000',
            'product_id' => 'sometimes|nullable|integer|exists:products,id',
            'order_id' => 'sometimes|nullable|integer|exists:orders,id',
            'seat_id' => 'sometimes|nullable|integer|exists:seats,id',
        ]);

        $review = Review::create($validated);

        return response()->json([
            'data' => $review,
        ], 201);
    }
}
