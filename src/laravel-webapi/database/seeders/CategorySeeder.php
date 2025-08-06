<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => '握り寿司',
                'description' => '新鮮なネタを使った伝統的な握り寿司です。',
            ],
            [
                'name' => '巻き寿司',
                'description' => '海苔で巻いた美味しい巻き寿司各種です。',
            ],
            [
                'name' => '軍艦巻き',
                'description' => 'いくらやウニなどの軍艦巻きです。',
            ],
            [
                'name' => '海鮮丼',
                'description' => '新鮮な海の幸をのせた豪華な海鮮丼です。',
            ],
            [
                'name' => '特選寿司',
                'description' => '厳選された高級ネタを使用した特選寿司です。',
            ],
            [
                'name' => 'サイドメニュー',
                'description' => '寿司と一緒に楽しめるサイドメニューです。',
            ],
            [
                'name' => '汁物',
                'description' => '温かい汁物で食事を彩ります。',
            ],
            [
                'name' => 'デザート',
                'description' => '食後に楽しめる和風デザートです。',
            ],
            [
                'name' => '飲み物',
                'description' => 'お茶やジュースなどの飲み物です。',
            ],
            [
                'name' => '季節限定',
                'description' => '季節の食材を使った限定メニューです。',
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
