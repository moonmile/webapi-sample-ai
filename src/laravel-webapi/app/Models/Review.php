<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory;

    /**
     * テーブル名
     */
    protected $table = 'reviews';

    /**
     * 一括代入可能な属性
     */
    protected $fillable = [
        'rating',
        'comment',
        'product_id',
        'order_id',
        'seat_id',
    ];

    /**
     * 属性のキャスト
     */
    protected $casts = [
        'rating' => 'integer',
        'product_id' => 'integer',
        'order_id' => 'integer',
        'seat_id' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * レビュー対象の商品
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * レビュー対象の注文
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    /**
     * レビュー対象の席
     */
    public function seat(): BelongsTo
    {
        return $this->belongsTo(Seat::class, 'seat_id');
    }
}
