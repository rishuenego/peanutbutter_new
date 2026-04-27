import { NextRequest, NextResponse } from 'next/server'
import { getMany, execute } from '@/lib/db'
import { cookies } from 'next/headers'
import { safeJsonParse } from '@/lib/utils'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')

    if (!adminSession) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 401 }
      )
    }

    const products = await getMany<{
      id: number
      name: string
      slug: string
      description: string
      category: string
      texture: string
      mrp_price: number
      sale_price: number
      weight_options: string
      manufacturer: string
      product_type: string
      dimensions: string
      is_featured: number
      is_bestseller: number
      stock_status: string
      stock_quantity: number
      images: string
    }>('SELECT * FROM products ORDER BY created_at DESC')

    return NextResponse.json({
      success: true,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        category: p.category,
        texture: safeJsonParse(p.texture, []),
        mrpPrice: p.mrp_price,
        salePrice: p.sale_price,
        weightOptions: safeJsonParse(p.weight_options, []),
        manufacturer: p.manufacturer,
        productType: p.product_type,
        dimensions: p.dimensions,
        isFeatured: Boolean(p.is_featured),
        isBestseller: Boolean(p.is_bestseller),
        stockStatus: p.stock_status,
        stockQuantity: p.stock_quantity,
        images: safeJsonParse(p.images, []),
      })),
    })
  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')

    if (!adminSession) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 401 }
      )
    }

    const {
      name, slug, description, shortDescription, category, texture,
      mrpPrice, salePrice, weightOptions, manufacturer, productType,
      dimensions, isFeatured, isBestseller, stockQuantity,
    } = await request.json()
    
    const nmrpPrice = Number(mrpPrice) || 0
    const nsalePrice = Number(salePrice) || 0
    const nstockQuantity = Number(stockQuantity) || 0
    const discountPercentage = nmrpPrice > 0 ? Math.round(((nmrpPrice - nsalePrice) / nmrpPrice) * 100) : 0

    const result = await execute(
      `INSERT INTO products (
        name, slug, description, short_description, category, texture,
        mrp_price, sale_price, discount_percentage, weight_options,
        manufacturer, product_type, dimensions, is_featured, is_bestseller,
        stock_status, stock_quantity, rating, review_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 4.5, 0, NOW(), NOW())`,
      [
        name, slug, description, shortDescription, category, JSON.stringify(texture || []),
        nmrpPrice, nsalePrice, discountPercentage, JSON.stringify(weightOptions || []),
        manufacturer, productType, dimensions, isFeatured ? 1 : 0, isBestseller ? 1 : 0,
        nstockQuantity > 0 ? 'in_stock' : 'out_of_stock', nstockQuantity,
      ]
    )

    return NextResponse.json({ success: true, productId: result.insertId })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create product' },
      { status: 500 }
    )
  }
}
