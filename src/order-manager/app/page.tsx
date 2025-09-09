'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 認証状態をチェック
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (isAuthenticated) {
      // ログイン済みの場合は注文画面にリダイレクト
      router.push('/orders');
    } else {
      // 未ログインの場合はログイン画面にリダイレクト
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-xl">リダイレクト中...</div>
    </div>
  );
}
