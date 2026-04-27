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
        freeShippingThreshold: settingsObj['free_shipping_threshold'] || 299,
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

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')

    if (!adminSession) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 401 }
      )
    }

    const { freeShippingThreshold, shippingCharge, codCharge } = await request.json()

    const updates = [
      { key: 'free_shipping_threshold', value: freeShippingThreshold },
      { key: 'shipping_charge', value: shippingCharge },
      { key: 'cod_charge', value: codCharge },
    ]

    for (const update of updates) {
      if (update.value !== undefined) {
        await execute(
          `INSERT INTO settings (key_name, value, updated_at)
           VALUES (?, ?, NOW())
           ON DUPLICATE KEY UPDATE value = ?, updated_at = NOW()`,
          [update.key, update.value.toString(), update.value.toString()]
        )
      }
    }

    return NextResponse.json({ success: true, message: 'Settings updated successfully' })
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
