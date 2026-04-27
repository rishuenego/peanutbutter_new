import { NextRequest, NextResponse } from 'next/server'
import { getOne } from '@/lib/db'

interface CouponRow {
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
}

export async function POST(request: NextRequest) {
  try {
    const { code, orderAmount } = await request.json()

    const coupon = await getOne<CouponRow>(
      'SELECT * FROM coupons WHERE code = ? AND is_active = 1',
      [code.toUpperCase()]
    )

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: 'Invalid coupon code' },
        { status: 404 }
      )
    }

    const now = new Date()
    const validFrom = new Date(coupon.valid_from)
    const validUntil = new Date(coupon.valid_until)

    if (now < validFrom) {
      return NextResponse.json(
        { success: false, message: 'Coupon is not yet active' },
        { status: 400 }
      )
    }

    if (now > validUntil) {
      return NextResponse.json(
        { success: false, message: 'Coupon has expired' },
        { status: 400 }
      )
    }

    if (coupon.used_count >= coupon.usage_limit) {
      return NextResponse.json(
        { success: false, message: 'Coupon usage limit reached' },
        { status: 400 }
      )
    }

    if (orderAmount < coupon.min_order_amount) {
      return NextResponse.json(
        { success: false, message: `Minimum order amount of RS. ${coupon.min_order_amount} required` },
        { status: 400 }
      )
    }

    const discountAmount = Math.min(
      (orderAmount * coupon.discount_percentage) / 100,
      coupon.max_discount_amount
    )

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountPercentage: coupon.discount_percentage,
        discountAmount: discountAmount,
        minOrderAmount: coupon.min_order_amount,
        maxDiscountAmount: coupon.max_discount_amount,
        message: `${coupon.discount_percentage}% discount applied!`,
      },
    })
  } catch (error) {
    console.error('Validate coupon error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to validate coupon' },
      { status: 500 }
    )
  }
}
