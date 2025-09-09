'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [guests, setGuests] = useState(1);
  const router = useRouter();

  const startOrder = () => {
    // セッションストレージに人数を保存
    sessionStorage.setItem('guests', guests.toString());
    router.push('/categories');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-red-600 mb-2">🍣</h1>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">お寿司注文システム</h2>
          <p className="text-gray-600">ようこそ！ご着席ありがとうございます</p>
        </div>

        <div className="mb-8">
          <label className="block text-lg font-semibold text-gray-700 mb-4">
            ご利用人数を選択してください
          </label>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setGuests(Math.max(1, guests - 1))}
              className="w-12 h-12 rounded-full bg-red-100 text-red-600 font-bold text-xl hover:bg-red-200 transition-colors"
              disabled={guests <= 1}
            >
              −
            </button>
            <div className="w-20 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-3xl font-bold text-gray-800">{guests}</span>
            </div>
            <button
              onClick={() => setGuests(Math.min(8, guests + 1))}
              className="w-12 h-12 rounded-full bg-red-100 text-red-600 font-bold text-xl hover:bg-red-200 transition-colors"
              disabled={guests >= 8}
            >
              ＋
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">最大8名様まで</p>
        </div>

        <button
          onClick={startOrder}
          className="w-full bg-red-600 text-white text-xl font-bold py-4 rounded-xl hover:bg-red-700 transition-colors shadow-lg"
        >
          注文開始
        </button>

        <div className="mt-6 text-sm text-gray-500">
          <p>テーブル番号: <span className="font-semibold">T-001</span></p>
        </div>
      </div>
    </div>
  );
}
