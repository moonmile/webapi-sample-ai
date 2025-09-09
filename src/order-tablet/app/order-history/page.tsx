'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface OrderHistoryItem {
  id: number;
  order_id: number;
  seat_id: number;
  sushi_type: string;
  quantity: number;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

interface Order {
  order_number: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'in_progress' | 'completed';
  time: string;
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 実際のAPIから注文履歴を取得する代わりに、
    // ローカルストレージとダミーデータを使用
    loadOrderHistory();
  }, []);

  const loadOrderHistory = async () => {
    try {
      // ダミーデータ（実際の実装ではAPIから取得）
      const dummyOrders: Order[] = [
        {
          order_number: '4567',
          items: [
            { name: 'まぐろ', quantity: 2, price: 150 },
            { name: 'サーモン', quantity: 1, price: 120 },
          ],
          total: 420,
          status: 'completed',
          time: '2024-01-15 12:30'
        },
        {
          order_number: '4568',
          items: [
            { name: 'いくら軍艦', quantity: 1, price: 200 },
            { name: 'うに軍艦', quantity: 1, price: 250 },
          ],
          total: 450,
          status: 'in_progress',
          time: '2024-01-15 12:45'
        }
      ];

      // 最新の注文データがあれば追加
      const savedOrderData = localStorage.getItem('orderData');
      if (savedOrderData) {
        const orderData = JSON.parse(savedOrderData);
        const newOrder: Order = {
          order_number: Math.floor(Math.random() * 10000).toString(),
          items: orderData.items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          total: orderData.total_amount,
          status: 'pending',
          time: new Date().toLocaleString('ja-JP')
        };
        dummyOrders.unshift(newOrder);
      }

      setOrders(dummyOrders);
      setLoading(false);
    } catch (error) {
      console.error('注文履歴の取得に失敗しました:', error);
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '🔄 調理中';
      case 'in_progress':
        return '🚚 配達中';
      case 'completed':
        return '✅ 完了';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const goBack = () => {
    router.push('/categories');
  };

  const goToPayment = () => {
    router.push('/payment');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">読み込み中...</div>
      </div>
    );
  }

  const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={goBack}
              className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg mr-4 transition-colors"
            >
              ← 戻る
            </button>
            <div>
              <h1 className="text-2xl font-bold">📋 注文履歴</h1>
              <p className="text-blue-100">テーブル: T-001</p>
            </div>
          </div>
          <button
            onClick={goToPayment}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            💳 お会計
          </button>
        </div>
      </header>

      <div className="container mx-auto p-4 max-w-4xl">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">注文履歴がありません</h2>
            <p className="text-gray-600 mb-8">まだ注文をされていません</p>
            <button
              onClick={goBack}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              注文する
            </button>
          </div>
        ) : (
          <div>
            {/* 合計金額 */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">本日のご利用合計</h2>
                <div className="text-3xl font-bold text-blue-600">¥{totalAmount}</div>
              </div>
            </div>

            {/* 注文履歴一覧 */}
            <div className="space-y-4">
              {orders.map((order, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        注文 #{order.order_number}
                      </h3>
                      <p className="text-gray-600">{order.time}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full border font-semibold ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-500 ml-2">× {item.quantity}</span>
                        </div>
                        <span className="font-semibold">¥{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="font-bold text-lg">小計</span>
                    <span className="font-bold text-lg text-blue-600">¥{order.total}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* アクションボタン */}
            <div className="mt-8 space-y-4">
              <button
                onClick={goToPayment}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-xl font-bold py-4 rounded-xl transition-colors shadow-lg"
              >
                💳 お会計に進む (¥{totalAmount})
              </button>
              
              <button
                onClick={goBack}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white text-lg font-bold py-3 rounded-xl transition-colors"
              >
                🍣 追加注文する
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
