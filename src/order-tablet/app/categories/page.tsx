'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '../lib/api';

interface Category {
  id: number;
  name: string;
  description: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{id: number, name: string, price: number, quantity: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // デモ用のダミーデータ
  const dummyCategories: Category[] = [
    { id: 1, name: '握り寿司', description: '新鮮なネタを使った伝統的な握り寿司です。' },
    { id: 2, name: '巻き寿司', description: '海苔で巻いた美味しい巻き寿司各種です。' },
    { id: 3, name: '軍艦巻き', description: 'いくらやウニなどの軍艦巻きです。' },
    { id: 4, name: '海鮮丼', description: '新鮮な海の幸をのせた豪華な海鮮丼です。' },
    { id: 5, name: '特選寿司', description: '厳選された高級ネタを使用した特選寿司です。' },
    { id: 6, name: 'サイドメニュー', description: '寿司と一緒に楽しめるサイドメニューです。' },
    { id: 7, name: '汁物', description: '温かい汁物で食事を彩ります。' },
    { id: 8, name: 'デザート', description: '食後に楽しめる和風デザートです。' },
    { id: 9, name: '飲み物', description: 'お茶やジュースなどの飲み物です。' },
    { id: 10, name: '季節限定', description: '季節の食材を使った限定メニューです。' }
  ];

  const dummyProducts: { [key: number]: Product[] } = {
    1: [ // 握り寿司
      { id: 1, name: 'まぐろ', price: 150, description: '新鮮なまぐろの赤身です。', image_url: '/images/maguro.jpg' },
      { id: 2, name: 'サーモン', price: 120, description: 'ノルウェー産の新鮮なサーモンです。', image_url: '/images/salmon.jpg' },
      { id: 3, name: 'えび', price: 100, description: 'ぷりぷりの甘えびです。', image_url: '/images/ebi.jpg' },
      { id: 4, name: 'たまご', price: 80, description: 'ふわふわの厚焼き玉子です。', image_url: '/images/tamago.jpg' },
      { id: 5, name: 'はまち', price: 140, description: '脂ののった新鮮なはまちです。', image_url: '/images/hamachi.jpg' },
      { id: 6, name: 'いか', price: 110, description: '歯ごたえの良いイカです。', image_url: '/images/ika.jpg' }
    ],
    2: [ // 巻き寿司
      { id: 7, name: 'かっぱ巻き', price: 120, description: 'きゅうりの細巻きです。', image_url: '/images/kappa.jpg' },
      { id: 8, name: 'てっか巻き', price: 180, description: 'まぐろの細巻きです。', image_url: '/images/tekka.jpg' },
      { id: 9, name: 'カリフォルニアロール', price: 280, description: 'アボカドとカニの裏巻きです。', image_url: '/images/california.jpg' },
      { id: 10, name: '太巻き', price: 220, description: '具だくさんの太巻きです。', image_url: '/images/futomaki.jpg' }
    ],
    3: [ // 軍艦巻き
      { id: 11, name: 'いくら軍艦', price: 200, description: 'プチプチ食感のいくらです。', image_url: '/images/ikura.jpg' },
      { id: 12, name: 'うに軍艦', price: 250, description: '濃厚なうにの軍艦巻きです。', image_url: '/images/uni.jpg' },
      { id: 13, name: 'ねぎとろ軍艦', price: 180, description: 'ねぎとろの軍艦巻きです。', image_url: '/images/negitoro.jpg' },
      { id: 14, name: 'コーン軍艦', price: 120, description: 'マヨネーズコーンの軍艦巻きです。', image_url: '/images/corn.jpg' }
    ],
    4: [ // 海鮮丼
      { id: 15, name: '特上海鮮丼', price: 890, description: '新鮮な海の幸がたっぷりの海鮮丼です。', image_url: '/images/kaisendon.jpg' },
      { id: 16, name: 'まぐろ丼', price: 680, description: 'まぐろづくしの贅沢丼です。', image_url: '/images/magurodon.jpg' },
      { id: 17, name: 'サーモン丼', price: 580, description: 'サーモンがたっぷりの丼です。', image_url: '/images/salmondon.jpg' }
    ],
    5: [ // 特選寿司
      { id: 18, name: '大トロ', price: 380, description: '最高級の大トロです。', image_url: '/images/otoro.jpg' },
      { id: 19, name: '中トロ', price: 280, description: '脂ののった中トロです。', image_url: '/images/chutoro.jpg' },
      { id: 20, name: 'ウニ', price: 320, description: '北海道産の極上ウニです。', image_url: '/images/uni_special.jpg' },
      { id: 21, name: 'あわび', price: 420, description: '肉厚なあわびです。', image_url: '/images/awabi.jpg' }
    ],
    6: [ // サイドメニュー
      { id: 22, name: '茶碗蒸し', price: 180, description: 'なめらかな茶碗蒸しです。', image_url: '/images/chawanmushi.jpg' },
      { id: 23, name: '枝豆', price: 120, description: '塩茹でした枝豆です。', image_url: '/images/edamame.jpg' },
      { id: 24, name: 'サラダ', price: 200, description: '新鮮野菜のサラダです。', image_url: '/images/salad.jpg' }
    ],
    7: [ // 汁物
      { id: 25, name: 'あら汁', price: 150, description: '魚のあらで作った出汁の効いた汁物です。', image_url: '/images/arajiru.jpg' },
      { id: 26, name: 'みそ汁', price: 100, description: '定番のみそ汁です。', image_url: '/images/misoshiru.jpg' }
    ],
    8: [ // デザート
      { id: 27, name: 'わらび餅', price: 180, description: 'きな粉をまぶしたわらび餅です。', image_url: '/images/warabimochi.jpg' },
      { id: 28, name: 'アイスクリーム', price: 150, description: 'バニラアイスクリームです。', image_url: '/images/ice.jpg' }
    ],
    9: [ // 飲み物
      { id: 29, name: '緑茶', price: 80, description: '香り高い緑茶です。', image_url: '/images/tea.jpg' },
      { id: 30, name: 'ウーロン茶', price: 80, description: 'さっぱりとしたウーロン茶です。', image_url: '/images/oolong.jpg' },
      { id: 31, name: 'オレンジジュース', price: 120, description: '100%オレンジジュースです。', image_url: '/images/orange.jpg' }
    ],
    10: [ // 季節限定
      { id: 32, name: '秋刀魚', price: 200, description: '秋の味覚、脂ののった秋刀魚です。', image_url: '/images/sanma.jpg' },
      { id: 33, name: 'かつお', price: 180, description: '初鰹の季節限定メニューです。', image_url: '/images/katsuo.jpg' }
    ]
  };

  useEffect(() => {
    fetchCategories();
    // カートの内容をローカルストレージから復元
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      const data = await response.json();
      setCategories(data.data);
      setLoading(false);
    } catch (error) {
      console.error('カテゴリの取得に失敗しました。ダミーデータを使用します:', error);
      // APIが失敗した場合はダミーデータを使用
      setCategories(dummyCategories);
      setLoading(false);
    }
  };

  const fetchProducts = async (categoryId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products?category_id=${categoryId}`);
      const data = await response.json();
      setProducts(data.data || []);
    } catch (error) {
      console.error('商品の取得に失敗しました。ダミーデータを使用します:', error);
      // APIが失敗した場合はダミーデータを使用
      const categoryProducts = dummyProducts[categoryId] || [];
      setProducts(categoryProducts);
    }
  };

  const selectCategory = (category: Category) => {
    setSelectedCategory(category);
    fetchProducts(category.id);
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    let newCart;
    
    if (existingItem) {
      newCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      }];
    }
    
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const goToCart = () => {
    router.push('/cart');
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

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
            <h1 className="text-2xl font-bold">🍣 お寿司注文</h1>
            <p className="text-red-100">テーブル: T-001</p>
          </div>
          <button
            onClick={goToCart}
            className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg font-semibold transition-colors relative"
          >
            🛒 カート ({cartItemCount})
          </button>
        </div>
      </header>

      <div className="container mx-auto p-4">
        {!selectedCategory ? (
          /* カテゴリ一覧 */
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">カテゴリを選択してください</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => selectCategory(category)}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-left"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{category.name}</h3>
                  <p className="text-gray-600">{category.description}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* 商品一覧 */
          <div>
            <div className="flex items-center mb-6">
              <button
                onClick={() => setSelectedCategory(null)}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg mr-4 transition-colors"
              >
                ← 戻る
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedCategory.name}</h2>
                <p className="text-gray-600">{selectedCategory.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl p-6 shadow-lg">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-red-600">¥{product.price}</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      カートに入れる
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">このカテゴリには商品がありません</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
