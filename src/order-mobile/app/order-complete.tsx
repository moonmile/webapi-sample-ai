import React from 'react';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function OrderCompleteScreen() {
  const orderNumber = `#${Date.now().toString().slice(-6)}`;
  const estimatedTime = 15; // 15分

  const goToOrderHistory = () => {
    router.push('/order-history');
  };

  const orderAgain = () => {
    router.push('/categories');
  };

  const goToPayment = () => {
    router.push('/payment');
  };

  return (
    <ThemedView style={styles.container}>
      {/* ヘッダー */}
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>注文完了</ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        {/* 完了アイコン */}
        <ThemedView style={styles.successContainer}>
          <ThemedText style={styles.successIcon}>✅</ThemedText>
          <ThemedText style={styles.successTitle}>注文が完了しました！</ThemedText>
          <ThemedText style={styles.successMessage}>
            ご注文ありがとうございます。{'\n'}
            厨房で調理を開始いたします。
          </ThemedText>
        </ThemedView>

        {/* 注文情報 */}
        <ThemedView style={styles.orderInfo}>
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>注文番号</ThemedText>
            <ThemedText style={styles.infoValue}>{orderNumber}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>予想調理時間</ThemedText>
            <ThemedText style={styles.infoValue}>約{estimatedTime}分</ThemedText>
          </ThemedView>
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>ステータス</ThemedText>
            <ThemedText style={[styles.infoValue, styles.statusPending]}>調理中</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* 注文内容サマリー */}
        <ThemedView style={styles.orderSummary}>
          <ThemedText style={styles.summaryTitle}>注文内容</ThemedText>
          <ThemedView style={styles.summaryItem}>
            <ThemedText style={styles.summaryText}>まぐろ × 2</ThemedText>
            <ThemedText style={styles.summaryPrice}>¥300</ThemedText>
          </ThemedView>
          <ThemedView style={styles.summaryItem}>
            <ThemedText style={styles.summaryText}>サーモン × 1</ThemedText>
            <ThemedText style={styles.summaryPrice}>¥120</ThemedText>
          </ThemedView>
          <ThemedView style={styles.summaryItem}>
            <ThemedText style={styles.summaryText}>かっぱ巻き × 1</ThemedText>
            <ThemedText style={styles.summaryPrice}>¥120</ThemedText>
          </ThemedView>
          <ThemedView style={styles.divider} />
          <ThemedView style={styles.summaryItem}>
            <ThemedText style={styles.summaryTotal}>合計（税込）</ThemedText>
            <ThemedText style={styles.summaryTotalPrice}>¥594</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* アクションボタン */}
        <ThemedView style={styles.actionContainer}>
          <ThemedView style={[styles.button, styles.primaryButton]}>
            <ThemedText style={styles.primaryButtonText} onPress={goToOrderHistory}>
              注文履歴を確認
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={[styles.button, styles.secondaryButton]}>
            <ThemedText style={styles.secondaryButtonText} onPress={orderAgain}>
              追加で注文する
            </ThemedText>
          </ThemedView>

          <ThemedView style={[styles.button, styles.paymentButton]}>
            <ThemedText style={styles.paymentButtonText} onPress={goToPayment}>
              お会計へ進む
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* 注意事項 */}
        <ThemedView style={styles.noteContainer}>
          <ThemedText style={styles.noteTitle}>📝 ご案内</ThemedText>
          <ThemedText style={styles.noteText}>
            • 調理が完了次第、お席までお持ちいたします{'\n'}
            • 注文の追加はいつでも可能です{'\n'}
            • お会計は最後にまとめて行えます{'\n'}
            • ご不明な点がございましたらスタッフまでお声がけください
          </ThemedText>
        </ThemedView>
      </ThemedView>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  successIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  orderInfo: {
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  statusPending: {
    color: '#f59e0b',
  },
  orderSummary: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 15,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryPrice: {
    fontSize: 14,
    color: '#374151',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 10,
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  summaryTotalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  actionContainer: {
    marginBottom: 20,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#dc2626',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  secondaryButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentButton: {
    backgroundColor: '#059669',
  },
  paymentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteContainer: {
    backgroundColor: '#fef3c7',
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
