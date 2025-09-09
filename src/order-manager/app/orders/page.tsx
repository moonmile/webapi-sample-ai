'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  tableNumber: string;
  customerName?: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  orderTime: string;
  notes?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // デモ用のダミーデータ
  const dummyOrders: Order[] = [
    {
      id: 1001,
      tableNumber: 'T-001',
      customerName: '田中様',
      items: [
        { id: 1, name: 'まぐろ', price: 150, quantity: 2 },
        { id: 2, name: 'サーモン', price: 120, quantity: 1 },
        { id: 7, name: 'かっぱ巻き', price: 120, quantity: 1 }
      ],
      totalAmount: 540,
      status: 'pending',
      orderTime: '2025-09-09 12:30:00',
      notes: '生魚アレルギーなし'
    },
    {
      id: 1002,
      tableNumber: 'T-003',
      items: [
        { id: 18, name: '大トロ', price: 380, quantity: 1 },
        { id: 19, name: '中トロ', price: 280, quantity: 2 },
        { id: 11, name: 'いくら軍艦', price: 200, quantity: 1 }
      ],
      totalAmount: 1140,
      status: 'preparing',
      orderTime: '2025-09-09 12:45:00'
    },
    {
      id: 1003,
      tableNumber: 'T-005',
      customerName: '佐藤様',
      items: [
        { id: 15, name: '特上海鮮丼', price: 890, quantity: 1 },
        { id: 29, name: '緑茶', price: 80, quantity: 2 }
      ],
      totalAmount: 1050,
      status: 'ready',
      orderTime: '2025-09-09 13:00:00'
    },
    {
      id: 1004,
      tableNumber: 'T-002',
      items: [
        { id: 4, name: 'たまご', price: 80, quantity: 3 },
        { id: 6, name: 'いか', price: 110, quantity: 2 },
        { id: 25, name: 'あら汁', price: 150, quantity: 1 }
      ],
      totalAmount: 560,
      status: 'pending',
      orderTime: '2025-09-09 13:15:00',
      notes: 'お子様向け'
    }
  ];

  useEffect(() => {
    // 認証チェック
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchOrders();
  }, [router]);

  const fetchOrders = async () => {
    try {
      // 実際のAPIを呼び出す場合
      // const response = await fetch('/api/orders');
      // const data = await response.json();
      // setOrders(data.orders);
      
      // デモ用：ダミーデータを使用
      setOrders(dummyOrders);
      setLoading(false);
    } catch (error) {
      console.error('注文の取得に失敗しました:', error);
      setOrders(dummyOrders); // フォールバックとしてダミーデータを使用
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: Order['status']) => {
    try {
      // 実際のAPIを呼び出す場合
      // const response = await fetch(`/api/orders/${orderId}`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ status: newStatus }),
      // });

      // デモ用：ローカル状態を更新
      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);

      // 選択中の注文も更新
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('注文ステータスの更新に失敗しました:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return '注文受付';
      case 'preparing': return '調理中';
      case 'ready': return '配送準備完了';
      case 'delivered': return '配送済み';
      default: return '不明';
    }
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
      <header className="bg-red-600 text-white p-4 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🍣 注文管理システム</h1>
            <p className="text-red-100">厨房管理画面</p>
          </div>
          <button
            onClick={logout}
            className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            ログアウト
          </button>
        </div>
      </header>

      <div className="flex h-screen">
        {/* 注文一覧 */}
        <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">注文一覧</h2>
            <p className="text-gray-600">クリックして詳細を表示</p>
          </div>
          
          <div className="space-y-2 p-4">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedOrder?.id === order.id
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">注文 #{order.id}</h3>
                    <p className="text-gray-600">{order.tableNumber}</p>
                    {order.customerName && (
                      <p className="text-gray-600">{order.customerName}</p>
                    )}
                    <p className="text-sm text-gray-500">{order.orderTime}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                    <p className="text-lg font-bold text-gray-800 mt-1">¥{order.totalAmount}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    {order.items.length}品目 • 合計¥{order.totalAmount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 注文詳細 */}
        <div className="w-1/2 bg-white overflow-y-auto">
          {selectedOrder ? (
            <div className="p-6">
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">注文詳細</h2>
                <div className="mt-2 flex items-center space-x-4">
                  <span className="text-gray-600">注文 #{selectedOrder.id}</span>
                  <span className="text-gray-600">{selectedOrder.tableNumber}</span>
                  {selectedOrder.customerName && (
                    <span className="text-gray-600">{selectedOrder.customerName}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{selectedOrder.orderTime}</p>
              </div>

              {/* 注文アイテム */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">注文内容</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-800">{item.name}</h4>
                        <p className="text-sm text-gray-600">単価: ¥{item.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">×{item.quantity}</p>
                        <p className="text-sm text-gray-600">¥{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 注文メモ */}
              {selectedOrder.notes && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">メモ</h3>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-gray-700">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              {/* 合計金額 */}
              <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">合計金額</span>
                  <span className="text-2xl font-bold text-red-600">¥{selectedOrder.totalAmount}</span>
                </div>
              </div>

              {/* ステータス更新ボタン */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-800">ステータス更新</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.status === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'preparing')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      調理開始
                    </button>
                  )}
                  {selectedOrder.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'ready')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      調理完了・配送準備
                    </button>
                  )}
                  {selectedOrder.status === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      配送完了
                    </button>
                  )}
                  {selectedOrder.status === 'delivered' && (
                    <div className="text-green-600 font-semibold">✅ 配送完了済み</div>
                  )}
                </div>
                <div className="mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                    現在のステータス: {getStatusText(selectedOrder.status)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <p className="text-xl">注文を選択してください</p>
                <p className="mt-2">左側の注文一覧から注文をクリックして詳細を表示</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
