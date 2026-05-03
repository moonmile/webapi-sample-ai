'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { submitOrderItem } from '../lib/api';
import { CartItem, getTotalPrice, getTotalItems } from '../lib/cartUtils';

const DEFAULT_SEAT_ID = 1;
const SEAT_STORAGE_KEY = 'seat_id';

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [guests, setGuests] = useState(1);
  const [seatId, setSeatId] = useState<number>(DEFAULT_SEAT_ID);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // カートの内容とゲスト数を復元
    const savedCart = localStorage.getItem('cart');
    const savedGuests = sessionStorage.getItem('guests');
    const savedSeat = sessionStorage.getItem(SEAT_STORAGE_KEY);
    
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    if (savedGuests) {
      setGuests(parseInt(savedGuests));
    }
    if (savedSeat) {
      const parsedSeat = Number(savedSeat);
      if (!Number.isNaN(parsedSeat)) {
        setSeatId(parsedSeat);
      }
    } else {
      sessionStorage.setItem(SEAT_STORAGE_KEY, DEFAULT_SEAT_ID.toString());
    }
  }, []);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }

    const newCart = cart.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeItem = (id: number) => {
    const newCart = cart.filter(item => item.id !== id);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const confirmOrder = async () => {
    if (cart.length === 0) {
      alert('カートが空です。商品を追加してください。');
      return;
    }

    if (isSubmitting) {
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);

    try {
      for (const item of cart) {
        await submitOrderItem({
          seatId,
          productId: item.id,
          quantity: item.quantity,
        });
      }

      const orderData = {
        seat_id: seatId,
        items: cart,
        total_amount: getTotalPrice(cart),
        guest_count: guests,
      };

      localStorage.setItem('orderData', JSON.stringify(orderData));
      localStorage.removeItem('cart');
      setCart([]);
      router.push('/order-complete');
    } catch (error) {
      console.error('注文に失敗しました:', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : '注文の送信に失敗しました。もう一度お試しください。'
      );
    }

    setIsSubmitting(false);
  };

  const goBack = () => {
    router.push('/categories');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 max-w-4xl">
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">カートが空です</h2>
            <p className="text-gray-600 mb-8">商品を選んでカートに追加してください</p>
            <button
              onClick={goBack}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              商品を選ぶ
            </button>
          </div>
        ) : (
          <div>
            {/* カート商品一覧 */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">ご注文内容</h2>
              
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-gray-600">¥{item.price} × {item.quantity}</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold transition-colors"
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-semibold text-lg">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold transition-colors"
                    >
                      ＋
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-4 w-10 h-10 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center font-bold transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="w-24 text-right">
                    <span className="text-lg font-bold">¥{item.price * item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 合計金額 */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center text-lg mb-2">
                <span>商品数:</span>
                <span>{getTotalItems(cart)}点</span>
              </div>
              <div className="flex justify-between items-center text-lg mb-4">
                <span>お客様:</span>
                <span>{guests}名様</span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center text-2xl font-bold text-red-600">
                  <span>合計金額:</span>
                  <span>¥{getTotalPrice(cart)}</span>
                </div>
              </div>
            </div>

            {/* 注文確定ボタン */}
            <div className="text-center">
              {submitError && (
                <div className="mb-4 bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded">
                  {submitError}
                </div>
              )}
              <button
                onClick={confirmOrder}
                disabled={isSubmitting}
                className="w-full max-w-md bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xl font-bold py-4 rounded-xl transition-colors shadow-lg"
              >
                {isSubmitting ? '送信中...' : '注文を確定する'}
              </button>
              <p className="text-gray-500 text-sm mt-4">
                注文確定後、厨房で調理を開始いたします
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
