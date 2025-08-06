<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Seat;

class SeatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 20テーブルの座席を作成
        for ($i = 1; $i <= 20; $i++) {
            Seat::create([
                'table_number' => $i,
                'status' => 'available',
            ]);
        }
    }
}
