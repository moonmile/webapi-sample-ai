'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Order {
  order_number: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
  time: string;
}

export default function PaymentPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    // 注文履歴のロード（注文履歴ページと同じロジック）
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
        status: 'completed',
        time: '2024-01-15 12:45'
      }
    ];

    const savedOrderData = localStorage.getItem('orderData');
    if (savedOrderData) {
      const orderData = JSON.parse(savedOrderData);
      const newOrder: Order = {
        order_number: Math.floor(Math.random() * 10000).toString(),
        items: orderData.items.map((item: {name: string; quantity: number; price: number}) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total: orderData.total_amount,
        status: 'completed',
        time: new Date().toLocaleString('ja-JP')
      };
      dummyOrders.unshift(newOrder);
    }

    setOrders(dummyOrders);
    setLoading(false);
  };

  const getTotalAmount = () => {
    return orders.reduce((sum, order) => sum + order.total, 0);
  };

  const getTax = () => {
    return Math.floor(getTotalAmount() * 0.1);
  };

  const getSubtotal = () => {
    return getTotalAmount() - getTax();
  };

  const processPayment = async () => {
    setProcessing(true);
    
    try {
      // 支払い処理のシミュレーション
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 支払い完了後、データをクリア
      localStorage.removeItem('orderData');
      localStorage.removeItem('cart');
      
      // 支払い完了画面へ遷移（またはホームに戻る）
      alert('お支払いが完了しました。ありがとうございました！');
      router.push('/');
      
    } catch (error) {
      console.error('支払い処理でエラーが発生しました:', error);
      alert('支払い処理でエラーが発生しました。もう一度お試しください。');
    } finally {
      setProcessing(false);
    }
  };

  const goBack = () => {
    router.push('/order-history');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-green-600 text-white p-4 shadow-lg">
        <div className="flex items-center">
          <button
            onClick={goBack}
            className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg mr-4 transition-colors"
          >
            ← 戻る
          </button>
          <div>
            <h1 className="text-2xl font-bold">💳 お会計</h1>
            <p className="text-green-100">テーブル: T-001</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 max-w-2xl">
        {/* 注文内容 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">ご注文内容</h2>
          
          {orders.map((order, orderIndex) => (
            <div key={orderIndex} className="mb-6 last:mb-0">
              <h3 className="font-bold text-gray-700 mb-3">
                注文 #{order.order_number} ({order.time})
              </h3>
              
              {order.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500 ml-2">× {item.quantity}</span>
                  </div>
                  <span className="font-semibold">¥{item.price * item.quantity}</span>
                </div>
              ))}
              
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200 font-bold">
                <span>小計</span>
                <span>¥{order.total}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 料金計算 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">お会計</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-lg">
              <span>小計（税抜）</span>
              <span>¥{getSubtotal()}</span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span>消費税（10%）</span>
              <span>¥{getTax()}</span>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center text-2xl font-bold text-green-600">
                <span>合計金額</span>
                <span>¥{getTotalAmount()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 支払い方法選択 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">お支払い方法</h2>
          
          <div className="space-y-3">
            <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="payment"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                className="mr-3 w-4 h-4"
              />
              <div className="flex items-center">
                <span className="text-2xl mr-3">💴</span>
                <div>
                  <div className="font-semibold">現金</div>
                  <div className="text-sm text-gray-600">レジにてお支払いください</div>
                </div>
              </div>
            </label>

            <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                className="mr-3 w-4 h-4"
              />
              <div className="flex items-center">
                <span className="text-2xl mr-3">💳</span>
                <div>
                  <div className="font-semibold">クレジットカード</div>
                  <div className="text-sm text-gray-600">VISA・MasterCard・JCB対応</div>
                </div>
              </div>
            </label>

            <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="payment"
                value="mobile"
                checked={paymentMethod === 'mobile'}
                onChange={(e) => setPaymentMethod(e.target.value as 'mobile')}
                className="mr-3 w-4 h-4"
              />
              <div className="flex items-center">
                <span className="text-2xl mr-3">📱</span>
                <div>
                  <div className="font-semibold">モバイル決済</div>
                  <div className="text-sm text-gray-600">PayPay・LINE Pay・楽天Pay対応</div>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* 支払いボタン */}
        <div className="text-center">
          <button
            onClick={processPayment}
            disabled={processing}
            className={`w-full text-xl font-bold py-4 rounded-xl transition-colors shadow-lg ${
              processing
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {processing ? '処理中...' : `¥${getTotalAmount()} お支払いを確定する`}
          </button>
          
          <p className="text-gray-500 text-sm mt-4">
            {paymentMethod === 'cash' && 'レジカウンターにてお支払いください'}
            {paymentMethod === 'card' && 'カードリーダーにカードを挿入してください'}
            {paymentMethod === 'mobile' && 'QRコードを読み取ってお支払いください'}
          </p>
        </div>

        {/* お知らせ */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-bold text-blue-800 mb-2">💡 お支払いについて</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• レシートが必要な方は、お声がけください</li>
            <li>• ポイントカードをお持ちの方は、お支払い前にご提示ください</li>
            <li>• 領収書が必要な方は、スタッフまでお申し付けください</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
