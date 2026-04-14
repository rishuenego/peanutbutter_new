import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, Minus, Plus, ChevronDown } from 'lucide-react'
import { Product } from '../types'
import { productApi } from '../services/api'
import { useCart } from '../context/CartContext'

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedWeight, setSelectedWeight] = useState('')
  const [currentPrices, setCurrentPrices] = useState({ mrp: 0, sale: 0 })
  const [selectedTexture, setSelectedTexture] = useState<'smooth' | 'crunchy'>('smooth')
  const [quantity, setQuantity] = useState(1)
  const [isWeightOpen, setIsWeightOpen] = useState(false)
  const { addToCart } = useCart()

  const staticImages = [
    '/images/High Protein Dark Chocolate Peanut Butter- 3.webp',
    '/images/High Protein Dark Chocolate Peanut Butter- 4.webp',
    '/images/High Protein Dark Chocolate Peanut Butter- 5.webp'
  ]

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return
      setLoading(true)
      try {
        const response = await productApi.getBySlug(slug)
        const productData = response.data.product

        // Handle images (Cloudinary mapping + static placeholders)
        const firstImage = productData.images?.[0] || '/images/products/default.jpg'
        const mergedImages = [firstImage, ...staticImages]

        setProduct({ ...productData, images: mergedImages })

        // Initial pricing setup
        if (productData.weightOptions && productData.weightOptions.length > 0) {
          const firstOption = productData.weightOptions[0]
          setSelectedWeight(firstOption.size || '500g')
          setCurrentPrices({
            mrp: firstOption.mrp || productData.mrpPrice,
            sale: firstOption.salePrice || productData.salePrice
          })
        } else {
          setSelectedWeight('500g')
          setCurrentPrices({ mrp: productData.mrpPrice, sale: productData.salePrice })
        }

        setSelectedTexture(productData.texture || 'smooth')

        // Related products
        const relResponse = await productApi.getBestsellers()
        if (relResponse.data.success) {
          setRelatedProducts(relResponse.data.products.slice(0, 4))
        }
      } catch (error) {
        console.error('Failed to fetch product:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [slug])

  // Update prices when weight changes
  useEffect(() => {
    if (product && product.weightOptions) {
      const option = (product.weightOptions as any[]).find(opt => opt.size === selectedWeight)
      if (option) {
        setCurrentPrices({ mrp: option.mrp, sale: option.salePrice })
      }
    }
  }, [selectedWeight, product])

  const handleAddToCart = () => {
    if (!product) return
    addToCart(product, quantity, selectedWeight, selectedTexture)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    window.location.href = '/checkout'
  }

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`w-3.5 h-3.5 ${star <= rating ? 'text-[#E8941F]' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
      ))}
    </div>
  )

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF7EE]">
      <div className="animate-spin w-6 h-6 border-2 border-[#B1561E] border-t-transparent rounded-full"></div>
    </div>
  )

  if (!product) return null

  const discountPerc = currentPrices.mrp > 0 ? Math.round(((currentPrices.mrp - currentPrices.sale) / currentPrices.mrp) * 100) : 0

  return (
    <div className="min-h-screen bg-[#FDF7EE] pt-8 pb-24">
      <div className="max-w-[1240px] mx-auto px-4 lg:px-8">
        {/* TOP SECTION */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-stretch justify-center mb-12">
          {/* Images Gallery */}
          <div className="w-full lg:w-[45%] flex gap-6 lg:gap-8 justify-center lg:justify-start items-center">
            <div className="flex flex-col gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-[72px] h-[72px] rounded-2xl overflow-hidden border-2 transition-all bg-[#FDF7EE] flex-shrink-0 p-1 flex items-center justify-center
                    ${selectedImage === idx ? 'border-[#C45C26] shadow-md bg-white' : 'border-[#d2c4b1] hover:border-[#C45C26]/50'}
                  `}
                >
                  <img src={img} alt="" className="w-full h-full object-contain rounded-xl" />
                </button>
              ))}
            </div>
            <div className="flex-1 max-w-[400px] flex items-center justify-center relative">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="max-w-full max-h-[440px] object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.25)]"
              />
            </div>
          </div>

          {/* Product Actions & Info */}
          <div className="w-full lg:w-[46%] flex">
            <div className="bg-white rounded-[24px] p-6 lg:p-8 shadow-sm border border-[#E8DCC8] flex-1 flex flex-col justify-start">
              <h1
                className="text-2xl lg:text-3xl font-bold text-[#C45C26] mb-2 leading-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-[16px] h-[16px] ${star <= product.rating ? 'fill-[#F5A623] text-[#F5A623]' : 'fill-[#E5E7EB] text-[#E5E7EB]'}`}
                    />
                  ))}
                </div>
                <span className="text-gray-900 text-[13px] font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>
                  ({product.reviewCount} Reviews)
                </span>
              </div>

              <div className="flex items-center gap-3 mb-1">
                <span className="text-[26px] font-black text-gray-900 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                  RS. {Number(currentPrices.sale || 0).toFixed(2)}
                </span>
                <span className="text-gray-500 line-through text-[13px] font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                  RS. {Number(currentPrices.mrp || 0).toFixed(2)}
                </span>
                <span className="text-[#C45C26] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#C45C26]/20 bg-white ml-1">
                  Save {discountPerc}%
                </span>
              </div>
              <p className="text-gray-600 text-[12px] mb-5" style={{ fontFamily: "'Inter', sans-serif" }}>Tax Included.</p>

              <div className="mb-5 relative w-[160px]">
                <button
                  onClick={() => setIsWeightOpen(!isWeightOpen)}
                  className="w-full flex items-center justify-between bg-[#C45C26] text-white px-4 py-2 rounded-full text-[13px] font-bold shadow-sm"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <span>Butter Size</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isWeightOpen ? 'rotate-180' : ''}`} />
                </button>
                {isWeightOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    {(product.weightOptions as any[]).map((opt) => (
                      <button
                        key={opt.size}
                        onClick={() => { setSelectedWeight(opt.size); setIsWeightOpen(false); }}
                        className={`w-full text-left px-5 py-3 hover:bg-[#FDF7EE] text-[13px] font-medium border-b border-gray-50 last:border-none ${selectedWeight === opt.size ? 'text-[#C45C26] font-bold bg-[#FDF7EE]' : 'text-gray-700'}`}
                      >
                        {opt.size}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-5">
                <p className="text-gray-900 font-bold text-[13px] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Texture</p>
                <div className="flex gap-2">
                  {(['smooth', 'crunchy'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTexture(t)}
                      className={`px-6 py-2 rounded-full font-bold text-[13px] transition-all capitalize ${selectedTexture === t
                        ? 'bg-[#C45C26] text-white border border-[#C45C26]'
                        : 'bg-white text-[#C45C26] border border-[#C45C26] hover:bg-orange-50'
                        }`}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-900 font-bold text-[13px] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Quantity</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors bg-white"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="w-[70px] h-[36px] bg-[#C45C26] rounded-full flex items-center justify-center text-white font-bold text-[14px] shadow-sm">
                    {quantity}
                  </div>

                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-700 transition-colors bg-white font-light text-xl leading-none"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full max-w-[340px] mt-auto">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 border border-[#C45C26] text-[#C45C26] bg-white py-2.5 rounded-full font-bold text-[14px] hover:bg-orange-50 transition-colors"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Add to cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-[#C45C26] text-white py-2.5 rounded-full font-bold text-[14px] shadow-md hover:scale-[1.02] active:scale-95 transition-all"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION - 2x2 Alignment Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">

          {/* Description Block (Left Column) */}
          <div className="bg-white rounded-[24px] p-6 lg:p-10 shadow-sm border border-[#E8DCC8]">
            <h2
              className="text-2xl lg:text-3xl font-bold text-[#C45C26] mb-8"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Description
            </h2>
            <div
              className="text-gray-900 text-[14px] leading-[1.8] whitespace-pre-line"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {product.description || `Nuttira High Protein Peanut Butter Spread (Dark Chocolate Blend)\n\nHigh Protein – Supports muscle recovery and active lifestyles\nCrunchy Texture – Rich and satisfying consistency\nEnergy Boosting – Ideal for daily nutrition\nDark Chocolate Blend – Perfect balance of taste and indulgence\nVersatile Usage – Suitable for meals, snacks, and recipes\n\n**Product Details**\n\nBrand: Nuttira\nForm: Paste / Crunchy Spread\nSpecialty: High Protein, Crunchy Texture, Energy Boosting\nPackaging: Plastic Jar with Screw Cap\nCountry of Origin: India\n\n**Manufacturer Details**\nPumpit Health Foods\n3 Near Police Line Tekri\nUdaipur, Rajasthan – 313001 India`}
            </div>
          </div>

          {/* Right Column Stack (Additional Info + Dimensions) */}
          <div className="flex flex-col gap-6 lg:gap-8 w-full">

            <div className="bg-white rounded-[24px] p-6 lg:p-10 shadow-sm border border-[#E8DCC8]">
              <h3
                className="text-2xl lg:text-3xl font-bold text-[#C45C26] mb-8"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Additional Information
              </h3>
              <div className="space-y-6 text-[14px]">
                <div className="flex justify-between items-center border-b border-[#FDF7EE] pb-4">
                  <span className="font-bold text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>Manufacturer</span>
                  <span className="text-gray-700" style={{ fontFamily: "'Inter', sans-serif" }}>Nutbaba</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#FDF7EE] pb-4">
                  <span className="font-bold text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>Category</span>
                  <span className="text-gray-700" style={{ fontFamily: "'Inter', sans-serif" }}>{product.category}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#FDF7EE] pb-4">
                  <span className="font-bold text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>Product Type</span>
                  <span className="text-gray-700" style={{ fontFamily: "'Inter', sans-serif" }}>Peanut Butter</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>Available Textures</span>
                  <span className="text-gray-700 capitalize" style={{ fontFamily: "'Inter', sans-serif" }}>{(product.texture || 'Smooth, Crunchy').toString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[24px] p-6 lg:p-10 shadow-sm border border-[#E8DCC8]">
              <h3
                className="text-2xl lg:text-3xl font-bold text-[#C45C26] mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Dimensions and Weight
              </h3>
              <div className="text-[14px] text-gray-800 space-y-2.5 leading-relaxed flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
                <span>
                  <strong>Item Weight:</strong> {product.weightOptions && Array.isArray(product.weightOptions) ? product.weightOptions.map((o: any) => o.size || o).join(', ') : '350g, 500g, 1kg'}
                </span>
                <span>
                  <strong>Product Dimensions:</strong> {product.dimensions || '7 × 7.5 × 12 cm'}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* CUSTOMERS ALSO VIEWED */}

        <div className="mt-20">
          <h2 className="text-3xl font-heading font-bold text-[#5C3317] mb-10">Customers Also Viewed</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {relatedProducts.map((p) => (
              <div key={p.id} className="flex flex-col items-center text-center group">
                <Link to={`/product/${p.slug}`} className="block w-full mb-6">
                  <div className="aspect-square overflow-hidden transform transition-transform duration-500 group-hover:scale-105">
                    <img src={(p.images && p.images[0]) || '/images/products/default.jpg'} alt={p.name} className="w-full h-full object-contain" />
                  </div>
                </Link>
                <div className="flex items-center justify-center gap-1.5 mb-3">
                  {renderStars(p.rating)}
                  <span className="text-gray-400 text-[10px] font-body">({p.reviewCount} Reviews)</span>
                </div>
                <Link to={`/product/${p.slug}`} className="mb-3">
                  <h3 className="font-body text-sm font-bold text-gray-800 line-clamp-2 min-h-[2.5rem] hover:text-[#CE6A24] transition-colors px-2">{p.name}</h3>
                </Link>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="font-body text-base font-black text-gray-900">RS. {Number(p.salePrice).toFixed(2)}</span>
                  <span className="text-gray-400 text-[10px] line-through font-body">RS. {Number(p.mrpPrice).toFixed(2)}</span>
                </div>
                <button
                  onClick={() => {
                    const firstOpt = p.weightOptions?.[0];
                    const size = typeof firstOpt === 'object' ? firstOpt.size : (firstOpt || '500g');
                    addToCart(p, 1, size, p.texture);
                  }}
                  className="w-[160px] bg-[#2A1810] hover:bg-[#1A0F0A] text-white py-2.5 rounded-full font-body font-bold text-sm transition-all shadow-md active:scale-95"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail;
