import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Tag,
  Star,
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { ProductCard } from '../components/common/ProductCard';
import { Badge } from '../components/common/Badge';
import { getSmartRecommendations } from '../utils/recommendation';
import { Product } from '../types';

export const HomePage: React.FC = () => {
  const { products, categories, banners } = useProducts();

  // Carousel state
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Live countdown timer for Today's Deals (14 hours, 32 mins, 45 secs from now)
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto advance banner
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const nextBanner = () => {
    setCurrentBannerIndex(prev => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBannerIndex(prev => (prev - 1 + banners.length) % banners.length);
  };

  // Product splits
  const deals = products.filter(p => p.isDeal).slice(0, 4);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);
  const newArrivals = products.filter(p => p.isNewArrival).slice(0, 4);
  const recommended = getSmartRecommendations(products, undefined, 4);

  const activeBanner = banners[currentBannerIndex] || banners[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-16">
      {/* 1. Hero Carousel */}
      <section className="relative bg-slate-900 overflow-hidden">
        <div className="relative min-h-[420px] sm:min-h-[500px] flex items-center">
          {/* Background Image with Gradient Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={activeBanner.imageUrl}
              alt={activeBanner.title}
              className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity scale-105 transition-all duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
          </div>

          {/* Banner Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 key={activeBanner.id}">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                {activeBanner.tag}
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4 font-heading">
                {activeBanner.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 mb-8 max-w-lg leading-relaxed">
                {activeBanner.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to={activeBanner.ctaLink}
                  className="px-7 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-orange-500/25 flex items-center gap-2 cursor-pointer hover:scale-105"
                >
                  <span>{activeBanner.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {activeBanner.badgeText && (
                  <span className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-slate-200 text-xs font-semibold">
                    {activeBanner.badgeText}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Carousel Arrows */}
          <button
            onClick={prevBanner}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextBanner}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
            aria-label="Next banner"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Carousel Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentBannerIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentBannerIndex === idx
                    ? 'w-8 bg-orange-500'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Shop by Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-heading">
                Shop by Department
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Explore thousands of curated essentials across verified independent vendors
              </p>
            </div>
            <Link
              to="/products"
              className="text-xs sm:text-sm font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View All Categories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {categories.map(category => (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
                className="group flex flex-col items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-orange-50 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 hover:border-orange-300 dark:hover:border-orange-500 transition-all duration-300 text-center"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden mb-2.5 bg-slate-200 dark:bg-slate-700 shadow-xs">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-orange-500 transition-colors line-clamp-1">
                  {category.name}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {category.itemCount.toLocaleString()}+ items
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Today's Deals Section (with live countdown timer) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-orange-500 text-xs font-bold uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4 fill-orange-500" />
              Limited Time Deals
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-heading">
              Today&apos;s Flash Deals
            </h2>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 px-4 py-2.5 rounded-2xl self-start md:self-auto">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-xs font-semibold text-amber-900 dark:text-amber-300">
              Deals refresh in:
            </span>
            <div className="flex items-center gap-1 font-mono font-black text-amber-700 dark:text-amber-300 text-sm">
              <span className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded shadow-xs">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded shadow-xs">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded shadow-xs text-orange-500">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {deals.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Special FYP Feature: AI-Style Content-Based Recommendations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Adaptive Recommendation Engine
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-heading text-white">
                Recommended For You
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Personalized selection based on your category browsing history & interest tags
              </p>
            </div>
            <Link
              to="/products"
              className="text-xs sm:text-sm font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 self-start sm:self-auto"
            >
              Explore More →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {recommended.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              Community Favorites
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-heading">
              Best Sellers
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1"
          >
            <span>See All Best Sellers</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. Promotional Mid-Page Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 p-8 sm:p-12 text-white border border-slate-800">
          <div className="max-w-xl">
            <Badge variant="accent" size="sm" className="mb-3">
              VENDOR SPOTLIGHT
            </Badge>
            <h3 className="text-2xl sm:text-4xl font-black font-heading mb-3 leading-tight">
              Start Selling to Millions on ShopNest
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
              Open your digital storefront, upload custom inventories, track orders in real-time, and leverage our integrated logistics network.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/seller"
                className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors shadow-md cursor-pointer"
              >
                Access Seller Hub
              </Link>
              <Link
                to="/admin"
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors border border-slate-700 cursor-pointer"
              >
                Explore Admin Console
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Just Landed
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-heading">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1"
          >
            <span>Browse New Drops</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};
