import { create } from 'zustand';

export interface CheckoutItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

interface CheckoutState {
  items: CheckoutItem[];
  addressId: number | null;
  setItems: (items: CheckoutItem[]) => void;
  setAddressId: (addressId: number) => void;
  updateQuantity: (productId: number, delta: number) => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  items: [],
  addressId: null,
  setItems: (items) => set({ items, addressId: null }),
  setAddressId: (addressId) => set({ addressId }),
  updateQuantity: (productId, delta) =>
    set((state) => ({
      items: state.items
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    })),
}));
