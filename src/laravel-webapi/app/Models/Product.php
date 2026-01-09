<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Product extends Model
{
    use HasFactory;

    /**
     * テーブル名
     */
    protected $table = 'products';

    /**
     * 一括代入可能な属性
     */
    protected $fillable = [
        'name',
        'price',
        'description',
        'image_url'
    ];

    /**
     * 属性のキャスト
     */
    protected $casts = [
        'name' => 'string',
        'price' => 'decimal:2',
        'description' => 'string',
        'image_url' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * この商品が属するカテゴリ一覧（多対多）
     */
    /*    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(
            Category::class,
            'product_categories',
            'product_id',
            'category_id'
        );
    }
    */
    /**
     * この商品が属するカテゴリー（多対一）
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class)->select('id', 'name');
    }

    /**
     * この商品の在庫情報
     */
    public function stock(): HasOne
    {
        return $this->hasOne(ProductStock::class, 'product_id');
    }

    /**
     * 商品に画像があるかチェック
     */
    public function hasImage(): bool
    {
        return !empty($this->image_url);
    }

    /**
     * 商品の在庫数を取得
     */
    public function getStockQuantity(): int
    {
        return $this->stock ? $this->stock->quantity : 0;
    }

    /**
     * 商品が在庫ありかチェック
     */
    public function isInStock(): bool
    {
        return $this->getStockQuantity() > 0;
    }

    /**
     * 価格を円表示でフォーマット
     */
    public function getFormattedPriceAttribute(): string
    {
        return '¥' . number_format($this->price);
    }

    /**
     * 商品の詳細説明があるかチェック
     */
    public function hasDescription(): bool
    {
        return !empty($this->description);
    }

    /**
     * 指定されたカテゴリに属するかチェック
     */
    public function belongsToCategory(int $categoryId): bool
    {
        return $this->categories()->where('category_id', $categoryId)->exists();
    }
}
