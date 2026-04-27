import { NextResponse } from 'next/server'
import { getMany } from '@/lib/db'
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

    const users = await getMany<{
      id: number
      google_id: string
      email: string
      name: string
      phone: string | null
      address: string | null
      city: string | null
      state: string | null
      pincode: string | null
      created_at: Date
    }>('SELECT * FROM users ORDER BY created_at DESC')

    return NextResponse.json({
      success: true,
      users: users.map(u => ({
        id: u.id,
        googleId: u.google_id,
        email: u.email,
        name: u.name,
        phone: u.phone,
        address: u.address,
        city: u.city,
        state: u.state,
        pincode: u.pincode,
        createdAt: u.created_at,
      })),
    })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
