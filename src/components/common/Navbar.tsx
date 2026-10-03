import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  Store,
  ShieldCheck,
  LogOut,
  Sparkles,
  PackageCheck,
  Layers,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { useProducts } from '../../context/ProductContext';
import { Product } from '../../types';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, loginAsDemo, isAuthenticated, isSeller, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { wishlistIds } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const { categories, products } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = products
      .filter(p => {
        const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
        const matchesQuery =
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q));
        return matchesCat && matchesQuery;
      })
      .slice(0, 6);

    setSuggestions(filtered);
    setShowSuggestions(true);
  }, [searchQuery, selectedCategory, products]);

  // Close mobile menu on route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowSuggestions(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (!searchQuery.trim() && selectedCategory === 'all') {
      navigate('/products');
    } else {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      navigate(`/products?${params.toString()}`);
    }
  };

  const handleSelectSuggestion = (productId: string) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/products/${productId}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800 transition-colors">
      {/* Top micro-bar for quick announcements & role switcher */}
      <div className="bg-slate-950/80 px-4 py-1 text-xs border-b border-slate-800/60 hidden sm:flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            Special: Free express delivery on orders over $75 with code <strong className="text-orange-400">SAVE10</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400">Demo Role Switch:</span>
          <button
            onClick={() => loginAsDemo('customer')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
              currentUser?.role === 'customer'
                ? 'bg-orange-500 text-white'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            Customer
          </button>
          <button
            onClick={() => loginAsDemo('seller')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
              currentUser?.role === 'seller'
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            Seller
          </button>
          <button
            onClick={() => loginAsDemo('admin')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
              currentUser?.role === 'admin'
                ? 'bg-purple-600 text-white'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            Admin
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white font-heading leading-none">
                My<span className="text-orange-400">Website</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold mt-0.5">
                Multi-Vendor
              </span>
            </div>
          </Link>

          {/* Search Bar with Category Dropdown */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-2xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="flex rounded-xl overflow-hidden shadow-inner bg-white dark:bg-slate-800 border border-slate-700/80 focus-within:border-orange-500 transition-colors">
              {/* Category dropdown */}
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-slate-100 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 text-xs font-semibold px-3 py-2.5 border-r border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer max-w-[140px] truncate"
                aria-label="Filter category"
              >
                <option value="all">All Departments</option>
                {categories.map(c => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Text input */}
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                placeholder="Search headphones, raw denim, coffee, desk lamps..."
                className="flex-1 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 bg-transparent focus:outline-none"
              />

              {/* Submit button */}
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 px-5 flex items-center justify-center text-white transition-colors cursor-pointer"
                aria-label="Submit search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Autocomplete Suggestions Popup */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                  Matching Products & Brands
                </div>
                <ul>
                  {suggestions.map(item => (
                    <li
                      key={item.id}
                      onClick={() => handleSelectSuggestion(item.id)}
                      className="px-4 py-2.5 flex items-center gap-3 hover:bg-orange-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-800/40 last:border-0"
                    >
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.brand} • <span className="font-bold text-orange-500">${item.price.toFixed(2)}</span>
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div
                  onClick={handleSearchSubmit}
                  className="bg-slate-50 dark:bg-slate-800/60 p-2 text-center text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer border-t border-slate-100 dark:border-slate-800"
                >
                  View all results for &ldquo;{searchQuery}&rdquo; →
                </div>
              </div>
            )}
          </div>

          {/* Right Navigation Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-slate-300 hover:text-white md:hidden cursor-pointer rounded-lg hover:bg-slate-800"
              aria-label="Toggle mobile search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-300" />
              )}
            </button>

            {/* Wishlist */}
            <Link
              to="/account?tab=wishlist"
              className="relative p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors hidden sm:flex items-center"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1"
              aria-label="Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-orange-500 text-white text-[11px] font-extrabold px-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center leading-none shadow-sm">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold hidden lg:inline ml-1">Cart</span>
            </Link>

            {/* Account Menu */}
            <div ref={accountMenuRef} className="relative">
              <button
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-700"
                aria-label="Account menu"
              >
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-orange-500/50"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                )}
                <div className="hidden lg:flex flex-col text-left leading-tight">
                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-[90px]">
                    {isAuthenticated ? `Hi, ${currentUser?.name.split(' ')[0]}` : 'Sign In'}
                  </span>
                  <span className="text-xs font-bold text-white flex items-center gap-0.5">
                    Account
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </span>
                </div>
              </button>

              {/* Dropdown Card */}
              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
                  {isAuthenticated ? (
                    <>
                      <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Signed in as
                        </p>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {currentUser?.name}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span
                            className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
                              isAdmin
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                                : isSeller
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                            }`}
                          >
                            {currentUser?.role}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate">
                            {currentUser?.email}
                          </span>
                        </div>
                      </div>

                      {/* Navigation links based on role */}
                      <div className="py-1">
                        <Link
                          to="/account"
                          onClick={() => setIsAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-500" />
                          My Profile & Addresses
                        </Link>
                        <Link
                          to="/account?tab=orders"
                          onClick={() => setIsAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <PackageCheck className="w-4 h-4 text-slate-500" />
                          Order History & Tracking
                        </Link>
                        <Link
                          to="/account?tab=wishlist"
                          onClick={() => setIsAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Heart className="w-4 h-4 text-slate-500" />
                          My Wishlist ({wishlistIds.length})
                        </Link>

                        {/* Seller Hub link */}
                        {(isSeller || isAdmin) && (
                          <Link
                            to="/seller"
                            onClick={() => setIsAccountMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                          >
                            <Store className="w-4 h-4" />
                            Seller Dashboard
                          </Link>
                        )}

                        {/* Admin link */}
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsAccountMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            Admin Console
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => {
                            setIsAccountMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-3">
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                        Sign in to track orders, manage your cart, or sell products.
                      </p>
                      <Link
                        to="/auth?mode=login"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="block w-full text-center py-2 px-3 text-xs font-bold rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-colors mb-2"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/auth?mode=register"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="block w-full text-center py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white md:hidden cursor-pointer rounded-lg hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Overlay Bar */}
        {isSearchOpen && (
          <div className="py-2.5 border-t border-slate-800 md:hidden animate-in slide-in-from-top duration-200">
            <form onSubmit={handleSearchSubmit} className="flex rounded-xl overflow-hidden bg-white dark:bg-slate-800">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search ShopNest products..."
                className="flex-1 px-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                className="bg-orange-500 px-4 text-white flex items-center justify-center cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Categories secondary navigation strip (Amazon style) */}
      <nav className="bg-slate-800/90 text-slate-200 text-xs font-medium border-t border-slate-700/60 overflow-x-auto scrollbar-none hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 py-2.5 whitespace-nowrap">
          <Link
            to="/products"
            className="flex items-center gap-1.5 font-bold text-white hover:text-orange-400 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-orange-400" />
            All Departments
          </Link>
          <Link
            to="/products?deal=true"
            className="text-amber-400 font-bold hover:text-amber-300 transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            Today&apos;s Deals
          </Link>
          {categories.slice(0, 7).map(cat => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="text-slate-300 hover:text-white transition-colors"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            to="/seller"
            className="ml-auto text-blue-300 hover:text-blue-200 font-semibold flex items-center gap-1"
          >
            <Store className="w-3.5 h-3.5" />
            Sell on ShopNest
          </Link>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 py-4 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-2">
              Browse Categories
            </p>
            <Link
              to="/products"
              className="block py-2 text-sm font-semibold text-orange-400"
            >
              All Products & Deals
            </Link>
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="block py-1.5 text-sm text-slate-300 hover:text-white"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">
              Dashboards & Portals
            </p>
            <Link to="/account" className="block py-1.5 text-sm text-slate-300">
              Customer Account
            </Link>
            <Link to="/seller" className="block py-1.5 text-sm text-blue-400 font-medium">
              Seller Hub
            </Link>
            <Link to="/admin" className="block py-1.5 text-sm text-purple-400 font-medium">
              Admin Console
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
