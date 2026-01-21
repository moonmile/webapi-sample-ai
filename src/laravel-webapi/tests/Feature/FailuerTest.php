<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class FailuerTest extends TestCase
{
    /**
     * カテゴリ取得の件数の取得
     */
    public function testCategoryCountFailure(): void
    {
        // 実際はカテゴリの取得関数は存在しないため、
        // エラーになるはず
        $response = $this->get('/api/categories/info/count');
        // $response->assertStatus(200);
        // $response->assertJsonFragment(['count' => 10 ]);

        // テストコードの方を修正する場合
        $response->assertStatus(404);
    }
    /**
     * テストの失敗が成功になるように
     * CategoryController に count メソッドを追加する
     * 1. CategoryController.php に count メソッドを追加
     * 2. reoute/api.php にルーティングを設定
     */
    /*
    public function testCategoryCountSuccess(): void
    {
        // カテゴリの数が取得できるように変更する
        $response = $this->get('/api/categories/info/count');
        $response->assertStatus(200);
        $response->assertJsonFragment(['count' => 10 ]);
    }
    */
}
