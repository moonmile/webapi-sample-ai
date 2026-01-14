'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api';
const AUTH_TOKEN_KEY = 'authToken';

type OrderStatus = 'pending' | 'in_progress' | 'completed';

interface ApiOrder {
  product: any;
  id: number;
  seat_id: number;
  product_id: number;
  quantity: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

interface OrdersResponse {
  data: ApiOrder[];
  meta?: {
    total?: number;
    per_page?: number;
    current_page?: number;
    last_page?: number;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    router.push('/login');
  }, [router]);

  const fetchOrders = useCallback(async (token: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error('注文の取得に失敗しました。');
      }

      const data: OrdersResponse = await response.json();
      setOrders(data.data ?? []);
      setSelectedOrder((prev) => {
        if (!prev) return null;
        return data.data?.find((order) => order.id === prev.id) ?? null;
      });
      setError('');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : '注文の取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      router.push('/login');
      return;
    }

    void fetchOrders(token);
  }, [router, fetchOrders]);

  const updateOrderStatus = async (orderId: number, newStatus: OrderStatus) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error('注文ステータスの更新に失敗しました。');
      }

      fetchOrders(token);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : '注文ステータスの更新に失敗しました。');
    }
  };

  const logout = async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    if (token) {
      try {
        await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
      } catch (err) {
        console.error(err);
      }
    }

    handleUnauthorized();
  };

  const formatDateTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('ja-JP');
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return '注文受付';
      case 'in_progress':
        return '調理中';
      case 'completed':
        return '提供済み';
      default:
        return '不明';
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

      {error && (
        <div className="mx-4 mt-4 bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded">
          {error}
        </div>
      )}

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
                    <p className="text-gray-600">席ID: {order.seat_id}</p>
                    <p className="text-gray-600">商品名: {order.product.name}</p>
                    <p className="text-sm text-gray-500">数量: {order.quantity}</p>
                    <p className="text-sm text-gray-500">注文時間: {formatDateTime(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
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
                  <span className="text-gray-600">席ID: {selectedOrder.seat_id}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">注文時間: {formatDateTime(selectedOrder.created_at)}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">注文内容</h3>
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <p className="text-gray-700">商品ID: {selectedOrder.product_id}</p>
                  <p className="text-gray-700">数量: {selectedOrder.quantity}</p>
                  <p className="text-gray-700">ステータス: {getStatusText(selectedOrder.status)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-800">ステータス更新</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.status === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'in_progress')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      調理開始
                    </button>
                  )}
                  {selectedOrder.status === 'in_progress' && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      完了
                    </button>
                  )}
                  {selectedOrder.status === 'completed' && (
                    <div className="text-green-600 font-semibold">✅ 完了済み</div>
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
