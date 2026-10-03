import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Mail,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  ArrowRight,
  Github,
  Twitter,
  Instagram,
  Linkedin,
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export const Footer: React.FC = () => {
  const { showToast } = useNotification();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    showToast('Subscribed! Welcome to the ShopNest insider newsletter.', 'success');
    setEmail('');
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-24 md:pb-12 border-t border-slate-800 transition-colors">
      {/* Value Proposition Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-heading">Free Express Delivery</h4>
              <p className="text-xs text-slate-400 mt-0.5">Complimentary for all orders over $75</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-heading">Buyer Protection</h4>
              <p className="text-xs text-slate-400 mt-0.5">100% Guaranteed authentic products</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-heading">30-Day Easy Returns</h4>
              <p className="text-xs text-slate-400 mt-0.5">Hassle-free instant refund policy</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-heading">24/7 Smart Support</h4>
              <p className="text-xs text-slate-400 mt-0.5">Live AI chat & dedicated agent team</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-heading">
                Shop<span className="text-orange-400">Nest</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              ShopNest is a modern multi-vendor marketplace connecting passionate independent artisans, verified brands, and discerning shoppers across the globe.
            </p>

            {/* Newsletter */}
            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-white mb-2">
                Get Insider Deals & Flash Sales
              </p>
              <form onSubmit={handleSubscribe} className="flex max-w-sm rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                <div className="flex items-center pl-3 text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email..."
                  className="w-full bg-transparent px-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 px-4 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Shop Departments */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Shop Departments
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/products?category=electronics" className="hover:text-white transition-colors">
                  Electronics & Audio
                </Link>
              </li>
              <li>
                <Link to="/products?category=fashion" className="hover:text-white transition-colors">
                  Fashion & Apparel
                </Link>
              </li>
              <li>
                <Link to="/products?category=home" className="hover:text-white transition-colors">
                  Home & Living
                </Link>
              </li>
              <li>
                <Link to="/products?category=beauty" className="hover:text-white transition-colors">
                  Beauty & Skincare
                </Link>
              </li>
              <li>
                <Link to="/products?category=sports" className="hover:text-white transition-colors">
                  Sports & Outdoors
                </Link>
              </li>
              <li>
                <Link to="/products?category=gourmet" className="hover:text-white transition-colors">
                  Gourmet & Pantry
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Customer Portal
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/account?tab=orders" className="hover:text-white transition-colors">
                  Track My Orders
                </Link>
              </li>
              <li>
                <Link to="/account?tab=addresses" className="hover:text-white transition-colors">
                  Shipping Addresses
                </Link>
              </li>
              <li>
                <Link to="/account?tab=wishlist" className="hover:text-white transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-white transition-colors">
                  Login / Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Business & Portals */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Vendors & Platform
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/seller" className="hover:text-white transition-colors flex items-center gap-1.5 font-semibold text-blue-400">
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors flex items-center gap-1.5 font-semibold text-purple-400">
                  Admin Console
                </Link>
              </li>
              <li>
                <Link to="/products?deal=true" className="hover:text-white transition-colors text-amber-400">
                  Flash Deals
                </Link>
              </li>
              <li>
                <span className="text-slate-400">API Documentation (REST)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright & Social */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} ShopNest Inc. All rights reserved. Designed for multi-vendor excellence.</p>
        <div className="flex items-center gap-4 text-slate-400">
          <a href="#github" className="hover:text-white transition-colors" aria-label="Github">
            <Github className="w-4 h-4" />
          </a>
          <a href="#twitter" className="hover:text-white transition-colors" aria-label="Twitter">
            <Twitter className="w-4 h-4" />
          </a>
          <a href="#instagram" className="hover:text-white transition-colors" aria-label="Instagram">
            <Instagram className="w-4 h-4" />
          </a>
          <a href="#linkedin" className="hover:text-white transition-colors" aria-label="LinkedIn">
            <Linkedin className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
};
