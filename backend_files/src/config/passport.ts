import { PassportStatic } from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { getOne, execute } from './db.js'

interface User {
  id: number
  google_id: string
  email: string
  name: string
  phone?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  created_at: Date
  updated_at: Date
}

export function configurePassport(passport: PassportStatic) {
  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user exists
            let user = await getOne<User>(
              'SELECT * FROM users WHERE google_id = ?',
              [profile.id]
            )

            if (!user) {
              // Create new user
              const result = await execute(
                `INSERT INTO users (google_id, email, name, created_at, updated_at)
                 VALUES (?, ?, ?, NOW(), NOW())`,
                [profile.id, profile.emails?.[0]?.value, profile.displayName]
              )

              user = await getOne<User>('SELECT * FROM users WHERE id = ?', [
                result.insertId,
              ])
            }

            return done(null, user)
          } catch (error) {
            return done(error as Error)
          }
        }
      )
    )
  }

  // Serialize user
  passport.serializeUser((user: Express.User, done) => {
    done(null, (user as User).id)
  })

  // Deserialize user
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await getOne<User>('SELECT * FROM users WHERE id = ?', [id])
      done(null, user)
    } catch (error) {
      done(error)
    }
  })
}
