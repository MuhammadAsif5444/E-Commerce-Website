import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Check,
  CreditCard,
  Truck,
  MapPin,
  FileCheck,
  ChevronRight,
  Lock,
  ArrowRight,
  Banknote,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { formatCurrency } from '../utils/formatters';
import { Address, Order, OrderItem } from '../types';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, shipping, tax, total, appliedCoupon, clearCart } = useCart();
  const { currentUser, addresses, placeOrder } = useAuth();
  const { showToast } = useNotification();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Shipping Address
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses?.[0]?.id || 'new'
  );
  const [shippingAddress, setShippingAddress] = useState<Address>(
    addresses?.[0] || {
      id: `addr-${Date.now()}`,
      fullName: currentUser?.name || '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      phone: currentUser?.phone || '',
      isDefault: false,
    }
  );

  // Step 2: Delivery Method
  const [deliveryMethod, setDeliveryMethod] = useState({
    id: 'dm-standard',
    title: 'Standard Ground Delivery',
    price: subtotal >= 75 ? 0 : 9.99,
    estimatedDelivery: '3-5 business days',
    description: 'Reliable doorstep ground service with full tracking',
  });

  // Step 3: Payment Method
  const [paymentType, setPaymentType] = useState<'card' | 'cod'>('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '4242 •••• •••• 4242',
    cardHolder: currentUser?.name || '',
    expiry: '12/28',
    cvv: '888',
  });

  // Processing order state
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  // Handle saved address selection
  const handleSelectSavedAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setShippingAddress(addr);
  };

  // Step validation
  const validateStep1 = () => {
    if (
      !shippingAddress.fullName.trim() ||
      !shippingAddress.street.trim() ||
      !shippingAddress.city.trim() ||
      !shippingAddress.state.trim() ||
      !shippingAddress.zipCode.trim() ||
      !shippingAddress.phone.trim()
    ) {
      showToast('Please fill in all required shipping address fields.', 'error');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (paymentType === 'card') {
      if (!cardDetails.cardHolder.trim() || !cardDetails.cardNumber.trim()) {
        showToast('Please enter valid credit card credentials.', 'error');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 3 && !validateStep3()) return;
    setCurrentStep(prev => Math.min(4, prev + 1) as any);
  };

  // Final submit
  const handlePlaceOrder = () => {
    setIsPlacingOrder(true);

    setTimeout(() => {
      const orderItems: OrderItem[] = items.map(it => ({
        productId: it.product.id,
        title: it.product.title,
        image: it.product.images[0],
        price: it.product.price,
        quantity: it.quantity,
        selectedVariants: it.selectedVariants,
        sellerName: it.product.sellerName,
      }));

      const newOrder = placeOrder({
        userId: currentUser?.id || 'guest-user',
        items: orderItems,
        subtotal,
        shippingCost: deliveryMethod.price,
        tax,
        discount: appliedCoupon ? (subtotal * appliedCoupon.discountValue) / 100 : 0,
        total: subtotal + deliveryMethod.price + tax - (appliedCoupon ? (subtotal * appliedCoupon.discountValue) / 100 : 0),
        status: 'placed',
        shippingAddress,
        deliveryMethod,
        paymentMethod: {
          type: paymentType,
          last4: paymentType === 'card' ? cardDetails.cardNumber.slice(-4) : undefined,
          cardBrand: 'Visa',
        },
      });

      clearCart();
      setIsPlacingOrder(false);
      navigate(`/order-confirmation/${newOrder.id}`);
    }, 1200);
  };

  const steps = [
    { num: 1, label: 'Address', icon: MapPin },
    { num: 2, label: 'Delivery', icon: Truck },
    { num: 3, label: 'Payment', icon: CreditCard },
    { num: 4, label: 'Review', icon: FileCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading">Secure Checkout</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Encrypted end-to-end multi-vendor purchase
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit SSL Secured</span>
          </div>
        </div>

        {/* Stepper Wizard Bar */}
        <div className="mb-10 max-w-3xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:border-slate-800 z-0" />
            {steps.map(step => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.num;
              const isCurrent = currentStep === step.num;

              return (
                <div key={step.num} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-md'
                        : isCurrent
                        ? 'bg-orange-500 text-white ring-4 ring-orange-500/20 shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-xs font-semibold mt-1.5 ${
                      isCurrent
                        ? 'text-orange-500 font-bold'
                        : isCompleted
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Step Body (8 cols) */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            {/* STEP 1: SHIPPING ADDRESS */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <h3 className="text-lg font-bold font-heading">1. Select Delivery Address</h3>

                {/* Saved addresses */}
                {addresses && addresses.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-slate-500">Your Saved Addresses</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {addresses.map((addr: Address) => (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer text-xs ${
                            selectedAddressId === addr.id
                              ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 ring-2 ring-orange-500/20'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold mb-1">
                            <span>{addr.fullName}</span>
                            {addr.isDefault && (
                              <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 dark:text-slate-400">
                            {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                          </p>
                          <p className="text-slate-400 mt-1">Phone: {addr.phone}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Or enter/edit address */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <p className="text-xs font-semibold text-slate-500">Recipient Details</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.fullName}
                        onChange={e =>
                          setShippingAddress({ ...shippingAddress, fullName: e.target.value })
                        }
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                        placeholder="e.g. Jane Doe"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={e =>
                          setShippingAddress({ ...shippingAddress, phone: e.target.value })
                        }
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                        placeholder="+1 (555) 000-0000"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.street}
                      onChange={e =>
                        setShippingAddress({ ...shippingAddress, street: e.target.value })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                      placeholder="Apartment, suite, unit, building, floor, etc."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={e =>
                          setShippingAddress({ ...shippingAddress, city: e.target.value })
                        }
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                        placeholder="Seattle"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        State / Province *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.state}
                        onChange={e =>
                          setShippingAddress({ ...shippingAddress, state: e.target.value })
                        }
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                        placeholder="WA"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        ZIP / Postal Code *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.zipCode}
                        onChange={e =>
                          setShippingAddress({ ...shippingAddress, zipCode: e.target.value })
                        }
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                        placeholder="98101"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-colors"
                  >
                    <span>Continue to Delivery</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DELIVERY METHOD */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <h3 className="text-lg font-bold font-heading">2. Choose Delivery Speed</h3>

                <div className="space-y-3">
                  {/* Standard Delivery */}
                  <div
                    onClick={() =>
                      setDeliveryMethod({
                        id: 'dm-standard',
                        title: 'Standard Ground Delivery',
                        price: subtotal >= 75 ? 0 : 9.99,
                        estimatedDelivery: '3-5 business days',
                        description: 'Reliable doorstep ground service with full tracking',
                      })
                    }
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      deliveryMethod.id === 'dm-standard'
                        ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 ring-2 ring-orange-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          Standard Ground Delivery
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Estimated delivery in 3-5 business days
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-heading">
                      {subtotal >= 75 ? (
                        <span className="text-emerald-600 font-bold uppercase">Free</span>
                      ) : (
                        formatCurrency(9.99)
                      )}
                    </span>
                  </div>

                  {/* Express Delivery */}
                  <div
                    onClick={() =>
                      setDeliveryMethod({
                        id: 'dm-express',
                        title: 'Express Priority Air',
                        price: 19.99,
                        estimatedDelivery: '1-2 business days',
                        description: 'Expedited air courier with signature verification',
                      })
                    }
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      deliveryMethod.id === 'dm-express'
                        ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 ring-2 ring-orange-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center text-orange-600">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          Express Priority Air
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Guaranteed delivery in 1-2 business days
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-heading text-orange-500">
                      {formatCurrency(19.99)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 cursor-pointer"
                  >
                    ← Back to Address
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-colors"
                  >
                    <span>Continue to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT METHOD */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <h3 className="text-lg font-bold font-heading">3. Select Payment Method</h3>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentType('card')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      paymentType === 'card'
                        ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 ring-2 ring-orange-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-orange-500 mb-2" />
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Credit / Debit Card
                    </p>
                    <p className="text-[10px] text-slate-400">Visa, Mastercard, Amex</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType('cod')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      paymentType === 'cod'
                        ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 ring-2 ring-orange-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-emerald-500 mb-2" />
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Cash on Delivery
                    </p>
                    <p className="text-[10px] text-slate-400">Pay when order arrives</p>
                  </button>
                </div>

                {/* Simulated Card Form */}
                {paymentType === 'card' && (
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Cardholder Full Name *
                      </label>
                      <input
                        type="text"
                        value={cardDetails.cardHolder}
                        onChange={e =>
                          setCardDetails({ ...cardDetails, cardHolder: e.target.value })
                        }
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        value={cardDetails.cardNumber}
                        onChange={e =>
                          setCardDetails({ ...cardDetails, cardNumber: e.target.value })
                        }
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500 font-mono"
                        placeholder="4242 4242 4242 4242"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Expiration (MM/YY) *
                        </label>
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={e =>
                            setCardDetails({ ...cardDetails, expiry: e.target.value })
                          }
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500 font-mono"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          CVV Security Code *
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardDetails.cvv}
                          onChange={e =>
                            setCardDetails({ ...cardDetails, cvv: e.target.value })
                          }
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500 font-mono"
                          placeholder="888"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 cursor-pointer"
                  >
                    ← Back to Delivery
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-colors"
                  >
                    <span>Review Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & PLACE ORDER */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <h3 className="text-lg font-bold font-heading">4. Final Order Review</h3>

                {/* Shipping & Payment confirmation cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span>Shipping Address</span>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="text-orange-500 hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {shippingAddress.fullName}
                    </p>
                    <p className="text-slate-500">
                      {shippingAddress.street}, {shippingAddress.city}, {shippingAddress.state}{' '}
                      {shippingAddress.zipCode}
                    </p>
                    <p className="text-slate-400 mt-1">{shippingAddress.phone}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span>Payment & Speed</span>
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="text-orange-500 hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {paymentType === 'card' ? 'Credit Card (Visa)' : 'Cash on Delivery'}
                    </p>
                    <p className="text-slate-500">{deliveryMethod.title}</p>
                    <p className="text-slate-400 mt-1">{deliveryMethod.estimatedDelivery}</p>
                  </div>
                </div>

                {/* Items preview list */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Items in this Order ({items.length})
                  </h4>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto pr-1">
                    {items.map(item => (
                      <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.title}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {item.product.title}
                            </p>
                            <p className="text-[10px] text-slate-400">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold font-heading text-slate-900 dark:text-slate-100">
                          {formatCurrency(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final Place Order CTA */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 cursor-pointer"
                  >
                    ← Back to Payment
                  </button>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className="px-8 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-xl shadow-orange-500/25 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 disabled:opacity-50"
                  >
                    {isPlacingOrder ? (
                      <span>Authorizing & Placing Order...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        <span>Place Order • {formatCurrency(total + (deliveryMethod.price - shipping))}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Summary Column (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm sticky top-28 space-y-4">
              <h3 className="text-base font-bold font-heading text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-slate-800">
                Order Summary
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>
                      -{formatCurrency((subtotal * appliedCoupon.discountValue) / 100)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Shipping ({deliveryMethod.title.split(' ')[0]})</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {deliveryMethod.price === 0 ? (
                      <span className="text-emerald-600 font-bold uppercase">Free</span>
                    ) : (
                      formatCurrency(deliveryMethod.price)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(tax)}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">
                    Final Total
                  </span>
                  <span className="text-xl font-black text-orange-500 font-heading">
                    {formatCurrency(
                      subtotal +
                        deliveryMethod.price +
                        tax -
                        (appliedCoupon ? (subtotal * appliedCoupon.discountValue) / 100 : 0)
                    )}
                  </span>
                </div>
              </div>

              <div className="pt-3 text-[11px] text-slate-400 space-y-1.5 border-t border-slate-100 dark:border-slate-800">
                <p className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  30-day money-back guarantee
                </p>
                <p className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Authenticity verified by ShopNest
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
