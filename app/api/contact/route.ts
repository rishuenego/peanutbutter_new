import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { transporter } from '@/lib/mail'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await request.json()

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: 'Please fill in all required fields' },
        { status: 400 }
      )
    }

    // Save to database
    await execute(
      `INSERT INTO contact_messages (name, email, phone, subject, message, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, 0, NOW())`,
      [name, email, phone || null, subject, message]
    )

    // Send email notification
    if (process.env.SMTP_USER && process.env.CONTACT_EMAIL) {
      try {
        await transporter.sendMail({
          from: `"Nut Baba Contact" <${process.env.MAIL_USER || process.env.SMTP_USER}>`,
          to: process.env.CONTACT_EMAIL,
          subject: `New Contact Form Submission: ${subject}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          `,
        })
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to submit contact form' },
      { status: 500 }
    )
  }
}
