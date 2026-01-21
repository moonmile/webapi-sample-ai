<?php

namespace App\Services;

use App\Models\ProductStock;
use Illuminate\Support\Facades\DB;

class StockService
{
    /**
     * 在庫数を更新する
     */
    public function updateStockQuantity(int $productId, int $quantity): bool
    {
        try {
            DB::beginTransaction();

            $stock = ProductStock::where('product_id', $productId)->lockForUpdate()->first();

            if (!$stock) {
                // 在庫レコードが存在しない場合は新規作成
                $stock = new ProductStock();
                $stock->product_id = $productId;
                $stock->quantity = 0;
            }

            // 在庫数を更新
            $stock->quantity = $quantity;

            // 在庫数がマイナスにならないようにチェック
            if ($stock->quantity < 0) {
                throw new \Exception('在庫数が不足しています。');
            }

            $stock->save();

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            // ログ出力などのエラーハンドリングを行う
            return false;
        }
    }

    /*
     * 在庫数を取得する
     */
    public function getStockQuantity(int $productId): int
    {
        $stock = ProductStock::where('product_id', $productId)->first();
        return $stock ? $stock->quantity : 0;
    }

    /**
     * 在庫を n だけ減らす
     */
    public function decreaseStock(int $productId, int $n): bool
    {
        $stock = $this->getStockQuantity( $productId );
        return $this->updateStockQuantity($productId, $stock - $n);
    }

    /**
     * 在庫を n だけ増やす
     */
    public function increaseStock(int $productId, int $n): bool
    {
        $stock = $this->getStockQuantity( $productId );
        return $this->updateStockQuantity($productId, $stock + $n);
    }

    /**
     * 新規の商品を追加する
     */
    public function addNewProduct(int $productId, int $initialQuantity): bool
    {
        try {
            DB::beginTransaction();

            $stock = ProductStock::where('product_id', $productId)->lockForUpdate()->first();

            if ($stock) {
                throw new \Exception('商品は既に存在しています。');
            }

            $stock = new ProductStock();
            $stock->product_id = $productId;
            $stock->quantity = $initialQuantity;
            $stock->save();

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            // ログ出力などのエラーハンドリングを行う
            return false;
        }
    }

    /**
     * 在庫の一覧を取得する
     * 商品名も含む
     */
    public function getAllStocks(): array
    {
        $stocks = ProductStock::with('product')
            ->orderBy('product_id', 'asc')
            ->get();

        return $stocks->toArray();
    }
}
