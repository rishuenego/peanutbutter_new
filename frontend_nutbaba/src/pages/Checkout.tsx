import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, getApiUrl } from '../utils';

const API_URL = getApiUrl();
import { CreditCard, Banknote } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}



interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart, appliedCoupon, applyCoupon, removeCoupon, shippingConfig } = useCart();
  const { user, loading } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    streetAddress: '',
    apartment: '',
    city: '',
    country: 'India',
    postalCode: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Prefill user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [user, loading, navigate]);

  // Redirect to cart if empty
  useEffect(() => {
    if (!loading && items.length === 0) {
      navigate('/cart');
    }
  }, [items, loading, navigate]);

  const subtotal = getCartTotal();
  const shippingThreshold = shippingConfig?.freeShippingThreshold ?? 499;
  const shippingCharge = subtotal >= shippingThreshold ? 0 : (shippingConfig?.shippingCharge ?? 49);

  // Calculate discount taking max limit into account
  let discountAmount = 0;
  if (appliedCoupon) {
    const rawDiscount = (subtotal * appliedCoupon.discountPercentage) / 100;
    discountAmount = appliedCoupon.maxDiscountAmount
      ? Math.min(rawDiscount, appliedCoupon.maxDiscountAmount)
      : rawDiscount;
  }

  const total = subtotal - discountAmount + shippingCharge;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number';
    if (!formData.streetAddress.trim()) newErrors.streetAddress = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!/^\d{6}$/.test(formData.postalCode)) newErrors.postalCode = 'Invalid postal code';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    setCouponError('');

    try {
const response = await fetch(`${API_URL}/coupons/validate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ code: couponCode, orderAmount: subtotal })
});
      const data = await response.json();

      if (data.success) {
        applyCoupon({
          code: data.coupon.code,
          discountPercentage: data.coupon.discountPercentage,
          discountAmount: data.coupon.discountAmount,
          minOrderAmount: data.coupon.minOrderAmount,
          maxDiscountAmount: data.coupon.maxDiscountAmount,
        });
        setCouponError('');
      } else {
        setCouponError(data.message || 'Invalid coupon code');
      }
    } catch {
      setCouponError('Failed to validate coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    removeCoupon();
    setCouponError('');
  };

  const createOrder = async () => {
    const orderData = {
      items: items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.salePrice,
        quantity: item.quantity,
        size: item.selectedWeight,
        texture: item.selectedTexture,
        slug: item.product.slug,
        image: item.product.images?.[0] || '/images/products/dark-chocolate-1.jpg',
      })),
      shippingAddress: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        streetAddress: formData.streetAddress,
        apartment: formData.apartment,
        city: formData.city,
        country: formData.country,
        postalCode: formData.postalCode,
        notes: formData.notes,
      },
      subtotal,
      shippingCharge,
      couponCode: appliedCoupon?.code || '',
      couponDiscount: appliedCoupon?.discountPercentage || 0,
      discountAmount,
      total,
      paymentMethod,
    };

const response = await fetch(`${API_URL}/orders`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify(orderData),
});

    if (!response.ok) throw new Error('Failed to create order');
    return response.json();
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      const { success, order, razorpayKeyId } = await createOrder();

      if (!success || !order) {
        throw new Error('Failed to create order record');
      }

      if (paymentMethod === 'online') {
        const options: RazorpayOptions = {
          key: razorpayKeyId,
          amount: Math.round(order.totalAmount * 100),
          currency: 'INR',
          name: 'Nut Baba',
          description: 'Purchase Payment',
          order_id: order.razorpayOrderId,
          handler: async (response: RazorpayResponse) => {
            try {
await fetch(`${API_URL}/orders/verify-payment`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });
              clearCart();
              navigate('/orders', { state: { orderId: order.id, success: true } });
            } catch (err) {
              console.error('Verification failed', err);
              alert('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: '#C45C26',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // COD
        clearCart();
        navigate('/orders', { state: { orderId: order.id, success: true } });
      }
    } catch (error) {
      console.error('Order failed:', error);
      alert('Something went wrong while processing your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FDF6ED' }}>
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user || items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: '#FDF6ED', fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1
            className="text-4xl md:text-5xl mb-2"
            style={{
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
              color: '#1a1a2e'
            }}
          >
            Checkout
          </h1>
          <div className="w-16 h-1 mx-auto mb-4" style={{ backgroundColor: '#C45C26' }}></div>
          <p className="text-gray-500 italic">Complete your order information</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-3 space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                <h2
                  className="text-xl md:text-2xl mb-6"
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontStyle: 'italic',
                    color: '#1a1a2e'
                  }}
                >
                  Contact Information
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.firstName ? 'border-red-500' : 'border-gray-200'
                        }`}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.lastName ? 'border-red-500' : 'border-gray-200'
                        }`}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="10-digit mobile number"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.phone ? 'border-red-500' : 'border-gray-200'
                        }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.email ? 'border-red-500' : 'border-gray-200'
                        }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                <h2
                  className="text-xl md:text-2xl mb-6"
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontStyle: 'italic',
                    color: '#1a1a2e'
                  }}
                >
                  Shipping Address
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="streetAddress"
                      value={formData.streetAddress}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.streetAddress ? 'border-red-500' : 'border-gray-200'
                        }`}
                    />
                    {errors.streetAddress && (
                      <p className="text-red-500 text-sm mt-1">{errors.streetAddress}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Apartment/Suite <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.city ? 'border-red-500' : 'border-gray-200'
                          }`}
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        maxLength={6}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.postalCode ? 'border-red-500' : 'border-gray-200'
                          }`}
                      />
                      {errors.postalCode && (
                        <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Any special instructions for delivery..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                <h2
                  className="text-xl md:text-2xl mb-6"
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontStyle: 'italic',
                    color: '#1a1a2e'
                  }}
                >
                  Payment Method
                </h2>

                <div className="space-y-4">
                  <label className="flex items-start gap-4 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                      className="w-5 h-5 mt-0.5 accent-orange-500"
                    />
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <div>
                        <span className="font-medium text-gray-800">Online Payment / UPI</span>
                        <span className="text-gray-500 text-sm ml-2">(Pay securely via UPI, Cards, or Netbanking)</span>
                      </div>
                    </div>
                  </label>



                  <label className="flex items-start gap-4 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="w-5 h-5 mt-0.5 accent-orange-500"
                    />
                    <div className="flex items-center gap-2">
                      <Banknote className="w-5 h-5 text-green-600" />
                      <div>
                        <span className="font-medium text-gray-800">Cash on Delivery</span>
                        <span className="text-gray-500 text-sm ml-2">(Pay when you receive your order)</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Payment Information */}
              {paymentMethod === 'online' && (
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#C45C26' }}>
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3
                        className="font-medium text-lg"
                        style={{
                          fontFamily: 'Georgia, serif',
                          fontStyle: 'italic',
                          color: '#1a1a2e'
                        }}
                      >
                        Payment Information
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">
                        Secure online payment via Razorpay. Your payment information is encrypted and safe.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Pay Now / Order Now Button */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 rounded-lg text-white font-medium text-lg transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#B91C1C' }}
                >
                  {isProcessing ? 'Processing...' : paymentMethod === 'cod' ? 'Order Now' : 'Pay Now'}
                </button>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm sticky top-24">
                <h2
                  className="text-xl md:text-2xl mb-6"
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontStyle: 'italic',
                    color: '#1a1a2e'
                  }}
                >
                  Order Summary
                </h2>

                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.selectedWeight}-${item.selectedTexture}`}
                      className="flex gap-4"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.images?.[0] || '/images/products/dark-chocolate-1.jpg'}
                          alt={item.product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 text-sm">{item.product.name}</h4>
                        <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{formatPrice(item.product.salePrice * item.quantity)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code */}
                <div className="border-t border-gray-100 pt-6 mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">Have a promo code?</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="ENTER CODE"
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm uppercase"
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="px-4 py-3 text-red-500 hover:text-red-600 font-medium text-sm"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon}
                        className="px-6 py-3 text-white rounded-lg transition-colors disabled:opacity-50 text-sm"
                        style={{ backgroundColor: '#6B7280' }}
                      >
                        {isApplyingCoupon ? '...' : 'Apply'}
                      </button>
                    )}
                  </div>
                  {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}
                  {appliedCoupon && (
                    <p className="text-green-600 text-sm mt-2">
                      Coupon applied! {appliedCoupon.discountPercentage}% off
                    </p>
                  )}
                </div>

                {/* Summary */}
                <div className="space-y-3 border-t border-gray-100 pt-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedCoupon.discountPercentage}%)</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-green-600">
                    <span>Free Shipping</span>
                    <span>{formatPrice(shippingCharge)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>No Additional Charges</span>
                    <span>{formatPrice(0)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-4">
                    <span>Total</span>
                    <span style={{ color: '#16A34A' }}>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
