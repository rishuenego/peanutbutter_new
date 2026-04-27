import { NextRequest, NextResponse } from 'next/server'
import { getMany } from '@/lib/db'
import { cookies } from 'next/headers'
import { safeJsonParse } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')

    if (!adminSession) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let sql = `
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
    `
    const params: unknown[] = []

    if (status) {
      sql += ' WHERE o.order_status = ?'
      params.push(status)
    }

    sql += ' ORDER BY o.created_at DESC'

    const orders = await getMany<{
      id: number
      order_number: string
      user_id: number
      user_name: string
      user_email: string
      items: string
      subtotal: number
      discount_amount: number
      coupon_code: string | null
      shipping_charge: number
      total_amount: number
      payment_method: string
      payment_status: string
      order_status: string
      shipping_address: string
      tracking_number: string | null
      created_at: Date
    }>(sql, params)

    return NextResponse.json({
      success: true,
      orders: orders.map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        userId: o.user_id,
        userName: o.user_name,
        userEmail: o.user_email,
        items: safeJsonParse(o.items, []),
        subtotal: o.subtotal,
        discountAmount: o.discount_amount,
        couponCode: o.coupon_code,
        shippingCharge: o.shipping_charge,
        totalAmount: o.total_amount,
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_status,
        orderStatus: o.order_status,
        shippingAddress: safeJsonParse(o.shipping_address, {}),
        trackingNumber: o.tracking_number,
        createdAt: o.created_at,
      })),
    })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
