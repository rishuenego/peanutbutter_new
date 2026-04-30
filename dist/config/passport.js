import passportGoogle from 'passport-google-oauth20';
const GoogleStrategy = passportGoogle.Strategy;
import { getOne, execute } from './db.js';
export function configurePassport(passport) {
    // Google OAuth Strategy
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
        }, async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user exists
                let user = await getOne('SELECT * FROM users WHERE google_id = ?', [profile.id]);
                if (!user) {
                    // Create new user
                    const result = await execute(`INSERT INTO users (google_id, email, name, created_at, updated_at)
                 VALUES (?, ?, ?, NOW(), NOW())`, [profile.id, profile.emails?.[0]?.value, profile.displayName]);
                    user = await getOne('SELECT * FROM users WHERE id = ?', [
                        result.insertId,
                    ]);
                }
                return done(null, user || false);
            }
            catch (error) {
                return done(error);
            }
        }));
    }
    // Serialize user
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    // Deserialize user
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await getOne('SELECT * FROM users WHERE id = ?', [id]);
            done(null, user || false);
        }
        catch (error) {
            done(error);
        }
    });
}
