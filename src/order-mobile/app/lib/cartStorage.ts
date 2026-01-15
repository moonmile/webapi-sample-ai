import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StoredCartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const CART_STORAGE_KEY = 'order_mobile_cart_items';

export async function loadCartFromStorage(): Promise<StoredCartItem[]> {
  try {
    const raw = await AsyncStorage.getItem(CART_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredCartItem[]) : [];
  } catch (error) {
    console.error('Failed to load cart data', error);
    return [];
  }
}

export async function saveCartToStorage(cart: StoredCartItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Failed to save cart data', error);
    throw error;
  }
}

export async function clearCartStorage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear cart data', error);
  }
}
