import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  orderTime: string;
}

export default function PaymentScreen() {
  const [orders] = useState<Order[]>([
    {
      id: 1,
      orderNumber: '#123456',
      items: [
        { id: 1, name: 'まぐろ', price: 150, quantity: 2 },
        { id: 2, name: 'サーモン', price: 120, quantity: 1 },
        { id: 7, name: 'かっぱ巻き', price: 120, quantity: 1 },
      ],
      totalAmount: 540,
      orderTime: '14:30',
    },
    {
      id: 2,
      orderNumber: '#123455',
      items: [
        { id: 18, name: '大トロ', price: 380, quantity: 1 },
        { id: 11, name: 'いくら軍艦', price: 200, quantity: 2 },
      ],
      totalAmount: 780,
      orderTime: '14:15',
    },
  ]);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');

  const paymentMethods = [
    { id: 'cash', name: '現金', icon: '💴', description: 'レジにて現金でお支払い' },
    { id: 'card', name: 'クレジットカード', icon: '💳', description: 'Visa, Mastercard, JCB対応' },
    { id: 'qr', name: 'QR決済', icon: '📱', description: 'PayPay, LINE Pay等' },
    { id: 'ic', name: 'ICカード', icon: '🎫', description: 'Suica, PASMO等の交通系IC' },
  ];

  const getTotalAmount = () => {
    return orders.reduce((total, order) => total + order.totalAmount, 0);
  };

  const getTaxAmount = () => {
    return Math.floor(getTotalAmount() * 0.1);
  };

  const getFinalAmount = () => {
    return getTotalAmount() + getTaxAmount();
  };

  const goBack = () => {
    router.back();
  };

  const processPayment = () => {
    if (!selectedPaymentMethod) {
      Alert.alert('エラー', 'お支払い方法を選択してください');
      return;
    }

    const paymentMethodName = paymentMethods.find(method => method.id === selectedPaymentMethod)?.name;
    
    Alert.alert(
      'お支払い確認',
      `${paymentMethodName}で¥${getFinalAmount()}をお支払いしますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'お支払い確定',
          onPress: () => {
            Alert.alert(
              'お支払い完了',
              'ありがとうございました！\nまたのご利用をお待ちしております。',
              [{ text: 'OK', onPress: () => router.push('/(tabs)') }]
            );
          }
        }
      ]
    );
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
            <ThemedText style={styles.title}>💳 お会計</ThemedText>
            <ThemedText style={styles.subtitle}>お支払い方法を選択</ThemedText>
          </ThemedView>
          <ThemedView style={styles.placeholder} />
        </ThemedView>
      </ThemedView>

      <ScrollView style={styles.content}>
        {/* 注文内容 */}
        <ThemedView style={styles.ordersContainer}>
          <ThemedText style={styles.sectionTitle}>ご注文内容</ThemedText>
          {orders.map((order) => (
            <ThemedView key={order.id} style={styles.orderCard}>
              <ThemedView style={styles.orderHeader}>
                <ThemedText style={styles.orderNumber}>{order.orderNumber}</ThemedText>
                <ThemedText style={styles.orderTime}>{order.orderTime}</ThemedText>
              </ThemedView>
              {order.items.map((item, index) => (
                <ThemedView key={index} style={styles.orderItem}>
                  <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                  <ThemedText style={styles.itemDetails}>
                    ¥{item.price} × {item.quantity}
                  </ThemedText>
                  <ThemedText style={styles.itemTotal}>¥{item.price * item.quantity}</ThemedText>
                </ThemedView>
              ))}
              <ThemedView style={styles.orderTotal}>
                <ThemedText style={styles.orderTotalText}>小計: ¥{order.totalAmount}</ThemedText>
              </ThemedView>
            </ThemedView>
          ))}
        </ThemedView>

        {/* 合計金額 */}
        <ThemedView style={styles.totalContainer}>
          <ThemedText style={styles.sectionTitle}>お会計金額</ThemedText>
          <ThemedView style={styles.totalRow}>
            <ThemedText style={styles.totalLabel}>小計</ThemedText>
            <ThemedText style={styles.totalAmount}>¥{getTotalAmount()}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.totalRow}>
            <ThemedText style={styles.totalLabel}>消費税（10%）</ThemedText>
            <ThemedText style={styles.totalAmount}>¥{getTaxAmount()}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.divider} />
          <ThemedView style={styles.totalRow}>
            <ThemedText style={styles.grandTotalLabel}>合計</ThemedText>
            <ThemedText style={styles.grandTotalAmount}>¥{getFinalAmount()}</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* 支払い方法選択 */}
        <ThemedView style={styles.paymentContainer}>
          <ThemedText style={styles.sectionTitle}>お支払い方法</ThemedText>
          {paymentMethods.map((method) => (
            <ThemedView
              key={method.id}
              style={[
                styles.paymentMethod,
                selectedPaymentMethod === method.id && styles.selectedPaymentMethod
              ]}
            >
              <ThemedText 
                style={styles.paymentMethodContent}
                onPress={() => setSelectedPaymentMethod(method.id)}
              >
                <ThemedView style={styles.paymentMethodLeft}>
                  <ThemedText style={styles.paymentIcon}>{method.icon}</ThemedText>
                  <ThemedView style={styles.paymentInfo}>
                    <ThemedText style={styles.paymentName}>{method.name}</ThemedText>
                    <ThemedText style={styles.paymentDescription}>{method.description}</ThemedText>
                  </ThemedView>
                </ThemedView>
                <ThemedView style={styles.radioContainer}>
                  <ThemedView style={[
                    styles.radio,
                    selectedPaymentMethod === method.id && styles.radioSelected
                  ]}>
                    {selectedPaymentMethod === method.id && (
                      <ThemedText style={styles.radioCheck}>✓</ThemedText>
                    )}
                  </ThemedView>
                </ThemedView>
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>

        {/* お支払いボタン */}
        <ThemedView style={styles.payButtonContainer}>
          <ThemedView style={[
            styles.button,
            styles.payButton,
            !selectedPaymentMethod && styles.disabledButton
          ]}>
            <ThemedText 
              style={[
                styles.payButtonText,
                !selectedPaymentMethod && styles.disabledButtonText
              ]}
              onPress={processPayment}
            >
              ¥{getFinalAmount()} をお支払い
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* 注意事項 */}
        <ThemedView style={styles.noteContainer}>
          <ThemedText style={styles.noteTitle}>📝 お支払いについて</ThemedText>
          <ThemedText style={styles.noteText}>
            • お支払いは退店時にフロントで承ります{'\n'}
            • 領収書が必要な場合はスタッフまでお申し付けください{'\n'}
            • 各種クレジットカード・電子マネーがご利用いただけます{'\n'}
            • ポイントカードをお持ちの方は会計時にご提示ください
          </ThemedText>
        </ThemedView>
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
    backgroundColor: '#059669',
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
    color: '#d1fae5',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 15,
  },
  ordersContainer: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  orderTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  itemName: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  itemDetails: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 10,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  orderTotal: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    alignItems: 'flex-end',
  },
  orderTotalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
  },
  totalContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
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
    marginBottom: 8,
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
  paymentContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  paymentMethod: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedPaymentMethod: {
    borderColor: '#059669',
    backgroundColor: '#f0fdf4',
  },
  paymentMethodContent: {
    padding: 15,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2,
  },
  paymentDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  radioContainer: {
    position: 'absolute',
    right: 15,
    top: 20,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#059669',
    backgroundColor: '#059669',
  },
  radioCheck: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  payButtonContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    backgroundColor: '#047857',
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  payButton: {
    backgroundColor: '#059669',
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
  },
  disabledButtonText: {
    color: '#9ca3af',
  },
  noteContainer: {
    backgroundColor: '#fef3c7',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 15,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
});
