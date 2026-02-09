// Cart utility using localStorage for persistence.
// Since zustand isn't installed, we'll use localStorage + React context.

export interface CartItem {
  productId: string;
  productName: string;
  shopId: string;
  shopName: string;
  basePrice: number;
  quantity: number;
  customizations: {
    groupName: string;
    optionName: string;
    priceModifier: number;
  }[];
  notes: string;
  imageUrl?: string;
}

const CART_KEY = "uniprint_cart";

export function getCartItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCartItems(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(item: CartItem) {
  const items = getCartItems();
  // Check if same product with same customizations exists
  const existingIndex = items.findIndex(
    (i) =>
      i.productId === item.productId &&
      JSON.stringify(i.customizations) === JSON.stringify(item.customizations)
  );

  if (existingIndex >= 0) {
    items[existingIndex].quantity += item.quantity;
  } else {
    items.push(item);
  }
  saveCartItems(items);
}

export function removeFromCart(index: number) {
  const items = getCartItems();
  items.splice(index, 1);
  saveCartItems(items);
}

export function updateCartQuantity(index: number, quantity: number) {
  const items = getCartItems();
  if (items[index]) {
    items[index].quantity = Math.max(1, quantity);
  }
  saveCartItems(items);
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}

export function getCartItemTotal(item: CartItem): number {
  const customizationTotal = item.customizations.reduce((sum, c) => sum + c.priceModifier, 0);
  return (item.basePrice + customizationTotal) * item.quantity;
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + getCartItemTotal(item), 0);
}
