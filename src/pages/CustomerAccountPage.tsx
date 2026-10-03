import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  User,
  PackageCheck,
  Heart,
  MapPin,
  Clock,
  Truck,
  CheckCircle2,
  Trash2,
  Plus,
  ArrowRight,
  ShieldCheck,
  Edit2,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Address, Product } from '../types';

export const CustomerAccountPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, orders, addresses, updateProfile, addAddress, deleteAddress } = useAuth();
  const { wishlistProducts, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useNotification();

  const activeTab = searchParams.get('tab') || 'orders';

  // Address modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddr, setNewAddr] = useState<Omit<Address, 'id'>>({
    fullName: currentUser?.name || '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: currentUser?.phone || '',
    isDefault: false,
  });

  // Profile edit state
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name: profileName, phone: profilePhone });
    showToast('Profile information updated.', 'success');
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.fullName || !newAddr.street || !newAddr.city || !newAddr.zipCode) {
      showToast('Please complete all address fields.', 'error');
      return;
    }

    addAddress(newAddr);
    setIsAddressModalOpen(false);
    showToast('New shipping address saved.', 'success');
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'delivered':
        return 4;
      case 'shipped':
        return 3;
      case 'processing':
        return 2;
      case 'pending':
      default:
        return 1;
    }
  };

  const trackingSteps = [
    { step: 1, label: 'Order Placed' },
    { step: 2, label: 'Processing & Packed' },
    { step: 3, label: 'In Transit' },
    { step: 4, label: 'Delivered' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Greeting Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center font-bold text-xl">
                {currentUser?.name?.[0] || 'U'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black font-heading">{currentUser?.name}</h1>
                <Badge variant="primary" size="sm">
                  {currentUser?.role.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{currentUser?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-center">
            <div>
              <span className="block text-xl font-bold font-heading text-slate-900 dark:text-slate-100">
                {orders.length}
              </span>
              <span className="text-[11px] text-slate-400">Total Orders</span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
            <div>
              <span className="block text-xl font-bold font-heading text-slate-900 dark:text-slate-100">
                {wishlistProducts.length}
              </span>
              <span className="text-[11px] text-slate-400">Wishlist Items</span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
            <div>
              <span className="block text-xl font-bold font-heading text-slate-900 dark:text-slate-100">
                {addresses.length}
              </span>
              <span className="text-[11px] text-slate-400">Saved Addresses</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {[
            { key: 'orders', label: 'Order History & Tracking', icon: PackageCheck },
            { key: 'wishlist', label: `My Wishlist (${wishlistProducts.length})`, icon: Heart },
            { key: 'addresses', label: 'Shipping Addresses', icon: MapPin },
            { key: 'profile', label: 'Account Profile', icon: User },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSearchParams({ tab: tab.key })}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: ORDER HISTORY & TRACKING */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.length > 0 ? (
              orders.map(order => {
                const currentStep = getStatusStep(order.status);

                return (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-base font-bold font-heading">
                            Order #{order.id}
                          </span>
                          <Badge
                            variant={
                              order.status === 'delivered'
                                ? 'success'
                                : order.status === 'shipped'
                                ? 'primary'
                                : 'warning'
                            }
                            size="sm"
                          >
                            {order.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Placed on {formatDate(order.createdAt)} • Tracking #{`TRK-${order.id}`}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-lg font-black font-heading text-slate-900 dark:text-slate-100">
                          {formatCurrency(order.total)}
                        </span>
                        <p className="text-[11px] text-slate-400">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    </div>

                    {/* Interactive Tracking Timeline */}
                    <div className="py-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                        Delivery Progress Timeline
                      </p>
                      <div className="relative flex items-center justify-between max-w-2xl mx-auto px-4">
                        <div className="absolute left-6 right-6 top-4 h-1 bg-slate-200 dark:bg-slate-800 z-0">
                          <div
                            className="h-full bg-orange-500 transition-all duration-500"
                            style={{
                              width: `${((currentStep - 1) / (trackingSteps.length - 1)) * 100}%`,
                            }}
                          />
                        </div>

                        {trackingSteps.map(st => {
                          const isDone = currentStep >= st.step;
                          const isCurrent = currentStep === st.step;

                          return (
                            <div
                              key={st.step}
                              className="relative z-10 flex flex-col items-center text-center"
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                  isDone
                                    ? 'bg-orange-500 text-white shadow-sm'
                                    : 'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-400'
                                }`}
                              >
                                {isDone ? <CheckCircle2 className="w-4 h-4" /> : st.step}
                              </div>
                              <span
                                className={`text-[11px] mt-2 font-medium max-w-[80px] leading-tight ${
                                  isCurrent
                                    ? 'text-orange-500 font-bold'
                                    : isDone
                                    ? 'text-slate-800 dark:text-slate-200'
                                    : 'text-slate-400'
                                }`}
                              >
                                {st.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Items preview list */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/60">
                      {order.items.map(it => (
                        <div key={it.productId} className="py-3 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={it.image}
                              alt={it.title}
                              className="w-12 h-12 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                            />
                            <div>
                              <Link
                                to={`/products/${it.productId}`}
                                className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-orange-500 line-clamp-1"
                              >
                                {it.title}
                              </Link>
                              <p className="text-[11px] text-slate-400">
                                Qty: {it.quantity} • {formatCurrency(it.price)} each
                              </p>
                            </div>
                          </div>

                          <Link
                            to={`/products/${it.productId}`}
                            className="text-xs font-semibold text-orange-500 hover:underline shrink-0"
                          >
                            Buy Again
                          </Link>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Destination Footnote */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                      <span>
                        Shipping to: {order.shippingAddress.fullName},{' '}
                        {order.shippingAddress.city}, {order.shippingAddress.state}
                      </span>
                      <span>Estimated delivery: {order.deliveryMethod.estimatedDelivery}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
                <PackageCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold mb-1">No Orders Yet</h3>
                <p className="text-xs text-slate-500 mb-6">
                  You haven&apos;t placed any orders yet. Discover our trending catalog today!
                </p>
                <Link
                  to="/products"
                  className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-xs shadow-md"
                >
                  Start Shopping
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WISHLIST */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlistProducts.map((prod: Product) => (
                  <div
                    key={prod.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs p-4 flex flex-col justify-between"
                  >
                    <div>
                      <Link
                        to={`/products/${prod.id}`}
                        className="relative block aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3"
                      >
                        <img
                          src={prod.images[0]}
                          alt={prod.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </Link>
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        {prod.brand}
                      </span>
                      <Link to={`/products/${prod.id}`}>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-orange-500 line-clamp-2 mt-0.5">
                          {prod.title}
                        </h4>
                      </Link>
                      <p className="text-sm font-bold font-heading text-slate-900 dark:text-slate-100 mt-2">
                        {formatCurrency(prod.price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          addToCart(prod, 1);
                          removeFromWishlist(prod.id);
                        }}
                        className="flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Move to Cart
                      </button>
                      <button
                        onClick={() => removeFromWishlist(prod.id)}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 cursor-pointer"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
                <Heart className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold mb-1">Your Wishlist is Empty</h3>
                <p className="text-xs text-slate-500 mb-6">
                  Save your favorite items here to purchase later or watch for price drops.
                </p>
                <Link
                  to="/products"
                  className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-xs shadow-md"
                >
                  Explore Catalog
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SAVED ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-heading">Manage Shipping Addresses</h3>
              <button
                onClick={() => setIsAddressModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {addresses.map((addr: Address) => (
                <div
                  key={addr.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between font-bold text-xs mb-2">
                      <span>{addr.fullName}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {addr.street}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {addr.city}, {addr.state} {addr.zipCode}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">Phone: {addr.phone}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className="text-xs text-rose-500 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <div className="max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <h3 className="text-base font-bold font-heading mb-4">Personal Information</h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={currentUser?.email}
                  disabled
                  className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Email cannot be changed directly in demo mode.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={e => setProfilePhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Add Shipping Address"
      >
        <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Recipient Name *</label>
            <input
              type="text"
              value={newAddr.fullName}
              onChange={e => setNewAddr({ ...newAddr, fullName: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Street Address *</label>
            <input
              type="text"
              value={newAddr.street}
              onChange={e => setNewAddr({ ...newAddr, street: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
              placeholder="123 Main St, Apt 4"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">City *</label>
              <input
                type="text"
                value={newAddr.city}
                onChange={e => setNewAddr({ ...newAddr, city: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">State *</label>
              <input
                type="text"
                value={newAddr.state}
                onChange={e => setNewAddr({ ...newAddr, state: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">ZIP Code *</label>
              <input
                type="text"
                value={newAddr.zipCode}
                onChange={e => setNewAddr({ ...newAddr, zipCode: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Phone *</label>
              <input
                type="tel"
                value={newAddr.phone}
                onChange={e => setNewAddr({ ...newAddr, phone: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer"
            >
              Save Address
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
