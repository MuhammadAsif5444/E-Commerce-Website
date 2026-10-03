import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  SlidersHorizontal,
  Grid,
  List,
  RotateCcw,
  Star,
  ChevronDown,
  X,
  Search,
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { ProductCard } from '../components/common/ProductCard';
import { Rating } from '../components/common/Rating';
import { formatCurrency } from '../utils/formatters';
import { Product } from '../types';

export const ProductListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, categories } = useProducts();

  // Read URL parameters
  const initialCategory = searchParams.get('category') || 'all';
  const initialQuery = searchParams.get('q') || '';
  const initialDeal = searchParams.get('deal') === 'true';

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [dealsOnly, setDealsOnly] = useState<boolean>(initialDeal);
  const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest'>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const ITEMS_PER_PAGE = 12;

  // Sync state if URL query changes
  useEffect(() => {
    const cat = searchParams.get('category') || 'all';
    const q = searchParams.get('q') || '';
    const deal = searchParams.get('deal') === 'true';
    setSelectedCategory(cat);
    setSearchQuery(q);
    setDealsOnly(deal);
    setCurrentPage(1);
  }, [searchParams]);

  // Extract unique brands
  const allBrands = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => set.add(p.brand));
    return Array.from(set).sort();
  }, [products]);

  // Handle brand toggle
  const toggleBrand = (brand: string) => {
    setCurrentPage(1);
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setMaxPrice(2000);
    setMinRating(0);
    setSelectedBrands([]);
    setInStockOnly(false);
    setDealsOnly(false);
    setSortBy('relevance');
    setCurrentPage(1);
    setSearchParams({});
  };

  // Filter logic
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          product.title.toLowerCase().includes(q) ||
          product.brand.toLowerCase().includes(q) ||
          product.tags.some(t => t.toLowerCase().includes(q));
        if (!matches) return false;
      }
      // Price filter
      if (product.price > maxPrice) {
        return false;
      }
      // Rating filter
      if (minRating > 0 && product.rating < minRating) {
        return false;
      }
      // Brands filter
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
        return false;
      }
      // Stock filter
      if (inStockOnly && product.stock === 0) {
        return false;
      }
      // Deals filter
      if (dealsOnly && !product.isDeal) {
        return false;
      }
      return true;
    });
  }, [
    products,
    selectedCategory,
    searchQuery,
    maxPrice,
    minRating,
    selectedBrands,
    inStockOnly,
    dealsOnly,
  ]);

  // Sort logic
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case 'price-low':
        return list.sort((a, b) => a.price - b.price);
      case 'price-high':
        return list.sort((a, b) => b.price - a.price);
      case 'rating':
        return list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      case 'newest':
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'relevance':
      default:
        // Featured / best seller weight
        return list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    }
  }, [filteredProducts, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0) +
    (maxPrice < 2000 ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    selectedBrands.length +
    (inStockOnly ? 1 : 0) +
    (dealsOnly ? 1 : 0);

  const FilterSidebarContent = (
    <div className="space-y-6 text-sm">
      {/* Active filters heading */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 font-bold font-heading text-slate-900 dark:text-slate-100">
          <Filter className="w-4 h-4 text-orange-500" />
          <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Departments */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
          Department
        </h4>
        <div className="space-y-1.5">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setCurrentPage(1);
            }}
            className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Departments
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.slug);
                setCurrentPage(1);
              }}
              className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                selectedCategory === cat.slug
                  ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Price Range
          </h4>
          <span className="text-xs font-bold text-orange-500">
            Up to {formatCurrency(maxPrice)}
          </span>
        </div>
        <input
          type="range"
          min="20"
          max="2000"
          step="10"
          value={maxPrice}
          onChange={e => {
            setMaxPrice(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="w-full accent-orange-500 cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-slate-400 mt-1">
          <span>$20</span>
          <span>$2,000</span>
        </div>
      </div>

      {/* Availability & Deals toggles */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
          Special Options
        </h4>
        <div className="space-y-2.5">
          <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dealsOnly}
              onChange={e => {
                setDealsOnly(e.target.checked);
                setCurrentPage(1);
              }}
              className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 cursor-pointer"
            />
            <span>Today&apos;s Flash Deals Only</span>
          </label>
          <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={e => {
                setInStockOnly(e.target.checked);
                setCurrentPage(1);
              }}
              className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 cursor-pointer"
            />
            <span>In Stock Only</span>
          </label>
        </div>
      </div>

      {/* Customer Rating Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
          Customer Review
        </h4>
        <div className="space-y-1.5">
          {[4, 3, 2, 1].map(stars => (
            <button
              key={stars}
              onClick={() => {
                setMinRating(minRating === stars ? 0 : stars);
                setCurrentPage(1);
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                minRating === stars
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Rating value={stars} size="sm" />
              <span>& Up</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brand Checkboxes */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
          Brand
        </h4>
        <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
          {allBrands.map(brand => (
            <label
              key={brand}
              className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 cursor-pointer"
              />
              <span className="truncate">{brand}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Heading Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-slate-100">
              {selectedCategory === 'all'
                ? 'All Products'
                : categories.find(c => c.slug === selectedCategory)?.name || 'Products'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Showing {sortedProducts.length} results
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>

          {/* Controls: Sort & Grid View Toggle */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Mobile Filter Trigger */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-orange-500" />
              <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 rounded-xl shadow-xs">
              <span className="text-slate-400 hidden sm:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="relevance">Featured & Relevant</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Customer Rating</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-1 shadow-xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                aria-label="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 py-4">
            <span className="text-xs font-semibold text-slate-400">Active Filters:</span>
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-xs px-2.5 py-1 rounded-full font-medium">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('all')} className="cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs px-2.5 py-1 rounded-full font-medium">
                &ldquo;{searchQuery}&rdquo;
                <button onClick={() => setSearchQuery('')} className="cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {dealsOnly && (
              <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs px-2.5 py-1 rounded-full font-medium">
                Deals Only
                <button onClick={() => setDealsOnly(false)} className="cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {minRating > 0 && (
              <span className="inline-flex items-center gap-1 bg-yellow-100 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300 text-xs px-2.5 py-1 rounded-full font-medium">
                {minRating}+ Stars
                <button onClick={() => setMinRating(0)} className="cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedBrands.map(b => (
              <span
                key={b}
                className="inline-flex items-center gap-1 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs px-2.5 py-1 rounded-full font-medium"
              >
                {b}
                <button onClick={() => toggleBrand(b)} className="cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-rose-500 hover:underline cursor-pointer ml-1"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
          {/* Desktop Left Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-28">
              {FilterSidebarContent}
            </div>
          </div>

          {/* Products Grid / List */}
          <div className="lg:col-span-3">
            {paginatedProducts.length > 0 ? (
              <>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }
                >
                  {paginatedProducts.map(product => (
                    <ProductCard key={product.id} product={product} viewMode={viewMode} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 disabled:opacity-40 cursor-pointer shadow-xs"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            currentPage === pageNum
                              ? 'bg-orange-500 text-white shadow-sm'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 disabled:opacity-40 cursor-pointer shadow-xs"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-500 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold font-heading mb-1 text-slate-900 dark:text-slate-100">
                  No matching items found
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                  We couldn&apos;t find any products matching your active filters or query. Try adjusting price limits or clearing keyword filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Slide-over modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs h-full bg-white dark:bg-slate-900 p-6 overflow-y-auto shadow-2xl z-10 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
              <h3 className="text-base font-bold font-heading">Filter Catalog</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {FilterSidebarContent}
            <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold text-xs shadow-md"
              >
                Show {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
