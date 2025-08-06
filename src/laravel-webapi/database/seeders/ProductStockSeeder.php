<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ProductStock;

class ProductStockSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 各商品にランダムな在庫を設定
        for ($productId = 1; $productId <= 20; $productId++) {
            ProductStock::create([
                'product_id' => $productId,
                'quantity' => rand(10, 100), // 10-100個のランダムな在庫
            ]);
        }
    }
}
