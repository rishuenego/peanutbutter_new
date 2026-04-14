import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import { productApi } from '../services/api';
import { Product } from '../types';

const WhyNutBaba = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productApi.getAll();
        if (response.data.success) {
          // Show all products returned by the API
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const benefits = [
    {
      title: 'Pure & Natural',
      description: 'Made with premium peanuts, completely free from preservatives or artificial flavors.',
    },
    {
      title: 'Energy Boost',
      description: 'High in protein & healthy fats — perfect for gym-goers and active lifestyles.',
    },
    {
      title: 'Nutritional Excellence',
      description: 'Rich in minerals, vitamins, and antioxidants. Lab-tested for quality.',
    },
    {
      title: 'Unmatched Taste',
      description: 'Smooth, creamy texture with authentic peanut richness — no artificial aftertaste.',
    },
    {
      title: 'Quality Assured',
      description: 'Certified organic & packed under strict safety standards.',
    },
    {
      title: 'Versatile Usage',
      description: 'Use in smoothies, toast, desserts, or eat straight from the jar!',
    },
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-orange-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-0 mt-0 bg-[#FDF7EE]">
      {/* Hero Banner - Full bleed, no rounding, no top margin */}
      <div className="w-full overflow-hidden p-0 m-0">
        <img
          src="/images/Why NutBaba.webp"
          alt="Why NutBaba"
          className="w-full h-auto block p-0 m-0 shadow-none"
        />
      </div>

      {/* Why Choose NutBaba Section */}
      <div className="bg-[#FDF7EE] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-12 items-center justify-center mb-20">
            {/* Left - Image (Matched to text height) */}
            <div className="h-full px-4 text-center">
              <img
                src="/images/Why Choose NutBaba.webp"
                alt="Why Choose NutBaba"
                className="w-[400px] h-[400px] mx-auto object-cover rounded-none"
              />
            </div>

            {/* Right - Content */}
            <div className="flex flex-col justify-center px-4">
              <div className="max-w-[420px]">
                <h2 className="font-heading text-3xl md:text-4xl text-[#B1561E] mb-8 leading-tight">
                  Why Choose NutBaba?
                </h2>
                <div className="space-y-6 text-gray-700 text-sm md:text-base leading-relaxed">
                  <p>
                    At Nuttira, every jar starts with <strong>handpicked premium peanuts</strong>,
                    ensuring the richest flavor and the highest quality standards.
                  </p>
                  <p>
                    Our peanut butter contains <strong>zero artificial preservatives, colors, or flavors</strong> —
                    only natural, wholesome goodness.
                  </p>
                  <p>
                    We are committed to <strong>sustainable sourcing</strong>, supporting farmers,
                    and producing healthier choices for you and the planet.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pb-10">
            <h3 className="font-heading text-3xl md:text-5xl text-[#B1561E] text-center mb-16">
              Key Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-5 shadow-sm flex items-center gap-4 min-h-[140px]"
                >
                  {/* Large Icon Circle */}
                  <div className="w-24 h-24 bg-[#FDE5C6] rounded-full flex items-center justify-center flex-shrink-0">
                    <img
                      src="/images/icon.webp"
                      alt=""
                      className="w-12 h-12"
                    />
                  </div>
                  {/* Text Content */}
                  <div className="flex flex-col justify-center">
                    <h4 className="font-heading text-sm font-semibold text-[#B1561E] mb-1">
                      {benefit.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 leading-normal">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Best Products Section */}
      <div className="bg-[#FDF7EE] py-20 border-t border-orange-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative flex flex-col items-center justify-center text-center mb-16">
            <h2 className="font-heading text-3xl md:text-5xl text-[#B1561E] mb-3">
              The Best Peanut Butter Ever.
            </h2>
            <p className="text-gray-700 text-base md:text-lg">
              Extra scoops of health, taste, and protein!
            </p>
            <Link
              to="/shop"
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#B1561E] hover:bg-[#8B4417] text-white px-10 py-3 rounded-2xl font-body font-semibold text-lg transition-all hidden lg:block"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
            {loading ? (
              <div className="col-span-full py-20 text-center text-gray-500">Loading products...</div>
            ) : products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="flex flex-col items-center text-center group">
                  {/* Product Image Wrapper */}
                  <div className="w-full aspect-square bg-transparent mb-6 transition-transform group-hover:scale-105 duration-300 flex items-center justify-center">
                    <img
                      src={(product.images && product.images[0]) || '/images/products/default.jpg'}
                      alt={product.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="flex gap-0.5">
                      {renderStars(Number(product.rating))}
                    </div>
                    <span className="text-gray-500 text-xs font-body">
                      ({product.reviewCount || 0} Reviews)
                    </span>
                  </div>

                  {/* Product Name */}
                  <h3 className="font-heading text-sm font-bold text-gray-800 mb-3 px-2 line-clamp-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <span className="font-body text-lg font-bold text-brown-900">
                      RS. {Number(product.salePrice).toFixed(2)}
                    </span>
                    {Number(product.mrpPrice) > Number(product.salePrice) && (
                      <span className="text-gray-400 font-body text-xs line-through">
                        RS. {Number(product.mrpPrice).toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => addToCart(product, 1, '500g', 'Smooth')}
                    className="w-full bg-[#B1561E] hover:bg-[#8B4417] text-white py-3 rounded-2xl font-body font-semibold text-lg transition-all shadow-sm"
                  >
                    Add to Cart
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-gray-500">No products found.</div>
            )}
          </div>
          
          {/* Mobile View All Button */}
          <div className="mt-12 text-center lg:hidden">
            <Link
              to="/shop"
              className="bg-[#B1561E] hover:bg-[#8B4417] text-white px-10 py-3 rounded-2xl font-body font-semibold text-lg transition-all"
            >
              View all
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyNutBaba;
