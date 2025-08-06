<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // お寿司配膳システムの初期データを投入
        $this->call([
            CategorySeeder::class,
            SeatSeeder::class,
            ProductSeeder::class,
            ProductCategorySeeder::class,
            ProductStockSeeder::class,
        ]);

        // テストユーザーの作成（開発用）
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }
}
