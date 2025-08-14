<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Laravel CORS Configuration
    |--------------------------------------------------------------------------
    | ※ config はシリアライズされる可能性があるためクロージャは避け、
    |   環境変数をその場で分解して静的配列化します。
    */

    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
    ],

    'allowed_methods' => ['*'],

    // 開発環境では全オリジン許可（本番では環境変数で制限）
    'allowed_origins' => env('APP_ENV') === 'production'
        ? array_filter(array_map('trim', explode(',', env('ALLOWED_CORS_ORIGINS', ''))))
        : ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 300,

    'supports_credentials' => false,
];
