'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  clearStoredAuth,
  getLandingPath,
  getStoredAuth,
} from '../lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const auth = getStoredAuth();
    if (auth) {
      router.replace(getLandingPath(auth.email));
    } else {
      clearStoredAuth();
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.token) {
        throw new Error(data?.error ?? data?.message ?? 'ログインに失敗しました。');
      }

      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      localStorage.setItem(
        AUTH_USER_KEY,
        JSON.stringify({ email, tokenType: data.token_type ?? 'Bearer' })
      );
      router.replace(getLandingPath(email));
    } catch (error) {
      console.error('ログインエラー:', error);
      setError(error instanceof Error ? error.message : 'ログインに失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🍣 注文管理システム</h1>
          <p className="text-gray-600 mt-2">厨房スタッフログイン</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="メールアドレスを入力してください"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              パスワード
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="パスワードを入力してください"
              required
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">デモ用ログイン情報:</h3>
          <p className="text-sm text-blue-700">メールアドレス: test@example.com</p>
          <p className="text-sm text-blue-700">パスワード: password</p>
        </div>
      </div>
    </div>
  );
}
