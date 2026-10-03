import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, SavedItem, Coupon } from '../types';
import { useNotification } from './NotificationContext';
import { useProducts } from './ProductContext';

interface CartContextType {
  items: CartItem[];
  savedItems: SavedItem[];
  appliedCoupon: Coupon | null;
  addToCart: (product: Product, quantity?: number, selectedVariants?: Record<string, string>) => void;
  updateQuantity: (productId: string, quantity: number, selectedVariants?: Record<string, string>) => void;
  removeFromCart: (productId: string, selectedVariants?: Record<string, string>) => void;
  saveForLater: (productId: string, selectedVariants?: Record<string, string>) => void;
  moveToCartFromSaved: (savedItem: SavedItem) => void;
  removeFromSaved: (productId: string) => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  clearCart: () => void;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useNotification();
  const { coupons } = useProducts();

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('shopnest_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    try {
      const saved = localStorage.getItem('shopnest_saved_for_later');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = localStorage.getItem('shopnest_applied_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('shopnest_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('shopnest_saved_for_later', JSON.stringify(savedItems));
  }, [savedItems]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('shopnest_applied_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('shopnest_applied_coupon');
    }
  }, [appliedCoupon]);

  const matchVariants = (a?: Record<string, string>, b?: Record<string, string>) => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every(k => a[k] === b[k]);
  };

  const addToCart = (product: Product, quantity = 1, selectedVariants?: Record<string, string>) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && matchVariants(item.selectedVariants, selectedVariants)
      );

      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = Math.min(product.stock, next[existingIndex].quantity + quantity);
        next[existingIndex] = { ...next[existingIndex], quantity: newQty };
        return next;
      } else {
        return [...prev, { product, quantity: Math.min(product.stock, quantity), selectedVariants }];
      }
    });

    showToast(`Added ${quantity}x "${product.title}" to cart.`, 'success');
  };

  const updateQuantity = (productId: string, quantity: number, selectedVariants?: Record<string, string>) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedVariants);
      return;
    }
    setItems(prev =>
      prev.map(item => {
        if (item.product.id === productId && matchVariants(item.selectedVariants, selectedVariants)) {
          return { ...item, quantity: Math.min(item.product.stock, quantity) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string, selectedVariants?: Record<string, string>) => {
    setItems(prev =>
      prev.filter(item => !(item.product.id === productId && matchVariants(item.selectedVariants, selectedVariants)))
    );
    showToast('Item removed from cart.', 'info');
  };

  const saveForLater = (productId: string, selectedVariants?: Record<string, string>) => {
    const item = items.find(
      i => i.product.id === productId && matchVariants(i.selectedVariants, selectedVariants)
    );
    if (!item) return;

    // Remove from cart
    setItems(prev =>
      prev.filter(i => !(i.product.id === productId && matchVariants(i.selectedVariants, selectedVariants)))
    );

    // Add to saved for later
    setSavedItems(prev => {
      const exists = prev.some(
        s => s.product.id === productId && matchVariants(s.selectedVariants, selectedVariants)
      );
      if (exists) return prev;
      return [
        ...prev,
        {
          product: item.product,
          savedAt: new Date().toISOString(),
          selectedVariants: item.selectedVariants,
        },
      ];
    });

    showToast(`Saved "${item.product.title}" for later.`, 'info');
  };

  const moveToCartFromSaved = (savedItem: SavedItem) => {
    setSavedItems(prev =>
      prev.filter(
        s => !(s.product.id === savedItem.product.id && matchVariants(s.selectedVariants, savedItem.selectedVariants))
      )
    );
    addToCart(savedItem.product, 1, savedItem.selectedVariants);
  };

  const removeFromSaved = (productId: string) => {
    setSavedItems(prev => prev.filter(s => s.product.id !== productId));
    showToast('Removed from saved items.', 'info');
  };

  const applyCoupon = (code: string) => {
    const normalized = code.trim().toUpperCase();
    const found = coupons.find(c => c.code === normalized && c.isActive);

    if (!found) {
      return { success: false, message: 'Invalid or expired coupon code. Try "SAVE10".' };
    }

    if (subtotal < found.minSpend) {
      return {
        success: false,
        message: `Order must be at least $${found.minSpend} to use coupon ${found.code}.`,
      };
    }

    setAppliedCoupon(found);
    showToast(`Coupon ${found.code} applied!`, 'success');
    return { success: true, message: 'Coupon applied successfully.' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed.', 'info');
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  let discount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minSpend) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = (subtotal * appliedCoupon.discountValue) / 100;
    } else {
      discount = appliedCoupon.discountValue;
    }
  }

  // Free shipping over $75
  const shipping = subtotal > 75 || items.length === 0 ? 0 : 7.99;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Number((taxableAmount * 0.0825).toFixed(2)); // 8.25% standard tax
  const total = Number(Math.max(0, taxableAmount + shipping + tax).toFixed(2));
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        savedItems,
        appliedCoupon,
        addToCart,
        updateQuantity,
        removeFromCart,
        saveForLater,
        moveToCartFromSaved,
        removeFromSaved,
        applyCoupon,
        removeCoupon,
        clearCart,
        subtotal,
        discount,
        shipping,
        tax,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
