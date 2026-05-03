'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Home() {
  const [guests, setGuests] = useState(2); // デフォルト2
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableNumber = searchParams.get('table') || 'T-001'; // 動的に取得、デフォルトT-001

  const startOrder = () => {
    // セッションストレージに人数を保存
    sessionStorage.setItem('guests', guests.toString());
    router.push('/categories');
  };

  const handleGuestSelect = (num: number) => {
    setGuests(num);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-600 mb-2">🍣 日経寿司へようこそ</h1>
          <p className="text-gray-600">心を込めたお寿司をお楽しみください</p>
        </div>

        <div className="mb-8">
          <p className="text-lg font-semibold text-gray-700 mb-4">
            テーブル番号: {tableNumber}
          </p>
          <label className="block text-lg font-semibold text-gray-700 mb-4">
            何名様でお越しですか？
          </label>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <button
                key={num}
                onClick={() => handleGuestSelect(num)}
                className={`px-3 py-2 rounded-lg font-bold transition-colors ${
                  guests === num
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {num}人
              </button>
            ))}
          </div>
          <div>
            <button
              onClick={() => handleGuestSelect(9)}
              className={`w-full px-4 py-2 rounded-lg font-bold transition-colors ${
                guests >= 9
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              9人以上
            </button>
          </div>
        </div>

        <button
          onClick={startOrder}
          className="w-full bg-white text-green-600 text-xl font-bold py-4 rounded-xl border-2 border-green-600 hover:bg-green-50 transition-colors shadow-lg"
        >
          注文開始 →
        </button>
      </div>
    </div>
  );
}
