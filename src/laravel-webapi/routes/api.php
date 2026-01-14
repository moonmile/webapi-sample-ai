<?php

use App\Http\Controllers\SeatController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderHistoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductCategoryController;
use App\Http\Controllers\ProductStockController;
use App\Http\Controllers\HelloController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Termwind\Components\Raw;
use App\Http\Controllers\LoginController;

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


# Route::get('/products', [ProductController::class, 'index'])->name('products.index');
# Route::get('/products/{id}', [ProductController::class, 'show'])->name('products.show');
# Route::post('/products', [ProductController::class, 'store'])->name('products.store');
# Route::apiResource('products',ProductController::class );
# Route::resource('products',ProductController::class );
Route::apiResource('products', ProductController::class);

Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');

// ログイン認証（トークン）
Route::post('/login', [LoginController::class, 'login'])->name('login');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

// 認証が必要な注文API
Route::middleware('auth:sanctum')->group(function () {
    // Bearer トークン認証を適用するAPI
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{id}', [OrderController::class, 'show'])->name('orders.show');
    Route::put('/orders/{id}', [OrderController::class, 'update'])->name('orders.update');
    Route::delete('/orders/{id}', [OrderController::class, 'destroy'])->name('orders.destroy');
});

// 注文の新規作成だけは認証が必要ない
// API KEY で制限する
Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');




// ログイン認証（セッションを使う場合）
/*
Route::post('/login-with-session', [LoginController::class, 'login_with_session'])
    ->middleware('session')
    ->name('login.session');

Route::middleware('auth:sanctum')->group(function () {
    // Sanctum保護を適用するAPI
    Route::apiResource('orders', OrderController::class);
    Route::post('/logout', [LoginController::class, 'logout'])->name('logout');
});
*/


// 認証が必要な場合
/*
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/stocks', [ProductStockController::class, 'index'])->name('stocks.index');
    Route::get('/stocks/{product_id}', [ProductStockController::class, 'show'])->name('stocks.show');
    // ユーザ情報
    Route::get('/me', [AuthController::class, 'me'])->name('me');
});
*/

// API キー認証ミドルウェアを特定のエンドポイントに適用
/*
Route::middleware(['api'])->group(function () {
    Route::get('/stocks', [ProductStockController::class, 'index'])->name('stocks.index');
    Route::get('/stocks/{product_id}', [ProductStockController::class, 'show']);
});
*/

/*
Route::middleware('csrf')->group(function () {
    // 在庫情報は CSRF トークン検証ミドルウェアを適用
    Route::put('/stocks/{product_id}', [ProductStockController::class, 'update'])->name('stocks.update');
});
// シート情報あたりで試す
Route::put('seats/{id}', [SeatController::class, 'update'])->name('seats.update');
*/


# Route::get('/categories/{id}', [CategoryController::class, 'show'])->name('categories.show');
/*

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

Route::middleware(['auth:sanctum'])->group(function () {
    // 必要に応じて認証が必要なエンドポイントをここに移動

    // 例: 管理者のみアクセス可能な機能
    // Route::middleware(['admin'])->group(function () {
    //     Route::delete('seats/{id}', [SeatController::class, 'destroy']);
    //     Route::delete('products/{id}', [ProductController::class, 'destroy']);
    // });
});
*/
