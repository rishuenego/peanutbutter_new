import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access')
    }
    return Promise.reject(error)
  }
)

export default api

// Product APIs
export const productApi = {
  getAll: (params?: { category?: string; texture?: string; featured?: boolean }) =>
    api.get('/products', { params }),
  getFeatured: () => api.get('/products/featured'),
  getBestsellers: () => api.get('/products/bestsellers'),
  getBySlug: (slug: string) => api.get(`/products/${slug}`),
}

// Order APIs
export const orderApi = {
  create: (data: {
    items: Array<{
      productId: number
      quantity: number
      weight: string
      texture: string
    }>
    shippingAddress: {
      name: string
      phone: string
      email: string
      address: string
      city: string
      state: string
      pincode: string
    }
    paymentMethod: 'razorpay' | 'upi' | 'cod'
    couponCode?: string
  }) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getById: (id: number) => api.get(`/orders/${id}`),
  verifyPayment: (data: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
  }) => api.post('/orders/verify-payment', data),
}

// Coupon APIs
export const couponApi = {
  validate: (code: string, orderAmount: number) =>
    api.post('/coupons/validate', { code, orderAmount }),
}

// Contact APIs
export const contactApi = {
  submit: (data: {
    name: string
    email: string
    phone: string
    subject: string
    message: string
  }) => api.post('/contact', data),
  subscribeNewsletter: (email: string) =>
    api.post('/contact/newsletter', { email }),
}

// Admin APIs
export const adminApi = {
  login: (username: string, password: string) =>
    api.post('/admin/login', { username, password }),
  logout: () => api.post('/admin/logout'),
  getDashboard: () => api.get('/admin/dashboard'),

  // Products
  getProducts: () => api.get('/admin/products'),
  createProduct: (data: FormData) =>
    api.post('/admin/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateProduct: (id: number, data: FormData) =>
    api.put(`/admin/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteProduct: (id: number) => api.delete(`/admin/products/${id}`),

  // Orders
  getOrders: (params?: { status?: string }) =>
    api.get('/admin/orders', { params }),
  updateOrderStatus: (id: number, status: string, trackingNumber?: string) =>
    api.put(`/admin/orders/${id}/status`, { status, trackingNumber }),

  // Coupons
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data: {
    code: string
    discountPercentage: number
    maxDiscountAmount: number
    minOrderAmount: number
    usageLimit: number
    validFrom: string
    validUntil: string
  }) => api.post('/admin/coupons', data),
  updateCoupon: (id: number, data: Partial<{
    discountPercentage: number
    maxDiscountAmount: number
    minOrderAmount: number
    usageLimit: number
    validFrom: string
    validUntil: string
    isActive: boolean
  }>) => api.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id: number) => api.delete(`/admin/coupons/${id}`),

  // Users
  getUsers: () => api.get('/admin/users'),

  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data: {
    freeShippingThreshold?: number
    shippingCharge?: number
    codCharge?: number
  }) => api.put('/admin/settings', data),
}
