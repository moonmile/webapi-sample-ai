<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MyApiTokenMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $user_name = $request->header('X-API-USER');
        $user_token = $request->header('X-API-TOKEN');
        // 独自トークンの検証
        if ( check_api_token($user_name, $user_token) === false ) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        return $next($request);
    }
}
