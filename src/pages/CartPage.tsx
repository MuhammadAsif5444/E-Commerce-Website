import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Bookmark,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
  Check,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { useNotification } from '../context/NotificationContext';
import { formatCurrency } from '../utils/formatters';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    savedItems,
    updateQuantity,
    removeFromCart,
    saveForLater,
    moveToCartFromSaved,
    removeFromSaved,
    subtotal,
    shipping,
    tax,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { coupons } = useProducts();
  const { showToast } = useNotification();

  const [couponCode, setCouponCode] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const success = applyCoupon(couponCode.trim());
    if (success) {
      showToast(`Coupon ${couponCode.toUpperCase()} applied successfully!`, 'success');
      setCouponCode('');
    } else {
      showToast('Invalid coupon code or minimum order requirement not met.', 'error');
    }
  };

  // Free shipping threshold calculation ($75)
  const freeShippingThreshold = 75;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  if (items.length === 0 && savedItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <div className="w-20 h-20 rounded-3xl bg-orange-100 dark:bg-orange-950/60 text-orange-500 flex items-center justify-center mb-5">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-heading mb-2">Your Cart is Empty</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6">
          Looks like you haven&apos;t added any items to your cart yet. Explore our departments and daily deals to find what you love!
        </p>
        <Link
          to="/products"
          className="px-7 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition-transform hover:scale-105"
        >
          Explore Trending Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-black font-heading mb-8">
          Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
        </h1>

        {/* Free shipping banner meter */}
        <div className="mb-8 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Truck className="w-4 h-4 text-orange-500" />
              {amountNeededForFreeShipping === 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  Congratulations! You unlocked Free Express Shipping!
                </span>
              ) : (
                <span>
                  Add <strong className="text-orange-500">{formatCurrency(amountNeededForFreeShipping)}</strong> more to get Free Express Shipping
                </span>
              )}
            </span>
            <span className="text-slate-400 font-mono">{Math.round(freeShippingProgress)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                amountNeededForFreeShipping === 0 ? 'bg-emerald-500' : 'bg-orange-500'
              }`}
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items Col (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {items.length > 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
                {items.map(item => (
                  <div key={item.product.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start">
                    {/* Item Image */}
                    <Link
                      to={`/products/${item.product.id}`}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200/50 dark:border-slate-700/50"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            {item.product.brand}
                          </p>
                          <Link
                            to={`/products/${item.product.id}`}
                            className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 hover:text-orange-500 font-heading line-clamp-2"
                          >
                            {item.product.title}
                          </Link>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Sold by: {item.product.sellerName}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-base font-bold font-heading text-slate-900 dark:text-slate-100">
                            {formatCurrency(item.product.price * item.quantity)}
                          </span>
                          {item.quantity > 1 && (
                            <p className="text-[11px] text-slate-400">
                              {formatCurrency(item.product.price)} each
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Selected Variants */}
                      {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(item.selectedVariants).map(([k, v]) => (
                            <span
                              key={k}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                            >
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions: Stepper, Save for Later, Remove */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                        {/* Stepper */}
                        <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="px-2.5 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-xs font-bold text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="px-2.5 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* Save for later & Delete */}
                        <div className="flex items-center gap-4 text-xs font-semibold">
                          <button
                            onClick={() => saveForLater(item.product.id)}
                            className="flex items-center gap-1 text-slate-500 hover:text-orange-500 transition-colors cursor-pointer"
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>Save for later</span>
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="flex items-center gap-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-500">No active items in cart.</p>
              </div>
            )}

            {/* Saved for Later Section */}
            {savedItems.length > 0 && (
              <div className="mt-10">
                <h3 className="text-lg font-bold font-heading mb-4 flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-orange-500" />
                  Saved for Later ({savedItems.length})
                </h3>
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-xs">
                  {savedItems.map(item => (
                    <div
                      key={item.product.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          className="w-16 h-16 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                            {item.product.title}
                          </p>
                          <p className="text-xs font-bold text-orange-500 mt-0.5">
                            {formatCurrency(item.product.price)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <button
                          onClick={() => moveToCartFromSaved(item)}
                          className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Move to Cart
                        </button>
                        <button
                          onClick={() => removeFromSaved(item.product.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 cursor-pointer"
                          aria-label="Remove saved item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm sticky top-28 space-y-6">
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-slate-100 pb-4 border-b border-slate-100 dark:border-slate-800">
                Order Summary
              </h3>

              {/* Coupon input */}
              <div>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code (e.g. SAVE10)"
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-orange-500 dark:hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>

                {appliedCoupon && (
                  <div className="mt-2.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      {appliedCoupon.code} applied (-{appliedCoupon.discountValue}%)
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Coupon Discount</span>
                    <span>
                      -{formatCurrency((subtotal * appliedCoupon.discountValue) / 100)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {shipping === 0 ? (
                      <span className="text-emerald-600 font-bold uppercase">Free</span>
                    ) : (
                      formatCurrency(shipping)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(tax)}
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
                    Order Total
                  </span>
                  <span className="text-2xl font-black text-orange-500 font-heading">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => navigate('/checkout')}
                disabled={items.length === 0}
                className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-transform hover:scale-[1.02] shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>256-bit SSL encrypted checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
