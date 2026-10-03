import { Product } from '../types';

const VIEW_HISTORY_KEY = 'shopnest_view_history';

export function recordProductView(productId: string): void {
  try {
    const raw = localStorage.getItem(VIEW_HISTORY_KEY);
    const history: string[] = raw ? JSON.parse(raw) : [];
    const updated = [productId, ...history.filter(id => id !== productId)].slice(0, 15);
    localStorage.setItem(VIEW_HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to record product view', err);
  }
}

export const trackProductView = recordProductView;

export function getViewHistory(): string[] {
  try {
    const raw = localStorage.getItem(VIEW_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getSmartRecommendations(allProducts: Product[], currentProductId?: string, limit = 8): Product[] {
  const viewedIds = getViewHistory();
  const viewedProducts = allProducts.filter(p => viewedIds.includes(p.id));

  // Build target categories and tags
  const categoryFreq: Record<string, number> = {};
  const tagFreq: Record<string, number> = {};

  if (viewedProducts.length > 0) {
    viewedProducts.forEach((p, index) => {
      const recencyWeight = (viewedProducts.length - index);
      categoryFreq[p.category] = (categoryFreq[p.category] || 0) + recencyWeight * 2;
      p.tags.forEach(t => {
        tagFreq[t] = (tagFreq[t] || 0) + recencyWeight;
      });
    });
  }

  // If current product provided, give it highest priority
  if (currentProductId) {
    const current = allProducts.find(p => p.id === currentProductId);
    if (current) {
      categoryFreq[current.category] = (categoryFreq[current.category] || 0) + 15;
      current.tags.forEach(t => {
        tagFreq[t] = (tagFreq[t] || 0) + 10;
      });
    }
  }

  const scored = allProducts
    .filter(p => p.id !== currentProductId)
    .map(product => {
      let score = product.rating * 1.5;
      if (product.isBestSeller) score += 4;
      if (product.isDeal) score += 3;

      // Category match
      if (categoryFreq[product.category]) {
        score += categoryFreq[product.category] * 2.5;
      }

      // Tag overlap
      product.tags.forEach(tag => {
        if (tagFreq[tag]) {
          score += tagFreq[tag] * 2;
        }
      });

      return { product, score };
    });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(s => s.product);
}

export function getRelatedProducts(allProducts: Product[], product: Product, limit = 4): Product[] {
  return allProducts
    .filter(p => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
    .slice(0, limit);
}

export function getCustomersAlsoBought(allProducts: Product[], product: Product, limit = 4): Product[] {
  // Products that complement across categories or in related spaces
  return allProducts
    .filter(p => p.id !== product.id && p.rating >= 4.7)
    .slice(0, limit);
}
