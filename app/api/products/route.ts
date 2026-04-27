import { NextRequest, NextResponse } from 'next/server'
import { getMany } from '@/lib/db'
import { safeJsonParse } from '@/lib/utils'

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
    reviewCount: row.review_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const texture = searchParams.get('texture')
    const featured = searchParams.get('featured')
    const bestseller = searchParams.get('bestseller')

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
    return NextResponse.json({
      success: true,
      products: products.map(formatProduct),
    })
  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
