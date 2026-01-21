<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ControllerTest extends TestCase
{
    /**
     * GET メソッドのテスト
     * /api/products/{id} にアクセスする
     */
    public function testGetProductById(): void
    {
        $response = $this->get('/api/products/1');
        $response->assertStatus(200);
        $response->assertJsonFragment(['id' => 1]);
        $response->assertJsonFragment(['name' => 'まぐろ']);

        // JSON 構造の確認
        // openapi.xaml の仕様に合わせる
        $response->assertJsonStructure([
            'data' => [
                'id',
                'name',
                'price',
                'description',
                'image_url',
                'created_at',
                'updated_at'
            ]
        ]);
    }

    /**
     * POST メソッドのテスト
     * /api/products にアクセスして新規作成
     * 一時的に、ProductController の store メソッドを有効にしておくこと
     */
    /*
    public function testCreateProduct(): void
    {
        $postData = [
            'name' => 'テスト商品',
            'price' => 500,
            'description' => 'これはテスト用の商品です。',
            'image_url' => 'http://example.com/image.jpg'
        ];
        $response = $this->postJson('/api/products', $postData);
        $response->assertStatus(201);
        $response->assertJsonFragment(['name' => 'テスト商品']);
        $response->assertJsonFragment(['price' => "500.00"]);

        $id = $response->json('data.id');
        // 作成した商品を取得して確認
        $getResponse = $this->get("/api/products/{$id}");
        $getResponse->assertStatus(200);
        $getResponse->assertJsonFragment(['name' => 'テスト商品']);
        $getResponse->assertJsonFragment(['price' => "500.00"]);
    }
    */

    /**
     * ヘッダーの設定
     * X-API-KEY を設定してリクエストを送るテスト
     * /api/orders に POST リクエストを送る
     */
    /*
    public function testCreateOrderWithApiKey(): void
    {
        $postData = [
            'seat_id' => 1,
            'product_id' => 1,
            'quantity' => 10,
            'status' => 'pending',
          ];
        $headers = [
            'X-API-KEY' => 'order_api_key_here' // 適切な API キーに置き換える
        ];
        $response = $this->postJson('/api/orders', $postData, $headers);
        $response->assertStatus(201);
        $response->assertJsonFragment(['seat_id' => 1]);
        $response->assertJsonFragment(['quantity' => 10]);

        $orderId = $response->json('data.id');
        // データベースを直接確認する
        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'seat_id' => 1,
            'quantity' => 10,
            'status' => 'pending'
        ]);
    }
    */

    /**
     * ログイン認証が必要なパターン
     * /api/orders/{id} に GET リクエストを送る
     */
    public function testGetOrderByIdWithAuth(): void
    {
        // /api/login エンドポイントで認証トークンを取得
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password'
        ]);
        $loginResponse->assertStatus(200);
        $token = $loginResponse->json('token');
        // 取得したトークンを使って認証付きリクエストを送る
        $headers = [
            'Authorization' => "Bearer {$token}"
        ];
        $response = $this->get('/api/orders/1', $headers);
        $response->assertStatus(200);
        $response->assertJsonFragment(['id' => 1]);
    }
}
