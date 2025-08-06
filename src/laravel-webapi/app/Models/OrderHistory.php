<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderHistory extends Model
{
    use HasFactory;

    /**
     * テーブル名
     */
    protected $table = 'order_history';

    /**
     * 一括代入可能な属性
     */
    protected $fillable = [
        'order_id',
        'seat_id',
        'sushi_type',
        'quantity',
        'status'
    ];

    /**
     * 属性のキャスト
     */
    protected $casts = [
        'order_id' => 'integer',
        'seat_id' => 'integer',
        'sushi_type' => 'string',
        'quantity' => 'integer',
        'status' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * デフォルト値
     */
    protected $attributes = [
        'status' => 'pending'
    ];

    /**
     * 履歴が参照する注文
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    /**
     * 履歴が参照するテーブル席
     */
    public function seat(): BelongsTo
    {
        return $this->belongsTo(Seat::class, 'seat_id');
    }

    /**
     * 履歴の状態をチェック
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * 注文履歴を元に新しい注文を作成
     */
    public function recreateOrder(): Order
    {
        return Order::create([
            'seat_id' => $this->seat_id,
            'sushi_type' => $this->sushi_type,
            'quantity' => $this->quantity,
            'status' => 'pending'
        ]);
    }
}
