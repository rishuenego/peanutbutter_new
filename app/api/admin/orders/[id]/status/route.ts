import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { cookies } from 'next/headers'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')

    if (!adminSession) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 401 }
      )
    }

    const { id } = await params
    const { status, trackingNumber } = await request.json()

    let sql = 'UPDATE orders SET order_status = ?, updated_at = NOW()'
    const sqlParams: unknown[] = [status]

    if (trackingNumber) {
      sql += ', tracking_number = ?'
      sqlParams.push(trackingNumber)
    }

    if (status === 'delivered') {
      sql += ', delivered_at = NOW(), payment_status = "paid"'
    }

    sql += ' WHERE id = ?'
    sqlParams.push(id)

    await execute(sql, sqlParams)

    return NextResponse.json({ success: true, message: 'Order status updated successfully' })
  } catch (error) {
    console.error('Update order status error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update order status' },
      { status: 500 }
    )
  }
}
