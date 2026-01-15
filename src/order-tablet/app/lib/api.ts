'use client';

const DEFAULT_API_BASE_URL = 'http://localhost:8000/api';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
const API_ROOT_URL = API_BASE_URL.replace(/\/api\/?$/, '');
const ORDER_API_KEY = process.env.NEXT_PUBLIC_ORDER_API_KEY ?? '';
const ORDER_API_KEY_HEADER = 'X-API-KEY';
let csrfCookieFetched = false;

export interface OrderRequestPayload {
  seatId: number;
  productId: number;
  quantity: number;
}

export interface ReviewRequestPayload {
  rating: number;
  comment: string;
  productId?: number | null;
  orderId?: number | null;
  seatId?: number | null;
}

export async function submitOrderItem(payload: OrderRequestPayload) {
  if (!ORDER_API_KEY) {
    throw new Error('注文APIキーが設定されていません。環境変数 NEXT_PUBLIC_ORDER_API_KEY を確認してください。');
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
      (response.status === 401
        ? '注文APIキーが無効です。環境設定を確認してください。'
        : '注文の送信に失敗しました。');
    throw new Error(message);
  }

  return data?.data;
}

function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function ensureCsrfCookie(): Promise<void> {
  if (csrfCookieFetched) {
    return;
  }

  const response = await fetch(`${API_ROOT_URL}/sanctum/csrf-cookie`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('CSRFトークンの取得に失敗しました。時間をおいて再度お試しください。');
  }

  csrfCookieFetched = true;
}

export async function submitReview(payload: ReviewRequestPayload) {
  await ensureCsrfCookie();

  const csrfToken = getCsrfTokenFromCookie();

  if (!csrfToken) {
    throw new Error('CSRFトークンが見つかりません。ブラウザを再読み込みしてください。');
  }

  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-XSRF-TOKEN': csrfToken,
    },
    body: JSON.stringify({
      rating: payload.rating,
      comment: payload.comment,
      product_id: payload.productId ?? null,
      order_id: payload.orderId ?? null,
      seat_id: payload.seatId ?? null,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message ?? 'レビューの送信に失敗しました。';
    throw new Error(message);
  }

  return data?.data;
}
