import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { v4 as uuidv4 } from 'uuid'
import { getMany, getOne, execute } from '@/lib/db'
import { cookies } from 'next/headers'
import { sendOrderConfirmationEmail } from '@/lib/mail'
import { safeJsonParse } from '@/lib/utils'

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
  return {
    id: row.id,
    orderNumber: row.order_number,
    userId: row.user_id,
    items: safeJsonParse(row.items, []),
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
    shippingAddress: safeJsonParse(row.shipping_address, {}),
    trackingNumber: row.tracking_number,
    estimatedDelivery: row.estimated_delivery,
    deliveredAt: row.delivered_at,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userSession = cookieStore.get('user_session')
    
    if (!userSession) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = JSON.parse(userSession.value)
    const orders = await getMany<OrderRow>(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [user.id]
    )

    return NextResponse.json({
      success: true,
      orders: orders.map(formatOrder),
    })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userSession = cookieStore.get('user_session')
    
    if (!userSession) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = JSON.parse(userSession.value)
    const { items, shippingAddress, paymentMethod, couponCode } = await request.json()

    // Calculate subtotal
    let subtotal = 0
    for (const item of items) {
      const product = await getOne<{ sale_price: number }>(
        'SELECT sale_price FROM products WHERE id = ?',
        [item.productId]
      )
      if (product) {
        subtotal += product.sale_price * item.quantity
      }
    }

    // Get shipping settings
    const settings = await getMany<SettingsRow>('SELECT * FROM settings')
    const settingsMap: Record<string, number> = {}
    settings.forEach(s => {
      settingsMap[s.key_name] = parseFloat(s.value)
    })

    const freeShippingThreshold = settingsMap['free_shipping_threshold'] || 299
    const shippingChargeAmount = settingsMap['shipping_charge'] || 49
    const codChargeAmount = settingsMap['cod_charge'] || 0

    // Calculate shipping
    let shippingCharge = subtotal >= freeShippingThreshold ? 0 : shippingChargeAmount
    if (paymentMethod === 'cod') {
      shippingCharge += codChargeAmount
    }

    // Apply coupon discount
    let discountAmount = 0
    if (couponCode) {
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
            coupon.max_discount_amount
          )

          // Increment usage count
          await execute('UPDATE coupons SET used_count = used_count + 1 WHERE code = ?', [couponCode])
        }
      }
    }

    const totalAmount = subtotal - discountAmount + shippingCharge
    const orderNumber = `NB${Date.now().toString(36).toUpperCase()}${uuidv4().substring(0, 4).toUpperCase()}`

    // Create Razorpay order if not COD
    let razorpayOrderId = null
    if (paymentMethod !== 'cod') {
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        receipt: orderNumber,
      })
      razorpayOrderId = razorpayOrder.id
    }

    // Insert order
    const result = await execute(
      `INSERT INTO orders (
        order_number, user_id, items, subtotal, discount_amount, coupon_code,
        shipping_charge, total_amount, payment_method, payment_status,
        razorpay_order_id, order_status, shipping_address, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        orderNumber,
        user.id,
        JSON.stringify(items),
        subtotal,
        discountAmount,
        couponCode || null,
        shippingCharge,
        totalAmount,
        paymentMethod,
        paymentMethod === 'cod' ? 'pending' : 'pending',
        razorpayOrderId,
        paymentMethod === 'cod' ? 'confirmed' : 'pending',
        JSON.stringify(shippingAddress),
      ]
    )

    const order = await getOne<OrderRow>('SELECT * FROM orders WHERE id = ?', [result.insertId])

    if (paymentMethod === 'cod' && order && shippingAddress?.email) {
      sendOrderConfirmationEmail(shippingAddress.email, order).catch(e => console.error(e))
    }

    return NextResponse.json({
      success: true,
      order: order ? formatOrder(order) : null,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create order' },
      { status: 500 }
    )
  }
}
