import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, Package, Truck, ArrowRight, Home, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';

export const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders } = useAuth();

  const order = orders.find(o => o.id === orderId) || orders[0];

  useEffect(() => {
    // Fire festive confetti cannon
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      confetti({
        particleCount: 40,
        startVelocity: 30,
        spread: 360,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#f97316', '#3b82f6', '#10b981', '#fbbf24'],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Top celebratory card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-xl text-center mb-8">
          <div className="w-18 h-18 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-orange-500">
            Order Successfully Placed
          </span>
          <h1 className="text-2xl sm:text-4xl font-black font-heading mt-1 mb-3">
            Thank You for Your Order!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            We&apos;ve sent an order confirmation and itemized invoice to your email. Our verified vendors are already preparing your package.
          </p>

          <div className="inline-flex flex-wrap items-center justify-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Order ID
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                {order ? order.id : orderId}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Estimated Delivery
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {order ? order.deliveryMethod.estimatedDelivery : '3-5 business days'}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Tracking Number
              </span>
              <span className="font-bold text-orange-500 font-mono">
                {order ? `TRK-${order.id}` : 'TRK-9832104'}
              </span>
            </div>
          </div>
        </div>

        {/* Order Details Accordion / Card */}
        {order && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-base font-bold font-heading border-b border-slate-100 dark:border-slate-800 pb-3">
              Order Summary & Delivery Details
            </h3>

            {/* Address & Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                  Shipping Destination
                </p>
                <p className="text-slate-600 dark:text-slate-300 font-medium">
                  {order.shippingAddress.fullName}
                </p>
                <p className="text-slate-400">
                  {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                  {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p className="text-slate-400 mt-1">{order.shippingAddress.phone}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                  Payment & Delivery
                </p>
                <p className="text-slate-600 dark:text-slate-300 font-medium">
                  {order.paymentMethod.type === 'card' ? 'Card Payment' : 'Cash on Delivery'}
                </p>
                <p className="text-slate-400">
                  {order.paymentMethod.last4 ? `Card ending in ${order.paymentMethod.last4}` : 'Pay on Delivery'}
                </p>
                <p className="text-slate-400 mt-1">{order.deliveryMethod.title}</p>
              </div>
            </div>

            {/* Items List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {order.items.map(item => (
                <div key={item.productId} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Qty: {item.quantity} • Sold by {item.sellerName || 'Verified Vendor'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-heading text-slate-900 dark:text-slate-100">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Breakdown */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span>{order.shippingCost === 0 ? 'Free' : formatCurrency(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="pt-2 flex justify-between font-bold text-sm text-slate-900 dark:text-slate-100 font-heading">
                <span>Total Paid</span>
                <span className="text-orange-500 text-lg">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Link
            to="/account?tab=orders"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order Timeline</span>
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
