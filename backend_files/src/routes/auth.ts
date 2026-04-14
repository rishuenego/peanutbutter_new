import { Router, Request, Response } from 'express'
import passport from 'passport'
import bcrypt from 'bcryptjs'
import { AuthenticatedRequest, isAuthenticated } from '../middleware/auth.js'
import { getOne, execute } from '../config/db.js'

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
    const { name, lastName, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
      })
    }

    // Check if user already exists
    const existingUser = await getOne<User>(
      'SELECT * FROM users WHERE email = ?',
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
      `INSERT INTO users (email, name, password, created_at, updated_at)
       VALUES (?, ?, ?, NOW(), NOW())`,
      [email, fullName, hashedPassword]
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
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      })
    }

    // Find user
    const user = await getOne<User>(
      'SELECT * FROM users WHERE email = ?',
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
router.get('/me', (req: AuthenticatedRequest, res) => {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
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
router.put('/profile', isAuthenticated, async (req: AuthenticatedRequest, res) => {
  const { phone, address, city, state, pincode } = req.body
  const userId = req.user?.id

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

export default router
