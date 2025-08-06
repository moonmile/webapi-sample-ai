<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Seat extends Model
{
    use HasFactory;

    /**
     * テーブル名
     */
    protected $table = 'seats';

    /**
     * 一括代入可能な属性
     */
    protected $fillable = [
        'table_number',
        'status'
    ];

    /**
     * 属性のキャスト
     */
    protected $casts = [
        'table_number' => 'integer',
        'status' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * デフォルト値
     */
    protected $attributes = [
        'status' => 'available'
    ];

    /**
     * このテーブル席の注文一覧
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'seat_id');
    }

    /**
     * このテーブル席の注文履歴一覧
     */
    public function orderHistories(): HasMany
    {
        return $this->hasMany(OrderHistory::class, 'seat_id');
    }

    /**
     * 席が利用可能かチェック
     */
    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }

    /**
     * 席を占有状態にする
     */
    public function occupy(): bool
    {
        return $this->update(['status' => 'occupied']);
    }

    /**
     * 席を利用可能状態にする
     */
    public function makeAvailable(): bool
    {
        return $this->update(['status' => 'available']);
    }
}
