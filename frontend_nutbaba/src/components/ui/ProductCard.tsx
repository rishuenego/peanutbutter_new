import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { Product } from '../../types'

interface ProductCardProps {
  product: Product
  onAddToCart?: () => void
  showAddToCart?: boolean
  showViewDetails?: boolean
}

export default function ProductCard({
  product,
  onAddToCart,
  showAddToCart = false,
  showViewDetails = false,
}: ProductCardProps) {
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-gold text-gold" />
        )
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-gold/50 text-gold" />
        )
      } else {
        stars.push(
          <Star key={i} className="w-4 h-4 text-gray-300" />
        )
      }
    }
    return stars
  }

  return (
    <div className="bg-transparent rounded-none p-0 flex flex-col items-center text-center group">
      {/* Product Image */}
      <Link to={`/product/${product.slug}`} className="block w-full mb-8">
        <div className="relative aspect-square overflow-hidden bg-transparent transform transition-transform duration-500 group-hover:scale-105">
          <img
            src={(Array.isArray(product.images) && product.images[0]) || '/images/products/default.jpg'}
            alt={product.name}
            className="w-full h-full object-contain"
          />
          {product.stockStatus === 'out_of_stock' && (
            <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
              <span className="text-white font-bold bg-gray-800/80 px-6 py-2 rounded-xl font-body text-sm uppercase tracking-widest">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Rating */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="flex gap-0.5">{renderStars(Number(product.rating) || 0)}</div>
        <span className="text-gray-500 text-xs font-body">
          ({Number(product.reviewCount) || 0} Reviews)
        </span>
      </div>

      {/* Product Name */}
      <Link to={`/product/${product.slug}`} className="mb-4">
        <h3 className="text-center font-heading text-xl font-bold text-gray-800 px-4 line-clamp-2 min-h-[3rem] transition-colors hover:text-[#B1561E]">
          {product.name}
        </h3>
      </Link>

      {/* Price */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <span className="text-xl font-bold text-gray-900 font-body">
          RS. {Number(product.salePrice || 0).toFixed(2)}
        </span>
        {Number(product.mrpPrice || 0) > Number(product.salePrice || 0) && (
          <span className="text-gray-400 text-sm line-through font-body opacity-60">
            RS. {Number(product.mrpPrice || 0).toFixed(2)}
          </span>
        )}
      </div>

      {/* Actions */}
      {showViewDetails && (
        <Link
          to={`/product/${product.slug}`}
          className="inline-block w-[60%] min-w-[200px] bg-[#B1561E] hover:bg-[#8B4417] text-white py-4 rounded-2xl font-body font-bold text-lg transition-all shadow-sm hover:shadow-lg text-center"
        >
          View Details
        </Link>
      )}

      {showAddToCart && (
        <button
          onClick={(e) => {
            e.preventDefault()
            onAddToCart?.()
          }}
          disabled={product.stockStatus === 'out_of_stock'}
          className="inline-block w-[60%] min-w-[200px] bg-[#B1561E] hover:bg-[#8B4417] text-white py-4 rounded-2xl font-body font-bold text-lg transition-all shadow-sm hover:shadow-lg text-center disabled:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add to bag
        </button>
      )}
    </div>
  )
}
