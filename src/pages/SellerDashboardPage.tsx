import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Store,
  DollarSign,
  Package,
  ShoppingCart,
  Star,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Upload,
  Eye,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useNotification } from '../context/NotificationContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Product } from '../types';

export const SellerDashboardPage: React.FC = () => {
  const { currentUser, isSeller, isAdmin, loginAsDemo, orders, updateOrderStatus } = useAuth();
  const { products, categories, addProduct, updateProduct, deleteProduct } = useProducts();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    category: 'electronics',
    price: 99.99,
    originalPrice: 129.99,
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    description: '',
    features: 'Premium audio; 30-hour battery life; Active Noise Cancellation',
  });

  // Filter products for this seller (or all for admin view)
  const sellerProducts = useMemo(() => {
    if (isAdmin) return products;
    return products.filter(
      p => p.sellerId === currentUser?.id || p.sellerName === currentUser?.name
    );
  }, [products, currentUser, isAdmin]);

  // Seller analytics metrics
  const totalRevenue = useMemo(() => {
    return sellerProducts.reduce((acc, p) => acc + p.price * (p.reviewCount * 0.4), 0);
  }, [sellerProducts]);

  const totalSoldUnits = useMemo(() => {
    return Math.round(sellerProducts.reduce((acc, p) => acc + p.reviewCount * 0.4, 0));
  }, [sellerProducts]);

  const avgRating = useMemo(() => {
    if (sellerProducts.length === 0) return 5.0;
    const sum = sellerProducts.reduce((acc, p) => acc + p.rating, 0);
    return (sum / sellerProducts.length).toFixed(1);
  }, [sellerProducts]);

  // Chart data: Monthly revenue simulation
  const monthlyData = [
    { month: 'Jan', revenue: 4200, orders: 48 },
    { month: 'Feb', revenue: 5600, orders: 62 },
    { month: 'Mar', revenue: 7800, orders: 85 },
    { month: 'Apr', revenue: 6900, orders: 74 },
    { month: 'May', revenue: 9200, orders: 104 },
    { month: 'Jun', revenue: 11500, orders: 128 },
    { month: 'Jul', revenue: 14200, orders: 154 },
  ];

  // Top products chart data
  const topProductsData = sellerProducts.slice(0, 5).map(p => ({
    name: p.title.slice(0, 16) + '...',
    sales: Math.round(p.price * (p.reviewCount * 0.2)),
  }));

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      brand: currentUser?.name || 'Aura Soundworks',
      category: 'electronics',
      price: 49.99,
      originalPrice: 69.99,
      stock: 20,
      imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
      description: 'Crafted with premium materials for discerning daily use.',
      features: 'Ergonomic build; Certified sustainable; 2-year warranty',
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      title: p.title,
      brand: p.brand,
      category: p.category,
      price: p.price,
      originalPrice: p.originalPrice || p.price * 1.2,
      stock: p.stock,
      imageUrl: p.images[0] || '',
      description: p.description,
      features: p.features ? p.features.join('; ') : '',
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const featuresList = formData.features
      .split(';')
      .map(f => f.trim())
      .filter(Boolean);

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        title: formData.title,
        brand: formData.brand,
        category: formData.category,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        stock: Number(formData.stock),
        images: [formData.imageUrl],
        description: formData.description,
        features: featuresList,
      });
      showToast('Product updated successfully.', 'success');
    } else {
      addProduct({
        title: formData.title,
        brand: formData.brand,
        category: formData.category,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        discountPercentage: Math.round(
          ((Number(formData.originalPrice) - Number(formData.price)) /
            Number(formData.originalPrice)) *
            100
        ),
        stock: Number(formData.stock),
        images: [formData.imageUrl],
        description: formData.description,
        specifications: { Category: formData.category, Brand: formData.brand },
        features: featuresList,
        sellerId: currentUser?.id || 'usr-seller-1',
        sellerName: currentUser?.name || 'Aura Soundworks',
        isDeal: false,
        isBestSeller: false,
        isNewArrival: true,
        tags: [formData.category, formData.brand.toLowerCase()],
      });
      showToast('New product added to catalog.', 'success');
    }
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove "${title}" from inventory?`)) {
      deleteProduct(id);
      showToast('Product removed.', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Role Check Alert if not logged in as seller */}
        {!isSeller && !isAdmin && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <span>
                You are currently viewing as a <strong>{currentUser?.role || 'Guest'}</strong>.
                Switch to the Demo Seller role to unlock all vendor management actions.
              </span>
            </div>
            <button
              onClick={() => loginAsDemo('seller')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              Switch to Demo Seller
            </button>
          </div>
        )}

        {/* Dashboard Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black font-heading">Seller Hub</h1>
              <Badge variant="primary" size="sm">
                Merchant Portal
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Storefront: <strong>{currentUser?.name || 'Aura Soundworks'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Metric Cards (4 stats) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Total Revenue</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-heading text-slate-900 dark:text-slate-100">
              {formatCurrency(totalRevenue)}
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
              +18.4% from last month
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Units Sold</span>
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-heading text-slate-900 dark:text-slate-100">
              {totalSoldUnits}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 inline-block">
              Across all catalog items
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Active Inventory</span>
              <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-heading text-slate-900 dark:text-slate-100">
              {sellerProducts.length}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 inline-block">
              Published on marketplace
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Seller Rating</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <Star className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-heading text-slate-900 dark:text-slate-100">
              {avgRating} / 5.0
            </p>
            <span className="text-[11px] text-amber-600 font-semibold mt-1 inline-block">
              99.2% positive feedback
            </span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white dark:bg-orange-500'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Analytics & Charts
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'products'
                ? 'bg-slate-900 text-white dark:bg-orange-500'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Products Management ({sellerProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-slate-900 text-white dark:bg-orange-500'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Orders Fulfillment ({orders.length})
          </button>
        </div>

        {/* TAB 1: CHARTS & OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Revenue Area Chart */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-base font-bold font-heading mb-1">Monthly Revenue Trend</h3>
              <p className="text-xs text-slate-400 mb-6">Gross marketplace volume across 2026</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                      formatter={(val: any) => [`$${val.toLocaleString()}`, 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#f97316"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorRev)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Products Bar Chart */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-base font-bold font-heading mb-1">Top Selling Items</h3>
              <p className="text-xs text-slate-400 mb-6">Revenue contributions by catalog title</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProductsData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                      formatter={(val: any) => [`$${val.toLocaleString()}`, 'Total Sales']}
                    />
                    <Bar dataKey="sales" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCT MANAGEMENT TABLE */}
        {activeTab === 'products' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sellerProducts.map(prod => (
                    <tr
                      key={prod.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images[0]}
                            alt={prod.title}
                            className="w-11 h-11 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                              {prod.title}
                            </p>
                            <p className="text-[10px] text-slate-400">{prod.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 capitalize text-slate-600 dark:text-slate-300">
                        {prod.category}
                      </td>
                      <td className="p-4 font-bold font-heading text-slate-900 dark:text-slate-100">
                        {formatCurrency(prod.price)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-semibold ${
                            prod.stock <= 5 ? 'text-rose-500' : 'text-emerald-600'
                          }`}
                        >
                          {prod.stock} units
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{prod.rating.toFixed(1)}</span>
                          <span className="text-slate-400 text-[10px]">({prod.reviewCount})</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-orange-500 cursor-pointer"
                            title="Edit product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.title)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 cursor-pointer"
                            title="Delete product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ORDER FULFILLMENT */}
        {activeTab === 'orders' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold font-heading mb-4">Customer Orders & Status</h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {orders.map(o => (
                <div key={o.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold font-heading">Order #{o.id}</span>
                      <Badge
                        variant={
                          o.status === 'delivered'
                            ? 'success'
                            : o.status === 'shipped'
                            ? 'primary'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {o.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Buyer: {o.shippingAddress.fullName} • Destination: {o.shippingAddress.city},{' '}
                      {o.shippingAddress.state}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {o.items.length} items • Total: {formatCurrency(o.total)}
                    </p>
                  </div>

                  {/* Status update selector */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 font-semibold">Update Status:</span>
                    <select
                      value={o.status}
                      onChange={e => updateOrderStatus(o.id, e.target.value as any)}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-semibold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Marketplace Product'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Product Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
              placeholder="e.g. Apex Pro ANC Studio Headphones"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Brand *</label>
              <input
                type="text"
                value={formData.brand}
                onChange={e => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Department / Category *</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500 capitalize cursor-pointer"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold mb-1">Sale Price ($) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Original Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.originalPrice}
                onChange={e => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Available Stock *</label>
              <input
                type="number"
                value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Primary Image URL *</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Detailed Description *</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Bullet Features (Separate by semicolon &ldquo;;&rdquo;)</label>
            <input
              type="text"
              value={formData.features}
              onChange={e => setFormData({ ...formData, features: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
              placeholder="e.g. Ultra lightweight; 24h battery; Water resistant"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsProductModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs shadow-md cursor-pointer"
            >
              {editingProduct ? 'Update Product' : 'Publish Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
