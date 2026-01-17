import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedInput } from '@/components/ThemedInput';
import { submitOrderItem } from './lib/api';
import type { StoredCartItem } from './lib/cartStorage';
import { loadCartFromStorage, saveCartToStorage, clearCartStorage } from './lib/cartStorage';

const DEFAULT_SEAT_ID = 1;

export default function CartScreen() {
  const [cart, setCart] = useState<StoredCartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCart, setIsLoadingCart] = useState(true);

  const persistCart = useCallback(async (nextCart: StoredCartItem[]) => {
    setCart(nextCart);
    try {
      await saveCartToStorage(nextCart);
    } catch (error) {
      console.error('Failed to persist cart', error);
      Alert.alert('エラー', 'カートの保存に失敗しました。時間をおいて再度お試しください。');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      (async () => {
        setIsLoadingCart(true);
        const storedCart = await loadCartFromStorage();
        if (isActive) {
          setCart(storedCart);
          setIsLoadingCart(false);
        }
      })();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const updateQuantity = (id: number, newQuantity: number) => {
    let updatedCart: StoredCartItem[];

    if (newQuantity <= 0) {
      updatedCart = cart.filter(item => item.id !== id);
    } else {
      updatedCart = cart.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
    }

    void persistCart(updatedCart);
  };

  const removeItem = (id: number) => {
    Alert.alert(
      '商品を削除',
      'この商品をカートから削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            const updatedCart = cart.filter(item => item.id !== id);
            void persistCart(updatedCart);
          },
        },
      ]
    );
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const sendOrder = async () => {
    setIsSubmitting(true);

    try {
      for (const item of cart) {
        await submitOrderItem({
          seatId: DEFAULT_SEAT_ID,
          productId: item.id,
          quantity: item.quantity,
        });
      }

      const subtotal = getTotalAmount();
      const totalWithTax = Math.floor(subtotal * 1.1);
      const summary = {
        seatId: DEFAULT_SEAT_ID,
        subtotal,
        totalWithTax,
        items: cart,
      };

      await clearCartStorage();
      setCart([]);
      const encodedSummary = encodeURIComponent(JSON.stringify(summary));
      router.push(`/order-complete?summary=${encodedSummary}`);
    } catch (error) {
      console.error(error);
      Alert.alert(
        '注文エラー',
        error instanceof Error
          ? error.message
          : '注文の送信に失敗しました。もう一度お試しください。'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmOrder = () => {
    if (cart.length === 0) {
      Alert.alert('エラー', 'カートが空です');
      return;
    }

    Alert.alert(
      '注文確認',
      `合計 ¥${Math.floor(getTotalAmount() * 1.1)} (税込) の注文を確定しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '注文確定',
          onPress: () => {
            void sendOrder();
          },
        },
      ]
    );
  };

  const goBack = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      {/* ヘッダー */}
      <ThemedView style={styles.header}>
        <ThemedView style={styles.headerContent}>
          <ThemedView style={[styles.button, styles.backButton]}>
            <ThemedText style={styles.backButtonText} onPress={goBack}>
              ← 戻る
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.headerTextContainer}>
            <ThemedText style={styles.title}>🛒 カート</ThemedText>
            <ThemedText style={styles.subtitle}>{`テーブル: T-${String(DEFAULT_SEAT_ID).padStart(3, '0')}`}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.placeholder} />
        </ThemedView>
      </ThemedView>

      <ScrollView style={styles.content}>
        {isLoadingCart ? (
          <ThemedView style={styles.loadingContainer}>
            <ThemedText style={styles.loadingText}>カートを読み込んでいます...</ThemedText>
          </ThemedView>
        ) : cart.length > 0 ? (
          <ThemedView style={styles.cartContainer}>
            {/* カート商品一覧 */}
            <ThemedView style={styles.itemsContainer}>
              <ThemedText style={styles.sectionTitle}>注文内容</ThemedText>
              {cart.map((item) => (
                <ThemedView key={item.id} style={styles.cartItem}>
                  <ThemedView style={styles.itemInfo}>
                    <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                    <ThemedText style={styles.itemPrice}>¥{item.price}</ThemedText>
                  </ThemedView>

                  <ThemedView style={styles.quantityContainer}>
                    <ThemedView style={[styles.button, styles.quantityButton]}>
                      <ThemedText
                        style={styles.quantityButtonText}
                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        −
                      </ThemedText>
                    </ThemedView>
                    <ThemedText style={styles.quantity}>{item.quantity}</ThemedText>
                    <ThemedView style={[styles.button, styles.quantityButton]}>
                      <ThemedText
                        style={styles.quantityButtonText}
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        ＋
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>

                  <ThemedView style={styles.itemTotal}>
                    <ThemedText style={styles.itemTotalText}>¥{item.price * item.quantity}</ThemedText>
                    <ThemedView style={[styles.button, styles.removeButton]}>
                      <ThemedText
                        style={styles.removeButtonText}
                        onPress={() => removeItem(item.id)}
                      >
                        削除
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                </ThemedView>
              ))}
            </ThemedView>

            {/* 合計金額 */}
            <ThemedView style={styles.totalContainer}>
              <ThemedView style={styles.totalRow}>
                <ThemedText style={styles.totalLabel}>小計</ThemedText>
                <ThemedText style={styles.totalAmount}>¥{getTotalAmount()}</ThemedText>
              </ThemedView>
              <ThemedView style={styles.totalRow}>
                <ThemedText style={styles.totalLabel}>税込</ThemedText>
                <ThemedText style={styles.totalAmount}>¥{Math.floor(getTotalAmount() * 1.1)}</ThemedText>
              </ThemedView>
              <ThemedView style={styles.divider} />
              <ThemedView style={styles.totalRow}>
                <ThemedText style={styles.grandTotalLabel}>合計</ThemedText>
                <ThemedText style={styles.grandTotalAmount}>¥{Math.floor(getTotalAmount() * 1.1)}</ThemedText>
              </ThemedView>
            </ThemedView>

            {/* 注文確定ボタン */}
            <ThemedView style={styles.orderButtonContainer}>
              <ThemedView style={[styles.button, styles.orderButton]}>
                <ThemedText
                  style={styles.orderButtonText}
                  onPress={isSubmitting ? undefined : confirmOrder}
                >
                  {isSubmitting ? '送信中...' : '注文を確定する'}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        ) : (
          /* 空のカート */
          <ThemedView style={styles.emptyCart}>
            <ThemedText style={styles.emptyCartIcon}>🛒</ThemedText>
            <ThemedText style={styles.emptyCartTitle}>カートが空です</ThemedText>
            <ThemedText style={styles.emptyCartText}>
              カテゴリ画面から商品を選んでカートに追加してください
            </ThemedText>
            <ThemedView style={[styles.button, styles.shopButton]}>
              <ThemedText style={styles.shopButtonText} onPress={goBack}>
                商品を選ぶ
              </ThemedText>
            </ThemedView>
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
  headerTextContainer: {
    alignItems: 'center',
    flex: 1,
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
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  cartContainer: {
    padding: 20,
  },
  itemsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 15,
  },
  cartItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#6b7280',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  quantity: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginHorizontal: 15,
    minWidth: 25,
    textAlign: 'center',
  },
  itemTotal: {
    alignItems: 'flex-end',
  },
  itemTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 5,
  },
  button: {
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    backgroundColor: '#b91c1c',
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quantityButton: {
    backgroundColor: '#6b7280',
    borderRadius: 20,
    width: 32,
    height: 32,
  },
  quantityButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  totalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  totalAmount: {
    fontSize: 16,
    color: '#374151',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 10,
  },
  grandTotalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  grandTotalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  orderButtonContainer: {
    alignItems: 'center',
  },
  orderButton: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
  },
  orderButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyCart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyCartIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyCartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
  },
  emptyCartText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
  },
});
