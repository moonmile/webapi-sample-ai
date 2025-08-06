<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductStock extends Model
{
    use HasFactory;

    /**
     * テーブル名
     */
    protected $table = 'product_stock';

    /**
     * 主キー
     */
    protected $primaryKey = 'product_id';

    /**
     * 主キーがインクリメントでない
     */
    public $incrementing = false;

    /**
     * タイムスタンプを使用しない
     */
    public $timestamps = false;

    /**
     * 一括代入可能な属性
     */
    protected $fillable = [
        'product_id',
        'quantity'
    ];

    /**
     * 属性のキャスト
     */
    protected $casts = [
        'product_id' => 'integer',
        'quantity' => 'integer',
    ];

    /**
     * 関連する商品
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * 在庫があるかチェック
     */
    public function isInStock(): bool
    {
        return $this->quantity > 0;
    }

    /**
     * 在庫が少ないかチェック（閾値：10個）
     */
    public function isLowStock(int $threshold = 10): bool
    {
        return $this->quantity <= $threshold && $this->quantity > 0;
    }

    /**
     * 在庫切れかチェック
     */
    public function isOutOfStock(): bool
    {
        return $this->quantity <= 0;
    }

    /**
     * 在庫を増やす
     */
    public function addStock(int $amount): bool
    {
        if ($amount < 0) {
            return false;
        }

        return $this->update(['quantity' => $this->quantity + $amount]);
    }

    /**
     * 在庫を減らす
     */
    public function reduceStock(int $amount): bool
    {
        if ($amount < 0 || $this->quantity < $amount) {
            return false;
        }

        return $this->update(['quantity' => $this->quantity - $amount]);
    }

    /**
     * 在庫をセット
     */
    public function setStock(int $quantity): bool
    {
        if ($quantity < 0) {
            return false;
        }

        return $this->update(['quantity' => $quantity]);
    }

    /**
     * 在庫状態を文字列で取得
     */
    public function getStockStatus(): string
    {
        if ($this->isOutOfStock()) {
            return '在庫切れ';
        } elseif ($this->isLowStock()) {
            return '在庫少';
        } else {
            return '在庫あり';
        }
    }

    /**
     * 指定数量の注文が可能かチェック
     */
    public function canOrder(int $orderQuantity): bool
    {
        return $this->quantity >= $orderQuantity;
    }
}
