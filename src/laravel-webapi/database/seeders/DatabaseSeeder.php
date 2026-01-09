<?php

namespace Database\Seeders;

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
            UserSeeder::class,
        ]);
    }
}
