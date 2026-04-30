import express from 'express'
const { Router } = express
import { getOne } from '../config/db.js'

const router = Router()

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

// Validate coupon
router.post('/validate', async (req, res) => {
  try {
    const { code, orderAmount } = req.body

    const coupon = await getOne<CouponRow>(
      'SELECT * FROM coupons WHERE code = ? AND is_active = 1',
      [code.toUpperCase()]
    )

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' })
    }

    const now = new Date()
    const validFrom = new Date(coupon.valid_from)
    const validUntil = new Date(coupon.valid_until)

    if (now < validFrom) {
      return res.status(400).json({ success: false, message: 'Coupon is not yet active' })
    }

    if (now > validUntil) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' })
    }

    if (coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' })
    }

    if (orderAmount < coupon.min_order_amount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of RS. ${coupon.min_order_amount} required`,
      })
    }

    const discountAmount = Math.min(
      (orderAmount * coupon.discount_percentage) / 100,
      coupon.max_discount_amount
    )

    res.json({
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
    res.status(500).json({ success: false, message: 'Failed to validate coupon' })
  }
})

export default router
