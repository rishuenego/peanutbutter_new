import express from 'express'
const { Router } = express
import type { Request, Response } from 'express'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { getMany, getOne, execute } from '../config/db.js'
import { isAuthenticated, type AuthenticatedRequest } from '../middleware/auth.js'
import { sendOrderConfirmationEmail } from '../utils/mail.js'

const router = Router()

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
})

interface OrderRow {
  id: number
  order_number: string
  user_id: number
  items: string
  subtotal: number
  discount_amount: number
  coupon_code: string | null
  shipping_charge: number
  total_amount: number
  payment_method: string
  payment_status: string
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  order_status: string
  shipping_address: string
  tracking_number: string | null
  estimated_delivery: Date | null
  delivered_at: Date | null
  notes: string | null
  created_at: Date
  updated_at: Date
}

interface SettingsRow {
  key_name: string
  value: string
}

function formatOrder(row: OrderRow) {
  const safeParseJSON = (data: any, fallback: any = []) => {
    if (!data) return fallback
    if (typeof data === 'object') return data
    try {
      return JSON.parse(data)
    } catch (e) {
      console.error('JSON Parse error:', e, 'Data:', data)
      return fallback
    }
  }

  return {
    id: row.id,
    orderNumber: row.order_number,
    userId: row.user_id,
    items: safeParseJSON(row.items, []),
    subtotal: row.subtotal,
    discountAmount: row.discount_amount,
    couponCode: row.coupon_code,
    shippingCharge: row.shipping_charge,
    totalAmount: row.total_amount,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    razorpayOrderId: row.razorpay_order_id,
    razorpayPaymentId: row.razorpay_payment_id,
    orderStatus: row.order_status,
    shippingAddress: safeParseJSON(row.shipping_address, {}),
    trackingNumber: row.tracking_number,
    estimatedDelivery: row.estimated_delivery,
    deliveredAt: row.delivered_at,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Create order
router.post('/', isAuthenticated, async (req: Request, res) => {
  try {
    const authReq = req as AuthenticatedRequest
    const { items, shippingAddress, paymentMethod: rawPaymentMethod, couponCode } = req.body
    const userId = authReq.user.id

    // Map 'online' to 'razorpay' to match database enum
    const paymentMethod = rawPaymentMethod === 'online' ? 'razorpay' : rawPaymentMethod


    // Basic validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or empty items list' })
    }

    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: 'Shipping address is required' })
    }

    // Calculate subtotal
    let subtotal = 0
    for (const item of items) {
      if (!item.productId) continue
      try {
        const product = await getOne<{ sale_price: number }>(
          'SELECT sale_price FROM products WHERE id = ?',
          [item.productId]
        )
        if (product) {
          subtotal += Number(product.sale_price) * (Number(item.quantity) || 1)
        }
      } catch (err) {
        console.error(`Error fetching product price for ID ${item.productId}:`, err)
      }
    }

    // Fallback if subtotal calculation failed
    if (subtotal === 0 && req.body.subtotal) {
      subtotal = Number(req.body.subtotal)
    }

    // Get shipping settings
    let freeShippingThreshold = 499
    let shippingChargeAmount = 49
    let codChargeAmount = 0

    try {
      const settings = await getMany<SettingsRow>('SELECT * FROM settings')
      const settingsMap: Record<string, number> = {}
      settings.forEach(s => {
        settingsMap[s.key_name] = parseFloat(s.value)
      })

      if (!isNaN(settingsMap['free_shipping_threshold'])) freeShippingThreshold = settingsMap['free_shipping_threshold']
      if (!isNaN(settingsMap['shipping_charge'])) shippingChargeAmount = settingsMap['shipping_charge']
      if (!isNaN(settingsMap['cod_charge'])) codChargeAmount = settingsMap['cod_charge']
    } catch (err) {
      console.warn('Failed to fetch settings, using defaults:', err)
    }

    // Calculate shipping
    let shippingCharge = subtotal >= freeShippingThreshold ? 0 : shippingChargeAmount
    if (paymentMethod === 'cod') {
      shippingCharge += codChargeAmount
    }

    // Apply coupon discount
    let discountAmount = 0
    if (couponCode) {
      try {
        const coupon = await getOne<{
          discount_percentage: number
          max_discount_amount: number
          min_order_amount: number
          usage_limit: number
          used_count: number
          valid_from: Date
          valid_until: Date
          is_active: number
        }>(
          'SELECT * FROM coupons WHERE code = ? AND is_active = 1',
          [couponCode]
        )

        if (coupon) {
          const now = new Date()
          if (
            now >= new Date(coupon.valid_from) &&
            now <= new Date(coupon.valid_until) &&
            subtotal >= coupon.min_order_amount &&
            coupon.used_count < coupon.usage_limit
          ) {
            discountAmount = Math.min(
              (subtotal * coupon.discount_percentage) / 100,
              Number(coupon.max_discount_amount)
            )

            // Increment usage count
            await execute('UPDATE coupons SET used_count = used_count + 1 WHERE code = ?', [couponCode])
          }
        }
      } catch (err) {
        console.error('Coupon validation error:', err)
      }
    }

    const totalAmount = subtotal - discountAmount + shippingCharge
    const orderNumber = `NB${Date.now().toString(36).toUpperCase()}${uuidv4().substring(0, 4).toUpperCase()}`

    // Create Razorpay order if not COD
    let razorpayOrderId = null
    if (paymentMethod !== 'cod') {
      try {
        const razorpayOrder = await razorpay.orders.create({
          amount: Math.round(totalAmount * 100), // Amount in paise
          currency: 'INR',
          receipt: orderNumber,
        })
        razorpayOrderId = razorpayOrder.id
      } catch (err) {
        console.error('Razorpay order creation failed:', err)
        return res.status(500).json({ success: false, message: 'Payment gateway error. Please try again later.' })
      }
    }

    // Insert order
    try {
      const result = await execute(
        `INSERT INTO orders (
          order_number, user_id, items, subtotal, discount_amount, coupon_code,
          shipping_charge, total_amount, payment_method, payment_status,
          razorpay_order_id, order_status, shipping_address, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          orderNumber,
          userId,
          JSON.stringify(items),
          subtotal,
          discountAmount,
          couponCode || null,
          shippingCharge,
          totalAmount,
          paymentMethod,
          'pending',
          razorpayOrderId,
          paymentMethod === 'cod' ? 'confirmed' : 'pending',
          JSON.stringify(shippingAddress),
        ]
      )

      const order = await getOne<OrderRow>('SELECT * FROM orders WHERE id = ?', [result.insertId])

      if (paymentMethod === 'cod' && order && shippingAddress?.email) {
        sendOrderConfirmationEmail(shippingAddress.email, order).catch(e => console.error('Confirmation email failed:', e));
      }

      res.json({
        success: true,
        order: order ? formatOrder(order) : null,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      })
    } catch (insertError) {
      console.error('Database insert failed for order:', insertError)
      res.status(500).json({ success: false, message: 'Failed to save order to database' })
    }
  } catch (error) {
    console.error('Create order error (Critical):', error)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

// Verify Razorpay payment
router.post('/verify-payment', isAuthenticated, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body.toString())
      .digest('hex')

    if (expectedSignature === razorpay_signature) {
      // Update order
      await execute(
        `UPDATE orders SET 
          payment_status = 'paid',
          razorpay_payment_id = ?,
          order_status = 'confirmed',
          updated_at = NOW()
         WHERE razorpay_order_id = ?`,
        [razorpay_payment_id, razorpay_order_id]
      )

      const order = await getOne<OrderRow>(
        'SELECT * FROM orders WHERE razorpay_order_id = ?',
        [razorpay_order_id]
      )

      if (order) {
        const shipping = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address;
        if (shipping?.email) {
          sendOrderConfirmationEmail(shipping.email, order).catch(e => console.error(e));
        }
      }

      res.json({
        success: true,
        order: order ? formatOrder(order) : null,
      })
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' })
    }
  } catch (error) {
    console.error('Verify payment error:', error)
    res.status(500).json({ success: false, message: 'Payment verification failed' })
  }
})

// Get user orders
router.get('/', isAuthenticated, async (req: Request, res) => {
  try {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user.id

    const orders = await getMany<OrderRow>(
      'SELECT * FROM orders WHERE user_id = ? AND (payment_method = "cod" OR payment_status = "paid") ORDER BY created_at DESC',
      [userId]
    )

    res.json({
      success: true,
      orders: orders.map(formatOrder),
    })
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch orders' })
  }
})

// Get single order
router.get('/:id', isAuthenticated, async (req: Request, res) => {
  try {
    const { id } = req.params
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user.id


    const order = await getOne<OrderRow>(
      'SELECT * FROM orders WHERE id = ? AND user_id = ? AND (payment_method = "cod" OR payment_status = "paid")',
      [id, userId]
    )

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    res.json({
      success: true,
      order: formatOrder(order),
    })
  } catch (error) {
    console.error('Get order error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch order' })
  }
})

export default router
