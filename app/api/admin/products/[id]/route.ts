import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { cookies } from 'next/headers'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')

    if (!adminSession) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 401 }
      )
    }

    const { id } = await params
    const {
      name, slug, description, shortDescription, category, texture,
      mrpPrice, salePrice, weightOptions, manufacturer, productType,
      dimensions, isFeatured, isBestseller, stockStatus, stockQuantity,
    } = await request.json()

    const nmrpPrice = Number(mrpPrice) || 0
    const nsalePrice = Number(salePrice) || 0
    const nstockQuantity = Number(stockQuantity) || 0
    const discountPercentage = nmrpPrice > 0 ? Math.round(((nmrpPrice - nsalePrice) / nmrpPrice) * 100) : 0

    await execute(
      `UPDATE products SET
        name = ?, slug = ?, description = ?, short_description = ?, category = ?,
        texture = ?, mrp_price = ?, sale_price = ?, discount_percentage = ?,
        weight_options = ?, manufacturer = ?, product_type = ?,
        dimensions = ?, is_featured = ?, is_bestseller = ?, stock_status = ?,
        stock_quantity = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        name, slug, description, shortDescription, category, JSON.stringify(texture || []),
        nmrpPrice, nsalePrice, discountPercentage, JSON.stringify(weightOptions || []),
        manufacturer, productType, dimensions, isFeatured ? 1 : 0, isBestseller ? 1 : 0,
        stockStatus, nstockQuantity, id,
      ]
    )

    return NextResponse.json({ success: true, message: 'Product updated successfully' })
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')

    if (!adminSession) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 401 }
      )
    }

    const { id } = await params
    await execute('DELETE FROM products WHERE id = ?', [id])
    
    return NextResponse.json({ success: true, message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
