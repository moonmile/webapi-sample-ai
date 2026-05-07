'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '../lib/api';

interface Category {
  id: number;
  name: string;
  description: string | null;
  products_count?: number;
  products?: Product[];
  created_at?: string;
  updated_at?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  categories?: Omit<Category, 'products'>[];
  created_at?: string;
  updated_at?: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const FOOD_EMOJIS: Record<number, string> = {
  1: '🍣', 2: '🍱', 3: '🦐', 4: '🌊', 5: '⭐',
  6: '🥗', 7: '🍵', 8: '🍮', 9: '🍹', 10: '🌸',
};

const CATEGORY_COLORS: Record<number, string> = {
  1: '#c0392b', 2: '#27ae60', 3: '#e67e22', 4: '#2980b9', 5: '#8e44ad',
  6: '#16a085', 7: '#d35400', 8: '#c0392b', 9: '#1abc9c', 10: '#e91e63',
};

const dummyCategories: Category[] = [
  { id: 1, name: '握り寿司', description: '新鮮なネタを使った伝統的な握り寿司です。', products_count: 8 },
  { id: 2, name: '巻き寿司', description: '海苔で巻いた美味しい巻き寿司各種です。', products_count: 5 },
  { id: 3, name: '軍艦巻き', description: 'いくらやウニなどの軍艦巻きです。', products_count: 4 },
  { id: 4, name: '海鮮丼', description: '新鮮な海の幸をのせた豪華な海鮮丼です。', products_count: 4 },
  { id: 5, name: '特選寿司', description: '厳選された高級ネタを使用した特選寿司です。', products_count: 5 },
  { id: 6, name: 'サイドメニュー', description: '寿司と一緒に楽しめるサイドメニューです。', products_count: 7 },
  { id: 7, name: '汁物', description: '温かい汁物で食事を彩ります。', products_count: 2 },
  { id: 8, name: 'デザート', description: '食後に楽しめる和風デザートです。', products_count: 5 },
  { id: 9, name: '飲み物', description: 'お茶やジュースなどの飲み物です。', products_count: 4 },
  { id: 10, name: '季節限定', description: '季節の食材を使った限定メニューです。', products_count: 2 },
];

const dummyProductsByCategory: Record<number, Product[]> = {
  1: [
    { id: 1, name: 'まぐろ', price: 150, description: '新鮮なまぐろの赤身です。', image_url: null },
    { id: 2, name: 'サーモン', price: 120, description: 'ノルウェー産の新鮮なサーモンです。', image_url: null },
    { id: 3, name: 'えび', price: 100, description: 'ぷりぷりの甘えびです。', image_url: null },
    { id: 4, name: 'たまご', price: 80, description: 'ふわふわの厚焼き玉子です。', image_url: null },
    { id: 5, name: 'はまち', price: 140, description: '脂ののった新鮮なはまちです。', image_url: null },
    { id: 6, name: 'いか', price: 110, description: '歯ごたえの良いイカです。', image_url: null },
    { id: 33, name: '中とろ', price: 200, description: '脂ののった中とろです。', image_url: null },
    { id: 34, name: '活〆穴子', price: 200, description: '活〆の穴子です。', image_url: null },
  ],
  2: [
    { id: 7, name: 'かっぱ巻き', price: 120, description: 'きゅうりの細巻きです。', image_url: null },
    { id: 8, name: 'てっか巻き', price: 180, description: 'まぐろの細巻きです。', image_url: null },
    { id: 9, name: 'カリフォルニアロール', price: 280, description: 'アボカドとカニの裏巻きです。', image_url: null },
    { id: 10, name: '太巻き', price: 220, description: '具だくさんの太巻きです。', image_url: null },
    { id: 35, name: 'にぎり細巻他', price: 200, description: 'にぎり、細巻きなど。', image_url: null },
  ],
  3: [
    { id: 11, name: 'いくら軍艦', price: 200, description: 'プチプチ食感のいくらです。', image_url: null },
    { id: 12, name: 'うに軍艦', price: 250, description: '濃厚なうにの軍艦巻きです。', image_url: null },
    { id: 13, name: 'ねぎとろ軍艦', price: 180, description: 'ねぎとろの軍艦巻きです。', image_url: null },
    { id: 14, name: 'コーン軍艦', price: 120, description: 'マヨネーズコーンの軍艦巻きです。', image_url: null },
  ],
  4: [
    { id: 15, name: '特上海鮮丼', price: 890, description: '新鮮な海の幸がたっぷりです。', image_url: null },
    { id: 16, name: 'まぐろ丼', price: 680, description: 'まぐろづくしの贅沢丼です。', image_url: null },
    { id: 17, name: 'サーモン丼', price: 580, description: 'サーモンがたっぷりの丼です。', image_url: null },
    { id: 36, name: 'うな丼にぎり一貫', price: 200, description: '月替わり／フェア。', image_url: null },
  ],
  5: [
    { id: 18, name: '大とろ', price: 380, description: '最高級の大トロです。', image_url: null },
    { id: 19, name: '中とろ', price: 280, description: '脂ののった中とろです。', image_url: null },
    { id: 20, name: 'ウニ', price: 320, description: '北海道産の極上ウニです。', image_url: null },
    { id: 21, name: 'あわび', price: 420, description: '肉厚なあわびです。', image_url: null },
    { id: 37, name: '極み熟成　中とろ一貫', price: 200, description: '極み熟成の中とろです。', image_url: null },
  ],
  6: [
    { id: 22, name: '茶碗蒸し', price: 180, description: 'なめらかな茶碗蒸しです。', image_url: null },
    { id: 23, name: '枝豆', price: 120, description: '塩茹でした枝豆です。', image_url: null },
    { id: 24, name: 'サラダ', price: 200, description: '新鮮野菜のサラダです。', image_url: null },
    { id: 38, name: '伝説の鶏唐揚げ', price: 280, description: 'ジューシーな唐揚げです。', image_url: null },
    { id: 39, name: '大粒ほたて一貫', price: 200, description: '大粒ほたて、あぶり、天ぷら他。', image_url: null },
    { id: 40, name: '特大生サーモン一貫', price: 200, description: 'くんかん他。', image_url: null },
    { id: 41, name: 'たっぷりいくら手巻一貫', price: 200, description: 'おすすめ。', image_url: null },
  ],
  7: [
    { id: 25, name: 'あら汁', price: 150, description: '魚のあらで作った汁物です。', image_url: null },
    { id: 26, name: 'みそ汁', price: 100, description: '定番のみそ汁です。', image_url: null },
  ],
  8: [
    { id: 27, name: 'わらび餅', price: 180, description: 'きな粉をまぶしたわらび餅です。', image_url: null },
    { id: 28, name: 'アイスクリーム', price: 150, description: 'バニラアイスクリームです。', image_url: null },
    { id: 42, name: 'マンゴーシェイク', price: 480, description: '濃厚マンゴーシェイクです。', image_url: null },
    { id: 43, name: 'ストロベリーシェイク', price: 480, description: 'いちごシェイクです。', image_url: null },
    { id: 44, name: '抹茶とホワイトチョコ', price: 480, description: '抹茶スイーツです。', image_url: null },
  ],
  9: [
    { id: 29, name: '緑茶', price: 80, description: '香り高い緑茶です。', image_url: null },
    { id: 30, name: 'ウーロン茶', price: 80, description: 'さっぱりとしたウーロン茶です。', image_url: null },
    { id: 31, name: 'オレンジジュース', price: 120, description: '100%オレンジジュースです。', image_url: null },
    { id: 45, name: '野菜フルーツジュース', price: 180, description: '野菜と果物のミックスです。', image_url: null },
  ],
  10: [
    { id: 32, name: '秋刀魚', price: 200, description: '脂ののった秋刀魚です。', image_url: null },
    { id: 33, name: 'かつお', price: 180, description: '初鰹の季節限定メニューです。', image_url: null },
  ],
};

function categoryEmoji(categoryId: number): string {
  return FOOD_EMOJIS[categoryId] ?? '🍽️';
}

function categoryColor(categoryId: number): string {
  return CATEGORY_COLORS[categoryId] ?? '#888';
}

function ProductImage({ product, categoryId }: { product: Product; categoryId: number }) {
  const [imgError, setImgError] = useState(false);
  const color = categoryColor(categoryId);

  if (product.image_url && !imgError) {
    return (
      <img
        src={product.image_url}
        alt={product.name}
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className="w-full h-full flex items-center justify-center text-5xl"
      style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)` }}
    >
      {categoryEmoji(categoryId)}
    </div>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [addedId, setAddedId] = useState<number | null>(null);
  const categoryBarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch {
        // ignore corrupt cart data
      }
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list: Category[] = Array.isArray(data?.data) ? data.data : [];
      const cats = list.length ? list : dummyCategories;
      setCategories(cats);
      const first = cats[0];
      setSelectedCategory(first);
      await loadProductsForCategory(first);
    } catch {
      setCategories(dummyCategories);
      const first = dummyCategories[0];
      setSelectedCategory(first);
      setProducts(dummyProductsByCategory[first.id] ?? []);
    } finally {
      setLoading(false);
    }
  };

  // GET /categories/{id} returns Category with products array (詳細取得時のみ)
  const loadProductsForCategory = async (category: Category) => {
    setProductsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${category.id}`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const detail: Category = data?.data ?? {};
      const list = Array.isArray(detail.products) ? detail.products : [];
      setProducts(list.length ? list : dummyProductsByCategory[category.id] ?? []);
    } catch {
      setProducts(dummyProductsByCategory[category.id] ?? []);
    } finally {
      setProductsLoading(false);
    }
  };

  const selectCategory = (category: Category) => {
    setSelectedCategory(category);
    loadProductsForCategory(category);
  };

  const addToCart = (product: Product) => {
    const newCart = cart.find(i => i.id === product.id)
      ? cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      : [...cart, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 800);
  };

  const cartCount = cart.reduce((t, i) => t + i.quantity, 0);
  const cartTotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <p className="text-white text-2xl">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-900 overflow-hidden" style={{ fontFamily: 'sans-serif' }}>

      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            メニュー
          </div>
          <span className="text-white font-bold text-lg">
            {selectedCategory?.name ?? '商品一覧'}
          </span>
          {selectedCategory?.products_count != null && (
            <span className="text-gray-400 text-sm">
              ({selectedCategory.products_count}品)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-gray-300 text-sm">
          <span>テーブル: T-001</span>
          <span>|</span>
          <span className="text-yellow-400 font-bold">皿数: {cartCount}枚</span>
        </div>
      </div>

      {/* 商品グリッド */}
      <div className="flex-1 overflow-y-auto p-3">
        {productsLoading ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-lg">
            読み込み中...
          </div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-lg">
            このカテゴリには商品がありません
          </div>
        ) : (
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {products.map((product) => {
              const inCart = cart.find(i => i.id === product.id);
              const justAdded = addedId === product.id;
              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="relative rounded-lg overflow-hidden text-left transition-transform active:scale-95"
                  style={{
                    background: '#1e2532',
                    border: justAdded ? '2px solid #f59e0b' : '2px solid #2d3748',
                  }}
                >
                  {/* 商品画像 */}
                  <div className="relative w-full" style={{ paddingTop: '72%' }}>
                    <div className="absolute inset-0">
                      <ProductImage product={product} categoryId={selectedCategory?.id ?? 1} />
                    </div>
                    {inCart && (
                      <div
                        className="absolute top-1 right-1 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
                        style={{ background: '#e53e3e' }}
                      >
                        {inCart.quantity}
                      </div>
                    )}
                    {justAdded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="text-yellow-400 text-2xl font-bold">+1</span>
                      </div>
                    )}
                  </div>

                  {/* 商品情報 */}
                  <div className="p-2">
                    <p className="text-orange-400 font-bold text-sm leading-tight">
                      {product.price.toLocaleString()}
                      <span className="text-xs">円</span>
                    </p>
                    <p className="text-white text-xs mt-0.5 leading-tight line-clamp-2">
                      {product.name}
                    </p>
                    {product.description && (
                      <p className="text-gray-400 text-xs mt-0.5 leading-tight line-clamp-1">
                        {product.description}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 下部: カテゴリバー + アクションボタン */}
      <div className="shrink-0 border-t border-gray-700">

        {/* カテゴリタブ */}
        <div
          ref={categoryBarRef}
          className="flex overflow-x-auto bg-gray-800"
          style={{ scrollbarWidth: 'none' }}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory?.id === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => selectCategory(cat)}
                className="shrink-0 px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors"
                style={{
                  color: isActive ? '#fff' : '#9ca3af',
                  background: isActive ? '#c53030' : 'transparent',
                  borderTop: isActive ? '3px solid #fc8181' : '3px solid transparent',
                }}
              >
                {categoryEmoji(cat.id)} {cat.name}
                {cat.products_count != null && (
                  <span className="ml-1 text-xs opacity-70">({cat.products_count})</span>
                )}
              </button>
            );
          })}
        </div>

        {/* アクションボタン */}
        <div className="flex bg-gray-900 gap-2 p-2">
          <button
            onClick={() => router.push('/order-history')}
            className="flex-1 py-3 rounded-lg font-bold text-white text-sm transition-opacity hover:opacity-90"
            style={{ background: '#276749' }}
          >
            注文履歴
          </button>
          <button
            onClick={() => router.push('/cart')}
            className="flex-1 py-3 rounded-lg font-bold text-white text-sm transition-opacity hover:opacity-90 relative"
            style={{ background: '#2b6cb0' }}
          >
            カート
            {cartCount > 0 && (
              <span
                className="absolute top-1 right-2 text-white text-xs font-bold rounded-full px-1.5 py-0.5"
                style={{ background: '#e53e3e', fontSize: '0.65rem' }}
              >
                {cartCount}
              </span>
            )}
            {cartTotal > 0 && (
              <span className="block text-xs text-blue-200 font-normal">
                ¥{cartTotal.toLocaleString()}
              </span>
            )}
          </button>
          <button
            onClick={() => router.push('/payment')}
            className="flex-1 py-3 rounded-lg font-bold text-white text-sm transition-opacity hover:opacity-90"
            style={{ background: '#c53030' }}
          >
            お会計
          </button>
        </div>
      </div>
    </div>
  );
}
