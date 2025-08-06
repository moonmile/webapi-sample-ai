<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    /**
     * テーブル名
     */
    protected $table = 'orders';

    /**
     * 一括代入可能な属性
     */
    protected $fillable = [
        'seat_id',
        'sushi_type',
        'quantity',
        'status'
    ];

    /**
     * 属性のキャスト
     */
    protected $casts = [
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
     * 注文が属するテーブル席
     */
    public function seat(): BelongsTo
    {
        return $this->belongsTo(Seat::class, 'seat_id');
    }

    /**
     * この注文の履歴一覧
     */
    public function orderHistories(): HasMany
    {
        return $this->hasMany(OrderHistory::class, 'order_id');
    }

    /**
     * 注文が保留中かチェック
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * 注文が進行中かチェック
     */
    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    /**
     * 注文が完了しているかチェック
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * 注文を進行中にする
     */
    public function startProgress(): bool
    {
        return $this->update(['status' => 'in_progress']);
    }

    /**
     * 注文を完了にする
     */
    public function complete(): bool
    {
        return $this->update(['status' => 'completed']);
    }

    /**
     * 合計金額を計算（商品価格が必要な場合）
     */
    public function calculateTotal(): float
    {
        // 実装例：商品マスタと連携して計算
        // return $this->quantity * $this->product->price;
        return 0.0; // 仮実装
    }
}
