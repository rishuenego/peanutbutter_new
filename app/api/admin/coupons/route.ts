import { NextRequest, NextResponse } from 'next/server'
import { getMany, execute } from '@/lib/db'
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

    const coupons = await getMany<{
      id: number
      code: string
      discount_percentage: number
      max_discount_amount: number
      min_order_amount: number
      usage_limit: number
      used_count: number
      valid_from: Date
      valid_until: Date
      is_active: number
      created_at: Date
    }>('SELECT * FROM coupons ORDER BY created_at DESC')

    return NextResponse.json({
      success: true,
      coupons: coupons.map(c => ({
        id: c.id,
        code: c.code,
        discountPercentage: c.discount_percentage,
        maxDiscountAmount: c.max_discount_amount,
        minOrderAmount: c.min_order_amount,
        usageLimit: c.usage_limit,
        usedCount: c.used_count,
        validFrom: c.valid_from,
        validUntil: c.valid_until,
        isActive: Boolean(c.is_active),
        createdAt: c.created_at,
      })),
    })
  } catch (error) {
    console.error('Get coupons error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch coupons' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')

    if (!adminSession) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 401 }
      )
    }

    const {
      code, discountPercentage, maxDiscountAmount, minOrderAmount,
      usageLimit, validFrom, validUntil,
    } = await request.json()

    await execute(
      `INSERT INTO coupons (
        code, discount_percentage, max_discount_amount, min_order_amount,
        usage_limit, used_count, valid_from, valid_until, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, 0, ?, ?, 1, NOW())`,
      [
        code.toUpperCase(), discountPercentage, maxDiscountAmount, minOrderAmount,
        usageLimit, validFrom, validUntil,
      ]
    )

    return NextResponse.json({ success: true, message: 'Coupon created successfully' })
  } catch (error) {
    console.error('Create coupon error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create coupon' },
      { status: 500 }
    )
  }
}
