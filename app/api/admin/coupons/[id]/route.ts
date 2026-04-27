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
    const {
      discountPercentage, maxDiscountAmount, minOrderAmount,
      usageLimit, validFrom, validUntil, isActive,
    } = await request.json()

    await execute(
      `UPDATE coupons SET
        discount_percentage = ?, max_discount_amount = ?, min_order_amount = ?,
        usage_limit = ?, valid_from = ?, valid_until = ?, is_active = ?
       WHERE id = ?`,
      [discountPercentage, maxDiscountAmount, minOrderAmount, usageLimit, validFrom, validUntil, isActive ? 1 : 0, id]
    )

    return NextResponse.json({ success: true, message: 'Coupon updated successfully' })
  } catch (error) {
    console.error('Update coupon error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update coupon' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    await execute('DELETE FROM coupons WHERE id = ?', [id])
    
    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' })
  } catch (error) {
    console.error('Delete coupon error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete coupon' },
      { status: 500 }
    )
  }
}
