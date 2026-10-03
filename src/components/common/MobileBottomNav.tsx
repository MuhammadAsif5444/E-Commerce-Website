import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Heart, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const MobileBottomNav: React.FC = () => {
  const { itemCount } = useCart();
  const { wishlistIds } = useWishlist();

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Explore', icon: Compass },
    {
      to: '/account?tab=wishlist',
      label: 'Wishlist',
      icon: Heart,
      badge: wishlistIds.length > 0 ? wishlistIds.length : undefined,
    },
    {
      to: '/cart',
      label: 'Cart',
      icon: ShoppingCart,
      badge: itemCount > 0 ? itemCount : undefined,
    },
    { to: '/account', label: 'Account', icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 md:hidden pb-safe"
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-5 h-16">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-colors relative ${
                  isActive
                    ? 'text-orange-500 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 bg-orange-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px]">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
