import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatPrice, getApiUrl } from '../utils'

const API_URL = getApiUrl()
import { CartItem } from '../types'

const Cart = () => {
  const { items, removeFromCart, updateQuantity, getCartTotal, clearCart, appliedCoupon, applyCoupon, removeCoupon, shippingConfig } = useCart()
  const { user, loading } = useAuth()
  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState('')
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { state: { from: '/cart' } })
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF7EE]">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!user) return null

  const getItemPrices = (item: CartItem) => {
    const options = item.product.weightOptions as any[]
    const option = Array.isArray(options) ? options.find(o => o.size === item.selectedWeight) : null
    return {
      sale: option ? Number(option.salePrice) : Number(item.product.salePrice),
      mrp: option ? Number(option.mrp) : Number(item.product.mrpPrice)
    }
  }

  const subtotal = getCartTotal()
  const shippingThreshold = shippingConfig?.freeShippingThreshold ?? 499
  const shippingCharge = subtotal >= shippingThreshold ? 0 : (shippingConfig?.shippingCharge ?? 49)

  // Calculate discount taking max limit into account
  let discountAmount = 0
  if (appliedCoupon) {
    const rawDiscount = (subtotal * appliedCoupon.discountPercentage) / 100
    discountAmount = appliedCoupon.maxDiscountAmount
      ? Math.min(rawDiscount, appliedCoupon.maxDiscountAmount)
      : rawDiscount
  }

  const total = subtotal - discountAmount + shippingCharge

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setIsApplyingCoupon(true)
    setCouponError('')
    try {
const response = await fetch(`${API_URL}/coupons/validate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ code: couponCode, orderAmount: subtotal })
      })
      const data = await response.json()
      if (data.success) {
        applyCoupon({
          code: data.coupon.code,
          discountPercentage: data.coupon.discountPercentage,
          discountAmount: data.coupon.discountAmount,
          minOrderAmount: data.coupon.minOrderAmount,
          maxDiscountAmount: data.coupon.maxDiscountAmount,
        })
      } else {
        setCouponError(data.message || 'Invalid coupon code')
      }
    } catch {
      setCouponError('Failed to validate coupon')
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-16 bg-[#FDF7EE]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-[32px] p-12 shadow-sm border border-orange-100/50">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-[#CE6A24]" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Cart is Empty</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Looks like you haven&apos;t added any delicious products to your cart yet.</p>
            <Link to="/shop" className="inline-block bg-[#CE6A24] text-white px-10 py-3 rounded-full font-bold transition-all hover:bg-[#B1561E] shadow-lg shadow-orange-900/10">Start Shopping</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 bg-[#FDF7EE]">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-10 text-gray-800">Your Cart</h1>
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const prices = getItemPrices(item)
              return (
                <div key={`${item.product.id}-${item.selectedWeight}-${item.selectedTexture}`} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-orange-50 flex gap-4 md:gap-6">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
                    <img src={item.product.images?.[0] || '/images/products/default.jpg'} alt={item.product.name} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="font-bold text-gray-800 text-lg leading-tight">{item.product.name}</h3>
                        <button onClick={() => removeFromCart(item.product.id, item.selectedWeight, item.selectedTexture)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                      </div>
                      <p className="text-xs font-bold text-[#CE6A24] mt-1 uppercase tracking-wider">
                        {typeof item.selectedWeight === 'object' ? (item.selectedWeight as any).size : item.selectedWeight} • {item.selectedTexture}
                      </p>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                        <button onClick={() => updateQuantity(item.product.id, item.selectedWeight, item.selectedTexture, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#CE6A24]"><Minus className="w-4 h-4" /></button>
                        <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.selectedWeight, item.selectedTexture, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#CE6A24]"><Plus className="w-4 h-4" /></button>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-xl text-gray-900">{formatPrice(prices.sale * item.quantity)}</div>
                        {prices.mrp > prices.sale && <div className="text-xs text-gray-400 line-through">{formatPrice(prices.mrp * item.quantity)}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            <button onClick={clearCart} className="text-gray-400 hover:text-red-500 font-bold text-xs uppercase tracking-widest pl-2">Clear entire cart</button>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-[32px] p-8 shadow-md border border-orange-50 sticky top-24">
              <h2 className="text-xl font-bold mb-8 text-gray-800">Order Summary</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center"><span className="text-gray-500 text-sm">Subtotal</span><span className="font-bold text-gray-900">{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-500 text-sm">Shipping</span><span>{shippingCharge === 0 ? <span className="text-green-600 font-bold text-sm tracking-widest uppercase">Free</span> : <span className="font-bold text-gray-900">{formatPrice(shippingCharge)}</span>}</span></div>
                {appliedCoupon && <div className="flex justify-between items-center text-green-600"><span className="text-sm">Coupon ({appliedCoupon.code})</span><span className="font-bold">-{formatPrice(discountAmount)}</span></div>}

                <div className="relative mt-6 pt-6 border-t border-gray-100">
                  <div className="flex gap-2">
                    <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="COUPON CODE" className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-bold tracking-widest focus:ring-1 focus:ring-orange-500" />
                    <button
                      onClick={() => {
                        if (appliedCoupon) {
                          removeCoupon();
                          setCouponCode('');
                          setCouponError('');
                        } else {
                          handleApplyCoupon();
                        }
                      }}
                      disabled={isApplyingCoupon && !appliedCoupon}
                      className="bg-gray-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                    >
                      {appliedCoupon ? 'Clear' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-red-500 text-xs font-bold mt-2 ml-1">{couponError}</p>}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 mb-8 flex justify-between items-end">
                <span className="text-gray-800 font-bold">Total Amount</span>
                <span className="text-2xl font-black text-[#CE6A24]">{formatPrice(total)}</span>
              </div>

              <button onClick={() => navigate('/checkout')} className="w-full bg-[#CE6A24] text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-900/10 hover:bg-[#B1561E] transition-all transform active:scale-[0.98]">Proceed to Checkout</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
