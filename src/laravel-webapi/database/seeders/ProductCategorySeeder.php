<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ProductCategory;

class ProductCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 商品とカテゴリの関連付け
        $productCategories = [
            // 握り寿司 (カテゴリID: 1)
            ['product_id' => 1, 'category_id' => 1],  // まぐろ
            ['product_id' => 2, 'category_id' => 1],  // 中とろ
            ['product_id' => 3, 'category_id' => 1],  // 大とろ
            ['product_id' => 4, 'category_id' => 1],  // サーモン
            ['product_id' => 5, 'category_id' => 1],  // ぶり
            ['product_id' => 6, 'category_id' => 1],  // はまち
            ['product_id' => 7, 'category_id' => 1],  // えび
            ['product_id' => 8, 'category_id' => 1],  // いか
            ['product_id' => 9, 'category_id' => 1],  // たこ
            ['product_id' => 10, 'category_id' => 1], // うに

            // 巻き寿司 (カテゴリID: 2)
            ['product_id' => 11, 'category_id' => 2], // かっぱ巻き
            ['product_id' => 12, 'category_id' => 2], // 鉄火巻き
            ['product_id' => 13, 'category_id' => 2], // ネギトロ巻き
            ['product_id' => 14, 'category_id' => 2], // カリフォルニアロール
            ['product_id' => 15, 'category_id' => 2], // 太巻き

            // 軍艦巻き (カテゴリID: 3)
            ['product_id' => 16, 'category_id' => 3], // いくら軍艦
            ['product_id' => 17, 'category_id' => 3], // うに軍艦
            ['product_id' => 18, 'category_id' => 3], // ねぎとろ軍艦

            // サイドメニュー (カテゴリID: 6)
            ['product_id' => 19, 'category_id' => 6], // 茶碗蒸し
            ['product_id' => 20, 'category_id' => 6], // 枝豆

            // 特選寿司としても分類（一部の高級商品）
            ['product_id' => 3, 'category_id' => 5],  // 大とろ
            ['product_id' => 10, 'category_id' => 5], // うに
            ['product_id' => 17, 'category_id' => 5], // うに軍艦
        ];

        foreach ($productCategories as $productCategory) {
            ProductCategory::create($productCategory);
        }
    }
}
