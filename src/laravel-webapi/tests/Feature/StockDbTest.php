<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\ProductStock;
use App\Models\Product;
use Database\Seeders\ProductStockSeeder;
use Database\Seeders\ProductSeeder;
/**
 * Eloquent の動作確認用テスト
 */

class StockDbTest extends TestCase
{
    /**
     * テスト開始前に、Stock / Product テーブルを初期化してシーディングする
     */
    protected function setUp(): void
    {
        parent::setUp();
        ProductStock::truncate();
        Product::truncate();
        // 初期値として seed データを投入
        $this->seed(ProductSeeder::class);
        $this->seed(ProductStockSeeder::class);
    }

    /**
     * テスト終了時に、Stock テーブルを空にする
     */
    protected function tearDown(): void
    {
        ProductStock::truncate();
        Product::truncate();
        parent::tearDown();
    }


    /**
     * 新しい商品の在庫を追加するテスト
     */
    public function testAddNewProductStock(): void
    {
        $product = new Product();
        $product->name = "Test Product";
        $product->price = 1000;
        $product->description = "This is a test product.";
        $product->save();

        $stock = new ProductStock();
        $stock->product_id = $product->id;
        $stock->quantity = 50;
        $stock->save();

        $this->assertDatabaseHas('product_stock', [
            'product_id' => $product->id,
            'quantity' => 50,
        ]);
    }

    /**
     * 既存商品の在庫を更新するテスト
     */
    public function testUpdateExistingProductStock(): void
    {
        // 事前に在庫データをチェックする
        $stock = ProductStock::where('product_id', 1)->first();
        $this->assertNotNull($stock, "ProductStock with product_id 1 should exist.");

        // 在庫数を更新
        $stock->quantity = 200;
        $stock->save();
        $this->assertDatabaseHas('product_stock', [
            'product_id' => 1,
            'quantity' => 200,
        ]);
    }

    /**
     * 在庫数の合計をチェックする
     */
    public function testTotalStockQuantity(): void
    {
        // 事前の在庫数をチェックする
        $totalQuantity = ProductStock::sum('quantity');
        $this->assertNotEquals(0, $totalQuantity, "Total stock quantity should not be zero.");

        // 在庫数を増やす
        $stock = ProductStock::where('product_id', 1)->first();
        $stock->quantity += 50;
        $stock->save();

        // 合計在庫数を再計算してチェック
        $newTotalQuantity = ProductStock::sum('quantity');
        $this->assertEquals($totalQuantity + 50, $newTotalQuantity);
    }
}


