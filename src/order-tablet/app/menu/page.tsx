'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  categoryName: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const PRODUCTS_PER_PAGE = 6; // 2行 × 3列

const allProducts: Product[] = [
  { id: 1,  name: 'まぐろ',              price: 150, description: '新鮮なまぐろの赤身です。',                categoryName: '握り寿司' },
  { id: 2,  name: 'サーモン',            price: 120, description: 'ノルウェー産の新鮮なサーモンです。',      categoryName: '握り寿司' },
  { id: 3,  name: 'えび',               price: 100, description: 'ぷりぷりの甘えびです。',                 categoryName: '握り寿司' },
  { id: 4,  name: 'たまご',             price: 80,  description: 'ふわふわの厚焼き玉子です。',             categoryName: '握り寿司' },
  { id: 5,  name: 'はまち',             price: 140, description: '脂ののった新鮮なはまちです。',           categoryName: '握り寿司' },
  { id: 6,  name: 'いか',               price: 110, description: '歯ごたえの良いイカです。',               categoryName: '握り寿司' },
  { id: 7,  name: 'かっぱ巻き',         price: 120, description: 'きゅうりの細巻きです。',                 categoryName: '巻き寿司' },
  { id: 8,  name: 'てっか巻き',         price: 180, description: 'まぐろの細巻きです。',                   categoryName: '巻き寿司' },
  { id: 9,  name: 'カリフォルニアロール', price: 280, description: 'アボカドとカニの裏巻きです。',           categoryName: '巻き寿司' },
  { id: 10, name: '太巻き',             price: 220, description: '具だくさんの太巻きです。',               categoryName: '巻き寿司' },
  { id: 11, name: 'いくら軍艦',         price: 200, description: 'プチプチ食感のいくらです。',             categoryName: '軍艦巻き' },
  { id: 12, name: 'うに軍艦',           price: 250, description: '濃厚なうにの軍艦巻きです。',             categoryName: '軍艦巻き' },
  { id: 13, name: 'ねぎとろ軍艦',       price: 180, description: 'ねぎとろの軍艦巻きです。',               categoryName: '軍艦巻き' },
  { id: 14, name: 'コーン軍艦',         price: 120, description: 'マヨネーズコーンの軍艦巻きです。',       categoryName: '軍艦巻き' },
  { id: 15, name: '特上海鮮丼',         price: 890, description: '新鮮な海の幸がたっぷりの海鮮丼です。',   categoryName: '海鮮丼' },
  { id: 16, name: 'まぐろ丼',           price: 680, description: 'まぐろづくしの贅沢丼です。',             categoryName: '海鮮丼' },
  { id: 17, name: 'サーモン丼',         price: 580, description: 'サーモンがたっぷりの丼です。',           categoryName: '海鮮丼' },
  { id: 18, name: '大トロ',             price: 380, description: '最高級の大トロです。',                   categoryName: '特選寿司' },
  { id: 19, name: '中トロ',             price: 280, description: '脂ののった中トロです。',                 categoryName: '特選寿司' },
  { id: 20, name: 'ウニ',               price: 320, description: '北海道産の極上ウニです。',               categoryName: '特選寿司' },
  { id: 21, name: 'あわび',             price: 420, description: '肉厚なあわびです。',                     categoryName: '特選寿司' },
  { id: 22, name: '茶碗蒸し',           price: 180, description: 'なめらかな茶碗蒸しです。',               categoryName: 'サイドメニュー' },
  { id: 23, name: '枝豆',               price: 120, description: '塩茹でした枝豆です。',                   categoryName: 'サイドメニュー' },
  { id: 24, name: 'サラダ',             price: 200, description: '新鮮野菜のサラダです。',                 categoryName: 'サイドメニュー' },
  { id: 25, name: 'あら汁',             price: 150, description: '魚のあらで作った出汁の効いた汁物です。', categoryName: '汁物' },
  { id: 26, name: 'みそ汁',             price: 100, description: '定番のみそ汁です。',                     categoryName: '汁物' },
  { id: 27, name: 'わらび餅',           price: 180, description: 'きな粉をまぶしたわらび餅です。',         categoryName: 'デザート' },
  { id: 28, name: 'アイスクリーム',     price: 150, description: 'バニラアイスクリームです。',             categoryName: 'デザート' },
  { id: 29, name: '緑茶',               price: 80,  description: '香り高い緑茶です。',                     categoryName: '飲み物' },
  { id: 30, name: 'ウーロン茶',         price: 80,  description: 'さっぱりとしたウーロン茶です。',         categoryName: '飲み物' },
  { id: 31, name: 'オレンジジュース',   price: 120, description: '100%オレンジジュースです。',             categoryName: '飲み物' },
  { id: 32, name: '秋刀魚',             price: 200, description: '秋の味覚、脂ののった秋刀魚です。',       categoryName: '季節限定' },
  { id: 33, name: 'かつお',             price: 180, description: '初鰹の季節限定メニューです。',           categoryName: '季節限定' },
];

// カテゴリ順を保持しながらページ配列を生成
type Page = { categoryName: string; products: Product[] };

const buildPages = (): Page[] => {
  const categoryOrder: string[] = [];
  const seen = new Set<string>();
  for (const p of allProducts) {
    if (!seen.has(p.categoryName)) {
      seen.add(p.categoryName);
      categoryOrder.push(p.categoryName);
    }
  }
  const result: Page[] = [];
  for (const catName of categoryOrder) {
    const catProducts = allProducts.filter(p => p.categoryName === catName);
    for (let i = 0; i < catProducts.length; i += PRODUCTS_PER_PAGE) {
      result.push({ categoryName: catName, products: catProducts.slice(i, i + PRODUCTS_PER_PAGE) });
    }
  }
  return result;
};

const pages = buildPages();

// 各カテゴリの先頭ページインデックス
const categoryFirstPage: Record<string, number> = {};
pages.forEach((page, idx) => {
  if (!(page.categoryName in categoryFirstPage)) {
    categoryFirstPage[page.categoryName] = idx;
  }
});

const categoryNames = Object.keys(categoryFirstPage);

export default function MenuPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const router = useRouter();

  const currentPage = pages[currentPageIndex];
  const currentCategory = currentPage.categoryName;
  const totalPages = pages.length;

  // 現在カテゴリ内の何ページ目か
  const pagesInCategory = pages.filter(p => p.categoryName === currentCategory).length;
  const pageInCategory = currentPageIndex - categoryFirstPage[currentCategory] + 1;

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    const newCart = existing
      ? cart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      : [...cart, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    // pb-28 で固定下部バー（ボタン行＋カテゴリ行）との重なりを防ぐ
    <div className="min-h-screen bg-gray-50 pb-28">
      <header className="bg-red-600 text-white p-4 shadow-lg">
        <div className="flex justify-between items-center max-w-5xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold">🍣 メニュー</h1>
            <p className="text-red-100 text-sm">テーブル: T-001</p>
          </div>
          <button
            onClick={() => router.push('/cart')}
            className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            🛒 カート ({cartItemCount})
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4">
        {/* カテゴリ見出し */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">{currentCategory}</h2>

        {/* 商品グリッド: 3列 × 2行 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {currentPage.products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col"
            >
              {/* カテゴリラベル */}
              <div className="bg-red-50 text-red-700 text-xs font-semibold px-3 py-1.5 border-b border-red-100">
                {product.categoryName}
              </div>
              {/* 画像プレースホルダー */}
              <div className="w-full h-28 bg-gray-100 flex items-center justify-center text-4xl">
                🍣
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="text-base font-bold text-gray-800 mb-1">{product.name}</h3>
                <p className="text-gray-500 text-xs mb-3 flex-1 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-red-600">¥{product.price}</span>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                  >
                    カートへ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* 下部固定バー：前へ/次へ ＋ カテゴリタブ */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
        {/* 前へ / 次へ */}
        <div className="flex items-center justify-center gap-6 py-2 border-b border-gray-100 max-w-5xl mx-auto">
          <button
            onClick={() => setCurrentPageIndex(i => i - 1)}
            disabled={currentPageIndex === 0}
            className="px-6 py-1.5 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← 前へ
          </button>
          {pagesInCategory > 1 && (
            <span className="text-sm text-gray-500">
              {pageInCategory} / {pagesInCategory}ページ
            </span>
          )}
          <button
            onClick={() => setCurrentPageIndex(i => i + 1)}
            disabled={currentPageIndex >= totalPages - 1}
            className="px-6 py-1.5 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            次へ →
          </button>
        </div>
        {/* カテゴリタブ */}
        <div className="flex overflow-x-auto scrollbar-hide max-w-5xl mx-auto">
          {categoryNames.map((catName) => (
            <button
              key={catName}
              onClick={() => setCurrentPageIndex(categoryFirstPage[catName])}
              className={`flex-shrink-0 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                currentCategory === catName
                  ? 'border-red-600 text-red-600 bg-red-50'
                  : 'border-transparent text-gray-600 hover:text-red-600 hover:bg-gray-50'
              }`}
            >
              {catName}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
