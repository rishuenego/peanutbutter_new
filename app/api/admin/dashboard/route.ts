import { NextResponse } from 'next/server'
import { getOne, getMany } from '@/lib/db'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')

    if (!adminSession) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 401 }
      )
    }

    const [
      totalOrders,
      pendingOrders,
      totalRevenue,
      totalUsers,
      totalProducts,
      recentOrders,
    ] = await Promise.all([
      getOne<{ count: number }>('SELECT COUNT(*) as count FROM orders'),
      getOne<{ count: number }>('SELECT COUNT(*) as count FROM orders WHERE order_status = "pending"'),
      getOne<{ total: number }>('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = "paid"'),
      getOne<{ count: number }>('SELECT COUNT(*) as count FROM users'),
      getOne<{ count: number }>('SELECT COUNT(*) as count FROM products'),
      getMany<{
        id: number
        order_number: string
        total_amount: number
        order_status: string
        created_at: Date
      }>('SELECT id, order_number, total_amount, order_status, created_at FROM orders ORDER BY created_at DESC LIMIT 10'),
    ])

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders: totalOrders?.count || 0,
        pendingOrders: pendingOrders?.count || 0,
        totalRevenue: totalRevenue?.total || 0,
        totalUsers: totalUsers?.count || 0,
        totalProducts: totalProducts?.count || 0,
      },
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        totalAmount: o.total_amount,
        orderStatus: o.order_status,
        createdAt: o.created_at,
      })),
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to load dashboard' },
      { status: 500 }
    )
  }
}
