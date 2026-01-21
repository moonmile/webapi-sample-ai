<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\ProductStock;
use App\Models\Product;
use App\Models\Order;
use App\Models\Category;
use Database\Seeders\ProductStockSeeder;
use Database\Seeders\ProductSeeder;
use Database\Seeders\CategorySeeder;
use Illuminate\Validation\Rules\Can;
use Illuminate\Support\Facades\Schema;

/**
 * ユースケースを想定して、複数の Web API を呼び出すテスト
 */


class HttpUseCaseTest extends TestCase
{
    use RefreshDatabase;
    /**
     * テスト開始前に、Stock / Product テーブルを初期化してシーディングする
     */
    protected function setUp(): void
    {
        parent::setUp();
        // 初期値としてすべての seed データを投入
        Product::truncate();
        $this->seed();
    }

    /**
     * テスト終了時に、Stock テーブルを空にする
     */
    protected function tearDown(): void
    {
        parent::tearDown();
    }


    /**
     * 注文画面から注文を確定するまでのユースケース
     * 1. カテゴリ一覧を表示する
     * 2. カテゴリを選択して、商品一覧を表示する
     * 3. 商品をカートに追加する
     * 4. カートの中身を表示する
     * 5. 注文を確定する
     * 6. 注文完了画面を表示する
     */
    public function testCompleteOrderUseCase(): void
    {
        // カテゴリ一覧を表示
        $res = $this->getJson('/api/categories');
        $res->assertOk()->assertJsonStructure(['data' => [['id', 'name']]]);
        $categoryId = data_get($res->json(), 'data.0.id');

        // カテゴリに属する商品一覧を表示
        $res = $this->getJson("/api/categories/{$categoryId}");

        $res->assertOk()->assertJsonStructure([
            'data' => [
                'id',
                'name',
                'description',
                'products' => [
                    ['id', 'name', 'price'],
                ],
            ],
        ]);

        $productId = data_get($res->json(), 'data.products.0.id');

        // 商品をカートに追加
        // ここはクライアントで動作させる

        // カートの中身を表示
        // ここはクライアントで動作させる

        // 注文を確定する
        $order = [
            'seat_id'  => 1,
            'product_id' => $productId,
            'quantity' => 10,
            'status'   => 'pending',
        ];
        $headers = [
            'X-API-KEY' => 'order_api_key_here' // 適切な API キーに置き換える
        ];
        $res = $this->postJson('/api/orders', $order, $headers);
        $res->assertStatus(201)->assertJsonStructure(['data' => ['id']]);
        $orderId = data_get($res->json(), 'data.id');

        // 注文状態をデータベースでチェックする
        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'seat_id' => 1,
            'product_id' => $productId,
            'quantity' => 10,
            'status' => 'pending'
        ]);
    }

    /**
     * 管理画面からログイン認証の後に、商品の追加や削除を行うユースケース
     * 1. 管理者ユーザーでログインする
     * 2. 新しい商品を追加する
     * 3. 商品一覧を取得する
     * 4. 追加した商品の説明を更新する
     * 5. 追加した商品の情報を得る
     * 6. ログアウトする
     */
    public function testAdminProductManagementUseCase(): void
    {
        // 管理ユーザーでログイン
        $loginRes = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);
        $loginRes->assertOk()->assertJsonStructure(['token']);
        $token = data_get($loginRes->json(), 'token');
        $authHeader = ['Authorization' => "Bearer {$token}"];

        // 新しい商品を追加
        $product = [
            'name' => 'New Product',
            'price' => 1500,
            'description' => 'initial description',
            'category_id' => 1,
        ];
        $createRes = $this->postJson('/api/products', $product, $authHeader);
        $createRes->assertStatus(201)->assertJsonStructure(['data' => ['id']]);
        $productId = data_get($createRes->json(), 'data.id');

        // 商品一覧はページングされているため、個別取得で存在を確認する
        $this->getJson("/api/products/{$productId}", $authHeader)
            ->assertOk()
            ->assertJsonFragment(['id' => $productId]);

        // 追加した商品の説明を更新
        $updateRes = $this->patchJson("/api/products/{$productId}", [
            'description' => 'updated description',
        ], $authHeader);
        $updateRes->assertOk()->assertJsonFragment(['description' => 'updated description']);

        // 追加した商品の情報を得る
        $this->getJson("/api/products/{$productId}", $authHeader)
            ->assertOk()
            ->assertJsonFragment([
            'id' => $productId,
            'description' => 'updated description',
            ]);
        // データベース上で更新が反映されていることを確認
        $this->assertDatabaseHas('products', [
            'id' => $productId,
            'description' => 'updated description',
        ]);
        // ログアウトする
        $this->postJson('/api/logout', [], $authHeader)->assertNoContent();
    }


    /**
     * 異常シーケンスのチェック
     * 1. X-API-KEY なしで注文を試みる
     */
    public function testAbnormalOrderSequence(): void
    {

        // orders テーブルの初期注文数を取得
        $initialOrderCount = Order::count();
        // X-API-KEY なしで注文を試みる
        $order = [
            'seat_id'  => 1,
            'product_id' => 1,
            'quantity' => 100,
            'status'   => 'pending',
        ];
        // X-API-KEY なし
        $headers = [];
        $res = $this->postJson('/api/orders', $order, $headers);
        // エラーになる
        $res->assertStatus(401);

        // orders テーブルの注文数が増えていないことを確認
        $this->assertEquals($initialOrderCount, Order::count());
    }
    /**
     * 同時アクセスした場合の整合性チェック
     * 1. 複数のクライアントが同時に在庫を更新する
     */
    public function testConcurrentStockUpdates(): void
    {
        // 初期在庫数を設定
        ProductStock::where('product_id', 1)->update(['quantity' => 10]);
        $productId = 1 ;
        // 注文件数のチェック
        Order::truncate();  // クリアする
        $this->assertEquals(0, Order::count());

        // 客A,B が注文を同時に行う
        // 客A が商品を閲覧（このときに在庫はある）
        $this->getJson("/api/products/{$productId}")
            ->assertOk()
            ->assertJsonFragment(['id' => $productId]);

        // 客B が商品を閲覧（このときに在庫はある）
        $this->getJson("/api/products/{$productId}")
            ->assertOk()
            ->assertJsonFragment(['id' => $productId]);
        // 客B が商品を注文（注文したときに在庫がなくなる）
        $order = [
            'seat_id'  => 2,
            'product_id' => 1,
            'quantity' => 10,
            'status'   => 'pending',
        ];
        $headers = [
            'X-API-KEY' => 'order_api_key_here'
        ];
        $res = $this->postJson('/api/orders', $order, $headers);
        $res->assertStatus(201)->assertJsonStructure(['data' => ['id']]);
        $orderId = data_get($res->json(), 'data.id');

        // 客A が商品を注文（このときに在庫不足でエラーになる）
        $order = [
            'seat_id'  => 1,
            'product_id' => 1,
            'quantity' => 5,
            'status'   => 'pending',
        ];
        $res = $this->postJson('/api/orders', $order, $headers);
        $res->assertStatus(400);    // 在庫不足でエラーになる

        // 注文件数のチェック
        $this->assertEquals(1, Order::count());

    }
}


