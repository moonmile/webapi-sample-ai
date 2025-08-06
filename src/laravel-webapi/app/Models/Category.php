<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Category extends Model
{
    use HasFactory;

    /**
     * テーブル名
     */
    protected $table = 'categories';

    /**
     * 一括代入可能な属性
     */
    protected $fillable = [
        'name',
        'description'
    ];

    /**
     * 属性のキャスト
     */
    protected $casts = [
        'name' => 'string',
        'description' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * このカテゴリに属する商品一覧（多対多）
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(
            Product::class,
            'product_categories',
            'category_id',
            'product_id'
        );
    }

    /**
     * カテゴリに説明があるかチェック
     */
    public function hasDescription(): bool
    {
        return !empty($this->description);
    }

    /**
     * このカテゴリの商品数を取得
     */
    public function getProductCount(): int
    {
        return $this->products()->count();
    }

    /**
     * このカテゴリに商品があるかチェック
     */
    public function hasProducts(): bool
    {
        return $this->getProductCount() > 0;
    }

    /**
     * 指定された商品がこのカテゴリに属するかチェック
     */
    public function hasProduct(int $productId): bool
    {
        return $this->products()->where('product_id', $productId)->exists();
    }

    /**
     * このカテゴリの商品を価格順で取得
     */
    public function getProductsByPrice($direction = 'asc')
    {
        return $this->products()->orderBy('price', $direction);
    }
}
