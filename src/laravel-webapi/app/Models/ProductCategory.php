<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductCategory extends Model
{
    use HasFactory;

    /**
     * テーブル名
     */
    protected $table = 'product_categories';

    /**
     * 主キーの設定（複合キー）
     */
    protected $primaryKey = ['product_id', 'category_id'];

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
        'category_id'
    ];

    /**
     * 属性のキャスト
     */
    protected $casts = [
        'product_id' => 'integer',
        'category_id' => 'integer',
    ];

    /**
     * 関連する商品
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * 関連するカテゴリ
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    /**
     * 複合キーに対応したfindメソッド
     */
    public static function findByCompositeKey(int $productId, int $categoryId)
    {
        return static::where('product_id', $productId)
            ->where('category_id', $categoryId)
            ->first();
    }

    /**
     * 商品とカテゴリの関連が存在するかチェック
     */
    public static function relationExists(int $productId, int $categoryId): bool
    {
        return static::where('product_id', $productId)
            ->where('category_id', $categoryId)
            ->exists();
    }

    /**
     * 商品とカテゴリの関連を安全に作成
     */
    public static function createRelation(int $productId, int $categoryId): ?self
    {
        if (static::relationExists($productId, $categoryId)) {
            return null; // 既に存在する場合はnullを返す
        }

        return static::create([
            'product_id' => $productId,
            'category_id' => $categoryId
        ]);
    }

    /**
     * 複合キーの設定
     */
    protected function setKeysForSaveQuery($query)
    {
        $keys = $this->getKeyName();
        if (!is_array($keys)) {
            return parent::setKeysForSaveQuery($query);
        }

        foreach ($keys as $keyName) {
            $query->where($keyName, '=', $this->getKeyForSaveQuery($keyName));
        }

        return $query;
    }

    /**
     * 複合キーのための属性取得
     */
    protected function getKeyForSaveQuery($keyName = null)
    {
        if (is_null($keyName)) {
            $keyName = $this->getKeyName();
        }

        if (isset($this->original[$keyName])) {
            return $this->original[$keyName];
        }

        return $this->getAttribute($keyName);
    }
}
