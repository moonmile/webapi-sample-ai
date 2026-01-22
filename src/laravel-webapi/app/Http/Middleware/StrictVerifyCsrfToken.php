<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as BaseVerifyCsrfToken;

class StrictVerifyCsrfToken extends BaseVerifyCsrfToken
{
    /**
     * CSRF をテストでも必ず検証するため、単体テスト時のスキップを無効化する。
     */
    protected function runningUnitTests()
    {
        return false;
    }
}
