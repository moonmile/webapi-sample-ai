<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Order;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 注文の初期値
        $orders = [
            [
                'seat_id' => 1,
                'product_id' => 2,
                'quantity' => 2,
                'status' => 'pending',
            ],
            [
                'seat_id' => 1,
                'product_id' => 3,
                'quantity' => 1,
                'status' => 'completed',
            ],
        ];
        foreach ($orders as $item) {
            Order::create($item);
        }

    }
}
