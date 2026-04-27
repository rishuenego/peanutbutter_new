import { NextRequest, NextResponse } from 'next/server'
import { getOne } from '@/lib/db'
import { cookies } from 'next/headers'

interface AdminRow {
  id: number
  username: string
  email: string
  password_hash: string
  role: 'super_admin' | 'admin'
}

// Simple token store (in production, use Redis or database)
const adminTokens = new Map<string, {
  id: number
  username: string
  email: string
  role: 'super_admin' | 'admin'
  expiresAt: number
}>()

export function generateAdminToken(admin: { id: number; username: string; email: string; role: 'super_admin' | 'admin' }): string {
  const token = `admin_${admin.id}_${Date.now()}_${Math.random().toString(36).substring(2)}`
  adminTokens.set(token, {
    ...admin,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  })
  return token
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    const admin = await getOne<AdminRow>(
      'SELECT * FROM admins WHERE username = ? OR email = ?',
      [username, username]
    )

    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Simple password comparison (password stored as plain text in password_hash column)
    if (admin.password_hash !== password) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate token
    const token = generateAdminToken({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
    })

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set('admin_session', JSON.stringify({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    )
  }
}
