<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Services\StockService;
use App\Models\ProductStock;

class StockServiceTest extends TestCase
{
    /**
     * 在庫を更新する
     */
    public function testUpdateStock(): void
    {
        $service = new StockService();
        $result = $service->updateStockQuantity(1, 10);
        $this->assertTrue($result);

        // ProductStock テーブルを直接確認する
        $productStock = ProductStock::where('product_id', 1)->first();
        $this->assertEquals(10, $productStock->quantity);
    }

    /**
     * 在庫数を取得する
     */
    public function testGetStockQuantity(): void
    {
        $service = new StockService();
        // 事前に在庫数を設定
        $service->updateStockQuantity(2, 15);
        $quantity = $service->getStockQuantity(2);
        $this->assertEquals(15, $quantity);

        // 在庫が存在しない商品の場合、0が返ることを確認
        $quantity = $service->getStockQuantity(999);
        $this->assertEquals(0, $quantity);
    }

    /**
     * 在庫を減らすパターンのチェック
     */
    public function testDecreaseStock(): void
    {
        $service = new StockService();
        // 事前に在庫数を設定
        $service->updateStockQuantity(3, 20);
        $quantity = $service->getStockQuantity(3);
        $this->assertEquals(20, $quantity);

        //　10 だけ減らす
        $result = $service->decreaseStock(3, 10);
        $this->assertTrue($result);
        // 更に 9 だけ減らす
        $result = $service->decreaseStock(3, 9);
        $this->assertTrue($result);
        // 更に 2 だけ減らしてみる（在庫不足で失敗するはず）
        $result = $service->decreaseStock(3, 2);
        $this->assertFalse($result);
        // 在庫は 1 のまま変わらないはず
        $quantity = $service->getStockQuantity(3);
        $this->assertEquals(1, $quantity);
    }
}
