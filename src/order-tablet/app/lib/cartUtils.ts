export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export const getTotalPrice = (cart: CartItem[]): number =>
  cart.reduce((total, item) => total + item.price * item.quantity, 0);

export const getTotalItems = (cart: CartItem[]): number =>
  cart.reduce((total, item) => total + item.quantity, 0);
