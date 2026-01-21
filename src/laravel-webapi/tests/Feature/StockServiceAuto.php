<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Services\StockService;
use App\Models\ProductStock;

// プロンプト
// StockService の単体テストを StockServiceAuto.php に作成して。

class StockServiceAuto extends TestCase
{
    use RefreshDatabase;

    /**
     * 在庫レコードが存在しない場合に新規作成して在庫を加算できること
     */
    public function test_update_stock_creates_new_record_when_not_exists(): void
    {
        $service = new StockService();

        $result = $service->updateStockQuantity(1, 10);

        $this->assertTrue($result);

        $stock = ProductStock::where('product_id', 1)->first();

        $this->assertNotNull($stock);
        $this->assertSame(10, $stock->quantity);
    }

    /**
     * 既存在庫に対して在庫数を加算できること
     */
    public function test_update_stock_increments_existing_quantity(): void
    {
        // 事前に在庫 5 を登録
        ProductStock::create([
            'product_id' => 2,
            'quantity'   => 5,
        ]);

        $service = new StockService();

        $result = $service->updateStockQuantity(2, 3);

        $this->assertTrue($result);

        $stock = ProductStock::where('product_id', 2)->first();
        $this->assertSame(8, $stock->quantity);
    }

    /**
     * 在庫不足になる更新はロールバックされ false を返すこと
     */
    public function test_update_stock_fails_when_quantity_becomes_negative(): void
    {
        // 在庫 5 を登録
        ProductStock::create([
            'product_id' => 3,
            'quantity'   => 5,
        ]);

        $service = new StockService();

        $result = $service->updateStockQuantity(3, -10);

        $this->assertFalse($result);

        // 在庫は元のまま 5 のはず
        $stock = ProductStock::where('product_id', 3)->first();
        $this->assertSame(5, $stock->quantity);
    }
}
