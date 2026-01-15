import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import type { StoredCartItem } from '@/app/lib/cartStorage';
import { loadCartFromStorage, saveCartToStorage } from '@/app/lib/cartStorage';

interface Category {
  id: number;
  name: string;
  description: string;
  emoji: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  emoji: string;
}

export default function CategoriesScreen() {
  const [categories] = useState<Category[]>([
    { id: 1, name: '握り寿司', description: '新鮮なネタを使った伝統的な握り寿司です。', emoji: '🍣' },
    { id: 2, name: '巻き寿司', description: '海苔で巻いた美味しい巻き寿司各種です。', emoji: '🍙' },
    { id: 3, name: '軍艦巻き', description: 'いくらやウニなどの軍艦巻きです。', emoji: '🦐' },
    { id: 4, name: '海鮮丼', description: '新鮮な海の幸をのせた豪華な海鮮丼です。', emoji: '🍱' },
    { id: 5, name: '特選寿司', description: '厳選された高級ネタを使用した特選寿司です。', emoji: '✨' },
    { id: 6, name: 'サイドメニュー', description: '寿司と一緒に楽しめるサイドメニューです。', emoji: '🥗' },
  ]);

  const [products] = useState<{ [key: number]: Product[] }>({
    1: [
      { id: 1, name: 'まぐろ', price: 150, description: '新鮮なまぐろの赤身です。', emoji: '🐟' },
      { id: 2, name: 'サーモン', price: 120, description: 'ノルウェー産の新鮮なサーモンです。', emoji: '🐠' },
      { id: 3, name: 'えび', price: 100, description: 'ぷりぷりの甘えびです。', emoji: '🦐' },
      { id: 4, name: 'たまご', price: 80, description: 'ふわふわの厚焼き玉子です。', emoji: '🥚' },
    ],
    2: [
      { id: 7, name: 'かっぱ巻き', price: 120, description: 'きゅうりの細巻きです。', emoji: '🥒' },
      { id: 8, name: 'てっか巻き', price: 180, description: 'まぐろの細巻きです。', emoji: '🍣' },
      { id: 9, name: 'カリフォルニアロール', price: 280, description: 'アボカドとカニの裏巻きです。', emoji: '🥑' },
    ],
    3: [
      { id: 11, name: 'いくら軍艦', price: 200, description: 'プチプチ食感のいくらです。', emoji: '🔴' },
      { id: 12, name: 'うに軍艦', price: 250, description: '濃厚なうにの軍艦巻きです。', emoji: '🟡' },
      { id: 13, name: 'ねぎとろ軍艦', price: 180, description: 'ねぎとろの軍艦巻きです。', emoji: '🟢' },
    ],
    4: [
      { id: 15, name: '特上海鮮丼', price: 890, description: '新鮮な海の幸がたっぷりの海鮮丼です。', emoji: '🍱' },
      { id: 16, name: 'まぐろ丼', price: 680, description: 'まぐろづくしの贅沢丼です。', emoji: '🍚' },
    ],
    5: [
      { id: 18, name: '大トロ', price: 380, description: '最高級の大トロです。', emoji: '💎' },
      { id: 19, name: '中トロ', price: 280, description: '脂ののった中トロです。', emoji: '⭐' },
    ],
    6: [
      { id: 22, name: '茶碗蒸し', price: 180, description: 'なめらかな茶碗蒸しです。', emoji: '🍮' },
      { id: 23, name: '枝豆', price: 120, description: '塩茹でした枝豆です。', emoji: '🟢' },
    ],
  });

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [cart, setCart] = useState<StoredCartItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const storedCart = await loadCartFromStorage();
      if (isMounted) {
        setCart(storedCart);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

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
    void saveCartToStorage(newCart);
    
    Alert.alert('追加完了', `${product.name}をカートに追加しました`);
  };

  const goToCart = () => {
    router.push('/cart');
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <ThemedView style={styles.container}>
      {/* ヘッダー */}
      <ThemedView style={styles.header}>
        <ThemedView style={styles.headerContent}>
          <ThemedView>
            <ThemedText style={styles.title}>🍣 お寿司注文</ThemedText>
            <ThemedText style={styles.subtitle}>カテゴリから選択</ThemedText>
          </ThemedView>
          <ThemedView style={[styles.button, styles.cartButton]}>
            <ThemedText style={styles.cartButtonText} onPress={goToCart}>
              🛒 カート ({cartItemCount})
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ScrollView style={styles.content}>
        {!selectedCategory ? (
          /* カテゴリ一覧 */
          <ThemedView style={styles.gridContainer}>
            <ThemedText style={styles.sectionTitle}>カテゴリを選択してください</ThemedText>
            <ThemedView style={styles.grid}>
              {categories.map((category) => (
                <ThemedView 
                  key={category.id} 
                  style={styles.categoryCard}
                >
                  <ThemedText 
                    style={styles.categoryCardContent}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <ThemedText style={styles.categoryEmoji}>{category.emoji}</ThemedText>
                    <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
                    <ThemedText style={styles.categoryDescription}>{category.description}</ThemedText>
                  </ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          </ThemedView>
        ) : (
          /* 商品一覧 */
          <ThemedView style={styles.productsContainer}>
            <ThemedView style={styles.backButtonContainer}>
              <ThemedView style={[styles.button, styles.backButton]}>
                <ThemedText 
                  style={styles.backButtonText}
                  onPress={() => setSelectedCategory(null)}
                >
                  ← 戻る
                </ThemedText>
              </ThemedView>
            </ThemedView>
            
            <ThemedView style={styles.categoryHeader}>
              <ThemedText style={styles.categoryTitle}>
                {selectedCategory.emoji} {selectedCategory.name}
              </ThemedText>
              <ThemedText style={styles.categoryDesc}>{selectedCategory.description}</ThemedText>
            </ThemedView>

            <ThemedView style={styles.grid}>
              {(products[selectedCategory.id] || []).map((product) => (
                <ThemedView key={product.id} style={styles.productCard}>
                  <ThemedText style={styles.productEmoji}>{product.emoji}</ThemedText>
                  <ThemedText style={styles.productName}>{product.name}</ThemedText>
                  <ThemedText style={styles.productDescription}>{product.description}</ThemedText>
                  <ThemedView style={styles.productFooter}>
                    <ThemedText style={styles.productPrice}>¥{product.price}</ThemedText>
                    <ThemedView style={[styles.button, styles.addButton]}>
                      <ThemedText 
                        style={styles.addButtonText}
                        onPress={() => addToCart(product)}
                      >
                        カートに入れる
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                </ThemedView>
              ))}
            </ThemedView>

            {(products[selectedCategory.id] || []).length === 0 && (
              <ThemedView style={styles.emptyState}>
                <ThemedText style={styles.emptyText}>このカテゴリには商品がありません</ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#dc2626',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: '#fecaca',
  },
  content: {
    flex: 1,
  },
  gridContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 20,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryCardContent: {
    padding: 20,
  },
  categoryEmoji: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  productsContainer: {
    padding: 20,
  },
  backButtonContainer: {
    marginBottom: 20,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    backgroundColor: '#6b7280',
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cartButton: {
    backgroundColor: '#b91c1c',
  },
  cartButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  categoryHeader: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  categoryDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  productCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productEmoji: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 6,
  },
  productDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 16,
  },
  productFooter: {
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
});
