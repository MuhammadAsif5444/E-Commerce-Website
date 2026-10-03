import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Check, Zap } from 'lucide-react';
import { Product } from '../../types';
import { Rating } from './Rating';
import { Badge } from './Badge';
import { formatCurrency } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
  const { addToCart, items } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const inWishlist = isInWishlist(product.id);
  const inCart = items.some(i => i.product.id === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  if (viewMode === 'list') {
    return (
      <div className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-5 hover:shadow-lg transition-all duration-300">
        {/* Image */}
        <Link
          to={`/products/${product.id}`}
          className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center"
        >
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {product.discountPercentage && (
            <div className="absolute top-2 left-2">
              <Badge variant="accent" size="sm">
                -{product.discountPercentage}% OFF
              </Badge>
            </div>
          )}
          {product.isDeal && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="warning" size="sm" className="font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                DEAL
              </Badge>
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-medium uppercase tracking-wider">{product.brand}</span>
              <span className="text-slate-400 dark:text-slate-500">Sold by {product.sellerName}</span>
            </div>

            <Link to={`/products/${product.id}`}>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-orange-500 transition-colors line-clamp-2 mb-2 font-heading">
                {product.title}
              </h3>
            </Link>

            <div className="flex items-center gap-2 mb-2.5">
              <Rating value={product.rating} size="sm" showCount count={product.reviewCount} />
              {product.stock <= 5 && product.stock > 0 && (
                <span className="text-[11px] text-rose-500 font-semibold">
                  Only {product.stock} left in stock!
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
              {product.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100 font-heading">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleWishlist}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  inWishlist
                    ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-orange-500 dark:hover:bg-orange-600 transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {inCart ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>In Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>{product.stock === 0 ? 'Sold Out' : 'Add to Cart'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
      {/* Top badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 pointer-events-none">
        {product.discountPercentage && (
          <Badge variant="accent" size="sm" className="font-bold shadow-xs">
            -{product.discountPercentage}%
          </Badge>
        )}
        {product.isDeal && (
          <Badge variant="warning" size="sm" className="font-bold flex items-center gap-1 shadow-xs">
            <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
            DEAL
          </Badge>
        )}
        {product.isBestSeller && (
          <Badge variant="primary" size="sm" className="shadow-xs">
            Best Seller
          </Badge>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleToggleWishlist}
        className={`absolute top-2.5 right-2.5 z-10 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md shadow-sm transition-all duration-200 cursor-pointer ${
          inWishlist
            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400'
            : 'bg-white/90 dark:bg-slate-800/90 text-slate-500 hover:text-rose-600 hover:scale-110'
        }`}
        aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
      </button>

      {/* Product Image */}
      <Link
        to={`/products/${product.id}`}
        className="relative block w-full aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden"
      >
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="text-white font-bold text-xs uppercase tracking-widest px-3 py-1.5 rounded-full bg-slate-900/90">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">{product.brand}</span>
            {product.variants && (
              <span className="text-slate-400 dark:text-slate-500">
                {product.variants.length} options
              </span>
            )}
          </div>

          <Link to={`/products/${product.id}`}>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-orange-500 transition-colors line-clamp-2 leading-snug mb-1.5 font-heading">
              {product.title}
            </h3>
          </Link>

          <div className="mb-2">
            <Rating value={product.rating} size="sm" showCount count={product.reviewCount} />
          </div>
        </div>

        {/* Pricing and Action */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-2">
          <div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
              {formatCurrency(product.price)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-[11px] text-slate-400 line-through">
                {formatCurrency(product.originalPrice)}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-orange-500 dark:hover:bg-orange-600 transition-all hover:scale-105 active:scale-95 shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title={inCart ? 'Add another to cart' : 'Add to cart'}
            aria-label={`Add ${product.title} to cart`}
          >
            {inCart ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
