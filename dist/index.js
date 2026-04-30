import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { configurePassport } from './config/passport.js';
import { pool } from './config/db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import couponRoutes from './routes/coupons.js';
import contactRoutes from './routes/contact.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payments.js';
import settingsRoutes from './routes/settings.js';
import { errorHandler } from './middleware/errorHandler.js';
const app = express();
const PORT = process.env.PORT || 3001;
// Middleware
const isProduction = process.env.NODE_ENV === 'production';
// Allowed origins for CORS
const allowedOrigins = [
    'https://nutbaba.in',
    'https://www.nutbaba.in',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
];
// Add custom FRONTEND_URL if provided
if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'nutbaba-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    proxy: isProduction, // Trust the reverse proxy
    cookie: {
        secure: isProduction, // True for production with HTTPS
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-domain cookies in production
    },
}));
// Passport initialization
configurePassport(passport);
app.use(passport.initialize());
app.use(passport.session());
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/settings', settingsRoutes);
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Nut Baba API is running' });
});
// Error handler
app.use(errorHandler);
// Start server
const startServer = async () => {
    try {
        // Test database connection
        await pool.query('SELECT 1');
        console.log('Database connected successfully');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
// import 'dotenv/config'
// import express from 'express'
// import cors from 'cors'
// import session from 'express-session'
// import MySQLStoreFactory from 'express-mysql-session'
// import passport from 'passport'
// import { configurePassport } from './config/passport.js'
// import { pool } from './config/db.js'
// import authRoutes from './routes/auth.js'
// import productRoutes from './routes/products.js'
// import orderRoutes from './routes/orders.js'
// import couponRoutes from './routes/coupons.js'
// import contactRoutes from './routes/contact.js'
// import adminRoutes from './routes/admin.js'
// import paymentRoutes from './routes/payments.js'
// import settingsRoutes from './routes/settings.js'
// import { errorHandler } from './middleware/errorHandler.js'
// const app = express()
// const PORT = process.env.PORT || 3001
// // ✅ Validate ENV early (THIS PREVENTS YOUR ERROR)
// if (!process.env.DB_HOST) {
//   console.error('❌ DB_HOST is missing in .env')
//   process.exit(1)
// }
// console.log('🔍 Using DB Host:', process.env.DB_HOST)
// // Middleware
// const isProduction = process.env.NODE_ENV === 'production'
// const allowedOrigins = [
//   'https://nutbaba.in',
//   'https://www.nutbaba.in',
//   'http://localhost:5173',
//   'http://localhost:3000',
//   'http://127.0.0.1:5173',
//   'http://127.0.0.1:3000',
// ]
// if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
//   allowedOrigins.push(process.env.FRONTEND_URL)
// }
// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true)
//     if (allowedOrigins.includes(origin)) {
//       callback(null, true)
//     } else {
//       console.log('❌ CORS blocked:', origin)
//       callback(new Error('Not allowed by CORS'))
//     }
//   },
//   credentials: true,
// }))
// app.use(express.json())
// app.use(express.urlencoded({ extended: true }))
// // ✅ SAFE SESSION STORE (won’t crash app if DB fails)
// const MySQLStore = MySQLStoreFactory(session)
// let sessionStore: any = null
// try {
//   sessionStore = new MySQLStore({}, pool)
//   console.log('✅ Session store initialized')
// } catch (err) {
//   console.error('❌ Session store failed:', err)
// }
// // Session middleware
// app.use(session({
//   secret: process.env.SESSION_SECRET || 'dev-secret',
//   store: sessionStore || undefined, // fallback
//   resave: false,
//   saveUninitialized: false,
//   proxy: isProduction,
//   cookie: {
//     secure: isProduction,
//     httpOnly: true,
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//     sameSite: isProduction ? 'none' : 'lax',
//   },
// }))
// // Passport
// configurePassport(passport)
// app.use(passport.initialize())
// app.use(passport.session())
// // Routes
// app.use('/api/auth', authRoutes)
// app.use('/api/products', productRoutes)
// app.use('/api/orders', orderRoutes)
// app.use('/api/coupons', couponRoutes)
// app.use('/api/contact', contactRoutes)
// app.use('/api/admin', adminRoutes)
// app.use('/api/payments', paymentRoutes)
// app.use('/api/settings', settingsRoutes)
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'ok' })
// })
// app.use(errorHandler)
// // ✅ START SERVER (with better debugging)
// const startServer = async () => {
//   try {
//     console.log('🔄 Connecting to database...')
//     await pool.query('SELECT 1')
//     console.log('✅ Database connected')
//     app.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`)
//     })
//   } catch (error: any) {
//     console.error('❌ Database connection failed')
//     console.error('👉 Error code:', error.code)
//     console.error('👉 Message:', error.message)
//     // 🔥 THIS LINE TELLS YOU EXACT ISSUE
//     if (error.code === 'ENOTFOUND') {
//       console.error('👉 Fix: Your DB_HOST is WRONG (DNS not found)')
//     }
//     process.exit(1)
//   }
// }
// startServer()
