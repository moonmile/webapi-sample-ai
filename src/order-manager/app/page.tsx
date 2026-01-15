'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearStoredAuth, getLandingPath, getStoredAuth } from './lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const auth = getStoredAuth();
    if (auth) {
      router.replace(getLandingPath(auth.email));
      return;
    }

    clearStoredAuth();
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-xl">リダイレクト中...</div>
    </div>
  );
}
