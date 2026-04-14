import { Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const reviews = [
  {
    id: 1,
    name: 'Amit Sharma',
    location: 'Delhi',
    rating: 5,
    comment: '"I Recently Tried Nut Baba Peanut Butter And Honestly, It Exceeded My Expectations. The Taste Is Super Rich And Natural, Just Like Homemade"',
    isVerified: true,
    avatar: '/images/avatars/user1.jpg',
  },
  {
    id: 2,
    name: 'Amit Sharma',
    location: 'Delhi',
    rating: 5,
    comment: '"I Recently Tried Nut Baba Peanut Butter And Honestly, It Exceeded My Expectations. The Taste Is Super Rich And Natural, Just Like Homemade"',
    isVerified: true,
    avatar: '/images/avatars/user1.jpg',
  },
  {
    id: 3,
    name: 'Amit Sharma',
    location: 'Delhi',
    rating: 5,
    comment: '"I Recently Tried Nut Baba Peanut Butter And Honestly, It Exceeded My Expectations. The Taste Is Super Rich And Natural, Just Like Homemade"',
    isVerified: true,
    avatar: '/images/avatars/user1.jpg',
  },
]

// Duplicate reviews for seamless infinite loop
const duplicatedReviews = [...reviews, ...reviews, ...reviews, ...reviews];

export default function CustomerReviews() {
  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? 'fill-[#F5A623] text-[#F5A623]' : 'text-gray-300'
            }`}
        />
      ))
  }

  return (
    <section className="py-16 md:py-24 bg-[#fff8ed] overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-20">
          {/* Left Side - Header */}
          <div className="flex-shrink-0 w-full lg:w-[300px] flex flex-col items-center lg:items-start text-center lg:text-left">
            <h2
              className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: '#813302'
              }}
            >
              What Our<br />
              <span style={{ color: '#1B0B00' }}>Customer Say</span>
            </h2>

            {/* Rating Summary */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl md:text-4xl font-bold" style={{ color: '#813302', fontFamily: "'Inter', sans-serif" }}>
                4.9/5
              </span>
              <div className="flex gap-0.5">
                {renderStars(5)}
              </div>
            </div>

            {/* Read All Reviews Button */}
            <Link to="/reviews" className="w-full sm:w-auto">
              <button
                className="bg-[#C45C26] text-white px-8 py-3.5 rounded-full text-sm font-bold shadow-md hover:bg-[#813302] transition-all duration-300 hover:scale-105 active:scale-95"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Read All Reviews
              </button>
            </Link>
          </div>

          {/* Right Side - Scrolling Testimonials */}
          <div className="flex-1 w-full overflow-hidden">
            <motion.div
              className={reviews.length > 0 ? "flex gap-6" : "hidden"}
              animate={{
                x: [0, -(320 + 24) * reviews.length], // Card width (320) + gap (24)
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 30,
                  ease: "linear",
                },
              }}
            >
              {duplicatedReviews.map((review, index) => (
                <div
                  key={`${review.id}-${index}`}
                  className="flex-shrink-0 w-[280px] md:w-[320px]"
                >
                  <div className="bg-white rounded-2xl p-6 h-full shadow-sm border border-[#E8DCC8]/50 flex flex-col">
                    {/* Quote */}
                    <p
                      className="text-[#1B0B00] text-sm leading-relaxed mb-6 italic font-medium opacity-90"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {review.comment}
                    </p>

                    {/* Customer Info */}
                    <div className="flex items-center gap-3 mt-auto">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 border border-[#E8DCC8]">
                        <img
                          src={review.avatar}
                          alt={review.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=813302&color=fff`;
                          }}
                        />
                      </div>
                      <div className="text-left">
                        <p
                          className="font-bold text-[#813302] text-sm"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          {review.name}
                        </p>
                        <p
                          className="text-[#1B0B00]/60 text-xs"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          {review.location} - Verified Buyer
                        </p>
                      </div>
                    </div>

                    {/* Star Rating */}
                    <div className="flex gap-0.5 mt-4">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
