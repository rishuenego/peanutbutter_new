import 'dotenv/config'
import { pool } from './src/config/db.js'

async function checkDb() {
  try {
    const [tables] = await pool.query('SHOW TABLES')
    console.log('Tables:', tables)

    const [products] = await pool.query('SELECT COUNT(*) as count FROM products')
    console.log('Products count:', products)

    const [orders] = await pool.query('SELECT COUNT(*) as count FROM orders')
    console.log('Orders count:', orders)

    const [latestOrder] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 1')
    console.log('Latest Order:', latestOrder)

    process.exit(0)
  } catch (error) {
    console.error('DB Check error:', error)
    process.exit(1)
  }
}

checkDb()
