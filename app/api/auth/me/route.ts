import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userSession = cookieStore.get('user_session')
    const adminSession = cookieStore.get('admin_session')

    if (userSession) {
      try {
        const user = JSON.parse(userSession.value)
        return NextResponse.json({
          success: true,
          user,
        })
      } catch {
        // Invalid session
      }
    }

    if (adminSession) {
      try {
        const admin = JSON.parse(adminSession.value)
        return NextResponse.json({
          success: true,
          admin,
        })
      } catch {
        // Invalid session
      }
    }

    return NextResponse.json({ success: true, user: null, admin: null })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ success: true, user: null, admin: null })
  }
}
