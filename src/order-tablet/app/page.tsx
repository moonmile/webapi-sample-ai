'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const photoUrls = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
];

export default function Home() {
  const [guests, setGuests] = useState(2);
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableNumber = searchParams.get('table') || 'T-001';

  const startOrder = () => {
    sessionStorage.setItem('guests', guests.toString());
    router.push('/categories');
  };

  const guestOptions = [...Array(8)].map((_, index) => index + 1);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-green-50 to-green-100 px-4 py-10">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-4 px-4">
        {photoUrls.map((src, index) => (
          <div key={index} className="relative h-64 w-44 overflow-hidden rounded-3xl shadow-2xl shadow-green-900/10 opacity-80 sm:w-52 md:w-56">
            <img src={src} alt={`おすすめ写真 ${index + 1}`} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-green-950/70 via-transparent to-transparent" />
          </div>
        ))}
      </div>
      <div className="relative mx-auto flex max-w-md flex-col items-center justify-center rounded-[2rem] bg-white/95 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl text-green-600 shadow-inner shadow-green-100/80">
            🍣
          </div>
          <h1 className="text-3xl font-bold text-slate-900">日経寿司へようこそ</h1>
          <p className="mt-2 text-gray-600">今月のお薦めと共にご注文ください</p>
        </div>

        <div className="w-full space-y-6">
          <div className="rounded-3xl border border-green-100 bg-green-50/80 p-6 shadow-sm">
            <p className="text-lg font-semibold text-slate-800 mb-3">テーブル番号</p>
            <p className="text-3xl font-bold text-green-700">{tableNumber}</p>
          </div>

          <div className="rounded-3xl border border-green-100 bg-green-50/80 p-6 shadow-sm">
            <p className="text-lg font-semibold text-slate-800 mb-4">何名様でお越しですか？</p>
            <div className="flex flex-wrap justify-center gap-3">
              {guestOptions.map((num) => (
                <button
                  key={num}
                  onClick={() => setGuests(num)}
                  className={`flex h-16 w-16 items-center justify-center rounded-full border-2 text-xl font-bold transition-all ${
                    guests === num
                      ? 'border-green-600 bg-green-600 text-white shadow-lg shadow-green-600/20'
                      : 'border-green-200 bg-white text-slate-700 hover:border-green-400 hover:bg-green-50'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <button
              onClick={() => setGuests(9)}
              className={`mt-4 w-full rounded-full border-2 px-4 py-3 text-lg font-bold transition-all ${
                guests >= 9
                  ? 'border-green-600 bg-green-600 text-white shadow-lg shadow-green-600/20'
                  : 'border-green-200 bg-white text-slate-700 hover:border-green-400 hover:bg-green-50'
              }`}
            >
              9人以上
            </button>
          </div>

          <button
            onClick={startOrder}
            className="w-full rounded-full bg-green-600 px-6 py-4 text-xl font-bold text-white shadow-lg shadow-green-600/30 transition hover:bg-green-700"
          >
            注文開始 →
          </button>
        </div>
      </div>
    </div>
  );
}
