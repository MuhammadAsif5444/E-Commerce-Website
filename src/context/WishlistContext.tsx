import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { useNotification } from './NotificationContext';
import { useProducts } from './ProductContext';

interface WishlistContextType {
  wishlistIds: string[];
  wishlistProducts: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useNotification();
  const { products } = useProducts();

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('shopnest_wishlist');
      return saved ? JSON.parse(saved) : ['prod-el-1', 'prod-fa-1'];
    } catch {
      return ['prod-el-1', 'prod-fa-1'];
    }
  });

  useEffect(() => {
    localStorage.setItem('shopnest_wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      setWishlistIds(prev => prev.filter(id => id !== product.id));
      showToast(`Removed "${product.title}" from your wishlist.`, 'info');
    } else {
      setWishlistIds(prev => [...prev, product.id]);
      showToast(`Added "${product.title}" to your wishlist.`, 'success');
    }
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistIds(prev => prev.filter(id => id !== productId));
    showToast('Removed from wishlist.', 'info');
  };

  const clearWishlist = () => {
    setWishlistIds([]);
  };

  const wishlistProducts = products.filter(p => wishlistIds.includes(p.id));

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistProducts,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
