<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // CORS を API グループに適用
        $middleware->appendToGroup('api', \Illuminate\Http\Middleware\HandleCors::class);


        // API キー認証ミドルウェアを API グループに適用
        // $middleware->appendToGroup('api', \App\Http\Middleware\CheckApiKey::class);
        // セッションを利用する場合
        $middleware->appendToGroup('session',
            [
                \Illuminate\Cookie\Middleware\EncryptCookies::class,
                \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
                \Illuminate\Session\Middleware\StartSession::class,
                \Illuminate\Routing\Middleware\SubstituteBindings::class,
            ]);



        // CSRF トークン検証ミドルウェアの設定
        // $middleware->validateCsrfTokens(except: ['*']); // いったんすべて除外
        // CSRF トークン検証ミドルウェアをセッショングループに適用
        $middleware->appendToGroup('csrf', [
                \Illuminate\Cookie\Middleware\EncryptCookies::class,
                \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
                \Illuminate\Session\Middleware\StartSession::class,
                \Illuminate\Routing\Middleware\SubstituteBindings::class,
                \Illuminate\View\Middleware\ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
        ]);



    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
