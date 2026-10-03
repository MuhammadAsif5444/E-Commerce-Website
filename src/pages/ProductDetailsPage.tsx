import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Zap,
  Check,
  Truck,
  RotateCcw,
  ShieldCheck,
  Share2,
  ChevronRight,
  Sparkles,
  Store,
  Star,
  ThumbsUp,
  MessageSquare,
  Package,
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Rating } from '../components/common/Rating';
import { Badge } from '../components/common/Badge';
import { ProductCard } from '../components/common/ProductCard';
import { formatCurrency, formatDate } from '../utils/formatters';
import { trackProductView, getSmartRecommendations } from '../utils/recommendation';
import { analyzeSentiment } from '../utils/sentiment';
import { Product, ProductVariant, Review } from '../types';

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, reviews: allReviews, addReview } = useProducts();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { currentUser, isAuthenticated } = useAuth();
  const { showToast } = useNotification();

  const product = products.find(p => p.id === id);
  const reviews: Review[] = (id && allReviews && allReviews[id]) ? allReviews[id] : [];

  // Active state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');

  // New review form state
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Track view in recommendation engine & reset state on ID change
  useEffect(() => {
    if (product) {
      trackProductView(product.id);
      setSelectedImageIndex(0);
      setQuantity(1);
      // Initialize variant selections
      if (product.variants && product.variants.length > 0) {
        const initialVariants: Record<string, string> = {};
        product.variants.forEach((v: ProductVariant) => {
          initialVariants[v.name] = v.options[0];
        });
        setSelectedVariants(initialVariants);
      }
      window.scrollTo(0, 0);
    }
  }, [id, product]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-2xl font-bold font-heading mb-2">Product Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          The item you are looking for does not exist or has been removed from the catalog.
        </p>
        <Link
          to="/products"
          className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-xs shadow-md"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);

  // Variant selector helper
  const handleVariantSelect = (groupName: string, option: string) => {
    setSelectedVariants(prev => ({ ...prev, [groupName]: option }));
  };

  // Add to cart
  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariants);
  };

  // Buy now: add to cart & immediately redirect to checkout
  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariants);
    navigate('/checkout');
  };

  // Share product
  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Product link copied to clipboard!', 'info');
  };

  // Submit review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newComment.trim()) {
      showToast('Please provide both a title and review body.', 'error');
      return;
    }

    setIsSubmittingReview(true);
    setTimeout(() => {
      addReview(product.id, {
        userId: currentUser?.id || 'guest',
        userName: currentUser?.name || 'Verified Shopper',
        userAvatar: currentUser?.avatar,
        rating: newRating,
        title: newTitle,
        comment: newComment,
        verifiedPurchase: true,
      });

      setNewTitle('');
      setNewComment('');
      setNewRating(5);
      setIsSubmittingReview(false);
      showToast('Thank you! Your verified review has been published.', 'success');
      setActiveTab('reviews');
    }, 400);
  };

  // Related products via engine
  const relatedProducts = getSmartRecommendations(products, product?.id, 4);

  // Rating breakdown stats
  const ratingCounts = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter((r: Review) => Math.round(r.rating) === stars).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { stars, count, percentage };
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-slate-700 dark:hover:text-slate-200">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            to={`/products?category=${product.category}`}
            className="hover:text-slate-700 dark:hover:text-slate-200 capitalize"
          >
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700 dark:text-slate-300 font-semibold truncate max-w-xs">
            {product.title}
          </span>
        </nav>

        {/* Primary Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Gallery Col (5 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Main Stage Image */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center group">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />

              {product.discountPercentage && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge variant="accent" size="md" className="font-bold shadow-md">
                    -{product.discountPercentage}% OFF
                  </Badge>
                </div>
              )}

              {product.isDeal && (
                <div className="absolute bottom-4 left-4 z-10">
                  <Badge variant="warning" size="md" className="font-bold flex items-center gap-1 shadow-md">
                    <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    TODAY&apos;S DEAL
                  </Badge>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-18 h-18 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 transition-all cursor-pointer shrink-0 ${
                      selectedImageIndex === idx
                        ? 'border-orange-500 scale-105 shadow-sm'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Col (6 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Brand & Social Share */}
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  {product.brand}
                </span>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title="Share product link"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-heading leading-tight mb-3">
                {product.title}
              </h1>

              {/* Ratings and Reviews */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                <Rating value={product.rating} size="md" showCount count={product.reviewCount} />
                <span className="text-xs text-slate-400">•</span>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className="text-xs text-orange-600 dark:text-orange-400 hover:underline font-semibold cursor-pointer"
                >
                  {reviews.length} Verified Customer Reviews
                </button>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> In Stock
                </span>
              </div>

              {/* Pricing */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 font-heading">
                    {formatCurrency(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-base text-slate-400 line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  )}
                  {product.discountPercentage && (
                    <span className="text-xs font-bold text-rose-500">
                      Save {formatCurrency(product.originalPrice! - product.price)} ({product.discountPercentage}%)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Applicable taxes included at checkout. Free shipping on orders over $75.
                </p>
              </div>

              {/* Short summary */}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Interactive Variants (Size, Color, etc.) */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-4 mb-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {product.variants.map((variant: ProductVariant) => (
                    <div key={variant.name}>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                        {variant.name}:{' '}
                        <span className="text-orange-500 font-semibold">
                          {selectedVariants[variant.name]}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {variant.options.map((option: string) => (
                          <button
                            key={option}
                            onClick={() => handleVariantSelect(variant.name, option)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              selectedVariants[variant.name] === option
                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-300 shadow-xs'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity Stepper & Stock Check */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Quantity:</span>
                <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 text-xs font-bold min-w-[28px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                    className="px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    +
                  </button>
                </div>
                {product.stock <= 5 && (
                  <span className="text-xs text-rose-500 font-semibold animate-pulse">
                    Only {product.stock} items left!
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Buy Now</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3.5 rounded-2xl border transition-colors cursor-pointer shrink-0 ${
                    inWishlist
                      ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900'
                      : 'border-slate-300 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>

              {/* Seller Attribution Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 flex items-center justify-center font-bold">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Sold and shipped by</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {product.sellerName}
                    </p>
                  </div>
                </div>
                <Badge variant="primary" size="sm">
                  Verified Merchant
                </Badge>
              </div>
            </div>

            {/* Value Props Row */}
            <div className="grid grid-cols-3 gap-2 pt-6 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 text-center">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-orange-500" />
                <span>Fast Global Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-blue-500" />
                <span>30-Day Easy Returns</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Authenticity Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Content (Description, Specs, Reviews) */}
        <div className="mt-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm">
          <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 pb-4 overflow-x-auto whitespace-nowrap">
            <button
              onClick={() => setActiveTab('description')}
              className={`text-sm font-bold pb-2 transition-colors cursor-pointer relative ${
                activeTab === 'description'
                  ? 'text-orange-500'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Product Description
              {activeTab === 'description' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('specifications')}
              className={`text-sm font-bold pb-2 transition-colors cursor-pointer relative ${
                activeTab === 'specifications'
                  ? 'text-orange-500'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Technical Specifications
              {activeTab === 'specifications' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`text-sm font-bold pb-2 transition-colors cursor-pointer relative flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'text-orange-500'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Customer Reviews ({reviews.length})
              {activeTab === 'reviews' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
              )}
            </button>
          </div>

          {/* Tab 1: Description */}
          {activeTab === 'description' && (
            <div className="py-6 space-y-6 animate-in fade-in duration-200">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
                {product.description}
              </p>

              {product.features && product.features.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
                    Key Highlights & Features
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-w-3xl">
                    {product.features.map((feature: string, i: number) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300"
                      >
                        <Check className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Specifications */}
          {activeTab === 'specifications' && (
            <div className="py-6 animate-in fade-in duration-200">
              <div className="max-w-2xl divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="py-3 flex items-center justify-between">
                    <span className="font-semibold text-slate-500 dark:text-slate-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-100 text-right">
                      {String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Reviews with Sentiment Analysis */}
          {activeTab === 'reviews' && (
            <div className="py-6 space-y-10 animate-in fade-in duration-200">
              {/* Review Statistics Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-center">
                  <span className="text-5xl font-black font-heading text-slate-900 dark:text-slate-100">
                    {product.rating.toFixed(1)}
                  </span>
                  <div className="my-2">
                    <Rating value={product.rating} size="lg" />
                  </div>
                  <p className="text-xs text-slate-500">
                    Based on {product.reviewCount} customer reviews
                  </p>
                </div>

                <div className="md:col-span-8 flex flex-col justify-center space-y-2">
                  {ratingCounts.map(item => (
                    <div key={item.stars} className="flex items-center gap-3 text-xs">
                      <span className="w-12 text-slate-500 font-medium">{item.stars} stars</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-slate-400 font-mono">
                        {Math.round(item.percentage)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Write a Review Section */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h4 className="text-base font-bold font-heading mb-1 text-slate-900 dark:text-slate-100">
                  Write a Customer Review
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  Share your experience with this product to help others in the ShopNest community.
                </p>

                <form onSubmit={handleSubmitReview} className="space-y-4 max-w-2xl">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Your Overall Rating
                    </label>
                    <Rating value={newRating} interactive onChange={setNewRating} size="lg" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Review Headline
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      placeholder="e.g., Exceeded expectations, phenomenal build quality!"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Written Review Body
                    </label>
                    <textarea
                      rows={3}
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="What did you like or dislike? How was the performance?"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                      required
                    />

                    {/* Live Sentiment Preview */}
                    {newComment.trim().length > 5 && (
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className="text-slate-400">Review Sentiment:</span>
                        {(() => {
                          const s = analyzeSentiment(newRating, newTitle || 'Product Feedback', newComment);
                          return (
                            <Badge
                              variant={
                                s.type === 'positive'
                                  ? 'success'
                                  : s.type === 'negative'
                                  ? 'danger'
                                  : 'neutral'
                              }
                              size="sm"
                            >
                              {s.type.toUpperCase()} ({Math.round(s.score)}% confidence)
                            </Badge>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm cursor-pointer transition-colors"
                  >
                    {isSubmittingReview ? 'Publishing...' : 'Submit Review'}
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-6">
                {reviews.map((review: Review) => {
                  const sentimentData = analyzeSentiment(review.rating, review.title, review.comment);

                  return (
                    <div
                      key={review.id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {review.userAvatar ? (
                            <img
                              src={review.userAvatar}
                              alt={review.userName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs">
                              {review.userName[0]}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {review.userName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Reviewed on {formatDate(review.date)}
                            </p>
                          </div>
                        </div>

                        {/* Special Feature: Sentiment badge */}
                        <Badge
                          variant={
                            sentimentData.type === 'positive'
                              ? 'success'
                              : sentimentData.type === 'negative'
                              ? 'danger'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {sentimentData.type.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Rating value={review.rating} size="sm" />
                        {review.verifiedPurchase && (
                          <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">
                            Verified Purchase
                          </span>
                        )}
                      </div>

                      <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                        {review.title}
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                        {review.comment}
                      </p>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <button className="flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Helpful ({review.helpfulCount})</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Recommended Products Carousel / Grid */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-1.5 text-orange-500 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Adaptive Selection
              </div>
              <h3 className="text-2xl font-black font-heading text-slate-900 dark:text-slate-100">
                Customers Also Bought
              </h3>
            </div>
            <Link
              to="/products"
              className="text-xs font-bold text-orange-500 hover:text-orange-600"
            >
              View More →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
