export interface Product {
  id: number
  name: string
  slug: string
  description: string
  shortDescription: string
  category: string
  texture: 'smooth' | 'crunchy'
  mrpPrice: number
  salePrice: number
  discountPercentage: number
  weightOptions: { size: string; mrp: number; salePrice: number }[]
  images: string[]
  manufacturer: string
  productType: string
  dimensions: string
  isFeatured: boolean
  isBestseller: boolean
  stockStatus: 'in_stock' | 'out_of_stock'
  stockQuantity: number
  rating: number
  reviewCount: number
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  product: Product
  quantity: number
  selectedWeight: string
  selectedTexture: string
}

export interface User {
  id: number
  googleId: string
  email: string
  name: string
  phone?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  createdAt: string
}

export interface Admin {
  id: number
  username: string
  email: string
  role: 'super_admin' | 'admin'
}

export interface Order {
  id: number
  orderNumber: string
  userId: number
  items: OrderItem[]
  subtotal: number
  discountAmount: number
  couponCode?: string
  shippingCharge: number
  totalAmount: number
  paymentMethod: 'razorpay' | 'upi' | 'cod'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  razorpayOrderId?: string
  razorpayPaymentId?: string
  orderStatus: OrderStatus
  shippingAddress: ShippingAddress
  trackingNumber?: string
  estimatedDelivery?: string
  deliveredAt?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'

export interface OrderItem {
  productId: number
  productName: string
  quantity: number
  price: number
  weight: string
  texture: string
  image: string
}

export interface ShippingAddress {
  name: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  pincode: string
}

export interface Coupon {
  id: number
  code: string
  discountPercentage: number
  maxDiscountAmount: number
  minOrderAmount: number
  usageLimit: number
  usedCount: number
  validFrom: string
  validUntil: string
  isActive: boolean
  createdAt: string
}

export interface Settings {
  freeShippingThreshold: number
  shippingCharge: number
  codCharge: number
}

export interface ContactMessage {
  id: number
  name: string
  email: string
  phone: string
  subject: string
  message: string
  isRead: boolean
  createdAt: string
}

export interface NewsletterSubscriber {
  id: number
  email: string
  subscribedAt: string
}

export interface Review {
  id: number
  name: string
  location: string
  rating: number
  comment: string
  isVerified: boolean
  avatar?: string
}
