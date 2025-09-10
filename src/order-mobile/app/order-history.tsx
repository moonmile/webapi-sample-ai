import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
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
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  orderTime: string;
}

export default function OrderHistoryScreen() {
  const [orders] = useState<Order[]>([
    {
      id: 1,
      orderNumber: '#123456',
      items: [
        { id: 1, name: 'まぐろ', price: 150, quantity: 2 },
        { id: 2, name: 'サーモン', price: 120, quantity: 1 },
        { id: 7, name: 'かっぱ巻き', price: 120, quantity: 1 },
      ],
      totalAmount: 594,
      status: 'preparing',
      orderTime: '14:30',
    },
    {
      id: 2,
      orderNumber: '#123455',
      items: [
        { id: 18, name: '大トロ', price: 380, quantity: 1 },
        { id: 11, name: 'いくら軍艦', price: 200, quantity: 2 },
      ],
      totalAmount: 858,
      status: 'ready',
      orderTime: '14:15',
    },
    {
      id: 3,
      orderNumber: '#123454',
      items: [
        { id: 4, name: 'たまご', price: 80, quantity: 2 },
        { id: 22, name: '茶碗蒸し', price: 180, quantity: 1 },
      ],
      totalAmount: 374,
      status: 'delivered',
      orderTime: '14:00',
    },
  ]);

  const goBack = () => {
    router.back();
  };

  const goToPayment = () => {
    router.push('/payment');
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'preparing': return '#3b82f6';
      case 'ready': return '#059669';
      case 'delivered': return '#6b7280';
      default: return '#6b7280';
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

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'preparing': return '👨‍🍳';
      case 'ready': return '✅';
      case 'delivered': return '🚚';
      default: return '❓';
    }
  };

  const getTotalOrderAmount = () => {
    return orders.reduce((total, order) => total + order.totalAmount, 0);
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
            <ThemedText style={styles.title}>📋 注文履歴</ThemedText>
            <ThemedText style={styles.subtitle}>{orders.length}件の注文</ThemedText>
          </ThemedView>
          <ThemedView style={styles.placeholder} />
        </ThemedView>
      </ThemedView>

      <ScrollView style={styles.content}>
        {/* 注文一覧 */}
        <ThemedView style={styles.ordersContainer}>
          {orders.map((order) => (
            <ThemedView key={order.id} style={styles.orderCard}>
              {/* 注文ヘッダー */}
              <ThemedView style={styles.orderHeader}>
                <ThemedView style={styles.orderInfo}>
                  <ThemedText style={styles.orderNumber}>{order.orderNumber}</ThemedText>
                  <ThemedText style={styles.orderTime}>{order.orderTime}</ThemedText>
                </ThemedView>
                <ThemedView style={styles.statusContainer}>
                  <ThemedText style={styles.statusIcon}>{getStatusIcon(order.status)}</ThemedText>
                  <ThemedText style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {getStatusText(order.status)}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              {/* 注文アイテム */}
              <ThemedView style={styles.itemsContainer}>
                {order.items.map((item, index) => (
                  <ThemedView key={index} style={styles.orderItem}>
                    <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                    <ThemedText style={styles.itemDetails}>
                      ¥{item.price} × {item.quantity}
                    </ThemedText>
                    <ThemedText style={styles.itemTotal}>¥{item.price * item.quantity}</ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>

              {/* 注文合計 */}
              <ThemedView style={styles.orderFooter}>
                <ThemedText style={styles.orderTotalLabel}>合計</ThemedText>
                <ThemedText style={styles.orderTotalAmount}>¥{order.totalAmount}</ThemedText>
              </ThemedView>
            </ThemedView>
          ))}
        </ThemedView>

        {/* 全体の合計 */}
        <ThemedView style={styles.grandTotalContainer}>
          <ThemedView style={styles.grandTotalRow}>
            <ThemedText style={styles.grandTotalLabel}>本日の合計金額</ThemedText>
            <ThemedText style={styles.grandTotalAmount}>¥{getTotalOrderAmount()}</ThemedText>
          </ThemedView>
          <ThemedText style={styles.grandTotalNote}>
            税込み価格です。お会計時にお支払いください。
          </ThemedText>
        </ThemedView>

        {/* アクションボタン */}
        <ThemedView style={styles.actionContainer}>
          <ThemedView style={[styles.button, styles.paymentButton]}>
            <ThemedText style={styles.paymentButtonText} onPress={goToPayment}>
              💳 お会計に進む
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* 説明 */}
        <ThemedView style={styles.infoContainer}>
          <ThemedText style={styles.infoTitle}>📝 ステータスについて</ThemedText>
          <ThemedView style={styles.statusExplanation}>
            <ThemedView style={styles.statusRow}>
              <ThemedText style={styles.statusExampleIcon}>⏳</ThemedText>
              <ThemedText style={styles.statusExampleText}>注文受付 - 注文を受け付けました</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statusRow}>
              <ThemedText style={styles.statusExampleIcon}>👨‍🍳</ThemedText>
              <ThemedText style={styles.statusExampleText}>調理中 - 厨房で調理中です</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statusRow}>
              <ThemedText style={styles.statusExampleIcon}>✅</ThemedText>
              <ThemedText style={styles.statusExampleText}>配送準備完了 - お席にお持ちします</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statusRow}>
              <ThemedText style={styles.statusExampleIcon}>🚚</ThemedText>
              <ThemedText style={styles.statusExampleText}>配送済み - お席にお届け完了</ThemedText>
            </ThemedView>
          </ThemedView>
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
  ordersContainer: {
    padding: 20,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  orderTime: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 20,
    marginRight: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemsContainer: {
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
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
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  orderTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  orderTotalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  grandTotalContainer: {
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
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  grandTotalNote: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  actionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
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
  paymentButton: {
    backgroundColor: '#059669',
  },
  paymentButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: '#dbeafe',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
  },
  statusExplanation: {
    marginLeft: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusExampleIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  statusExampleText: {
    fontSize: 14,
    color: '#1e40af',
    flex: 1,
  },
});
