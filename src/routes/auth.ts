import express from 'express'
const { Router } = express
import type { Request, Response } from 'express'
import passport from 'passport'
import bcrypt from 'bcryptjs'
import { isAuthenticated, type AuthenticatedRequest } from '../middleware/auth.js'
import { getOne, execute } from '../config/db.js'
import { sendForgotPasswordOTPEmail } from '../utils/mail.js'

// OTP storage (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expires: number }>()

const router = Router()

interface User {
  id: number
  google_id?: string
  email: string
  name: string
  password?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  created_at: Date
  updated_at: Date
}

// Register with email/password
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, lastName, email: rawEmail, password, phone } = req.body
    const email = rawEmail ? rawEmail.toLowerCase() : ''

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
      })
    }

    // Check if user already exists
    const existingUser = await getOne<User>(
      'SELECT * FROM users WHERE LOWER(email) = ?',
      [email]
    )

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const fullName = lastName ? `${name} ${lastName}` : name
    const result = await execute(
      `INSERT INTO users (email, name, password, phone, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [email, fullName, hashedPassword, phone || null]
    )

    const newUser = await getOne<User>('SELECT * FROM users WHERE id = ?', [
      result.insertId,
    ])

    // Log in the user
    req.login(newUser as Express.User, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Registration successful but login failed'
        })
      }

      res.json({
        success: true,
        message: 'Registration successful',
        user: {
          id: newUser!.id,
          email: newUser!.email,
          name: newUser!.name,
          phone: newUser!.phone,
        },
      })
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ success: false, message: 'Registration failed' })
  }
})

// Login with email/password
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email: rawEmail, password } = req.body
    const email = rawEmail ? rawEmail.toLowerCase() : ''

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      })
    }

    // Find user
    const user = await getOne<User>(
      'SELECT * FROM users WHERE LOWER(email) = ?',
      [email]
    )

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Check if user has password (not Google-only user)
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'Please login with Google for this account'
      })
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Log in the user
    req.login(user as Express.User, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Login failed'
        })
      }

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          address: user.address,
          city: user.city,
          state: user.state,
          pincode: user.pincode,
        },
      })
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, message: 'Login failed' })
  }
})

// Google OAuth login
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}))

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login?error=auth_failed',
  }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173')
  }
)

// Get current user
router.get('/me', (req: Request, res) => {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        google_id: req.user.google_id,
        has_password: !!req.user?.password,
        phone: req.user.phone,
        address: req.user.address,
        city: req.user.city,
        state: req.user.state,
        pincode: req.user.pincode,
      },
    })
  } else if (req.session && req.session.admin) {
    res.json({
      success: true,
      admin: req.session.admin,
    })
  } else {
    res.json({ success: true, user: null, admin: null })
  }
})

// Logout
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err)
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error('Session destroy error:', destroyErr)
      }
      res.clearCookie('connect.sid')
      res.json({ success: true, message: 'Logged out successfully' })
    })
  })
})

// Update user profile
router.put('/profile', isAuthenticated, async (req: Request, res) => {
  const authReq = req as AuthenticatedRequest
  const { phone, address, city, state, pincode } = req.body
  const userId = authReq.user.id


  try {
    await execute(
      `UPDATE users SET phone = ?, address = ?, city = ?, state = ?, pincode = ?, updated_at = NOW()
       WHERE id = ?`,
      [phone, address, city, state, pincode, userId]
    )

    res.json({ success: true, message: 'Profile updated successfully' })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ success: false, message: 'Failed to update profile' })
  }
})

// Forgot Password - Send OTP
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      })
    }

    // Find user
    const user = await getOne<User>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Store OTP with 10 minute expiry
    otpStore.set(email, {
      otp,
      expires: Date.now() + 10 * 60 * 1000
    })

    // Send OTP email
    try {
      await sendForgotPasswordOTPEmail(email, otp, user.name)
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError)
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.'
      })
    }

    res.json({
      success: true,
      message: 'OTP sent to your email address'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ success: false, message: 'Failed to process request' })
  }
})

// Verify Reset OTP
router.post('/verify-reset-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      })
    }

    const storedData = otpStore.get(email)

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired or not found. Please request a new one.'
      })
    }

    if (Date.now() > storedData.expires) {
      otpStore.delete(email)
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      })
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      })
    }

    res.json({
      success: true,
      message: 'OTP verified successfully'
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    res.status(500).json({ success: false, message: 'Failed to verify OTP' })
  }
})

// Reset Password
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, otp, password } = req.body

    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP and password are required'
      })
    }

    // Verify OTP again
    const storedData = otpStore.get(email)

    if (!storedData || storedData.otp !== otp || Date.now() > storedData.expires) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.'
      })
    }

    // Find user
    const user = await getOne<User>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Update password
    await execute(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE email = ?',
      [hashedPassword, email]
    )

    // Delete OTP
    otpStore.delete(email)

    res.json({
      success: true,
      message: 'Password reset successfully'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ success: false, message: 'Failed to reset password' })
  }
})

// Set password for Google users
router.post('/set-password', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest
    const { password } = req.body
    const userId = authReq.user.id


    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Update user password
    await execute(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, userId]
    )

    res.json({
      success: true,
      message: 'Password set successfully'
    })
  } catch (error) {
    console.error('Set password error:', error)
    res.status(500).json({ success: false, message: 'Failed to set password' })
  }
})

export default router
