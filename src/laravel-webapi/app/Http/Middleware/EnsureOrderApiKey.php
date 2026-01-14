<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOrderApiKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $configuredKey = (string) config('services.orders.api_key');
        $headerName = (string) (config('services.orders.api_key_header') ?? 'X-API-KEY');
        $providedKey = (string) $request->header($headerName);

        if ($configuredKey === '') {
            return response()->json([
                'message' => 'APIキーがサーバーに設定されていません。'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        if ($providedKey === '' || !hash_equals($configuredKey, $providedKey)) {
            return response()->json([
                'message' => 'APIキーが無効です。'
            ], Response::HTTP_UNAUTHORIZED);
        }

        return $next($request);
    }
}
