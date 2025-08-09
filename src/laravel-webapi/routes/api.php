<?php

use App\Http\Controllers\SeatController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderHistoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductCategoryController;
use App\Http\Controllers\ProductStockController;
use App\Http\Controllers\HelloController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| お寿司配膳システム API ルーティング
| OpenAPI 3.0.3 仕様に基づいて定義されたRESTful APIエンドポイント
|
*/

// ========== システム情報 API ==========

// API情報取得エンドポイント
Route::get('/', function () {
    return response()->json([
        'name' => 'お寿司配膳システム API',
        'version' => '1.0.0',
        'description' => 'Laravel を使ったお寿司配膳システムのREST API',
        'openapi_spec' => '/docs/openapi.yaml'
    ]);
});


// Hello World エンドポイント
Route::get('/hello', [HelloController::class, 'index'])->name('hello.index');



// ========== リソース API エンドポイント ==========

// ========== テーブル席 API ==========
Route::apiResource('seats', SeatController::class);

// ========== 注文 API ==========
Route::apiResource('orders', OrderController::class);

// ========== 注文履歴 API ==========
Route::prefix('order-history')->name('order-history.')->group(function () {
    Route::get('/', [OrderHistoryController::class, 'index'])->name('index');
    Route::post('/', [OrderHistoryController::class, 'store'])->name('store');
    Route::get('/{id}', [OrderHistoryController::class, 'show'])->name('show');
    Route::delete('/{id}', [OrderHistoryController::class, 'destroy'])->name('destroy');
});

// ========== 商品 API ==========
Route::apiResource('products', ProductController::class);

// ========== カテゴリ API ==========
Route::apiResource('categories', CategoryController::class);

// ========== 商品カテゴリ関連 API ==========
Route::prefix('product-categories')->name('product-categories.')->group(function () {
    Route::get('/', [ProductCategoryController::class, 'index'])->name('index');
    Route::post('/', [ProductCategoryController::class, 'store'])->name('store');
    Route::delete('/{product_id}/{category_id}', [ProductCategoryController::class, 'destroy'])->name('destroy');
});

// ========== 商品在庫 API ==========
Route::prefix('product-stock')->name('product-stock.')->group(function () {
    Route::get('/', [ProductStockController::class, 'index'])->name('index');
    Route::post('/', [ProductStockController::class, 'store'])->name('store');
    Route::get('/{product_id}', [ProductStockController::class, 'show'])->name('show');
    Route::put('/{product_id}', [ProductStockController::class, 'update'])->name('update');
    Route::delete('/{product_id}', [ProductStockController::class, 'destroy'])->name('destroy');
});

// ========== システム情報 API ==========

// ヘルスチェック用エンドポイント
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toISOString(),
        'service' => 'sushi-delivery-system'
    ]);
});

// バージョン情報エンドポイント
Route::get('/version', function () {
    return response()->json([
        'api_version' => '1.0.0',
        'laravel_version' => app()->version(),
        'php_version' => PHP_VERSION,
        'environment' => app()->environment()
    ]);
});

// ========== 認証が必要な API（本番環境用）==========

Route::middleware(['auth:api'])->group(function () {
    // 必要に応じて認証が必要なエンドポイントをここに移動

    // 例: 管理者のみアクセス可能な機能
    // Route::middleware(['admin'])->group(function () {
    //     Route::delete('seats/{id}', [SeatController::class, 'destroy']);
    //     Route::delete('products/{id}', [ProductController::class, 'destroy']);
    // });
});
