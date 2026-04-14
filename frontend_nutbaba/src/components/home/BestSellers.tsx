import { useEffect, useState } from 'react'

import { Product } from '../../types'
import { productApi } from '../../services/api'
import { useCart } from '../../context/CartContext'
import ProductCard from '../ui/ProductCard'

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    const fetchBestsellers = async () => {
      try {
        const response = await productApi.getBestsellers()
        setProducts(response.data.products)
      } catch (error) {
        console.error('Failed to fetch bestsellers:', error)
        // Use mock data if API fails
        setProducts([
          {
            id: 1,
            name: 'Dark Chocolate Crunch',
            slug: 'dark-chocolate-crunch',
            description: '',
            shortDescription: '',
            category: 'Flavored',
            texture: 'crunchy',
            mrpPrice: 499,
            salePrice: 349,
            discountPercentage: 30,
            weightOptions: [
              { size: '350g', mrp: 499, salePrice: 349 },
              { size: '500g', mrp: 699, salePrice: 499 },
              { size: '1kg', mrp: 1299, salePrice: 899 }
            ],
            images: ['/images/products/DarkChocolateCrunch.webp'],
            manufacturer: 'Nut Baba',
            productType: 'Peanut Butter',
            dimensions: '',
            isFeatured: true,
            isBestseller: true,
            stockStatus: 'in_stock',
            stockQuantity: 100,
            rating: 4.5,
            reviewCount: 715,
            createdAt: '',
            updatedAt: '',
          },
          {
            id: 2,
            name: 'White Chocolate',
            slug: 'white-chocolate',
            description: '',
            shortDescription: '',
            category: 'Flavored',
            texture: 'smooth',
            mrpPrice: 449,
            salePrice: 329,
            discountPercentage: 27,
            weightOptions: [
              { size: '350g', mrp: 499, salePrice: 349 },
              { size: '500g', mrp: 699, salePrice: 499 },
              { size: '1kg', mrp: 1299, salePrice: 899 }
            ],
            images: ['/images/products/WhiteChocolate.webp'],
            manufacturer: 'Nut Baba',
            productType: 'Peanut Butter',
            dimensions: '',
            isFeatured: true,
            isBestseller: true,
            stockStatus: 'in_stock',
            stockQuantity: 100,
            rating: 4.5,
            reviewCount: 715,
            createdAt: '',
            updatedAt: '',
          },
          {
            id: 3,
            name: 'High Protein Crunch',
            slug: 'high-protein-crunch',
            description: '',
            shortDescription: '',
            category: 'High Protein',
            texture: 'crunchy',
            mrpPrice: 549,
            salePrice: 399,
            discountPercentage: 27,
            weightOptions: [
              { size: '350g', mrp: 499, salePrice: 349 },
              { size: '500g', mrp: 699, salePrice: 499 },
              { size: '1kg', mrp: 1299, salePrice: 899 }
            ],
            images: ['/images/products/DarkChocolate.webp'],
            manufacturer: 'Nut Baba',
            productType: 'Peanut Butter',
            dimensions: '',
            isFeatured: true,
            isBestseller: true,
            stockStatus: 'in_stock',
            stockQuantity: 100,
            rating: 4.5,
            reviewCount: 715,
            createdAt: '',
            updatedAt: '',
          },
          {
            id: 4,
            name: 'All Natural Smooth',
            slug: 'all-natural-smooth',
            description: '',
            shortDescription: '',
            category: 'Classic',
            texture: 'smooth',
            mrpPrice: 449,
            salePrice: 329,
            discountPercentage: 27,
            weightOptions: [
              { size: '350g', mrp: 499, salePrice: 349 },
              { size: '500g', mrp: 699, salePrice: 499 },
              { size: '1kg', mrp: 1299, salePrice: 899 }
            ],
            images: ['/images/products/SmoothChocolate.webp'],
            manufacturer: 'Nut Baba',
            productType: 'Peanut Butter',
            dimensions: '',
            isFeatured: true,
            isBestseller: true,
            stockStatus: 'in_stock',
            stockQuantity: 100,
            rating: 4.7,
            reviewCount: 892,
            createdAt: '',
            updatedAt: '',
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchBestsellers()
  }, [])

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1, product.weightOptions[0].size, product.texture)
  }

  if (loading) {
    return (
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">Loading bestsellers...</div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 md:py-28 bg-[#fff8ed]">
      <div className="container mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: '#C45C26'
            }}
          >
            Best Sellers
          </h2>
          <p
            className="text-lg md:text-xl font-medium opacity-80"
            style={{
              fontFamily: "'Inter', sans-serif",
              color: '#333333'
            }}
          >
            Loved by thousands of healthy food lovers
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => handleAddToCart(product)}
              showAddToCart
            />
          ))}
        </div>
      </div>
    </section>
  )
}
