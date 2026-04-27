import { NextRequest, NextResponse } from 'next/server'
import { getOne, execute } from '@/lib/db'
import { sendWelcomeNewsletterEmail } from '@/lib/mail'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if already subscribed
    const existing = await getOne<{ id: number }>(
      'SELECT id FROM newsletter_subscribers WHERE email = ?',
      [email]
    )

    if (existing) {
      return NextResponse.json({ success: true, message: 'You are already subscribed!' })
    }

    // Save to database
    await execute(
      'INSERT INTO newsletter_subscribers (email, subscribed_at) VALUES (?, NOW())',
      [email]
    )

    // Send Welcome Email
    try {
      await sendWelcomeNewsletterEmail(email)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing to our newsletter!',
    })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}
