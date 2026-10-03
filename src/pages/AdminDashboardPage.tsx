import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ShieldCheck,
  Users,
  Store,
  Package,
  DollarSign,
  TrendingUp,
  Tag,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Trash2,
  Star,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useNotification } from '../context/NotificationContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { formatCurrency } from '../utils/formatters';
import { Coupon } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const { currentUser, isAdmin, loginAsDemo, users, orders, toggleUserStatus } = useAuth();
  const { products, categories, coupons, deleteProduct, updateProduct } = useProducts();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'products' | 'coupons'>('analytics');

  // Coupon state
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(15);
  const [couponMinOrder, setCouponMinOrder] = useState(50);

  // Platform Metrics
  const totalGMV = useMemo(() => {
    return products.reduce((acc, p) => acc + p.price * (p.reviewCount * 1.5), 0);
  }, [products]);

  const activeSellersCount = useMemo(() => {
    const set = new Set(products.map(p => p.sellerId));
    return set.size;
  }, [products]);

  // Chart data: GMV Growth
  const gmvGrowthData = [
    { month: 'Oct', gmv: 85000 },
    { month: 'Nov', gmv: 112000 },
    { month: 'Dec', gmv: 168000 },
    { month: 'Jan', gmv: 135000 },
    { month: 'Feb', gmv: 148000 },
    { month: 'Mar', gmv: 195000 },
    { month: 'Apr', gmv: 242000 },
  ];

  // Category distribution
  const categoryChartData = useMemo(() => {
    const colors = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#f59e0b', '#06b6d4', '#64748b'];
    return categories.map((cat, idx) => {
      const count = products.filter(p => p.category === cat.slug).length;
      return {
        name: cat.name,
        value: count,
        color: colors[idx % colors.length],
      };
    });
  }, [categories, products]);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    showToast(`Coupon ${couponCode.toUpperCase()} activated for all shoppers!`, 'success');
    setIsCouponModalOpen(false);
    setCouponCode('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Role Notice */}
        {!isAdmin && (
          <div className="mb-6 p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-purple-900 dark:text-purple-300">
              <ShieldCheck className="w-5 h-5 text-purple-500 shrink-0" />
              <span>
                You are currently viewing with <strong>{currentUser?.role || 'Guest'}</strong> permissions. Switch to Demo Admin to execute platform administration commands.
              </span>
            </div>
            <button
              onClick={() => loginAsDemo('admin')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              Switch to Demo Admin
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black font-heading">Admin Console</h1>
              <Badge variant="primary" size="sm" className="bg-purple-100 text-purple-700 border-purple-200">
                Super Admin
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              ShopNest Ecosystem Governance, Seller Approvals & Platform Intelligence
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Promo Code</span>
            </button>
          </div>
        </div>

        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Gross Merchandise Value (GMV)</span>
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-heading text-slate-900 dark:text-slate-100">
              {formatCurrency(totalGMV)}
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
              +24.8% YoY growth
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Registered Users</span>
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-heading text-slate-900 dark:text-slate-100">
              {users.length} Active
            </p>
            <span className="text-[11px] text-slate-400 mt-1 inline-block">
              Buyers, Sellers & Admins
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Active Sellers</span>
              <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-heading text-slate-900 dark:text-slate-100">
              {activeSellersCount} Merchants
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
              100% verified credentials
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Total Catalog Listings</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-heading text-slate-900 dark:text-slate-100">
              {products.length} Products
            </p>
            <span className="text-[11px] text-slate-400 mt-1 inline-block">
              Across {categories.length} departments
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 mb-8">
          {[
            { key: 'analytics', label: 'Platform Intelligence & Charts' },
            { key: 'users', label: `Users & Roles (${users.length})` },
            { key: 'products', label: `Catalog Moderation (${products.length})` },
            { key: 'coupons', label: `Promo Codes (${coupons.length})` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === t.key
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB 1: ANALYTICS & CHARTS */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            {/* GMV Growth Area Chart (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-base font-bold font-heading mb-1">
                Marketplace GMV Growth ($)
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Monthly gross transactional volume across all merchant stores
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={gmvGrowthData}>
                    <defs>
                      <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9333ea" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
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
                      formatter={(val: any) => [`$${val.toLocaleString()}`, 'Total GMV']}
                    />
                    <Area
                      type="monotone"
                      dataKey="gmv"
                      stroke="#9333ea"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorGmv)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department Breakdown Pie Chart (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-base font-bold font-heading mb-1">Catalog Department Share</h3>
              <p className="text-xs text-slate-400 mb-4">Inventory density per department</p>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={3}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                      formatter={(val: any, name: any) => [`${val} items`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map(u => (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-9 h-9 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold">
                              {u.name[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100">{u.name}</p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            u.role === 'admin'
                              ? 'primary'
                              : u.role === 'seller'
                              ? 'accent'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {u.role.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            u.status === 'active' ? 'text-emerald-600' : 'text-rose-500'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {u.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">{u.joinedDate}</td>
                      <td className="p-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => {
                              toggleUserStatus(u.id);
                              showToast(
                                `User status toggled to ${
                                  u.status === 'active' ? 'suspended' : 'active'
                                }`,
                                'info'
                              );
                            }}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                              u.status === 'active'
                                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 hover:bg-emerald-100'
                            }`}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCT MODERATION */}
        {activeTab === 'products' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-4">Item</th>
                    <th className="p-4">Seller</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Badges</th>
                    <th className="p-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {products.map(p => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="w-10 h-10 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                              {p.title}
                            </p>
                            <p className="text-[10px] text-slate-400">{p.brand} • {p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                        {p.sellerName}
                      </td>
                      <td className="p-4 font-bold font-heading text-slate-900 dark:text-slate-100">
                        {formatCurrency(p.price)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          {p.isDeal && <Badge variant="warning" size="sm">DEAL</Badge>}
                          {p.isBestSeller && <Badge variant="primary" size="sm">BESTSELLER</Badge>}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              updateProduct(p.id, { isDeal: !p.isDeal });
                              showToast(`Toggled deal status for "${p.title}"`, 'info');
                            }}
                            className={`p-1.5 rounded-lg border cursor-pointer ${
                              p.isDeal
                                ? 'bg-amber-50 border-amber-300 text-amber-600'
                                : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-500'
                            }`}
                            title="Toggle Deal status"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete "${p.title}" from platform?`)) {
                                deleteProduct(p.id);
                                showToast('Listing removed by administrator.', 'info');
                              }
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 cursor-pointer"
                            title="Remove from platform"
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

        {/* TAB 4: COUPONS */}
        {activeTab === 'coupons' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold font-heading">Promotional Discount Codes</h3>
                <p className="text-xs text-slate-400">Manage site-wide promotional vouchers</p>
              </div>
              <button
                onClick={() => setIsCouponModalOpen(true)}
                className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                + Create Code
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {coupons.map(c => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between font-mono font-bold text-sm text-orange-600 dark:text-orange-400 mb-1">
                      <span>{c.code}</span>
                      <Badge variant="success" size="sm">ACTIVE</Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {c.discountValue}% discount off total
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Min order: {formatCurrency(c.minSpend)}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-3">Valid through Dec 2026</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      <Modal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        title="Create Promotional Coupon"
      >
        <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Coupon Code (Uppercase)</label>
            <input
              type="text"
              value={couponCode}
              onChange={e => setCouponCode(e.target.value.toUpperCase())}
              placeholder="e.g. FLASH20"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Discount %</label>
              <input
                type="number"
                value={couponDiscount}
                onChange={e => setCouponDiscount(Number(e.target.value))}
                min={1}
                max={90}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Min Order ($)</label>
              <input
                type="number"
                value={couponMinOrder}
                onChange={e => setCouponMinOrder(Number(e.target.value))}
                min={0}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCouponModalOpen(false)}
              className="px-4 py-2 text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-orange-500 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer"
            >
              Activate Code
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
