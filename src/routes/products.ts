import express from 'express'
const { Router } = express
import { getMany, getOne } from '../config/db.js'

const router = Router()

interface ProductRow {
  id: number
  name: string
  slug: string
  description: string
  short_description: string
  category: string
  texture: string
  mrp_price: number
  sale_price: number
  discount_percentage: number
  weight_options: string
  manufacturer: string
  product_type: string
  dimensions: string
  is_featured: number
  is_bestseller: number
  stock_status: string
  stock_quantity: number
  rating: number
  review_count: number
  created_at: Date
  updated_at: Date
}

function safeJsonParse(value: unknown, fallback: unknown[] = []): unknown[] {
  // Return fallback if no value
  if (value === null || value === undefined || value === '') {
    return fallback
  }

  // If it's already an array, return it
  if (Array.isArray(value)) {
    return value
  }

  // If it's a string, try to parse it
  if (typeof value === 'string') {
    const trimmed = value.trim()

    // Check if it looks like JSON array
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed)
        return Array.isArray(parsed) ? parsed : fallback
      } catch {
        // JSON parse failed, continue to other methods
      }
    }

    // Try comma-separated values
    if (trimmed.includes(',')) {
      return trimmed.split(',').map(v => v.trim()).filter(Boolean)
    }

    // Single value
    if (trimmed) {
      return [trimmed]
    }
  }

  return fallback
}

function getProductImage(slug: string): string {
  const mapping: Record<string, string> = {
    'high-protein-dark-chocolate-peanut-butter': 'https://res.cloudinary.com/dpqmfugsd/image/upload/v1775718015/DarkChocolate_vzhvyv.webp',
    'dark-chocolate-smooth-peanut-butter': 'https://res.cloudinary.com/dpqmfugsd/image/upload/v1775718015/DarkChocolate_vzhvyv.webp',
    'all-natural-smooth-peanut-butter': 'https://res.cloudinary.com/dpqmfugsd/image/upload/v1775718015/SmoothChocolate_yfswky.webp',
    'smooth-peanut-butter': 'https://res.cloudinary.com/dpqmfugsd/image/upload/v1775718015/SmoothChocolate_yfswky.webp',
    'white-chocolate-crunch-peanut-butter': 'https://res.cloudinary.com/dpqmfugsd/image/upload/v1775718014/WhiteChocolate_djifxz.webp',
    'white-chocolate-smooth-peanut-butter': 'https://res.cloudinary.com/dpqmfugsd/image/upload/v1775718014/WhiteChocolate_djifxz.webp',
    'dark-chocolate-crunch-peanut-butter': 'https://res.cloudinary.com/dpqmfugsd/image/upload/v1775718015/DarkChocolateCrunch_gfwzll.webp',
  }

  return mapping[slug] || 'https://res.cloudinary.com/dpqmfugsd/image/upload/v1775718015/DarkChocolate_vzhvyv.webp'
}

function formatProduct(row: ProductRow) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    shortDescription: row.short_description,
    category: row.category,
    texture: row.texture,
    mrpPrice: row.mrp_price,
    salePrice: row.sale_price,
    discountPercentage: row.discount_percentage,
    weightOptions: safeJsonParse(row.weight_options, ['500g', '1kg']),
    images: [getProductImage(row.slug)],
    manufacturer: row.manufacturer,
    productType: row.product_type,
    dimensions: row.dimensions,
    isFeatured: Boolean(row.is_featured),
    isBestseller: Boolean(row.is_bestseller),
    stockStatus: row.stock_status,
    stockQuantity: row.stock_quantity,
    rating: row.rating,
    review_count: row.review_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, texture, featured, bestseller } = req.query

    let sql = 'SELECT * FROM products WHERE 1=1'
    const params: unknown[] = []

    if (category) {
      sql += ' AND category = ?'
      params.push(category)
    }
    if (texture) {
      sql += ' AND texture = ?'
      params.push(texture)
    }
    if (featured === 'true') {
      sql += ' AND is_featured = 1'
    }
    if (bestseller === 'true') {
      sql += ' AND is_bestseller = 1'
    }

    sql += ' ORDER BY created_at DESC'

    const products = await getMany<ProductRow>(sql, params)
    res.json({
      success: true,
      products: products.map(formatProduct),
    })
  } catch (error) {
    console.error('Get products error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch products' })
  }
})

// Get featured products
router.get('/featured', async (req, res) => {
  try {
    const products = await getMany<ProductRow>(
      'SELECT * FROM products ORDER BY created_at DESC'
    )
    res.json({
      success: true,
      products: products.map(formatProduct),
    })
  } catch (error) {
    console.error('Get featured products error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch featured products' })
  }
})

// Get bestseller products
router.get('/bestsellers', async (req, res) => {
  try {
    const products = await getMany<ProductRow>(
      'SELECT * FROM products ORDER BY created_at DESC'
    )
    res.json({
      success: true,
      products: products.map(formatProduct),
    })
  } catch (error) {
    console.error('Get bestseller products error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch bestseller products' })
  }
})

// Get product by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params
    const product = await getOne<ProductRow>(
      'SELECT * FROM products WHERE slug = ?',
      [slug]
    )

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    res.json({
      success: true,
      product: formatProduct(product),
    })
  } catch (error) {
    console.error('Get product error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch product' })
  }
})

export default router
