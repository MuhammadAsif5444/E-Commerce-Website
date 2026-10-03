import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import { Navbar } from './components/common/Navbar';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { ChatbotWidget } from './components/common/ChatbotWidget';

import { HomePage } from './pages/HomePage';
import { ProductListingPage } from './pages/ProductListingPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AuthPage } from './pages/AuthPage';
import { CustomerAccountPage } from './pages/CustomerAccountPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

// Helper component to scroll to top on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return null;
};

// 404 Fallback
const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="w-20 h-20 rounded-3xl bg-orange-100 dark:bg-orange-950/50 text-orange-500 flex items-center justify-center font-black text-3xl mb-4 font-heading">
        404
      </div>
      <h1 className="text-2xl sm:text-3xl font-black font-heading mb-2">Page Not Found</h1>
      <p className="text-xs text-slate-500 max-w-sm mb-6">
        The catalog page or resource you are looking for might have been moved or removed.
      </p>
      <div className="flex gap-3">
        <Link
          to="/"
          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs shadow-md transition-colors"
        >
          Back to Home
        </Link>
        <Link
          to="/products"
          className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Explore Catalog
        </Link>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <ProductProvider>
            <CartProvider>
              <WishlistProvider>
                <Router>
                  <ScrollToTop />
                  <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                    <Navbar />
                    
                    <main className="flex-1 pb-16 md:pb-0">
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/products" element={<ProductListingPage />} />
                        <Route path="/products/:id" element={<ProductDetailsPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/account" element={<CustomerAccountPage />} />
                        <Route path="/seller" element={<SellerDashboardPage />} />
                        <Route path="/admin" element={<AdminDashboardPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </main>

                    <Footer />
                    <MobileBottomNav />
                    <ToastContainer />
                    <ChatbotWidget />
                  </div>
                </Router>
              </WishlistProvider>
            </CartProvider>
          </ProductProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
