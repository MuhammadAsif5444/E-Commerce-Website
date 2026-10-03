import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, Banner, Coupon, Review } from '../types';
import { INITIAL_PRODUCTS, CATEGORIES, BANNERS, COUPONS } from '../data/mockData';
import { INITIAL_REVIEWS } from '../data/mockReviews';
import { useNotification } from './NotificationContext';
import { analyzeReviewSentiment } from '../utils/sentiment';

interface ProductContextType {
  products: Product[];
  categories: Category[];
  banners: Banner[];
  coupons: Coupon[];
  reviews: Record<string, Review[]>;
  addProduct: (p: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => Product;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addReview: (productId: string, rev: Omit<Review, 'id' | 'date' | 'helpfulCount' | 'sentiment'>) => Review;
  voteReviewHelpful: (productId: string, reviewId: string) => void;
  addCategory: (cat: Omit<Category, 'id' | 'itemCount'>) => void;
  addCoupon: (coup: Omit<Coupon, 'id' | 'usageCount'>) => void;
  toggleCouponActive: (couponId: string) => void;
  deleteCoupon: (couponId: string) => void;
  addBanner: (banner: Omit<Banner, 'id'>) => void;
  deleteBanner: (bannerId: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useNotification();

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('shopnest_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('shopnest_categories');
      return saved ? JSON.parse(saved) : CATEGORIES;
    } catch {
      return CATEGORIES;
    }
  });

  const [banners, setBanners] = useState<Banner[]>(() => {
    try {
      const saved = localStorage.getItem('shopnest_banners');
      return saved ? JSON.parse(saved) : BANNERS;
    } catch {
      return BANNERS;
    }
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('shopnest_coupons');
      return saved ? JSON.parse(saved) : COUPONS;
    } catch {
      return COUPONS;
    }
  });

  const [reviews, setReviews] = useState<Record<string, Review[]>>(() => {
    try {
      const saved = localStorage.getItem('shopnest_reviews');
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  useEffect(() => {
    localStorage.setItem('shopnest_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('shopnest_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('shopnest_banners', JSON.stringify(banners));
  }, [banners]);

  useEffect(() => {
    localStorage.setItem('shopnest_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('shopnest_reviews', JSON.stringify(reviews));
  }, [reviews]);

  const addProduct = (pData: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>): Product => {
    const newProduct: Product = {
      ...pData,
      id: `prod-${Date.now()}`,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProducts(prev => [newProduct, ...prev]);
    showToast(`Product "${newProduct.title}" created successfully!`, 'success');
    return newProduct;
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updated } : p))
    );
    showToast('Product updated successfully.', 'success');
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('Product deleted from inventory.', 'info');
  };

  const addReview = (productId: string, revData: Omit<Review, 'id' | 'date' | 'helpfulCount' | 'sentiment'>): Review => {
    const sentiment = analyzeReviewSentiment(revData.rating, revData.title, revData.comment);
    const newReview: Review = {
      ...revData,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      helpfulCount: 0,
      sentiment: sentiment.type,
    };

    setReviews(prev => {
      const currentList = prev[productId] || [];
      return {
        ...prev,
        [productId]: [newReview, ...currentList],
      };
    });

    // Update product rating and reviewCount
    setProducts(prev =>
      prev.map(p => {
        if (p.id !== productId) return p;
        const newCount = p.reviewCount + 1;
        const newRating = Number(((p.rating * p.reviewCount + revData.rating) / newCount).toFixed(1));
        return {
          ...p,
          reviewCount: newCount,
          rating: newRating,
        };
      })
    );

    showToast('Thank you! Your verified review has been published.', 'success');
    return newReview;
  };

  const voteReviewHelpful = (productId: string, reviewId: string) => {
    setReviews(prev => {
      const currentList = prev[productId] || [];
      return {
        ...prev,
        [productId]: currentList.map(r =>
          r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
        ),
      };
    });
    showToast('Marked as helpful.', 'info');
  };

  const addCategory = (cat: Omit<Category, 'id' | 'itemCount'>) => {
    const newCat: Category = {
      ...cat,
      id: cat.slug || `cat-${Date.now()}`,
      itemCount: 0,
    };
    setCategories(prev => [...prev, newCat]);
    showToast(`Category "${newCat.name}" added.`, 'success');
  };

  const addCoupon = (coup: Omit<Coupon, 'id' | 'usageCount'>) => {
    const newCoup: Coupon = {
      ...coup,
      id: `c-${Date.now()}`,
      usageCount: 0,
    };
    setCoupons(prev => [newCoup, ...prev]);
    showToast(`Coupon code ${newCoup.code} created.`, 'success');
  };

  const toggleCouponActive = (couponId: string) => {
    setCoupons(prev =>
      prev.map(c => (c.id === couponId ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const deleteCoupon = (couponId: string) => {
    setCoupons(prev => prev.filter(c => c.id !== couponId));
    showToast('Coupon removed.', 'info');
  };

  const addBanner = (banner: Omit<Banner, 'id'>) => {
    const newBanner: Banner = {
      ...banner,
      id: `b-${Date.now()}`,
    };
    setBanners(prev => [...prev, newBanner]);
    showToast('Promotion banner published.', 'success');
  };

  const deleteBanner = (bannerId: string) => {
    setBanners(prev => prev.filter(b => b.id !== bannerId));
    showToast('Banner removed.', 'info');
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        banners,
        coupons,
        reviews,
        addProduct,
        updateProduct,
        deleteProduct,
        addReview,
        voteReviewHelpful,
        addCategory,
        addCoupon,
        toggleCouponActive,
        deleteCoupon,
        addBanner,
        deleteBanner,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProducts must be used within ProductProvider');
  return ctx;
}
