import React, { useState } from 'react';
import { StyleSheet, Alert, Platform } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function QRScreen() {
  const [guestCount, setGuestCount] = useState(1);
  const [tableNumber, setTableNumber] = useState('');

  const simulateQRScan = () => {
    // QRコードスキャンをシミュレート
    const mockTableNumber = `T-${String(Math.floor(Math.random() * 10) + 1).padStart(3, '0')}`;
    setTableNumber(mockTableNumber);
    Alert.alert('QRコード読み取り完了', `テーブル番号: ${mockTableNumber}`);
  };

  const incrementGuests = () => {
    if (guestCount < 10) {
      setGuestCount(guestCount + 1);
    }
  };

  const decrementGuests = () => {
    if (guestCount > 1) {
      setGuestCount(guestCount - 1);
    }
  };

  const startOrder = () => {
    if (!tableNumber) {
      Alert.alert('エラー', 'まずQRコードを読み取ってください');
      return;
    }
    
    // テーブル情報をローカルストレージに保存（React Nativeでは AsyncStorage を使用）
    Alert.alert(
      '注文開始',
      `テーブル ${tableNumber} で ${guestCount}名様の注文を開始します`,
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: 'OK', 
          onPress: () => {
            // カテゴリ画面に遷移
            router.push('/categories');
          }
        }
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>🍣 お寿司注文</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>スマホアプリ</ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        {/* QRコード読み取りセクション */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            1. QRコードを読み取り
          </ThemedText>
          <ThemedView style={styles.qrContainer}>
            {tableNumber ? (
              <ThemedView style={styles.tableInfo}>
                <ThemedText style={styles.tableNumber}>テーブル: {tableNumber}</ThemedText>
                <ThemedText style={styles.checkmark}>✅ 読み取り完了</ThemedText>
              </ThemedView>
            ) : (
              <ThemedView style={styles.qrPlaceholder}>
                <ThemedText style={styles.qrIcon}>📱</ThemedText>
                <ThemedText style={styles.qrText}>QRコードを読み取ってください</ThemedText>
              </ThemedView>
            )}
          </ThemedView>
          <ThemedView style={styles.buttonContainer}>
            <ThemedView style={[styles.button, styles.primaryButton]}>
              <ThemedText 
                style={styles.buttonText}
                onPress={simulateQRScan}
              >
                QRコード読み取り
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* 人数選択セクション */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            2. 人数を選択
          </ThemedText>
          <ThemedView style={styles.guestContainer}>
            <ThemedView style={[styles.button, styles.counterButton]}>
              <ThemedText 
                style={styles.counterButtonText}
                onPress={decrementGuests}
              >
                −
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.guestDisplay}>
              <ThemedText style={styles.guestCount}>{guestCount}</ThemedText>
              <ThemedText style={styles.guestLabel}>名様</ThemedText>
            </ThemedView>
            <ThemedView style={[styles.button, styles.counterButton]}>
              <ThemedText 
                style={styles.counterButtonText}
                onPress={incrementGuests}
              >
                ＋
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* 注文開始ボタン */}
        <ThemedView style={styles.section}>
          <ThemedView style={[styles.button, styles.startButton, !tableNumber && styles.disabledButton]}>
            <ThemedText 
              style={[styles.startButtonText, !tableNumber && styles.disabledButtonText]}
              onPress={startOrder}
            >
              注文開始
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* デモ用の説明 */}
        <ThemedView style={styles.demoInfo}>
          <ThemedText style={styles.demoTitle}>📝 デモ用操作手順:</ThemedText>
          <ThemedText style={styles.demoText}>
            1. 「QRコード読み取り」ボタンを押してテーブル番号を取得{'\n'}
            2. 人数を選択（±ボタンで調整）{'\n'}
            3. 「注文開始」ボタンを押してカテゴリ画面へ
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
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#dc2626',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#fecaca',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#374151',
  },
  qrContainer: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 15,
  },
  qrPlaceholder: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  qrIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  qrText: {
    fontSize: 16,
    color: '#6b7280',
  },
  tableInfo: {
    alignItems: 'center',
  },
  tableNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  checkmark: {
    fontSize: 16,
    color: '#059669',
    marginTop: 5,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  counterButton: {
    backgroundColor: '#6b7280',
    borderRadius: 25,
    width: 50,
    height: 50,
  },
  counterButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  guestDisplay: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    minWidth: 100,
  },
  guestCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  guestLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  startButton: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
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
  demoInfo: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
});
