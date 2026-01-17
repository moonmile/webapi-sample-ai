<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Model\Prodocut;
use App\Models\Product;
use App\Models\Category;
use App\Models\ProductCategory;
use App\Models\Order;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Can;

/**
 * 第6章用のデータ検索用のコントローラー
 */
class DataSearchController extends Controller
{
    // データ件数を取得する
    function count() {
        $cnt = Product::count();
        return response()->json(['count' => $cnt]);
    }

    // 平均価格を取得する
    function averagePrice() {
        $avg = Product::average('price');
        return response()->json(['average_price' => $avg]);
    }

    // 最大価格と最小価格を取得する
    function maxMinPrice() {
        $max = Product::max('price');
        $min = Product::min('price');
        return response()->json(['max_price' => $max, 'min_price' => $min]);
    }


    // カテゴリ ID を指定して 価格の合計を取得する
    function sumByCategory($category_id) {
        // product_categories ピボット経由でカテゴリに属する商品を集計
        $sum = Product::whereHas('productCategories', function ($query) use ($category_id) {
                $query->where('category_id', $category_id);
            })
            ->sum('price');

        return response()->json(['category_id' => $category_id, 'sum' => $sum]);
    }

    // distinct の例
    // orders テーブルの中で、異なる product_id 一覧を取得する
    function distinctOrderProductIds() {
        $items = Order::distinct()->get(['product_id']);
        return response()->json(['items' => $items]);
    }

    // groupBy の例
    function groupByCategoryCollection() {
        // product_categories ピボット経由でカテゴリごとの集計を実施
        $grouped = ProductCategory::with('product')
            ->get()
            ->groupBy('category_id')
            ->map(function ($items, $categoryId) {
                $prices = $items->map(function ($pivot) {
                    return optional($pivot->product)->price;
                })->filter();

                return [
                    'category_id' => (int) $categoryId,
                    'total_price' => $prices->sum(),
                    'average_price' => $prices->avg(),
                    'product_count' => $prices->count(),
                ];
            })
            ->values();

        return response()->json($grouped);
    }

    // クロージャを使った例
    function closureExample() {
        \DB::enableQueryLog();


        $products = Product::with(['categories:id,name'])
            ->where('price', '<', 500)
            ->whereHas('categories', function ($query) {
                $query->whereIn('name', ['握り寿司', '巻き寿司']);
            })
            ->get();

        $queries = collect(\DB::getQueryLog())->map(function ($q) {
            return [
                'sql' => $q['query'],
                'bindings' => $q['bindings'],
                'time_ms' => $q['time'],
                'sql_with_bindings' => Str::replaceArray('?', $q['bindings'], $q['query']),
            ];
        });
        \Log::debug('closureExample Queries: ', $queries->toArray());


        return response()->json(['products' => $products]);
    }

    // SQL 文を直接実行する例
    function rawSqlExample() {
        // DB::raw を使わず、プレースホルダ付きの生SQL文字列で実行
        $products = \DB::select(
            'SELECT * FROM products WHERE price < ?',
            [500]
        );
        return response()->json(['products' => $products]);
    }

    // 実行する SQL 文をログに記録する例
    function sqlLogExample() {
        \DB::enableQueryLog();
        $products = Product::where('price', '<', 500)->get();
        $queries = collect(\DB::getQueryLog())->map(function ($q) {
            return [
                'sql' => $q['query'],
                'bindings' => $q['bindings'],
                'time_ms' => $q['time'],
                'sql_with_bindings' => Str::replaceArray('?', $q['bindings'], $q['query']),
            ];
        });
        \Log::debug('Executed Queries: ', $queries->toArray());

        return response()->json([
            'queries' => $queries,
            'products' => $products,
        ]);
    }

    // トランザクションの例
    function transactionExample() {
        \DB::beginTransaction();
        try {
            // 新規のカテゴリを作成する
            $category = new Category();
            $category->name = 'New Category';
            $category->description = 'This is a new category';
            $category->save();
            // 新しい商品を追加する
            $product = new Product();
            $product->name = '新しい商品';
            $product->price = 999;
            $product->save();
            // カテゴリに商品を関連付ける
            (new ProductCategory([
                'product_id' => $product->id,
                'category_id' => $category->id
            ]))->save();
            // 全体をコミットする
            \DB::commit();
            return response()->json(['message' => 'Product created successfully', 'product' => $product]);
        } catch (\Exception $e) {
            \DB::rollBack();
            return response()->json(['message' => 'Transaction failed', 'error' => $e
->getMessage()], 500);
        }
    }
}
