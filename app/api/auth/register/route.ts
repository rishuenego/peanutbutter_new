import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getOne, execute } from '@/lib/db'
import { cookies } from 'next/headers'

interface User {
  id: number
  email: string
  name: string
}

export async function POST(request: NextRequest) {
  try {
    const { name, lastName, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await getOne<User>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const fullName = lastName ? `${name} ${lastName}` : name
    const result = await execute(
      `INSERT INTO users (email, name, password, created_at, updated_at)
       VALUES (?, ?, ?, NOW(), NOW())`,
      [email, fullName, hashedPassword]
    )

    const newUser = await getOne<User>('SELECT * FROM users WHERE id = ?', [result.insertId])

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set('user_session', JSON.stringify({
      id: newUser!.id,
      email: newUser!.email,
      name: newUser!.name,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: newUser!.id,
        email: newUser!.email,
        name: newUser!.name,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Registration failed' },
      { status: 500 }
    )
  }
}
