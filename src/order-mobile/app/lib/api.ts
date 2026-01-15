const DEFAULT_API_BASE_URL = 'http://localhost:8000/api';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
const ORDER_API_KEY = process.env.EXPO_PUBLIC_ORDER_API_KEY ?? '';
const ORDER_API_KEY_HEADER = 'X-API-KEY';

export interface SubmitOrderPayload {
  seatId: number;
  productId: number;
  quantity: number;
}

export async function submitOrderItem(payload: SubmitOrderPayload) {
  if (!ORDER_API_KEY) {
    throw new Error('注文APIキーが設定されていません。EXPO_PUBLIC_ORDER_API_KEY を確認してください。');
  }

  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      [ORDER_API_KEY_HEADER]: ORDER_API_KEY,
    },
    body: JSON.stringify({
      seat_id: payload.seatId,
      product_id: payload.productId,
      quantity: payload.quantity,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.message ??
      (response.status === 401 ? 'APIキーが無効です。' : '注文の送信に失敗しました。');

    throw new Error(message);
  }

  return data?.data;
}
