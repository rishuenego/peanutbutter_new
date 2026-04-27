import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getOne, execute } from '@/lib/db'
import { sendOrderConfirmationEmail } from '@/lib/mail'
import { safeJsonParse } from '@/lib/utils'

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

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

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
        const shipping = typeof order.shipping_address === 'string' 
          ? JSON.parse(order.shipping_address) 
          : order.shipping_address
        if (shipping?.email) {
          sendOrderConfirmationEmail(shipping.email, order).catch(e => console.error(e))
        }
      }

      return NextResponse.json({
        success: true,
        order: order ? formatOrder(order) : null,
      })
    } else {
      return NextResponse.json(
        { success: false, message: 'Payment verification failed' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Verify payment error:', error)
    return NextResponse.json(
      { success: false, message: 'Payment verification failed' },
      { status: 500 }
    )
  }
}
