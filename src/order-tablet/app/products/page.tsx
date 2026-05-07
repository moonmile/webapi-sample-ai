'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '../lib/api';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

const DUMMY_PRODUCTS: Product[] = [
  { id: 1,  name: 'まぐろ',             price: 150, description: '新鮮なまぐろの赤身です。' },
  { id: 2,  name: 'サーモン',           price: 120, description: 'ノルウェー産の新鮮なサーモンです。' },
  { id: 3,  name: 'えび',               price: 100, description: 'ぷりぷりの甘えびです。' },
  { id: 4,  name: 'たまご',             price: 80,  description: 'ふわふわの厚焼き玉子です。' },
  { id: 5,  name: 'はまち',             price: 140, description: '脂ののった新鮮なはまちです。' },
  { id: 6,  name: 'いか',               price: 110, description: '歯ごたえの良いイカです。' },
  { id: 7,  name: 'かっぱ巻き',         price: 120, description: 'きゅうりの細巻きです。' },
  { id: 8,  name: 'てっか巻き',         price: 180, description: 'まぐろの細巻きです。' },
  { id: 9,  name: 'カリフォルニアロール', price: 280, description: 'アボカドとカニの裏巻きです。' },
  { id: 10, name: '太巻き',             price: 220, description: '具だくさんの太巻きです。' },
  { id: 11, name: 'いくら軍艦',         price: 200, description: 'プチプチ食感のいくらです。' },
  { id: 12, name: 'うに軍艦',           price: 250, description: '濃厚なうにの軍艦巻きです。' },
  { id: 13, name: 'ねぎとろ軍艦',       price: 180, description: 'ねぎとろの軍艦巻きです。' },
  { id: 14, name: 'コーン軍艦',         price: 120, description: 'マヨネーズコーンの軍艦巻きです。' },
  { id: 15, name: '特上海鮮丼',         price: 890, description: '新鮮な海の幸がたっぷりの海鮮丼です。' },
  { id: 16, name: 'まぐろ丼',           price: 680, description: 'まぐろづくしの贅沢丼です。' },
  { id: 17, name: 'サーモン丼',         price: 580, description: 'サーモンがたっぷりの丼です。' },
  { id: 18, name: '大トロ',             price: 380, description: '最高級の大トロです。' },
  { id: 19, name: '中トロ',             price: 280, description: '脂ののった中トロです。' },
  { id: 20, name: 'ウニ',               price: 320, description: '北海道産の極上ウニです。' },
  { id: 21, name: 'あわび',             price: 420, description: '肉厚なあわびです。' },
  { id: 22, name: '茶碗蒸し',           price: 180, description: 'なめらかな茶碗蒸しです。' },
  { id: 23, name: '枝豆',               price: 120, description: '塩茹でした枝豆です。' },
  { id: 24, name: 'サラダ',             price: 200, description: '新鮮野菜のサラダです。' },
  { id: 25, name: 'あら汁',             price: 150, description: '魚のあらで作った出汁の効いた汁物です。' },
  { id: 26, name: 'みそ汁',             price: 100, description: '定番のみそ汁です。' },
  { id: 27, name: 'わらび餅',           price: 180, description: 'きな粉をまぶしたわらび餅です。' },
  { id: 28, name: 'アイスクリーム',     price: 150, description: 'バニラアイスクリームです。' },
  { id: 29, name: '緑茶',               price: 80,  description: '香り高い緑茶です。' },
  { id: 30, name: 'ウーロン茶',         price: 80,  description: 'さっぱりとしたウーロン茶です。' },
  { id: 31, name: 'オレンジジュース',   price: 120, description: '100%オレンジジュースです。' },
  { id: 32, name: '秋刀魚',             price: 200, description: '秋の味覚、脂ののった秋刀魚です。' },
  { id: 33, name: 'かつお',             price: 180, description: '初鰹の季節限定メニューです。' },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ id: number; name: string; price: number; quantity: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [productDigits, setProductDigits] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [quantityDigits, setQuantityDigits] = useState('');
  const [quantityError, setQuantityError] = useState(false);
  const router = useRouter();

  const matchedProduct = productDigits.length > 0
    ? (products.find((p) => p.id === parseInt(productDigits, 10)) ?? null)
    : null;

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    fetchProducts();
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) throw new Error(`${response.status}`);
      const data = await response.json();
      const list = Array.isArray(data?.data) ? data.data : [];
      setProducts(list.length ? list : DUMMY_PRODUCTS);
    } catch {
      setProducts(DUMMY_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const pressProductDigit = (digit: string) => {
    if (productDigits.length >= 3) return;
    setProductDigits((prev) => prev + digit);
    setInputError(null);
  };

  const deleteProductDigit = () => {
    setProductDigits((prev) => prev.slice(0, -1));
    setInputError(null);
  };

  const pressQuantityDigit = (digit: string) => {
    if (quantityDigits.length >= 3) return;
    setQuantityDigits((prev) => prev + digit);
    setQuantityError(false);
  };

  const deleteQuantityDigit = () => {
    setQuantityDigits((prev) => prev.slice(0, -1));
  };

  const handleAddOrder = () => {
    if (!matchedProduct) {
      setInputError('商品番号が正しくありません');
      return;
    }
    setInputError(null);
    setQuantityDigits('');
    setQuantityError(false);
    setDialogOpen(true);
  };

  const handleConfirmAdd = () => {
    const qty = parseInt(quantityDigits, 10);
    if (!qty || qty <= 0) {
      setQuantityError(true);
      return;
    }

    const product = matchedProduct!;
    const existingItem = cart.find((item) => item.id === product.id);
    const newCart = existingItem
      ? cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        )
      : [...cart, { id: product.id, name: product.name, price: product.price, quantity: qty }];

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    setDialogOpen(false);
    setProductDigits('');
    setQuantityDigits('');
  };

  const productDisplay = `No.${productDigits.padEnd(3, '_')}`;

  const keyBtnBase =
    'flex items-center justify-center h-14 rounded-xl text-xl font-bold transition-colors shadow-sm select-none';
  const keyBtn = `${keyBtnBase} bg-white border-2 border-gray-200 hover:bg-gray-50 active:bg-gray-100 text-gray-800`;
  const delBtn = `${keyBtnBase} bg-red-50 border-2 border-red-200 hover:bg-red-100 active:bg-red-200 text-red-600 text-sm`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 bg-gray-50 flex flex-col overflow-hidden">
      {/* ヘッダー */}
      <header className="bg-red-600 text-white p-4 shadow-lg flex-none">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🍣 お寿司注文</h1>
            <p className="text-red-100">テーブル: T-001</p>
          </div>
          <button
            onClick={() => router.push('/cart')}
            className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            🛒 カート ({cartItemCount})
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="flex flex-1 overflow-hidden">
        {/* 商品番号入力パネル */}
        <div className="flex-1 bg-white flex flex-col max-w-sm mx-auto">
          {/* スクロール可能な上部エリア */}
          <div className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col gap-4">
            {/* 商品番号ディスプレイ */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">商品番号</p>
              <div
                className={`text-center text-3xl font-mono font-bold py-3 px-4 rounded-xl border-2 transition-colors ${
                  matchedProduct
                    ? 'border-red-500 bg-red-50 text-red-600'
                    : inputError
                    ? 'border-red-300 bg-red-50 text-gray-400'
                    : 'border-gray-200 bg-gray-50 text-gray-400'
                }`}
              >
                {productDisplay}
              </div>
              {matchedProduct && (
                <p className="text-center text-sm text-red-600 font-semibold mt-1 truncate">
                  {matchedProduct.name} — ¥{matchedProduct.price}
                </p>
              )}
              {inputError && !matchedProduct && (
                <p className="text-center text-sm text-red-500 mt-1">{inputError}</p>
              )}
            </div>

            {/* キーパッド */}
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                <button key={d} onClick={() => pressProductDigit(d)} className={keyBtn}>
                  {d}
                </button>
              ))}
              <div />
              <button onClick={() => pressProductDigit('0')} className={keyBtn}>
                0
              </button>
              <button onClick={deleteProductDigit} className={delBtn}>
                削除
              </button>
            </div>
          </div>

          {/* 常に表示される下部ボタンエリア */}
          <div className="flex-none p-4 border-t border-gray-100 bg-white">
            <button
              onClick={handleAddOrder}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl text-lg font-bold transition-colors shadow-md"
            >
              注文追加
            </button>
          </div>
        </div>

      </div>

      {/* 数量入力ダイアログ */}
      {dialogOpen && matchedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-72 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-gray-800 text-center">数量を入力</h3>

            {/* 選択商品 */}
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-xs font-mono text-gray-400">
                No.{String(matchedProduct.id).padStart(3, '0')}
              </p>
              <p className="text-base font-bold text-gray-800">{matchedProduct.name}</p>
              <p className="text-red-600 font-bold">¥{matchedProduct.price}</p>
            </div>

            {/* 数量ディスプレイ */}
            <div
              className={`text-center text-3xl font-mono font-bold py-3 rounded-xl border-2 ${
                quantityError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              {quantityDigits || '0'}
              <span className="text-base font-normal text-gray-400 ml-2">個</span>
            </div>
            {quantityError && (
              <p className="text-center text-sm text-red-500 -mt-2">数量を入力してください</p>
            )}

            {/* 数量キーパッド */}
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                <button key={d} onClick={() => pressQuantityDigit(d)} className={keyBtn}>
                  {d}
                </button>
              ))}
              <div />
              <button onClick={() => pressQuantityDigit('0')} className={keyBtn}>
                0
              </button>
              <button onClick={deleteQuantityDigit} className={delBtn}>
                削除
              </button>
            </div>

            {/* OK / キャンセル */}
            <div className="flex gap-3">
              <button
                onClick={() => setDialogOpen(false)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirmAdd}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
