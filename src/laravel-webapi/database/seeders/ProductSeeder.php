<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            // 握り寿司 (カテゴリID: 1)
            ['name' => 'まぐろ', 'description' => '新鮮な本まぐろの赤身', 'price' => 180],
            ['name' => '中とろ', 'description' => 'とろける中とろ', 'price' => 350],
            ['name' => '大とろ', 'description' => '極上の大とろ', 'price' => 580],
            ['name' => 'サーモン', 'description' => 'ノルウェー産サーモン', 'price' => 150],
            ['name' => 'ぶり', 'description' => '脂ののったぶり', 'price' => 200],
            ['name' => 'はまち', 'description' => '旬のはまち', 'price' => 180],
            ['name' => 'えび', 'description' => '甘みのある車えび', 'price' => 160],
            ['name' => 'いか', 'description' => '歯ごたえの良いいか', 'price' => 140],
            ['name' => 'たこ', 'description' => '柔らかく煮たたこ', 'price' => 150],
            ['name' => 'うに', 'description' => '濃厚な北海道産うに', 'price' => 480],

            // 巻き寿司 (カテゴリID: 2)
            ['name' => 'かっぱ巻き', 'description' => 'きゅうりの細巻き', 'price' => 120],
            ['name' => '鉄火巻き', 'description' => 'まぐろの細巻き', 'price' => 180],
            ['name' => 'ネギトロ巻き', 'description' => 'ネギトロの巻き寿司', 'price' => 220],
            ['name' => 'カリフォルニアロール', 'description' => 'アボカドとカニの巻き寿司', 'price' => 280],
            ['name' => '太巻き', 'description' => '具だくさんの太巻き', 'price' => 320],

            // 軍艦巻き (カテゴリID: 3)
            ['name' => 'いくら軍艦', 'description' => 'つぶつぶのいくら', 'price' => 280],
            ['name' => 'うに軍艦', 'description' => '濃厚なうに', 'price' => 450],
            ['name' => 'ねぎとろ軍艦', 'description' => 'ねぎとろの軍艦巻き', 'price' => 200],

            // サイドメニュー (カテゴリID: 6)
            ['name' => '茶碗蒸し', 'description' => 'なめらかな茶碗蒸し', 'price' => 280],
            ['name' => '枝豆', 'description' => '塩ゆで枝豆', 'price' => 180],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
