<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            // 認証成功
            $user = Auth::user();
            // Sanctum returns plainTextToken for API clients
            $token = $user->createToken('API Token');

            return response()->json([
                'token' => $token->plainTextToken,
                'token_type' => 'Bearer',
            ]);
        }
        // 認証失敗
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    // セッション認証用のログインメソッド
    public function login_with_session(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            // セッションを再生成（セキュリティ向上）
            $request->session()->regenerate();

            // セッションIDを取得
            $sessionId = $request->session()->getId();

            return response()->json([
                'success' => true,
                'session_id' => $sessionId,
                'user' => Auth::user()
            ]);
        }
        // 認証失敗
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()?->currentAccessToken();

        if ($token) {
            $token->delete();
        }

        return response()->noContent();
    }
}
