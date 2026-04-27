import { NextResponse } from 'next/server'
import { getMany } from '@/lib/db'

export async function GET() {
  try {
    const settings = await getMany<{ key_name: string; value: string }>(
      'SELECT * FROM settings'
    )

    const settingsObj: Record<string, number> = {}
    settings.forEach(s => {
      settingsObj[s.key_name] = parseFloat(s.value)
    })

    return NextResponse.json({
      success: true,
      settings: {
        freeShippingThreshold: settingsObj['free_shipping_threshold'] || 499,
        shippingCharge: settingsObj['shipping_charge'] || 49,
        codCharge: settingsObj['cod_charge'] || 0,
      },
    })
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}
