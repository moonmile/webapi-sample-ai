import { describe, it, expect } from 'vitest';
import { getTotalPrice, CartItem } from './cartUtils';

const item = (price: number, quantity: number, id = 1): CartItem => ({
  id,
  name: 'テスト商品',
  price,
  quantity,
});

describe('getTotalPrice', () => {
  it('カートが空の場合は 0 を返す', () => {
    expect(getTotalPrice([])).toBe(0);
  });

  it('商品が 1 種類の場合は price × quantity を返す', () => {
    expect(getTotalPrice([item(500, 3)])).toBe(1500);
  });

  it('複数商品の合計金額を返す', () => {
    const cart = [item(580, 2, 1), item(480, 1, 2), item(380, 3, 3)];
    // 580*2 + 480*1 + 380*3 = 1160 + 480 + 1140 = 2780
    expect(getTotalPrice(cart)).toBe(2780);
  });

  it('数量が 1 の場合は単価をそのまま返す', () => {
    expect(getTotalPrice([item(980, 1)])).toBe(980);
  });

  it('price が 0 の場合は 0 を返す', () => {
    expect(getTotalPrice([item(0, 5)])).toBe(0);
  });

  it('quantity が 0 の場合はその商品を 0 として計算する', () => {
    const cart = [item(500, 0, 1), item(300, 2, 2)];
    expect(getTotalPrice(cart)).toBe(600);
  });

  it('元のカート配列を変更しない（副作用がない）', () => {
    const cart = [item(500, 2, 1), item(300, 3, 2)];
    const original = JSON.stringify(cart);
    getTotalPrice(cart);
    expect(JSON.stringify(cart)).toBe(original);
  });
});
