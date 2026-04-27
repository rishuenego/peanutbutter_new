import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')

    if (adminSession) {
      try {
        const admin = JSON.parse(adminSession.value)
        return NextResponse.json({
          success: true,
          authenticated: true,
          admin,
        })
      } catch {
        // Invalid session
      }
    }

    return NextResponse.json({
      success: true,
      authenticated: false,
    })
  } catch (error) {
    console.error('Admin auth check error:', error)
    return NextResponse.json({
      success: true,
      authenticated: false,
    })
  }
}
