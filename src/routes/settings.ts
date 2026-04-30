import express from 'express'
const { Router } = express
import { getMany } from '../config/db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const settings = await getMany<{ key_name: string; value: string }>(
      'SELECT * FROM settings'
    )

    const settingsObj: Record<string, number> = {}
    settings.forEach(s => {
      settingsObj[s.key_name] = parseFloat(s.value)
    })

    res.json({
      success: true,
      settings: {
        freeShippingThreshold: settingsObj['free_shipping_threshold'] || 499,
        shippingCharge: settingsObj['shipping_charge'] || 49,
        codCharge: settingsObj['cod_charge'] || 0,
      },
    })
  } catch (error) {
    console.error('Get settings error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch settings' })
  }
})

export default router
