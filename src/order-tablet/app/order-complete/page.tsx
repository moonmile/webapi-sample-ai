'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface OrderData {
  seat_id: number;
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
  }>;
  total_amount: number;
  guest_count: number;
}

export default function OrderCompletePage() {
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [orderNumber] = useState(() => Math.floor(Math.random() * 10000) + 1000);
  const router = useRouter();

  useEffect(() => {
    const savedOrderData = localStorage.getItem('orderData');
    if (savedOrderData) {
      setOrderData(JSON.parse(savedOrderData));
    }
  }, []);

  const goToHistory = () => {
    router.push('/order-history');
  };

  const goToCategories = () => {
    router.push('/categories');
  };

  const goToHome = () => {
    router.push('/');
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">注文データが見つかりません</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      {/* ヘッダー */}
      <header className="bg-green-600 text-white p-4 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">✅ 注文完了</h1>
          <p className="text-green-100">テーブル: T-001</p>
        </div>
      </header>

      <div className="container mx-auto p-4 max-w-2xl">
        {/* 注文完了メッセージ */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-green-600 mb-4">
            ご注文ありがとうございます！
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            ご注文を承りました。厨房で調理を開始いたします。
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="text-2xl font-bold text-green-700 mb-2">
              注文番号: #{orderNumber}
            </div>
            <div className="text-gray-600">
              {new Date().toLocaleString('ja-JP')} 受付
            </div>
          </div>

          <div className="text-left bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-gray-800 mb-3 text-lg">ご注文内容</h3>
            {orderData.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-500 ml-2">× {item.quantity}</span>
                </div>
                <span className="font-semibold">¥{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-300 font-bold text-lg">
              <span>合計</span>
              <span className="text-green-600">¥{orderData.total_amount}</span>
            </div>
          </div>

          <div className="text-gray-600 mb-6">
            <p>🍣 調理時間の目安: 15-20分</p>
            <p>📱 準備ができましたらお呼びいたします</p>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="space-y-4">
          <button
            onClick={goToHistory}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 rounded-xl transition-colors shadow-lg"
          >
            📋 注文履歴を確認
          </button>
          
          <button
            onClick={goToCategories}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white text-lg font-bold py-4 rounded-xl transition-colors shadow-lg"
          >
            🍣 追加注文する
          </button>
          
          <button
            onClick={goToHome}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white text-lg font-bold py-4 rounded-xl transition-colors shadow-lg"
          >
            🏠 最初に戻る
          </button>
        </div>

        {/* お知らせ */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h4 className="font-bold text-yellow-800 mb-2">📢 お知らせ</h4>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• お料理の準備ができましたら、スタッフがお席までお持ちいたします</li>
            <li>• ご不明な点がございましたら、お気軽にスタッフまでお声がけください</li>
            <li>• お会計は最後にまとめてお願いいたします</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
