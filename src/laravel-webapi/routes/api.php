<?php

use App\Http\Controllers\SeatController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderHistoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductCategoryController;
use App\Http\Controllers\ProductStockController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\HelloController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Termwind\Components\Raw;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\DataSearchController;
use App\Http\Middleware\EnsureOrderApiKey;

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

// 公開商品の参照 API
Route::get('/products/{id}', [ProductController::class, 'show'])->name('products.show');
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
# Route::apiResource('products', ProductController::class)->only(['index', 'show']);
Route::get('/categories/{id}', [CategoryController::class, 'show'])->name('categories.show');
Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
# Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);



// Hello World エンドポイント
Route::get('/hello', [HelloController::class, 'index'])->name('hello.index');


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

    // 商品・カテゴリの更新系は認証必須
    Route::apiResource('products', ProductController::class)->except(['index', 'show']);
    Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);

    // 商品とカテゴリの紐づけ
    Route::prefix('product-categories')->name('product-categories.')->group(function () {
        Route::get('/', [ProductCategoryController::class, 'index'])->name('index');
        Route::post('/', [ProductCategoryController::class, 'store'])->name('store');
        Route::delete('/{product_id}/{category_id}', [ProductCategoryController::class, 'destroy'])->name('destroy');
    });
});

// 注文の新規作成だけは認証が必要ない
// API KEY で制限する
Route::post('/orders', [OrderController::class, 'store'])
    ->middleware(EnsureOrderApiKey::class)
    ->name('orders.store');

// CSRF トークンのみで保護されたレビュー投稿 API
Route::middleware('csrf')->group(function () {
    Route::post('/reviews', [ReviewController::class, 'store'])->name('reviews.store');
});

// DataSearchController のルート定義
Route::prefix('data-search')->name('data-search.')->group(function () {
    Route::get('/count', [DataSearchController::class, 'count'])->name('count');
    Route::get('/average', [DataSearchController::class, 'averagePrice'])->name('averagePrice');
    Route::get('/max-min', [DataSearchController::class, 'maxMinPrice'])->name('maxMinPrice');
    Route::get('/sum-by/{category_id}', [DataSearchController::class, 'sumByCategory'])->name('sumByCategory');
    Route::get('/distinct', [DataSearchController::class, 'distinctOrderProductIds'])->name('distinctOrderProductIds');
    Route::get('/group-by', [DataSearchController::class, 'groupByCategoryCollection'])->name('groupByCategoryCollection');
    Route::get('/closure', [DataSearchController::class, 'closureExample'])->name('closureExample');
    Route::get('/raw-sql', [DataSearchController::class, 'rawSqlExample'])->name('rawSqlExample');
    Route::get('/sql-log', [DataSearchController::class, 'sqlLogExample'])->name('sqlLogExample');
    Route::post('/transaction', [DataSearchController::class, 'transactionExample'])->name('transactionExample');
});



// 以下は、書籍の実験用に残す

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

// 入れ子になったプレフィックス
/*
Route::prefix('v1')->group(function () {
    Route::prefix('example')->group(function () {
        Route::get('/test', function () {
            Illuminate\Support\Facades\Log::debug(
                "Entering v1.example.index route: " . route("v1.example.index") );
            return response()->json(['message' => 'This is version 1 of the API']);
        })->name('v1.example.index');
    });
});
*/
