import { Link } from 'react-router-dom'

const categories = [
  {
    name: 'Smooth',
    subtitle: 'Peanut Butter',
    image: '/images/Smooth.webp',
    slug: 'smooth',
  },
  {
    name: 'Crunchy',
    subtitle: 'Peanut Butter',
    image: '/images/Crunchy.webp',
    slug: 'crunchy',
  },
  {
    name: 'High Protein',
    subtitle: 'Peanut Butter',
    image: '/images/High Protein.webp',
    slug: 'high-protein',
  },
]

export default function CategorySection() {
  return (
    <section className="py-24 md:py-32 bg-[#fff8ed]">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-24">
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: '#813302'
            }}
          >
            Shop by Category
          </h2>
          <p
            className="text-base md:text-lg lg:text-xl font-medium"
            style={{
              fontFamily: "'Inter', sans-serif",
              color: '#444444'
            }}
          >
            Extra scoops of health, taste, and protein!
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 max-w-[1100px] mx-auto px-4">
          {categories.map((category) => (
            <div key={category.slug} className="flex flex-col items-center group">
              {/* Category Image */}
              <div className="relative overflow-hidden rounded-[15px] mb-5 shadow-sm w-full">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full aspect-[1.12/1] object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Category Info */}
              <div className="text-center mb-5">
                <h3
                  className="text-2xl md:text-3xl font-bold mb-1"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: '#1a1a1a'
                  }}
                >
                  {category.name}
                </h3>
                <p
                  className="text-sm md:text-base font-medium opacity-80"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    color: '#333333'
                  }}
                >
                  {category.subtitle}
                </p>
              </div>

              {/* View Product Button */}
              <Link
                to="/shop"
                className="inline-block w-full max-w-[220px] bg-[#C45C26] text-white py-3 rounded-full text-sm font-bold shadow-md hover:bg-[#813302] transition-all duration-300 hover:scale-[1.03]"
                style={{ 
                  fontFamily: "'Inter', sans-serif",
                  textAlign: 'center'
                }}
              >
                View Product
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
