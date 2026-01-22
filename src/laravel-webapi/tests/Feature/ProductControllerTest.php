<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\ProductStock;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

class ProductControllerTest extends TestCase
{
    /**
     * GET メソッドのテスト
     * /api/products/{id} にアクセスする
     */
    public function testGetProductById(): void
    {
        $response = $this->get('/api/products/1');
        $response->assertStatus(200);
        $response->assertJsonFragment(['id' => 1 ]);
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

    /**
     * ヘッダーの設定
     * X-API-KEY を設定してリクエストを送るテスト
     * /api/orders に POST リクエストを送る
     */
    public function testCreateOrderWithApiKey(): void
    {
        // 在庫が足りず 400 にならないよう、事前に在庫を準備しておく
        ProductStock::updateOrCreate(
            ['product_id' => 1],
            ['quantity' => 100]
        );

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

    /**
     * ヘッダーの設定
     * X-API-KEY を設定してリクエストを送るテスト
     * /api/orders に POST リクエストを送る
     */
    public function testCreateOrderWithApiKeyError(): void
    {
        // 在庫が足りず 400 にならないよう、事前に在庫を準備しておく
        ProductStock::updateOrCreate(
            ['product_id' => 1],
            ['quantity' => 100]
        );

        $postData = [
            'seat_id' => 1,
            'product_id' => 1,
            'quantity' => 10,
            'status' => 'pending',
          ];
        $headers = [
            'X-API-KEY' => 'order_api_key_error' // 不正な API キー
        ];
        $response = $this->postJson('/api/orders', $postData, $headers);
        $response->assertStatus(401); // Unauthorized
    }

    /**
     * ログイン認証が必要なパターン
     * /api/orders/{id} に GET リクエストを送る
     */
    public function testGetOrderByIdWithAuth(): void
    {
        // Sanctum はベアラートークンのみを見るようにする（セッションガードを使わない）
        config(['sanctum.guard' => []]);

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
        $response = $this
            ->getJson('/api/orders/1', $headers);
        $response->assertStatus(200);
        $response->assertJsonFragment(['id' => 1]);
    }

    /**
     * ログイン認証が必要なパターン（失敗）
     * /api/orders/{id} に GET リクエストを送る
     */
    public function testGetOrderByIdWithAuthError(): void
    {
        // Sanctum はベアラートークンのみを見るようにする（セッションガードを使わない）
        config(['sanctum.guard' => []]);

        // /api/login エンドポイントで認証トークンを取得
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password'
        ]);
        $loginResponse->assertStatus(200);
        $token = $loginResponse->json('token');
        // 取得したトークンを使って認証付きリクエストを送る
        $headers = [
            'Authorization' => "Bearer XXXXX" // 不正なトークン
        ];
        $response = $this
            ->getJson('/api/orders/1', $headers);
        $response->assertStatus(401);
    }

    /**
     * CSRF トークンが必要なパターン
     * /api/reviews に POST リクエストを送る
     */
    public function testCreateReviewWithCsrfToken(): void
    {
        $csrfToken = 'valid-token';
        $postData = [
            'product_id' => 1,
            'rating' => 5,
            'comment' => '素晴らしい商品です！'
        ];
        $headers = [
            'X-CSRF-TOKEN' => $csrfToken
        ];

        // CSRF グループとセッション系ミドルウェアを有効化して正規のトークンを送る
        $response = $this
            ->withSession(['_token' => $csrfToken])
            ->postJson('/api/reviews', $postData, $headers);
        $response->assertStatus(201);
        $response->assertJsonFragment(['product_id' => 1]);
        $response->assertJsonFragment(['rating' => 5]);

        $reviewId = $response->json('data.id');
        // データベースを直接確認する
        $this->assertDatabaseHas('reviews', [
            'id' => $reviewId,
            'product_id' => 1,
            'rating' => 5,
            'comment' => '素晴らしい商品です！'
        ]);
    }

    /**
     * CSRF トークンが必要なパターン
     * /api/reviews に POST リクエストを送る
     */
    public function testCreateReviewWithCsrfTokenError(): void
    {
        $postData = [
            'product_id' => 1,
            'rating' => 5,
            'comment' => '素晴らしい商品です！'
        ];
        $headers = [
            'X-CSRF-TOKEN' => 'xxxxxx' // 不正なトークン
        ];

        // ミドルウェアを有効にした状態で誤ったトークンを送ると 419 になることを確認
        $response = $this
            ->postJson('/api/reviews', $postData, $headers);
        $response->assertStatus(419);
    }

}
