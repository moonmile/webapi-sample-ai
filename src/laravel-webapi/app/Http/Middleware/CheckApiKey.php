<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckApiKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $expected = config('services.api.key'); // .env から読み出す想定
        $provided = $request->header('X-API-KEY');
        if (!$expected || $provided !== $expected) {
            return response()->json(['message' => 'Invalid API key'], 401);
        }
        return $next($request);
    }
}
