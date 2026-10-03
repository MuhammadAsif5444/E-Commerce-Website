import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, Address, Order, OrderStatus } from '../types';
import { DEMO_USERS, DEMO_ADDRESSES, DEMO_ORDERS } from '../data/demoUsers';
import { useNotification } from './NotificationContext';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  addresses: Address[];
  orders: Order[];
  login: (email: string, password?: string) => { success: boolean; error?: string };
  loginAsDemo: (role: Role) => void;
  register: (name: string, email: string, password: string, role: Role, storeName?: string) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (updated: Partial<User>) => void;
  addAddress: (addr: Omit<Address, 'id'>) => Address;
  updateAddress: (id: string, addr: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  placeOrder: (order: Omit<Order, 'id' | 'createdAt' | 'trackingHistory'>) => Order;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  toggleUserStatus: (userId: string) => void;
  isAuthenticated: boolean;
  isCustomer: boolean;
  isSeller: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useNotification();

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('shopnest_all_users');
      return saved ? JSON.parse(saved) : DEMO_USERS;
    } catch {
      return DEMO_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('shopnest_current_user');
      if (saved) return JSON.parse(saved);
      // Default to demo customer for immediate high quality preview
      return DEMO_USERS[0];
    } catch {
      return DEMO_USERS[0];
    }
  });

  const [addresses, setAddresses] = useState<Address[]>(() => {
    try {
      const saved = localStorage.getItem('shopnest_addresses');
      return saved ? JSON.parse(saved) : DEMO_ADDRESSES;
    } catch {
      return DEMO_ADDRESSES;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('shopnest_orders');
      return saved ? JSON.parse(saved) : DEMO_ORDERS;
    } catch {
      return DEMO_ORDERS;
    }
  });

  useEffect(() => {
    localStorage.setItem('shopnest_all_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('shopnest_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('shopnest_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('shopnest_addresses', JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    localStorage.setItem('shopnest_orders', JSON.stringify(orders));
  }, [orders]);

  const login = (email: string, _password?: string) => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      return { success: false, error: 'No account found with this email. Please check your credentials or register.' };
    }
    if (found.status === 'suspended') {
      return { success: false, error: 'This account has been suspended by an administrator.' };
    }

    setCurrentUser(found);
    showToast(`Welcome back, ${found.name}!`, 'success');
    return { success: true };
  };

  const loginAsDemo = (role: Role) => {
    const demo = DEMO_USERS.find(u => u.role === role);
    if (demo) {
      setCurrentUser(demo);
      showToast(`Logged in as Demo ${role.charAt(0).toUpperCase() + role.slice(1)}: ${demo.name}`, 'info');
    }
  };

  const register = (name: string, email: string, _password: string, role: Role, storeName?: string) => {
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80`,
      storeName: role === 'seller' ? (storeName || `${name}'s Store`) : undefined,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    showToast(`Account created successfully! Welcome to ShopNest.`, 'success');
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    showToast('You have been signed out.', 'info');
  };

  const updateProfile = (updated: Partial<User>) => {
    if (!currentUser) return;
    const modified = { ...currentUser, ...updated };
    setCurrentUser(modified);
    setUsers(prev => prev.map(u => (u.id === modified.id ? modified : u)));
    showToast('Profile updated successfully.', 'success');
  };

  const addAddress = (addrData: Omit<Address, 'id'>): Address => {
    const newAddr: Address = {
      ...addrData,
      id: `addr-${Date.now()}`,
      isDefault: Boolean(addrData.isDefault),
    };
    if (newAddr.isDefault) {
      setAddresses(prev => [...prev.map(a => ({ ...a, isDefault: false })), newAddr]);
    } else {
      setAddresses(prev => [...prev, newAddr]);
    }
    showToast('New shipping address saved.', 'success');
    return newAddr;
  };

  const updateAddress = (id: string, updated: Partial<Address>) => {
    setAddresses(prev =>
      prev.map(addr => {
        if (addr.id === id) {
          const res = { ...addr, ...updated };
          return res;
        }
        if (updated.isDefault) {
          return { ...addr, isDefault: false };
        }
        return addr;
      })
    );
    showToast('Address updated.', 'success');
  };

  const deleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    showToast('Address removed.', 'info');
  };

  const placeOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'trackingHistory'>): Order => {
    const now = new Date();
    const orderNumber = `SN-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: Order = {
      ...orderData,
      id: orderNumber,
      createdAt: now.toISOString(),
      trackingHistory: [
        {
          status: 'placed',
          timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          location: 'ShopNest Automated Fulfillment Core',
          message: 'Order received and verified. Preparing dispatch dispatch ticket.',
        },
      ],
    };

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id !== orderId) return ord;
        const now = new Date();
        const updatedHistory = [
          ...ord.trackingHistory,
          {
            status: newStatus,
            timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            location: 'Regional Logistics Center',
            message: `Status updated to ${newStatus.replace(/_/g, ' ').toUpperCase()}`,
          },
        ];
        return {
          ...ord,
          status: newStatus,
          trackingHistory: updatedHistory,
        };
      })
    );
    showToast(`Order ${orderId} updated to ${newStatus.replace(/_/g, ' ')}.`, 'info');
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const nextStatus = u.status === 'active' ? 'suspended' : 'active';
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
    showToast('User status updated.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        addresses,
        orders,
        login,
        loginAsDemo,
        register,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        placeOrder,
        updateOrderStatus,
        toggleUserStatus,
        isAuthenticated: !!currentUser,
        isCustomer: currentUser?.role === 'customer',
        isSeller: currentUser?.role === 'seller',
        isAdmin: currentUser?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
