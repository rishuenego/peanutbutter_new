import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Product } from '../types'
import { productApi } from '../services/api'
import ProductCard from '../components/ui/ProductCard'

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()

  const categoryFilter = searchParams.get('category')
  const textureFilter = searchParams.get('texture')
  const searchQuery = searchParams.get('search')

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params: { category?: string; texture?: string } = {}
        if (categoryFilter) params.category = categoryFilter
        if (textureFilter) params.texture = textureFilter

        const response = await productApi.getAll(params)
        let filteredProducts = response.data.products

        // Filter by search query if present
        if (searchQuery) {
          filteredProducts = filteredProducts.filter((p: Product) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        }

        setProducts(filteredProducts)
      } catch (error) {
        console.error('Failed to fetch products:', error)
        // Mock data fallback
        setProducts([
          {
            id: 1,
            name: 'High Protein Dark Chocolate Peanut Butter',
            slug: 'high-protein-dark-chocolate-peanut-butter',
            description: '',
            shortDescription: '26g Protein per serving',
            category: 'High Protein',
            texture: 'crunchy',
            mrpPrice: 499,
            salePrice: 349,
            discountPercentage: 30,
            weightOptions: [
              { size: '350g', mrp: 499, salePrice: 349 },
              { size: '500g', mrp: 699, salePrice: 499 },
              { size: '1kg', mrp: 1299, salePrice: 899 }
            ],
            images: ['/images/products/dark-chocolate-1.jpg'],
            manufacturer: 'Nut Baba',
            productType: 'Peanut Butter',
            dimensions: '7 x 7.5 x 12 cm',
            isFeatured: true,
            isBestseller: true,
            stockStatus: 'in_stock',
            stockQuantity: 150,
            rating: 4.5,
            reviewCount: 715,
            createdAt: '',
            updatedAt: '',
          },
          {
            id: 2,
            name: 'High Protein Dark Chocolate Peanut Butter',
            slug: 'high-protein-dark-chocolate-2',
            description: '',
            shortDescription: '26g Protein per serving',
            category: 'High Protein',
            texture: 'crunchy',
            mrpPrice: 499,
            salePrice: 349,
            discountPercentage: 30,
            weightOptions: [
              { size: '350g', mrp: 499, salePrice: 349 },
              { size: '500g', mrp: 699, salePrice: 499 },
              { size: '1kg', mrp: 1299, salePrice: 899 }
            ],
            images: ['/images/products/dark-chocolate-2.jpg'],
            manufacturer: 'Nut Baba',
            productType: 'Peanut Butter',
            dimensions: '7 x 7.5 x 12 cm',
            isFeatured: true,
            isBestseller: true,
            stockStatus: 'in_stock',
            stockQuantity: 150,
            rating: 4.5,
            reviewCount: 715,
            createdAt: '',
            updatedAt: '',
          },
          {
            id: 3,
            name: 'High Protein Dark Chocolate Peanut Butter',
            slug: 'high-protein-dark-chocolate-3',
            description: '',
            shortDescription: '26g Protein per serving',
            category: 'High Protein',
            texture: 'smooth',
            mrpPrice: 499,
            salePrice: 349,
            discountPercentage: 30,
            weightOptions: [
              { size: '350g', mrp: 499, salePrice: 349 },
              { size: '500g', mrp: 699, salePrice: 499 },
              { size: '1kg', mrp: 1299, salePrice: 899 }
            ],
            images: ['/images/products/dark-chocolate-3.jpg'],
            manufacturer: 'Nut Baba',
            productType: 'Peanut Butter',
            dimensions: '7 x 7.5 x 12 cm',
            isFeatured: true,
            isBestseller: true,
            stockStatus: 'in_stock',
            stockQuantity: 150,
            rating: 4.5,
            reviewCount: 715,
            createdAt: '',
            updatedAt: '',
          },
          {
            id: 4,
            name: 'High Protein Dark Chocolate Peanut Butter',
            slug: 'high-protein-dark-chocolate-4',
            description: '',
            shortDescription: '26g Protein per serving',
            category: 'High Protein',
            texture: 'crunchy',
            mrpPrice: 499,
            salePrice: 349,
            discountPercentage: 30,
            weightOptions: [
              { size: '350g', mrp: 499, salePrice: 349 },
              { size: '500g', mrp: 699, salePrice: 499 },
              { size: '1kg', mrp: 1299, salePrice: 899 }
            ],
            images: ['/images/products/dark-chocolate-4.jpg'],
            manufacturer: 'Nut Baba',
            productType: 'Peanut Butter',
            dimensions: '7 x 7.5 x 12 cm',
            isFeatured: true,
            isBestseller: true,
            stockStatus: 'in_stock',
            stockQuantity: 150,
            rating: 4.5,
            reviewCount: 715,
            createdAt: '',
            updatedAt: '',
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [categoryFilter, textureFilter, searchQuery])

  return (
    <div>
      {/* Hero Banner */}
      {/* Custom Shop Hero */}
      <section className="relative w-full h-[250px] md:h-[350px] lg:h-[400px] bg-[#D0E1ED] overflow-hidden flex items-center">
        {/* Background Banner Image - Spans full area to remove gaps */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/BG-1.webp"
            alt="All Products"
            className="w-full h-full object-cover object-center md:object-right"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1Xflij2pySRbqdgxnM65aFk6RgVDry.png'
            }}
          />
        </div>

        {/* Content Overlay */}
        <div className="container relative z-10 mx-auto px-6 md:px-12 lg:px-24">
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-black leading-[0.85] tracking-tight"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: '#813302'
            }}
          >
            ALL<br />
            PRODUCTS
          </h1>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20 bg-[#FDF7EE]">
        <div className="container mx-auto px-4">
          {/* Filters */}
          {(categoryFilter || textureFilter || searchQuery) && (
            <div className="mb-6 flex items-center gap-2 flex-wrap">
              <span className="text-gray-600 font-body">Filters:</span>
              {categoryFilter && (
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-body">
                  Category: {categoryFilter}
                </span>
              )}
              {textureFilter && (
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-body">
                  Texture: {textureFilter}
                </span>
              )}
              {searchQuery && (
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-body">
                  Search: {searchQuery}
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse text-gray-600 font-body">
                Loading products...
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 font-body">No products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-x-12 gap-y-16 max-w-5xl mx-auto">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showViewDetails
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
